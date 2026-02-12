interface AhpResult {
  weights: {
    physical: number;
    functional: number;
    age: number;
  };
  consistency: {
    lambdaMax: number;
    ci: number;
    cr: number;
    isConsistent: boolean;
  };
}

const RI_TABLE: Record<number, number> = {
  1: 0.0,
  2: 0.0,
  3: 0.58,
  4: 0.9,
  5: 1.12,
};

export class AhpEngine {
  public calculate(matrix: number[][]): AhpResult {
    const n = matrix.length;

    if (n !== 3 || !matrix[0] || matrix[0].length !== 3) {
      throw new Error('Invalid matrix size. Expected 3x3 matrix.');
    }

    // 1. Column Sums
    const colSums = new Array(n).fill(0);
    for (let j = 0; j < n; j++) {
      for (let i = 0; i < n; i++) {
        // Since we checked size at start, matrix[i] and matrix[i][j] are safe
        colSums[j] += matrix[i]![j]!;
      }
    }

    // 2. Normalize
    const normalizedMatrix = matrix.map((row) => row.map((val, j) => val / colSums[j]!));

    // 3. Weights (Priority Vector)
    const weightsArray = normalizedMatrix.map((row) => {
      const rowSum = row.reduce((sum, val) => sum + val, 0);
      return rowSum / n;
    });

    const weights = {
      physical: weightsArray[0] || 0,
      functional: weightsArray[1] || 0,
      age: weightsArray[2] || 0,
    };

    // 4. Consistency (Lambda Max)
    let lambdaMax = 0;
    for (let j = 0; j < n; j++) {
      lambdaMax += colSums[j]! * weightsArray[j]!;
    }

    const ci = (lambdaMax - n) / (n - 1);
    const ri = RI_TABLE[n] || 0.58; // Default to 0.58 for n=3 in case of lookup fail, though we enforced n=3
    const cr = ri === 0 ? 0 : ci / ri;

    return {
      weights,
      consistency: {
        lambdaMax,
        ci,
        cr,
        isConsistent: cr <= 0.1,
      },
    };
  }
}
