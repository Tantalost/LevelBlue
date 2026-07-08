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
  ScrollView,
} from 'react-native';
import { MODULES } from './LessonsScreen';
import { useProgressionStore } from '../store/useProgressionStore';

const { width, height } = Dimensions.get('window');
const BASE_WIDTH = 390; // Reduced from 932 for better mobile scaling
const scaleFactor = Math.min(width / BASE_WIDTH, 1.2); // Cap scaling to prevent oversized elements
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
  const currentStage = useProgressionStore((s) => s.currentStage);
  const highestUnlockedStage = useProgressionStore((s) => s.highestUnlockedStage);
  
  // Determine current module based on stage progression
  const currentModule = MODULES.find(m => m.unlocked) || MODULES[0];
  const nextModule = MODULES.find(m => !m.unlocked);
  
  // Generate objectives based on progression
  const getObjectives = () => {
    const objectives: { status: ObjectiveStatus; text: string }[] = [];
    
    // Stage progression objectives
    for (let i = 1; i <= 4; i++) {
      if (i < currentStage) {
        objectives.push({ status: 'completed', text: `Complete Stage ${i}` });
      } else if (i === currentStage) {
        objectives.push({ status: 'active', text: `Complete Stage ${i}` });
      } else {
        objectives.push({ status: 'pending', text: `Complete Stage ${i}` });
      }
    }
    
    // Stage 5 (requires lessons)
    if (highestUnlockedStage >= 5) {
      objectives.push({ status: 'completed', text: 'Complete Threat Intel Lessons 1-5' });
      objectives.push({ status: currentStage === 5 ? 'active' : 'completed', text: 'Complete Stage 5 (Final Exam)' });
    } else if (currentStage === 5) {
      objectives.push({ status: 'active', text: 'Complete Threat Intel Lessons 1-5 to unlock Stage 5' });
    } else {
      objectives.push({ status: 'pending', text: 'Complete Threat Intel Lessons 1-5' });
      objectives.push({ status: 'pending', text: 'Complete Stage 5 (Final Exam)' });
    }
    
    // Next module unlock
    if (nextModule) {
      objectives.push({ status: 'pending', text: `Win Stage 5 to unlock Module ${nextModule.id}` });
    }
    
    return objectives;
  };
  
  const objectives = getObjectives();
  const moduleProgress = currentModule.progress;
  const completedLessons = currentModule.lessonsComplete;
  const totalLessons = currentModule.totalLessons;

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
        <ScrollView style={styles.mainContent} contentContainerStyle={styles.scrollContent}>
           <Text style={styles.moduleText}>MODULE {currentModule.id}</Text>
           <Text style={styles.titleText}>{currentModule.title}</Text>
           <Text style={styles.subtitleText}>{currentModule.subtitle}</Text>

           <View style={styles.progressSection}>
              <View style={styles.progressBarContainer}>
                 <View style={[styles.progressBarFill, { width: `${moduleProgress}%` }]} />
              </View>
              <Text style={styles.xpText}>{completedLessons}/{totalLessons} Lessons</Text>
           </View>

           {/* === OBJECTIVES LIST === */}
           <View style={styles.objectivesSection}>
              <Text style={styles.objectivesTitle}>MISSION OBJECTIVES</Text>
              {objectives.map((obj, index) => (
                <ObjectiveItem key={index} status={obj.status} text={obj.text} />
              ))}
           </View>
        </ScrollView>

        {/* === BOTTOM PLAY BUTTON === */}
        <TouchableOpacity style={styles.playButton} activeOpacity={0.9} onPress={() => navigation.navigate('StageSelect')}>
           <View style={styles.playButtonContent}>
              <Text style={styles.playButtonTitle}>Select Stage</Text>
              <Text style={styles.playButtonSub}>CHOOSE YOUR MISSION</Text>
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
    paddingHorizontal: normalize(20),
    paddingTop: normalize(12),
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  consoleBtn: {
    marginRight: normalize(12),
  },
  consoleBtnText: {
    color: '#bdc3c7',
    fontSize: normalize(14),
    fontWeight: 'bold',
  },
  activeMissionText: {
    color: '#34495e',
    fontSize: normalize(10),
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
  },
  scrollContent: {
    paddingHorizontal: normalize(20),
    paddingTop: normalize(16),
    paddingBottom: normalize(16),
  },
  moduleText: {
    color: '#00d2d3', // Cyan
    fontSize: normalize(9),
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: normalize(4),
  },
  titleText: {
    color: '#ffffff',
    fontSize: normalize(20),
    fontWeight: '900',
    lineHeight: normalize(24),
    marginBottom: normalize(4),
  },
  subtitleText: {
    color: '#7f8c8d',
    fontSize: normalize(11),
    marginBottom: normalize(12),
  },

  // PROGRESS
  progressSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: normalize(14),
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
    fontSize: normalize(8),
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: normalize(8),
  },
  objectiveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: normalize(6),
    paddingVertical: normalize(4),
    paddingHorizontal: normalize(8),
    borderRadius: normalize(3),
  },
  objectiveRowActive: {
    backgroundColor: 'rgba(39, 174, 96, 0.15)',
    borderWidth: bw(1),
    borderColor: '#27ae60',
  },
  checkbox: {
    width: normalize(14),
    height: normalize(14),
    borderWidth: bw(2),
    borderColor: '#34495e',
    borderRadius: normalize(2),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: normalize(8),
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
    fontSize: normalize(10),
    fontWeight: '900',
  },
  arrowIcon: {
    color: '#0c161e',
    fontSize: normalize(9),
    fontWeight: '900',
  },
  objectiveTextContainer: {
    flex: 1,
  },
  objectiveText: {
    color: '#81ecec', 
    fontSize: normalize(11),
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
    paddingHorizontal: normalize(5),
    paddingVertical: normalize(2),
    borderRadius: normalize(2),
  },
  nextBadgeText: {
    color: '#ffffff',
    fontSize: normalize(7),
    fontWeight: '900',
    letterSpacing: 1,
  },

  // PLAY BUTTON
  playButton: {
    backgroundColor: '#48dbfb',
    width: '100%',
    paddingVertical: normalize(12),
    paddingHorizontal: normalize(16),
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
    fontSize: normalize(20),
    fontWeight: '900',
    marginBottom: normalize(1),
  },
  playButtonSub: {
    color: '#0abde3', // Darker text for the sub label
    fontSize: normalize(9),
    fontWeight: '900',
    letterSpacing: 2,
  },
  playButtonTriangle: {
    position: 'absolute',
    right: normalize(-15),
    top: normalize(-12),
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderTopWidth: normalize(50),
    borderRightWidth: normalize(50),
    borderBottomWidth: normalize(50),
    borderLeftWidth: normalize(50),
    borderTopColor: 'transparent',
    borderRightColor: 'rgba(10, 189, 227, 0.4)', // faint triangle overlay
    borderBottomColor: 'transparent',
    borderLeftColor: 'transparent',
    zIndex: 1,
  }
});