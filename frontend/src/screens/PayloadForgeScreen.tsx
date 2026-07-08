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
const scaleP = Math.min(PW / 390, PH / 844, 1.0) * 0.85;
const s  = (n: number) => Math.round(PixelRatio.roundToNearestPixel(n * scaleP));
const bw = (n: number) => Math.max(1, s(n));

// ── Step data ─────────────────────────────────────────────────────────────────
const STEPS = [
  {
    id: 'vector',
    label: 'DELIVERY VECTOR',
    subtitle: 'How will the payload be delivered?',
    icon: '📡',
    options: [
      { id: 'email',  label: 'Email',       icon: '📧', desc: 'Formal channel · High trust factor',       color: '#5ac8ff' },
      { id: 'sms',    label: 'SMS',         icon: '📱', desc: 'Immediate · Bypasses email filters',        color: '#3fbf7f' },
      { id: 'social', label: 'Social DM',   icon: '💬', desc: 'Personal tone · Low guard trigger',         color: '#d400ff' },
    ],
  },
  {
    id: 'persona',
    label: 'IMPERSONATED PERSONA',
    subtitle: 'Who will the attacker impersonate?',
    icon: '🎭',
    options: [
      { id: 'itadmin',    label: 'WMSU IT Admin',      icon: '💻', desc: 'High authority · Technical urgency',  color: '#5ac8ff' },
      { id: 'registrar',  label: 'Registrar\'s Office', icon: '🏫', desc: 'Institutional trust · Deadline fear', color: '#ffcf5c' },
      { id: 'classmate',  label: 'Student Classmate',   icon: '🧑‍🎓', desc: 'Social trust · Informal tone',        color: '#3fbf7f' },
    ],
  },
  {
    id: 'hook',
    label: 'PSYCHOLOGICAL HOOK',
    subtitle: 'What urgency will you exploit?',
    icon: '🎣',
    options: [
      { id: 'suspend',  label: 'Account Suspension',  icon: '⚠️', desc: 'Fear of losing access · Panic response',   color: '#ff6363' },
      { id: 'form',     label: 'Missing Form',        icon: '📄', desc: 'Compliance fear · Grade threat',            color: '#ffcf5c' },
      { id: 'prize',    label: 'Prize Winner',        icon: '🎁', desc: 'Greed trigger · Low-effort click',          color: '#3fbf7f' },
    ],
  },
  {
    id: 'payload',
    label: 'MALICIOUS PAYLOAD',
    subtitle: 'What is the call-to-action?',
    icon: '💣',
    options: [
      { id: 'url',   label: 'Phishing URL',     icon: '🔗', desc: 'Credential harvest via fake portal',    color: '#ff4466' },
      { id: 'pdf',   label: 'Fake PDF',         icon: '📎', desc: 'Document download with embedded hook',  color: '#ff9f43' },
      { id: 'form',  label: 'Fake Login Form',  icon: '🔐', desc: 'Direct credential input simulation',    color: '#d400ff' },
    ],
  },
];

const ROUTING = [
  {
    id: 'direct',
    label: 'Direct Target',
    icon: '🎯',
    desc: 'Sent to a specific classmate.\n24-hour cooldown per target.\n48-hour TTL before queue fallback.',
    color: '#ff4466',
  },
  {
    id: 'global',
    label: 'Global Queue',
    icon: '🌐',
    desc: 'Pushed to the shared pool.\nNext available defender receives it.\nFastest resolution and leaderboard update.',
    color: '#5ac8ff',
  },
];

// ── Persona labels for preview ────────────────────────────────────────────────
const VECTOR_LABELS: Record<string, string>  = { email: 'Email', sms: 'SMS', social: 'Social DM' };
const PERSONA_LABELS: Record<string, string> = { itadmin: 'IT Admin', registrar: 'Registrar\'s Office', classmate: 'Classmate' };
const HOOK_LABELS: Record<string, string>    = { suspend: 'Account Suspension', form: 'Missing Form', prize: 'Prize Winner' };
const PAYLOAD_LABELS: Record<string, string> = { url: 'Phishing URL', pdf: 'Fake PDF', form: 'Fake Login Form' };

