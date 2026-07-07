import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Dimensions,
  PixelRatio,
  StatusBar,
  Modal,
  Animated,
} from 'react-native';

// ── Portrait-safe scaling ────────────────────────────────────────────────────
const { width: SW, height: SH } = Dimensions.get('window');
const PW = Math.min(SW, SH);
const PH = Math.max(SW, SH);
const scaleP = Math.min(PW / 390, PH / 844, 1.0);
const s  = (n: number) => Math.round(PixelRatio.roundToNearestPixel(n * scaleP));
const bw = (n: number) => Math.max(1, s(n));

// ────────────────────────────────────────────────────────────────────────────
// DATA
// ────────────────────────────────────────────────────────────────────────────

interface CodexEntry {
  id: string;
  name: string;
  emoji: string;
  role: string;
  rarity: 'COMMON' | 'UNCOMMON' | 'RARE' | 'LEGENDARY';
  stats: { label: string; value: string }[];
  realWorldInfo: string;
  lore: string;
  tip: string;
  accentColor: string;
}

const UNITS: CodexEntry[] = [
  {
    id: 'u1',
    name: 'Firewall Sentinel',
    emoji: '🛡️',
    role: 'DEFENDER',
    rarity: 'COMMON',
    accentColor: '#5ac8ff',
    stats: [
      { label: 'DMG', value: '18' },
      { label: 'RANGE', value: '2.2' },
      { label: 'COOLDOWN', value: '650ms' },
      { label: 'COST', value: '25g' },
    ],
    realWorldInfo:
      'A firewall is a network security system that monitors and controls incoming and outgoing network traffic based on predetermined security rules. It forms the first barrier between a trusted internal network and untrusted external networks.',
    lore:
      'Stationed at the perimeter, the Sentinel filters every packet that dares cross the threshold. Cheap to deploy, reliable in bulk — the backbone of any blue team.',
    tip: 'Place Sentinels in clusters at chokepoints for maximum packet-filter coverage.',
  },
  {
    id: 'u2',
    name: 'IDS Watcher',
    emoji: '👁️',
    role: 'SCANNER',
    rarity: 'UNCOMMON',
    accentColor: '#3fbf7f',
    stats: [
      { label: 'DMG', value: '28' },
      { label: 'RANGE', value: '3.5' },
      { label: 'COOLDOWN', value: '900ms' },
      { label: 'COST', value: '40g' },
    ],
    realWorldInfo:
      'An Intrusion Detection System (IDS) monitors network traffic for suspicious activity and known threats, sending alerts when malicious activity is detected. Unlike a firewall, it does not block — it observes and reports.',
    lore:
      'Silent and patient, the IDS Watcher never fires first. It watches everything. Its true power lies in early warning — giving allies time to mount a counter-attack.',
    tip: 'Pair with Firewall Sentinels: the Watcher detects, the Sentinel stops.',
  },
  {
    id: 'u3',
    name: 'Honeypot Lure',
    emoji: '🍯',
    role: 'TRAPPER',
    rarity: 'UNCOMMON',
    accentColor: '#ffcf5c',
    stats: [
      { label: 'DMG', value: '0' },
      { label: 'RANGE', value: 'Global' },
      { label: 'SLOW', value: '60%' },
      { label: 'COST', value: '35g' },
    ],
    realWorldInfo:
      'A honeypot is a decoy computer system set up to attract attackers and study their techniques. It mimics a legitimate system but is isolated so real data is never at risk. Interaction with a honeypot is logged in detail.',
    lore:
      'Does no damage, but enemies cannot resist it. Every attacker who investigates a Honeypot is slowed, logged, and exposed to nearby defenders.',
    tip: 'Deploy behind Sentinels — attackers who slip past the firewall walk right into the trap.',
  },
  {
    id: 'u4',
    name: 'SIEM Analyst',
    emoji: '📊',
    role: 'SUPPORT',
    rarity: 'RARE',
    accentColor: '#d400ff',
    stats: [
      { label: 'DMG', value: '12' },
      { label: 'RANGE', value: '4.0' },
      { label: 'BUFF', value: '+20% ally DMG' },
      { label: 'COST', value: '60g' },
    ],
    realWorldInfo:
      'Security Information and Event Management (SIEM) systems aggregate and analyze log data from across an entire organization in real time. They correlate events to detect patterns that no single tool would catch alone — turning raw data into actionable intelligence.',
    lore:
      'Alone the Analyst is underwhelming. Together with allies, its correlation engine multiplies every defender\'s effectiveness. Its log feeds are the nervous system of the entire operation.',
    tip: 'One SIEM Analyst near a cluster of Sentinels turns an average defense into an elite one.',
  },
  {
    id: 'u5',
    name: 'Zero Trust Gateway',
    emoji: '🔑',
    role: 'GATEKEEPER',
    rarity: 'RARE',
    accentColor: '#ff9f43',
    stats: [
      { label: 'DMG', value: '45' },
      { label: 'RANGE', value: '1.5' },
      { label: 'VERIFY', value: 'Every packet' },
      { label: 'COST', value: '75g' },
    ],
    realWorldInfo:
      'Zero Trust is a security model based on the principle "never trust, always verify." It requires every user, device, and connection to be authenticated and authorized — even from within the network perimeter. It eliminates the concept of implicit trust.',
    lore:
      'The Gateway trusts no one. Its verification protocols slow everything down — but nothing unauthorized ever passes. Premium cost, premium results.',
    tip: 'Expensive but unmatched for protecting your base. Prioritize placing it on the final lane.',
  },
  {
    id: 'u6',
    name: 'Patch Deployer',
    emoji: '🩹',
    role: 'HEALER',
    rarity: 'LEGENDARY',
    accentColor: '#ff6363',
    stats: [
      { label: 'HEAL', value: '15 HP/s' },
      { label: 'RANGE', value: '3.0' },
      { label: 'VULN FIX', value: 'Yes' },
      { label: 'COST', value: '90g' },
    ],
    realWorldInfo:
      'Patch management is the process of distributing and applying updates to software. Unpatched systems are among the leading causes of successful breaches — 60% of breaches involve vulnerabilities for which a patch was already available.',
    lore:
      'The rarest and most valued unit on the field. The Patch Deployer doesn\'t fight — it keeps everyone else alive. Deploy it and watch your base\'s HP recover in real time.',
    tip: 'Legendary and irreplaceable. Protect the Deployer at all costs — once lost, vulnerabilities will compound.',
  },
];

