import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  useWindowDimensions,
  PixelRatio,
  Animated,
  PanResponder,
  StatusBar,
} from 'react-native';

/**
 * ── Mobile pass — what changed and why ──────────────────────────────────
 *
 * 1. THE BUG (why the progress bar + CTA were disappearing):
 *    `carouselWrap` used `alignItems: 'center'`. In a row container, that
 *    means children are sized by their OWN content, not stretched to fill
 *    the row's height. So the flex:1 card never got a real, definite
 *    height to lay out against — it just hugged its content, and on
 *    shorter/wider viewports that left no room for the progress bar and
 *    CTA, which then got clipped by the card's `overflow: hidden`.
 *    Fix: `alignItems: 'stretch'` on the row, `alignSelf: 'center'` on the
 *    arrows only. Now the card always gets the full available height.
 *
 * 2. LESS CHROME, MORE ROOM: dots + arrows + a full module strip were
 *    three controls doing the same job. Removed the dot row entirely —
 *    its job (which module am I on) now lives in a small "01/05" badge
 *    in the header, so the card reclaims that vertical space.
 *
 * 3. READABILITY FLOOR: the scale factor used to shrink freely on small
 *    screens. It's now clamped (0.85–1.15), so text never drops below a
 *    comfortable size — short screens get tighter *spacing*, not smaller
 *    *text*, which is what actually makes something feel "too tight."
 *
 * 4. GAME FEEL: swipe-to-navigate on the card itself, an animated
 *    progress fill, a soft pulsing glow on the CTA, and a colored HUD
 *    strip along the top of the card. Kept to a few deliberate touches
 *    rather than decorating everything.
 *
 * Note: two labels (the header title and the CTA) use PIXEL_FONT to match
 * the game's Press Start 2P branding — deliberately NOT applied to the
 * numeric badges or body copy, since blocky pixel type turns illegible at
 * small sizes. Swap the font name below if yours is registered differently.
 */

// ── Responsive scaling ───────────────────────────────────────────────────
const BASE_W = 390;
const BASE_H = 844;
const COMPACT_HEIGHT = 700; // shorter than this = tighter spacing, same font sizes
const PIXEL_FONT = 'PressStart2P-Regular';

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function useScale() {
  const { width, height } = useWindowDimensions();
  const scaleP = clamp(Math.min(width / BASE_W, height / BASE_H), 0.85, 1.15);
  const isCompact = height < COMPACT_HEIGHT;
  const s = (n: number) => Math.round(PixelRatio.roundToNearestPixel(n * scaleP));
  const bw = (n: number) => Math.max(1, s(n));
  const scaleKey = Math.round(scaleP * 100); // stable dep for useMemo
  return { s, bw, isCompact, scaleKey };
}

// ── Module Data ───────────────────────────────────────────────────────────────
export const MODULES = [
  {
    id: 1,
    title: 'Phishing & Email Threats',
    subtitle: 'Identify malicious emails and spoofed senders',
    icon: '📧',
    accentColor: '#5ac8ff',
    progress: 80,
    lessonsComplete: 4,
    totalLessons: 5,
    unlocked: true,
  },
  {
    id: 2,
    title: 'Social Engineering Pretexting',
    subtitle: 'Recognize fabricated scenarios used to manipulate targets',
    icon: '🎭',
    accentColor: '#d400ff',
    progress: 45,
    lessonsComplete: 2,
    totalLessons: 5,
    unlocked: true,
  },
  {
    id: 3,
    title: 'SMS & Vishing Attacks',
    subtitle: 'Detect smishing texts and fraudulent phone calls',
    icon: '📱',
    accentColor: '#3fbf7f',
    progress: 20,
    lessonsComplete: 1,
    totalLessons: 5,
    unlocked: true,
  },
  {
    id: 4,
    title: 'Physical Security Breaches',
    subtitle: 'Understand tailgating, baiting, and on-site threats',
    icon: '🏢',
    accentColor: '#ffcf5c',
    progress: 0,
    lessonsComplete: 0,
    totalLessons: 5,
    unlocked: false,
  },
  {
    id: 5,
    title: 'OSINT & Reconnaissance',
    subtitle: 'Learn how attackers gather public intelligence on targets',
    icon: '🔍',
    accentColor: '#ff6363',
    progress: 0,
    lessonsComplete: 0,
    totalLessons: 5,
    unlocked: false,
  },
];

