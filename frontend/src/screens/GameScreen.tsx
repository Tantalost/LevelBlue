import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Dimensions,
  StatusBar,
  PixelRatio,
  Modal,
  PanResponder,
  LayoutChangeEvent,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { WAVES_PER_STAGE } from "./StageSelectScreen";

// Always use the LARGER dimension so landscape scaling is correct on phone
const { width: W, height: H } = Dimensions.get("window");
const LW = Math.max(W, H); // landscape width
const LH = Math.min(W, H); // landscape height

// Portrait-safe normalise: scale against BOTH width and height
// so nothing overflows on smaller/shorter screens
const PW = Math.min(W, H); // portrait width
const PH = Math.max(W, H); // portrait height (taller dimension)
const scaleByW = PW / 390;  // iPhone 14 Pro base width
const scaleByH = PH / 844;  // iPhone 14 Pro base height
// Use the smaller of the two so content always fits vertically AND horizontally
const scaleP = Math.min(scaleByW, scaleByH, 1.0);
const normP = (size: number) =>
  Math.round(PixelRatio.roundToNearestPixel(size * scaleP));

// Landscape normalise for gameplay board
const BASE_LANDSCAPE = 932;
const scaleL = LW / BASE_LANDSCAPE;
const normL = (size: number) =>
  Math.round(PixelRatio.roundToNearestPixel(size * scaleL));
const bw = (size: number) => Math.max(1, normL(size));

// ── Board constants ─────────────────────────────────────────────────────────
const BOARD_COLS = 8;
const BOARD_ROWS = 5;
const PATH_TILES = [
  { x: 0, y: 2 }, { x: 1, y: 2 }, { x: 2, y: 2 },
  { x: 3, y: 2 }, { x: 4, y: 2 }, { x: 5, y: 2 },
  { x: 6, y: 1 }, { x: 7, y: 1 },
];

type TowerType = "basic";
type Tile = { x: number; y: number };
type Enemy = { id: number; distance: number; hp: number; speed: number };
type Tower = { id: number; type: TowerType; x: number; y: number; cooldown: number };
type TowerBuffs = { damage: number; range: number; cooldown: number };
type BoardLayout = { x: number; y: number; width: number; height: number };
type Phase = "THREAT_ANALYSIS" | "RESULTS" | "THE_BREACH";

const towerStats: Record<TowerType, { cost: number; range: number; damage: number; cooldown: number }> = {
  basic: { cost: 25, range: 2.2, damage: 18, cooldown: 650 },
};

// ── Questions — three types: true_false | multiple_choice | spot_error ───────
type TFQuestion   = { id: number; type: "true_false";      text: string; answer: boolean };
type MCQuestion   = { id: number; type: "multiple_choice"; text: string; options: string[]; answer: number };
type SEQuestion   = { id: number; type: "spot_error";      stem: string; items: string[];   answer: number };
type AnyQuestion  = TFQuestion | MCQuestion | SEQuestion;

const QUESTIONS: AnyQuestion[] = [
  {
    id: 1, type: "true_false",
    text: "Social engineering relies heavily on human interaction.",
    answer: true,
  },
  {
    id: 2, type: "multiple_choice",
    text: "Which of the following is the STRONGEST password?",
    options: ["password123", "MyBirthday1990", "Tr!8#kL@mp99", "abc123"],
    answer: 2, // Tr!8#kL@mp99
  },
  {
    id: 3, type: "spot_error",
    stem: "Spot the INCORRECT statement about phishing:",
    items: [
      "Phishing emails often impersonate trusted brands.",
      "Hovering over a link reveals its true destination.",
      "Phishing only happens through email, never SMS.",
      "Poor grammar can be a sign of a phishing attempt.",
    ],
    answer: 2, // "only through email" is wrong — smishing exists
  },
  {
    id: 4, type: "true_false",
    text: "Public Wi-Fi networks are always secure for online banking.",
    answer: false,
  },
  {
    id: 5, type: "multiple_choice",
    text: "What does MFA stand for in cybersecurity?",
    options: [
      "Managed Firewall Access",
      "Multi-Factor Authentication",
      "Malware Filter Algorithm",
      "Multiple File Archive",
    ],
    answer: 1,
  },
  {
    id: 6, type: "spot_error",
    stem: "Spot the INCORRECT statement about passwords:",
    items: [
      "Use a unique password for each account.",
      "Longer passwords are generally stronger.",
      "Writing passwords in a notebook is always safe.",
      "A password manager helps store credentials securely.",
    ],
    answer: 2, // writing in notebook is risky
  },
  {
    id: 7, type: "true_false",
    text: "Malware can be hidden in seemingly harmless file downloads.",
    answer: true,
  },
  {
    id: 8, type: "multiple_choice",
    text: "Which action BEST protects against ransomware?",
    options: [
      "Open all email attachments to check them",
      "Keep regular offline backups of your data",
      "Disable your firewall for faster speeds",
      "Use the same password everywhere",
    ],
    answer: 1,
  },
  {
    id: 9, type: "spot_error",
    stem: "Spot the INCORRECT statement about software updates:",
    items: [
      "Updates often patch known security vulnerabilities.",
      "Delaying updates keeps your system more stable.",
      "Automatic updates reduce the risk of missing patches.",
      "Outdated software is a common attack entry point.",
    ],
    answer: 1, // delaying updates is NOT safer
  },
  {
    id: 10, type: "true_false",
    text: "Using the same password across multiple sites is a best practice.",
    answer: false,
  },
];

