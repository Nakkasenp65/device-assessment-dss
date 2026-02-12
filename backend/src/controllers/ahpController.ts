import { type Request, type Response } from 'express';
import { AhpEngine } from '../services/AhpEngine.js';

const ahpEngine = new AhpEngine();

export const calculateAhp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { matrix } = req.body; // Expecting 3x3 matrix

    if (!matrix || !Array.isArray(matrix)) {
      res.status(400).json({ error: 'Invalid matrix format' });
      return;
    }

    const result = ahpEngine.calculate(matrix);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'AHP calculation failed' });
  }
};
