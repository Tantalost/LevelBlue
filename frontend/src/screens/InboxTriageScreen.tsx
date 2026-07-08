import React, { useState } from 'react';
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
} from 'react-native';

// ── Scaling ──────────────────────────────────────────────────────────────────
const { width: SW, height: SH } = Dimensions.get('window');
const PW = Math.min(SW, SH);
const PH = Math.max(SW, SH);
const scaleP = Math.min(PW / 390, PH / 844, 1.0);
const s  = (n: number) => Math.round(PixelRatio.roundToNearestPixel(n * scaleP));
const bw = (n: number) => Math.max(1, s(n));

// ── Types ─────────────────────────────────────────────────────────────────────
type TriageStatus = 'pending' | 'approved' | 'quarantined';

interface Message {
  id: string;
  from: string;
  sender: string;      // display name
  subject: string;
  preview: string;
  body: string;
  timestamp: string;
  isMalicious: boolean;
  indicators: string[];  // red flags (shown post-triage)
}

// ── Mock inbox ────────────────────────────────────────────────────────────────
// 6 benign + 1 peer-crafted malicious (randomised position)
const MESSAGES: Message[] = [
  {
    id: 'm1',
    from: 'library@wmsu.edu.ph',
    sender: 'WMSU Library Services',
    subject: 'Extended Library Hours – Final Exam Week',
    preview: 'The Main Library will be open 24/7 from June 16 to June 22…',
    body: 'Dear student,\n\nPlease be informed that the WMSU Main Library will extend its operating hours to 24/7 during the upcoming final examination period (June 16–22, 2025).\n\nStudy rooms may be reserved via the library portal.\n\nLibrary Services Office',
    timestamp: '10:42 AM',
    isMalicious: false,
    indicators: [],
  },
  {
    id: 'm2',
    from: 'it-noreply@wmsu.edu.ph',
    sender: 'WMSU IT Services',
    subject: '[NOTICE] Scheduled Maintenance – Student Portal',
    preview: 'The student portal will undergo scheduled maintenance on Saturday, June 14 from 11 PM to 3 AM…',
    body: 'Dear WMSU Student,\n\nPlease be advised that the Student Information System (SIS) portal will be unavailable on Saturday, June 14, 2025 from 11:00 PM to 3:00 AM for scheduled system maintenance.\n\nNo action is required from your end.\n\nWMSU IT Services Department',
    timestamp: '9:15 AM',
    isMalicious: false,
    indicators: [],
  },
  {
    id: 'm3',
    from: 'it.admin-helpdesk@wmsu-ils.support',   // suspicious domain
    sender: 'WMSU-ILS IT Admin',
    subject: '⚠️ URGENT: Your Portal Account Will Be Suspended',
    preview: 'We have detected unusual login activity on your student account. Immediate verification required to prevent suspension…',
    body: 'Dear Student,\n\nOur security system has flagged your account for unusual login activity. To prevent your account from being permanently suspended, you must verify your credentials immediately.\n\nClick the link below to confirm your identity:\n\nhttps://wmsu-secure-login.site/verify\n\nFailure to verify within 24 hours will result in permanent account lock.\n\nWMSU-ILS IT Admin\nHelpdesk Support',
    timestamp: '8:03 AM',
    isMalicious: true,
    indicators: [
      'Sender domain "wmsu-ils.support" is NOT the official wmsu.edu.ph domain',
      'Urgent language designed to trigger panic response',
      'Link domain "wmsu-secure-login.site" does not match wmsu.edu.ph',
      'Requests credential verification via email — IT never does this',
      '24-hour deadline creates artificial urgency',
    ],
  },
  {
    id: 'm4',
    from: 'registrar@wmsu.edu.ph',
    sender: 'Office of the Registrar',
    subject: 'Enrollment Advisory – 2nd Semester AY 2025-2026',
    preview: 'Pre-enrollment for continuing students begins on June 18. Please log in to the SIS portal to verify your subjects…',
    body: 'Dear Student,\n\nThis is to inform all continuing students that pre-enrollment for the 2nd semester of AY 2025-2026 will commence on June 18, 2025.\n\nPlease log in to the official SIS portal at sis.wmsu.edu.ph to verify your enrolled subjects and confirm your section.\n\nFor concerns, visit the Registrar\'s Office at the Admin Building or email registrar@wmsu.edu.ph.\n\nOffice of the Registrar\nWestern Mindanao State University',
    timestamp: 'Yesterday',
    isMalicious: false,
    indicators: [],
  },
  {
    id: 'm5',
    from: 'scholarship@dost.gov.ph',
    sender: 'DOST Scholarship Office',
    subject: 'DOST-SEI Scholarship Application Reminder',
    preview: 'This is a reminder that the deadline for the DOST-SEI scholarship application is on June 20, 2025…',
    body: 'Dear Applicant,\n\nThis is a friendly reminder that the application period for the DOST-SEI Merit Scholarship closes on June 20, 2025.\n\nEnsure that all required documents are submitted through the official DOST portal at scholarships.dost.gov.ph.\n\nFor inquiries, contact the DOST Scholarship Secretariat at scholarship@dost.gov.ph.\n\nDOST Scholarship Office',
    timestamp: 'Yesterday',
    isMalicious: false,
    indicators: [],
  },
  {
    id: 'm6',
    from: 'csc.wmsu@wmsu.edu.ph',
    sender: 'Computer Science Club',
    subject: 'General Assembly – June 15, 3PM, ILS Auditorium',
    preview: 'All CS students are invited to the Computer Science Club General Assembly on June 15, 3:00 PM…',
    body: 'Hello CS Students!\n\nYou are cordially invited to the Computer Science Club General Assembly on June 15, 2025, 3:00 PM at the ILS Auditorium.\n\nAgenda includes election of new officers, announcement of upcoming hackathons, and Tech Talk by alumni.\n\nAttendance will be checked. See you there!\n\nCS Club Officers\nWMSU-ILS',
    timestamp: '2 days ago',
    isMalicious: false,
    indicators: [],
  },
  {
    id: 'm7',
    from: 'wifi-support@wmsu.edu.ph',
    sender: 'WMSU Network Services',
    subject: 'Campus WiFi Infrastructure Upgrade Complete',
    preview: 'We are pleased to announce that the campus-wide WiFi upgrade has been completed. New SSIDs are now active…',
    body: 'Dear Students and Faculty,\n\nThe WMSU campus-wide WiFi infrastructure upgrade has been successfully completed.\n\nNew Network Names:\n• WMSU_Student (for students)\n• WMSU_Faculty (for faculty and staff)\n\nPlease reconnect using your WMSU credentials. The old "WMSU-WiFi" SSID has been retired.\n\nFor assistance, visit the IT Office at the Admin Building.\n\nWMSU Network Services',
    timestamp: '3 days ago',
    isMalicious: false,
    indicators: [],
  },
];

