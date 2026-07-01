import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
  useWindowDimensions,
} from 'react-native';

// ─── Tiny reusable animated dot ───────────────────────────────────────────────
function FloatingDot({
  style,
  delay = 0,
  range = 10,
}: {
  style?: object;
  delay?: number;
  range?: number;
}) {
  const y = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(y, { toValue: -range, duration: 2800, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0.8, duration: 1400, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(y, { toValue: 0, duration: 2800, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0.3, duration: 1400, useNativeDriver: true }),
        ]),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          width: 4,
          height: 4,
          borderRadius: 2,
          backgroundColor: '#00d4ff',
          transform: [{ translateY: y }],
          opacity,
        },
        style,
      ]}
    />
  );
}

// ─── Pulsing ring behind the logo ─────────────────────────────────────────────
function PulseRing({ delay = 0 }: { delay?: number }) {
  const scale = useRef(new Animated.Value(0.7)).current;
  const opacity = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(scale, { toValue: 10, duration: 4000, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0, duration: 4000, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(scale, { toValue: 0, duration: 0, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0.6, duration: 0, useNativeDriver: true }),
        ]),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.pulseRing,
        { transform: [{ scale }], opacity },
      ]}
    />
  );
}

// ─── HUD corner brackets ───────────────────────────────────────────────────────
function CornerBrackets({
  size = 12,
  thickness = 2,
  color = '#00d4ff',
}: {
  size?: number;
  thickness?: number;
  color?: string;
}) {
  const br = { borderColor: color, borderWidth: 0 };
  const s = size;
  const t = thickness;

  return (
    <>
      {/* top-left */}
      <View style={[styles.corner, { top: -4, left: -4 }]}>
        <View style={{ width: s, height: t, backgroundColor: color }} />
        <View style={{ width: t, height: s, backgroundColor: color, position: 'absolute', top: 0, left: 0 }} />
      </View>
      {/* top-right */}
      <View style={[styles.corner, { top: -4, right: -4 }]}>
        <View style={{ width: s, height: t, backgroundColor: color, alignSelf: 'flex-end' }} />
        <View style={{ width: t, height: s, backgroundColor: color, position: 'absolute', top: 0, right: 0 }} />
      </View>
      {/* bottom-left */}
      <View style={[styles.corner, { bottom: -4, left: -4 }]}>
        <View style={{ width: s, height: t, backgroundColor: color, position: 'absolute', bottom: 0 }} />
        <View style={{ width: t, height: s, backgroundColor: color, position: 'absolute', bottom: 0, left: 0 }} />
      </View>
      {/* bottom-right */}
      <View style={[styles.corner, { bottom: -4, right: -4 }]}>
        <View style={{ width: s, height: t, backgroundColor: color, position: 'absolute', bottom: 0, right: 0, alignSelf: 'flex-end' }} />
        <View style={{ width: t, height: s, backgroundColor: color, position: 'absolute', bottom: 0, right: 0 }} />
      </View>
    </>
  );
}

// ─── Scanline overlay (static rows) ───────────────────────────────────────────
function ScanlineOverlay() {
  const lines = Array.from({ length: 60 });
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {lines.map((_, i) => (
        <View
          key={i}
          style={{
            position: 'absolute',
            top: i * 13,
            left: 0,
            right: 0,
            height: 1,
            backgroundColor: 'rgba(0, 212, 255, 0.025)',
          }}
        />
      ))}
    </View>
  );
}

