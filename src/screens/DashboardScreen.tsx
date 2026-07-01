import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
  PixelRatio,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const BASE_WIDTH = 932; // the width the mockup was authored on

export default function DashboardScreen({ navigation }: any) {
  // useWindowDimensions is reactive (re-renders on resize/rotation), unlike
  // a one-time Dimensions.get('window') captured at module load. Styles are
  // rebuilt only when width actually changes.
  const { width } = useWindowDimensions();
  const styles = useMemo(() => makeStyles(width), [width]);

  return (
    <View style={styles.container}>
      <StatusBar hidden />

      <ImageBackground
        source={require('../assets/dashboard.png')}
        style={styles.background}
        resizeMode="cover"
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.topSection}>
            <View style={styles.profileContainer}>
              <View style={styles.avatarBox}>
                <Image
                  source={require('../assets/logo.png')}
                  style={styles.avatarImage}
                  resizeMode="contain"
                />
              </View>

              <View style={styles.profileInfo}>
                <Text style={styles.playerName}>COMMANDER_X</Text>

                <View style={styles.rankRow}>
                  <Text style={styles.rankText} numberOfLines={1}>
                    ELITE I
                  </Text>
                  <Text style={styles.expText} numberOfLines={1}>
                    1450 / 2000 EXP
                  </Text>
                </View>

                <View style={styles.expBarContainer}>
                  <View style={[styles.expBarFill, { width: '72.5%' }]} />
                </View>
              </View>
            </View>

            {/* --- Resources & Actions (Top Right) --- */}
            <View style={styles.topRightContainer}>
              <View style={styles.statGroup}>
                <Text style={styles.resourceLabel} numberOfLines={1}>
                  Threat Points
                </Text>
                <View style={styles.resourceBox}>
                  <Text style={styles.resourceIcon}>💀</Text>
                  <Text style={styles.resourceValue}>2400</Text>
                </View>
              </View>

              <View style={styles.statGroupWide}>
                <Text style={styles.resourceLabel} numberOfLines={1}>
                  Upgrade Materials
                </Text>
                <View style={styles.resourceBox}>
                  <Text style={styles.resourceIcon}>🔧</Text>
                  <Text style={styles.resourceValue}>1150</Text>
                </View>
              </View>

              <View style={styles.actionButtonsRow}>
                <TouchableOpacity style={styles.iconButton}>
                  <Text style={styles.iconButtonText}>✉️</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconButton}>
                  <Text style={styles.iconButtonText}>⚙️</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* ================= BOTTOM SECTION ================= */}
          <View style={styles.bottomSection}>
            <View style={styles.bottomLeftContainer}>
              <TouchableOpacity style={styles.navButton}>
                <Text style={styles.navButtonText}>Intel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('Progress')}>
                <Text style={styles.navButtonText}>Progress</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.deployButtonOuter} activeOpacity={0.85} onPress={() => navigation.navigate('MissionBriefing')}>
              <View style={[styles.deployButtonInner, { backgroundColor: '#ffa634' }]}>
                <Text style={styles.deployText}>DEPLOY</Text>
              </View>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}

