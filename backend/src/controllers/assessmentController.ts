import { type Request, type Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { sendResponse } from '../utils/responseHelper.js';
import { type AuthRequest } from '../middleware/authMiddleware.js';
import { ScoringEngine, type UserAnswer } from '../services/ScoringEngine.js';

const prisma = new PrismaClient();
const scoringEngine = new ScoringEngine();

// Create a new assessment
export const createAssessment = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as AuthRequest).user?.userId;
    const { model_id, storage_gb, answers } = req.body;

    if (!userId) {
      sendResponse(res, 401, null, 'User not authenticated');
      return;
    }

    if (!model_id || !answers || !Array.isArray(answers)) {
      sendResponse(res, 400, null, 'Invalid input data. Required: model_id, answers[]');
      return;
    }

    // Validate answer structure
    const userAnswers: UserAnswer[] = answers.map((a: any) => ({
      conditionId: Number(a.condition_id),
      answerOptionId: Number(a.answer_option_id),
    }));

    // 1. Calculate scores using the ScoringEngine
    const result = await scoringEngine.processAssessment({
      modelId: Number(model_id),
      answers: userAnswers,
    });

    // 2. Persist everything in a transaction
    const assessment = await prisma.$transaction(async (tx) => {
      // Create the Assessment record
      const newAssessment = await tx.assessment.create({
        data: {
          user_id: userId,
          model_id: Number(model_id),
          storage_gb: Number(storage_gb) || 0,
          status: 'completed',
        },
      });

      // Build a lookup from conditionId → detail for quick access
      const allDetails = [...result.physicalResult.details, ...result.functionalResult.details];
      const detailMap = new Map(allDetails.map((d) => [d.conditionId, d]));

      // Create AssessmentCondition rows with real scores
      for (const answer of userAnswers) {
        const detail = detailMap.get(answer.conditionId);

        await tx.assessmentCondition.create({
          data: {
            assessment_id: newAssessment.id,
            condition_id: answer.conditionId,
            answer_option_id: answer.answerOptionId,
            value_scale: detail ? detail.maxPoints : 0,
            score_ratio: detail ? detail.severity : 0,
            final_score: detail ? detail.deduction : 0,
          },
        });
      }

      // Create AssessmentPathScore rows for each decision path
      for (const pathResult of result.pathResults) {
        await tx.assessmentPathScore.create({
          data: {
            assessment_id: newAssessment.id,
            decision_path_id: pathResult.decisionPathId,
            total_score: pathResult.totalScore,
            score_physical: pathResult.scorePhysical,
            score_functional: pathResult.scoreFunctional,
            score_age: pathResult.scoreAge,
            rank: pathResult.rank,
            is_recommended: pathResult.isRecommended,
          },
        });
      }

      return newAssessment;
    });

    // 3. Return the full result
    sendResponse(
      res,
      201,
      {
        id: assessment.id,
        assessment_id: assessment.id,
        age_score: result.ageScore,
        physical_score: result.physicalResult.score,
        functional_score: result.functionalResult.score,
        physical_details: result.physicalResult.details,
        functional_details: result.functionalResult.details,
        path_results: result.pathResults,
      },
      'Assessment submitted and scored successfully',
    );
  } catch (error: any) {
    console.error('Error creating assessment:', error);
    if (error.message?.includes('not found')) {
      sendResponse(res, 404, null, error.message);
    } else {
      sendResponse(res, 500, null, 'Internal server error');
    }
  }
};

// Get assessment by ID
export const getAssessmentById = async (req: Request, res: Response): Promise<void> => {
  try {
    // Authenticated user check?
    const userId = (req as AuthRequest).user?.userId;
    const { id } = req.params;

    const assessment = await prisma.assessment.findUnique({
      where: { id: Number(id) },
      include: {
        model: { include: { brand: true } },
        assessmentConditions: {
          include: {
            condition: { include: { category: true } },
            answerOption: true,
          },
        },
        pathScores: {
          include: { decisionPath: true },
          orderBy: { rank: 'asc' },
        },
        feedback: true,
      },
    });

    if (!assessment) {
      sendResponse(res, 404, null, 'Assessment not found');
      return;
    }

    // Check ownership?
    if (assessment.user_id !== userId && (req as AuthRequest).user?.role !== 'admin') {
      sendResponse(res, 403, null, 'Unauthorized');
      return;
    }

    sendResponse(res, 200, assessment, 'Assessment details fetched');
  } catch (error) {
    console.error('Error fetching assessment:', error);
    sendResponse(res, 500, null, 'Internal server error');
  }
};

