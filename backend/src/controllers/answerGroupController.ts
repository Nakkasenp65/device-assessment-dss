import { type Request, type Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get all answer groups
export const getAnswerGroups = async (_req: Request, res: Response): Promise<void> => {
  try {
    const groups = await prisma.answerGroup.findMany({
      include: {
        answerOptions: {
          orderBy: {
            order_index: 'asc',
          },
        },
      },
    });
    res.json(groups);
  } catch (error) {
    console.error('Error fetching answer groups:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create a new answer group with options
export const createAnswerGroup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, options } = req.body;

    if (!name || !Array.isArray(options) || options.length === 0) {
      res.status(400).json({ error: 'Name and at least one option are required' });
      return;
    }

    // Transaction to create group and options
    const newGroup = await prisma.$transaction(async (tx) => {
      const group = await tx.answerGroup.create({
        data: {
          name,
        },
      });

      // Create options
      await tx.answerOption.createMany({
        data: options.map((opt: any, index: number) => ({
          group_id: group.id,
          label: opt.label,
          default_ratio: Number(opt.default_ratio) || 0,
          order_index: index, // Use array index if not provided, or ensure backend sets it
        })),
      });

      return group;
    });

    // Fetch the created group with options to return
    const createdGroup = await prisma.answerGroup.findUnique({
      where: { id: newGroup.id },
      include: { answerOptions: { orderBy: { order_index: 'asc' } } },
    });

    res.status(201).json(createdGroup);
  } catch (error) {
    console.error('Error creating answer group:', error);
    if ((error as any).code === 'P2002') {
      res.status(409).json({ error: 'Answer group with this name already exists' });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};
