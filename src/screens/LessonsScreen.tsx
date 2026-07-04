import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  PixelRatio,
  Animated,
  StatusBar,
} from 'react-native';

// ── Scaling ──────────────────────────────────────────────────────────────────
const { width: SW, height: SH } = Dimensions.get('window');
const PW = Math.min(SW, SH);
const PH = Math.max(SW, SH);
const scaleP = Math.min(PW / 390, PH / 844, 1.0);
const s  = (n: number) => Math.round(PixelRatio.roundToNearestPixel(n * scaleP));
const bw = (n: number) => Math.max(1, s(n));

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

// ── Module Card ───────────────────────────────────────────────────────────────
function ModuleCard({
  module,
  onPress,
  isActive,
}: {
  module: typeof MODULES[0];
  onPress: () => void;
  isActive: boolean;
}) {
  const { accentColor, unlocked } = module;

  return (
    <TouchableOpacity
      activeOpacity={unlocked ? 0.85 : 1}
      onPress={unlocked ? onPress : undefined}
      style={[
        cs.card,
        isActive && cs.cardActive,
        { borderColor: isActive ? accentColor : '#1e3050' },
        !unlocked && cs.cardLocked,
      ]}
    >
      {/* Glow layer when active */}
      {isActive && (
        <View style={[cs.cardGlow, { backgroundColor: accentColor + '18' }]} />
      )}

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

      {/* Icon */}
      <Text style={cs.moduleIcon}>{module.icon}</Text>

      {/* Title + subtitle */}
      <Text style={[cs.moduleTitle, { color: unlocked ? '#e8f0ff' : '#3a4a60' }]}>{module.title}</Text>
      <Text style={[cs.moduleSub, { color: unlocked ? '#5a7aaa' : '#2a3444' }]}>{module.subtitle}</Text>

      {/* Progress bar */}
      <View style={cs.progressSection}>
        <View style={cs.progressRow}>
          <Text style={[cs.progressLabel, { color: unlocked ? '#5a7aaa' : '#2a3444' }]}>
            {module.lessonsComplete}/{module.totalLessons} Lessons
          </Text>
          <Text style={[cs.progressPct, { color: unlocked ? accentColor : '#2a3444' }]}>
            {module.progress}%
          </Text>
        </View>
        <View style={cs.barTrack}>
          {unlocked && (
            <View
              style={[cs.barFill, { width: `${module.progress}%`, backgroundColor: accentColor }]}
            />
          )}
        </View>
      </View>

      {/* CTA */}
      {unlocked && isActive && (
        <View style={[cs.cta, { borderColor: accentColor, backgroundColor: accentColor + '22' }]}>
          <Text style={[cs.ctaTxt, { color: accentColor }]}>
            {module.progress === 0 ? '▶  START MODULE' : '▶  CONTINUE'}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function LessonsScreen({ navigation }: any) {
  const [activeIdx, setActiveIdx] = useState(0);
  const slideAnim = useRef(new Animated.Value(0)).current;

  const goTo = (nextIdx: number) => {
    if (nextIdx < 0 || nextIdx >= MODULES.length) return;
    const direction = nextIdx > activeIdx ? -1 : 1;
    // Quick slide out → update → slide in
    Animated.sequence([
      Animated.timing(slideAnim, { toValue: direction * 40, duration: 120, useNativeDriver: true }),
    ]).start(() => {
      setActiveIdx(nextIdx);
      slideAnim.setValue(-direction * 40);
      Animated.timing(slideAnim, { toValue: 0, duration: 150, useNativeDriver: true }).start();
    });
  };

  const active = MODULES[activeIdx];

  return (
    <SafeAreaView style={ls.safe}>
      <StatusBar barStyle="light-content" />

      {/* ── Header ── */}
      <View style={ls.header}>
        <TouchableOpacity style={ls.backBtn} onPress={() => navigation.goBack()}>
          <Text style={ls.backBtnTxt}>←</Text>
        </TouchableOpacity>
        <Text style={ls.headerTitle}>LESSONS</Text>
        <Text style={ls.headerSub}>Select a Module</Text>
      </View>

      {/* ── Dot indicators ── */}
      <View style={ls.dots}>
        {MODULES.map((_, i) => (
          <TouchableOpacity key={i} onPress={() => goTo(i)}>
            <View
              style={[
                ls.dot,
                i === activeIdx && ls.dotActive,
                i === activeIdx && { backgroundColor: active.accentColor },
              ]}
            />
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Carousel ── */}
      <View style={ls.carouselWrap}>
        {/* Left arrow */}
        <TouchableOpacity
          style={[ls.arrow, ls.arrowLeft, activeIdx === 0 && ls.arrowDisabled]}
          onPress={() => goTo(activeIdx - 1)}
          disabled={activeIdx === 0}
        >
          <Text style={ls.arrowTxt}>‹</Text>
        </TouchableOpacity>

        {/* Active card */}
        <Animated.View style={[ls.cardSlot, { transform: [{ translateX: slideAnim }] }]}>
          <ModuleCard
            module={active}
            isActive
            onPress={() =>
              navigation.navigate('ModuleDetail', { moduleId: active.id })
            }
          />
        </Animated.View>

        {/* Right arrow */}
        <TouchableOpacity
          style={[ls.arrow, ls.arrowRight, activeIdx === MODULES.length - 1 && ls.arrowDisabled]}
          onPress={() => goTo(activeIdx + 1)}
          disabled={activeIdx === MODULES.length - 1}
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
          >
            <Text style={ls.stripIcon}>{m.icon}</Text>
            <Text style={[ls.stripNum, i === activeIdx && { color: m.accentColor }]}>
              M{m.id}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

// ── Card Styles ───────────────────────────────────────────────────────────────
const cs = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#0c1525',
    borderWidth: bw(2),
    borderRadius: s(20),
    padding: s(22),
    position: 'relative',
    overflow: 'hidden',
  },
  cardActive: {
    shadowOpacity: 0.5,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 0 },
    elevation: 12,
  },
  cardLocked: {
    opacity: 0.7,
  },
  cardGlow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: s(20),
  },
  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(8,14,26,0.75)',
    borderRadius: s(20),
    zIndex: 10,
    justifyContent: 'center',
    alignItems: 'center',
    gap: s(10),
  },
  lockIcon: { fontSize: s(36) },
  lockText: { color: '#5a7aaa', fontSize: s(12), textAlign: 'center' },

  numChip: {
    alignSelf: 'flex-start',
    borderWidth: bw(1),
    borderRadius: s(20),
    paddingHorizontal: s(12),
    paddingVertical: s(4),
    marginBottom: s(16),
  },
  numChipTxt: {
    fontSize: s(10),
    fontWeight: '900',
    letterSpacing: 2,
  },
  moduleIcon: { fontSize: s(48), marginBottom: s(12) },
  moduleTitle: { fontSize: s(20), fontWeight: 'bold', marginBottom: s(8) },
  moduleSub:   { fontSize: s(13), lineHeight: s(20), marginBottom: s(20) },

  progressSection: { marginTop: 'auto' as any },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: s(6),
  },
  progressLabel: { fontSize: s(11) },
  progressPct:   { fontSize: s(11), fontWeight: 'bold' },
  barTrack: {
    height: s(6),
    backgroundColor: '#0f1e35',
    borderRadius: s(3),
    overflow: 'hidden',
    marginBottom: s(16),
  },
  barFill: { height: '100%', borderRadius: s(3) },

  cta: {
    borderWidth: bw(1.5),
    borderRadius: s(10),
    paddingVertical: s(12),
    alignItems: 'center',
  },
  ctaTxt: { fontSize: s(13), fontWeight: 'bold', letterSpacing: 1 },
});

// ── Screen Styles ─────────────────────────────────────────────────────────────
const ls = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#080e1a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: s(20),
    paddingVertical: s(12),
    borderBottomWidth: bw(1),
    borderBottomColor: '#bda05e',
    backgroundColor: '#0c1525',
    gap: s(12),
  },
  backBtn: {
    width: s(36),
    height: s(36),
    borderRadius: s(18),
    borderWidth: bw(2),
    borderColor: '#bda05e',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(10,15,25,0.9)',
  },
  backBtnTxt: { color: '#fff', fontSize: s(16) },
  headerTitle: {
    color: '#fff',
    fontSize: s(14),
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  headerSub: {
    color: '#5a7aaa',
    fontSize: s(11),
    marginLeft: 'auto' as any,
  },

  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: s(8),
    paddingVertical: s(12),
  },
  dot: {
    width: s(8),
    height: s(8),
    borderRadius: s(4),
    backgroundColor: '#1e3050',
  },
  dotActive: {
    width: s(24),
    borderRadius: s(4),
  },

  carouselWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: s(8),
    gap: s(8),
  },
  arrow: {
    width: s(40),
    height: s(40),
    borderRadius: s(20),
    backgroundColor: '#0c1525',
    borderWidth: bw(1.5),
    borderColor: '#1e3050',
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowLeft:     {},
  arrowRight:    {},
  arrowDisabled: { opacity: 0.25 },
  arrowTxt: {
    color: '#fff',
    fontSize: s(24),
    lineHeight: s(28),
    textAlign: 'center',
  },
  cardSlot: { flex: 1 },

  strip: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: s(14),
    paddingHorizontal: s(20),
    gap: s(8),
    borderTopWidth: bw(1),
    borderTopColor: '#1e3050',
  },
  stripItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: s(8),
    borderWidth: bw(1.5),
    borderColor: '#1e3050',
    borderRadius: s(10),
    backgroundColor: '#0c1525',
    gap: s(2),
  },
  stripIcon: { fontSize: s(16) },
  stripNum:  { color: '#5a7aaa', fontSize: s(9), fontWeight: 'bold' },
});