const ENEMIES: CodexEntry[] = [
  {
    id: 'e1',
    name: 'Script Kiddie',
    emoji: '💻',
    role: 'BASIC THREAT',
    rarity: 'COMMON',
    accentColor: '#ff6363',
    stats: [
      { label: 'HP', value: '60' },
      { label: 'SPEED', value: 'Slow' },
      { label: 'DMG', value: '8' },
      { label: 'ARMOR', value: 'None' },
    ],
    realWorldInfo:
      'A script kiddie is an unskilled attacker who uses pre-written hacking tools without understanding how they work. While technically unsophisticated, their attacks are high-volume and automated — organizations with poor patch hygiene are still vulnerable.',
    lore:
      'Floods the lane with sheer numbers. Low threat individually, but dangerous in swarms. The first wave you\'ll face in any breach.',
    tip: 'One Firewall Sentinel handles Script Kiddies easily. Never ignore them in large groups.',
  },
  {
    id: 'e2',
    name: 'Phisher',
    emoji: '🎣',
    role: 'SOCIAL ENGINEER',
    rarity: 'COMMON',
    accentColor: '#ff6363',
    stats: [
      { label: 'HP', value: '80' },
      { label: 'SPEED', value: 'Medium' },
      { label: 'ABILITY', value: 'Credential Steal' },
      { label: 'ARMOR', value: 'Light' },
    ],
    realWorldInfo:
      'Phishing is a social engineering attack where an attacker sends fraudulent messages designed to trick victims into revealing sensitive information. It accounts for over 36% of all data breaches and is the most common initial attack vector.',
    lore:
      'Does not fight directly — instead it siphons gold from nearby defenders, crippling your economy. Prioritize elimination.',
    tip: 'IDS Watchers detect Phishers before they act. Always have at least one in your lane.',
  },
  {
    id: 'e3',
    name: 'Ransomware Bot',
    emoji: '🔐',
    role: 'HEAVY ATTACKER',
    rarity: 'UNCOMMON',
    accentColor: '#ffcf5c',
    stats: [
      { label: 'HP', value: '220' },
      { label: 'SPEED', value: 'Slow' },
      { label: 'DMG', value: '35' },
      { label: 'ARMOR', value: 'Heavy' },
    ],
    realWorldInfo:
      'Ransomware is malware that encrypts a victim\'s data and demands payment for the decryption key. The average ransom payment exceeded $1.5 million in 2023. Healthcare, education, and government sectors are primary targets.',
    lore:
      'Slow but devastating. When a Ransomware Bot reaches the base it encrypts 25% of your HP. Multiple Bots will end the mission.',
    tip: 'Zero Trust Gateways are the only reliable counter. Firewall Sentinels alone won\'t stop it.',
  },
  {
    id: 'e4',
    name: 'APT Shadow',
    emoji: '👤',
    role: 'STEALTH INFILTRATOR',
    rarity: 'RARE',
    accentColor: '#d400ff',
    stats: [
      { label: 'HP', value: '150' },
      { label: 'SPEED', value: 'Fast' },
      { label: 'STEALTH', value: 'Yes' },
      { label: 'ARMOR', value: 'Medium' },
    ],
    realWorldInfo:
      'An Advanced Persistent Threat (APT) is a prolonged, targeted cyberattack in which an intruder establishes an undetected presence in a network to steal data or cause damage. APTs often go undetected for months — the average dwell time is 197 days.',
    lore:
      'Nearly invisible to basic defenses. Only IDS Watchers and SIEM Analysts can detect an APT Shadow before it reaches the base. If undetected it silently drains HP for 30 seconds.',
    tip: 'Never skip on IDS Watchers. The APT Shadow makes basic Sentinel-only defenses useless.',
  },
  {
    id: 'e5',
    name: 'DDoS Storm',
    emoji: '🌪️',
    role: 'AREA ATTACKER',
    rarity: 'RARE',
    accentColor: '#5ac8ff',
    stats: [
      { label: 'HP', value: '300' },
      { label: 'SPEED', value: 'Medium' },
      { label: 'AOE DMG', value: '20' },
      { label: 'ARMOR', value: 'Light' },
    ],
    realWorldInfo:
      'A Distributed Denial of Service (DDoS) attack overwhelms a target server, service, or network with a flood of internet traffic. In 2023, the largest DDoS attack peaked at 71 million requests per second. Botnets of compromised devices are the primary source.',
    lore:
      'The DDoS Storm hits every defender in its path simultaneously. Wide, slow, and hard to kill — it\'s not just attacking your base, it\'s attacking your entire defense grid.',
    tip: 'Spread your defenders across multiple lanes before this enemy appears.',
  },
  {
    id: 'e6',
    name: 'Zero-Day Exploit',
    emoji: '💣',
    role: 'BOSS',
    rarity: 'LEGENDARY',
    accentColor: '#ff3333',
    stats: [
      { label: 'HP', value: '1000' },
      { label: 'SPEED', value: 'Variable' },
      { label: 'DMG', value: '100' },
      { label: 'ARMOR', value: 'MAX' },
    ],
    realWorldInfo:
      'A zero-day exploit is a cyberattack targeting a previously unknown vulnerability in software, hardware, or firmware. Since no patch exists at the time of the attack, it is extremely dangerous. Zero-days are sold on dark-web markets for hundreds of thousands of dollars.',
    lore:
      'The final boss. It bypasses Firewalls, evades IDS, resists Zero Trust checks — only a full, coordinated defense with a Patch Deployer active can survive its assault.',
    tip: 'Have your Patch Deployer active before this enemy reaches mid-lane. There is no other way.',
  },
];