// ── Step progress bar ─────────────────────────────────────────────────────────
function StepBar({ current, total }: { current: number; total: number }) {
  return (
    <View style={sb.wrap}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={[
            sb.seg,
            i < current && sb.segDone,
            i === current && sb.segActive,
          ]}
        />
      ))}
    </View>
  );
}
const sb = StyleSheet.create({
  wrap: { flexDirection: 'row', gap: s(6), paddingHorizontal: s(20), paddingVertical: s(6) },
  seg: { flex: 1, height: s(4), borderRadius: s(2), backgroundColor: '#1e3050' },
  segDone:   { backgroundColor: '#ff446690' },
  segActive: { backgroundColor: '#ff4466' },
});

// ── Option tile ───────────────────────────────────────────────────────────────
function OptionTile({
  option, selected, onPress,
}: {
  option: { id: string; label: string; icon: string; desc: string; color: string };
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[
        ot.tile,
        { borderColor: selected ? option.color : '#1e3050' },
        selected && { backgroundColor: option.color + '18' },
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {selected && <View style={[ot.tileGlow, { backgroundColor: option.color + '12' }]} />}
      <Text style={ot.tileIcon}>{option.icon}</Text>
      <View style={{ flex: 1 }}>
        <Text style={[ot.tileLabel, selected && { color: option.color }]}>{option.label}</Text>
        <Text style={ot.tileDesc}>{option.desc}</Text>
      </View>
      <View style={[ot.check, selected && { borderColor: option.color, backgroundColor: option.color }]}>
        {selected && <Text style={ot.checkMark}>✓</Text>}
      </View>
    </TouchableOpacity>
  );
}
const ot = StyleSheet.create({
  tile: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#0c1525', borderWidth: bw(2),
    borderRadius: s(14), padding: s(10), gap: s(10),
    marginBottom: s(8), position: 'relative', overflow: 'hidden',
  },
  tileGlow: { ...StyleSheet.absoluteFillObject },
  tileIcon:  { fontSize: s(28) },
  tileLabel: { color: '#e8f0ff', fontSize: s(14), fontWeight: 'bold', marginBottom: s(3) },
  tileDesc:  { color: '#5a7aaa', fontSize: s(11), lineHeight: s(16) },
  check: {
    width: s(18), height: s(18), borderRadius: s(9),
    borderWidth: bw(2), borderColor: '#1e3050',
    justifyContent: 'center', alignItems: 'center',
  },
  checkMark: { color: '#fff', fontSize: s(11), fontWeight: 'bold' },
});

// ── Preview panel ─────────────────────────────────────────────────────────────
function PreviewPanel({
  selections,
}: {
  selections: Record<string, string>;
}) {
  const hasAny = Object.values(selections).some(Boolean);
  if (!hasAny) return null;

  return (
    <View style={pp.panel}>
      <Text style={pp.label}>⚡  PAYLOAD PREVIEW</Text>
      <View style={pp.grid}>
        {selections.vector  && <View style={pp.tag}><Text style={pp.tagTxt}>📡 {VECTOR_LABELS[selections.vector]}</Text></View>}
        {selections.persona && <View style={pp.tag}><Text style={pp.tagTxt}>🎭 {PERSONA_LABELS[selections.persona]}</Text></View>}
        {selections.hook    && <View style={pp.tag}><Text style={pp.tagTxt}>🎣 {HOOK_LABELS[selections.hook]}</Text></View>}
        {selections.payload && <View style={pp.tag}><Text style={pp.tagTxt}>💣 {PAYLOAD_LABELS[selections.payload]}</Text></View>}
      </View>
    </View>
  );
}
const pp = StyleSheet.create({
  panel: {
    backgroundColor: '#080e1a',
    borderTopWidth: bw(1), borderTopColor: '#1e3050',
    padding: s(8),
  },
  label: { color: '#ff4466', fontSize: s(9), fontWeight: '900', letterSpacing: 2, marginBottom: s(8) },
  grid:  { flexDirection: 'row', flexWrap: 'wrap', gap: s(6) },
  tag:   { backgroundColor: '#ff446618', borderWidth: bw(1), borderColor: '#ff446640', borderRadius: s(20), paddingHorizontal: s(8), paddingVertical: s(3) },
  tagTxt: { color: '#ff8899', fontSize: s(10) },
});

