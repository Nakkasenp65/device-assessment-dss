import { type Request, type Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { sendResponse } from '../utils/responseHelper.js';

const prisma = new PrismaClient();

// Create a new model
export const createModel = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, brand_id, release_year } = req.body;

    if (!name || !brand_id || !release_year) {
      sendResponse(res, 400, null, 'Name, brand_id, and release_year are required');
      return;
    }

    // Check if brand exists
    const brand = await prisma.brand.findUnique({ where: { id: Number(brand_id) } });
    if (!brand) {
      sendResponse(res, 404, null, 'Brand not found');
      return;
    }

    const model = await prisma.model.create({
      data: {
        name,
        brand_id: Number(brand_id),
        release_year: Number(release_year),
      },
    });
    sendResponse(res, 201, model, 'Model created successfully');
  } catch (error) {
    console.error('Error creating model:', error);
    sendResponse(res, 500, null, 'Internal server error');
  }
};

// Get all models (optionally filter by brand_id)
export const getModels = async (req: Request, res: Response): Promise<void> => {
  try {
    const { brand_id } = req.query;
    const where = brand_id ? { brand_id: Number(brand_id) } : {};

    const models = await prisma.model.findMany({
      where,
      include: { brand: true },
    });
    sendResponse(res, 200, models, 'Models fetched successfully');
  } catch (error) {
    console.error('Error fetching models:', error);
    sendResponse(res, 500, null, 'Internal server error');
  }
};

// Get model by ID
export const getModelById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const model = await prisma.model.findUnique({
      where: { id: Number(id) },
      include: { brand: true },
    });
    if (!model) {
      sendResponse(res, 404, null, 'Model not found');
      return;
    }
    sendResponse(res, 200, model, 'Model fetched successfully');
  } catch (error) {
    console.error('Error fetching model:', error);
    sendResponse(res, 500, null, 'Internal server error');
  }
};

// Update model
export const updateModel = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, brand_id, release_year } = req.body;

    const data: any = {};
    if (name) data.name = name;
    if (brand_id) data.brand_id = Number(brand_id);
    if (release_year) data.release_year = Number(release_year);

    const model = await prisma.model.update({
      where: { id: Number(id) },
      data,
    });
    sendResponse(res, 200, model, 'Model updated successfully');
  } catch (error) {
    console.error('Error updating model:', error);
    sendResponse(res, 500, null, 'Internal server error');
  }
};

// Delete model
export const deleteModel = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.model.delete({
      where: { id: Number(id) },
    });
    sendResponse(res, 200, null, 'Model deleted successfully');
  } catch (error) {
    console.error('Error deleting model:', error);
    sendResponse(res, 500, null, 'Internal server error');
  }
};
