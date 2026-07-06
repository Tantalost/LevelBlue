import { supabase } from '../utils/supabase';
import type { BktTopic } from '../features/gameplay/constants/bktTopics';

export type AssessBktParams = {
  studentId: string;
  topic: BktTopic;
  isCorrect: boolean;
};

export type AssessBktResult = {
  probabilityKnown: number;
  topic: BktTopic;
  isCorrect: boolean;
  fromServer: boolean;
};

/**
 * Calls the Supabase `assess_bkt` RPC.
 * Returns updated P(L) from the server, or null if the call fails.
 */
export async function assessBkt({
  studentId,
  topic,
  isCorrect,
}: AssessBktParams): Promise<number | null> {
  const { data, error } = await supabase.rpc('assess_bkt', {
    p_student_id: studentId,
    p_topic: topic,
    p_is_correct: isCorrect,
  });

  if (error) {
    console.warn('[assess_bkt]', error.message);
    return null;
  }

  const value = typeof data === 'number' ? data : Number(data);
  if (!Number.isFinite(value)) {
    console.warn('[assess_bkt] unexpected return value:', data);
    return null;
  }

  return value;
}

export function estimateMasteryFallback(
  correctCount: number,
  totalQuestions: number,
  priorPl = 0.1,
): number {
  if (totalQuestions <= 0) return priorPl;
  const sessionAccuracy = correctCount / totalQuestions;
  return Math.min(1, Math.max(0.05, priorPl * 0.4 + sessionAccuracy * 0.6));
}