// ────────────────────────────────────────────────────────────────────────────
// RARITY CONFIG
// ────────────────────────────────────────────────────────────────────────────
const RARITY_COLOR: Record<string, string> = {
  COMMON:    '#8a9bc0',
  UNCOMMON:  '#3fbf7f',
  RARE:      '#d400ff',
  LEGENDARY: '#ffcf5c',
};

// ────────────────────────────────────────────────────────────────────────────
// DETAIL MODAL
// ────────────────────────────────────────────────────────────────────────────
function DetailModal({
  entry,
  visible,
  onClose,
}: {
  entry: CodexEntry;
  visible: boolean;
  onClose: () => void;
}) {
  const rarityColor = RARITY_COLOR[entry.rarity];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      supportedOrientations={['portrait', 'landscape', 'landscape-left', 'landscape-right']}
      onRequestClose={onClose}
    >
      <View style={dm.overlay}>
        <View style={[dm.panel, { borderColor: entry.accentColor }]}>

          {/* Top bar */}
          <View style={[dm.topBar, { backgroundColor: entry.accentColor + '22' }]}>
            <Text style={dm.topBarEmoji}>{entry.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={[dm.entryName, { color: entry.accentColor }]}>{entry.name}</Text>
              <View style={dm.badgeRow}>
                <View style={[dm.roleBadge, { borderColor: entry.accentColor + '80' }]}>
                  <Text style={[dm.roleTxt, { color: entry.accentColor }]}>{entry.role}</Text>
                </View>
                <View style={[dm.rarityBadge, { backgroundColor: rarityColor + '22', borderColor: rarityColor }]}>
                  <Text style={[dm.rarityTxt, { color: rarityColor }]}>{entry.rarity}</Text>
                </View>
              </View>
            </View>
            <TouchableOpacity style={dm.closeBtn} onPress={onClose}>
              <Text style={dm.closeTxt}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={dm.scroll}>

            {/* Stats grid */}
            <View style={dm.statsGrid}>
              {entry.stats.map((stat, i) => (
                <View key={i} style={[dm.statCell, { borderColor: entry.accentColor + '50' }]}>
                  <Text style={[dm.statVal, { color: entry.accentColor }]}>{stat.value}</Text>
                  <Text style={dm.statLbl}>{stat.label}</Text>
                </View>
              ))}
            </View>

            {/* Lore */}
            <View style={dm.section}>
              <Text style={dm.sectionLabel}>📖  LORE</Text>
              <Text style={dm.sectionTxt}>{entry.lore}</Text>
            </View>

            {/* Real-world info */}
            <View style={[dm.section, { borderColor: '#5ac8ff40' }]}>
              <Text style={[dm.sectionLabel, { color: '#5ac8ff' }]}>🌐  REAL-WORLD CONTEXT</Text>
              <Text style={dm.sectionTxt}>{entry.realWorldInfo}</Text>
            </View>

            {/* Tip */}
            <View style={[dm.tipBox, { borderColor: entry.accentColor + '60', backgroundColor: entry.accentColor + '12' }]}>
              <Text style={[dm.tipIcon, { color: entry.accentColor }]}>⚡  TACTICAL TIP</Text>
              <Text style={[dm.tipTxt, { color: '#e8f0ff' }]}>{entry.tip}</Text>
            </View>

            <View style={{ height: s(16) }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const dm = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.88)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: s(16),
  },
  panel: {
    width: '100%',
    maxHeight: '90%',
    backgroundColor: '#080e1a',
    borderWidth: bw(2),
    borderRadius: s(20),
    overflow: 'hidden',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: s(14),
    gap: s(12),
    borderBottomWidth: bw(1),
    borderBottomColor: '#1e3050',
  },
  topBarEmoji: { fontSize: s(40) },
  entryName:   { fontSize: s(15), fontWeight: 'bold', marginBottom: s(6) },
  badgeRow:    { flexDirection: 'row', gap: s(8) },
  roleBadge: {
    borderWidth: bw(1),
    borderRadius: s(20),
    paddingHorizontal: s(8),
    paddingVertical: s(2),
  },
  roleTxt:    { fontSize: s(8), fontWeight: '900', letterSpacing: 1 },
  rarityBadge: {
    borderWidth: bw(1),
    borderRadius: s(20),
    paddingHorizontal: s(8),
    paddingVertical: s(2),
  },
  rarityTxt:  { fontSize: s(8), fontWeight: '900', letterSpacing: 1 },
  closeBtn: {
    width: s(28),
    height: s(28),
    borderRadius: s(14),
    backgroundColor: '#1e3050',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeTxt:   { color: '#fff', fontSize: s(12) },
  scroll:     { padding: s(16) },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: s(8),
    marginBottom: s(16),
  },
  statCell: {
    flex: 1,
    minWidth: '40%',
    backgroundColor: '#0c1525',
    borderWidth: bw(1),
    borderRadius: s(10),
    padding: s(10),
    alignItems: 'center',
  },
  statVal: { fontSize: s(16), fontWeight: 'bold', marginBottom: s(2) },
  statLbl: { color: '#5a7aaa', fontSize: s(9), letterSpacing: 1 },
  section: {
    backgroundColor: '#0c1525',
    borderWidth: bw(1),
    borderColor: '#1e3050',
    borderRadius: s(12),
    padding: s(14),
    marginBottom: s(12),
  },
  sectionLabel: {
    color: '#ffcf5c',
    fontSize: s(9),
    fontWeight: '900',
    letterSpacing: 1.5,
    marginBottom: s(8),
  },
  sectionTxt: {
    color: '#b0c8f0',
    fontSize: s(12),
    lineHeight: s(20),
  },
  tipBox: {
    borderWidth: bw(1.5),
    borderRadius: s(12),
    padding: s(14),
  },
  tipIcon: { fontSize: s(9), fontWeight: '900', letterSpacing: 1.5, marginBottom: s(6) },
  tipTxt:  { fontSize: s(12), lineHeight: s(20) },
});

