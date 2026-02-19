import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ─── Types ──────────────────────────────────────────────────────────────────

export interface UserAnswer {
  conditionId: number;
  answerOptionId: number;
}

export interface AssessmentInput {
  modelId: number;
  answers: UserAnswer[];
}

export interface ConditionDetail {
  conditionId: number;
  conditionName: string;
  impactWeight: number;
  maxPoints: number;
  severity: number;
  deduction: number;
}

export interface CategoryResult {
  score: number;
  details: ConditionDetail[];
}

export interface PathResult {
  decisionPathId: number;
  pathName: string;
  scorePhysical: number;
  scoreFunctional: number;
  scoreAge: number;
  totalScore: number;
  rank: number;
  isRecommended: boolean;
}

export interface AssessmentResult {
  ageScore: number;
  physicalResult: CategoryResult;
  functionalResult: CategoryResult;
  pathResults: PathResult[];
}

// ─── Age Score Tiers ────────────────────────────────────────────────────────

interface AgeTier {
  maxAge: number; // exclusive upper bound (Infinity for the last tier)
  score: number;
}

const AGE_TIERS: AgeTier[] = [
  { maxAge: 2, score: 100 }, // 0–1 years  (released this year or last year)
  { maxAge: 4, score: 80 }, // 2–3 years
  { maxAge: 6, score: 50 }, // 4–5 years
  { maxAge: Infinity, score: 20 }, // 6+ years
];

// ─── Service ────────────────────────────────────────────────────────────────

export class ScoringEngine {
  /**
   * Calculates the age score based on the device model's release year.
   * Pure function — no DB access needed if release year is passed directly.
   *
   * @param releaseYear - The year the device model was released.
   * @returns A score between 0–100.
   */
  public getAgeScore(releaseYear: number): number {
    const currentYear = new Date().getFullYear();
    const age = currentYear - releaseYear;

    for (const tier of AGE_TIERS) {
      if (age < tier.maxAge) {
        return tier.score;
      }
    }

    // Fallback (should not reach here due to Infinity tier)
    return AGE_TIERS[AGE_TIERS.length - 1]!.score;
  }

  /**
   * Builds the weight map for a category and calculates the deductive score.
   *
   * Algorithm:
   *   1. Fetch all conditions for the category.
   *   2. Sum all impact_weight values → totalWeight (denominator).
   *   3. For each condition: maxPoints = (impact_weight / totalWeight) * 100.
   *   4. For each user answer: deduction = maxPoints * AnswerOption.default_ratio.
   *   5. Score = 100 - sum(all deductions).
   *
   * Edge cases:
   *   - If totalWeight is 0, returns score 100 (no conditions to deduct).
   *   - If a user answer references a condition not in this category, it is ignored.
   */
  public async calculateCategoryScore(
    categorySlug: string,
    userAnswers: UserAnswer[],
  ): Promise<CategoryResult> {
    // 1. Fetch all conditions for the category (lookup by slug)
    const conditions = await prisma.condition.findMany({
      where: {
        category: { slug: categorySlug },
      },
      include: {
        category: true,
      },
    });

    // Edge case: no conditions
    if (conditions.length === 0) {
      return { score: 100, details: [] };
    }

    // 2. Calculate total weight (denominator)
    const totalWeight = conditions.reduce((sum, c) => sum + c.impact_weight, 0);

    // Edge case: total weight is 0
    if (totalWeight === 0) {
      return { score: 100, details: [] };
    }

    // 3. Build a lookup: conditionId → condition data
    const conditionMap = new Map(
      conditions.map((c) => [
        c.id,
        {
          ...c,
          maxPoints: (c.impact_weight / totalWeight) * 100,
        },
      ]),
    );

    // 4. Fetch all relevant answer options in one query
    const answerOptionIds = userAnswers.map((a) => a.answerOptionId);
    const answerOptions = await prisma.answerOption.findMany({
      where: { id: { in: answerOptionIds } },
    });
    const optionMap = new Map(answerOptions.map((o) => [o.id, o]));

    // 5. Calculate deductions
    const details: ConditionDetail[] = [];
    let totalDeduction = 0;

    for (const answer of userAnswers) {
      const condition = conditionMap.get(answer.conditionId);
      if (!condition) continue; // Answer for a different category — skip

      const option = optionMap.get(answer.answerOptionId);
      if (!option) continue; // Invalid option — skip

      const severity = option.default_ratio; // 0.0 = perfect, 1.0 = broken
      const deduction = condition.maxPoints * severity;

      details.push({
        conditionId: condition.id,
        conditionName: condition.name,
        impactWeight: condition.impact_weight,
        maxPoints: condition.maxPoints,
        severity,
        deduction,
      });

      totalDeduction += deduction;
    }

    // 6. Final score = 100 - total deductions (clamped to 0 minimum)
    const score = Math.max(0, 100 - totalDeduction);

    return { score, details };
  }

  /**
   * Orchestrates the full assessment flow:
   *   1. Fetch the model to get its release_year → age score.
   *   2. Split user answers by category → physical & functional scores.
   *   3. Fetch all DecisionPaths.
   *   4. For each path: total = (phys * w_p) + (func * w_f) + (age * w_a).
   *   5. Rank paths and mark the highest as recommended.
   */
  public async processAssessment(input: AssessmentInput): Promise<AssessmentResult> {
    // 1. Get model release year
    const model = await prisma.model.findUnique({
      where: { id: input.modelId },
    });

    if (!model) {
      throw new Error(`Model with ID ${input.modelId} not found.`);
    }

    const ageScore = this.getAgeScore(model.release_year);

    // 2. Calculate category scores using slugs (the engine auto-filters by category)
    const physicalResult = await this.calculateCategoryScore('physical', input.answers);
    const functionalResult = await this.calculateCategoryScore('functional', input.answers);

    // 3. Fetch all decision paths
    const decisionPaths = await prisma.decisionPath.findMany();

    if (decisionPaths.length === 0) {
      throw new Error('No decision paths configured. Please seed the database.');
    }

    // 4. Calculate weighted total for each path
    const pathResults: PathResult[] = decisionPaths.map((dp) => {
      const totalScore =
        physicalResult.score * dp.weight_physical +
        functionalResult.score * dp.weight_functional +
        ageScore * dp.weight_age;

      return {
        decisionPathId: dp.id,
        pathName: dp.name,
        scorePhysical: physicalResult.score,
        scoreFunctional: functionalResult.score,
        scoreAge: ageScore,
        totalScore: Math.round(totalScore * 100) / 100, // 2 decimal places
        rank: 0, // placeholder — filled below
        isRecommended: false, // placeholder — filled below
      };
    });

    // 5. Sort by totalScore descending, assign ranks
    pathResults.sort((a, b) => b.totalScore - a.totalScore);
    pathResults.forEach((pr, index) => {
      pr.rank = index + 1;
      pr.isRecommended = index === 0;
    });

    return {
      ageScore,
      physicalResult,
      functionalResult,
      pathResults,
    };
  }
}
