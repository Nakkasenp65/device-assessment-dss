import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { UserAnswer } from '../ScoringEngine.js';

// ─── Mock Prisma ────────────────────────────────────────────────────────────

const mockPrisma = {
  condition: { findMany: vi.fn() },
  answerOption: { findMany: vi.fn() },
  model: { findUnique: vi.fn() },
  decisionPath: { findMany: vi.fn() },
};

vi.mock('@prisma/client', () => {
  return {
    PrismaClient: class {
      condition = mockPrisma.condition;
      answerOption = mockPrisma.answerOption;
      model = mockPrisma.model;
      decisionPath = mockPrisma.decisionPath;
    },
  };
});

// Import AFTER mock is set up
const { ScoringEngine } = await import('../ScoringEngine.js');

// ─── Test Suite ─────────────────────────────────────────────────────────────

describe('ScoringEngine', () => {
  let engine: ScoringEngine;

  beforeEach(() => {
    vi.clearAllMocks();
    engine = new ScoringEngine();
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // getAgeScore
  // ═══════════════════════════════════════════════════════════════════════════

  describe('getAgeScore', () => {
    const currentYear = new Date().getFullYear();

    it('should return 100 for current year release (age = 0)', () => {
      expect(engine.getAgeScore(currentYear)).toBe(100);
    });

    it('should return 80 for 1-year-old device', () => {
      expect(engine.getAgeScore(currentYear - 1)).toBe(80);
    });

    it('should return 80 for 2-year-old device', () => {
      expect(engine.getAgeScore(currentYear - 2)).toBe(80);
    });

    it('should return 50 for 3-year-old device', () => {
      expect(engine.getAgeScore(currentYear - 3)).toBe(50);
    });

    it('should return 50 for 5-year-old device', () => {
      expect(engine.getAgeScore(currentYear - 5)).toBe(50);
    });

    it('should return 20 for 6-year-old device', () => {
      expect(engine.getAgeScore(currentYear - 6)).toBe(20);
    });

    it('should return 20 for 10-year-old device', () => {
      expect(engine.getAgeScore(currentYear - 10)).toBe(20);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // calculateCategoryScore
  // ═══════════════════════════════════════════════════════════════════════════

  describe('calculateCategoryScore', () => {
    it('should return score 100 when no conditions exist', async () => {
      mockPrisma.condition.findMany.mockResolvedValue([]);

      const result = await engine.calculateCategoryScore('Physical', []);
      expect(result.score).toBe(100);
      expect(result.details).toEqual([]);
    });

    it('should return score 100 when all answers are "Perfect" (severity 0.0)', async () => {
      const conditions = [
        { id: 1, name: 'Screen', impact_weight: 0.3, category: { slug: 'Physical' } },
        { id: 2, name: 'Body', impact_weight: 0.2, category: { slug: 'Physical' } },
      ];
      mockPrisma.condition.findMany.mockResolvedValue(conditions);

      // Both answers are "Perfect" → severity 0.0 → no deduction
      mockPrisma.answerOption.findMany.mockResolvedValue([
        { id: 10, default_ratio: 0.0 },
        { id: 11, default_ratio: 0.0 },
      ]);

      const answers: UserAnswer[] = [
        { conditionId: 1, answerOptionId: 10 },
        { conditionId: 2, answerOptionId: 11 },
      ];

      const result = await engine.calculateCategoryScore('Physical', answers);
      expect(result.score).toBe(100);
      expect(result.details).toHaveLength(2);
      expect(result.details.every((d) => d.deduction === 0)).toBe(true);
    });

    it('should return score 0 when all answers are "Broken" (severity 1.0)', async () => {
      const conditions = [
        { id: 1, name: 'Screen', impact_weight: 0.3, category: { slug: 'Physical' } },
        { id: 2, name: 'Body', impact_weight: 0.2, category: { slug: 'Physical' } },
        { id: 3, name: 'Port', impact_weight: 0.5, category: { slug: 'Physical' } },
      ];
      mockPrisma.condition.findMany.mockResolvedValue(conditions);

      // All answers are "Broken" → severity 1.0 → full deduction
      mockPrisma.answerOption.findMany.mockResolvedValue([
        { id: 10, default_ratio: 1.0 },
        { id: 11, default_ratio: 1.0 },
        { id: 12, default_ratio: 1.0 },
      ]);

      const answers: UserAnswer[] = [
        { conditionId: 1, answerOptionId: 10 },
        { conditionId: 2, answerOptionId: 11 },
        { conditionId: 3, answerOptionId: 12 },
      ];

      const result = await engine.calculateCategoryScore('Physical', answers);
      expect(result.score).toBe(0);
    });

    it('should correctly calculate deductions for mixed severity answers', async () => {
      // Total weight = 0.3 + 0.2 + 0.5 = 1.0
      // Screen: maxPoints = (0.3 / 1.0) * 100 = 30, severity = 0.5 → deduction = 15
      // Body:   maxPoints = (0.2 / 1.0) * 100 = 20, severity = 0.0 → deduction = 0
      // Port:   maxPoints = (0.5 / 1.0) * 100 = 50, severity = 1.0 → deduction = 50
      // Total deduction = 65, Score = 100 - 65 = 35

      const conditions = [
        { id: 1, name: 'Screen', impact_weight: 0.3, category: { slug: 'Physical' } },
        { id: 2, name: 'Body', impact_weight: 0.2, category: { slug: 'Physical' } },
        { id: 3, name: 'Port', impact_weight: 0.5, category: { slug: 'Physical' } },
      ];
      mockPrisma.condition.findMany.mockResolvedValue(conditions);
      mockPrisma.answerOption.findMany.mockResolvedValue([
        { id: 10, default_ratio: 0.5 }, // Major
        { id: 11, default_ratio: 0.0 }, // Perfect
        { id: 12, default_ratio: 1.0 }, // Broken
      ]);

      const answers: UserAnswer[] = [
        { conditionId: 1, answerOptionId: 10 },
        { conditionId: 2, answerOptionId: 11 },
        { conditionId: 3, answerOptionId: 12 },
      ];

      const result = await engine.calculateCategoryScore('Physical', answers);
      expect(result.score).toBe(35);

      // Verify individual deductions
      const screenDetail = result.details.find((d) => d.conditionId === 1);
      expect(screenDetail?.maxPoints).toBe(30);
      expect(screenDetail?.deduction).toBe(15);

      const portDetail = result.details.find((d) => d.conditionId === 3);
      expect(portDetail?.maxPoints).toBe(50);
      expect(portDetail?.deduction).toBe(50);
    });

    it('should normalize weights correctly when they do NOT sum to 1.0', async () => {
      // Total weight = 3 + 2 = 5  (NOT 1.0 — the algorithm normalizes)
      // CondA: maxPoints = (3 / 5) * 100 = 60
      // CondB: maxPoints = (2 / 5) * 100 = 40
      // Sum of maxPoints = 100 ✓ (normalization guarantees this)

      const conditions = [
        { id: 1, name: 'CondA', impact_weight: 3, category: { slug: 'Physical' } },
        { id: 2, name: 'CondB', impact_weight: 2, category: { slug: 'Physical' } },
      ];
      mockPrisma.condition.findMany.mockResolvedValue(conditions);
      mockPrisma.answerOption.findMany.mockResolvedValue([
        { id: 10, default_ratio: 0.0 }, // Perfect
        { id: 11, default_ratio: 0.0 }, // Perfect
      ]);

      const answers: UserAnswer[] = [
        { conditionId: 1, answerOptionId: 10 },
        { conditionId: 2, answerOptionId: 11 },
      ];

      const result = await engine.calculateCategoryScore('Physical', answers);

      // Sum of maxPoints should equal 100
      const totalMaxPoints = result.details.reduce((s, d) => s + d.maxPoints, 0);
      expect(totalMaxPoints).toBe(100);

      // CondA maxPoints = 60, CondB maxPoints = 40
      expect(result.details.find((d) => d.conditionId === 1)?.maxPoints).toBe(60);
      expect(result.details.find((d) => d.conditionId === 2)?.maxPoints).toBe(40);

      // Score should be 100 (no defects)
      expect(result.score).toBe(100);
    });

    it('should handle edge case where totalWeight is 0', async () => {
      const conditions = [
        { id: 1, name: 'ZeroWeight', impact_weight: 0, category: { slug: 'Physical' } },
      ];
      mockPrisma.condition.findMany.mockResolvedValue(conditions);

      const result = await engine.calculateCategoryScore('Physical', []);
      expect(result.score).toBe(100);
    });

    it('should ignore answers for conditions not in the requested category', async () => {
      // Only condition 1 is in "Physical"
      const conditions = [
        { id: 1, name: 'Screen', impact_weight: 0.5, category: { slug: 'Physical' } },
      ];
      mockPrisma.condition.findMany.mockResolvedValue(conditions);
      mockPrisma.answerOption.findMany.mockResolvedValue([
        { id: 10, default_ratio: 0.0 }, // Perfect
        { id: 20, default_ratio: 1.0 }, // Broken — but for a different category
      ]);

      const answers: UserAnswer[] = [
        { conditionId: 1, answerOptionId: 10 }, // Physical — counted
        { conditionId: 999, answerOptionId: 20 }, // Not in Physical — ignored
      ];

      const result = await engine.calculateCategoryScore('Physical', answers);
      expect(result.score).toBe(100); // Only the "Perfect" physical answer counts
      expect(result.details).toHaveLength(1);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // processAssessment (Integration-style with mocked DB)
  // ═══════════════════════════════════════════════════════════════════════════

  describe('processAssessment', () => {
    it('should throw if model not found', async () => {
      mockPrisma.model.findUnique.mockResolvedValue(null);

      await expect(engine.processAssessment({ modelId: 999, answers: [] })).rejects.toThrow(
        'Model with ID 999 not found',
      );
    });

    it('should throw if no decision paths exist', async () => {
      mockPrisma.model.findUnique.mockResolvedValue({
        id: 1,
        release_year: new Date().getFullYear(),
      });
      mockPrisma.condition.findMany.mockResolvedValue([]);
      mockPrisma.decisionPath.findMany.mockResolvedValue([]);

      await expect(engine.processAssessment({ modelId: 1, answers: [] })).rejects.toThrow(
        'No decision paths configured',
      );
    });

    it('should calculate and rank path results correctly', async () => {
      const currentYear = new Date().getFullYear();

      // Model: released this year → age score = 100
      mockPrisma.model.findUnique.mockResolvedValue({
        id: 1,
        release_year: currentYear,
      });

      // No conditions → both physical and functional scores = 100
      mockPrisma.condition.findMany.mockResolvedValue([]);

      // Two decision paths with different weights
      mockPrisma.decisionPath.findMany.mockResolvedValue([
        {
          id: 1,
          name: 'Trade-In',
          weight_physical: 0.4,
          weight_functional: 0.4,
          weight_age: 0.2,
        },
        {
          id: 2,
          name: 'Second-Hand',
          weight_physical: 0.35,
          weight_functional: 0.35,
          weight_age: 0.3,
        },
      ]);

      const result = await engine.processAssessment({ modelId: 1, answers: [] });

      expect(result.ageScore).toBe(100);
      expect(result.physicalResult.score).toBe(100);
      expect(result.functionalResult.score).toBe(100);

      // Both paths should score 100 (all categories are 100)
      expect(result.pathResults).toHaveLength(2);
      expect(result.pathResults[0]!.totalScore).toBe(100);
      expect(result.pathResults[0]!.isRecommended).toBe(true);
      expect(result.pathResults[0]!.rank).toBe(1);
      expect(result.pathResults[1]!.rank).toBe(2);
    });

    it('should weight paths differently for mixed category scores', async () => {
      const currentYear = new Date().getFullYear();

      // Model: 4 years old → age score = 50
      mockPrisma.model.findUnique.mockResolvedValue({
        id: 1,
        release_year: currentYear - 4,
      });

      // Physical conditions: just one "Screen" with weight 1.0
      // We mock this for BOTH calls (Physical and Functional)
      // First call = Physical conditions, Second call = Functional conditions
      mockPrisma.condition.findMany
        .mockResolvedValueOnce([
          { id: 1, name: 'Screen', impact_weight: 1.0, category: { slug: 'Physical' } },
        ])
        .mockResolvedValueOnce([
          { id: 2, name: 'Battery', impact_weight: 1.0, category: { slug: 'Functional' } },
        ]);

      // Answer options
      mockPrisma.answerOption.findMany
        .mockResolvedValueOnce([{ id: 10, default_ratio: 0.5 }]) // Physical: "Major"
        .mockResolvedValueOnce([{ id: 20, default_ratio: 0.0 }]); // Functional: "Perfect"

      // Decision paths
      mockPrisma.decisionPath.findMany.mockResolvedValue([
        {
          id: 1,
          name: 'Trade-In', // favors physical+functional equally
          weight_physical: 0.4,
          weight_functional: 0.4,
          weight_age: 0.2,
        },
        {
          id: 2,
          name: 'Recycle', // favors functional
          weight_physical: 0.2,
          weight_functional: 0.5,
          weight_age: 0.3,
        },
      ]);

      const answers: UserAnswer[] = [
        { conditionId: 1, answerOptionId: 10 }, // Physical: severity 0.5
        { conditionId: 2, answerOptionId: 20 }, // Functional: severity 0.0
      ];

      const result = await engine.processAssessment({ modelId: 1, answers });

      // Physical score: 100 - (100 * 0.5) = 50
      expect(result.physicalResult.score).toBe(50);

      // Functional score: 100 - (100 * 0.0) = 100
      expect(result.functionalResult.score).toBe(100);

      // Age score: 50 (4 years old)
      expect(result.ageScore).toBe(50);

      // Trade-In: (50 * 0.4) + (100 * 0.4) + (50 * 0.2) = 20 + 40 + 10 = 70
      const tradeIn = result.pathResults.find((p) => p.pathName === 'Trade-In');
      expect(tradeIn?.totalScore).toBe(70);

      // Recycle: (50 * 0.2) + (100 * 0.5) + (50 * 0.3) = 10 + 50 + 15 = 75
      const recycle = result.pathResults.find((p) => p.pathName === 'Recycle');
      expect(recycle?.totalScore).toBe(75);

      // Recycle should be ranked #1 (higher score)
      expect(recycle?.rank).toBe(1);
      expect(recycle?.isRecommended).toBe(true);
      expect(tradeIn?.rank).toBe(2);
      expect(tradeIn?.isRecommended).toBe(false);
    });
  });
});
