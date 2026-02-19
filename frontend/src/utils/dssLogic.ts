// ─── DSS Reasoning Logic ────────────────────────────────────────────────────
// Generates "Reason for Recommendation" text using TWO inputs:
//   1. Path weights  → what this decision path VALUES (its criteria)
//   2. User scores   → how well the device PERFORMS in each category
// Does NOT check path names so admins can freely rename/add paths.

interface PathWeights {
  weight_physical: number;
  weight_functional: number;
  weight_age: number;
}

interface UserScores {
  physical: number;
  functional: number;
  age: number;
}

type Factor = "physical" | "functional" | "age";

const FACTOR_LABELS: Record<Factor, string> = {
  physical: "สภาพภายนอก",
  functional: "การทำงานของระบบ",
  age: "อายุและความทันสมัยของรุ่น",
};

/** Sort factors by value descending, returning the ordered factor keys. */
function rankFactors(values: Record<Factor, number>): Factor[] {
  return (Object.keys(values) as Factor[]).sort((a, b) => values[b] - values[a]);
}

function getScoreTier(score: number): "high" | "mid" | "low" {
  if (score >= 75) return "high";
  if (score >= 40) return "mid";
  return "low";
}

/**
 * Determines why a path was recommended by combining:
 *   - What the path prioritizes (weights)
 *   - How well the device performs (scores)
 */
export function getRecommendationReason(winningPath: PathWeights, scores: UserScores): string {
  const { weight_physical, weight_functional, weight_age } = winningPath;

  const weightMap: Record<Factor, number> = {
    physical: weight_physical,
    functional: weight_functional,
    age: weight_age,
  };

  const scoreMap: Record<Factor, number> = {
    physical: scores.physical,
    functional: scores.functional,
    age: scores.age,
  };

  const rankedWeights = rankFactors(weightMap);
  const rankedScores = rankFactors(scoreMap);

  const topWeight = rankedWeights[0];
  const secondWeight = rankedWeights[1];
  const topScore = rankedScores[0];

  const weights = Object.values(weightMap);
  const maxW = Math.max(...weights);
  const minW = Math.min(...weights);

  // ─── Case 1: Balanced weights — path values everything equally ────────
  const isBalanced = maxW - minW < 0.15;
  if (isBalanced) {
    const tier = getScoreTier(scores[topScore]);
    if (tier === "high") {
      return `ทางเลือกนี้พิจารณาทุกปัจจัยอย่างสมดุล และเครื่องของคุณทำคะแนนได้ดีในทุกด้าน โดยเฉพาะด้าน${FACTOR_LABELS[topScore]}ที่โดดเด่น จึงเป็นทางเลือกที่เหมาะสมที่สุด`;
    }
    if (tier === "mid") {
      return `ทางเลือกนี้พิจารณาทุกปัจจัยอย่างสมดุล คะแนนรวมของเครื่องคุณอยู่ในระดับที่ยอมรับได้ จึงเหมาะสมที่สุดสำหรับเกณฑ์การประเมินแบบรอบด้านนี้`;
    }
    return `ทางเลือกนี้พิจารณาทุกปัจจัยอย่างสมดุล แม้คะแนนบางด้านจะต่ำ แต่ไม่มีทางเลือกอื่นที่ได้คะแนนรวมสูงกว่า จึงเป็นทางเลือกที่ดีที่สุดในตอนนี้`;
  }

  // ─── Case 2: Path has a dominant factor ───────────────────────────────
  // Check if top two weights are tied (co-dominant)
  const isCoDominant = Math.abs(weightMap[topWeight] - weightMap[secondWeight]) < 0.05;
  const dominantLabel = FACTOR_LABELS[topWeight];
  const secondLabel = FACTOR_LABELS[secondWeight];
  const topScoreLabel = FACTOR_LABELS[topScore];

  // Build the "path values" part
  const pathPart = isCoDominant
    ? `ทางเลือกนี้ให้ความสำคัญกับ${dominantLabel}และ${secondLabel}เท่าๆ กัน`
    : `ทางเลือกนี้ให้ความสำคัญกับ${dominantLabel}เป็นหลัก`;

  // Build the "device matches" part based on how scores align with weights
  const dominantScore = scores[topWeight];
  const dominantTier = getScoreTier(dominantScore);

  // Does the user's strongest score align with what the path values?
  const scoreAligns = topScore === topWeight || (isCoDominant && topScore === secondWeight);

  if (scoreAligns && dominantTier === "high") {
    return `${pathPart} ซึ่งสอดคล้องกับจุดเด่นของเครื่องคุณที่ได้คะแนนด้าน${topScoreLabel}สูงถึง ${Math.round(scores[topScore])}% จึงทำให้ได้คะแนนรวมสูงที่สุดในทางเลือกนี้`;
  }

  if (dominantTier === "high") {
    return `${pathPart} และเครื่องของคุณทำคะแนนด้าน${dominantLabel}ได้ดีมาก (${Math.round(dominantScore)}%) จึงตรงกับเกณฑ์ที่ทางเลือกนี้ต้องการ`;
  }

  if (dominantTier === "mid") {
    if (scoreAligns) {
      return `${pathPart} ซึ่งเครื่องของคุณมีคะแนนด้าน${topScoreLabel}อยู่ในเกณฑ์มาตรฐาน (${Math.round(scores[topScore])}%) เมื่อรวมกับปัจจัยอื่นจึงเป็นทางเลือกที่เหมาะสมที่สุด`;
    }
    return `${pathPart} แม้คะแนนด้านนี้จะอยู่ในระดับปานกลาง แต่ด้าน${topScoreLabel}ที่ได้ ${Math.round(scores[topScore])}% ช่วยเสริมให้คะแนนรวมยังสูงพอสำหรับทางเลือกนี้`;
  }

  // dominantTier === "low"
  return `${pathPart} แม้คะแนนด้านนี้จะยังไม่สูง แต่ด้วยคะแนนด้าน${topScoreLabel} (${Math.round(scores[topScore])}%) ที่ช่วยชดเชย ทำให้คะแนนรวมยังสูงกว่าทางเลือกอื่น`;
}
