import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  StatusBar,
  PixelRatio,
  ImageBackground,
  Animated,
} from 'react-native';

// ── Portrait-safe scaling (same formula used across the whole app) ────────────
const { width: SW, height: SH } = Dimensions.get('window');
const PW = Math.min(SW, SH);   // narrower = portrait width
const PH = Math.max(SW, SH);   // taller   = portrait height
const scaleP = Math.min(PW / 390, PH / 844, 1.0);
const s  = (n: number) => Math.round(PixelRatio.roundToNearestPixel(n * scaleP));
const bw = (n: number) => Math.max(1, s(n));

// ── Option card data ──────────────────────────────────────────────────────────
const OPTIONS = [
  {
    key: 'Lessons',
    label: 'LESSONS',
    subtitle: 'Modules · Theory · Simulations',
    icon: '📚',
    accent: '#5ac8ff',
    description: 'Study cybersecurity topics through guided modules and interactive simulations.',
  },
  {
    key: 'Codex',
    label: 'CODEX',
    subtitle: 'Units · Enemies · Intel',
    icon: '📖',
    accent: '#ffcf5c',
    description: 'Browse all deployable units and known threat actors with real-world context.',
  },
];

// ── Animated card ─────────────────────────────────────────────────────────────
function OptionCard({
  option,
  onPress,
}: {
  option: typeof OPTIONS[0];
  onPress: () => void;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const pressIn  = () => Animated.spring(scale, { toValue: 0.96, useNativeDriver: true, speed: 30 }).start();
  const pressOut = () => Animated.spring(scale, { toValue: 1,    useNativeDriver: true, speed: 20 }).start();

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={pressIn}
      onPressOut={pressOut}
      activeOpacity={1}
      style={{ flex: 1 }}
    >
      <Animated.View style={[is.card, { borderColor: option.accent, transform: [{ scale }] }]}>
        {/* Background glow tint */}
        <View style={[is.cardGlow, { backgroundColor: option.accent + '10' }]} />

        {/* Top accent stripe */}
        <View style={[is.cardStripe, { backgroundColor: option.accent }]} />

        {/* Icon */}
        <Text style={is.cardIcon}>{option.icon}</Text>

        {/* Label */}
        <Text style={[is.cardLabel, { color: option.accent }]}>{option.label}</Text>

        {/* Subtitle pill */}
        <View style={[is.subtitlePill, { borderColor: option.accent + '60' }]}>
          <Text style={[is.subtitleTxt, { color: option.accent + 'cc' }]}>{option.subtitle}</Text>
        </View>

        {/* Description */}
        <Text style={is.cardDesc}>{option.description}</Text>

        {/* CTA row */}
        <View style={[is.ctaRow, { borderColor: option.accent + '60', backgroundColor: option.accent + '18' }]}>
          <Text style={[is.ctaTxt, { color: option.accent }]}>TAP TO ENTER  →</Text>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────
export default function IntelligenceScreen({ navigation }: any) {
  return (
    <View style={is.container}>
      <StatusBar barStyle="light-content" />

      {/* Full-screen background */}
      <ImageBackground
        source={require('../assets/dashboard.png')}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
        imageStyle={{ opacity: 0.18 }}
      />

      {/* Dark overlay for readability */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(5,10,20,0.82)' }]} />

      <SafeAreaView style={{ flex: 1 }}>

        {/* ── HEADER ── */}
        <View style={is.header}>
          <View style={is.leftHeader}>
            <TouchableOpacity
              style={is.backButton}
              onPress={() => navigation.goBack()}
              activeOpacity={0.8}
            >
              <Text style={is.backButtonText}>←</Text>
            </TouchableOpacity>
            <Text style={is.headerTitle}>INTELLIGENCE</Text>
          </View>

          <View style={is.headerRight}>
            <View style={is.resourceItem}>
              <Text style={is.resourceIcon}>💀</Text>
              <Text style={is.resourceText}>2400</Text>
            </View>
            <View style={is.resourceItem}>
              <Text style={is.resourceIcon}>🔧</Text>
              <Text style={is.resourceText}>1150</Text>
            </View>
          </View>
        </View>

        {/* ── PAGE HEADING ── */}
        <View style={is.heading}>
          <Text style={is.headingTitle}>INTEL HUB</Text>
          {/* Decorative divider */}
          <View style={is.divider}>
            <View style={is.dividerLine} />
            <Text style={is.dividerDot}>◆</Text>
            <View style={is.dividerLine} />
          </View>
        </View>

        {/* ── CARDS ── */}
        <View style={is.cardsArea}>
          {OPTIONS.map((opt) => (
            <OptionCard
              key={opt.key}
              option={opt}
              onPress={() => navigation.navigate(opt.key)}
            />
          ))}
        </View>
      </SafeAreaView>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const is = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050a15',
  },

  // ── Header (matches DashboardScreen / IntelligenceScreen style) ──
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(5,12,24,0.92)',
    borderTopWidth: bw(1),
    borderBottomWidth: bw(1),
    borderColor: '#bda05e',
    paddingHorizontal: s(16),
    paddingVertical: s(8),
  },
  leftHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(10),
  },
  backButton: {
    width: s(38),
    height: s(38),
    borderRadius: s(19),
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
  headerTitle: {
    color: '#ffffff',
    fontFamily: 'PixelFont',
    fontSize: s(14),
    letterSpacing: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(8),
  },
  resourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: bw(1),
    borderColor: '#bda05e',
    borderRadius: s(999),
    backgroundColor: '#bda05e18',
    paddingHorizontal: s(10),
    paddingVertical: s(6),
  },
  resourceIcon: { fontSize: s(11) },
  resourceText: {
    color: '#ffffff',
    fontFamily: 'PixelFont',
    fontSize: s(9),
  },
  actionIconBtn: { marginLeft: s(4) },
  actionIcon:    { fontSize: s(16) },

  // ── Page heading ──
  heading: {
    alignItems: 'center',
    paddingTop: s(28),
    paddingBottom: s(20),
    paddingHorizontal: s(24),
  },
  headingTitle: {
    color: '#bda05e',
    fontFamily: 'PixelFont',
    fontSize: s(18),
    letterSpacing: 4,
    marginBottom: s(6),
  },
  headingSubtitle: {
    color: '#5a7aaa',
    fontSize: s(12),
    letterSpacing: 1,
    marginBottom: s(20),
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '70%',
    gap: s(8),
  },
  dividerLine: {
    flex: 1,
    height: bw(1),
    backgroundColor: '#bda05e40',
  },
  dividerDot: {
    color: '#bda05e',
    fontSize: s(10),
  },

  // ── Cards area ──
  cardsArea: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: s(16),
    gap: s(14),
    paddingBottom: s(8),
  },

  // ── Card ──
  card: {
    flex: 1,
    backgroundColor: 'rgba(12,21,37,0.92)',
    borderWidth: bw(2),
    borderRadius: s(20),
    padding: s(18),
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
    gap: s(10),
    // Shadow
    shadowColor: '#000',
    shadowOpacity: 0.6,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 10,
  },
  cardGlow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: s(20),
  },
  cardStripe: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: s(4),
  },
  cardIcon:  { fontSize: s(52), marginTop: s(10) },
  cardLabel: {
    fontFamily: 'PixelFont',
    fontSize: s(14),
    letterSpacing: 3,
    textAlign: 'center',
  },
  subtitlePill: {
    borderWidth: bw(1),
    borderRadius: s(20),
    paddingHorizontal: s(10),
    paddingVertical: s(3),
  },
  subtitleTxt: {
    fontSize: s(9),
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  cardDesc: {
    color: '#5a7aaa',
    fontSize: s(11),
    textAlign: 'center',
    lineHeight: s(17),
    flex: 1,
  },
  ctaRow: {
    width: '100%',
    borderWidth: bw(1.5),
    borderRadius: s(10),
    paddingVertical: s(10),
    alignItems: 'center',
    marginTop: 'auto' as any,
  },
  ctaTxt: {
    fontFamily: 'PixelFont',
    fontSize: s(9),
    letterSpacing: 1,
  },

  // ── Footer ──
  footer: {
    paddingVertical: s(14),
    alignItems: 'center',
  },
  footerTxt: {
    color: '#bda05e40',
    fontFamily: 'PixelFont',
    fontSize: s(7),
    letterSpacing: 2,
  },
});
