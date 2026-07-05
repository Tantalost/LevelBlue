import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  StatusBar,
  Easing,
  ImageBackground,
  Image,
  Dimensions,
  PixelRatio,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '../store/useAuthStore';

const STUDIO_HOLD_MS = 1400;
const LOADING_DURATION_MS = 22000;

// Drop your loading screen art here (e.g. require('../assets/loading-art.png'))
const LOADING_ART = require('../assets/loading.png');
const LOGO_IMAGE = require('../assets/logo.png');

const { width, height } = Dimensions.get('window');
const BASE_WIDTH = 932;
const scaleFactor = width / BASE_WIDTH;
const normalize = (size: number) => Math.round(PixelRatio.roundToNearestPixel(size * scaleFactor));
const bw = (size: number) => Math.max(1, normalize(size));

export default function SplashAnimationScreen({ navigation }: any) {
  const [phase, setPhase] = useState<'studio' | 'loading'>('studio');

  const studioFade = useRef(new Animated.Value(0)).current;
  const gameFade = useRef(new Animated.Value(0)).current;
  const progress = useRef(new Animated.Value(0)).current;

  // Phase 1: Studio card (fade in -> hold -> fade out)
  useEffect(() => {
    Animated.sequence([
      Animated.timing(studioFade, {
        toValue: 1,
        duration: 700,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.delay(STUDIO_HOLD_MS),
      Animated.timing(studioFade, {
        toValue: 0,
        duration: 500,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(() => setPhase('loading'));
  }, [studioFade]);

  // Phase 2: Art fades in, bottom bar fills
  useEffect(() => {
    if (phase !== 'loading') return;

    Animated.timing(gameFade, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    Animated.timing(progress, {
      toValue: 1,
      duration: LOADING_DURATION_MS,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false, // width interpolation can't use native driver
    }).start(async () => {
      try {
        let token;
        if (Platform.OS === 'web') {
          token = await AsyncStorage.getItem('userToken');
        } else {
          token = await SecureStore.getItemAsync('userToken');
        }
        const userStr = await AsyncStorage.getItem('userData');
        if (token && userStr) {
          const user = JSON.parse(userStr);
          useAuthStore.getState().setAuth(user, token);
          navigation.replace('Dashboard');
          return;
        }
      } catch (e) {
        // ignore
      }
      navigation.replace('Intro');
    });
  }, [phase, gameFade, progress, navigation]);

  const barWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      <StatusBar hidden />

      {phase === 'studio' ? (
        <Animated.View style={{ opacity: studioFade, alignItems: 'center' }}>
          <Text style={styles.studioText}>LEVEL BLUE</Text>
          <Text style={styles.presentsText}>PRESENTS</Text>
        </Animated.View>
      ) : (
        <Animated.View style={[styles.loadingScreen, { opacity: gameFade }]}>
          {/* Full-bleed loading art */}
          <ImageBackground
            source={LOADING_ART}
            style={styles.artBackground}
            resizeMode="cover"
          >
            {/* Optional logo overlay near top/center, CoC-style */}
            <View style={styles.logoWrap}>
              <Image
                source={LOGO_IMAGE}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>

            {/* Bottom-anchored progress bar (Clash-like) */}
            <View style={styles.bottomBarWrap}>
              <View style={styles.loadingGroup}>
                <View style={styles.loadingTitleWrap} pointerEvents="none">
                  <Text style={styles.loadingTitle}>Loading</Text>
                </View>
                <View style={styles.barTrack}>
                  <Animated.View style={[styles.barFill, { width: barWidth }]} />
                </View>
                <Text style={styles.loadingTip}>Tip: Keep your defenses upgraded!</Text>
              </View>
            </View>
          </ImageBackground>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  studioText: {
    color: '#ffffff',
    fontSize: 24,
    letterSpacing: 4,
    marginBottom: 10,
    fontWeight: 'bold',
  },
  presentsText: {
    color: '#a0a0a0',
    fontSize: 14,
    letterSpacing: 6,
  },
  loadingScreen: {
    ...StyleSheet.absoluteFillObject,
  },
  artBackground: {
    flex: 1,
    justifyContent: 'space-between',
  },
  logoWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoImage: {
    width: '70%',
    maxWidth: 420,
    aspectRatio: 220 / 90,
  },
  bottomBarWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 40,
    alignItems: 'center',
  },
  barTrack: {
    width: normalize(420),
    height: normalize(14),
    borderRadius: normalize(12),
    backgroundColor: '#2d2f33',
    borderWidth: bw(1),
    borderColor: 'rgba(255,255,255,0.06)',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: '#ffd166',
    borderRadius: normalize(12),
  },
  loadingGroup: {
    width: '100%',
    alignItems: 'center',
  },
  loadingTitleWrap: {
    marginBottom: normalize(8),
  },
  loadingTitle: {
    color: '#ffffff',
    fontSize: normalize(16),
    fontWeight: '700',
    letterSpacing: 1.5,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  loadingTip: {
    color: '#d1d5db',
    fontSize: normalize(10),
    marginTop: normalize(8),
    textAlign: 'center',
  },
  loadingLabel: {
    color: '#e5e7eb',
    fontSize: 10,
    letterSpacing: 2,
    marginTop: 10,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
});