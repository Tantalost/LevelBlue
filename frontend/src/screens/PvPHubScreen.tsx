import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
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
  TextInput,
  Alert,
  Platform,
} from 'react-native';

// ── Scaling ──────────────────────────────────────────────────────────────────
const { width: SW, height: SH } = Dimensions.get('window');
const PW = Math.min(SW, SH);
const PH = Math.max(SW, SH);
const scaleP = Math.min(PW / 390, PH / 844, 1.0) * 0.85; // Scaled down for better fit
const s  = (n: number) => Math.round(PixelRatio.roundToNearestPixel(n * scaleP));
const bw = (n: number) => Math.max(1, s(n));

// ── Mock data ─────────────────────────────────────────────────────────────────
const RECENT_ACTIVITY = [
  { icon: '⚔️', label: 'Attack Forged',       sub: 'Targeting Global Queue',       pts: '-50 TP',  color: '#ff4466', time: '2h ago' },
  { icon: '🛡️', label: 'Inbox Triage Won',    sub: 'Isolated phishing payload',    pts: '+80 TP',  color: '#3fbf7f', time: '5h ago' },
  { icon: '❌', label: 'Triage Failed',        sub: 'Missed SMS smishing attack',   pts: '-20 TP',  color: '#ff6363', time: '1d ago' },
  { icon: '🎯', label: 'Direct Hit Landed',    sub: 'Target fell for email hook',   pts: '+120 TP', color: '#ffcf5c', time: '2d ago' },
];

const LEADERBOARD = [
  { rank: 1, name: 'mx_phantom',    tp: 2840, badge: '💀' },
  { rank: 2, name: 'r3d_k3y',       tp: 2410, badge: '⚔️' },
  { rank: 3, name: 'you',           tp: 2150, badge: '🛡️', isYou: true },
  { rank: 4, name: 'b1ue_ward3n',   tp: 1990, badge: '🔍' },
  { rank: 5, name: 'null_vector',   tp: 1720, badge: '💻' },
];

// ── Stat pill ─────────────────────────────────────────────────────────────────
const StatPill = ({
  icon, value, label, color,
}: { icon: string; value: string; label: string; color: string }) => (
  <View style={[ph.statPill, { borderColor: color + '55' }]}>
    <Text style={ph.statIcon}>{icon}</Text>
    <Text style={[ph.statVal, { color }]}>{value}</Text>
    <Text style={ph.statLbl}>{label}</Text>
  </View>
);