export function syncModuleProgress(moduleId: number, completedLessonIds: number[]) {
  const module = MODULES.find((entry) => entry.id === moduleId);
  if (!module) return;

  const completedCount = completedLessonIds.filter((lessonId) => lessonId >= 1 && lessonId <= module.totalLessons).length;
  module.lessonsComplete = completedCount;
  module.progress = Math.round((completedCount / module.totalLessons) * 100);
}

// ── Module Card ───────────────────────────────────────────────────────────────
function ModuleCard({
  module,
  onPress,
  isActive,
  s,
  bw,
  isCompact,
  scaleKey,
}: {
  module: typeof MODULES[0];
  onPress: () => void;
  isActive: boolean;
  s: (n: number) => number;
  bw: (n: number) => number;
  isCompact: boolean;
  scaleKey: number;
}) {
  const { accentColor, unlocked } = module;
  const cs = useMemo(() => makeCardStyles(s, bw, isCompact), [scaleKey, isCompact]);

  // Animated progress fill — replays whenever the shown module changes.
  const progressAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    progressAnim.setValue(0);
    Animated.timing(progressAnim, {
      toValue: module.progress,
      duration: 550,
      useNativeDriver: false, // width can't use the native driver
    }).start();
  }, [module.id]);

  // Soft breathing glow behind the CTA — only while the module is playable.
  const pulseAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!unlocked) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 1100, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0, duration: 1100, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [unlocked, module.id]);

  return (
    <TouchableOpacity
      activeOpacity={unlocked ? 0.85 : 1}
      onPress={unlocked ? onPress : undefined}
      accessibilityRole="button"
      accessibilityState={{ disabled: !unlocked }}
      accessibilityLabel={`${module.title}, ${module.progress}% complete${unlocked ? '' : ', locked'}`}
      style={[cs.card, { borderColor: isActive ? accentColor : '#1e3050' }, !unlocked && cs.cardLocked]}
    >
      {/* HUD accent strip — reinforces the module's color at a glance */}
      <View style={[cs.topAccent, { backgroundColor: accentColor }]} />

      {/* Lock overlay */}
      {!unlocked && (
        <View style={cs.lockOverlay}>
          <Text style={cs.lockIcon}>🔒</Text>
          <Text style={cs.lockText}>Complete Module {module.id - 1} to unlock</Text>
        </View>
      )}

      {/* Module number chip */}
      <View style={[cs.numChip, { borderColor: accentColor + '80', backgroundColor: accentColor + '18' }]}>
        <Text style={[cs.numChipTxt, { color: accentColor }]}>MODULE {module.id}</Text>
      </View>

      {/* Icon, framed in a badge for more depth than a bare emoji */}
      <View style={[cs.iconBadge, { borderColor: accentColor + '80', backgroundColor: accentColor + '15' }]}>
        <Text style={cs.moduleIcon}>{module.icon}</Text>
      </View>

      {/* Title + subtitle — clamped so a long string can never push the footer out */}
      <Text style={[cs.moduleTitle, { color: unlocked ? '#e8f0ff' : '#3a4a60' }]} numberOfLines={2}>
        {module.title}
      </Text>
      <Text style={[cs.moduleSub, { color: unlocked ? '#8aa8d0' : '#2a3444' }]} numberOfLines={2}>
        {module.subtitle}
      </Text>

      {/* Flexible spacer — pushes the footer to the bottom without relying
          on `marginTop: auto`, so it never silently collapses to 0. */}
      <View style={cs.spacer} />

      <View>
        <View style={cs.progressRow}>
          <Text style={[cs.progressLabel, { color: unlocked ? '#8aa8d0' : '#2a3444' }]}>
            {module.lessonsComplete}/{module.totalLessons} Lessons
          </Text>
          <Text style={[cs.progressPct, { color: unlocked ? accentColor : '#2a3444' }]}>
            {module.progress}%
          </Text>
        </View>
        <View style={cs.barTrack}>
          {unlocked && (
            <Animated.View
              style={[
                cs.barFill,
                {
                  backgroundColor: accentColor,
                  width: progressAnim.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }),
                },
              ]}
            />
          )}
        </View>

        {unlocked && isActive && (
          <View style={cs.ctaWrap}>
            <Animated.View
              pointerEvents="none"
              style={[
                cs.ctaGlow,
                {
                  backgroundColor: accentColor,
                  opacity: pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [0.12, 0.4] }),
                },
              ]}
            />
            <View style={[cs.cta, { borderColor: accentColor, backgroundColor: accentColor + '22' }]}>
              <Text style={[cs.ctaTxt, { color: accentColor }]} numberOfLines={1}>
                {module.progress === 0 ? '▶ START' : '▶ CONTINUE'}
              </Text>
            </View>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function LessonsScreen({ navigation }: any) {
  const { s, bw, isCompact, scaleKey } = useScale();
  const ls = useMemo(() => makeScreenStyles(s, bw, isCompact), [scaleKey, isCompact]);

  const [activeIdx, setActiveIdx] = useState(0);
  const [refreshTick, setRefreshTick] = useState(0);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const goTo = (nextIdx: number) => {
    if (nextIdx < 0 || nextIdx >= MODULES.length || nextIdx === activeIdx) return;
    const direction = nextIdx > activeIdx ? -1 : 1;
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: direction * 30, duration: 120, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 0, duration: 120, useNativeDriver: true }),
    ]).start(() => {
      setActiveIdx(nextIdx);
      slideAnim.setValue(-direction * 30);
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: 0, duration: 160, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 160, useNativeDriver: true }),
      ]).start();
    });
  };

  // Swipe the card itself — a tap still opens it, a deliberate horizontal
  // drag moves between modules. Threshold keeps it from fighting the tap.
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponderCapture: (_, g) =>
        Math.abs(g.dx) > 14 && Math.abs(g.dx) > Math.abs(g.dy) * 1.5,
      onPanResponderRelease: (_, g) => {
        if (g.dx < -36) goTo(activeIdx + 1);
        else if (g.dx > 36) goTo(activeIdx - 1);
      },
    })
  ).current;

  useEffect(() => {
    const unsubscribe = navigation.addListener?.('focus', () => {
      setRefreshTick((value) => value + 1);
    });

    return () => unsubscribe?.();
  }, [navigation]);

  const active = MODULES[activeIdx];

  return (
    <SafeAreaView style={ls.safe}>
      <StatusBar barStyle="light-content" />

      {/* ── Header ── */}
      <View style={ls.header}>
        <TouchableOpacity
          style={ls.backBtn}
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Text style={ls.backButtonText}>←</Text>
        </TouchableOpacity>

        <View style={ls.headerTextWrap}>
          <Text style={ls.headerTitle}>LESSONS</Text>
          <Text style={ls.headerCaption}>Choose your training module</Text>
        </View>

        {/* Replaces the old dot row — same "where am I" job, zero extra height */}
        <View
          style={[
            ls.moduleBadge,
            { borderColor: active.accentColor + '80', backgroundColor: active.accentColor + '18' },
          ]}
        >
          <Text style={[ls.moduleBadgeTxt, { color: active.accentColor }]}>
            {String(activeIdx + 1).padStart(2, '0')}/{String(MODULES.length).padStart(2, '0')}
          </Text>
        </View>
      </View>

      {/* ── Carousel ── */}
      <View style={ls.carouselWrap}>
        <TouchableOpacity
          style={[ls.arrow, activeIdx === 0 && ls.arrowDisabled]}
          onPress={() => goTo(activeIdx - 1)}
          disabled={activeIdx === 0}
          accessibilityRole="button"
          accessibilityLabel="Previous module"
        >
          <Text style={ls.arrowTxt}>‹</Text>
        </TouchableOpacity>

        <Animated.View
          style={[ls.cardSlot, { transform: [{ translateX: slideAnim }], opacity: fadeAnim }]}
          {...panResponder.panHandlers}
        >
          <ModuleCard
            module={active}
            isActive
            onPress={() => navigation.navigate('ModuleDetail', { moduleId: active.id })}
            s={s}
            bw={bw}
            isCompact={isCompact}
            scaleKey={scaleKey}
          />
        </Animated.View>

        <TouchableOpacity
          style={[ls.arrow, activeIdx === MODULES.length - 1 && ls.arrowDisabled]}
          onPress={() => goTo(activeIdx + 1)}
          disabled={activeIdx === MODULES.length - 1}
          accessibilityRole="button"
          accessibilityLabel="Next module"
        >
          <Text style={ls.arrowTxt}>›</Text>
        </TouchableOpacity>
      </View>

      {/* ── Module list strip ── */}
      <View style={ls.strip}>
        {MODULES.map((m, i) => (
          <TouchableOpacity
            key={m.id}
            style={[
              ls.stripItem,
              i === activeIdx && { borderColor: m.accentColor, backgroundColor: m.accentColor + '18' },
            ]}
            onPress={() => goTo(i)}
            accessibilityRole="button"
            accessibilityLabel={`${m.title}${m.unlocked ? '' : ', locked'}`}
          >
            <Text style={ls.stripIcon}>{m.icon}</Text>
            <Text style={[ls.stripNum, i === activeIdx && { color: m.accentColor }]}>M{m.id}</Text>
            <View style={[ls.stripDot, m.unlocked && { backgroundColor: m.accentColor }]} />
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

// ── Card Styles ───────────────────────────────────────────────────────────────
function makeCardStyles(s: (n: number) => number, bw: (n: number) => number, isCompact: boolean) {
  const pad = s(isCompact ? 18 : 22);
  return StyleSheet.create({
    card: {
      flex: 1,
      backgroundColor: '#0c1525',
      borderWidth: bw(2),
      borderRadius: s(18),
      padding: pad,
      paddingTop: pad + s(6), // clears the top accent bar
      paddingBottom: pad + s(10), // extra clearance so the CTA never sits inside the corner curve
      position: 'relative',
      overflow: 'hidden',
    },
    cardLocked: { opacity: 0.75 },

    topAccent: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: s(4),
    },

    lockOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(8,14,26,0.82)',
      zIndex: 10,
      justifyContent: 'center',
      alignItems: 'center',
      gap: s(10),
      paddingHorizontal: s(28),
    },
    lockIcon: { fontSize: s(34) },
    lockText: { color: '#7f9bc4', fontSize: s(12), textAlign: 'center', lineHeight: s(18) },

    numChip: {
      alignSelf: 'flex-start',
      borderWidth: bw(1),
      borderRadius: s(20),
      paddingHorizontal: s(12),
      paddingVertical: s(5),
      marginBottom: s(isCompact ? 10 : 14),
    },
    numChipTxt: { fontSize: s(10), fontWeight: '900', letterSpacing: 1.5 },

    iconBadge: {
      width: s(isCompact ? 50 : 58),
      height: s(isCompact ? 50 : 58),
      borderRadius: s(isCompact ? 25 : 29),
      borderWidth: bw(2),
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: s(isCompact ? 10 : 14),
    },
    moduleIcon: { fontSize: s(isCompact ? 24 : 27) },

    moduleTitle: { fontSize: s(18), fontWeight: '800', marginBottom: s(6), lineHeight: s(23) },
    moduleSub: { fontSize: s(13), lineHeight: s(19) },

    spacer: { flex: 1, minHeight: s(10) },

    progressRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      marginBottom: s(6),
    },
    progressLabel: { fontSize: s(11) },
    progressPct: { fontSize: s(12), fontWeight: 'bold' },
    barTrack: {
      height: s(7),
      backgroundColor: '#0f1e35',
      borderRadius: s(4),
      overflow: 'hidden',
      marginBottom: s(isCompact ? 12 : 16),
    },
    barFill: { height: '100%', borderRadius: s(4) },

    ctaWrap: {
      marginHorizontal: s(4), // keeps the button's own rounded corners clear of the card's outer curve
    },
    ctaGlow: {
      position: 'absolute',
      top: -s(4),
      left: -s(4),
      right: -s(4),
      bottom: -s(2),
      borderRadius: s(14),
    },
    cta: {
      borderWidth: bw(1.5),
      borderRadius: s(10),
      paddingVertical: s(isCompact ? 10 : 12),
      alignItems: 'center',
    },
    ctaTxt: { fontFamily: PIXEL_FONT, fontSize: s(12), letterSpacing: 1 },
  });
}

// ── Screen Styles ─────────────────────────────────────────────────────────────
function makeScreenStyles(s: (n: number) => number, bw: (n: number) => number, isCompact: boolean) {
  return StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: '#080e1a',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: s(20),
      paddingVertical: s(isCompact ? 10 : 13),
      borderBottomWidth: bw(1),
      borderBottomColor: '#bda05e',
      backgroundColor: '#0c1525',
      gap: s(12),
    },
    backBtn: {
      width: s(40),
      height: s(40),
      borderRadius: s(20),
      borderWidth: bw(2),
      borderColor: '#bda05e',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(10,15,25,0.9)',
    },
    backButtonText: {
    color: '#ffffff',
    fontFamily: 'PixelFont',
    fontSize: s(14),
    },
    headerTextWrap: { flex: 1 },
    headerTitle: { fontFamily: PIXEL_FONT, color: '#fff', fontSize: s(13), letterSpacing: 2 },
    headerCaption: { color: '#6f8bb5', fontSize: s(11), marginTop: s(4) },
    moduleBadge: {
      borderWidth: bw(1),
      borderRadius: s(8),
      paddingHorizontal: s(10),
      paddingVertical: s(6),
    },
    moduleBadgeTxt: { fontSize: s(11), fontWeight: 'bold', letterSpacing: 0.5 },

    // `alignItems: 'stretch'` (not 'center') is the fix — see notes at top.
    carouselWrap: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'stretch',
      paddingHorizontal: s(10),
      paddingVertical: s(isCompact ? 10 : 16),
      gap: s(8),
    },
    arrow: {
      width: s(44),
      height: s(44),
      borderRadius: s(22),
      backgroundColor: '#0c1525',
      borderWidth: bw(1.5),
      borderColor: '#1e3050',
      justifyContent: 'center',
      alignItems: 'center',
      alignSelf: 'center', // keep arrows centered even though the row now stretches
    },
    arrowDisabled: { opacity: 0.25 },
    arrowTxt: { color: '#fff', fontSize: s(22), lineHeight: s(26), textAlign: 'center' },
    cardSlot: { flex: 1 },

    strip: {
      flexDirection: 'row',
      paddingVertical: s(isCompact ? 10 : 14),
      paddingHorizontal: s(16),
      gap: s(8),
      borderTopWidth: bw(1),
      borderTopColor: '#1e3050',
    },
    stripItem: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: s(isCompact ? 8 : 10),
      borderWidth: bw(1.5),
      borderColor: '#1e3050',
      borderRadius: s(10),
      backgroundColor: '#0c1525',
      gap: s(3),
    },
    stripIcon: { fontSize: s(16) },
    stripNum: { color: '#5a7aaa', fontSize: s(9), fontWeight: 'bold' },
    stripDot: {
      width: s(4),
      height: s(4),
      borderRadius: s(2),
      backgroundColor: '#1e3050',
      marginTop: s(2),
    },
  });
}