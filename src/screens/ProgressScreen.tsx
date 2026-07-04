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
import Svg, { Polygon, Line, Text as SvgText, Circle, Defs, RadialGradient, Stop } from 'react-native-svg';

// ── Portrait-first scaling ──────────────────────────────────────────────────
const { width: SW, height: SH } = Dimensions.get('window');
// Always scale against the narrower (portrait) dimension
const PW = Math.min(SW, SH);
const PH = Math.max(SW, SH);
const scaleByW = PW / 390;
const scaleByH = PH / 844;
const scaleP = Math.min(scaleByW, scaleByH, 1.0);
const s = (n: number) => Math.round(PixelRatio.roundToNearestPixel(n * scaleP));
const bw = (n: number) => Math.max(1, s(n));

// ── Radar Chart ─────────────────────────────────────────────────────────────
interface RadarEntry { label: string; value: number; }

const RadarChart = ({ data }: { data: RadarEntry[] }) => {
  const canvasSize = s(280);
  const cx = canvasSize / 2;
  const cy = canvasSize / 2;
  const R  = canvasSize * 0.32;   // data-polygon max radius
  const labelR = canvasSize * 0.46; // push labels a bit further out
  const max = 100;
  const n = data.length;

  // Angles: start at top (-90°) and go clockwise
  const angles = data.map((_, i) => (Math.PI * 2 * i) / n - Math.PI / 2);

  // Helper: point on circle
  const pt = (r: number, a: number) => ({
    x: cx + r * Math.cos(a),
    y: cy + r * Math.sin(a),
  });

  // Grid ring levels
  const levels = [0.33, 0.66, 1.0];

  // Data polygon
  const dataPoints = data
    .map((d, i) => {
      const p = pt(R * (d.value / max), angles[i]);
      return `${p.x},${p.y}`;
    })
    .join(' ');

  // Grid polygon at a given fraction
  const gridPoints = (frac: number) =>
    angles.map(a => { const p = pt(R * frac, a); return `${p.x},${p.y}`; }).join(' ');

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={canvasSize} height={canvasSize}>
        <Defs>
          <RadialGradient id="bgGrad" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#1a2a40" />
            <Stop offset="100%" stopColor="#0a1020" />
          </RadialGradient>
        </Defs>

        {/* Background circle */}
        <Circle cx={cx} cy={cy} r={R * 1.15} fill="url(#bgGrad)" stroke="#1e3050" strokeWidth={bw(1)} />

        {/* Grid rings */}
        {levels.map((frac, idx) => (
          <Polygon
            key={idx}
            points={gridPoints(frac)}
            fill="none"
            stroke={idx === 2 ? '#2a4060' : '#1e3050'}
            strokeWidth={bw(idx === 2 ? 1.5 : 1)}
          />
        ))}

        {/* Axis spokes */}
        {angles.map((a, i) => {
          const end = pt(R, a);
          return (
            <Line
              key={i}
              x1={cx} y1={cy}
              x2={end.x} y2={end.y}
              stroke="#1e3050"
              strokeWidth={bw(1)}
            />
          );
        })}

        {/* Data polygon */}
        <Polygon
          points={dataPoints}
          fill="rgba(200,0,255,0.35)"
          stroke="#d400ff"
          strokeWidth={bw(2)}
        />

        {/* Data dots */}
        {data.map((d, i) => {
          const p = pt(R * (d.value / max), angles[i]);
          return (
            <Circle key={i} cx={p.x} cy={p.y} r={s(4)} fill="#d400ff" stroke="#fff" strokeWidth={bw(1)} />
          );
        })}

        {/* Labels */}
        {data.map((d, i) => {
          const p = pt(labelR, angles[i]);
          return (
            <SvgText
              key={i}
              x={p.x}
              y={p.y + s(4)}
              fill="#b0c8f0"
              fontSize={s(10)}
              fontWeight="bold"
              textAnchor="middle"
            >
              {d.label}
            </SvgText>
          );
        })}
      </Svg>

      {/* Value legend below chart */}
      <View style={rcStyles.legend}>
        {data.map((d, i) => (
          <View key={i} style={rcStyles.legendItem}>
            <View style={[rcStyles.legendDot, { backgroundColor: '#d400ff' }]} />
            <Text style={rcStyles.legendLabel}>{d.label}</Text>
            <Text style={rcStyles.legendVal}>{d.value}%</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const rcStyles = StyleSheet.create({
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: s(12),
    gap: s(8),
    paddingHorizontal: s(8),
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(4),
    width: '30%',
    minWidth: s(90),
  },
  legendDot: {
    width: s(8),
    height: s(8),
    borderRadius: s(4),
  },
  legendLabel: {
    color: '#8a9bc0',
    fontSize: s(10),
    flex: 1,
  },
  legendVal: {
    color: '#d400ff',
    fontSize: s(10),
    fontWeight: 'bold',
    textAlign: 'right',
  },
});

// ── Stat Pill ────────────────────────────────────────────────────────────────
const StatPill = ({ icon, label, value, color }: { icon: string; label: string; value: string; color: string }) => (
  <View style={[st.pill, { borderColor: color + '55' }]}>
    <Text style={st.pillIcon}>{icon}</Text>
    <Text style={[st.pillValue, { color }]}>{value}</Text>
    <Text style={st.pillLabel}>{label}</Text>
  </View>
);

const st = StyleSheet.create({
  pill: {
    flex: 1,
    backgroundColor: '#0c1525',
    borderWidth: bw(1.5),
    borderRadius: s(12),
    padding: s(12),
    alignItems: 'center',
    gap: s(4),
  },
  pillIcon: { fontSize: s(20) },
  pillValue: { fontSize: s(18), fontWeight: 'bold' },
  pillLabel: { color: '#5a7aaa', fontSize: s(10), textAlign: 'center' },
});

// ── Progress Bar ─────────────────────────────────────────────────────────────
const Bar = ({ pct, color }: { pct: number; color: string }) => (
  <View style={ps.barTrack}>
    <View style={[ps.barFill, { width: `${Math.min(100, pct)}%`, backgroundColor: color }]} />
  </View>
);

// ── Main Screen ──────────────────────────────────────────────────────────────
export default function ProgressScreen({ navigation }: any) {
  const masteryData: RadarEntry[] = [
    { label: 'EMAIL',    value: 88 },
    { label: 'PRETEXT',  value: 64 },
    { label: 'SMS',      value: 52 },
    { label: 'PHYSICAL', value: 35 },
    { label: 'OSINT',    value: 21 },
    { label: 'MALWARE',  value: 75 },
  ];

  const modules = [
    { name: 'Phishing & Email Threats',      pct: 80, done: true  },
    { name: 'Social Engineering Pretexting', pct: 45, done: false },
    { name: 'SMS & Vishing Attacks',         pct: 20, done: false },
    { name: 'Physical Security Breaches',    pct: 0,  done: false },
    { name: 'OSINT & Reconnaissance',        pct: 0,  done: false },
  ];

  return (
    <SafeAreaView style={ps.safe}>
      {/* ── HEADER ── */}
      <View style={ps.header}>
        <TouchableOpacity style={ps.backBtn} onPress={() => navigation.goBack()}>
          <Text style={ps.backBtnTxt}>←</Text>
        </TouchableOpacity>
        <Text style={ps.headerTitle}>PROGRESS</Text>
        <View style={ps.headerRight}>
          <View style={ps.resBadge}>
            <Text style={ps.resBadgeIcon}>💀</Text>
            <Text style={ps.resBadgeTxt}>2,400</Text>
          </View>
          <View style={ps.resBadge}>
            <Text style={ps.resBadgeIcon}>🔧</Text>
            <Text style={ps.resBadgeTxt}>1,150</Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={ps.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── PAGE TITLE ── */}
        <Text style={ps.pageTitle}>Your Progress</Text>
        <Text style={ps.pageSub}>Track your social engineering defense skills</Text>

        {/* ── STAT PILLS ── */}
        <View style={ps.pillRow}>
          <StatPill icon="⚡" label="XP Earned"    value="3,240"  color="#ffcf5c" />
          <StatPill icon="🎯" label="Accuracy"      value="74%"    color="#3fbf7f" />
          <StatPill icon="🏆" label="Best Streak"   value="7"      color="#d400ff" />
        </View>

        {/* ── RANK CARD ── */}
        <View style={ps.sectionCard}>
          <Text style={ps.sectionLabel}>CURRENT RANK</Text>
          <View style={ps.rankRow}>
            {/* Medal */}
            <View style={ps.medalWrap}>
              <View style={ps.medal}>
                <Text style={ps.medalText}>🥉</Text>
              </View>
              <Text style={ps.medalName}>BRONZE</Text>
            </View>

            {/* Rank details */}
            <View style={{ flex: 1 }}>
              <View style={ps.rankMeta}>
                <Text style={ps.rankMetaLabel}>3,240 XP</Text>
                <Text style={ps.rankMetaLabel}>Silver at 3,500</Text>
              </View>
              <Bar pct={74} color="#cd7f32" />
              <Text style={ps.rankHint}>260 XP to Silver</Text>

              {/* Tier row */}
              <View style={ps.tierRow}>
                {['B', 'S', 'G', 'P', 'D'].map((tier, i) => (
                  <View key={tier} style={[ps.tierPip, i === 0 && ps.tierPipActive]}>
                    <Text style={[ps.tierPipTxt, i === 0 && { color: '#cd7f32' }]}>{tier}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* ── MODULE PROGRESS ── */}
        <View style={ps.sectionCard}>
          <Text style={ps.sectionLabel}>MODULE PROGRESS</Text>
          <Text style={ps.sectionTitle}>1 of 5 Modules Completed</Text>
          {modules.map((m, i) => (
            <View key={i} style={ps.moduleRow}>
              <View style={[ps.moduleNum, m.done && ps.moduleNumDone]}>
                <Text style={[ps.moduleNumTxt, m.done && { color: '#3fbf7f' }]}>
                  {m.done ? '✓' : i + 1}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={ps.moduleHeader}>
                  <Text style={[ps.moduleName, !m.pct && { color: '#3a4a60' }]}>{m.name}</Text>
                  <Text style={[ps.modulePct, { color: m.done ? '#3fbf7f' : m.pct ? '#5ac8ff' : '#3a4a60' }]}>
                    {m.pct}%
                  </Text>
                </View>
                <Bar
                  pct={m.pct}
                  color={m.done ? '#3fbf7f' : '#5ac8ff'}
                />
              </View>
            </View>
          ))}
        </View>

        {/* ── MASTERY BREAKDOWN ── */}
        <View style={ps.sectionCard}>
          <Text style={ps.sectionLabel}>MASTERY BREAKDOWN</Text>
          <Text style={ps.sectionTitle}>Threat Recognition Skills</Text>
          <Text style={ps.sectionSub}>
            Your strongest area is{' '}
            <Text style={{ color: '#d400ff' }}>Email</Text> (88%) · Weakest is{' '}
            <Text style={{ color: '#ff6363' }}>OSINT</Text> (21%)
          </Text>
          <RadarChart data={masteryData} />
        </View>

        {/* ── RECENT ACTIVITY ── */}
        <View style={ps.sectionCard}>
          <Text style={ps.sectionLabel}>RECENT ACTIVITY</Text>
          {[
            { icon: '✅', label: 'Stage 1 Cleared',         sub: 'Phishing & Email Threats',      pts: '+120 XP', color: '#3fbf7f' },
            { icon: '🎯', label: 'Perfect Threat Analysis', sub: '10/10 correct answers',          pts: '+80 XP',  color: '#ffcf5c' },
            { icon: '❌', label: 'Stage 2 Failed',          sub: 'Social Engineering Pretexting', pts: '+0 XP',   color: '#ff6363' },
          ].map((a, i) => (
            <View key={i} style={ps.activityRow}>
              <Text style={ps.activityIcon}>{a.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={ps.activityLabel}>{a.label}</Text>
                <Text style={ps.activitySub}>{a.sub}</Text>
              </View>
              <Text style={[ps.activityPts, { color: a.color }]}>{a.pts}</Text>
            </View>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────
const ps = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#080e1a',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0c1525',
    borderBottomWidth: bw(1),
    borderBottomColor: '#bda05e',
    paddingHorizontal: s(16),
    paddingVertical: s(10),
    gap: s(12),
  },
  backBtn: {
    width: s(36),
    height: s(36),
    borderRadius: s(18),
    borderWidth: bw(2),
    borderColor: '#bda05e',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(10,15,25,0.9)',
  },
  backBtnTxt: {
    color: '#fff',
    fontSize: s(16),
    lineHeight: s(20),
  },
  headerTitle: {
    color: '#fff',
    fontSize: s(14),
    fontWeight: 'bold',
    letterSpacing: 2,
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    gap: s(8),
  },
  resBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: s(10),
    paddingVertical: s(4),
    borderRadius: s(12),
    gap: s(4),
  },
  resBadgeIcon: { fontSize: s(12) },
  resBadgeTxt:  { color: '#fff', fontSize: s(11), fontWeight: 'bold' },

  // Scroll
  scroll: {
    padding: s(16),
    paddingBottom: s(48),
  },
  pageTitle: {
    color: '#fff',
    fontSize: s(24),
    fontWeight: 'bold',
    marginBottom: s(4),
    marginTop: s(4),
  },
  pageSub: {
    color: '#5a7aaa',
    fontSize: s(12),
    marginBottom: s(20),
  },

  // Stat pills
  pillRow: {
    flexDirection: 'row',
    gap: s(10),
    marginBottom: s(16),
  },

  // Section cards
  sectionCard: {
    backgroundColor: '#0c1525',
    borderWidth: bw(1.5),
    borderColor: '#1e3050',
    borderRadius: s(16),
    padding: s(16),
    marginBottom: s(16),
  },
  sectionLabel: {
    color: '#3fbf7f',
    fontSize: s(10),
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: s(4),
  },
  sectionTitle: {
    color: '#fff',
    fontSize: s(16),
    fontWeight: 'bold',
    marginBottom: s(4),
  },
  sectionSub: {
    color: '#5a7aaa',
    fontSize: s(12),
    marginBottom: s(16),
    lineHeight: s(18),
  },

  // Rank card
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(16),
    marginTop: s(8),
  },
  medalWrap: {
    alignItems: 'center',
    gap: s(4),
  },
  medal: {
    width: s(60),
    height: s(60),
    borderRadius: s(30),
    borderWidth: bw(3),
    borderColor: '#cd7f32',
    backgroundColor: '#1a0f08',
    justifyContent: 'center',
    alignItems: 'center',
  },
  medalText: { fontSize: s(30) },
  medalName: {
    color: '#cd7f32',
    fontSize: s(9),
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  rankMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: s(6),
  },
  rankMetaLabel: {
    color: '#5a7aaa',
    fontSize: s(10),
  },
  rankHint: {
    color: '#cd7f32',
    fontSize: s(10),
    marginTop: s(4),
    marginBottom: s(10),
  },
  tierRow: {
    flexDirection: 'row',
    gap: s(6),
    marginTop: s(4),
  },
  tierPip: {
    width: s(28),
    height: s(28),
    borderRadius: s(14),
    borderWidth: bw(1.5),
    borderColor: '#1e3050',
    backgroundColor: '#080e1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tierPipActive: {
    borderColor: '#cd7f32',
    backgroundColor: '#1a0f08',
  },
  tierPipTxt: {
    color: '#5a7aaa',
    fontSize: s(10),
    fontWeight: 'bold',
  },

  // Module progress
  moduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(12),
    marginTop: s(12),
  },
  moduleNum: {
    width: s(28),
    height: s(28),
    borderRadius: s(14),
    borderWidth: bw(1.5),
    borderColor: '#1e3050',
    backgroundColor: '#080e1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moduleNumDone: {
    borderColor: '#3fbf7f',
    backgroundColor: '#0a2018',
  },
  moduleNumTxt: {
    color: '#5a7aaa',
    fontSize: s(10),
    fontWeight: 'bold',
  },
  moduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: s(4),
  },
  moduleName: {
    color: '#e8f0ff',
    fontSize: s(12),
    flex: 1,
    marginRight: s(8),
  },
  modulePct: {
    fontSize: s(11),
    fontWeight: 'bold',
  },

  // Bar
  barTrack: {
    height: s(6),
    backgroundColor: '#0f1e35',
    borderRadius: s(3),
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: s(3),
  },

  // Activity
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(12),
    paddingVertical: s(10),
    borderTopWidth: bw(1),
    borderTopColor: '#1e3050',
  },
  activityIcon: { fontSize: s(20) },
  activityLabel: { color: '#e8f0ff', fontSize: s(13), fontWeight: 'bold' },
  activitySub:   { color: '#5a7aaa', fontSize: s(11), marginTop: s(1) },
  activityPts:   { fontWeight: 'bold', fontSize: s(12) },
});