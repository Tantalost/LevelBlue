import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { assessBkt, estimateMasteryFallback } from '../../../services/bkt';
import { useAuthStore } from '../../../store/useAuthStore';
import type { BktTopic } from '../constants/bktTopics';
import { GOLD_PER_CORRECT_ANSWER } from '../constants/stages';
import { getQuestionsForStage } from '../data/questions';
import type {
  AssessmentQuestion,
  BktAssessmentSummary,
  MCQuestion,
  SEQuestion,
  TFQuestion,
} from '../types';
import { normP } from '../utils/scaling';

const QUESTION_TIMER_SEC = 20;

type Props = {
  stage: number;
  moduleName: string;
  primaryTopic: BktTopic;
  studentId: string | null;
  onComplete: (
    correct: number,
    answers: boolean[],
    bkt: BktAssessmentSummary,
  ) => void;
};

function isAnswerCorrect(
  question: AssessmentQuestion,
  answerIndex: number | boolean | null,
): boolean {
  if (answerIndex === null) return false;
  if (question.type === 'true_false') {
    return (answerIndex as boolean) === (question as TFQuestion).answer;
  }
  return (answerIndex as number) === (question as MCQuestion | SEQuestion).answer;
}

export default function ThreatAssessmentScreen({
  stage,
  moduleName,
  primaryTopic,
  studentId,
  onComplete,
}: Props) {
  const questions = getQuestionsForStage(stage);
  const updateMastery = useAuthStore((s) => s.updateMastery);

  const qIdxRef = useRef(0);
  const correctRef = useRef(0);
  const logRef = useRef<boolean[]>([]);
  const lockedRef = useRef(false);
  const topicMasteryRef = useRef<Partial<Record<BktTopic, number>>>({});
  const bktSyncedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  useEffect(() => { onCompleteRef.current = onComplete; });

  const [qIdx, setQIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIMER_SEC);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [syncingBkt, setSyncingBkt] = useState(false);

  const finishAssessment = useCallback(() => {
    const correctCount = correctRef.current;
    const primaryPl =
      topicMasteryRef.current[primaryTopic] ??
      estimateMasteryFallback(correctCount, questions.length);

    onCompleteRef.current(correctCount, logRef.current, {
      masteryPl: primaryPl,
      primaryTopic,
      topicMastery: { ...topicMasteryRef.current },
      bktSynced: bktSyncedRef.current,
    });
  }, [primaryTopic, questions.length]);

  const advanceFn = useCallback(
    async (answerIndex: number | boolean | null) => {
      if (lockedRef.current) return;
      lockedRef.current = true;

      const question = questions[qIdxRef.current];
      const isCorrect = isAnswerCorrect(question, answerIndex);
      correctRef.current += isCorrect ? 1 : 0;
      logRef.current = [...logRef.current, isCorrect];

      if (studentId) {
        setSyncingBkt(true);
        const newPl = await assessBkt({
          studentId,
          topic: question.topic,
          isCorrect,
        });
        setSyncingBkt(false);

        if (newPl !== null) {
          bktSyncedRef.current = true;
          const topic: BktTopic = question.topic;
          topicMasteryRef.current[topic] = newPl;
          updateMastery(topic, newPl);
        }
      }

      setFeedback(isCorrect ? 'correct' : 'wrong');
      setFeedbackMsg(
        answerIndex === null
          ? 'Time Up!'
          : isCorrect
            ? `Correct! +${GOLD_PER_CORRECT_ANSWER} Gold`
            : 'Incorrect',
      );

      setTimeout(() => {
        const next = qIdxRef.current + 1;
        if (next < questions.length) {
          qIdxRef.current = next;
          setQIdx(next);
          setTimeLeft(QUESTION_TIMER_SEC);
          setFeedback(null);
          setFeedbackMsg('');
          lockedRef.current = false;
        } else {
          finishAssessment();
        }
      }, 700);
    },
    [studentId, questions, finishAssessment, updateMastery],
  );

  const advanceRef = useRef(advanceFn);
  advanceRef.current = advanceFn;

  useEffect(() => {
    if (feedback !== null || syncingBkt) return;
    if (timeLeft <= 0) {
      advanceRef.current(null);
      return;
    }
    const id = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [timeLeft, feedback, syncingBkt]);

  const question = questions[qIdx];
  const timerPct = (timeLeft / QUESTION_TIMER_SEC) * 100;
  const timerColor = timeLeft > 10 ? '#3fbf7f' : timeLeft > 5 ? '#ffcf5c' : '#ff6363';
  const isLocked = feedback !== null || syncingBkt;

  const cardAccent =
    question.type === 'multiple_choice'
      ? '#5ac8ff'
      : question.type === 'spot_error'
        ? '#ffcf5c'
        : '#3fbf7f';

  return (
    <View style={styles.root}>
      <StatusBar hidden />
      {feedback && (
        <View
          pointerEvents="none"
          style={[
            styles.flash,
            {
              backgroundColor:
                feedback === 'correct' ? 'rgba(63,191,127,0.15)' : 'rgba(255,99,99,0.15)',
            },
          ]}
        />
      )}
      <SafeAreaView style={styles.headerSafe}>
        <View style={styles.header}>
          <View>
            <Text style={styles.phaseLbl}>THREAT ASSESSMENT</Text>
            <Text style={styles.moduleLbl}>
              {moduleName.toUpperCase()} - STAGE {stage}
            </Text>
            <Text style={styles.topicLbl}>SKILL: {question.topic}</Text>
          </View>
          <View style={styles.qPill}>
            <Text style={styles.qPillNum}>{qIdx + 1}</Text>
            <Text style={styles.qPillOf}> / {questions.length}</Text>
          </View>
        </View>
        <View style={styles.dotsRow}>
          {questions.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i < qIdx && styles.dotDone, i === qIdx && styles.dotCurrent]}
            />
          ))}
        </View>
      </SafeAreaView>

      {syncingBkt && (
        <View style={styles.syncRow}>
          <ActivityIndicator size="small" color="#5ac8ff" />
          <Text style={styles.syncText}>UPDATING BKT P(L)...</Text>
        </View>
      )}

      {feedback ? (
        <View
          pointerEvents="none"
          style={[
            styles.feedbackBadge,
            { borderColor: feedback === 'correct' ? '#3fbf7f' : '#ff6363' },
          ]}
        >
          <Text
            style={[
              styles.feedbackBadgeTxt,
              { color: feedback === 'correct' ? '#3fbf7f' : '#ff6363' },
            ]}
          >
            {feedbackMsg}
          </Text>
        </View>
      ) : null}

      <View style={styles.body}>
        <View style={styles.timerRow}>
          <View style={[styles.timerCircle, { borderColor: timerColor, shadowColor: timerColor }]}>
            <Text style={[styles.timerNum, { color: timerColor }]}>{timeLeft}</Text>
            <Text style={[styles.timerSec, { color: timerColor }]}>sec</Text>
          </View>
          <View style={styles.timerBarCol}>
            <View style={styles.timerBarTrack}>
              <View
                style={[
                  styles.timerBarFill,
                  { width: `${timerPct}%` as `${number}%`, backgroundColor: timerColor },
                ]}
              />
            </View>
            <Text style={[styles.timerLbl, { color: timerColor }]}>
              {timeLeft <= 5 ? 'HURRY UP!' : 'TIME REMAINING'}
            </Text>
          </View>
        </View>

        <View style={styles.cardWrap}>
          <View style={[styles.card, { borderColor: cardAccent, shadowColor: cardAccent }]}>
            <View
              style={[
                styles.cardTypePill,
                {
                  borderColor: cardAccent,
                  backgroundColor:
                    question.type === 'multiple_choice'
                      ? 'rgba(90,200,255,0.12)'
                      : question.type === 'spot_error'
                        ? 'rgba(255,207,92,0.12)'
                        : 'rgba(63,191,127,0.12)',
                },
              ]}
            >
              <Text style={[styles.cardTypeTxt, { color: cardAccent }]}>
                {question.type === 'multiple_choice'
                  ? 'MULTIPLE CHOICE'
                  : question.type === 'spot_error'
                    ? 'SPOT THE ERROR'
                    : 'TRUE / FALSE'}
              </Text>
            </View>
            <Text style={styles.cardText}>
              {question.type === 'spot_error'
                ? (question as SEQuestion).stem
                : (question as TFQuestion | MCQuestion).text}
            </Text>
          </View>
        </View>

        {question.type === 'true_false' && (
          <View style={styles.tfRow}>
            <TouchableOpacity
              style={[styles.tfBtn, styles.tfBtnTrue, isLocked && styles.btnLocked]}
              onPress={() => advanceRef.current(true)}
              disabled={isLocked}
              activeOpacity={0.6}
            >
              <Text style={styles.tfMark}>TRUE</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tfBtn, styles.tfBtnFalse, isLocked && styles.btnLocked]}
              onPress={() => advanceRef.current(false)}
              disabled={isLocked}
              activeOpacity={0.6}
            >
              <Text style={styles.tfMark}>FALSE</Text>
            </TouchableOpacity>
          </View>
        )}

        {question.type === 'multiple_choice' && (
          <View style={styles.mcGrid}>
            {(question as MCQuestion).options.map((opt, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.mcBtn, isLocked && styles.btnLocked]}
                onPress={() => advanceRef.current(i)}
                disabled={isLocked}
                activeOpacity={0.6}
              >
                <Text style={styles.mcLabel}>{opt}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {question.type === 'spot_error' && (
          <View style={styles.seList}>
            {(question as SEQuestion).items.map((item, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.seItem, isLocked && styles.btnLocked]}
                onPress={() => advanceRef.current(i)}
                disabled={isLocked}
                activeOpacity={0.6}
              >
                <Text style={styles.seIdx}>{String.fromCharCode(65 + i)}</Text>
                <Text style={styles.seText}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.footer}>
          <Text style={styles.footerHint}>
            Each answer updates BKT P(L) via assess_bkt · +{GOLD_PER_CORRECT_ANSWER}g per correct
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#080e1a' },
  flash: { ...StyleSheet.absoluteFillObject },
  headerSafe: { backgroundColor: '#0c1525', borderBottomWidth: 1, borderBottomColor: '#1e3050' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: normP(16),
    paddingTop: normP(8),
    paddingBottom: normP(6),
  },
  phaseLbl: { color: '#ffcf5c', fontFamily: 'PixelFont', fontSize: normP(12), letterSpacing: 1.5 },
  moduleLbl: { color: '#5a7aaa', fontFamily: 'PixelFont', fontSize: normP(8), marginTop: normP(2) },
  topicLbl: { color: '#5ac8ff', fontFamily: 'PixelFont', fontSize: normP(7), marginTop: normP(2) },
  qPill: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#0f1e35',
    borderWidth: 2,
    borderColor: '#1e3050',
    borderRadius: normP(8),
    paddingHorizontal: normP(10),
    paddingVertical: normP(4),
  },
  qPillNum: { color: '#fff', fontFamily: 'PixelFont', fontSize: normP(16) },
  qPillOf: { color: '#5a7aaa', fontFamily: 'PixelFont', fontSize: normP(11), marginBottom: normP(1) },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: normP(5),
    paddingVertical: normP(6),
    paddingHorizontal: normP(16),
  },
  dot: { width: normP(6), height: normP(6), borderRadius: normP(3), backgroundColor: '#1e3050' },
  dotDone: { backgroundColor: '#3fbf7f' },
  dotCurrent: { width: normP(16), backgroundColor: '#ffcf5c', borderRadius: normP(3) },
  syncRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: normP(8),
    paddingVertical: normP(6),
  },
  syncText: { color: '#5ac8ff', fontFamily: 'PixelFont', fontSize: normP(8), letterSpacing: 1 },
  feedbackBadge: {
    alignSelf: 'center',
    marginTop: normP(4),
    marginBottom: normP(4),
    borderWidth: 2,
    borderRadius: normP(10),
    paddingHorizontal: normP(14),
    paddingVertical: normP(6),
    backgroundColor: '#080e1a',
  },
  feedbackBadgeTxt: { fontFamily: 'PixelFont', fontSize: normP(12), letterSpacing: 1 },
  body: { flex: 1, paddingHorizontal: normP(14), paddingBottom: normP(12) },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: normP(16),
    paddingTop: normP(12),
    gap: normP(12),
  },
  timerCircle: {
    width: normP(56),
    height: normP(56),
    borderRadius: normP(28),
    borderWidth: normP(3),
    backgroundColor: '#0c1525',
    justifyContent: 'center',
    alignItems: 'center',
    shadowOpacity: 0.8,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
  timerNum: { fontFamily: 'PixelFont', fontSize: normP(20), lineHeight: normP(22) },
  timerSec: { fontFamily: 'PixelFont', fontSize: normP(8), marginTop: normP(-2) },
  timerBarCol: { flex: 1 },
  timerBarTrack: {
    height: normP(10),
    backgroundColor: '#1e3050',
    borderRadius: normP(5),
    overflow: 'hidden',
    marginBottom: normP(4),
  },
  timerBarFill: { height: '100%', borderRadius: normP(5) },
  timerLbl: { fontFamily: 'PixelFont', fontSize: normP(9), letterSpacing: 0.5 },
  cardWrap: { paddingHorizontal: normP(16), paddingTop: normP(8), paddingBottom: normP(6) },
  card: {
    backgroundColor: '#0f1e35',
    borderWidth: 2,
    borderRadius: normP(14),
    paddingVertical: normP(16),
    paddingHorizontal: normP(16),
    alignItems: 'center',
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
  cardTypePill: {
    borderWidth: 1,
    borderRadius: normP(14),
    paddingHorizontal: normP(10),
    paddingVertical: normP(3),
    marginBottom: normP(10),
  },
  cardTypeTxt: { fontFamily: 'PixelFont', fontSize: normP(9), letterSpacing: 2 },
  cardText: {
    color: '#e8f0ff',
    fontSize: normP(15),
    textAlign: 'center',
    lineHeight: normP(21),
    fontWeight: '500',
  },
  tfRow: {
    flexDirection: 'row',
    paddingHorizontal: normP(16),
    gap: normP(8),
    marginTop: normP(6),
    marginBottom: normP(6),
  },
  tfBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: normP(16),
    borderRadius: normP(12),
    borderWidth: 2,
    minHeight: normP(56),
  },
  tfBtnTrue: { backgroundColor: '#0d2218', borderColor: '#3fbf7f' },
  tfBtnFalse: { backgroundColor: '#220d10', borderColor: '#ff6363' },
  tfMark: { color: '#fff', fontFamily: 'PixelFont', fontSize: normP(16), letterSpacing: 2 },
  mcGrid: {
    paddingHorizontal: normP(16),
    gap: normP(6),
    marginTop: normP(6),
    marginBottom: normP(6),
  },
  mcBtn: {
    backgroundColor: '#0f1e35',
    borderWidth: 2,
    borderColor: '#5ac8ff',
    borderRadius: normP(10),
    paddingVertical: normP(13),
    paddingHorizontal: normP(14),
    alignItems: 'center',
    minHeight: normP(48),
    justifyContent: 'center',
  },
  mcLabel: { color: '#e8f0ff', fontSize: normP(13), textAlign: 'center', fontWeight: '500' },
  seList: {
    paddingHorizontal: normP(16),
    gap: normP(5),
    marginTop: normP(6),
    marginBottom: normP(6),
  },
  seItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f1e35',
    borderWidth: 2,
    borderColor: '#ffcf5c',
    borderRadius: normP(10),
    paddingVertical: normP(10),
    paddingHorizontal: normP(12),
    gap: normP(8),
    minHeight: normP(44),
  },
  seIdx: {
    color: '#ffcf5c',
    fontFamily: 'PixelFont',
    fontSize: normP(13),
    width: normP(18),
    textAlign: 'center',
  },
  seText: { flex: 1, color: '#e8f0ff', fontSize: normP(12), lineHeight: normP(16) },
  btnLocked: { opacity: 0.4 },
  footer: { alignItems: 'center', paddingTop: normP(8) },
  footerHint: { color: '#5a7aaa', fontFamily: 'PixelFont', fontSize: normP(8), textAlign: 'center' },
});
