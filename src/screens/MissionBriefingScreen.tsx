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
} from 'react-native';

const { width, height } = Dimensions.get('window');
const BASE_WIDTH = 932;
const scaleFactor = width / BASE_WIDTH;
const normalize = (size: number) =>
  Math.round(PixelRatio.roundToNearestPixel(size * scaleFactor));
const bw = (size: number) => Math.max(1, normalize(size));

// Helper component for the objective list
type ObjectiveStatus = 'completed' | 'active' | 'pending';

const ObjectiveItem = ({ status, text }: { status: ObjectiveStatus, text: string }) => {
  const isCompleted = status === 'completed';
  const isActive = status === 'active';
  
  return (
    <View style={[styles.objectiveRow, isActive && styles.objectiveRowActive]}>
      <View style={[
        styles.checkbox, 
        isCompleted && styles.checkboxCompleted, 
        isActive && styles.checkboxActive
      ]}>
        {isCompleted && <Text style={styles.checkIcon}>✓</Text>}
        {isActive && <Text style={styles.arrowIcon}>{'>'}</Text>}
      </View>
      <View style={styles.objectiveTextContainer}>
         <Text style={[
           styles.objectiveText, 
           isCompleted && styles.objectiveTextCompleted, 
           isActive && styles.objectiveTextActive
         ]}>
           {text}
         </Text>
      </View>
      {isActive && (
        <View style={styles.nextBadge}>
          <Text style={styles.nextBadgeText}>NEXT</Text>
        </View>
      )}
    </View>
  );
};

