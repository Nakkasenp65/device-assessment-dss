import { type Request, type Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { sendResponse } from '../utils/responseHelper.js';

const prisma = new PrismaClient();

// Create a new condition
export const createCondition = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category_id, answer_group_id, new_answer_group, name, answer_type, impact_weight } =
      req.body;

    // Basic validation
    if (
      !category_id ||
      !name ||
      !answer_type ||
      impact_weight === undefined ||
      impact_weight === null
    ) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const VALID_WEIGHTS = [1, 3, 5, 10];
    const numericWeight = Number(impact_weight);
    if (isNaN(numericWeight) || !VALID_WEIGHTS.includes(numericWeight)) {
      res.status(400).json({
        error: `Invalid impact_weight. Must be one of: ${VALID_WEIGHTS.join(', ')}`,
      });
      return;
    }

    // Verify category exists
    const category = await prisma.conditionCategory.findUnique({
      where: { id: Number(category_id) },
    });
    if (!category) {
      res.status(404).json({ error: 'ConditionCategory not found' });
      return;
    }

    let finalAnswerGroupId = answer_group_id ? Number(answer_group_id) : null;

    await prisma
      .$transaction(async (tx) => {
        // If creating a new answer group inline
        if (!finalAnswerGroupId && new_answer_group) {
          const { name: groupName, options } = new_answer_group;
          if (!groupName || !Array.isArray(options) || options.length === 0) {
            throw new Error('Invalid new answer group data');
          }

          const group = await tx.answerGroup.create({
            data: { name: groupName },
          });

          await tx.answerOption.createMany({
            data: options.map((opt: any, index: number) => ({
              group_id: group.id,
              label: opt.label,
              default_ratio: Number(opt.default_ratio) || 0,
              order_index: index,
            })),
          });
          finalAnswerGroupId = group.id;
        }

        if (!finalAnswerGroupId) {
          throw new Error('Answer Group ID or New Answer Group data is required');
        }

        // Verify group exists (if passed ID)
        if (answer_group_id) {
          const group = await tx.answerGroup.findUnique({ where: { id: finalAnswerGroupId } });
          if (!group) throw new Error('AnswerGroup not found');
        }

        const condition = await tx.condition.create({
          data: {
            category_id: Number(category_id),
            answer_group_id: finalAnswerGroupId,
            name,
            answer_type,
            impact_weight: numericWeight,
          },
        });

        return condition;
      })
      .then((condition) => {
        res.status(201).json(condition);
      })
      .catch((error) => {
        console.error('Error creating condition details:', error);
        if (
          error.message === 'Invalid new answer group data' ||
          error.message === 'Answer Group ID or New Answer Group data is required'
        ) {
          res.status(400).json({ error: error.message });
        } else if (error.message === 'AnswerGroup not found') {
          res.status(404).json({ error: error.message });
        } else {
          res.status(500).json({ error: 'Internal server error' });
        }
      });
  } catch (error) {
    console.error('Error creating condition:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all conditions
export const getConditions = async (_req: Request, res: Response): Promise<void> => {
  try {
    const conditions = await prisma.condition.findMany({
      include: {
        category: true,
        answerGroup: {
          include: {
            answerOptions: {
              orderBy: {
                order_index: 'asc',
              },
            },
          },
        },
      },
    });
    sendResponse(res, 200, conditions, 'Conditions fetched successfully');
  } catch (error) {
    console.error('Error fetching conditions:', error);
    sendResponse(res, 500, null, 'Internal server error');
  }
};

// Get all condition categories
export const getConditionCategories = async (_req: Request, res: Response): Promise<void> => {
  try {
    console.log('Fetching categories');
    const categories = await prisma.conditionCategory.findMany();
    sendResponse(res, 200, categories, 'Categories fetched successfully');
  } catch (error) {
    console.error('Error fetching categories:', error);
    sendResponse(res, 500, null, 'Internal server error');
  }
};

// Get condition by ID
export const getConditionById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const condition = await prisma.condition.findUnique({
      where: { id: Number(id) },
      include: {
        category: true,
        answerGroup: {
          include: {
            answerOptions: {
              orderBy: {
                order_index: 'asc',
              },
            },
          },
        },
      },
    });
    if (!condition) {
      res.status(404).json({ error: 'Condition not found' });
      return;
    }
    res.json(condition);
  } catch (error) {
    console.error('Error fetching condition:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update condition
export const updateCondition = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { category_id, answer_group_id, name, answer_type, impact_weight } = req.body;

    const data: any = {};
    if (category_id) data.category_id = Number(category_id);
    if (answer_group_id) data.answer_group_id = Number(answer_group_id);
    if (name) data.name = name;
    if (answer_type) data.answer_type = answer_type;
    if (impact_weight !== undefined && impact_weight !== null) {
      const VALID_WEIGHTS = [1, 3, 5, 10];
      const numericWeight = Number(impact_weight);
      if (isNaN(numericWeight) || !VALID_WEIGHTS.includes(numericWeight)) {
        res.status(400).json({
          error: `Invalid impact_weight. Must be one of: ${VALID_WEIGHTS.join(', ')}`,
        });
        return;
      }
      data.impact_weight = numericWeight;
    }

    const condition = await prisma.condition.update({
      where: { id: Number(id) },
      data,
    });
    res.json(condition);
  } catch (error) {
    console.error('Error updating condition:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete condition
export const deleteCondition = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.condition.delete({
      where: { id: Number(id) },
    });
    res.json({ message: 'Condition deleted successfully' });
  } catch (error) {
    console.error('Error deleting condition:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