// ── Phase 2: Threat Analysis ─────────────────────────────────────────────────
function ThreatAnalysisScreen({
  onComplete,
}: {
  onComplete: (correct: number, answers: boolean[]) => void;
}) {
  // All mutable quiz state in refs — zero stale-closure risk
  const qIdxRef       = useRef(0);
  const correctRef    = useRef(0);
  const logRef        = useRef<boolean[]>([]);
  const lockedRef     = useRef(false); // prevent double-fire

  // UI state
  const [qIdx,        setQIdx]        = useState(0);
  const [timeLeft,    setTimeLeft]    = useState(20);
  const [feedback,    setFeedback]    = useState<"correct" | "wrong" | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState("");

  // ── Central advance function stored in a ref — never goes stale ──
  const advanceRef = useRef((answerIndex: number | boolean | null) => {
    if (lockedRef.current) return;
    lockedRef.current = true;

    const q = QUESTIONS[qIdxRef.current];
    let isCorrect = false;

    if (answerIndex === null) {
      isCorrect = false; // timeout
    } else if (q.type === "true_false") {
      isCorrect = (answerIndex as boolean) === q.answer;
    } else if (q.type === "multiple_choice") {
      isCorrect = (answerIndex as number) === q.answer;
    } else if (q.type === "spot_error") {
      isCorrect = (answerIndex as number) === q.answer;
    }

    correctRef.current += isCorrect ? 1 : 0;
    logRef.current = [...logRef.current, isCorrect];

    console.log(`[BKT] Q${q.id} type=${q.type} correct=${isCorrect} timeout=${answerIndex === null}`);

    setFeedback(isCorrect ? "correct" : "wrong");
    setFeedbackMsg(
      answerIndex === null ? "⏱  Time's Up!" :
      isCorrect            ? "✓  Correct! +15 Gold" :
                             "✗  Incorrect"
    );

    setTimeout(() => {
      const next = qIdxRef.current + 1;
      if (next < QUESTIONS.length) {
        qIdxRef.current = next;
        setQIdx(next);
        setTimeLeft(20);
        setFeedback(null);
        setFeedbackMsg("");
        lockedRef.current = false;
      } else {
        onComplete(correctRef.current, logRef.current);
      }
    }, 700);
  });

  // ── Countdown — uses setTimeout (not setInterval) to avoid drift ──
  useEffect(() => {
    if (feedback !== null) return; // freeze while showing result
    if (timeLeft <= 0) { advanceRef.current(null); return; }
    const id = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [timeLeft, feedback]);

  const q          = QUESTIONS[qIdx];
  const timerPct   = (timeLeft / 20) * 100;
  const timerColor = timeLeft > 10 ? "#3fbf7f" : timeLeft > 5 ? "#ffcf5c" : "#ff6363";
  const isLocked   = feedback !== null;

  return (
    <View style={qaStyles.root}>
      <StatusBar hidden />

      {/* Flash tint — behind everything */}
      {feedback && (
        <View
          pointerEvents="none"
          style={[
            qaStyles.flashOverlay,
            { backgroundColor: feedback === "correct" ? "rgba(63,191,127,0.15)" : "rgba(255,99,99,0.15)" },
          ]}
        />
      )}

      {/* ── FIXED HEADER ── */}
      <SafeAreaView style={qaStyles.headerSafe}>
        <View style={qaStyles.header}>
          <View>
            <Text style={qaStyles.phaseLbl}>⚡ THREAT ANALYSIS</Text>
            <Text style={qaStyles.moduleLbl}>MODULE 1  ·  STAGE 1</Text>
          </View>
          <View style={qaStyles.qPill}>
            <Text style={qaStyles.qPillNum}>{qIdx + 1}</Text>
            <Text style={qaStyles.qPillOf}> / {QUESTIONS.length}</Text>
          </View>
        </View>
        <View style={qaStyles.dotsRow}>
          {QUESTIONS.map((_, i) => (
            <View
              key={i}
              style={[qaStyles.dot, i < qIdx && qaStyles.dotDone, i === qIdx && qaStyles.dotCurrent]}
            />
          ))}
        </View>
      </SafeAreaView>

      {/* Feedback badge just below header — in normal flow so nothing overlaps */}
      {feedback ? (
        <View
          pointerEvents="none"
          style={[qaStyles.feedbackBadge, { borderColor: feedback === "correct" ? "#3fbf7f" : "#ff6363" }]}
        >
          <Text style={[qaStyles.feedbackBadgeTxt, { color: feedback === "correct" ? "#3fbf7f" : "#ff6363" }]}>
            {feedbackMsg}
          </Text>
        </View>
      ) : null}

      {/* ── SCROLLABLE BODY ── */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={qaStyles.scrollContent}
        scrollEnabled
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="always"
      >
        {/* Timer */}
        <View style={qaStyles.timerRow}>
          <View style={[qaStyles.timerCircle, { borderColor: timerColor, shadowColor: timerColor }]}>
            <Text style={[qaStyles.timerNum, { color: timerColor }]}>{timeLeft}</Text>
            <Text style={[qaStyles.timerSec, { color: timerColor }]}>sec</Text>
          </View>
          <View style={qaStyles.timerBarCol}>
            <View style={qaStyles.timerBarTrack}>
              <View style={[qaStyles.timerBarFill, { width: `${timerPct}%`, backgroundColor: timerColor }]} />
            </View>
            <Text style={[qaStyles.timerLbl, { color: timerColor }]}>
              {timeLeft <= 5 ? "⚠  HURRY UP!" : "TIME REMAINING"}
            </Text>
          </View>
        </View>

        {/* Question card */}
        <View style={qaStyles.cardWrap}>
          <View style={qaStyles.card}>
            <View style={[qaStyles.cardTypePill, {
              backgroundColor:
                q.type === "multiple_choice" ? "rgba(90,200,255,0.12)" :
                q.type === "spot_error"      ? "rgba(255,207,92,0.12)" :
                                               "rgba(63,191,127,0.12)",
              borderColor:
                q.type === "multiple_choice" ? "#5ac8ff" :
                q.type === "spot_error"      ? "#ffcf5c" :
                                               "#3fbf7f",
            }]}>
              <Text style={[qaStyles.cardTypeTxt, {
                color:
                  q.type === "multiple_choice" ? "#5ac8ff" :
                  q.type === "spot_error"      ? "#ffcf5c" :
                                                 "#3fbf7f",
              }]}>
                {q.type === "multiple_choice" ? "MULTIPLE CHOICE" :
                 q.type === "spot_error"      ? "SPOT THE ERROR"  :
                                                "TRUE / FALSE"}
              </Text>
            </View>
            <Text style={qaStyles.cardText}>
              {q.type === "spot_error" ? q.stem : q.text}
            </Text>
          </View>
        </View>

        {/* Answer area */}
        {q.type === "true_false" && (
          <View style={qaStyles.tfRow}>
            <Pressable
              style={({ pressed }) => [qaStyles.tfBtn, qaStyles.tfBtnTrue, pressed && { opacity: 0.7 }, isLocked && qaStyles.btnLocked]}
              onPress={() => !isLocked && advanceRef.current(true)}
            >
              <Text style={qaStyles.tfMark}>✓</Text>
              <Text style={qaStyles.tfLabel}>TRUE</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [qaStyles.tfBtn, qaStyles.tfBtnFalse, pressed && { opacity: 0.7 }, isLocked && qaStyles.btnLocked]}
              onPress={() => !isLocked && advanceRef.current(false)}
            >
              <Text style={qaStyles.tfMark}>✗</Text>
              <Text style={qaStyles.tfLabel}>FALSE</Text>
            </Pressable>
          </View>
        )}

        {q.type === "multiple_choice" && (
          <View style={qaStyles.mcGrid}>
            {q.options.map((opt, i) => (
              <Pressable
                key={i}
                style={({ pressed }) => [qaStyles.mcBtn, pressed && { opacity: 0.7 }, isLocked && qaStyles.btnLocked]}
                onPress={() => !isLocked && advanceRef.current(i)}
              >
                <Text style={qaStyles.mcLabel}>{opt}</Text>
              </Pressable>
            ))}
          </View>
        )}

        {q.type === "spot_error" && (
          <View style={qaStyles.seList}>
            {q.items.map((item, i) => (
              <Pressable
                key={i}
                style={({ pressed }) => [qaStyles.seItem, pressed && { opacity: 0.7 }, isLocked && qaStyles.btnLocked]}
                onPress={() => !isLocked && advanceRef.current(i)}
              >
                <Text style={qaStyles.seIdx}>{String.fromCharCode(65 + i)}</Text>
                <Text style={qaStyles.seText}>{item}</Text>
              </Pressable>
            ))}
          </View>
        )}

        {/* Footer */}
        <View style={qaStyles.footer}>
          <Text style={qaStyles.footerHint}>
            🪙 Each correct answer = <Text style={{ color: "#ffcf5c" }}>+15 Gold</Text>
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}


// ── Phase Results ────────────────────────────────────────────────────────────
function ResultsScreen({
  correctCount,
  totalGold,
  onContinue,
}: {
  correctCount: number;
  totalGold: number;
  onContinue: () => void;
}) {
  const bonusTier =
    correctCount >= 8 ? "S" : correctCount >= 6 ? "A" : correctCount >= 4 ? "B" : correctCount >= 2 ? "C" : "D";
  const tierColor = { S: "#ffcf5c", A: "#3fbf7f", B: "#5ac8ff", C: "#c87fff", D: "#ff6363" }[bonusTier];

  return (
    <View style={resStyles.root}>
      <StatusBar hidden />
      <SafeAreaView style={resStyles.safe}>
        <Text style={resStyles.title}>ANALYSIS COMPLETE</Text>
        <Text style={resStyles.subtitle}>Threat Intelligence Report</Text>

        {/* Score badge */}
        <View style={[resStyles.gradeBadge, { borderColor: tierColor, shadowColor: tierColor }]}>
          <Text style={[resStyles.gradeText, { color: tierColor }]}>{bonusTier}</Text>
          <Text style={resStyles.gradeScore}>{correctCount} / {QUESTIONS.length}</Text>
        </View>

        {/* Rewards */}
        <View style={resStyles.rewardsCard}>
          <Text style={resStyles.rewardsTitle}>DEPLOYMENT REWARDS</Text>

          <View style={resStyles.rewardRow}>
            <Text style={resStyles.rewardIcon}>🪙</Text>
            <View style={resStyles.rewardInfo}>
              <Text style={resStyles.rewardLabel}>Starting Gold Bonus</Text>
              <Text style={resStyles.rewardValue}>+{totalGold} Gold</Text>
            </View>
            <View style={[resStyles.rewardBadge, { backgroundColor: "#2a1800" }]}>
              <Text style={[resStyles.rewardBadgeText, { color: "#ffcf5c" }]}>{correctCount} ✓</Text>
            </View>
          </View>

          <View style={resStyles.divider} />

          <View style={resStyles.rewardRow}>
            <Text style={resStyles.rewardIcon}>🔧</Text>
            <View style={resStyles.rewardInfo}>
              <Text style={resStyles.rewardLabel}>Base Materials</Text>
              <Text style={resStyles.rewardValue}>+0 Materials</Text>
            </View>
            <View style={[resStyles.rewardBadge, { backgroundColor: "#0a1a12" }]}>
              <Text style={[resStyles.rewardBadgeText, { color: "#3fbf7f" }]}>Win Stage</Text>
            </View>
          </View>
        </View>

        {/* Strategy tip */}
        <View style={resStyles.tipBox}>
          <Text style={resStyles.tipIcon}>⚡</Text>
          <Text style={resStyles.tipText}>
            You earned <Text style={{ color: "#ffcf5c", fontFamily: "PixelFont" }}>{totalGold}g</Text> to deploy towers. Place them wisely — passive kill gold alone won't stop the breach.
          </Text>
        </View>

        <TouchableOpacity style={resStyles.continueBtn} onPress={onContinue} activeOpacity={0.85}>
          <Text style={resStyles.continueBtnText}>BEGIN BREACH  ▶</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
}

// ── Phase 3: The Breach (Gameplay) ───────────────────────────────────────────
function BreachScreen({
  startingGold,
  currentStage,
  highestUnlockedStage,
  towerBuffs,
  navigation,
}: {
  startingGold: number;
  currentStage: number;
  highestUnlockedStage: number;
  towerBuffs: TowerBuffs;
  navigation: any;
}) {
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [stageCleared, setStageCleared] = useState(false);
  const [gold, setGold] = useState(startingGold);
  const [baseHealth, setBaseHealth] = useState(1);
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [towers, setTowers] = useState<Tower[]>([]);
  const [waveCount, setWaveCount] = useState(currentStage);
  const [message, setMessage] = useState(`Deploy towers to survive! Gold: ${startingGold}`);
  const [selectedTowerType, setSelectedTowerType] = useState<TowerType | null>(null);
  const [draggingTower, setDraggingTower] = useState<{ type: TowerType; x: number; y: number } | null>(null);
  const [boardLayout, setBoardLayout] = useState<BoardLayout | null>(null);

  const goldRef = useRef(startingGold);
  const baseHealthRef = useRef(1);
  const enemiesRef = useRef<Enemy[]>([]);
  const towersRef = useRef<Tower[]>([]);
  const enemyIdRef = useRef(1);
  const towerIdRef = useRef(1);
  const spawnTimerRef = useRef(0);
  const waveSpawnedRef = useRef(0);
  const waveCountRef = useRef(currentStage);
  const selectedTowerTypeRef = useRef<TowerType | null>(null);
  const boardLayoutRef = useRef<BoardLayout | null>(null);
  const towerBuffsRef = useRef(towerBuffs);

  useEffect(() => { goldRef.current = gold; }, [gold]);
  useEffect(() => { baseHealthRef.current = baseHealth; }, [baseHealth]);
  useEffect(() => { enemiesRef.current = enemies; }, [enemies]);
  useEffect(() => { towersRef.current = towers; }, [towers]);
  useEffect(() => { waveCountRef.current = waveCount; }, [waveCount]);
  useEffect(() => { selectedTowerTypeRef.current = selectedTowerType; }, [selectedTowerType]);

  // Use landscape width for tile size
  const tileSize = useMemo(() => {
    const targetBoardW = LW * 0.6; // 60% of landscape width
    return Math.floor(targetBoardW / BOARD_COLS);
  }, []);

  const pathPoints = useMemo(
    () => PATH_TILES.map((t) => ({ x: t.x * tileSize + tileSize / 2, y: t.y * tileSize + tileSize / 2 })),
    [tileSize]
  );

  const getPathPoint = (distance: number) => {
    if (distance <= 0) return pathPoints[0];
    let remaining = distance;
    for (let i = 0; i < pathPoints.length - 1; i++) {
      const seg = Math.hypot(pathPoints[i + 1].x - pathPoints[i].x, pathPoints[i + 1].y - pathPoints[i].y);
      if (remaining <= seg) {
        const t = remaining / seg;
        return { x: pathPoints[i].x + (pathPoints[i + 1].x - pathPoints[i].x) * t, y: pathPoints[i].y + (pathPoints[i + 1].y - pathPoints[i].y) * t };
      }
      remaining -= seg;
    }
    return pathPoints[pathPoints.length - 1];
  };

  const isValidPlacement = (tile: Tile) => {
    if (PATH_TILES.some((p) => p.x === tile.x && p.y === tile.y)) return false;
    const nearPath = PATH_TILES.some((p) => Math.abs(p.x - tile.x) + Math.abs(p.y - tile.y) <= 1);
    const occupied = towersRef.current.some((t) => t.x === tile.x && t.y === tile.y);
    return nearPath && !occupied;
  };

  const placeTower = (tile: Tile, type: TowerType) => {
    if (goldRef.current < towerStats[type].cost) { setMessage("Not enough gold!"); return; }
    if (!isValidPlacement(tile)) { setMessage("Place beside the path."); return; }
    const t: Tower = { id: towerIdRef.current++, type, x: tile.x, y: tile.y, cooldown: 0 };
    towersRef.current = [...towersRef.current, t];
    setTowers(towersRef.current);
    const ng = goldRef.current - towerStats[type].cost;
    goldRef.current = ng;
    setGold(ng);
    setMessage("Tower placed!");
  };

  const boardResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !!selectedTowerTypeRef.current,
      onMoveShouldSetPanResponder: () => !!selectedTowerTypeRef.current,
      onPanResponderGrant: (_, gs) => {
        const type = selectedTowerTypeRef.current;
        if (!type) return;
        setDraggingTower({ type, x: gs.x0, y: gs.y0 });
      },
      onPanResponderMove: (_, gs) => {
        if (!selectedTowerTypeRef.current) return;
        setDraggingTower({ type: selectedTowerTypeRef.current, x: gs.moveX, y: gs.moveY });
      },
      onPanResponderRelease: (_, gs) => {
        const type = selectedTowerTypeRef.current;
        const layout = boardLayoutRef.current;
        if (type && layout) {
          const col = Math.floor((gs.moveX - layout.x) / tileSize);
          const row = Math.floor((gs.moveY - layout.y) / tileSize);
          if (col >= 0 && col < BOARD_COLS && row >= 0 && row < BOARD_ROWS) {
            placeTower({ x: col, y: row }, type);
          }
        }
        setDraggingTower(null);
        setSelectedTowerType(null);
      },
      onPanResponderTerminate: () => { setDraggingTower(null); setSelectedTowerType(null); },
    })
  ).current;

  // Game loop
  useEffect(() => {
    if (!gameStarted || gameOver || stageCleared) return;
    const interval = setInterval(() => {
      spawnTimerRef.current += 100;
      const buffs = towerBuffsRef.current;

      let nextEnemies = enemiesRef.current.map((e) => ({ ...e, distance: e.distance + e.speed }));
      let nextTowers = towersRef.current.map((t) => ({ ...t, cooldown: Math.max(0, t.cooldown - 100) }));
      let nextBaseHp = baseHealthRef.current;
      let nextGold = goldRef.current;
      let nextWave = waveCountRef.current;

      nextEnemies = nextEnemies.filter((e) => {
        if (e.distance >= 300) { nextBaseHp -= 1; return false; }
        return true;
      });

      if (spawnTimerRef.current >= 900) {
        spawnTimerRef.current = 0;
        waveSpawnedRef.current += 1;
        nextEnemies.push({ id: enemyIdRef.current++, distance: 0, hp: 55, speed: 1.5 });
        if (waveSpawnedRef.current >= 8) { nextWave += 1; waveSpawnedRef.current = 0; }
      }

      nextTowers.forEach((tower) => {
        if (tower.cooldown > 0) return;
        const eff = {
          damage: towerStats[tower.type].damage + buffs.damage,
          range: (towerStats[tower.type].range + buffs.range) * tileSize,
          cooldown: Math.max(100, towerStats[tower.type].cooldown - buffs.cooldown),
        };
        const target = [...nextEnemies].sort((a, b) => b.distance - a.distance).find((e) => {
          const p = getPathPoint(e.distance);
          return Math.hypot(p.x - (tower.x * tileSize + tileSize / 2), p.y - (tower.y * tileSize + tileSize / 2)) <= eff.range;
        });
        if (target) {
          nextEnemies = nextEnemies.map((e) => e.id === target.id ? { ...e, hp: e.hp - eff.damage } : e);
          const killed = nextEnemies.filter((e) => e.hp <= 0).length;
          nextGold += 5 * killed;
          nextEnemies = nextEnemies.filter((e) => e.hp > 0);
          tower.cooldown = eff.cooldown;
        }
      });

      if (nextBaseHp <= 0) {
        setGameOver(true); setGameStarted(false); setMessage("Base destroyed!");
      } else if (nextEnemies.length === 0 && waveSpawnedRef.current === 0 && nextWave > WAVES_PER_STAGE) {
        setStageCleared(true); setGameStarted(false); setMessage("Stage Cleared! +50 Materials");
      } else {
        setMessage(`Wave ${nextWave} · Gold: ${Math.floor(nextGold)}`);
      }

      baseHealthRef.current = nextBaseHp;
      goldRef.current = nextGold;
      setBaseHealth(nextBaseHp);
      setGold(Math.floor(nextGold));
      setEnemies(nextEnemies);
      setTowers(nextTowers);
      setWaveCount(nextWave);
    }, 100);
    return () => clearInterval(interval);
  }, [gameStarted, gameOver, stageCleared, tileSize]);

  const boardW = tileSize * BOARD_COLS;
  const boardH = tileSize * BOARD_ROWS;

  const hoveredTile = useMemo(() => {
    if (!draggingTower || !boardLayout) return null;
    const col = Math.floor((draggingTower.x - boardLayout.x) / tileSize);
    const row = Math.floor((draggingTower.y - boardLayout.y) / tileSize);
    if (col < 0 || col >= BOARD_COLS || row < 0 || row >= BOARD_ROWS) return null;
    return { x: col, y: row, valid: isValidPlacement({ x: col, y: row }) };
  }, [draggingTower, boardLayout, tileSize]);

  return (
    <View style={bsStyles.root}>
      <StatusBar hidden />

      {/* ── TOP HUD ── */}
      <SafeAreaView edges={["top"]} style={bsStyles.hudTop}>
        <View style={bsStyles.hudRow}>
          {/* Left: Resources */}
          <View style={bsStyles.hudGroup}>
            <Text style={bsStyles.hudGroupLabel}>RESOURCES</Text>
            <View style={bsStyles.hudGroupRow}>
              <Text style={bsStyles.hudStat}>🪙 {gold}</Text>
              <Text style={bsStyles.hudStat}>❤️ {baseHealth}</Text>
              <Text style={bsStyles.hudStat}>👾 {enemies.length}</Text>
            </View>
          </View>

          {/* Center: Wave bar */}
          <View style={bsStyles.hudCenter}>
            <View style={bsStyles.waveBarTrack}>
              <View style={[bsStyles.waveBarFill, { width: `${Math.min(100, (waveCount / WAVES_PER_STAGE) * 100)}%` }]} />
            </View>
            <Text style={bsStyles.waveLabel}>WAVE {waveCount} / {WAVES_PER_STAGE}</Text>
          </View>

          {/* Right: Stage + Settings */}
          <View style={bsStyles.hudRight}>
            <View style={bsStyles.stagePill}>
              <Text style={bsStyles.stagePillText}>STG {currentStage}</Text>
            </View>
            <TouchableOpacity onPress={() => setIsMenuVisible(true)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={bsStyles.cogIcon}>⚙️</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      {/* ── BOARD ── */}
      <View style={bsStyles.boardArea}>
        <View
          style={[bsStyles.board, { width: boardW, height: boardH }]}
          onLayout={(e: LayoutChangeEvent) => {
            const l = e.nativeEvent.layout;
            boardLayoutRef.current = l;
            setBoardLayout(l);
          }}
          {...boardResponder.panHandlers}
        >
          {Array.from({ length: BOARD_ROWS }, (_, row) =>
            Array.from({ length: BOARD_COLS }, (_, col) => {
              const isPath = PATH_TILES.some((t) => t.x === col && t.y === row);
              const isBase = col === BOARD_COLS - 1 && row === PATH_TILES[PATH_TILES.length - 1].y;
              return (
                <View
                  key={`${row}-${col}`}
                  style={[
                    bsStyles.tile,
                    { left: col * tileSize, top: row * tileSize, width: tileSize, height: tileSize },
                    isBase ? bsStyles.baseTile : isPath ? bsStyles.pathTile : bsStyles.groundTile,
                  ]}
                />
              );
            })
          )}

          {hoveredTile && (
            <View
              pointerEvents="none"
              style={[
                bsStyles.hoverTile,
                hoveredTile.valid ? bsStyles.hoverValid : bsStyles.hoverInvalid,
                { left: hoveredTile.x * tileSize, top: hoveredTile.y * tileSize, width: tileSize, height: tileSize },
              ]}
            />
          )}

          {towers.map((t) => (
            <View
              key={t.id}
              style={[bsStyles.tower, { left: t.x * tileSize + tileSize * 0.1, top: t.y * tileSize + tileSize * 0.1, width: tileSize * 0.8, height: tileSize * 0.8 }]}
            >
              <Text style={{ fontSize: tileSize * 0.55 }}>🛡️</Text>
            </View>
          ))}

          {enemies.map((e) => {
            const p = getPathPoint(e.distance);
            return (
              <View key={e.id} style={[bsStyles.enemy, { left: p.x - tileSize * 0.35, top: p.y - tileSize * 0.35, width: tileSize * 0.7, height: tileSize * 0.7 }]}>
                <Text style={{ fontSize: tileSize * 0.45 }}>👾</Text>
              </View>
            );
          })}

          {draggingTower && boardLayout && (
            <View
              pointerEvents="none"
              style={[bsStyles.ghostTower, { left: draggingTower.x - boardLayout.x - tileSize * 0.4, top: draggingTower.y - boardLayout.y - tileSize * 0.4, width: tileSize * 0.8, height: tileSize * 0.8 }]}
            >
              <Text style={{ fontSize: tileSize * 0.55 }}>🛡️</Text>
            </View>
          )}

          {/* Game Over */}
          {gameOver && (
            <View style={bsStyles.endOverlay}>
              <View style={[bsStyles.endPanel, { borderColor: "#ff6363" }]}>
                <Text style={[bsStyles.endTitle, { color: "#ff6363" }]}>BASE DESTROYED</Text>
                <Text style={bsStyles.endSub}>Your defense was overwhelmed.</Text>
                <TouchableOpacity style={[bsStyles.endBtn, { borderColor: "#ff6363" }]} onPress={() => navigation.navigate("Dashboard")}>
                  <Text style={bsStyles.endBtnText}>← DASHBOARD</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Stage Cleared */}
          {stageCleared && (
            <View style={bsStyles.endOverlay}>
              <View style={[bsStyles.endPanel, { borderColor: "#3fbf7f" }]}>
                <Text style={[bsStyles.endTitle, { color: "#3fbf7f" }]}>STAGE CLEARED!</Text>
                <Text style={bsStyles.endSub}>+50 Materials awarded. Threat contained.</Text>
                <TouchableOpacity style={[bsStyles.endBtn, { borderColor: "#3fbf7f" }]} onPress={() => navigation.navigate("Dashboard")}>
                  <Text style={bsStyles.endBtnText}>← DASHBOARD</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </View>

      {/* ── BOTTOM HUD ── */}
      <SafeAreaView edges={["bottom"]} style={bsStyles.hudBottom}>
        <Text style={bsStyles.msgText}>{message}</Text>
        <View style={bsStyles.deckRow}>
          {/* Tower card */}
          <TouchableOpacity
            style={[bsStyles.card, selectedTowerType === "basic" && bsStyles.cardSelected]}
            onPress={() => {
              if (selectedTowerType === "basic") { setSelectedTowerType(null); return; }
              if (goldRef.current < towerStats.basic.cost) { setMessage("Not enough gold!"); return; }
              setSelectedTowerType("basic");
            }}
          >
            <Text style={bsStyles.cardEmoji}>🛡️</Text>
            <Text style={bsStyles.cardCost}>25g</Text>
          </TouchableOpacity>

          {/* Start / Pause */}
          <TouchableOpacity
            style={[bsStyles.startBtn, (gameOver || stageCleared) && bsStyles.startBtnDisabled]}
            disabled={gameOver || stageCleared}
            onPress={() => setGameStarted((p) => !p)}
          >
            <Text style={bsStyles.startBtnText}>{gameStarted ? "⏸  PAUSE" : "▶  START BREACH"}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Pause menu */}
      <Modal visible={isMenuVisible} transparent animationType="fade" supportedOrientations={["portrait", "landscape"]}>
        <View style={bsStyles.menuOverlay}>
          <View style={bsStyles.menuBox}>
            <Text style={bsStyles.menuTitle}>PAUSED</Text>
            <TouchableOpacity style={bsStyles.menuItem} onPress={() => setIsMenuVisible(false)}>
              <Text style={bsStyles.menuItemText}>RESUME</Text>
            </TouchableOpacity>
            <TouchableOpacity style={bsStyles.menuItem} onPress={() => navigation.navigate("Dashboard")}>
              <Text style={bsStyles.menuItemText}>DASHBOARD</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ── Root GameScreen (Phase Router) ───────────────────────────────────────────
export default function GameScreen({ route, navigation }: any) {
  const initialStage = route?.params?.stage ?? 1;
  const [phase, setPhase] = useState<Phase>("THREAT_ANALYSIS");
  const [correctCount, setCorrectCount] = useState(0);
  const [startingGold, setStartingGold] = useState(0);
  const [towerBuffs] = useState<TowerBuffs>({ damage: 0, range: 0, cooldown: 0 });
  const [highestUnlockedStage] = useState(1);

  const handleQuizComplete = useCallback((correct: number, _answers: boolean[]) => {
    const gold = correct * 15;
    setCorrectCount(correct);
    setStartingGold(gold);
    setPhase("RESULTS");
  }, []);

  const handleResultsContinue = useCallback(() => {
    setPhase("THE_BREACH");
  }, []);

  if (phase === "THREAT_ANALYSIS") {
    return <ThreatAnalysisScreen onComplete={handleQuizComplete} />;
  }
  if (phase === "RESULTS") {
    return <ResultsScreen correctCount={correctCount} totalGold={startingGold} onContinue={handleResultsContinue} />;
  }
  return (
    <BreachScreen
      startingGold={startingGold}
      currentStage={initialStage}
      highestUnlockedStage={highestUnlockedStage}
      towerBuffs={towerBuffs}
      navigation={navigation}
    />
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Stylesheets
// ────────────────────────────────────────────────────────────────────────────

const qaStyles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#080e1a",
  },
  scrollContent: {
    paddingBottom: normP(16),
  },
  flashOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 99,
  },
  feedbackBadge: {
    alignSelf: "center",
    marginTop: normP(6),
    marginBottom: normP(6),
    borderWidth: 2,
    borderRadius: normP(12),
    paddingHorizontal: normP(20),
    paddingVertical: normP(8),
    backgroundColor: "#080e1a",
  },
  feedbackBadgeTxt: {
    fontFamily: "PixelFont",
    fontSize: normP(14),
    letterSpacing: 1,
  },

  // Header
  headerSafe: {
    backgroundColor: "#0c1525",
    borderBottomWidth: 1,
    borderBottomColor: "#1e3050",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: normP(20),
    paddingTop: normP(14),
    paddingBottom: normP(10),
  },
  phaseLbl: {
    color: "#ffcf5c",
    fontFamily: "PixelFont",
    fontSize: normP(15),
    letterSpacing: 2,
  },
  moduleLbl: {
    color: "#5a7aaa",
    fontFamily: "PixelFont",
    fontSize: normP(10),
    marginTop: normP(3),
  },
  qPill: {
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: "#0f1e35",
    borderWidth: 2,
    borderColor: "#1e3050",
    borderRadius: normP(10),
    paddingHorizontal: normP(14),
    paddingVertical: normP(6),
  },
  qPillNum: {
    color: "#fff",
    fontFamily: "PixelFont",
    fontSize: normP(22),
  },
  qPillOf: {
    color: "#5a7aaa",
    fontFamily: "PixelFont",
    fontSize: normP(14),
    marginBottom: normP(2),
  },

  // Progress dots
  dotsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: normP(6),
    paddingVertical: normP(8),
    paddingHorizontal: normP(20),
  },
  dot: {
    width: normP(8),
    height: normP(8),
    borderRadius: normP(4),
    backgroundColor: "#1e3050",
  },
  dotDone: {
    backgroundColor: "#3fbf7f",
  },
  dotCurrent: {
    width: normP(20),
    backgroundColor: "#ffcf5c",
    borderRadius: normP(4),
  },

  // Timer
  timerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: normP(20),
    paddingTop: normP(20),
    gap: normP(16),
  },
  timerCircle: {
    width: normP(80),
    height: normP(80),
    borderRadius: normP(40),
    borderWidth: normP(4),
    backgroundColor: "#0c1525",
    justifyContent: "center",
    alignItems: "center",
    shadowOpacity: 0.8,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
  },
  timerNum: {
    fontFamily: "PixelFont",
    fontSize: normP(30),
    lineHeight: normP(34),
  },
  timerSec: {
    fontFamily: "PixelFont",
    fontSize: normP(10),
    letterSpacing: 1,
    marginTop: normP(-2),
  },
  timerBarCol: {
    flex: 1,
  },
  timerBarTrack: {
    height: normP(14),
    backgroundColor: "#1e3050",
    borderRadius: normP(7),
    overflow: "hidden",
    marginBottom: normP(6),
  },
  timerBarFill: {
    height: "100%",
    borderRadius: normP(7),
  },
  timerLbl: {
    fontFamily: "PixelFont",
    fontSize: normP(10),
    letterSpacing: 1,
  },

  // Question card
  cardWrap: {
    paddingHorizontal: normP(20),
    paddingTop: normP(12),
    paddingBottom: normP(8),
  },
  card: {
    backgroundColor: "#0f1e35",
    borderWidth: 2,
    borderColor: "#5ac8ff",
    borderRadius: normP(20),
    paddingVertical: normP(30),
    paddingHorizontal: normP(24),
    alignItems: "center",
    shadowColor: "#5ac8ff",
    shadowOpacity: 0.35,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
  cardTypePill: {
    backgroundColor: "rgba(90,200,255,0.12)",
    borderWidth: 1,
    borderColor: "#5ac8ff",
    borderRadius: normP(20),
    paddingHorizontal: normP(14),
    paddingVertical: normP(4),
    marginBottom: normP(20),
  },
  cardTypeTxt: {
    color: "#5ac8ff",
    fontFamily: "PixelFont",
    fontSize: normP(10),
    letterSpacing: 3,
  },
  cardText: {
    color: "#e8f0ff",
    fontSize: normP(19),
    textAlign: "center",
    lineHeight: normP(29),
    fontWeight: "500",
  },

  // True/False
  tfRow: {
    flexDirection: "row",
    paddingHorizontal: normP(20),
    gap: normP(12),
    marginTop: normP(8),
    marginBottom: normP(8),
  },
  tfBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: normP(10),
    paddingVertical: normP(22),
    borderRadius: normP(16),
    borderWidth: 2,
    minHeight: normP(64),
  },
  tfBtnTrue: {
    backgroundColor: "#0d2218",
    borderColor: "#3fbf7f",
  },
  tfBtnFalse: {
    backgroundColor: "#220d10",
    borderColor: "#ff6363",
  },
  tfMark: {
    fontSize: normP(24),
    color: "#fff",
  },
  tfLabel: {
    color: "#fff",
    fontFamily: "PixelFont",
    fontSize: normP(20),
    letterSpacing: 3,
  },

  // Multiple Choice
  mcGrid: {
    paddingHorizontal: normP(20),
    gap: normP(10),
    marginTop: normP(8),
    marginBottom: normP(8),
  },
  mcBtn: {
    backgroundColor: "#0f1e35",
    borderWidth: 2,
    borderColor: "#5ac8ff",
    borderRadius: normP(14),
    paddingVertical: normP(16),
    paddingHorizontal: normP(20),
    alignItems: "center",
    minHeight: normP(54),
    justifyContent: "center",
  },
  mcLabel: {
    color: "#e8f0ff",
    fontSize: normP(15),
    textAlign: "center",
    fontWeight: "500",
  },

  // Spot the Error
  seList: {
    paddingHorizontal: normP(20),
    gap: normP(8),
    marginTop: normP(8),
    marginBottom: normP(8),
  },
  seItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0f1e35",
    borderWidth: 2,
    borderColor: "#ffcf5c",
    borderRadius: normP(14),
    paddingVertical: normP(13),
    paddingHorizontal: normP(16),
    gap: normP(12),
    minHeight: normP(52),
  },
  seIdx: {
    color: "#ffcf5c",
    fontFamily: "PixelFont",
    fontSize: normP(16),
    width: normP(22),
    textAlign: "center",
  },
  seText: {
    flex: 1,
    color: "#e8f0ff",
    fontSize: normP(13),
    lineHeight: normP(19),
  },

  // Shared locked state
  btnLocked: {
    opacity: 0.4,
  },

  // Footer
  footer: {
    alignItems: "center",
    paddingVertical: normP(12),
    paddingHorizontal: normP(20),
  },
  footerHint: {
    color: "#5a7aaa",
    fontSize: normP(12),
  },
});