// ── Confirmation Modal ────────────────────────────────────────────────────────
function ConfirmModal({
  selections, routing, onClose, onDeploy,
}: {
  selections: Record<string, string>;
  routing: string;
  onClose: () => void;
  onDeploy: () => void;
}) {
  const r = ROUTING.find(rt => rt.id === routing)!;
  return (
    <Modal
      visible
      transparent
      animationType="fade"
      supportedOrientations={['portrait', 'landscape', 'landscape-left', 'landscape-right']}
      onRequestClose={() => {}}
    >
      <View style={cm.overlay}>
        <View style={cm.panel}>
          <Text style={cm.title}>⚔️  DEPLOY ATTACK?</Text>
          <Text style={cm.sub}>Review your assembled payload before deploying.</Text>

          <View style={cm.section}>
            <Text style={cm.row}><Text style={cm.key}>Vector   </Text> {VECTOR_LABELS[selections.vector]}</Text>
            <Text style={cm.row}><Text style={cm.key}>Persona  </Text> {PERSONA_LABELS[selections.persona]}</Text>
            <Text style={cm.row}><Text style={cm.key}>Hook     </Text> {HOOK_LABELS[selections.hook]}</Text>
            <Text style={cm.row}><Text style={cm.key}>Payload  </Text> {PAYLOAD_LABELS[selections.payload]}</Text>
          </View>

          <View style={[cm.routingBox, { borderColor: r.color }]}>
            <Text style={cm.routingIcon}>{r.icon}</Text>
            <View>
              <Text style={[cm.routingLabel, { color: r.color }]}>{r.label}</Text>
              <Text style={cm.routingDesc}>{r.desc.split('\n')[0]}</Text>
            </View>
          </View>

          <View style={cm.costRow}>
            <Text style={cm.costLabel}>THREAT POINT COST</Text>
            <Text style={cm.costVal}>-50 TP</Text>
          </View>

          <TouchableOpacity style={cm.deployBtn} onPress={onDeploy}>
            <Text style={cm.deployBtnTxt}>⚔️  CONFIRM DEPLOY</Text>
          </TouchableOpacity>
          <TouchableOpacity style={cm.cancelBtn} onPress={onClose}>
            <Text style={cm.cancelBtnTxt}>✕  CANCEL</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
const cm = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.88)', justifyContent: 'flex-end' },
  panel: {
    backgroundColor: '#080e1a',
    borderTopWidth: bw(2), borderLeftWidth: bw(2), borderRightWidth: bw(2),
    borderColor: '#ff4466',
    borderTopLeftRadius: s(20), borderTopRightRadius: s(20),
    padding: s(20),
  },
  title:  { color: '#ff4466', fontFamily: 'PixelFont', fontSize: s(14), marginBottom: s(4) },
  sub:    { color: '#5a7aaa', fontSize: s(11), marginBottom: s(16) },
  section: {
    backgroundColor: '#0c1525', borderWidth: bw(1), borderColor: '#1e3050',
    borderRadius: s(12), padding: s(14), marginBottom: s(12), gap: s(6),
  },
  row:    { color: '#b0c8f0', fontSize: s(12) },
  key:    { color: '#5a7aaa', fontWeight: 'bold' },
  routingBox: {
    flexDirection: 'row', alignItems: 'center', gap: s(12),
    borderWidth: bw(1.5), borderRadius: s(12),
    padding: s(12), marginBottom: s(16),
  },
  routingIcon:  { fontSize: s(24) },
  routingLabel: { fontSize: s(13), fontWeight: 'bold', marginBottom: s(2) },
  routingDesc:  { color: '#5a7aaa', fontSize: s(11) },
  costRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: s(16),
  },
  costLabel: { color: '#5a7aaa', fontSize: s(10), fontWeight: 'bold', letterSpacing: 1 },
  costVal:   { color: '#ff4466', fontSize: s(18), fontWeight: 'bold' },
  deployBtn: {
    backgroundColor: '#ff4466', borderRadius: s(12),
    paddingVertical: s(14), alignItems: 'center', marginBottom: s(10),
  },
  deployBtnTxt: { color: '#fff', fontFamily: 'PixelFont', fontSize: s(12), letterSpacing: 1 },
  cancelBtn:    { alignItems: 'center', paddingVertical: s(8) },
  cancelBtnTxt: { color: '#3a4a60', fontFamily: 'PixelFont', fontSize: s(9), letterSpacing: 2 },
});