// ────────────────────────────────────────────────────────────────────────────
// CODEX CARD (grid item)
// ────────────────────────────────────────────────────────────────────────────
function CodexCard({
  entry,
  onPress,
}: {
  entry: CodexEntry;
  onPress: () => void;
}) {
  const rarityColor = RARITY_COLOR[entry.rarity];
  const scaleAnim   = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.94, useNativeDriver: true, speed: 30 }).start();
  };
  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 20 }).start();
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
    >
      <Animated.View
        style={[
          cc.card,
          { borderColor: entry.accentColor + '70' },
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        {/* Rarity stripe */}
        <View style={[cc.rarityStripe, { backgroundColor: rarityColor }]} />

        {/* Glow bg */}
        <View style={[cc.glowBg, { backgroundColor: entry.accentColor + '10' }]} />

        {/* Emoji */}
        <Text style={cc.emoji}>{entry.emoji}</Text>

        {/* Name */}
        <Text style={[cc.name, { color: '#e8f0ff' }]} numberOfLines={2}>{entry.name}</Text>

        {/* Role chip */}
        <View style={[cc.roleChip, { borderColor: entry.accentColor + '80' }]}>
          <Text style={[cc.roleChipTxt, { color: entry.accentColor }]}>{entry.role}</Text>
        </View>

        {/* Rarity label */}
        <Text style={[cc.rarityLbl, { color: rarityColor }]}>{entry.rarity}</Text>

        {/* Tap hint */}
        <Text style={cc.tapHint}>TAP FOR INFO</Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

const cc = StyleSheet.create({
  card: {
    width: s(155),
    backgroundColor: '#0c1525',
    borderWidth: bw(2),
    borderRadius: s(14),
    padding: s(12),
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
    gap: s(6),
  },
  rarityStripe: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: s(3),
  },
  glowBg: {
    ...StyleSheet.absoluteFillObject,
  },
  emoji:    { fontSize: s(38), marginTop: s(6) },
  name:     { fontSize: s(11), fontWeight: 'bold', textAlign: 'center', lineHeight: s(16) },
  roleChip: {
    borderWidth: bw(1),
    borderRadius: s(20),
    paddingHorizontal: s(8),
    paddingVertical: s(2),
  },
  roleChipTxt: { fontSize: s(8), fontWeight: '900', letterSpacing: 1 },
  rarityLbl:   { fontSize: s(8), fontWeight: 'bold', letterSpacing: 1 },
  tapHint:     { color: '#2a3a50', fontSize: s(7), letterSpacing: 1, marginTop: s(2) },
});

// ────────────────────────────────────────────────────────────────────────────
// MAIN SCREEN
// ────────────────────────────────────────────────────────────────────────────
export default function CodexScreen({ navigation }: any) {
  const [tab, setTab]             = useState<'UNITS' | 'ENEMIES'>('UNITS');
  const [selected, setSelected]   = useState<CodexEntry | null>(null);
  const slideAnim                 = useRef(new Animated.Value(0)).current;

  const switchTab = (next: 'UNITS' | 'ENEMIES') => {
    if (next === tab) return;
    const dir = next === 'ENEMIES' ? -30 : 30;
    Animated.sequence([
      Animated.timing(slideAnim, { toValue: dir, duration: 100, useNativeDriver: true }),
    ]).start(() => {
      setTab(next);
      slideAnim.setValue(-dir);
      Animated.timing(slideAnim, { toValue: 0, duration: 130, useNativeDriver: true }).start();
    });
  };

  const entries = tab === 'UNITS' ? UNITS : ENEMIES;

  return (
    <SafeAreaView style={cs.safe}>
      <StatusBar barStyle="light-content" />

      {/* ── HEADER (matches IntelligenceScreen style) ── */}
      <View style={cs.header}>
        <TouchableOpacity style={cs.backBtn} onPress={() => navigation.goBack()}>
          <Text style={cs.backBtnTxt}>←</Text>
        </TouchableOpacity>
        <Text style={cs.headerTitle}>CODEX</Text>
        <View style={cs.headerRight}>
          <View style={cs.resBadge}>
            <Text style={cs.resBadgeIcon}>💀</Text>
            <Text style={cs.resBadgeTxt}>2,400</Text>
          </View>
          <View style={cs.resBadge}>
            <Text style={cs.resBadgeIcon}>🔧</Text>
            <Text style={cs.resBadgeTxt}>1,150</Text>
          </View>
        </View>
      </View>

      {/* ── TOGGLE ── */}
      <View style={cs.toggleWrap}>
        {/* Decorative left / right flanks */}
        <View style={cs.flank}><Text style={cs.flankTxt}>◆ ─ ─</Text></View>

        <View style={cs.toggleTrack}>
          {/* Active pill indicator */}
          <Animated.View
            style={[
              cs.togglePill,
              {
                left: tab === 'UNITS' ? s(2) : '50%',
                backgroundColor: tab === 'UNITS' ? '#5ac8ff' : '#ff6363',
              },
            ]}
          />
          <TouchableOpacity style={cs.toggleOption} onPress={() => switchTab('UNITS')}>
            <Text style={[cs.toggleTxt, tab === 'UNITS' && cs.toggleTxtActive]}>🛡️  UNITS</Text>
          </TouchableOpacity>
          <TouchableOpacity style={cs.toggleOption} onPress={() => switchTab('ENEMIES')}>
            <Text style={[cs.toggleTxt, tab === 'ENEMIES' && cs.toggleTxtActiveEnemy]}>☠️  ENEMIES</Text>
          </TouchableOpacity>
        </View>

        <View style={cs.flank}><Text style={cs.flankTxt}>─ ─ ◆</Text></View>
      </View>

      {/* ── GRID ── */}
      <Animated.View style={[{ flex: 1 }, { transform: [{ translateX: slideAnim }] }]}>
        <ScrollView
          contentContainerStyle={cs.grid}
          showsVerticalScrollIndicator={false}
        >
          {entries.map((entry) => (
            <CodexCard
              key={entry.id}
              entry={entry}
              onPress={() => setSelected(entry)}
            />
          ))}
        </ScrollView>
      </Animated.View>

      {/* ── DETAIL MODAL ── */}
      <DetailModal
        visible={selected !== null}
        entry={selected ?? UNITS[0]}
        onClose={() => setSelected(null)}
      />
    </SafeAreaView>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// SCREEN STYLES
// ────────────────────────────────────────────────────────────────────────────
const cs = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#080e1a',
  },

  // Header — matches IntelligenceScreen/DashboardScreen style
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(5,12,24,0.95)',
    borderTopWidth: bw(1),
    borderBottomWidth: bw(1),
    borderColor: '#bda05e',
    paddingHorizontal: s(16),
    paddingVertical: s(10),
    gap: s(12),
  },
  backBtn: {
    width: s(38),
    height: s(38),
    borderRadius: s(19),
    borderWidth: bw(2),
    borderColor: '#bda05e',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(10,15,25,0.9)',
  },
  backBtnTxt:   { color: '#fff', fontSize: s(16) },
  headerTitle: {
    color: '#fff',
    fontFamily: 'PixelFont',
    fontSize: s(12),
    letterSpacing: 2,
    flex: 1,
  },
  headerRight:  { flexDirection: 'row', gap: s(8) },
  resBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: s(10),
    paddingVertical: s(4),
    borderRadius: s(12),
    gap: s(4),
  },
  resBadgeIcon: { fontSize: s(11) },
  resBadgeTxt:  { color: '#fff', fontFamily: 'PixelFont', fontSize: s(9) },

  // Toggle
  toggleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: s(16),
    paddingVertical: s(14),
    gap: s(10),
  },
  flank:    {},
  flankTxt: { color: '#bda05e', fontSize: s(11), letterSpacing: 2 },
  toggleTrack: {
    flexDirection: 'row',
    backgroundColor: '#0c1525',
    borderWidth: bw(1.5),
    borderColor: '#1e3050',
    borderRadius: s(30),
    padding: s(2),
    position: 'relative',
    overflow: 'hidden',
    width: s(200),
  },
  togglePill: {
    position: 'absolute',
    top: s(2),
    bottom: s(2),
    width: '50%',
    borderRadius: s(28),
    zIndex: 0,
  },
  toggleOption: {
    flex: 1,
    paddingVertical: s(8),
    alignItems: 'center',
    zIndex: 1,
  },
  toggleTxt: {
    color: '#5a7aaa',
    fontSize: s(10),
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  toggleTxtActive:      { color: '#080e1a', fontWeight: '900' },
  toggleTxtActiveEnemy: { color: '#080e1a', fontWeight: '900' },

  subtitle: {
    color: '#3a4a60',
    fontSize: s(10),
    textAlign: 'center',
    letterSpacing: 0.5,
    marginBottom: s(12),
  },

  // Grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: s(12),
    paddingHorizontal: s(16),
    paddingBottom: s(40),
  },
});
