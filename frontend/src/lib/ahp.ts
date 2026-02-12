export class AhpCalculator {
  // Random Consistency Index (RI) for matrix sizes 1-10
  // n=3, RI=0.58
  private static readonly RI_MAP: Record<number, number> = {
    1: 0,
    2: 0,
    3: 0.58,
    4: 0.9,
    5: 1.12,
    6: 1.24,
    7: 1.32,
    8: 1.41,
    9: 1.45,
    10: 1.49,
  };

  /**
   * Calculate weights and consistency ratio from a square pairwise comparison matrix.
   * Matrix should be n x n where matrix[i][j] is the importance of i relative to j.
   */
  static calculate(matrix: number[][]): { weights: number[]; cr: number; consistencyStatus: string } {
    const n = matrix.length;
    if (n === 0) return { weights: [], cr: 0, consistencyStatus: "N/A" };

    // 1. Normalize the matrix
    // Sum of each column
    const colSums = new Array(n).fill(0);
    for (let j = 0; j < n; j++) {
      for (let i = 0; i < n; i++) {
        colSums[j] += matrix[i][j];
      }
    }

    // Divide each element by its column sum
    const normalizedMatrix = matrix.map((row) => row.map((val, j) => val / colSums[j]));

    // 2. Calculate Priority Vector (Average of each row)
    const weights = normalizedMatrix.map((row) => row.reduce((sum, val) => sum + val, 0) / n);

    // 3. Calculate Consistency Ratio (CR)
    // Calculate Lambda Max (Principal Eigenvalue)
    // Method: Multiply original matrix by weight vector, then divide result (element-wise) by weight vector, then hash average.
    // simpler approximation: Sum of (Column Sum * Weight for that column)
    const lambdaMax = colSums.reduce((sum, colSum, i) => sum + colSum * weights[i], 0);

    const ci = (lambdaMax - n) / (n - 1);
    const ri = 0.58; // We always use n = 3.
    const cr = ci / ri;

    let consistencyStatus = "ดี";

    if (cr > 0.1) {
      if (cr > 0.2) consistencyStatus = "แย่ (ควรประเมินใหม่)";
      else consistencyStatus = "พอใช้ (ควรตรวจสอบ)";
    } else {
      consistencyStatus = "สมเหตุสมผล";
    }

    return { weights, cr, consistencyStatus };
  }
}
