import React, { useMemo, useRef, useState } from 'react';
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
  Modal,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import StageSelectScreen, { BuildingLevels } from './StageSelectScreen';

const BASE_WIDTH = 932; // The width the mockup was authored on

export default function DashboardScreen({ navigation }: any) {
  const { width } = useWindowDimensions();
  const styles = useMemo(() => makeStyles(width), [width]);

  const [selectedMode, setSelectedMode] = useState<'SOLO' | 'PVP'>('SOLO');
  const [modeModalVisible, setModeModalVisible] = useState(false);
  const soloScale = useRef(new Animated.Value(1)).current;
  const pvpScale  = useRef(new Animated.Value(0.88)).current;

  const selectMode = (mode: 'SOLO' | 'PVP') => {
    setSelectedMode(mode);
    Animated.parallel([
      Animated.spring(soloScale, {
        toValue: mode === 'SOLO' ? 1 : 0.88,
        useNativeDriver: true,
        speed: 18,
        bounciness: 4,
      }),
      Animated.spring(pvpScale, {
        toValue: mode === 'PVP' ? 1 : 0.88,
        useNativeDriver: true,
        speed: 18,
        bounciness: 4,
      }),
    ]).start();
  };

  const [stageSelectVisible, setStageSelectVisible] = useState(false);
  const [buildingLevels, setBuildingLevels] = useState<BuildingLevels>({
    tower: 1,
    glade: 1,
    forge: 1,
  });

  return (
    <View style={styles.container}>
      <StatusBar hidden />

      <ImageBackground
        source={require('../assets/dashboard.png')}
        style={styles.background}
        resizeMode="cover"
      >
        <SafeAreaView style={styles.safeArea}>
          {/* ================= TOP SECTION ================= */}
          <View style={styles.topSection}>
            <View style={styles.profileContainer}>
              <View style={styles.avatarBox}>
                <Image
                  source={require('../assets/tempo_pfp.jpg')}
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

            {/* --- Resources & Actions --- */}
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

            {/* Left Nav Menu - Store on top, Intel & Progress on bottom */}
            <View style={styles.bottomLeftWrapper}>
              <TouchableOpacity
                style={styles.storeButton}
                onPress={() => navigation.navigate('Store')}
              >
                <Text style={styles.navButtonText}>Store</Text>
              </TouchableOpacity>

              <View style={styles.bottomLeftContainer}>
                <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('Intelligence')}>
                  <Text style={styles.navButtonText}>Intel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('Progress')}>
                  <Text style={styles.navButtonText}>Progress</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Bottom Right Play Area */}
            <View style={styles.bottomRightContainer}>
              {/* MODE SELECTOR */}
              <TouchableOpacity
                style={styles.modeSelector}
                activeOpacity={0.8}
                onPress={() => setModeModalVisible(true)}
              >
                <View style={styles.modeIconRing}>
                  <Text style={styles.modeIcon}>
                    {selectedMode === 'SOLO' ? '⚔️' : '🛡️'}
                  </Text>
                </View>
                <Text style={styles.modeText}>{selectedMode}</Text>
              </TouchableOpacity>

              {/* DEPLOY / DEFEND BUTTON — changes with selected mode */}
              <TouchableOpacity
                style={[
                  styles.deployButtonOuter,
                  selectedMode === 'PVP' && {
                    backgroundColor: '#ff4466',
                    shadowColor: '#ff2244',
                  },
                ]}
                activeOpacity={0.85}
                onPress={() => {
                  if (selectedMode === 'PVP') {
                    navigation.navigate('PvPHub');
                  } else {
                    setStageSelectVisible(true);
                  }
                }}
              >
                <LinearGradient
                  colors={
                    selectedMode === 'PVP'
                      ? ['#ff6688', '#cc1133', '#880022']
                      : ['#ffe28a', '#ffa634', '#d94d10']
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  style={styles.deployButtonInner}
                >
                  <Text style={styles.deployText}>
                    {selectedMode === 'PVP' ? 'DEFEND' : 'DEPLOY'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </ImageBackground>

      {/* ================= MODE SELECTOR MODAL ================= */}
      <Modal
        visible={modeModalVisible}
        transparent
        animationType="fade"
        supportedOrientations={['landscape', 'landscape-left', 'landscape-right']}
        onRequestClose={() => setModeModalVisible(false)}
      >
        <View style={styles.modalOverlay}>

          {/* Title */}
          <Text style={styles.modalTitle}>SELECT GAME MODE</Text>
          <Text style={styles.modalSubtitle}>Choose how you want to deploy</Text>

          {/* Cards row */}
          <View style={styles.modeCardsContainer}>

            {/* ── SOLO CARD ── */}
            <TouchableOpacity
              onPress={() => selectMode('SOLO')}
              activeOpacity={1}
            >
              <Animated.View
                style={[
                  styles.modeCardOuter,
                  selectedMode === 'SOLO' ? styles.modeCardActive : styles.modeCardInactive,
                  { transform: [{ scale: soloScale }] },
                ]}
              >
                {/* Dark tint for inactive */}
                {selectedMode !== 'SOLO' && <View style={styles.cardDarkOverlay} />}

                {/* Colored background */}
                <LinearGradient
                  colors={['#0a2a4a', '#0d3d6e', '#1a5fa0']}
                  style={styles.cardGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0.6, y: 1 }}
                >
                  {/* Top label */}
                  <View style={styles.cardTopLabel}>
                    <Text style={styles.cardTopLabelTxt}>SINGLE PLAYER</Text>
                  </View>

                  {/* Big icon */}
                  <Text style={styles.cardBigIcon}>🛡️</Text>

                  {/* Bottom content */}
                  <View style={[
                    styles.cardBottom,
                    selectedMode === 'SOLO' && styles.cardBottomActive,
                  ]}>
                    <Text style={styles.cardBottomTitle}>SOLO</Text>
                    <Text style={styles.cardBottomSub}>Module-based campaign</Text>
                    {selectedMode === 'SOLO' && (
                      <View style={styles.selectedBadge}>
                        <Text style={styles.selectedBadgeTxt}>▶ SELECTED</Text>
                      </View>
                    )}
                  </View>
                </LinearGradient>
              </Animated.View>
            </TouchableOpacity>

            {/* ── PVP CARD ── */}
            <TouchableOpacity
              onPress={() => selectMode('PVP')}
              activeOpacity={1}
            >
              <Animated.View
                style={[
                  styles.modeCardOuter,
                  selectedMode === 'PVP' ? styles.modeCardActive : styles.modeCardInactive,
                  { transform: [{ scale: pvpScale }] },
                  selectedMode === 'PVP' && { shadowColor: '#ff4466' },
                ]}
              >
                {selectedMode !== 'PVP' && <View style={styles.cardDarkOverlay} />}

                <LinearGradient
                  colors={['#3a0a1a', '#6e1030', '#a01a45']}
                  style={styles.cardGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0.6, y: 1 }}
                >
                  <View style={styles.cardTopLabel}>
                    <Text style={styles.cardTopLabelTxt}>MULTIPLAYER</Text>
                  </View>

                  <Text style={styles.cardBigIcon}>⚔️</Text>

                  <View style={[
                    styles.cardBottom,
                    selectedMode === 'PVP' && styles.cardBottomActivePvp,
                  ]}>
                    <Text style={styles.cardBottomTitle}>PVP</Text>
                    <Text style={styles.cardBottomSub}>Player vs player battles</Text>
                    {selectedMode === 'PVP' && (
                      <View style={[styles.selectedBadge, { backgroundColor: '#ff4466' }]}>
                        <Text style={styles.selectedBadgeTxt}>▶ SELECTED</Text>
                      </View>
                    )}
                  </View>
                </LinearGradient>
              </Animated.View>
            </TouchableOpacity>

          </View>

          {/* Confirm button */}
          <TouchableOpacity
            style={[
              styles.confirmButton,
              selectedMode === 'PVP' && { backgroundColor: '#ff4466', borderColor: '#ff8899' },
            ]}
            onPress={() => setModeModalVisible(false)}
            activeOpacity={0.85}
          >
            <Text style={styles.confirmButtonText}>CONFIRM  {selectedMode === 'SOLO' ? '🛡️' : '⚔️'}</Text>
          </TouchableOpacity>

          {/* Close hint */}
          <TouchableOpacity onPress={() => setModeModalVisible(false)} style={styles.closeHintBtn}>
            <Text style={styles.closeHint}>✕  CANCEL</Text>
          </TouchableOpacity>

        </View>
      </Modal>

      <StageSelectScreen
        visible={stageSelectVisible}
        onClose={() => setStageSelectVisible(false)}
        navigation={navigation}
        currentStage={1}
        onSelectStage={(stage) => {
          setStageSelectVisible(false); // Close Modal
          navigation.navigate('Game', { stage }); // Go to GameScreen with selected stage
        }}
        buildingLevels={buildingLevels}
        onUpgradeBuilding={(building) => {
          // Local dashboard upgrade logic placeholder
          setBuildingLevels(prev => ({ ...prev, [building]: prev[building] + 1 }));
        }}
      />
    </View>
  );
}