// ── Message list item ─────────────────────────────────────────────────────────
function MessageRow({
  msg, status, onPress,
}: {
  msg: Message;
  status: TriageStatus;
  onPress: () => void;
}) {
  const statusColor =
    status === 'approved'    ? '#3fbf7f' :
    status === 'quarantined' ? '#ff4466' : '#5a7aaa';
  const statusIcon =
    status === 'approved'    ? '✅' :
    status === 'quarantined' ? '🔒' : '●';

  return (
    <TouchableOpacity
      style={[
        mr.row,
        status !== 'pending' && { opacity: 0.65 },
        status === 'quarantined' && { borderLeftColor: '#ff4466', borderLeftWidth: bw(3) },
        status === 'approved'    && { borderLeftColor: '#3fbf7f', borderLeftWidth: bw(3) },
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Avatar */}
      <View style={[mr.avatar, { borderColor: statusColor + '60' }]}>
        <Text style={mr.avatarTxt}>{msg.sender.charAt(0)}</Text>
      </View>

      {/* Content */}
      <View style={{ flex: 1 }}>
        <View style={mr.metaRow}>
          <Text style={mr.senderTxt} numberOfLines={1}>{msg.sender}</Text>
          <Text style={mr.timeTxt}>{msg.timestamp}</Text>
        </View>
        <Text style={mr.subjectTxt} numberOfLines={1}>{msg.subject}</Text>
        <Text style={mr.previewTxt} numberOfLines={1}>{msg.preview}</Text>
      </View>

      {/* Status indicator */}
      <Text style={[mr.statusIcon, { color: statusColor }]}>{statusIcon}</Text>
    </TouchableOpacity>
  );
}
const mr = StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#0c1525', padding: s(14), gap: s(12),
    borderBottomWidth: bw(1), borderBottomColor: '#1e3050',
  },
  avatar: {
    width: s(40), height: s(40), borderRadius: s(20),
    backgroundColor: '#080e1a', borderWidth: bw(1.5),
    justifyContent: 'center', alignItems: 'center',
  },
  avatarTxt: { color: '#5ac8ff', fontWeight: 'bold', fontSize: s(14) },
  metaRow:   { flexDirection: 'row', justifyContent: 'space-between', marginBottom: s(2) },
  senderTxt: { color: '#e8f0ff', fontWeight: 'bold', fontSize: s(12), flex: 1 },
  timeTxt:   { color: '#3a4a60', fontSize: s(10), marginLeft: s(8) },
  subjectTxt:{ color: '#b0c8f0', fontSize: s(12), marginBottom: s(2) },
  previewTxt:{ color: '#3a4a60', fontSize: s(11) },
  statusIcon:{ fontSize: s(16), marginLeft: s(4) },
});