function makeStyles(width: number) {
  const scaleFactor = width / BASE_WIDTH;
  const normalize = (size: number) =>
    Math.round(PixelRatio.roundToNearestPixel(size * scaleFactor));
  const bw = (size: number) => Math.max(1, normalize(size));
  const infoWidth = normalize(280); // shared width for rank row + exp bar

  return StyleSheet.create({
    container: {
      flex: 1,
      width: '100%',
      height: '100%',
      backgroundColor: '#060e18',
    },
    // Was: position:'absolute', top:0, left:0, width/height taken from a
    // stale Dimensions.get('window') snapshot. StyleSheet.absoluteFillObject
    // pins it to all four edges of its parent, so it always matches the
    // real viewport instead of a number computed once at load time.
    background: {
      ...StyleSheet.absoluteFill,
    },
    safeArea: {
      flex: 1,
      justifyContent: 'space-between',
      padding: normalize(24),
    },

    // === TOP SECTION ===
    topSection: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },

    profileContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    avatarBox: {
      width: normalize(86),
      height: normalize(86),
      backgroundColor: '#12243a',
      borderWidth: bw(3),
      borderColor: '#5a8aaa',
      borderRadius: normalize(10),
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: normalize(14),
      overflow: 'hidden',
    },
    avatarImage: {
      width: '100%',
      height: '100%',
    },
    profileInfo: { justifyContent: 'center' },
    playerName: {
      color: '#ffffff',
      fontSize: normalize(22),
      fontFamily: 'PixelFont',
      marginBottom: normalize(8),
      textShadowColor: '#000',
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 0,
    },
    rankRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: infoWidth,
      marginBottom: normalize(6),
      alignItems: 'flex-end',
    },
    rankText: {
      color: '#00ffaa',
      fontSize: normalize(15),
      fontFamily: 'PixelFont',
      flexShrink: 1,
    },
    expText: {
      color: '#5a8aaa',
      fontSize: normalize(11),
      fontFamily: 'PixelFont',
      flexShrink: 1,
      marginLeft: normalize(8),
    },
    expBarContainer: {
      width: infoWidth,
      height: normalize(13),
      backgroundColor: '#0a1520',
      borderWidth: bw(2),
      borderColor: '#5a8aaa',
      borderRadius: normalize(6),
      overflow: 'hidden',
    },
    expBarFill: {
      height: '100%',
      backgroundColor: '#00ffff',
      shadowColor: '#00ffff',
      shadowOpacity: 1,
      shadowRadius: 5,
      elevation: 5,
    },

    topRightContainer: {
      flexDirection: 'row',
      alignItems: 'flex-end',
    },
    statGroup: {
      alignItems: 'flex-start',
      marginRight: normalize(12),
    },
    statGroupWide: {
      alignItems: 'flex-start',
      marginRight: normalize(12),
    },
    resourceLabel: {
      color: '#7ab8d4',
      fontSize: normalize(8),
      fontFamily: 'PixelFont',
      marginBottom: normalize(4),
    },
    resourceBox: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(18, 36, 58, 0.85)',
      borderWidth: bw(2),
      borderColor: '#3a6a8a',
      borderRadius: normalize(6),
      paddingHorizontal: normalize(16),
      paddingVertical: normalize(10),
      minWidth: normalize(140),
      flexShrink: 0,
    },
    resourceIcon: { fontSize: normalize(15), marginRight: normalize(8), color: '#ffffff' },
    resourceValue: { color: '#ffffff', fontSize: normalize(16), fontFamily: 'PixelFont' },

    actionButtonsRow: { flexDirection: 'row' },
    iconButton: {
      width: normalize(46),
      height: normalize(46),
      backgroundColor: 'rgba(18, 36, 58, 0.85)',
      borderWidth: bw(2),
      borderColor: '#3a6a8a',
      borderRadius: normalize(8),
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: normalize(8),
    },
    iconButtonText: { fontSize: normalize(17) },

    // === BOTTOM SECTION ===
    bottomSection: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
    },

    bottomLeftContainer: { flexDirection: 'row' },
    navButton: {
      backgroundColor: 'rgba(25, 50, 80, 0.9)',
      borderWidth: bw(2),
      borderColor: '#5a8aaa',
      borderRadius: normalize(8),
      paddingVertical: normalize(14),
      paddingHorizontal: normalize(24),
      marginRight: normalize(12),
    },
    navButtonText: { color: '#ffffff', fontSize: normalize(14), fontFamily: 'PixelFont' },

    deployButtonOuter: {
      backgroundColor: '#ffd23f',
      padding: normalize(5),
      borderRadius: normalize(12),
      shadowColor: '#ffb13d',
      shadowOpacity: 0.9,
      shadowRadius: normalize(18),
      shadowOffset: { width: 0, height: 0 },
      elevation: 14,
    },
    deployButtonInner: {
      paddingVertical: normalize(20),
      paddingHorizontal: normalize(52),
      borderRadius: normalize(8),
      alignItems: 'center',
      justifyContent: 'center',
    },
    deployText: {
      color: '#fff6d8',
      fontSize: normalize(30),
      fontFamily: 'PixelFont',
      letterSpacing: 1,
      textShadowColor: '#6b2305',
      textShadowOffset: { width: 3, height: 3 },
      textShadowRadius: 0,
    },
  });
}