import { type Request, type Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { sendResponse } from '../utils/responseHelper.js';

const prisma = new PrismaClient();

// Get all paths
export const getPaths = async (_req: Request, res: Response): Promise<void> => {
  try {
    const paths = await prisma.decisionPath.findMany();
    sendResponse(res, 200, paths, 'Paths fetched successfully');
  } catch (error) {
    sendResponse(res, 500, null, 'Failed to fetch paths');
  }
};

// Create path
export const createPath = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description_template, weight_physical, weight_functional, weight_age } = req.body;
    const path = await prisma.decisionPath.create({
      data: {
        name,
        description_template,
        weight_physical: weight_physical || 0,
        weight_functional: weight_functional || 0,
        weight_age: weight_age || 0,
      },
    });
    sendResponse(res, 201, path, 'Path created successfully');
  } catch (error) {
    sendResponse(res, 500, null, 'Failed to create path');
  }
};

// Update path
export const updatePath = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, description_template, weight_physical, weight_functional, weight_age } = req.body;
    const path = await prisma.decisionPath.update({
      where: { id: Number(id) },
      data: {
        name,
        description_template,
        weight_physical,
        weight_functional,
        weight_age,
      },
    });
    sendResponse(res, 200, path, 'Path updated successfully');
  } catch (error) {
    sendResponse(res, 500, null, 'Failed to update path');
  }
};

// Get path by ID
export const getPathById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const path = await prisma.decisionPath.findUnique({ where: { id: Number(id) } });
    if (!path) {
      sendResponse(res, 404, null, 'Path not found');
      return;
    }
    sendResponse(res, 200, path, 'Path fetched successfully');
  } catch (error) {
    sendResponse(res, 500, null, 'Failed to fetch path');
  }
};

// Delete path
export const deletePath = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.decisionPath.delete({ where: { id: Number(id) } });
    sendResponse(res, 200, null, 'Path deleted');
  } catch (error) {
    sendResponse(res, 500, null, 'Failed to delete path');
  }
};
