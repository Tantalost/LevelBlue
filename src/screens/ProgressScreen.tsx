import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Dimensions,
  PixelRatio,
} from 'react-native';
import Svg, { Polygon, Line, Text as SvgText, Circle } from 'react-native-svg';

const { width } = Dimensions.get('window');
const BASE_WIDTH = 932; // Assuming Landscape
const scaleFactor = width / BASE_WIDTH;
const normalize = (size: number) => Math.round(PixelRatio.roundToNearestPixel(size * scaleFactor));
const bw = (size: number) => Math.max(1, normalize(size));

// ==========================================
// CUSTOM RADAR CHART COMPONENT
// ==========================================
const RadarChart = ({ data }: { data: { label: string, value: number }[] }) => {
  const size = normalize(300); // Size of the SVG canvas
  const center = size / 2;
  const radius = size * 0.35; // Leave room around edges for text labels
  const max = 100;
  
  // 6 points of a hexagon starting from the top
  const angles = [
    -Math.PI / 2,       // Top
    -Math.PI / 6,       // Top Right
    Math.PI / 6,        // Bottom Right
    Math.PI / 2,        // Bottom
    (5 * Math.PI) / 6,  // Bottom Left
    (7 * Math.PI) / 6,  // Top Left
  ];

  const gridLevels = [0.33, 0.66, 1]; // 3 inner grid lines
  
  // Calculate the filled magenta polygon points based on data
  const dataPoints = data.map((d, i) => {
    const r = radius * (d.value / max);
    return `${center + r * Math.cos(angles[i])},${center + r * Math.sin(angles[i])}`;
  }).join(' ');

  return (
    <View style={styles.radarContainer}>
      <Svg width={size} height={size}>
        
        {/* Outer Dark Grey Circle Base */}
        <Circle cx={center} cy={center} r={radius * 1.25} fill="#555d66" />

        {/* Hexagon Background Grids */}
        {gridLevels.map((level, index) => {
          const points = angles.map(angle => 
            `${center + radius * level * Math.cos(angle)},${center + radius * level * Math.sin(angle)}`
          ).join(' ');
          
          return (
            <Polygon 
              key={index} 
              points={points} 
              // The outermost grid gets the muddy-yellow color from your image
              fill={index === 2 ? '#b5a582' : 'transparent'} 
              stroke="#000" 
              strokeWidth="1" 
            />
          );
        })}
        
        {/* Axes Lines radiating from center */}
        {angles.map((angle, index) => (
          <Line 
            key={index}
            x1={center} y1={center} 
            x2={center + radius * Math.cos(angle)} y2={center + radius * Math.sin(angle)} 
            stroke="#000" strokeWidth="1" 
          />
        ))}

        {/* The Magenta Data Polygon */}
        <Polygon 
          points={dataPoints} 
          fill="rgba(216, 0, 255, 0.9)" 
          stroke="#000" 
          strokeWidth="1" 
        />

        {/* Text Labels */}
        {data.map((d, i) => {
          const labelRadius = radius * 1.45; // Push text outside the circle
          const x = center + labelRadius * Math.cos(angles[i]);
          const y = center + labelRadius * Math.sin(angles[i]);
          
          return (
             <SvgText
               key={i}
               x={x}
               y={y + 4} // adjust for vertical baseline
               fill="#ffffff"
               fontSize={normalize(11)}
               fontWeight="bold"
               textAnchor="middle"
             >
               {d.label}
             </SvgText>
          );
        })}
      </Svg>
    </View>
  );
};