// Admin dashboard stats
export const getAdminDashboardStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    // Total assessment count
    const totalAssessments = await prisma.assessment.count();

    // Recent assessments (last 10) with full data
    const recentAssessments = await prisma.assessment.findMany({
      take: 10,
      orderBy: { created_at: 'desc' },
      include: {
        model: { include: { brand: true } },
        user: { select: { id: true, name: true } },
        feedback: true,
        pathScores: {
          where: { is_recommended: true },
          include: { decisionPath: true },
        },
      },
    });

    // Model distribution (top models by assessment count)
    const modelDistribution = await prisma.assessment.groupBy({
      by: ['model_id'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 5,
    });

    // Resolve model names
    const modelIds = modelDistribution.map((m) => m.model_id);
    const models = await prisma.model.findMany({
      where: { id: { in: modelIds } },
      include: { brand: true },
    });

    const modelStats = modelDistribution.map((m) => {
      const model = models.find((mod) => mod.id === m.model_id);
      return {
        model_id: m.model_id,
        name: model ? `${model.brand.name} ${model.name}` : `Model #${m.model_id}`,
        count: m._count.id,
        percentage: totalAssessments > 0 ? Math.round((m._count.id / totalAssessments) * 100) : 0,
      };
    });

    // Average feedback rating
    const feedbackAgg = await prisma.assessmentFeedback.aggregate({
      _avg: { rate: true },
      _count: { answer_id: true },
    });

    // Recent feedback (last 5)
    const recentFeedback = await prisma.assessmentFeedback.findMany({
      take: 5,
      orderBy: { created_at: 'desc' },
      include: {
        assessment: {
          include: {
            user: { select: { id: true, name: true } },
            model: { include: { brand: true } },
          },
        },
      },
    });

    sendResponse(
      res,
      200,
      {
        totalAssessments,
        recentAssessments,
        modelStats,
        averageRating: feedbackAgg._avg.rate ?? 0,
        totalFeedback: feedbackAgg._count.answer_id,
        recentFeedback,
      },
      'Admin dashboard stats fetched',
    );
  } catch (error) {
    console.error('Error fetching admin dashboard stats:', error);
    sendResponse(res, 500, null, 'Internal server error');
  }
};

// Get assessments for the authenticated user
export const getUserAssessments = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as AuthRequest).user?.userId;

    if (!userId) {
      sendResponse(res, 401, null, 'Unauthorized');
      return;
    }

    const assessments = await prisma.assessment.findMany({
      where: { user_id: Number(userId) },
      include: {
        model: { include: { brand: true } },
      },
      orderBy: { created_at: 'desc' },
    });

    sendResponse(res, 200, assessments, 'User assessments fetched');
  } catch (error) {
    console.error('Error fetching user assessments:', error);
    sendResponse(res, 500, null, 'Internal server error');
  }
};

// Get all assessments (Admin)
export const getAllAssessments = async (_req: Request, res: Response): Promise<void> => {
  try {
    const assessments = await prisma.assessment.findMany({
      orderBy: { created_at: 'desc' },
      include: {
        model: { include: { brand: true } },
        user: { select: { id: true, name: true, email: true } }, // Include email for admin view
        pathScores: {
          where: { is_recommended: true },
          include: { decisionPath: true },
        },
      },
    });

    sendResponse(res, 200, assessments, 'All assessments fetched');
  } catch (error) {
    console.error('Error fetching all assessments:', error);
    sendResponse(res, 500, null, 'Internal server error');
  }
};

// Get all feedback (Admin)
export const getAllFeedback = async (_req: Request, res: Response): Promise<void> => {
  try {
    const feedback = await prisma.assessmentFeedback.findMany({
      orderBy: { created_at: 'desc' },
      include: {
        assessment: {
          include: {
            user: { select: { id: true, name: true, email: true } },
            model: { include: { brand: true } },
          },
        },
      },
    });

    sendResponse(res, 200, feedback, 'All feedback fetched');
  } catch (error) {
    console.error('Error fetching all feedback:', error);
    sendResponse(res, 500, null, 'Internal server error');
  }
};