const resStyles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#080e1a",
  },
  safe: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: normP(24),
    paddingVertical: normP(20),
  },
  title: {
    color: "#ffcf5c",
    fontFamily: "PixelFont",
    fontSize: normP(26),
    letterSpacing: 3,
    textAlign: "center",
  },
  subtitle: {
    color: "#5a7aaa",
    fontSize: normP(13),
    marginTop: normP(6),
    marginBottom: normP(28),
  },
  gradeBadge: {
    width: normP(110),
    height: normP(110),
    borderRadius: normP(55),
    borderWidth: normP(4),
    backgroundColor: "#0c1525",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: normP(28),
    shadowOpacity: 0.7,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 0 },
    elevation: 12,
  },
  gradeText: {
    fontFamily: "PixelFont",
    fontSize: normP(52),
    lineHeight: normP(60),
  },
  gradeScore: {
    color: "#8a9bc0",
    fontFamily: "PixelFont",
    fontSize: normP(13),
  },
  rewardsCard: {
    width: "100%",
    backgroundColor: "#0c1525",
    borderWidth: 2,
    borderColor: "#1e3050",
    borderRadius: normP(16),
    padding: normP(20),
    marginBottom: normP(16),
  },
  rewardsTitle: {
    color: "#5a7aaa",
    fontFamily: "PixelFont",
    fontSize: normP(10),
    letterSpacing: 2,
    marginBottom: normP(16),
  },
  rewardRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: normP(12),
  },
  rewardIcon: {
    fontSize: normP(28),
  },
  rewardInfo: {
    flex: 1,
  },
  rewardLabel: {
    color: "#8a9bc0",
    fontSize: normP(12),
  },
  rewardValue: {
    color: "#fff",
    fontFamily: "PixelFont",
    fontSize: normP(18),
    marginTop: normP(2),
  },
  rewardBadge: {
    paddingHorizontal: normP(10),
    paddingVertical: normP(5),
    borderRadius: normP(8),
  },
  rewardBadgeText: {
    fontFamily: "PixelFont",
    fontSize: normP(11),
  },
  divider: {
    height: 1,
    backgroundColor: "#1e3050",
    marginVertical: normP(14),
  },
  tipBox: {
    width: "100%",
    flexDirection: "row",
    alignItems: "flex-start",
    gap: normP(10),
    backgroundColor: "#0f1e35",
    borderRadius: normP(12),
    padding: normP(14),
    marginBottom: normP(24),
  },
  tipIcon: {
    fontSize: normP(18),
  },
  tipText: {
    flex: 1,
    color: "#8a9bc0",
    fontSize: normP(12),
    lineHeight: normP(18),
  },
  continueBtn: {
    width: "100%",
    backgroundColor: "#ffcf5c",
    borderRadius: normP(14),
    paddingVertical: normP(18),
    alignItems: "center",
  },
  continueBtnText: {
    color: "#080e1a",
    fontFamily: "PixelFont",
    fontSize: normP(17),
    letterSpacing: 2,
  },
});