export default function MissionBriefingScreen({ navigation }: any) {
  return (
    <View style={styles.container}>
      <StatusBar hidden />
      
      {/* Top red accent line */}
      <View style={styles.topRedLine} />
      
      <SafeAreaView style={styles.safeArea}>
        
        {/* === TOP BAR === */}
        <View style={styles.topBar}>
          <View style={styles.topBarLeft}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.consoleBtn}>
               <Text style={styles.consoleBtnText}>{'< Console'}</Text>
            </TouchableOpacity>
            <Text style={styles.activeMissionText}>❖ ACTIVE MISSION</Text>
          </View>
          
          <View style={styles.topBarRight}>
             <Text style={styles.threatText}>THREAT LEVEL</Text>
             <View style={styles.threatBars}>
                <View style={[styles.threatBar, { backgroundColor: '#f1c40f' }]} />
                <View style={[styles.threatBar, { backgroundColor: '#f39c12' }]} />
                <View style={[styles.threatBar, { backgroundColor: '#2c3e50' }]} />
             </View>
             <View style={styles.liveBadge}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>LIVE</Text>
             </View>
          </View>
        </View>

        {/* === HEADER & PROGRESS === */}
        <View style={styles.mainContent}>
           <Text style={styles.moduleText}>MODULE 1</Text>
           <Text style={styles.titleText}>Scam Defense{'\n'}Basics</Text>
           <Text style={styles.subtitleText}>Intercept phishing attacks before they breach city infrastructure.</Text>

           <View style={styles.progressSection}>
              <View style={styles.progressBarContainer}>
                 <View style={[styles.progressBarFill, { width: '65%' }]} />
              </View>
              <Text style={styles.xpText}>420/650 XP</Text>
           </View>

           {/* === OBJECTIVES LIST === */}
           <View style={styles.objectivesSection}>
              <Text style={styles.objectivesTitle}>MISSION OBJECTIVES</Text>
              <ObjectiveItem status="completed" text="Complete 5 matches" />
              <ObjectiveItem status="completed" text="Score 70%+ accuracy once" />
              <ObjectiveItem status="active" text="Reach a 5-match win streak" />
              <ObjectiveItem status="pending" text="Hit 90%+ accuracy in a single match" />
           </View>
        </View>

        {/* === BOTTOM PLAY BUTTON === */}
        <TouchableOpacity style={styles.playButton} activeOpacity={0.9} onPress={() => navigation.navigate('Game')}>
           <View style={styles.playButtonContent}>
              <Text style={styles.playButtonTitle}>Play Match</Text>
              <Text style={styles.playButtonSub}>LAUNCH THIS MISSION</Text>
           </View>
           {/* Pure CSS triangle overlay to match the image detail */}
           <View style={styles.playButtonTriangle} />
        </TouchableOpacity>

      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0c161e', // Dark navy background
  },
  topRedLine: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: normalize(4),
    backgroundColor: '#e74c3c', 
  },
  safeArea: {
    flex: 1,
    justifyContent: 'space-between',
  },
  
  // TOP BAR
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: normalize(30),
    paddingTop: normalize(20),
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  consoleBtn: {
    marginRight: normalize(16),
  },
  consoleBtnText: {
    color: '#bdc3c7',
    fontSize: normalize(16),
    fontWeight: 'bold',
  },
  activeMissionText: {
    color: '#34495e',
    fontSize: normalize(12),
    fontWeight: '800',
    letterSpacing: 2,
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  threatText: {
    color: '#34495e',
    fontSize: normalize(10),
    fontWeight: '900',
    letterSpacing: 1.5,
    marginRight: normalize(8),
  },
  threatBars: {
    flexDirection: 'row',
    marginRight: normalize(16),
  },
  threatBar: {
    width: normalize(6),
    height: normalize(14),
    borderRadius: normalize(2),
    marginRight: normalize(4),
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: bw(1),
    borderColor: '#c0392b',
    borderRadius: normalize(4),
    paddingHorizontal: normalize(8),
    paddingVertical: normalize(4),
  },
  liveDot: {
    width: normalize(6),
    height: normalize(6),
    borderRadius: normalize(3),
    backgroundColor: '#e74c3c',
    marginRight: normalize(6),
  },
  liveText: {
    color: '#e74c3c',
    fontSize: normalize(10),
    fontWeight: '900',
    letterSpacing: 1,
  },

  // MAIN CONTENT
  mainContent: {
    flex: 1,
    paddingHorizontal: normalize(30),
    marginTop: normalize(30),
  },
  moduleText: {
    color: '#00d2d3', // Cyan
    fontSize: normalize(12),
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: normalize(8),
  },
  titleText: {
    color: '#ffffff',
    fontSize: normalize(40),
    fontWeight: '900',
    lineHeight: normalize(42),
    marginBottom: normalize(8),
  },
  subtitleText: {
    color: '#7f8c8d',
    fontSize: normalize(14),
    marginBottom: normalize(24),
  },

  // PROGRESS
  progressSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: normalize(40),
  },
  progressBarContainer: {
    flex: 1,
    height: normalize(6),
    backgroundColor: '#1a252f',
    marginRight: normalize(16),
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#e67e22', // Orange
  },
  xpText: {
    color: '#5a7b8c',
    fontSize: normalize(12),
    fontWeight: '800',
  },

  // OBJECTIVES
  objectivesSection: {
    flex: 1,
  },
  objectivesTitle: {
    color: '#34495e',
    fontSize: normalize(11),
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: normalize(16),
  },
  objectiveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: normalize(12),
    paddingVertical: normalize(10),
    paddingHorizontal: normalize(12),
    borderRadius: normalize(4),
  },
  objectiveRowActive: {
    backgroundColor: 'rgba(39, 174, 96, 0.15)',
    borderWidth: bw(1),
    borderColor: '#27ae60',
  },
  checkbox: {
    width: normalize(20),
    height: normalize(20),
    borderWidth: bw(2),
    borderColor: '#34495e',
    borderRadius: normalize(4),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: normalize(12),
  },
  checkboxCompleted: {
    borderColor: '#2ecc71',
  },
  checkboxActive: {
    borderColor: '#2ecc71',
    backgroundColor: '#2ecc71',
  },
  checkIcon: {
    color: '#2ecc71',
    fontSize: normalize(14),
    fontWeight: '900',
  },
  arrowIcon: {
    color: '#0c161e',
    fontSize: normalize(12),
    fontWeight: '900',
  },
  objectiveTextContainer: {
    flex: 1,
  },
  objectiveText: {
    color: '#81ecec', 
    fontSize: normalize(14),
    fontWeight: '700',
  },
  objectiveTextCompleted: {
    color: '#34495e',
    textDecorationLine: 'line-through',
  },
  objectiveTextActive: {
    color: '#ffffff',
    fontWeight: '900',
  },
  nextBadge: {
    backgroundColor: '#27ae60',
    paddingHorizontal: normalize(8),
    paddingVertical: normalize(4),
    borderRadius: normalize(4),
  },
  nextBadgeText: {
    color: '#ffffff',
    fontSize: normalize(10),
    fontWeight: '900',
    letterSpacing: 1,
  },

  // PLAY BUTTON
  playButton: {
    backgroundColor: '#48dbfb', 
    width: '100%',
    paddingVertical: normalize(20),
    paddingHorizontal: normalize(30),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    overflow: 'hidden',
  },
  playButtonContent: {
    zIndex: 2,
  },
  playButtonTitle: {
    color: '#ffffff',
    fontSize: normalize(36),
    fontWeight: '900',
    marginBottom: normalize(4),
  },
  playButtonSub: {
    color: '#0abde3', // Darker text for the sub label
    fontSize: normalize(12),
    fontWeight: '900',
    letterSpacing: 2,
  },
  playButtonTriangle: {
    position: 'absolute',
    right: normalize(-30),
    top: normalize(-20),
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderTopWidth: normalize(80),
    borderRightWidth: normalize(80),
    borderBottomWidth: normalize(80),
    borderLeftWidth: normalize(80),
    borderTopColor: 'transparent',
    borderRightColor: 'rgba(10, 189, 227, 0.4)', // faint triangle overlay
    borderBottomColor: 'transparent',
    borderLeftColor: 'transparent',
    zIndex: 1,
  }
});