// ── Success Modal ─────────────────────────────────────────────────────────────
function SuccessModal({ routing, onClose }: { routing: string; onClose: () => void }) {
  const r = ROUTING.find(rt => rt.id === routing)!;
  return (
    <Modal
      visible
      transparent
      animationType="fade"
      supportedOrientations={['portrait', 'landscape', 'landscape-left', 'landscape-right']}
      onRequestClose={() => {}}
    >
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.88)', justifyContent: 'center', alignItems: 'center', padding: s(24) }}>
        <View style={{ backgroundColor: '#080e1a', borderWidth: bw(2), borderColor: '#ff4466', borderRadius: s(20), padding: s(24), alignItems: 'center', gap: s(12) }}>
          <Text style={{ fontSize: s(52) }}>⚔️</Text>
          <Text style={{ color: '#ff4466', fontFamily: 'PixelFont', fontSize: s(14), letterSpacing: 2 }}>ATTACK DEPLOYED</Text>
          <Text style={{ color: '#5a7aaa', fontSize: s(12), textAlign: 'center', lineHeight: s(18) }}>
            Your payload has been sent to the{' '}
            <Text style={{ color: r.color }}>{r.label}</Text>.{'\n'}
            50 Threat Points deducted.
          </Text>
          <TouchableOpacity
            style={{ backgroundColor: '#ff4466', borderRadius: s(12), paddingVertical: s(12), paddingHorizontal: s(32), marginTop: s(8) }}
            onPress={onClose}
          >
            <Text style={{ color: '#fff', fontFamily: 'PixelFont', fontSize: s(10), letterSpacing: 1 }}>BACK TO HUB</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────
export default function PayloadForgeScreen({ navigation }: any) {
  const [step, setStep]           = useState(0);          // 0–3 = option steps, 4 = routing
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [routing, setRouting]     = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const currentStepData = step < 4 ? STEPS[step] : null;
  const currentKey = currentStepData?.id ?? '';
  const isStepComplete = step < 4 ? !!selections[currentKey] : !!routing;
  const totalSteps = 5; // 4 options + 1 routing

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
    else setShowConfirm(true);
  };
  const handleBack = () => {
    if (step > 0) setStep(step - 1);
    else navigation.goBack();
  };
  const handleDeploy = () => {
    setShowConfirm(false);
    setShowSuccess(true);
  };
  const handleSuccessClose = () => {
    setShowSuccess(false);
    navigation.navigate('PvPHub');
  };

  return (
    <SafeAreaView style={pf.safe}>
      <StatusBar barStyle="light-content" />

      {/* ── HEADER ── */}
      <View style={pf.header}>
        <TouchableOpacity style={pf.backBtn} onPress={handleBack}>
          <Text style={pf.backBtnTxt}>←</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={pf.headerTitle}>PAYLOAD FORGE</Text>
          <Text style={pf.headerSub}>Step {Math.min(step + 1, totalSteps)} of {totalSteps}</Text>
        </View>
        <View style={pf.tpBadge}>
          <Text style={pf.tpTxt}>💀 2,150 TP</Text>
        </View>
      </View>

      {/* ── PROGRESS ── */}
      <StepBar current={step} total={totalSteps} />

      {/* ── BODY ── */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: s(16) }} showsVerticalScrollIndicator={false}>

        {/* Step title */}
        <View style={pf.stepTitle}>
          <Text style={pf.stepIcon}>{step < 4 ? STEPS[step].icon : '📡'}</Text>
          <View>
            <Text style={pf.stepLabel}>
              {step < 4 ? STEPS[step].label : 'DEPLOYMENT ROUTING'}
            </Text>
            <Text style={pf.stepSub}>
              {step < 4 ? STEPS[step].subtitle : 'Where will the payload be routed?'}
            </Text>
          </View>
        </View>

        {/* Options */}
        {step < 4 && STEPS[step].options.map((opt) => (
          <OptionTile
            key={opt.id}
            option={opt}
            selected={selections[currentKey] === opt.id}
            onPress={() => setSelections({ ...selections, [currentKey]: opt.id })}
          />
        ))}

        {/* Routing step */}
        {step === 4 && ROUTING.map((rt) => (
          <TouchableOpacity
            key={rt.id}
            style={[
              pf.routeTile,
              { borderColor: routing === rt.id ? rt.color : '#1e3050' },
              routing === rt.id && { backgroundColor: rt.color + '18' },
            ]}
            onPress={() => setRouting(rt.id)}
            activeOpacity={0.8}
          >
            <Text style={pf.routeIcon}>{rt.icon}</Text>
            <View style={{ flex: 1 }}>
              <Text style={[pf.routeLabel, routing === rt.id && { color: rt.color }]}>{rt.label}</Text>
              <Text style={pf.routeDesc}>{rt.desc}</Text>
            </View>
            <View style={[pf.routeCheck, routing === rt.id && { borderColor: rt.color, backgroundColor: rt.color }]}>
              {routing === rt.id && <Text style={{ color: '#fff', fontSize: s(11), fontWeight: 'bold' }}>✓</Text>}
            </View>
          </TouchableOpacity>
        ))}

        <View style={{ height: s(20) }} />
      </ScrollView>

      {/* ── PAYLOAD PREVIEW ── */}
      <PreviewPanel selections={selections} />

      {/* ── FOOTER NAV ── */}
      <View style={pf.footer}>
        <TouchableOpacity style={pf.backFooterBtn} onPress={handleBack}>
          <Text style={pf.backFooterTxt}>← BACK</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[pf.nextBtn, !isStepComplete && pf.nextBtnDisabled]}
          onPress={handleNext}
          disabled={!isStepComplete}
        >
          <Text style={pf.nextBtnTxt}>
            {step < 4 ? 'NEXT →' : '⚔️  REVIEW & DEPLOY'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── MODALS ── */}
      {showConfirm && (
        <ConfirmModal
          selections={selections}
          routing={routing}
          onClose={() => setShowConfirm(false)}
          onDeploy={handleDeploy}
        />
      )}
      {showSuccess && (
        <SuccessModal routing={routing} onClose={handleSuccessClose} />
      )}
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const pf = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#080e1a' },

  header: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(5,12,24,0.95)',
    borderTopWidth: bw(1), borderBottomWidth: bw(1), borderColor: '#ff4466',
    paddingHorizontal: s(16), paddingVertical: s(6), gap: s(10),
  },
  backBtn: {
    width: s(38), height: s(38), borderRadius: s(19),
    borderWidth: bw(2), borderColor: '#ff4466',
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(10,15,25,0.9)',
  },
  backBtnTxt: { color: '#fff', fontSize: s(16) },
  headerTitle: { color: '#fff', fontFamily: 'PixelFont', fontSize: s(10), letterSpacing: 2 },
  headerSub:   { color: '#ff4466', fontSize: s(9), marginTop: s(2) },
  tpBadge: {
    backgroundColor: '#ff446618', borderWidth: bw(1), borderColor: '#ff446660',
    borderRadius: s(20), paddingHorizontal: s(10), paddingVertical: s(5),
  },
  tpTxt: { color: '#ff4466', fontSize: s(10), fontWeight: 'bold' },

  stepTitle: {
    flexDirection: 'row', alignItems: 'center',
    gap: s(12), marginBottom: s(12),
  },
  stepIcon:  { fontSize: s(32) },
  stepLabel: { color: '#ff4466', fontSize: s(11), fontWeight: '900', letterSpacing: 2, marginBottom: s(4) },
  stepSub:   { color: '#5a7aaa', fontSize: s(12) },

  routeTile: {
    flexDirection: 'row', alignItems: 'flex-start',
    backgroundColor: '#0c1525', borderWidth: bw(2),
    borderRadius: s(14), padding: s(12), gap: s(12),
    marginBottom: s(8),
  },
  routeIcon:  { fontSize: s(28), marginTop: s(2) },
  routeLabel: { color: '#e8f0ff', fontSize: s(14), fontWeight: 'bold', marginBottom: s(4) },
  routeDesc:  { color: '#5a7aaa', fontSize: s(11), lineHeight: s(18) },
  routeCheck: {
    width: s(22), height: s(22), borderRadius: s(11),
    borderWidth: bw(2), borderColor: '#1e3050',
    justifyContent: 'center', alignItems: 'center', marginTop: s(2),
  },

  footer: {
    flexDirection: 'row', gap: s(12),
    padding: s(10), borderTopWidth: bw(1), borderTopColor: '#1e3050',
    backgroundColor: '#0c1525',
  },
  backFooterBtn: {
    flex: 1, borderWidth: bw(1.5), borderColor: '#1e3050',
    borderRadius: s(12), paddingVertical: s(10), alignItems: 'center',
  },
  backFooterTxt: { color: '#5a7aaa', fontWeight: 'bold', fontSize: s(12) },
  nextBtn: {
    flex: 2, backgroundColor: '#ff4466', borderRadius: s(12),
    paddingVertical: s(10), alignItems: 'center',
    shadowColor: '#ff4466', shadowOpacity: 0.6, shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 }, elevation: 8,
  },
  nextBtnDisabled: { backgroundColor: '#1e3050', shadowOpacity: 0 },
  nextBtnTxt: { color: '#fff', fontFamily: 'PixelFont', fontSize: s(10), letterSpacing: 1 },
});