// ── Message detail modal ──────────────────────────────────────────────────────
function MessageDetailModal({
  msg,
  status,
  revealed,
  onApprove,
  onQuarantine,
  onClose,
}: {
  msg: Message;
  status: TriageStatus;
  revealed: boolean;
  onApprove: () => void;
  onQuarantine: () => void;
  onClose: () => void;
}) {
  return (
    <Modal
      visible
      transparent
      animationType="fade"
      supportedOrientations={['portrait', 'landscape', 'landscape-left', 'landscape-right']}
      onRequestClose={() => {}}
    >
      <View style={md.overlay}>
        <View style={md.panel}>
          {/* Header */}
          <View style={md.header}>
            <View style={{ flex: 1 }}>
              <Text style={md.subject} numberOfLines={2}>{msg.subject}</Text>
              <Text style={md.meta}>From: <Text style={{ color: '#5ac8ff' }}>{msg.from}</Text></Text>
              <Text style={md.meta}>Sender: {msg.sender} · {msg.timestamp}</Text>
            </View>
            <TouchableOpacity style={md.closeBtn} onPress={onClose}>
              <Text style={md.closeTxt}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={md.scroll}>
            {/* Body */}
            <Text style={md.body}>{msg.body}</Text>

            {/* Post-reveal indicators */}
            {revealed && msg.isMalicious && (
              <View style={md.alertBox}>
                <Text style={md.alertTitle}>⚠️  MALICIOUS PAYLOAD DETECTED</Text>
                <Text style={md.alertSub}>This was the peer-crafted attack. Red flags:</Text>
                {msg.indicators.map((ind, i) => (
                  <Text key={i} style={md.indicator}>• {ind}</Text>
                ))}
              </View>
            )}
            {revealed && !msg.isMalicious && (
              <View style={[md.alertBox, { borderColor: '#3fbf7f60', backgroundColor: '#3fbf7f0a' }]}>
                <Text style={[md.alertTitle, { color: '#3fbf7f' }]}>✅  VERIFIED SAFE</Text>
                <Text style={[md.alertSub, { color: '#5a7aaa' }]}>This was a legitimate system message. No threats detected.</Text>
              </View>
            )}

            <View style={{ height: s(20) }} />
          </ScrollView>

          {/* Actions */}
          {status === 'pending' && !revealed && (
            <View style={md.actionRow}>
              <TouchableOpacity style={md.quarantineBtn} onPress={onQuarantine}>
                <Text style={md.quarantineTxt}>🔒  QUARANTINE</Text>
              </TouchableOpacity>
              <TouchableOpacity style={md.approveBtn} onPress={onApprove}>
                <Text style={md.approveTxt}>✅  APPROVE</Text>
              </TouchableOpacity>
            </View>
          )}
          {status !== 'pending' && (
            <View style={[md.actionRow, { justifyContent: 'center' }]}>
              <Text style={{ color: status === 'quarantined' ? '#ff4466' : '#3fbf7f', fontWeight: 'bold', fontSize: s(13) }}>
                {status === 'quarantined' ? '🔒  Quarantined' : '✅  Approved'}
              </Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}
const md = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' },
  panel: {
    backgroundColor: '#080e1a',
    borderTopWidth: bw(2), borderLeftWidth: bw(2), borderRightWidth: bw(2),
    borderColor: '#1e3050', borderTopLeftRadius: s(20), borderTopRightRadius: s(20),
    maxHeight: '88%',
  },
  header: {
    flexDirection: 'row', padding: s(16), gap: s(12),
    borderBottomWidth: bw(1), borderBottomColor: '#1e3050',
  },
  subject:  { color: '#e8f0ff', fontSize: s(14), fontWeight: 'bold', marginBottom: s(6), lineHeight: s(20) },
  meta:     { color: '#5a7aaa', fontSize: s(11), marginBottom: s(2) },
  closeBtn: { width: s(28), height: s(28), borderRadius: s(14), backgroundColor: '#1e3050', justifyContent: 'center', alignItems: 'center' },
  closeTxt: { color: '#fff', fontSize: s(12) },
  scroll:   { padding: s(16) },
  body:     { color: '#b0c8f0', fontSize: s(13), lineHeight: s(22), marginBottom: s(16) },
  alertBox: {
    backgroundColor: '#ff44660a', borderWidth: bw(1.5),
    borderColor: '#ff446660', borderRadius: s(12), padding: s(14), gap: s(6),
  },
  alertTitle:  { color: '#ff4466', fontWeight: '900', fontSize: s(12), letterSpacing: 1 },
  alertSub:    { color: '#5a7aaa', fontSize: s(11) },
  indicator:   { color: '#ff8899', fontSize: s(11), lineHeight: s(18) },
  actionRow: {
    flexDirection: 'row', gap: s(12),
    padding: s(14), borderTopWidth: bw(1), borderTopColor: '#1e3050',
  },
  quarantineBtn: {
    flex: 1, backgroundColor: '#ff446622', borderWidth: bw(1.5),
    borderColor: '#ff4466', borderRadius: s(12),
    paddingVertical: s(14), alignItems: 'center',
  },
  quarantineTxt: { color: '#ff4466', fontWeight: 'bold', fontSize: s(12) },
  approveBtn: {
    flex: 1, backgroundColor: '#3fbf7f22', borderWidth: bw(1.5),
    borderColor: '#3fbf7f', borderRadius: s(12),
    paddingVertical: s(14), alignItems: 'center',
  },
  approveTxt: { color: '#3fbf7f', fontWeight: 'bold', fontSize: s(12) },
});

// ── Results overlay ───────────────────────────────────────────────────────────
function ResultsOverlay({
  statuses, onClose,
}: {
  statuses: Record<string, TriageStatus>;
  onClose: () => void;
}) {
  const malMsg  = MESSAGES.find(m => m.isMalicious)!;
  const foundIt = statuses[malMsg.id] === 'quarantined';
  const benign  = MESSAGES.filter(m => !m.isMalicious);
  const falsePos = benign.filter(m => statuses[m.id] === 'quarantined').length;
  const win = foundIt && falsePos === 0;

  return (
    <Modal
      visible
      transparent
      animationType="fade"
      supportedOrientations={['portrait', 'landscape', 'landscape-left', 'landscape-right']}
      onRequestClose={() => {}}
    >
      <View style={ro.overlay}>
        <View style={ro.panel}>
          <Text style={ro.big}>{win ? '🏆' : '❌'}</Text>
          <Text style={[ro.title, { color: win ? '#3fbf7f' : '#ff4466' }]}>
            {win ? 'TRIAGE SUCCESSFUL' : 'TRIAGE FAILED'}
          </Text>
          <Text style={ro.sub}>
            {win
              ? 'You correctly isolated the peer-crafted attack with no false positives.'
              : foundIt
                ? `You found the attack but quarantined ${falsePos} safe message${falsePos > 1 ? 's' : ''} (false positive penalty).`
                : 'You missed the malicious payload.'}
          </Text>

          {/* Stats */}
          <View style={ro.statsRow}>
            <View style={ro.stat}>
              <Text style={[ro.statVal, { color: foundIt ? '#3fbf7f' : '#ff4466' }]}>
                {foundIt ? '✓' : '✗'}
              </Text>
              <Text style={ro.statLbl}>Attack{'\n'}Detected</Text>
            </View>
            <View style={ro.stat}>
              <Text style={[ro.statVal, { color: falsePos === 0 ? '#3fbf7f' : '#ffcf5c' }]}>
                {falsePos}
              </Text>
              <Text style={ro.statLbl}>False{'\n'}Positives</Text>
            </View>
            <View style={ro.stat}>
              <Text style={[ro.statVal, { color: win ? '#3fbf7f' : '#ff4466' }]}>
                {win ? '+80' : '+0'}
              </Text>
              <Text style={ro.statLbl}>Threat{'\n'}Points</Text>
            </View>
          </View>

          {/* Attack breakdown */}
          <View style={ro.breakdown}>
            <Text style={ro.breakdownTitle}>THE ATTACK WAS:</Text>
            <Text style={ro.breakdownTxt}>From: <Text style={{ color: '#ff8899' }}>{malMsg.from}</Text></Text>
            <Text style={ro.breakdownTxt}>Subject: {malMsg.subject}</Text>
            {malMsg.indicators.slice(0, 2).map((ind, i) => (
              <Text key={i} style={ro.indicator}>⚠️  {ind}</Text>
            ))}
          </View>

          <TouchableOpacity style={ro.btn} onPress={onClose}>
            <Text style={ro.btnTxt}>BACK TO HUB</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
const ro = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.92)', justifyContent: 'center', alignItems: 'center', padding: s(20) },
  panel: {
    width: '100%', backgroundColor: '#080e1a',
    borderWidth: bw(2), borderColor: '#1e3050',
    borderRadius: s(20), padding: s(20), alignItems: 'center', gap: s(12),
  },
  big:   { fontSize: s(52) },
  title: { fontFamily: 'PixelFont', fontSize: s(14), letterSpacing: 2, textAlign: 'center' },
  sub:   { color: '#5a7aaa', fontSize: s(12), textAlign: 'center', lineHeight: s(18) },
  statsRow: { flexDirection: 'row', gap: s(12), marginTop: s(4) },
  stat: {
    flex: 1, backgroundColor: '#0c1525', borderWidth: bw(1),
    borderColor: '#1e3050', borderRadius: s(12), padding: s(12), alignItems: 'center', gap: s(4),
  },
  statVal: { fontSize: s(22), fontWeight: 'bold' },
  statLbl: { color: '#5a7aaa', fontSize: s(9), textAlign: 'center', lineHeight: s(13) },
  breakdown: {
    width: '100%', backgroundColor: '#0c1525',
    borderWidth: bw(1), borderColor: '#ff446640',
    borderRadius: s(12), padding: s(14), gap: s(4),
  },
  breakdownTitle: { color: '#ff4466', fontSize: s(9), fontWeight: '900', letterSpacing: 2, marginBottom: s(4) },
  breakdownTxt:   { color: '#b0c8f0', fontSize: s(11), lineHeight: s(17) },
  indicator:      { color: '#ff8899', fontSize: s(10), lineHeight: s(16) },
  btn: {
    width: '100%', backgroundColor: '#ff4466', borderRadius: s(12),
    paddingVertical: s(14), alignItems: 'center', marginTop: s(4),
  },
  btnTxt: { color: '#fff', fontFamily: 'PixelFont', fontSize: s(10), letterSpacing: 1 },
});

