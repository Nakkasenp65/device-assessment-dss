import { type Request, type Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { sendResponse } from '../utils/responseHelper.js';

const prisma = new PrismaClient();

// Get all users (admin only)
export const getUsers = async (_req: Request, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        _count: { select: { assessments: true } },
      },
      orderBy: { id: 'asc' },
    });
    sendResponse(res, 200, users, 'Users fetched successfully');
  } catch (error) {
    console.error('Error fetching users:', error);
    sendResponse(res, 500, null, 'Internal server error');
  }
};

// Get user by ID (admin only)
export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id: Number(id) },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        _count: { select: { assessments: true } },
      },
    });

    if (!user) {
      sendResponse(res, 404, null, 'User not found');
      return;
    }

    sendResponse(res, 200, user, 'User fetched successfully');
  } catch (error) {
    console.error('Error fetching user:', error);
    sendResponse(res, 500, null, 'Internal server error');
  }
};

// Update user role (admin only)
export const updateUserRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role || !['admin', 'user'].includes(role)) {
      sendResponse(res, 400, null, 'Valid role is required (admin or user)');
      return;
    }

    const user = await prisma.user.update({
      where: { id: Number(id) },
      data: { role },
      select: { id: true, email: true, name: true, role: true },
    });

    sendResponse(res, 200, user, 'User role updated successfully');
  } catch (error) {
    console.error('Error updating user role:', error);
    sendResponse(res, 500, null, 'Internal server error');
  }
};

// Delete user (admin only)
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Prevent self-deletion
    const requestingUserId = (req as any).user?.userId;
    if (Number(id) === requestingUserId) {
      sendResponse(res, 400, null, 'Cannot delete your own account');
      return;
    }

    await prisma.user.delete({
      where: { id: Number(id) },
    });

    sendResponse(res, 200, null, 'User deleted successfully');
  } catch (error) {
    console.error('Error deleting user:', error);
    sendResponse(res, 500, null, 'Internal server error');
  }
};
