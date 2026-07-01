import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  SafeAreaView,
  Dimensions,
  StatusBar,
  PixelRatio,
  Modal,
} from 'react-native';

const { width, height } = Dimensions.get('window');
const BASE_WIDTH = 932;
const scaleFactor = width / BASE_WIDTH;
const normalize = (size: number) => Math.round(PixelRatio.roundToNearestPixel(size * scaleFactor));
const bw = (size: number) => Math.max(1, normalize(size));

// Helper component for the top-left resource list
const ResourceItem = ({ icon, value }: { icon: string; value: string }) => (
  <View style={styles.resourceRow}>
    <Text style={styles.resourceIcon}>{icon}</Text>
    <Text style={styles.resourceValue}>{value}</Text>
  </View>
);

export default function GameScreen({ navigation }: any) {
    const [isMenuVisible, setIsMenuVisible] = useState(false);

  return (
    <View style={styles.container}>
      <StatusBar hidden />

      {/* Main Game Background (The map) */}
      <ImageBackground
        // TODO: Replace with your actual dark forest map asset
        source={{ uri: 'https://via.placeholder.com/1920x1080/1a0b1c/ffffff?text=Map+Asset' }}
        style={[styles.background, { width, height }]}
        resizeMode="cover"
      >
        {/* HUD Overlay - pointerEvents="box-none" lets touches pass through to the map */}
        <SafeAreaView style={styles.safeArea} pointerEvents="box-none">
          
          {/* ================= TOP HUD ================= */}
          <View style={styles.topHud} pointerEvents="box-none">
            
            {/* --- Top Left: Resources --- */}
            <View style={styles.topLeft} pointerEvents="box-none">
              <ResourceItem icon="🪙" value="0" />
              <ResourceItem icon="🪵" value="5" />
              <ResourceItem icon="💎" value="0" />
              <ResourceItem icon="🗝️" value="0" />
            </View>

            {/* --- Top Center: Wave Progress --- */}
            <View style={styles.topCenter} pointerEvents="box-none">
              <View style={styles.waveBarOuter}>
                <View style={styles.waveBarInner} />
              </View>
              <View style={styles.waveCountOuter}>
                 <Text style={styles.waveCountText}>0/10</Text>
              </View>
            </View>

            {/* --- Top Right: Map Info & Settings --- */}
            <View style={styles.topRight} pointerEvents="box-none">
              <Text style={styles.mapText}>Map A1</Text>
              <TouchableOpacity style={styles.settingsBtn} onPress={() => setIsMenuVisible(true)}>
                <Text style={styles.settingsIcon}>⚙️</Text>
              </TouchableOpacity>
            </View>

          </View>

          {/* ================= BOTTOM HUD ================= */}
          <View style={styles.bottomHud} pointerEvents="box-none">
            
            {/* Empty view to help balance flexbox spacing */}
            <View style={{ flex: 1 }} pointerEvents="box-none" />

            {/* --- Bottom Center: Unit Deck (Drag Source) --- */}
            <View style={styles.deckContainer} pointerEvents="box-none">
              <Text style={styles.deckArrow}>⬇</Text>
              <TouchableOpacity style={styles.unitCardOuter} activeOpacity={0.8}>
                <View style={styles.unitCardInner}>
                  {/* Placeholder for tower/unit sprite */}
                  <Text style={styles.unitSprite}>🧙‍♂️</Text>
                </View>
                <View style={styles.unitCountBadge}>
                  <Text style={styles.unitCountText}>x1</Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* --- Bottom Right: Start Wave Button --- */}
            <View style={styles.bottomRight} pointerEvents="box-none">
              <TouchableOpacity style={styles.startBtn} onPress={() => console.log('Wave Started!')}>
                <Text style={styles.startText}>START</Text>
              </TouchableOpacity>
            </View>

          </View>

        </SafeAreaView>
      </ImageBackground>
      <Modal visible={isMenuVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.menuContainer}>
            <Text style={styles.menuTitle}>PAUSED</Text>
            
            <TouchableOpacity style={styles.menuButton} onPress={() => setIsMenuVisible(false)}>
              <Text style={styles.menuButtonText}>RESUME</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.menuButton} onPress={() => console.log('Options clicked!')}>
              <Text style={styles.menuButtonText}>OPTIONS</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuButton} onPress={() => {
              setIsMenuVisible(false);
              navigation.navigate('Dashboard'); // Returns to the dashboard map
            }}>
              <Text style={styles.menuButtonText}>BACK TO DASHBOARD</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  background: {
    position: 'absolute',
    top: 0, left: 0,
  },
  safeArea: {
    flex: 1,
    justifyContent: 'space-between',
    padding: normalize(16),
  },

  // === TOP HUD ===
  topHud: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  topLeft: {
    flex: 1, // takes up 1/3 of top space
    alignItems: 'flex-start',
    gap: normalize(10),
  },
  resourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resourceIcon: {
    fontSize: normalize(18),
    marginRight: normalize(12),
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  resourceValue: {
    color: '#fff',
    fontFamily: 'PixelFont',
    fontSize: normalize(16),
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 1,
  },

  topCenter: {
    flex: 1, // takes up middle 1/3
    alignItems: 'center',
    marginTop: normalize(4),
  },
  waveBarOuter: {
    width: normalize(280),
    height: normalize(18),
    backgroundColor: '#1a1016',
    borderWidth: bw(2),
    borderColor: '#e8d5b5', // Retro creamy yellow border
    borderRadius: normalize(4),
    marginBottom: normalize(4),
  },
  waveBarInner: {
    flex: 1,
    margin: bw(1),
    borderWidth: bw(1),
    borderColor: '#4a3040',
    backgroundColor: '#2a1a24', // Empty fill color
  },
  waveCountOuter: {
    backgroundColor: '#1a1016',
    borderWidth: bw(2),
    borderColor: '#e8d5b5',
    paddingVertical: normalize(4),
    paddingHorizontal: normalize(24),
    borderRadius: normalize(4),
  },
  waveCountText: {
    color: '#fff',
    fontFamily: 'PixelFont',
    fontSize: normalize(14),
  },

  topRight: {
    flex: 1, // takes up last 1/3
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-end',
  },
  mapText: {
    color: '#fff',
    fontFamily: 'PixelFont',
    fontSize: normalize(20),
    marginRight: normalize(16),
    marginTop: normalize(4),
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 1,
  },
  settingsBtn: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsIcon: {
    fontSize: normalize(24),
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },

  // === BOTTOM HUD ===
  bottomHud: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },

  deckContainer: {
    flex: 1,
    alignItems: 'center',
  },
  deckArrow: {
    color: '#fff',
    fontSize: normalize(24),
    marginBottom: normalize(4),
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
    opacity: 0.8,
  },
  unitCardOuter: {
    width: normalize(64),
    height: normalize(64),
    backgroundColor: '#1a1016',
    borderWidth: bw(2),
    borderColor: '#e8d5b5',
    borderRadius: normalize(6),
    justifyContent: 'center',
    alignItems: 'center',
  },
  unitCardInner: {
    flex: 1,
    width: '100%',
    margin: bw(1),
    borderWidth: bw(1),
    borderColor: '#8e6c7a',
    backgroundColor: '#2a1a24',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: normalize(4),
  },
  unitSprite: {
    fontSize: normalize(28),
  },
  unitCountBadge: {
    position: 'absolute',
    bottom: normalize(-12),
    backgroundColor: '#1a1016',
    paddingHorizontal: normalize(6),
    paddingVertical: normalize(2),
    borderRadius: normalize(4),
    borderWidth: bw(1),
    borderColor: '#e8d5b5',
  },
  unitCountText: {
    color: '#fff',
    fontFamily: 'PixelFont',
    fontSize: normalize(10),
  },

  bottomRight: {
    flex: 1,
    alignItems: 'flex-end',
    marginRight: normalize(16),
    marginBottom: normalize(8),
  },
  startBtn: {
    alignItems: 'center',
  },
  startText: {
    color: '#fff',
    fontFamily: 'PixelFont',
    fontSize: normalize(32),
    marginBottom: normalize(4),
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 1,
  },
  startSubText: {
    color: '#fff',
    fontFamily: 'PixelFont',
    fontSize: normalize(10),
    opacity: 0.8,
  },
    // === MODAL STYLES ===
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)', // Darkens the game behind the menu
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContainer: {
    backgroundColor: '#1a1016',
    borderWidth: bw(3),
    borderColor: '#e8d5b5', // Matches the retro creamy borders
    borderRadius: normalize(8),
    padding: normalize(24),
    width: normalize(320),
    alignItems: 'center',
  },
  menuTitle: {
    color: '#e8d5b5',
    fontFamily: 'PixelFont',
    fontSize: normalize(28),
    marginBottom: normalize(32),
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 1,
  },
  menuButton: {
    backgroundColor: '#2a1a24',
    borderWidth: bw(2),
    borderColor: '#8e6c7a',
    borderRadius: normalize(6),
    paddingVertical: normalize(14),
    paddingHorizontal: normalize(20),
    marginBottom: normalize(16),
    width: '100%',
    alignItems: 'center',
  },
  menuButtonText: {
    color: '#fff',
    fontFamily: 'PixelFont',
    fontSize: normalize(14),
  },
});