import type { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { sendResponse } from '../utils/responseHelper.js';

const prisma = new PrismaClient();

export const createFeedback = async (req: Request, res: Response): Promise<void> => {
  try {
    const { assessment_id, rate, comment } = req.body;

    if (!assessment_id || !rate) {
      sendResponse(res, 400, null, 'Assessment ID and rating are required');
      return;
    }

    if (rate < 1 || rate > 5) {
      sendResponse(res, 400, null, 'Rating must be between 1 and 5');
      return;
    }

    // specific check: verify assessment exists
    const assessment = await prisma.assessment.findUnique({
      where: { id: Number(assessment_id) },
    });

    if (!assessment) {
      sendResponse(res, 404, null, 'Assessment not found');
      return;
    }

    const feedback = await prisma.assessmentFeedback.create({
      data: {
        assessment_id: Number(assessment_id),
        rate: Number(rate),
        comment: comment || '',
      },
    });

    sendResponse(res, 201, feedback, 'Feedback submitted successfully');
  } catch (error) {
    console.error('Error submitting feedback:', error);
    sendResponse(res, 500, null, 'Internal server error');
  }
};