const bsStyles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#05070d",
  },
  hudTop: {
    backgroundColor: "#0a0f1c",
    borderBottomWidth: 1,
    borderBottomColor: "#1e3050",
    paddingHorizontal: normL(16),
    paddingVertical: normL(8),
  },
  hudRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  hudGroup: {
    flex: 1,
  },
  hudGroupLabel: {
    color: "#5a7aaa",
    fontFamily: "PixelFont",
    fontSize: normL(8),
    letterSpacing: 1,
    marginBottom: normL(4),
  },
  hudGroupRow: {
    flexDirection: "row",
    gap: normL(10),
  },
  hudStat: {
    color: "#fff",
    fontFamily: "PixelFont",
    fontSize: normL(12),
  },
  hudCenter: {
    flex: 1,
    alignItems: "center",
  },
  waveBarTrack: {
    width: normL(160),
    height: normL(8),
    backgroundColor: "#1e3050",
    borderRadius: normL(4),
    overflow: "hidden",
    marginBottom: normL(4),
  },
  waveBarFill: {
    height: "100%",
    backgroundColor: "#3fbf7f",
    borderRadius: normL(4),
  },
  waveLabel: {
    color: "#5ac8ff",
    fontFamily: "PixelFont",
    fontSize: normL(9),
  },
  hudRight: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: normL(10),
  },
  stagePill: {
    backgroundColor: "#0f1e35",
    borderWidth: 1,
    borderColor: "#e8d5b5",
    borderRadius: normL(6),
    paddingHorizontal: normL(10),
    paddingVertical: normL(4),
  },
  stagePillText: {
    color: "#e8d5b5",
    fontFamily: "PixelFont",
    fontSize: normL(12),
  },
  cogIcon: {
    fontSize: normL(22),
  },

  boardArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: normL(8),
  },
  board: {
    backgroundColor: "#0f1a2e",
    borderWidth: 2,
    borderColor: "#1e3050",
    borderRadius: normL(8),
    overflow: "hidden",
    position: "relative",
  },
  tile: {
    position: "absolute",
    borderWidth: 1,
    borderColor: "#162130",
  },
  groundTile: { backgroundColor: "#111e30" },
  pathTile:   { backgroundColor: "#6e4a2c" },
  baseTile:   { backgroundColor: "#6e1a1a" },
  hoverTile: {
    position: "absolute",
    borderWidth: 2,
    zIndex: 5,
  },
  hoverValid:   { backgroundColor: "rgba(63,191,127,0.3)",  borderColor: "#3fbf7f" },
  hoverInvalid: { backgroundColor: "rgba(255,99,99,0.3)",   borderColor: "#ff6363" },
  tower: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1e3a5f",
    borderRadius: normL(6),
    borderWidth: 1,
    borderColor: "#5ac8ff",
    zIndex: 2,
  },
  enemy: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#5a0f22",
    borderRadius: normL(4),
    borderWidth: 1,
    borderColor: "#ff6363",
    zIndex: 3,
  },
  ghostTower: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1e3a5f",
    borderRadius: normL(6),
    borderWidth: 2,
    borderColor: "#5ac8ff",
    opacity: 0.7,
    zIndex: 10,
  },

  endOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.82)",
    zIndex: 20,
  },
  endPanel: {
    backgroundColor: "#080e1a",
    borderWidth: 2,
    borderRadius: normL(14),
    padding: normL(24),
    alignItems: "center",
    width: "70%",
  },
  endTitle: {
    fontFamily: "PixelFont",
    fontSize: normL(22),
    marginBottom: normL(8),
  },
  endSub: {
    color: "#8a9bc0",
    fontFamily: "PixelFont",
    fontSize: normL(10),
    textAlign: "center",
    marginBottom: normL(16),
  },
  endBtn: {
    borderWidth: 2,
    borderRadius: normL(8),
    paddingHorizontal: normL(20),
    paddingVertical: normL(10),
  },
  endBtnText: {
    color: "#fff",
    fontFamily: "PixelFont",
    fontSize: normL(12),
  },

  hudBottom: {
    backgroundColor: "#0a0f1c",
    borderTopWidth: 1,
    borderTopColor: "#1e3050",
    paddingHorizontal: normL(16),
    paddingTop: normL(10),
    paddingBottom: normL(8),
  },
  msgText: {
    color: "#5a7aaa",
    fontFamily: "PixelFont",
    fontSize: normL(9),
    marginBottom: normL(8),
    textAlign: "center",
  },
  deckRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: normL(12),
  },
  card: {
    width: normL(56),
    height: normL(64),
    backgroundColor: "#0f1e35",
    borderWidth: 2,
    borderColor: "#1e3050",
    borderRadius: normL(8),
    alignItems: "center",
    justifyContent: "center",
    gap: normL(4),
  },
  cardSelected: {
    borderColor: "#3fbf7f",
    shadowColor: "#3fbf7f",
    shadowOpacity: 0.8,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  },
  cardEmoji: { fontSize: normL(26) },
  cardCost: {
    color: "#ffcf5c",
    fontFamily: "PixelFont",
    fontSize: normL(9),
  },
  startBtn: {
    flex: 1,
    backgroundColor: "#0f2e1a",
    borderWidth: 2,
    borderColor: "#3fbf7f",
    borderRadius: normL(10),
    paddingVertical: normL(12),
    alignItems: "center",
  },
  startBtnDisabled: {
    opacity: 0.4,
  },
  startBtnText: {
    color: "#3fbf7f",
    fontFamily: "PixelFont",
    fontSize: normL(14),
    letterSpacing: 1,
  },

  menuOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.75)",
    justifyContent: "center",
    alignItems: "center",
  },
  menuBox: {
    backgroundColor: "#0c1525",
    borderWidth: 2,
    borderColor: "#1e3050",
    borderRadius: normP(16),
    padding: normP(28),
    width: normP(280),
    alignItems: "center",
  },
  menuTitle: {
    color: "#ffcf5c",
    fontFamily: "PixelFont",
    fontSize: normP(22),
    marginBottom: normP(20),
  },
  menuItem: {
    width: "100%",
    backgroundColor: "#0f1e35",
    borderWidth: 1,
    borderColor: "#1e3050",
    borderRadius: normP(10),
    paddingVertical: normP(14),
    alignItems: "center",
    marginBottom: normP(10),
  },
  menuItemText: {
    color: "#fff",
    fontFamily: "PixelFont",
    fontSize: normP(14),
  },
});