// ── Main screen ───────────────────────────────────────────────────────────────
export default function InboxTriageScreen({ navigation }: any) {
  const [statuses, setStatuses] = useState<Record<string, TriageStatus>>(
    Object.fromEntries(MESSAGES.map(m => [m.id, 'pending']))
  );
  const [selected, setSelected] = useState<Message | null>(null);
  const [showResults, setShowResults] = useState(false);

  const pendingCount = Object.values(statuses).filter(s => s === 'pending').length;
  const allDone      = pendingCount === 0;

  const triage = (id: string, verdict: 'approved' | 'quarantined') => {
    setStatuses(prev => ({ ...prev, [id]: verdict }));
    setSelected(null);
  };

  return (
    <SafeAreaView style={it.safe}>
      <StatusBar barStyle="light-content" />

      {/* ── HEADER ── */}
      <View style={it.header}>
        <TouchableOpacity style={it.backBtn} onPress={() => navigation.goBack()}>
          <Text style={it.backBtnTxt}>←</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={it.headerTitle}>INBOX TRIAGE</Text>
          <Text style={it.headerSub}>
            {allDone
              ? 'All messages triaged · Submit when ready'
              : `${pendingCount} message${pendingCount !== 1 ? 's' : ''} remaining`}
          </Text>
        </View>
        {/* Progress pip */}
        <View style={it.progressBadge}>
          <Text style={it.progressTxt}>
            {MESSAGES.length - pendingCount}/{MESSAGES.length}
          </Text>
        </View>
      </View>

      {/* ── INSTRUCTION BANNER ── */}
      <View style={it.banner}>
        <Text style={it.bannerTxt}>
          📨  One of these {MESSAGES.length} messages is a peer-crafted attack.{' '}
          <Text style={{ color: '#ff4466' }}>Quarantine</Text> it and{' '}
          <Text style={{ color: '#3fbf7f' }}>Approve</Text> the rest.
        </Text>
      </View>

      {/* ── MESSAGE LIST ── */}
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {MESSAGES.map((msg) => (
          <MessageRow
            key={msg.id}
            msg={msg}
            status={statuses[msg.id]}
            onPress={() => setSelected(msg)}
          />
        ))}
        <View style={{ height: s(20) }} />
      </ScrollView>

      {/* ── SUBMIT FOOTER ── */}
      <View style={it.footer}>
        <View style={it.footerInfo}>
          <Text style={it.footerLabel}>PROGRESS</Text>
          <View style={it.footerBar}>
            <View style={[it.footerBarFill, { width: `${((MESSAGES.length - pendingCount) / MESSAGES.length) * 100}%` }]} />
          </View>
        </View>
        <TouchableOpacity
          style={[it.submitBtn, !allDone && it.submitBtnDisabled]}
          onPress={() => allDone && setShowResults(true)}
          disabled={!allDone}
        >
          <Text style={it.submitBtnTxt}>
            {allDone ? 'SUBMIT TRIAGE' : `${pendingCount} REMAINING`}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── MESSAGE DETAIL ── */}
      {selected && (
        <MessageDetailModal
          msg={selected}
          status={statuses[selected.id]}
          revealed={false}
          onApprove={() => triage(selected.id, 'approved')}
          onQuarantine={() => triage(selected.id, 'quarantined')}
          onClose={() => setSelected(null)}
        />
      )}

      {/* ── RESULTS ── */}
      {showResults && (
        <ResultsOverlay
          statuses={statuses}
          onClose={() => {
            setShowResults(false);
            navigation.navigate('PvPHub');
          }}
        />
      )}
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const it = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#080e1a' },

  header: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(5,12,24,0.95)',
    borderTopWidth: bw(1), borderBottomWidth: bw(1), borderColor: '#5ac8ff',
    paddingHorizontal: s(16), paddingVertical: s(10), gap: s(10),
  },
  backBtn: {
    width: s(38), height: s(38), borderRadius: s(19),
    borderWidth: bw(2), borderColor: '#5ac8ff',
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(10,15,25,0.9)',
  },
  backBtnTxt: { color: '#fff', fontSize: s(16) },
  headerTitle: { color: '#fff', fontFamily: 'PixelFont', fontSize: s(10), letterSpacing: 2 },
  headerSub:   { color: '#5ac8ff', fontSize: s(9), marginTop: s(2) },
  progressBadge: {
    backgroundColor: '#5ac8ff18', borderWidth: bw(1), borderColor: '#5ac8ff60',
    borderRadius: s(20), paddingHorizontal: s(10), paddingVertical: s(5),
  },
  progressTxt: { color: '#5ac8ff', fontWeight: 'bold', fontSize: s(12) },

  banner: {
    backgroundColor: '#0c1525', borderBottomWidth: bw(1),
    borderBottomColor: '#1e3050', padding: s(12),
  },
  bannerTxt: { color: '#5a7aaa', fontSize: s(11), lineHeight: s(17) },

  footer: {
    flexDirection: 'row', alignItems: 'center', gap: s(12),
    padding: s(14), borderTopWidth: bw(1), borderTopColor: '#1e3050',
    backgroundColor: '#0c1525',
  },
  footerInfo:    { flex: 1, gap: s(4) },
  footerLabel:   { color: '#5a7aaa', fontSize: s(8), fontWeight: '900', letterSpacing: 2 },
  footerBar:     { height: s(4), backgroundColor: '#1e3050', borderRadius: s(2), overflow: 'hidden' },
  footerBarFill: { height: '100%', backgroundColor: '#5ac8ff', borderRadius: s(2) },
  submitBtn: {
    backgroundColor: '#5ac8ff', borderRadius: s(12),
    paddingVertical: s(12), paddingHorizontal: s(20), alignItems: 'center',
    shadowColor: '#5ac8ff', shadowOpacity: 0.6, shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 }, elevation: 8,
  },
  submitBtnDisabled: { backgroundColor: '#1e3050', shadowOpacity: 0 },
  submitBtnTxt: { color: '#080e1a', fontFamily: 'PixelFont', fontSize: s(9), fontWeight: 'bold', letterSpacing: 1 },
});