function makeStyles(width: number) {
  const scaleFactor = width / BASE_WIDTH;
  const normalize = (size: number) =>
    Math.round(PixelRatio.roundToNearestPixel(size * scaleFactor));
  const bw = (size: number) => Math.max(1, normalize(size));
  const infoWidth = normalize(280);

  return StyleSheet.create({
    container: {
      flex: 1,
      width: '100%',
      height: '100%',
      backgroundColor: '#060e18',
    },
    background: {
      ...StyleSheet.absoluteFillObject,
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
    bottomLeftWrapper: {
      flexDirection: 'column',
      alignItems: 'flex-start',
    },
    bottomLeftContainer: {
      flexDirection: 'row',
    },
    storeButton: {
      backgroundColor: 'rgba(25, 50, 80, 0.9)',
      borderWidth: bw(2),
      borderColor: '#5a8aaa',
      borderRadius: normalize(8),
      paddingVertical: normalize(14),
      paddingHorizontal: normalize(24),
      marginBottom: normalize(12), // Space between Store and the row below
    },
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

    // === BOTTOM RIGHT PLAY AREA ===
    bottomRightContainer: {
      flexDirection: 'row',
      alignItems: 'flex-end',
    },
    modeSelector: {
      alignItems: 'center',
      marginRight: normalize(20),
    },
    modeIconRing: {
      width: normalize(46),
      height: normalize(46),
      borderRadius: normalize(23),
      borderWidth: bw(2),
      borderColor: '#ffd23f',
      backgroundColor: 'rgba(10, 15, 25, 0.9)',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: normalize(6),
    },
    modeIcon: {
      fontSize: normalize(18),
    },
    modeText: {
      color: '#ffffff',
      fontFamily: 'PixelFont',
      fontSize: normalize(10),
      textShadowColor: '#000',
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 1,
    },
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

    // === MODAL STYLES ===
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.88)',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: normalize(20),
    },
    modalTitle: {
      color: '#ffffff',
      fontFamily: 'PixelFont',
      fontSize: normalize(20),
      marginBottom: normalize(6),
      letterSpacing: 3,
      textShadowColor: '#000',
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 4,
    },
    modalSubtitle: {
      color: '#5a7aaa',
      fontSize: normalize(10),
      letterSpacing: 1,
      marginBottom: normalize(28),
      fontFamily: 'PixelFont',
    },
    modeCardsContainer: {
      flexDirection: 'row',
      gap: normalize(20),
      alignItems: 'center',
    },
    modeCardOuter: {
      width: normalize(200),
      height: normalize(300),
      borderRadius: normalize(16),
      overflow: 'hidden',
      borderWidth: bw(3),
      // Glow effect
      shadowOpacity: 0.9,
      shadowRadius: normalize(20),
      shadowOffset: { width: 0, height: 0 },
      elevation: 12,
    },
    modeCardActive: {
      borderColor: '#ffd23f',
      shadowColor: '#ffd23f',
    },
    modeCardInactive: {
      borderColor: '#1a252f',
      shadowColor: '#000',
    },
    cardDarkOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.62)',
      zIndex: 10,
      borderRadius: normalize(14),
    },
    cardGradient: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingTop: normalize(14),
      paddingBottom: 0,
    },
    cardTopLabel: {
      backgroundColor: 'rgba(0,0,0,0.45)',
      borderRadius: normalize(20),
      paddingHorizontal: normalize(12),
      paddingVertical: normalize(4),
    },
    cardTopLabelTxt: {
      color: 'rgba(255,255,255,0.7)',
      fontSize: normalize(8),
      fontFamily: 'PixelFont',
      letterSpacing: 2,
    },
    cardBigIcon: {
      fontSize: normalize(52),
      marginVertical: normalize(8),
    },
    cardBottom: {
      width: '100%',
      alignItems: 'center',
      paddingVertical: normalize(16),
      paddingHorizontal: normalize(12),
      backgroundColor: 'rgba(0,0,0,0.50)',
      gap: normalize(4),
    },
    cardBottomActive: {
      backgroundColor: 'rgba(255,210,63,0.18)',
      borderTopWidth: bw(2),
      borderTopColor: '#ffd23f',
    },
    cardBottomActivePvp: {
      backgroundColor: 'rgba(255,68,102,0.18)',
      borderTopWidth: bw(2),
      borderTopColor: '#ff4466',
    },
    cardBottomTitle: {
      color: '#ffffff',
      fontFamily: 'PixelFont',
      fontSize: normalize(22),
      letterSpacing: 2,
      textShadowColor: '#000',
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 2,
    },
    cardBottomSub: {
      color: 'rgba(255,255,255,0.6)',
      fontSize: normalize(8),
      fontFamily: 'PixelFont',
      letterSpacing: 0.5,
      textAlign: 'center',
    },
    selectedBadge: {
      marginTop: normalize(8),
      backgroundColor: '#ffd23f',
      borderRadius: normalize(20),
      paddingHorizontal: normalize(14),
      paddingVertical: normalize(4),
    },
    selectedBadgeTxt: {
      color: '#050a15',
      fontFamily: 'PixelFont',
      fontSize: normalize(9),
      letterSpacing: 1,
    },
    confirmButton: {
      marginTop: normalize(28),
      backgroundColor: '#ffd23f',
      paddingVertical: normalize(14),
      paddingHorizontal: normalize(48),
      borderRadius: normalize(28),
      borderWidth: bw(2),
      borderColor: '#fff8d0',
      shadowColor: '#ffd23f',
      shadowOpacity: 0.8,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 0 },
      elevation: 10,
    },
    confirmButtonText: {
      color: '#050a15',
      fontFamily: 'PixelFont',
      fontSize: normalize(14),
      fontWeight: 'bold',
      letterSpacing: 1,
    },
    closeHintBtn: {
      marginTop: 16,
    },
    closeHint: {
      color: '#3a4a60',
      fontFamily: 'PixelFont',
      fontSize: normalize(9),
      letterSpacing: 2,
    },
  });
}