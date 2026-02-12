import { type Request, type Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { sendResponse } from '../utils/responseHelper.js';

const prisma = new PrismaClient();

// Create a new brand
export const createBrand = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name } = req.body;
    if (!name) {
      sendResponse(res, 400, null, 'Name is required');
      return;
    }
    const brand = await prisma.brand.create({
      data: { name },
    });
    sendResponse(res, 201, brand, 'Brand created successfully');
  } catch (error) {
    console.error('Error creating brand:', error);
    sendResponse(res, 500, null, 'Internal server error');
  }
};

// Get all brands
export const getBrands = async (_req: Request, res: Response): Promise<void> => {
  try {
    const brands = await prisma.brand.findMany({
      include: { _count: { select: { models: true } } }, // Optional: include count of models
    });
    sendResponse(res, 200, brands, 'Brands fetched successfully');
  } catch (error) {
    console.error('Error fetching brands:', error);
    sendResponse(res, 500, null, 'Internal server error');
  }
};

// Get brand by ID
export const getBrandById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const brand = await prisma.brand.findUnique({
      where: { id: Number(id) },
      include: { models: true },
    });
    if (!brand) {
      sendResponse(res, 404, null, 'Brand not found');
      return;
    }
    sendResponse(res, 200, brand, 'Brand fetched successfully');
  } catch (error) {
    console.error('Error fetching brand:', error);
    sendResponse(res, 500, null, 'Internal server error');
  }
};

// Update brand
export const updateBrand = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    // Check if brand exists
    // (Prisma throws error on update if not found usually, but explicit check is nicer or rely on try/catch P2025)

    const brand = await prisma.brand.update({
      where: { id: Number(id) },
      data: { name },
    });
    sendResponse(res, 200, brand, 'Brand updated successfully');
  } catch (error) {
    console.error('Error updating brand:', error);
    // Prisma P2025: Record to update not found
    sendResponse(res, 500, null, 'Internal server error or brand not found');
  }
};

// Delete brand
export const deleteBrand = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.brand.delete({
      where: { id: Number(id) },
    });
    sendResponse(res, 200, null, 'Brand deleted successfully');
  } catch (error) {
    console.error('Error deleting brand:', error);
    sendResponse(res, 500, null, 'Internal server error');
  }
};