// ── Main screen ───────────────────────────────────────────────────────────────
export default function PvPHubScreen({ navigation }: any) {
  const [tab, setTab] = useState<'overview' | 'leaderboard' | 'communications'>('overview');
  const [bounties, setBounties] = useState<any[]>([]);
  const [userId, setUserId] = useState<string>('');
  // OTP state: maps bountyId → entered code string
  const [otpInputs, setOtpInputs] = useState<Record<string, string>>({});
  const [otpLoading, setOtpLoading] = useState<Record<string, boolean>>({});
  const [otpError, setOtpError] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchBounties = async () => {
      try {
        const userStr = await AsyncStorage.getItem('userData');
        if (userStr) {
          const u = JSON.parse(userStr);
          const id = u._id || u.id;
          setUserId(id);
          const apiUrl = process.env.EXPO_PUBLIC_API_URL;
          const token = Platform.OS === 'web'
            ? await AsyncStorage.getItem('userToken')
            : await SecureStore.getItemAsync('userToken');
          const res = await fetch(`${apiUrl}/bounties/student/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            setBounties(data);
          }
        }
      } catch (e) {
        console.error('Error fetching bounties:', e);
      }
    };
    fetchBounties();
  }, [tab]);

  // MECHANIC 1a: Accept bounty → backend generates OTP, status → AWAITING_LINK
  const handleAcceptBounty = async (id: string) => {
    try {
      const apiUrl = process.env.EXPO_PUBLIC_API_URL;
      const token = Platform.OS === 'web'
        ? await AsyncStorage.getItem('userToken')
        : await SecureStore.getItemAsync('userToken');
      const res = await fetch(`${apiUrl}/bounties/${id}/accept`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setBounties(prev => prev.map(b => b.id === id ? { ...b, ...data } : b));
      }
    } catch (e) {
      console.error('Error accepting bounty:', e);
    }
  };

  // MECHANIC 1b: Mentor submits OTP → status → ACCEPTED
  const handleVerifyOtp = async (bountyId: string) => {
    const code = otpInputs[bountyId]?.trim();
    if (!code || code.length !== 4) {
      setOtpError(prev => ({ ...prev, [bountyId]: 'Enter the 4-digit code.' }));
      return;
    }
    setOtpLoading(prev => ({ ...prev, [bountyId]: true }));
    setOtpError(prev => ({ ...prev, [bountyId]: '' }));
    try {
      const apiUrl = process.env.EXPO_PUBLIC_API_URL;
      const token = Platform.OS === 'web'
        ? await AsyncStorage.getItem('userToken')
        : await SecureStore.getItemAsync('userToken');
      const res = await fetch(`${apiUrl}/bounties/${bountyId}/verify-otp`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });
      const data = await res.json();
      if (res.ok) {
        setBounties(prev => prev.map(b => b.id === bountyId ? { ...b, ...data } : b));
      } else {
        setOtpError(prev => ({ ...prev, [bountyId]: data.error || 'Invalid code.' }));
      }
    } catch (e) {
      setOtpError(prev => ({ ...prev, [bountyId]: 'Network error.' }));
    } finally {
      setOtpLoading(prev => ({ ...prev, [bountyId]: false }));
    }
  };

  const threatPoints = 2150;

  return (
    <SafeAreaView style={ph.safe}>
      <StatusBar barStyle="light-content" />

      {/* ── HEADER ── */}
      <View style={ph.header}>
        <TouchableOpacity style={ph.backBtn} onPress={() => navigation.goBack()}>
          <Text style={ph.backButtonText}>←</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={ph.headerTitle}>THREAT SIMULATOR</Text>
          <Text style={ph.headerSub}>Asynchronous PvP · Red vs Blue</Text>
        </View>
        {/* TP Balance */}
        <View style={ph.tpBadge}>
          <Text style={ph.tpIcon}>💀</Text>
          <Text style={ph.tpVal}>{threatPoints.toLocaleString()}</Text>
          <Text style={ph.tpLbl}> TP</Text>
        </View>
      </View>

      {/* ── ROLE BANNER ── */}
      <View style={ph.roleBanner}>
        <View style={ph.roleHalf}>
          <Text style={ph.roleEmoji}>⚔️</Text>
          <View>
            <Text style={[ph.roleLabel, { color: '#ff4466' }]}>RED TEAM</Text>
            <Text style={ph.roleSub}>Threat Actor</Text>
          </View>
        </View>
        <View style={ph.roleDivider} />
        <View style={ph.roleHalf}>
          <Text style={ph.roleEmoji}>🛡️</Text>
          <View>
            <Text style={[ph.roleLabel, { color: '#5ac8ff' }]}>BLUE TEAM</Text>
            <Text style={ph.roleSub}>Defender</Text>
          </View>
        </View>
      </View>

      {/* ── MAIN ACTION CARDS ── */}
      <View style={ph.actionRow}>
        {/* FORGE ATTACK */}
        <TouchableOpacity
          style={[ph.actionCard, { borderColor: '#ff4466' }]}
          onPress={() => navigation.navigate('PayloadForge')}
          activeOpacity={0.85}
        >
          <View style={[ph.actionGlow, { backgroundColor: '#ff446618' }]} />
          <Text style={ph.actionEmoji}>⚔️</Text>
          <Text style={[ph.actionTitle, { color: '#ff4466' }]}>FORGE ATTACK</Text>
          <Text style={ph.actionDesc}>Build a modular{'\n'}spear-phishing payload</Text>
          <View style={[ph.actionCost, { borderColor: '#ff446660', backgroundColor: '#ff446618' }]}>
            <Text style={[ph.actionCostTxt, { color: '#ff4466' }]}>COSTS 50 TP</Text>
          </View>
          <View style={[ph.actionCta, { borderColor: '#ff4466', backgroundColor: '#ff446622' }]}>
            <Text style={[ph.actionCtaTxt, { color: '#ff4466' }]}>▶  ENTER FORGE</Text>
          </View>
        </TouchableOpacity>

        {/* TRIAGE INBOX */}
        <TouchableOpacity
          style={[ph.actionCard, { borderColor: '#5ac8ff' }]}
          onPress={() => navigation.navigate('InboxTriage')}
          activeOpacity={0.85}
        >
          <View style={[ph.actionGlow, { backgroundColor: '#5ac8ff18' }]} />
          <Text style={ph.actionEmoji}>📥</Text>
          <Text style={[ph.actionTitle, { color: '#5ac8ff' }]}>TRIAGE INBOX</Text>
          <Text style={ph.actionDesc}>Identify peer-crafted{'\n'}attacks in your inbox</Text>
          <View style={[ph.actionCost, { borderColor: '#3fbf7f60', backgroundColor: '#3fbf7f18' }]}>
            <Text style={[ph.actionCostTxt, { color: '#3fbf7f' }]}>EARNS 80 TP</Text>
          </View>
          <View style={[ph.actionCta, { borderColor: '#5ac8ff', backgroundColor: '#5ac8ff22' }]}>
            <Text style={[ph.actionCtaTxt, { color: '#5ac8ff' }]}>▶  OPEN INBOX</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* ── TAB BAR ── */}
      <View style={ph.tabBar}>
        {(['overview', 'leaderboard', 'communications'] as const).map((t) => (
          <TouchableOpacity key={t} style={ph.tabItem} onPress={() => setTab(t)}>
            <Text style={[ph.tabTxt, tab === t && ph.tabTxtActive]}>
              {t === 'overview' ? '📊  ACTIVITY' : t === 'leaderboard' ? '🏆  RANKS' : '📡  COMMS'}
            </Text>
            {tab === t && <View style={ph.tabUnderline} />}
          </TouchableOpacity>
        ))}
      </View>

      {/* ── BODY ── */}
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>

        {tab === 'overview' && (
          <>
            {/* Quick stats */}
            <View style={ph.statsRow}>
              <StatPill icon="⚔️" value="12"  label="Attacks"   color="#ff4466" />
              <StatPill icon="🛡️" value="9"   label="Defended"  color="#5ac8ff" />
              <StatPill icon="🎯" value="74%" label="Accuracy"  color="#ffcf5c" />
              <StatPill icon="🔥" value="3"   label="Streak"    color="#ff9f43" />
            </View>

            {/* Recent activity */}
            <View style={ph.section}>
              <Text style={ph.sectionLabel}>RECENT ACTIVITY</Text>
              {RECENT_ACTIVITY.map((a, i) => (
                <View key={i} style={ph.actRow}>
                  <Text style={ph.actIcon}>{a.icon}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={ph.actLabel}>{a.label}</Text>
                    <Text style={ph.actSub}>{a.sub} · {a.time}</Text>
                  </View>
                  <Text style={[ph.actPts, { color: a.color }]}>{a.pts}</Text>
                </View>
              ))}
            </View>

            {/* TP Economy hint */}
            <View style={ph.hintBox}>
              <Text style={ph.hintTitle}>💡  THREAT ECONOMY</Text>
              <Text style={ph.hintTxt}>
                Threat Points regenerate through{' '}
                <Text style={{ color: '#ffcf5c' }}>Daily Audits</Text>,{' '}
                <Text style={{ color: '#5ac8ff' }}>Stage Replays</Text>, and{' '}
                <Text style={{ color: '#3fbf7f' }}>Successful Triage</Text>.{' '}
                Passive regeneration is disabled — stay active.
              </Text>
            </View>
          </>
        )}

        {tab === 'leaderboard' && (
          <View style={ph.section}>
            <Text style={ph.sectionLabel}>GLOBAL THREAT LEADERBOARD</Text>
            {LEADERBOARD.map((p) => (
              <View
                key={p.rank}
                style={[
                  ph.lbRow,
                  p.isYou && ph.lbRowYou,
                ]}
              >
                <Text style={[ph.lbRank, p.rank === 1 && { color: '#ffcf5c' }]}>
                  #{p.rank}
                </Text>
                <Text style={ph.lbBadge}>{p.badge}</Text>
                <Text style={[ph.lbName, p.isYou && { color: '#5ac8ff' }]}>
                  {p.isYou ? `${p.name}  (you)` : p.name}
                </Text>
                <Text style={[ph.lbTp, { color: p.rank === 1 ? '#ffcf5c' : '#ff4466' }]}>
                  {p.tp.toLocaleString()} TP
                </Text>
              </View>
            ))}
          </View>
        )}

        {tab === 'communications' && (
          <View style={ph.section}>
            <Text style={ph.sectionLabel}>ACTIVE SUPPORT BOUNTIES</Text>
            {bounties.length === 0 ? (
              <Text style={{ color: '#5a7aaa', fontSize: s(12), textAlign: 'center', marginTop: s(20) }}>
                No active comms. Stand by for dispatch.
              </Text>
            ) : (
              bounties.map(b => {
                const isMentor = b.mentor_id === userId;
                return (
                  <View key={b.id} style={{
                    backgroundColor: '#0c1525',
                    borderWidth: bw(1.5),
                    borderColor: b.status === 'PENDING' ? '#ffcf5c'
                      : b.status === 'AWAITING_LINK' ? '#ff9f43'
                      : b.status === 'ACCEPTED' ? '#5ac8ff'
                      : b.status === 'VALIDATED' ? '#3fbf7f'
                      : '#ff4466',
                    borderRadius: s(8), padding: s(12), marginBottom: s(10)
                  }}>

                    {/* Header row */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: s(8) }}>
                      <Text style={{ fontSize: s(9), fontWeight: 'bold', color:
                        b.status === 'PENDING' ? '#ffcf5c'
                        : b.status === 'AWAITING_LINK' ? '#ff9f43'
                        : b.status === 'ACCEPTED' ? '#5ac8ff'
                        : b.status === 'VALIDATED' ? '#3fbf7f'
                        : '#ff4466' }}>
                        {b.status === 'PENDING' ? '⚠ AWAITING ACCEPTANCE'
                          : b.status === 'AWAITING_LINK' ? '🔐 AWAITING LINK VERIFICATION'
                          : b.status === 'ACCEPTED' ? '📡 SECURE CHANNEL OPEN'
                          : b.status === 'VALIDATED' ? '✅ MISSION COMPLETE'
                          : '❌ SELF-CLEARED'}
                      </Text>
                      <Text style={{ color: '#5a7aaa', fontSize: s(9) }}>
                        {new Date(b.created_at).toLocaleDateString()}
                      </Text>
                    </View>

                    <Text style={{ color: '#e8f0ff', fontSize: s(13), fontWeight: 'bold', marginBottom: s(2) }}>
                      {isMentor ? `Assist Agent ${b.mentee?.name}` : `Assistance from Agent ${b.mentor?.name}`}
                    </Text>
                    <Text style={{ color: '#5a7aaa', fontSize: s(11), marginBottom: s(10) }}>
                      Topic Focus: <Text style={{ color: '#ff4466' }}>{b.topic}</Text>
                    </Text>

                    {/* ── MENTOR VIEWS ── */}

                    {/* Mentor: PENDING → Accept button */}
                    {isMentor && b.status === 'PENDING' && (
                      <TouchableOpacity
                        style={{ backgroundColor: '#ffcf5c', paddingVertical: s(10), borderRadius: s(6), alignItems: 'center' }}
                        onPress={() => handleAcceptBounty(b.id)}
                      >
                        <Text style={{ color: '#000', fontWeight: 'bold', fontSize: s(11) }}>ACCEPT BOUNTY</Text>
                      </TouchableOpacity>
                    )}

                    {/* Mentor: AWAITING_LINK → Enter OTP from mentee */}
                    {isMentor && b.status === 'AWAITING_LINK' && (
                      <View style={{ backgroundColor: '#ff9f4318', borderRadius: s(6), padding: s(10), borderWidth: bw(1), borderColor: '#ff9f4350' }}>
                        <Text style={{ color: '#ff9f43', fontSize: s(10), fontWeight: 'bold', marginBottom: s(6) }}>
                          🔐 ENTER MENTEE'S CLEARANCE CODE
                        </Text>
                        <Text style={{ color: '#5a7aaa', fontSize: s(10), marginBottom: s(8) }}>
                          Contact {b.mentee?.name} and ask for their 4-digit code to confirm the link.
                        </Text>
                        <View style={{ flexDirection: 'row', gap: s(8), alignItems: 'center' }}>
                          <TextInput
                            style={{
                              flex: 1, backgroundColor: '#0a1020', borderWidth: bw(1.5), borderColor: '#ff9f43',
                              borderRadius: s(6), paddingHorizontal: s(12), paddingVertical: s(8),
                              color: '#fff', fontSize: s(18), fontWeight: 'bold', textAlign: 'center', letterSpacing: 8
                            }}
                            placeholder="_ _ _ _"
                            placeholderTextColor="#3a4a60"
                            keyboardType="numeric"
                            maxLength={4}
                            value={otpInputs[b.id] || ''}
                            onChangeText={text => setOtpInputs(prev => ({ ...prev, [b.id]: text }))}
                          />
                          <TouchableOpacity
                            style={{ backgroundColor: '#ff9f43', paddingVertical: s(10), paddingHorizontal: s(14), borderRadius: s(6) }}
                            onPress={() => handleVerifyOtp(b.id)}
                            disabled={otpLoading[b.id]}
                          >
                            <Text style={{ color: '#000', fontWeight: 'bold', fontSize: s(11) }}>
                              {otpLoading[b.id] ? '...' : 'VERIFY'}
                            </Text>
                          </TouchableOpacity>
                        </View>
                        {otpError[b.id] ? (
                          <Text style={{ color: '#ff4466', fontSize: s(10), marginTop: s(6) }}>{otpError[b.id]}</Text>
                        ) : null}
                      </View>
                    )}

                    {/* Mentor: ACCEPTED → IRL instruction */}
                    {isMentor && b.status === 'ACCEPTED' && (
                      <View style={{ backgroundColor: '#5ac8ff18', padding: s(10), borderRadius: s(6), borderWidth: bw(1), borderColor: '#5ac8ff40' }}>
                        <Text style={{ color: '#5ac8ff', fontSize: s(10), textAlign: 'center' }}>
                          Link verified ✓ — Locate Agent {b.mentee?.name} (Sec: {b.mentee?.section}) and explain {b.topic}. The BKT engine will detect their improvement.
                        </Text>
                      </View>
                    )}

                    {/* ── MENTEE VIEWS ── */}

                    {/* Mentee: AWAITING_LINK → Show clearance code */}
                    {!isMentor && b.status === 'AWAITING_LINK' && (
                      <View style={{ backgroundColor: '#ff9f4318', borderRadius: s(6), padding: s(12), borderWidth: bw(1), borderColor: '#ff9f4350', alignItems: 'center' }}>
                        <Text style={{ color: '#ff9f43', fontSize: s(10), fontWeight: 'bold', marginBottom: s(6) }}>🔐 YOUR CLEARANCE CODE</Text>
                        <Text style={{ color: '#fff', fontSize: s(32), fontWeight: 'bold', letterSpacing: 12, marginBottom: s(6) }}>
                          {b.clearance_code || '????'}
                        </Text>
                        <Text style={{ color: '#5a7aaa', fontSize: s(10), textAlign: 'center' }}>
                          Share this code with Agent {b.mentor?.name} to confirm the link.
                        </Text>
                      </View>
                    )}

                    {/* Mentee: ACCEPTED → Stand by message */}
                    {!isMentor && b.status === 'ACCEPTED' && (
                      <View style={{ backgroundColor: '#3fbf7f18', padding: s(10), borderRadius: s(6), borderWidth: bw(1), borderColor: '#3fbf7f40' }}>
                        <Text style={{ color: '#3fbf7f', fontSize: s(10), textAlign: 'center' }}>
                          Agent {b.mentor?.name} has confirmed contact. Meet them and then replay the {b.topic} stage to prove your learning.
                        </Text>
                      </View>
                    )}

                    {/* Validated / Self-Cleared — final state */}
                    {b.status === 'VALIDATED' && (
                      <View style={{ backgroundColor: '#3fbf7f18', padding: s(8), borderRadius: s(6) }}>
                        <Text style={{ color: '#3fbf7f', fontSize: s(10), textAlign: 'center', fontWeight: 'bold' }}>✅ BOUNTY VALIDATED — Mentor rewarded.</Text>
                      </View>
                    )}
                    {b.status === 'SELF_CLEARED' && (
                      <View style={{ backgroundColor: '#ff446618', padding: s(8), borderRadius: s(6) }}>
                        <Text style={{ color: '#ff4466', fontSize: s(10), textAlign: 'center', fontWeight: 'bold' }}>❌ SELF-CLEARED — No mentor reward.</Text>
                      </View>
                    )}

                  </View>
                );
              })
            )}
          </View>
        )}


        <View style={{ height: s(32) }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const ph = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#080e1a' },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(5,12,24,0.95)',
    borderTopWidth: bw(1),
    borderBottomWidth: bw(1),
    borderColor: '#ff4466',
    paddingHorizontal: s(16),
    paddingVertical: s(6),
    gap: s(10),
  },
  backBtn: {
    width: s(38), height: s(38), borderRadius: s(19),
    borderWidth: bw(2), borderColor: '#ff4466',
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(10,15,25,0.9)',
  },
  backButtonText: {
    color: '#ffffff',
    fontFamily: 'PixelFont',
    fontSize: s(14),
  },
  headerTitle: { color: '#fff', fontFamily: 'PixelFont', fontSize: s(10), letterSpacing: 2 },
  headerSub:   { color: '#ff4466', fontSize: s(9), marginTop: s(2) },
  tpBadge: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,68,102,0.15)',
    borderWidth: bw(1), borderColor: '#ff446660',
    borderRadius: s(20), paddingHorizontal: s(10), paddingVertical: s(5),
    gap: s(3),
  },
  tpIcon: { fontSize: s(12) },
  tpVal:  { color: '#ff4466', fontWeight: 'bold', fontSize: s(13) },
  tpLbl:  { color: '#5a7aaa', fontSize: s(9) },

  // Role banner
  roleBanner: {
    flexDirection: 'row',
    backgroundColor: '#0c1525',
    borderBottomWidth: bw(1),
    borderBottomColor: '#1e3050',
    paddingVertical: s(6),
  },
  roleHalf:   { flex: 1, alignItems: 'center', gap: s(8), flexDirection: 'row', justifyContent: 'center' },
  roleDivider: { width: bw(1), backgroundColor: '#1e3050' },
  roleEmoji:  { fontSize: s(18) },
  roleLabel:  { fontSize: s(10), fontWeight: '900', letterSpacing: 2 },
  roleSub:    { color: '#5a7aaa', fontSize: s(9) },

  // Action cards
  actionRow: {
    flexDirection: 'row',
    padding: s(10),
    gap: s(10),
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#0c1525',
    borderWidth: bw(2),
    borderRadius: s(12),
    padding: s(10),
    alignItems: 'center',
    gap: s(6),
    position: 'relative',
    overflow: 'hidden',
  },
  actionGlow: { ...StyleSheet.absoluteFillObject },
  actionEmoji: { fontSize: s(28) },
  actionTitle: { fontFamily: 'PixelFont', fontSize: s(10), letterSpacing: 1, textAlign: 'center' },
  actionDesc:  { color: '#5a7aaa', fontSize: s(9), textAlign: 'center', lineHeight: s(13) },
  actionCost: {
    borderWidth: bw(1), borderRadius: s(20),
    paddingHorizontal: s(8), paddingVertical: s(2),
  },
  actionCostTxt: { fontSize: s(8), fontWeight: '900', letterSpacing: 1 },
  actionCta: {
    width: '100%', borderWidth: bw(1.5),
    borderRadius: s(8), paddingVertical: s(8), alignItems: 'center',
  },
  actionCtaTxt: { fontSize: s(9), fontWeight: 'bold', letterSpacing: 1 },

  // Tab bar
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: bw(1),
    borderBottomColor: '#1e3050',
    backgroundColor: '#0c1525',
  },
  tabItem:      { flex: 1, alignItems: 'center', paddingVertical: s(10) },
  tabTxt:       { color: '#3a4a60', fontSize: s(10), fontWeight: 'bold' },
  tabTxtActive: { color: '#ff4466' },
  tabUnderline: { position: 'absolute', bottom: 0, left: '20%', right: '20%', height: bw(2), backgroundColor: '#ff4466' },

  // Stats
  statsRow: { flexDirection: 'row', gap: s(8), padding: s(14) },
  statPill: {
    flex: 1, backgroundColor: '#0c1525',
    borderWidth: bw(1.5), borderRadius: s(12),
    padding: s(10), alignItems: 'center', gap: s(3),
  },
  statIcon: { fontSize: s(18) },
  statVal:  { fontSize: s(16), fontWeight: 'bold' },
  statLbl:  { color: '#5a7aaa', fontSize: s(9), textAlign: 'center' },

  // Section
  section: { paddingHorizontal: s(14), paddingBottom: s(10) },
  sectionLabel: {
    color: '#ff4466', fontSize: s(9), fontWeight: '900',
    letterSpacing: 2, marginBottom: s(12),
  },

  // Activity rows
  actRow: {
    flexDirection: 'row', alignItems: 'center', gap: s(12),
    paddingVertical: s(10), borderTopWidth: bw(1), borderTopColor: '#1e3050',
  },
  actIcon:  { fontSize: s(20) },
  actLabel: { color: '#e8f0ff', fontSize: s(12), fontWeight: 'bold' },
  actSub:   { color: '#5a7aaa', fontSize: s(10), marginTop: s(1) },
  actPts:   { fontWeight: 'bold', fontSize: s(12) },

  // Hint box
  hintBox: {
    margin: s(14),
    backgroundColor: '#0c1525',
    borderWidth: bw(1),
    borderColor: '#1e3050',
    borderRadius: s(12),
    padding: s(14),
  },
  hintTitle: { color: '#ffcf5c', fontSize: s(10), fontWeight: '900', letterSpacing: 1, marginBottom: s(8) },
  hintTxt:   { color: '#5a7aaa', fontSize: s(12), lineHeight: s(18) },

  // Leaderboard
  lbRow: {
    flexDirection: 'row', alignItems: 'center', gap: s(10),
    paddingVertical: s(12), borderTopWidth: bw(1), borderTopColor: '#1e3050',
  },
  lbRowYou: { backgroundColor: '#5ac8ff0a', borderRadius: s(8), paddingHorizontal: s(6) },
  lbRank:   { color: '#5a7aaa', fontSize: s(12), fontWeight: 'bold', width: s(28) },
  lbBadge:  { fontSize: s(18) },
  lbName:   { flex: 1, color: '#e8f0ff', fontSize: s(12) },
  lbTp:     { fontWeight: 'bold', fontSize: s(12) },
});