// ─── Blinking cursor helper ────────────────────────────────────────────────────
function BlinkingCursor() {
  const opacity = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0, duration: 500, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return (
    <Animated.Text style={[styles.cursor, { opacity }]}>█</Animated.Text>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function IntroScreen({ navigation }: any) {
  const { width, height } = useWindowDimensions(); 
  const logoTranslateY = useRef(new Animated.Value(0)).current;
  const bgScale = useRef(new Animated.Value(1)).current;
  const buttonGlow = useRef(new Animated.Value(0.5)).current;
  const topBarOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Logo bob
    Animated.loop(
      Animated.sequence([
        Animated.timing(logoTranslateY, { toValue: -15, duration: 2500, useNativeDriver: true }),
        Animated.timing(logoTranslateY, { toValue: 0, duration: 2500, useNativeDriver: true }),
      ])
    ).start();

    // Background breathe
    Animated.loop(
      Animated.sequence([
        Animated.timing(bgScale, { toValue: 1.05, duration: 10000, useNativeDriver: true }),
        Animated.timing(bgScale, { toValue: 1, duration: 10000, useNativeDriver: true }),
      ])
    ).start();

    // Button border glow pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(buttonGlow, { toValue: 1, duration: 1500, useNativeDriver: true }),
        Animated.timing(buttonGlow, { toValue: 0.4, duration: 1500, useNativeDriver: true }),
      ])
    ).start();

    // Top HUD bar fade in
    Animated.timing(topBarOpacity, { toValue: 1, duration: 1200, delay: 300, useNativeDriver: true }).start();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar hidden />

      {/* Background image */}
      <Animated.Image
        source={require('../assets/background.png')}
        style={[
          { position: 'absolute', top: 0, left: 0, width: width, height: height },
          { transform: [{ scale: bgScale }] }
        ]}
        resizeMode="cover"
      />

      {/* Dark overlay for depth */}
      <View style={styles.darkOverlay} />

      {/* Scanlines */}
      <ScanlineOverlay />

      {/* Vertical edge accent lines */}
      <View style={[styles.edgeLine, { left: 18 }]} />
      <View style={[styles.edgeLine, { right: 18 }]} />

      {/* Floating ambient particles */}
      <FloatingDot style={{ top: '20%', left: '12%' }} delay={0} range={12} />
      <FloatingDot style={{ top: '35%', right: '10%' }} delay={700} range={8} />
      <FloatingDot style={{ top: '65%', left: '8%' }} delay={1400} range={14} />
      <FloatingDot style={{ top: '55%', right: '15%' }} delay={300} range={6} />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>

          <View style={styles.logoWrapper}>
            <Animated.Image
              source={require('../assets/logo.png')}
              style={[styles.logo, { transform: [{ translateY: logoTranslateY }] }]}
              resizeMode="contain"
            />
          </View>

          {/* ── Sub-tagline ── */}
          <View style={styles.taglineRow}>
            <View style={styles.taglineLine} />
            <Text style={styles.taglineText}>DEFEND • DETECT • DISRUPT</Text>
            <View style={styles.taglineLine} />
          </View>

          {/* ── Button ── */}
          <View style={styles.buttonArea}>
            <TouchableOpacity 
                style={styles.startButton}
                onPress={() => navigation.navigate('Login')} // <-- Changed this line
                activeOpacity={0.6}
            >
                <Text style={styles.startButtonText}>START GAME</Text>
            </TouchableOpacity>

            <Text style={styles.pressAnyText}>PRESS TO INITIALIZE</Text>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const CYAN = '#00d4ff';
const PURPLE = '#a855f7';
const NAVY = '#0a0d1a';
const GOLD = '#f0ce98';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: NAVY,
  },
  darkOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(5, 8, 20, 0.55)',
  },
  edgeLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(0, 212, 255, 0.12)',
  },
  safeArea: {
    flex: 1,
  },

  // ── Top HUD bar ──
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,212,255,0.18)',
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00ff88',
    shadowColor: '#00ff88',
    shadowOpacity: 0.9,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 0 },
  },
  topBarText: {
    color: 'rgba(0,212,255,0.7)',
    fontSize: 9,
    letterSpacing: 1.5,
    fontFamily: 'PressStart2P',
  },
  topBarCenter: {
    color: CYAN,
    fontSize: 10,
    letterSpacing: 4,
    fontWeight: '700',
    fontFamily: 'PressStart2P',
  },
  topBarRight: {
    color: PURPLE,
    fontSize: 10,
    opacity: 0.8,
    letterSpacing: 2,
  },

  // ── Content layout ──
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 16,
  },

  // ── Logo ──
  logoWrapper: {
  alignItems: 'center',
  justifyContent: 'center',
  flex: 1,
  width: '100%',
  },
  logo: {
    width: '70%',
    height: '200%', 
  },

  // ── Tagline ──
  taglineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 28,
    paddingHorizontal: 20,
  },
  taglineLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(0,212,255,0.25)',
  },

  // ── Button ──
  buttonArea: {
    alignItems: 'center',
    marginBottom: 24,
  },
  startButton: {
    position: 'relative',
    backgroundColor: 'rgba(0, 10, 25, 0.85)',
    borderColor: CYAN,
    borderWidth: 1.5,
    borderRadius: 4,
    paddingVertical: 14,
    paddingHorizontal: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: CYAN,
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
  },
  buttonGlowBg: {
    ...StyleSheet.absoluteFill,
    borderRadius: 4,
    backgroundColor: 'rgba(0,212,255,0.07)',
  },

  // ── Corner brackets ──
  corner: {
    position: 'absolute',
    width: 14,
    height: 14,
  },

  // ── Bottom strip ──
  bottomStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(168,85,247,0.2)',
    width: '100%',
  },
  bottomStripText: {
    color: 'rgba(168,85,247,0.65)',
    fontSize: 7,
    letterSpacing: 1.5,
    fontFamily: 'PressStart2P',
  },
  bottomDivider: {
    width: 1,
    height: 10,
    backgroundColor: 'rgba(168,85,247,0.3)',
  },
  terminalLine: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cursor: {
    color: PURPLE,
    fontSize: 7,
    marginLeft: 2,
  },
   taglineText: {
    color: 'rgba(0,212,255,0.6)',
    fontSize: 7,
    textAlign: 'center',
    fontFamily: 'PixelFont',
  },
  startButtonText: {
    color: GOLD,
    fontSize: 12,
    fontFamily: 'PixelFont',
  },
  pressAnyText: {
    marginTop: 24,
    color: 'rgba(0,212,255,0.35)',
    fontSize: 7,
    fontFamily: 'PixelFont',
  },
});