export default function ProgressScreen({ navigation }: any) {
  // Data for the radar chart
  const masteryData = [
    { label: 'EMAIL', value: 88 },
    { label: 'PRETEXT', value: 64 },
    { label: 'SMS', value: 52 },
    { label: 'PHYSICAL', value: 35 },
    { label: 'OSINT', value: 21 },
    { label: 'MALWARE', value: 75 },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        
        {/* === HEADER === */}
        <View style={styles.topBarContainer}>
          <View style={styles.leftHeader}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>PROGRESS</Text>
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

        <View style={styles.header}>
           <Text style={styles.title}>Your Progress</Text>
           <Text style={styles.subtitle}>Track your social engineering defense skills</Text>
        </View>

        {/* === RANK CARD === */}
        <View style={styles.card}>
           <View style={styles.cardLeft}>
              <View style={styles.bronzeBadge}>
                 <Text style={styles.bronzeText}>B</Text>
              </View>
           </View>
           <View style={styles.cardRight}>
              <Text style={styles.cardLabel}>CURRENT RANK</Text>
              <Text style={styles.rankName}>Bronze</Text>
              <Text style={styles.rankSub}>260 pts to Silver</Text>
              <View style={styles.barTrack}>
                 <View style={[styles.barFill, { backgroundColor: '#e67e22', width: '60%' }]} />
              </View>
           </View>
        </View>

        {/* === MODULE PROGRESS CARD === */}
        <View style={styles.card}>
           <View style={styles.cardFull}>
              <Text style={styles.cardLabel}>MODULE 1 OF 5</Text>
              <Text style={styles.moduleName}>Phishing & Email Threats</Text>
              <Text style={styles.moduleSub}>2 tasks to Module 2</Text>
              <View style={styles.barTrack}>
                 <View style={[styles.barFill, { backgroundColor: '#00d2d3', width: '80%' }]} />
              </View>
           </View>
        </View>

        {/* === MASTERY BREAKDOWN (RADAR CHART) === */}
        <View style={[styles.card, { alignItems: 'center' }]}>
           <View style={styles.cardFull}>
             <Text style={styles.cardLabel}>MASTERY BREAKDOWN</Text>
             <Text style={styles.moduleName}>Threat Recognition Skills</Text>
           </View>
           <RadarChart data={masteryData} />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0b141e', // Dark navy background
  },
  scrollContainer: {
    padding: normalize(24),
    paddingBottom: normalize(60), // Extra padding at bottom for scrolling
  },
  header: {
    marginBottom: normalize(20),
  },
  backBtn: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignSelf: 'flex-start',
    paddingHorizontal: normalize(12),
    paddingVertical: normalize(8),
    borderRadius: normalize(4),
    marginBottom: normalize(16),
  },
  backBtnText: {
    color: '#bdc3c7',
    fontSize: normalize(12),
    fontWeight: 'bold',
  },
  title: {
    color: '#fff',
    fontSize: normalize(28),
    fontWeight: 'bold',
    marginBottom: normalize(4),
  },
  subtitle: {
    color: '#7f8c8d',
    fontSize: normalize(12),
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
  
  // === CARDS ===
  card: {
    backgroundColor: '#121f2d', 
    borderRadius: normalize(8),
    borderWidth: bw(1),
    borderColor: '#1e2b3c',
    padding: normalize(20),
    marginBottom: normalize(16),
    flexDirection: 'row',
  },
  cardLeft: {
    marginRight: normalize(20),
    justifyContent: 'center',
  },
  bronzeBadge: {
    width: normalize(64),
    height: normalize(64),
    borderRadius: normalize(32),
    borderWidth: bw(4),
    borderColor: '#cd7f32',
    backgroundColor: '#3d2b1f',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bronzeText: {
    color: '#cd7f32',
    fontSize: normalize(24),
    fontWeight: 'bold',
  },
  cardRight: {
    flex: 1,
    justifyContent: 'center',
  },
  cardFull: {
    flex: 1,
    width: '100%',
  },
  cardLabel: {
    color: '#3498db',
    fontSize: normalize(10),
    fontWeight: '900',
    letterSpacing: 1.5,
    marginBottom: normalize(4),
  },
  rankName: {
    color: '#e67e22', 
    fontSize: normalize(22),
    fontWeight: 'bold',
    marginBottom: normalize(2),
  },
  rankSub: {
    color: '#7f8c8d',
    fontSize: normalize(10),
    marginBottom: normalize(12),
  },
  moduleName: {
    color: '#fff',
    fontSize: normalize(18),
    fontWeight: 'bold',
    marginBottom: normalize(4),
  },
  moduleSub: {
    color: '#7f8c8d',
    fontSize: normalize(10),
    marginBottom: normalize(12),
  },
  barTrack: {
    height: normalize(8),
    backgroundColor: '#1e2b3c',
    borderRadius: normalize(4),
    width: '100%',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: normalize(4),
  },

  radarContainer: {
    marginTop: normalize(10),
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  }
});