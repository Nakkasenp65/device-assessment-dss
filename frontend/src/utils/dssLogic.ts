// ─── DSS Reasoning Logic ────────────────────────────────────────────────────
// Generates "Reason for Recommendation" text based purely on the mathematical
// relationship between user scores and path weights. Does NOT check path names
// so admins can freely rename/add paths.

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

/**
 * Determines the dominant factor of a winning path and generates
 * a Thai-language reasoning text explaining the recommendation.
 */
export function getRecommendationReason(
  winningPath: PathWeights,
  scores: UserScores,
): string {
  const { weight_physical, weight_functional, weight_age } = winningPath;

  // ─── Step 0: Check for balanced weights ──────────────────────────────
  const weights = [weight_physical, weight_functional, weight_age];
  const maxWeight = Math.max(...weights);
  const minWeight = Math.min(...weights);

  const isBalanced = maxWeight <= 0.5 || maxWeight - minWeight < 0.1;

  if (isBalanced) {
    return "ทางเลือกนี้พิจารณาทุกปัจจัย (สภาพ, การใช้งาน, อายุ) อย่างสมดุล และคะแนนเฉลี่ยโดยรวมของคุณอยู่ในระดับที่ดีและเหมาะสมที่สุดสำหรับเกณฑ์นี้";
  }

  // ─── Step 1: Find the path's dominant factor ─────────────────────────
  if (weight_physical >= weight_functional && weight_physical >= weight_age) {
    // Case A: Path prioritizes PHYSICAL
    if (scores.physical > 75) {
      return "ทางเลือกนี้ให้ความสำคัญกับ สภาพภายนอก เป็นหลัก ซึ่งสอดคล้องกับจุดเด่นของเครื่องคุณที่ดูแลรักษามาอย่างดีเยี่ยม จึงทำให้ได้คะแนนประเมินสูงที่สุดในทางเลือกนี้";
    }
    if (scores.physical >= 40) {
      return "ทางเลือกนี้พิจารณา สภาพภายนอก เป็นปัจจัยสำคัญ ซึ่งสภาพเครื่องของคุณอยู่ในเกณฑ์มาตรฐานที่ทางเลือกนี้ยอมรับได้ เมื่อรวมกับปัจจัยอื่นจึงเป็นทางเลือกที่เหมาะสมที่สุด";
    }
    return "แม้ทางเลือกนี้จะเน้นเรื่องสภาพภายนอก แต่ด้วยคะแนนด้านอื่น (การใช้งาน/อายุเครื่อง) ที่โดดเด่นของคุณ ช่วยชดเชยให้คะแนนรวมยังคงสูงพอที่จะแนะนำทางเลือกนี้";
  }

  if (weight_functional >= weight_physical && weight_functional >= weight_age) {
    // Case B: Path prioritizes FUNCTIONAL
    if (scores.functional > 75) {
      return "ทางเลือกนี้เน้นที่ ประสิทธิภาพการใช้งาน (Functional) มากกว่ารอยขีดข่วน ซึ่งระบบภายในเครื่องของคุณยังทำงานได้สมบูรณ์มาก จึงเป็นทางเลือกที่ตอบโจทย์ที่สุด";
    }
    return "ทางเลือกนี้ให้ความสำคัญกับระบบการทำงาน ซึ่งเครื่องของคุณยังอยู่ในเกณฑ์ที่ยอมรับได้ หรือมีปัจจัยด้านอายุ/สภาพภายนอกมาช่วยดึงคะแนนรวมให้สูงขึ้น";
  }

  // Case C: Path prioritizes AGE
  if (scores.age > 75) {
    return "ทางเลือกนี้ให้มูลค่ากับ ปีที่ผลิตและความทันสมัยของรุ่น เป็นหลัก ซึ่งเครื่องของคุณยังถือว่าเป็นรุ่นใหม่ เป็นที่ต้องการของตลาดในกลุ่มนี้";
  }
  return "ทางเลือกนี้ตัดสินจาก ความเก่า/ใหม่ของรุ่น เป็นหลัก ซึ่งเหมาะกับเครื่องที่มีอายุการใช้งานนาน เครื่องของคุณจึงตรงกับเกณฑ์การพิจารณาของกลุ่มนี้ (เช่น เพื่อการรีไซเคิลหรืออะไหล่)";
}
