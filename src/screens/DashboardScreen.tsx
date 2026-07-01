import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Dimensions,
  StatusBar,
  PixelRatio,
  Modal,
} from 'react-native';

const { width, height } = Dimensions.get('window');
const BASE_WIDTH = 932;
const scaleFactor = width / BASE_WIDTH;
const normalize = (size: number) =>
  Math.round(PixelRatio.roundToNearestPixel(size * scaleFactor));
const bw = (size: number) => Math.max(1, normalize(size));

export default function DashboardScreen({ navigation }: any) {
  const [selectedMode, setSelectedMode] = useState<'SOLO' | 'PVP'>('SOLO');
  const [modeModalVisible, setModeModalVisible] = useState(false);

  return (
    <View style={styles.container}>
      <StatusBar hidden />

      <ImageBackground
        source={require('../assets/dashboard.png')}
        style={[styles.background, { width, height }]}
        resizeMode="cover"
      >
        <SafeAreaView style={styles.safeArea}>

          {/* ================= TOP BAR ================= */}
          <View style={styles.topBarContainer}>

            {/* Player Info (Left) */}
            <View style={styles.playerSection}>
              <View style={styles.avatarContainer}>
                <Image
                  source={require('../assets/tempo_pfp.jpg')}
                  style={styles.avatarImage}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.playerName}>COMMANDER_X</Text>
            </View>

            {/* Resources & Settings (Right) */}
            <View style={styles.topRightSection}>
              <View style={styles.resourceItem}>
                <Text style={styles.resourceIcon}>💀</Text>
                <Text style={styles.resourceText}>2400</Text>
              </View>
              <View style={styles.resourceItem}>
                <Text style={styles.resourceIcon}>🔧</Text>
                <Text style={styles.resourceText}>1150</Text>
              </View>
              <TouchableOpacity style={styles.actionIconBtn}>
                <Text style={styles.actionIcon}>✉️</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionIconBtn}>
                <Text style={styles.actionIcon}>⚙️</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ================= MAIN CONTENT ================= */}
          <View style={styles.mainContent}>

            {/* --- LEFT MENU --- */}
            <View style={styles.leftMenu}>

              {/* PROGRESS (Replacing Rewards) */}
              <TouchableOpacity
                style={styles.menuItem}
                activeOpacity={0.8}
                onPress={() => navigation.navigate('Progress')}
              >
                <View style={styles.menuIconRing}>
                  <Text style={styles.menuIcon}>📈</Text>
                </View>
                <View style={styles.menuTextContainer}>
                  <Text style={styles.menuTitle}>PROGRESS</Text>
                  <Text style={styles.menuSub}>ELITE I  1450 / 2000</Text>
                  <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, { width: '72.5%' }]} />
                  </View>
                </View>
              </TouchableOpacity>

              {/* STORE */}
              <TouchableOpacity
                style={styles.menuItem}
                activeOpacity={0.8}
                onPress={() => navigation.navigate('Store')}
              >
                <View style={styles.menuIconRing}>
                  <Text style={styles.menuIcon}>🪙</Text>
                </View>
                <View style={styles.menuTextContainer}>
                  <Text style={styles.menuTitle}>STORE</Text>
                </View>
              </TouchableOpacity>

              {/* INTELLIGENCE (Replacing Team Planner) */}
              <TouchableOpacity
                style={styles.menuItem}
                activeOpacity={0.8}
                onPress={() => navigation.navigate('Intelligence')}
              >
                <View style={styles.menuIconRing}>
                  <Text style={styles.menuIcon}>🛡️</Text>
                </View>
                <View style={styles.menuTextContainer}>
                  <Text style={styles.menuTitle}>INTELLIGENCE</Text>
                </View>
              </TouchableOpacity>

            </View>

            {/* --- BOTTOM RIGHT PLAY AREA --- */}
            <View style={styles.playArea}>

              {/* MODE SELECTOR */}
              <TouchableOpacity
                style={styles.modeSelector}
                activeOpacity={0.8}
                onPress={() => setModeModalVisible(true)} // <-- Opens Modal
              >
                <View style={styles.modeIconRing}>
                  <Text style={styles.modeIcon}>
                    {selectedMode === 'SOLO' ? '⚔️' : '🛡️'}
                  </Text>
                </View>
                <Text style={styles.modeText}>{selectedMode}</Text>
              </TouchableOpacity>
              {/* DEPLOY BUTTON */}
              <TouchableOpacity
                style={styles.playButtonOuter}
                activeOpacity={0.9}
                onPress={() => navigation.navigate('MissionBriefing')}
              >
                <View style={styles.playButtonInner}>
                  <Text style={styles.playButtonText}>DEPLOY</Text>
                </View>
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
      >
        <View style={styles.modalOverlay}>
          <Text style={styles.modalTitle}>SELECT GAME MODE</Text>

          <View style={styles.modeCardsContainer}>

            {/* --- SOLO CARD --- */}
            <TouchableOpacity
              style={[styles.modeCardOuter, selectedMode === 'SOLO' ? styles.modeCardActive : styles.modeCardInactive]}
              onPress={() => setSelectedMode('SOLO')}
              activeOpacity={0.9}
            >
              <ImageBackground
                source={{ uri: 'https://via.placeholder.com/300x400/12243a/ffffff?text=Solo+Art' }} // Replace with actual art later
                style={styles.modeCardImage}
              >
                <View style={[styles.modeOverlay, selectedMode === 'SOLO' ? styles.overlayActive : styles.overlayInactive]}>
                  <Text style={styles.modeCardBigIcon}>⚔️</Text>
                  <Text style={styles.modeCardBigText}>SOLO</Text>
                </View>
              </ImageBackground>
            </TouchableOpacity>
            {/* --- PVP CARD --- */}
            <TouchableOpacity
              style={[styles.modeCardOuter, selectedMode === 'PVP' ? styles.modeCardActive : styles.modeCardInactive]}
              onPress={() => setSelectedMode('PVP')}
              activeOpacity={0.9}
            >
              <ImageBackground
                source={{ uri: 'https://via.placeholder.com/300x400/3a121d/ffffff?text=PVP+Art' }} // Replace with actual art later
                style={styles.modeCardImage}
              >
                <View style={[styles.modeOverlay, selectedMode === 'PVP' ? styles.overlayActive : styles.overlayInactive]}>
                  <Text style={styles.modeCardBigIcon}>🛡️</Text>
                  <Text style={styles.modeCardBigText}>PVP</Text>
                </View>
              </ImageBackground>
            </TouchableOpacity>
          </View>
          {/* CONFIRM BUTTON */}
          <TouchableOpacity style={styles.confirmButton} onPress={() => setModeModalVisible(false)} activeOpacity={0.8}>
            <Text style={styles.confirmButtonText}>CONFIRM</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050a15',
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  safeArea: {
    flex: 1,
  },

  // === TOP BAR ===
  topBarContainer: {
    height: normalize(32),
    backgroundColor: 'rgba(5, 12, 24, 0.85)',
    borderBottomWidth: bw(1),
    borderTopWidth: bw(1),
    borderColor: '#bda05e', // TFT Gold
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: normalize(16),
    marginTop: normalize(20), // Gives room for the avatar to overhang the top
  },
  playerSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: normalize(56),
    height: normalize(56),
    borderRadius: normalize(28),
    borderWidth: bw(2),
    borderColor: '#bda05e',
    backgroundColor: '#0a1626',
    position: 'absolute',
    left: normalize(16),
    // Mathematically vertically centered across the 32px bar: (56 - 32) / 2 = 12
    top: normalize(-12),
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    zIndex: 10,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  playerName: {
    marginLeft: normalize(86), // Clears the absolutely positioned avatar
    color: '#ffffff',
    fontFamily: 'PixelFont',
    fontSize: normalize(12),
  },

  topRightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    paddingHorizontal: normalize(10),
    paddingVertical: normalize(4),
    borderRadius: normalize(12),
    marginLeft: normalize(12),
  },
  resourceIcon: {
    fontSize: normalize(12),
  },
  resourceText: {
    color: '#ffffff',
    fontFamily: 'PixelFont',
    fontSize: normalize(10),
    marginLeft: normalize(6),
  },
  actionIconBtn: {
    marginLeft: normalize(16),
  },
  actionIcon: {
    fontSize: normalize(16),
  },

  // === MAIN CONTENT ===
  mainContent: {
    flex: 1,
    position: 'relative',
  },

  // --- LEFT MENU ---
  leftMenu: {
    marginTop: normalize(32),
    paddingLeft: normalize(24),
    gap: normalize(24),
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIconRing: {
    width: normalize(52),
    height: normalize(52),
    borderRadius: normalize(26),
    borderWidth: bw(2),
    borderColor: '#bda05e',
    backgroundColor: 'rgba(10, 15, 25, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: normalize(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 5,
  },
  menuIcon: {
    fontSize: normalize(22),
  },
  menuTextContainer: {
    justifyContent: 'center',
  },
  menuTitle: {
    color: '#ffffff',
    fontFamily: 'PixelFont',
    fontSize: normalize(16),
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  menuSub: {
    color: '#bda05e', // Gold color for rank
    fontFamily: 'PixelFont',
    fontSize: normalize(9),
    marginTop: normalize(6),
    marginBottom: normalize(4),
  },
  progressBarBg: {
    width: normalize(130),
    height: normalize(4),
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: normalize(2),
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#bda05e', // Gold fill
    borderRadius: normalize(2),
  },

  // --- BOTTOM RIGHT PLAY AREA ---
  playArea: {
    position: 'absolute',
    bottom: normalize(24),
    right: normalize(24),
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
    borderColor: '#bda05e',
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

  // Outer glowing/cyan border matching TFT's play button
  playButtonOuter: {
    width: normalize(200),
    height: normalize(56),
    borderRadius: normalize(28),
    backgroundColor: '#0c5c87', // Outer Cyan/blue
    padding: bw(2),
    borderWidth: bw(2),
    borderColor: '#4bcffa', // Bright cyan border
    justifyContent: 'center',
    shadowColor: '#4bcffa',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 8,
  },
  playButtonInner: {
    flex: 1,
    borderRadius: normalize(26),
    backgroundColor: '#0a3d5e', // Darker inner blue
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButtonText: {
    color: '#ffffff',
    fontFamily: 'PixelFont',
    fontSize: normalize(22),
    letterSpacing: 2,
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  // === MODAL STYLES ===
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    color: '#bda05e',
    fontFamily: 'PixelFont',
    fontSize: normalize(24),
    marginBottom: normalize(32),
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    letterSpacing: 2,
  },
  modeCardsContainer: {
    flexDirection: 'row',
    gap: normalize(32), // Space between cards
  },
  modeCardOuter: {
    width: normalize(220),
    height: normalize(320),
    borderRadius: normalize(12),
    overflow: 'hidden',
    borderWidth: bw(3),
    backgroundColor: '#0a1520',
  },
  modeCardActive: {
    borderColor: '#bda05e', // Gold glow for selected
    transform: [{ scale: 1.05 }], // Slightly enlarges the selected card
  },
  modeCardInactive: {
    borderColor: '#1a252f', // Dull border for unselected
    transform: [{ scale: 0.95 }], // Shrinks unselected slightly
  },
  modeCardImage: {
    width: '100%',
    height: '100%',
  },
  modeOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayActive: {
    backgroundColor: 'rgba(0,0,0,0.1)', // Lightens the image
  },
  overlayInactive: {
    backgroundColor: 'rgba(0,0,0,0.75)', // Darkens the image drastically
  },
  modeCardBigIcon: {
    fontSize: normalize(48),
    marginBottom: normalize(12),
  },
  modeCardBigText: {
    color: '#ffffff',
    fontFamily: 'PixelFont',
    fontSize: normalize(28),
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  confirmButton: {
    marginTop: normalize(48),
    backgroundColor: '#bda05e',
    paddingVertical: normalize(14),
    paddingHorizontal: normalize(48),
    borderRadius: normalize(28),
    borderWidth: bw(2),
    borderColor: '#fff',
  },
  confirmButtonText: {
    color: '#050a15', // Dark text on gold button
    fontFamily: 'PixelFont',
    fontSize: normalize(18),
    fontWeight: 'bold',
  },
});