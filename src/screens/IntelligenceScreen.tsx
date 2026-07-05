import React from 'react';
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
} from 'react-native';

const { width, height } = Dimensions.get('window');
const BASE_WIDTH = 932;
const scaleFactor = width / BASE_WIDTH;
const normalize = (size: number) =>
  Math.round(PixelRatio.roundToNearestPixel(size * scaleFactor));
const bw = (size: number) => Math.max(1, normalize(size));

export default function IntelligenceScreen({ navigation }: any) {
  return (
    <View style={styles.container}>
      <StatusBar hidden />

      <ImageBackground
        source={require('../assets/dashboard.png')}
        style={[styles.background, { width, height }]}
        resizeMode="cover"
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.topBarContainer}>
            <View style={styles.leftHeader}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
                activeOpacity={0.8}
              >
                <Text style={styles.backButtonText}>←</Text>
              </TouchableOpacity>
              <Text style={styles.headerTitle}>INTELLIGENCE</Text>
            </View>

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

          <View style={styles.centerContent}>
            <View style={styles.buttonRow}>
              <TouchableOpacity 
                style={styles.optionCard} 
                activeOpacity={0.9}
                onPress={() => navigation.navigate('Lessons')}
              >
                <ImageBackground
                  source={require('../assets/dashboard.png')}
                  style={styles.cardBackground}
                  imageStyle={styles.cardImage}
                  resizeMode="cover"
                >
                  <View style={styles.cardOverlay}>
                    <Text style={styles.cardTitle}>LESSONS</Text>
                  </View>
                </ImageBackground>
              </TouchableOpacity>

              <TouchableOpacity style={styles.optionCard} activeOpacity={0.9} onPress={() => navigation.navigate('Codex')}>
                <ImageBackground
                  source={require('../assets/dashboard.png')}
                  style={styles.cardBackground}
                  imageStyle={styles.cardImage}
                  resizeMode="cover"
                >
                  <View style={styles.cardOverlay}>
                    <Text style={styles.cardTitle}>CODEX</Text>
                  </View>
                </ImageBackground>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </ImageBackground>
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
  topBarContainer: {
    height: normalize(48),
    backgroundColor: 'rgba(5, 12, 24, 0.9)',
    borderBottomWidth: bw(1),
    borderTopWidth: bw(1),
    borderColor: '#bda05e',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: normalize(16),
    marginTop: normalize(20),
  },
  leftHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    width: normalize(38),
    height: normalize(38),
    borderRadius: normalize(19),
    borderWidth: bw(2),
    borderColor: '#bda05e',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(10, 15, 25, 0.9)',
    marginRight: normalize(12),
  },
  backButtonText: {
    color: '#ffffff',
    fontFamily: 'PixelFont',
    fontSize: normalize(16),
  },
  headerTitle: {
    color: '#ffffff',
    fontFamily: 'PixelFont',
    fontSize: normalize(12),
    letterSpacing: 1,
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
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: normalize(24),
  },
  buttonRow: {
    flexDirection: 'row',
    gap: normalize(24),
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionCard: {
    width: normalize(240),
    height: normalize(320),
    borderRadius: normalize(16),
    overflow: 'hidden',
    borderWidth: bw(2),
    borderColor: '#bda05e',
    backgroundColor: 'rgba(10, 15, 25, 0.8)',
  },
  cardBackground: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  cardImage: {
    opacity: 0.2,
  },
  cardOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  cardTitle: {
    color: '#ffffff',
    fontFamily: 'PixelFont',
    fontSize: normalize(18),
    letterSpacing: 2,
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});
