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
import { MODULES } from './LessonsScreen';

// ── Scaling ──────────────────────────────────────────────────────────────────
const { width: SW, height: SH } = Dimensions.get('window');
const PW = Math.min(SW, SH);
const PH = Math.max(SW, SH);
const scaleP = Math.min(PW / 390, PH / 844, 1.0);
const s  = (n: number) => Math.round(PixelRatio.roundToNearestPixel(n * scaleP));
const bw = (n: number) => Math.max(1, s(n));

// ── Lesson Data per Module ───────────────────────────────────────────────────
interface Lesson {
  id: number;
  title: string;
  duration: string;
  content: string[];
  simulation: {
    title: string;
    description: string;
    task: string;
    hint: string;
  };
  completed: boolean;
}

const MODULE_LESSONS: Record<number, Lesson[]> = {
  1: [
    {
      id: 1,
      title: 'What Is a Phishing Email?',
      duration: '5 min',
      content: [
        'Phishing is a cyber-attack that uses disguised email as a weapon. The goal is to trick the email recipient into believing that the message is something they want — a request from their bank, a note from their boss — and to click a link or download an attachment.',
        'Key indicators of phishing emails include:\n• Urgent or threatening language\n• Mismatched sender email addresses\n• Suspicious links (hover to reveal the real URL)\n• Unexpected attachments\n• Generic greetings like "Dear Customer"',
        'Phishing attacks account for over 80% of reported security incidents. Understanding how to identify them is the first line of defense for any organization.',
      ],
      simulation: {
        title: 'Phishing Inbox Simulation',
        description: 'You have received 5 emails in your inbox. Identify which ones are phishing attempts.',
        task: 'Carefully examine each email\'s sender, subject line, links, and content. Flag all phishing emails before clicking "Submit".',
        hint: 'Look for mismatched domains — e.g. support@paypa1.com vs paypal.com',
      },
      completed: true,
    },
    {
      id: 2,
      title: 'Spoofed Sender Addresses',
      duration: '6 min',
      content: [
        'Email spoofing is the creation of emails with a forged sender address. The core issue is that SMTP — the protocol for sending email — has no built-in authentication. Attackers exploit this to make emails appear to come from trusted sources.',
        'There are two levels of spoofing:\n• Display Name Spoofing: The name shown is fake but the actual address is from an unknown domain.\n• Domain Spoofing: The attacker sends from a look-alike domain (e.g., micros0ft.com or microsoft-support.net).',
        'Modern defenses like SPF, DKIM, and DMARC have made spoofing harder — but many organizations still haven\'t implemented them, leaving their users vulnerable.',
      ],
      simulation: {
        title: 'Sender Verification Lab',
        description: 'Examine the raw email headers of 3 suspicious messages to determine if they are spoofed.',
        task: 'Open each email\'s header panel and check whether the "From" domain matches the "Return-Path" and "DKIM-Signature" domains.',
        hint: 'A mismatch between the visible sender and the Return-Path header is a strong spoofing indicator.',
      },
      completed: true,
    },
    {
      id: 3,
      title: 'Malicious Links & Attachments',
      duration: '7 min',
      content: [
        'Links in phishing emails are designed to look legitimate. Common techniques include:\n• URL shorteners to hide the real destination\n• Subdomain tricks: paypal.com.attacker.net (the real domain is attacker.net)\n• Homograph attacks using Unicode characters that look like Latin letters',
        'Malicious attachments often arrive as:\n• Office documents with hidden macros\n• PDF files with embedded scripts\n• Compressed archives containing executable files\n• .html files that redirect to phishing pages',
        'The golden rule: never open unexpected attachments or click links in unsolicited emails. When in doubt, navigate directly to the website by typing the URL.',
      ],
      simulation: {
        title: 'URL Analysis Terminal',
        description: 'You have a list of URLs extracted from flagged emails. Classify each as Safe or Malicious.',
        task: 'Analyze the domain, path, and parameters of each URL. Use the provided WHOIS lookup tool to check registration dates and ownership.',
        hint: 'Newly registered domains (< 30 days old) combined with financial keywords are extremely suspicious.',
      },
      completed: true,
    },
    {
      id: 4,
      title: 'Spear Phishing & Whaling',
      duration: '8 min',
      content: [
        'Spear phishing is a targeted phishing attack aimed at a specific individual or organization. Unlike bulk phishing, the attacker does prior research to craft a convincing, personalized message.',
        'Whaling is spear phishing aimed at senior executives — CEOs, CFOs, board members. A successful whaling attack can result in wire fraud worth millions.',
        'Business Email Compromise (BEC) is a form of whaling where the attacker either compromises a real executive email account or spoofs it, then requests urgent fund transfers or W-2 data from finance teams.',
        'Defense: Establish verbal or out-of-band verification protocols for any financial requests received via email, regardless of the sender.',
      ],
      simulation: {
        title: 'Executive Email Crisis',
        description: 'You are the CFO\'s assistant. Three urgent emails arrive from the "CEO" while he is overseas.',
        task: 'Determine which emails are legitimate by checking headers, verifying the request via a phone call, and cross-referencing the CEO\'s known travel schedule.',
        hint: 'Real executives rarely request urgent wire transfers exclusively via email with no prior discussion.',
      },
      completed: true,
    },
    {
      id: 5,
      title: 'Reporting & Response Protocol',
      duration: '5 min',
      content: [
        'When you suspect a phishing email, follow the R-A-R protocol:\n• Report: Forward the email to your security team or use the "Report Phishing" button in your email client.\n• Avoid: Do not click any links, download attachments, or reply to the sender.\n• Reset: If you accidentally clicked a link, immediately change your passwords and notify IT.',
        'Organizations should maintain an incident response playbook specifically for phishing. Key elements include:\n• Designated reporting channels\n• Automated quarantine procedures\n• User notification templates\n• Post-incident awareness reminders',
        'Phishing simulation training — where IT sends fake phishing emails to employees — has been shown to reduce click rates by up to 75% within one year.',
      ],
      simulation: {
        title: 'Incident Response Drill',
        description: 'A colleague has clicked a phishing link and is panicking. Walk through the proper response steps.',
        task: 'Complete all 7 response steps in the correct order using the incident response checklist provided. Time is critical — you have 5 minutes.',
        hint: 'Isolate the affected machine from the network FIRST before any other action.',
      },
      completed: false,
    },
  ],
  2: [
    { id: 1, title: 'What Is Pretexting?',               duration: '5 min', content: ['Pretexting is the practice of creating a fabricated scenario (the "pretext") to extract information or gain trust...'], simulation: { title: 'Call Center Sim', description: 'A caller claims to be IT support.', task: 'Identify whether the caller is legitimate.', hint: 'Ask for their employee ID.' }, completed: true },
    { id: 2, title: 'Common Pretext Scenarios',          duration: '6 min', content: ['Common pretexts include impersonating IT staff, delivery personnel, auditors...'], simulation: { title: 'Scenario Identification', description: 'Match each pretext to its category.', task: 'Sort 8 scenarios into their correct pretext type.', hint: 'Focus on the goal, not the method.' }, completed: true },
    { id: 3, title: 'Building Rapport Manipulation',     duration: '7 min', content: ['Attackers build rapport before making their request...'], simulation: { title: 'Conversation Analysis', description: 'Read a transcript and spot manipulation cues.', task: 'Highlight 5 rapport-building tactics.', hint: 'Watch for flattery and urgency.' }, completed: false },
    { id: 4, title: 'Authority & Urgency Exploitation',  duration: '6 min', content: ['Two of the most powerful psychological levers are authority and urgency...'], simulation: { title: 'Pressure Scenario', description: 'A "manager" demands immediate action.', task: 'Choose the correct verification steps.', hint: 'Never skip verification under time pressure.' }, completed: false },
    { id: 5, title: 'Defending Against Pretexting',      duration: '5 min', content: ['Verification procedures, call-back policies, and clear escalation paths...'], simulation: { title: 'Policy Drill', description: 'Apply company policy to 5 different requests.', task: 'Approve, deny, or escalate each request.', hint: 'When in doubt, escalate.' }, completed: false },
  ],
  3: [
    { id: 1, title: 'Introduction to Smishing',          duration: '4 min', content: ['SMS phishing — or smishing — uses text messages to deceive victims...'], simulation: { title: 'SMS Inbox Review', description: 'Review 6 text messages.', task: 'Flag all smishing attempts.', hint: 'Check sender numbers and links.' }, completed: true },
    { id: 2, title: 'Vishing Techniques',                duration: '5 min', content: ['Vishing (voice phishing) uses phone calls to extract information...'], simulation: { title: 'Audio Call Analysis', description: 'Listen to 3 recorded calls.', task: 'Identify the vishing attempt.', hint: 'Legitimate orgs rarely ask for PINs over phone.' }, completed: false },
    { id: 3, title: 'SIM Swapping Attacks',              duration: '6 min', content: ['SIM swapping allows attackers to take over a phone number...'], simulation: { title: 'Telecom Escalation', description: 'A support call mimics a SIM swap.', task: 'Spot the red flags and refuse the swap.', hint: 'Verify identity through secondary channel.' }, completed: false },
    { id: 4, title: 'Two-Factor Authentication Bypass',  duration: '7 min', content: ['Attackers often combine smishing with 2FA code theft...'], simulation: { title: '2FA Intercept Sim', description: 'You receive an unexpected 2FA code.', task: 'Determine if this is an attack and respond.', hint: 'You should only get a 2FA code when YOU initiated a login.' }, completed: false },
    { id: 5, title: 'Mobile Device Security Hygiene',    duration: '5 min', content: ['Best practices for securing your mobile device against smishing and vishing...'], simulation: { title: 'Device Audit', description: 'Audit a simulated phone\'s security settings.', task: 'Find and fix all 6 security misconfigurations.', hint: 'Check permissions, updates, and backup settings.' }, completed: false },
  ],
  4: [
    { id: 1, title: 'Physical Security Basics',          duration: '5 min', content: ['Physical security is often the most overlooked attack vector...'], simulation: { title: 'Facility Walkthrough', description: 'Spot physical security weaknesses.', task: 'Identify 8 vulnerabilities in the floor plan.', hint: 'Think like an attacker looking for easy entry.' }, completed: false },
    { id: 2, title: 'Tailgating & Piggybacking',         duration: '6 min', content: ['Tailgating involves following an authorized person through a secured door...'], simulation: { title: 'Door Control Sim', description: 'Monitor a badge-access door.', task: 'Identify and stop tailgating attempts.', hint: 'One badge swipe = one person only.' }, completed: false },
    { id: 3, title: 'Baiting Attacks',                   duration: '5 min', content: ['Baiting leaves physical media (USB drives) for victims to find and plug in...'], simulation: { title: 'USB Temptation', description: 'You find a USB drive in the parking lot.', task: 'Follow correct procedure for found media.', hint: 'Never plug in unknown USB devices.' }, completed: false },
    { id: 4, title: 'Dumpster Diving & Document Security', duration: '6 min', content: ['Sensitive documents in trash are a goldmine for attackers...'], simulation: { title: 'Document Recovery', description: 'Sort documents by sensitivity level.', task: 'Determine the correct disposal method for each.', hint: 'Shred anything with names, numbers, or company data.' }, completed: false },
    { id: 5, title: 'Visitor & Vendor Management',       duration: '7 min', content: ['Attackers can pose as vendors, contractors, or visitors...'], simulation: { title: 'Visitor Verification', description: 'Process 5 walk-in visitors.', task: 'Apply correct verification procedures to each.', hint: 'Always verify appointments and escort visitors.' }, completed: false },
  ],
  5: [
    { id: 1, title: 'Introduction to OSINT',             duration: '5 min', content: ['Open-Source Intelligence (OSINT) is the collection of data from publicly available sources...'], simulation: { title: 'Public Profile Analysis', description: 'Analyze a LinkedIn profile for exposed data.', task: 'List all pieces of information an attacker could exploit.', hint: 'Job titles, projects, and connections are valuable.' }, completed: false },
    { id: 2, title: 'Social Media Reconnaissance',       duration: '6 min', content: ['Social media is one of the richest sources of personal and organizational data...'], simulation: { title: 'Social Media OSINT', description: 'Conduct OSINT on a fictional target using social media.', task: 'Build a profile with 10 data points in 10 minutes.', hint: 'Cross-reference multiple platforms.' }, completed: false },
    { id: 3, title: 'Google Dorking',                    duration: '7 min', content: ['Google dorking uses advanced search operators to find exposed sensitive data...'], simulation: { title: 'Search Operator Lab', description: 'Use dorking operators to find exposed files.', task: 'Find 5 types of exposed data using provided operators.', hint: 'Try: site:, filetype:, inurl:, intitle:' }, completed: false },
    { id: 4, title: 'WHOIS & DNS Enumeration',           duration: '6 min', content: ['Domain registration data and DNS records reveal a lot about an organization...'], simulation: { title: 'DNS Investigation', description: 'Investigate a target domain\'s DNS records.', task: 'Extract mail servers, subdomains, and registration details.', hint: 'nslookup and WHOIS are your primary tools.' }, completed: false },
    { id: 5, title: 'Protecting Your Digital Footprint', duration: '5 min', content: ['Reducing your OSINT exposure requires deliberate privacy hygiene...'], simulation: { title: 'Footprint Reduction', description: 'Audit your own digital footprint.', task: 'Find and remove 6 pieces of sensitive public information.', hint: 'Check data broker sites and social media privacy settings.' }, completed: false },
  ],
};

// ── Simulation Modal ──────────────────────────────────────────────────────────
function SimulationModal({
  lesson,
  accentColor,
  onClose,
  onComplete,
}: {
  lesson: Lesson;
  accentColor: string;
  onClose: () => void;
  onComplete: () => void;
}) {
  const [phase, setPhase] = useState<'brief' | 'task' | 'done'>('brief');

  return (
    <Modal transparent animationType="slide" onRequestClose={onClose}>
      <View style={sm.overlay}>
        <View style={[sm.panel, { borderColor: accentColor }]}>

          {/* Header */}
          <View style={sm.panelHeader}>
            <Text style={[sm.panelHeaderTxt, { color: accentColor }]}>
              {phase === 'done' ? '✅  SIMULATION COMPLETE' : `⚡  ${lesson.simulation.title.toUpperCase()}`}
            </Text>
            <TouchableOpacity onPress={onClose} style={sm.closeBtn}>
              <Text style={sm.closeBtnTxt}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {phase === 'brief' && (
              <>
                <View style={sm.termBox}>
                  <Text style={sm.termLabel}>// MISSION BRIEF</Text>
                  <Text style={sm.termTxt}>{lesson.simulation.description}</Text>
                </View>
                <View style={[sm.termBox, { borderColor: '#ffcf5c55', marginTop: s(12) }]}>
                  <Text style={[sm.termLabel, { color: '#ffcf5c' }]}>// OBJECTIVE</Text>
                  <Text style={sm.termTxt}>{lesson.simulation.task}</Text>
                </View>
                <View style={[sm.termBox, { borderColor: '#5a7aaa55', marginTop: s(12) }]}>
                  <Text style={[sm.termLabel, { color: '#5a7aaa' }]}>// HINT</Text>
                  <Text style={sm.termTxt}>{lesson.simulation.hint}</Text>
                </View>
                <TouchableOpacity
                  style={[sm.actionBtn, { borderColor: accentColor, backgroundColor: accentColor + '22' }]}
                  onPress={() => setPhase('task')}
                >
                  <Text style={[sm.actionBtnTxt, { color: accentColor }]}>▶  BEGIN SIMULATION</Text>
                </TouchableOpacity>
              </>
            )}

            {phase === 'task' && (
              <>
                <View style={sm.vmBox}>
                  <View style={sm.vmTitleBar}>
                    <View style={sm.vmDot} /><View style={sm.vmDot} /><View style={sm.vmDot} />
                    <Text style={sm.vmTitle}>Virtual Machine — Level Blue OS</Text>
                  </View>
                  <Text style={sm.vmContent}>
                    {'> Simulation environment loaded...\n> Assets ready.\n> Your task is displayed above.\n\n[This is a placeholder for the interactive\nsimulation widget that will be\nintegrated in the next sprint.]\n\n> Complete the task and press SUBMIT.'}
                  </Text>
                </View>
                <TouchableOpacity
                  style={[sm.actionBtn, { borderColor: '#3fbf7f', backgroundColor: '#3fbf7f22', marginTop: s(16) }]}
                  onPress={() => setPhase('done')}
                >
                  <Text style={[sm.actionBtnTxt, { color: '#3fbf7f' }]}>✓  SUBMIT ANSWERS</Text>
                </TouchableOpacity>
              </>
            )}

            {phase === 'done' && (
              <>
                <View style={sm.doneBox}>
                  <Text style={sm.doneEmoji}>🏆</Text>
                  <Text style={sm.doneTxt}>Simulation Passed!</Text>
                  <Text style={sm.doneSub}>You have demonstrated the required skill for this lesson.</Text>
                  <Text style={[sm.doneXP, { color: accentColor }]}>+80 XP</Text>
                </View>
                <TouchableOpacity
                  style={[sm.actionBtn, { borderColor: accentColor, backgroundColor: accentColor + '22' }]}
                  onPress={() => { onComplete(); onClose(); }}
                >
                  <Text style={[sm.actionBtnTxt, { color: accentColor }]}>▶  CONTINUE TO NEXT LESSON</Text>
                </TouchableOpacity>
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const sm = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'flex-end',
  },
  panel: {
    backgroundColor: '#080e1a',
    borderTopWidth: bw(2),
    borderLeftWidth: bw(2),
    borderRightWidth: bw(2),
    borderTopLeftRadius: s(20),
    borderTopRightRadius: s(20),
    padding: s(20),
    maxHeight: '85%',
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: s(16),
  },
  panelHeaderTxt: { fontSize: s(12), fontWeight: 'bold', letterSpacing: 1 },
  closeBtn: {
    width: s(28),
    height: s(28),
    borderRadius: s(14),
    backgroundColor: '#1e3050',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnTxt: { color: '#fff', fontSize: s(12) },

  termBox: {
    backgroundColor: '#080e1a',
    borderWidth: bw(1),
    borderColor: 'rgba(90,200,255,0.3)',
    borderRadius: s(10),
    padding: s(14),
  },
  termLabel: { color: '#5ac8ff', fontSize: s(10), fontWeight: 'bold', marginBottom: s(8), letterSpacing: 1 },
  termTxt:   { color: '#b0c8f0', fontSize: s(13), lineHeight: s(20) },

  vmBox: {
    backgroundColor: '#030609',
    borderRadius: s(10),
    overflow: 'hidden',
    borderWidth: bw(1),
    borderColor: '#1e3050',
  },
  vmTitleBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111e30',
    paddingHorizontal: s(12),
    paddingVertical: s(8),
    gap: s(6),
  },
  vmDot:   { width: s(8), height: s(8), borderRadius: s(4), backgroundColor: '#ff6363' },
  vmTitle: { color: '#5a7aaa', fontSize: s(10), marginLeft: s(8) },
  vmContent: {
    color: '#3fbf7f',
    fontSize: s(11),
    fontFamily: 'monospace',
    padding: s(14),
    lineHeight: s(18),
  },

  actionBtn: {
    borderWidth: bw(1.5),
    borderRadius: s(12),
    paddingVertical: s(14),
    alignItems: 'center',
    marginTop: s(12),
  },
  actionBtnTxt: { fontSize: s(13), fontWeight: 'bold', letterSpacing: 1 },

  doneBox: { alignItems: 'center', paddingVertical: s(24), gap: s(8) },
  doneEmoji: { fontSize: s(48) },
  doneTxt:   { color: '#fff', fontSize: s(20), fontWeight: 'bold' },
  doneSub:   { color: '#5a7aaa', fontSize: s(12), textAlign: 'center' },
  doneXP:    { fontSize: s(22), fontWeight: 'bold', marginTop: s(4) },
});

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function ModuleDetailScreen({ route, navigation }: any) {
  const moduleId: number = route?.params?.moduleId ?? 1;
  const module = MODULES.find(m => m.id === moduleId) ?? MODULES[0];
  const lessons = MODULE_LESSONS[moduleId] ?? MODULE_LESSONS[1];

  const [selectedLesson, setSelectedLesson] = useState<Lesson>(lessons[0]);
  const [simOpen, setSimOpen] = useState(false);
  const [completedIds, setCompletedIds] = useState<number[]>(
    lessons.filter(l => l.completed).map(l => l.id)
  );

  const isUnlocked = (lesson: Lesson) => {
    if (lesson.id === 1) return true;
    return completedIds.includes(lesson.id - 1);
  };

  const markComplete = (lessonId: number) => {
    setCompletedIds(prev => prev.includes(lessonId) ? prev : [...prev, lessonId]);
  };

  const { accentColor } = module;

  return (
    <SafeAreaView style={ds.safe}>
      <StatusBar barStyle="light-content" />

      {/* ── Header ── */}
      <View style={[ds.header, { borderBottomColor: accentColor + '80' }]}>
        <TouchableOpacity style={[ds.backBtn, { borderColor: accentColor }]} onPress={() => navigation.goBack()}>
          <Text style={ds.backBtnTxt}>←</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[ds.headerMod, { color: accentColor }]}>MODULE {module.id}</Text>
          <Text style={ds.headerTitle} numberOfLines={1}>{module.title}</Text>
        </View>
        <Text style={ds.moduleIcon}>{module.icon}</Text>
      </View>

      {/* ── Body: sidebar + content ── */}
      <View style={ds.body}>

        {/* Left Sidebar — Lesson List */}
        <View style={ds.sidebar}>
          <Text style={ds.sidebarLabel}>LESSONS</Text>
          <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
            {lessons.map((lesson) => {
              const unlocked = isUnlocked(lesson);
              const done = completedIds.includes(lesson.id);
              const active = selectedLesson.id === lesson.id;

              return (
                <TouchableOpacity
                  key={lesson.id}
                  style={[
                    ds.lessonItem,
                    active && [ds.lessonItemActive, { borderColor: accentColor, backgroundColor: accentColor + '18' }],
                    !unlocked && ds.lessonItemLocked,
                  ]}
                  onPress={() => unlocked && setSelectedLesson(lesson)}
                  disabled={!unlocked}
                  activeOpacity={unlocked ? 0.8 : 1}
                >
                  {/* Number bubble */}
                  <View style={[
                    ds.lessonNum,
                    done && { borderColor: '#3fbf7f', backgroundColor: '#0a2018' },
                    active && !done && { borderColor: accentColor, backgroundColor: accentColor + '22' },
                    !unlocked && { borderColor: '#1e3050', backgroundColor: '#080e1a' },
                  ]}>
                    <Text style={[
                      ds.lessonNumTxt,
                      done && { color: '#3fbf7f' },
                      active && !done && { color: accentColor },
                      !unlocked && { color: '#2a3a50' },
                    ]}>
                      {done ? '✓' : unlocked ? lesson.id : '🔒'}
                    </Text>
                  </View>

                  {/* Title */}
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        ds.lessonTitle,
                        active && { color: '#fff' },
                        !unlocked && { color: '#2a3a50' },
                        done && { color: '#3fbf7f' },
                      ]}
                      numberOfLines={2}
                    >
                      {lesson.title}
                    </Text>
                    <Text style={[ds.lessonDur, !unlocked && { color: '#1a2a3a' }]}>
                      {unlocked ? lesson.duration : 'Locked'}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Right Content Panel */}
        <ScrollView style={ds.content} showsVerticalScrollIndicator={false}>

          {/* Lesson title area */}
          <View style={[ds.contentHeader, { borderBottomColor: accentColor + '40' }]}>
            <View style={[ds.lessonBadge, { borderColor: accentColor, backgroundColor: accentColor + '18' }]}>
              <Text style={[ds.lessonBadgeTxt, { color: accentColor }]}>LESSON {selectedLesson.id}</Text>
            </View>
            <Text style={ds.contentTitle}>{selectedLesson.title}</Text>
            <Text style={ds.contentDur}>📖 {selectedLesson.duration} read</Text>
          </View>

          {/* Lesson text */}
          {selectedLesson.content.map((para, i) => (
            <Text key={i} style={ds.paragraph}>{para}</Text>
          ))}

          {/* Simulation Section */}
          <View style={[ds.simSection, { borderColor: accentColor + '60' }]}>
            <View style={ds.simHeader}>
              <Text style={ds.simIcon}>⚡</Text>
              <View>
                <Text style={[ds.simLabel, { color: accentColor }]}>SIMULATION REQUIRED</Text>
                <Text style={ds.simTitle}>{selectedLesson.simulation.title}</Text>
              </View>
            </View>
            <Text style={ds.simDesc}>{selectedLesson.simulation.description}</Text>
            <TouchableOpacity
              style={[ds.simBtn, { borderColor: accentColor, backgroundColor: accentColor + '22' }]}
              onPress={() => setSimOpen(true)}
            >
              <Text style={[ds.simBtnTxt, { color: accentColor }]}>
                {completedIds.includes(selectedLesson.id) ? '✓  REPLAY SIMULATION' : '▶  START SIMULATION'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Completion status */}
          {completedIds.includes(selectedLesson.id) ? (
            <View style={ds.completeBanner}>
              <Text style={ds.completeBannerTxt}>✅  Lesson Complete — next lesson unlocked!</Text>
            </View>
          ) : null}

          <View style={{ height: s(32) }} />
        </ScrollView>
      </View>

      {/* Simulation Modal */}
      {simOpen && (
        <SimulationModal
          lesson={selectedLesson}
          accentColor={accentColor}
          onClose={() => setSimOpen(false)}
          onComplete={() => {
            markComplete(selectedLesson.id);
            // Auto-advance to next lesson
            const nextLesson = lessons.find(l => l.id === selectedLesson.id + 1);
            if (nextLesson) setSelectedLesson(nextLesson);
          }}
        />
      )}
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const ds = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#080e1a',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: s(16),
    paddingVertical: s(12),
    borderBottomWidth: bw(2),
    backgroundColor: '#0c1525',
    gap: s(12),
  },
  backBtn: {
    width: s(36),
    height: s(36),
    borderRadius: s(18),
    borderWidth: bw(2),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(10,15,25,0.9)',
  },
  backBtnTxt:   { color: '#fff', fontSize: s(16) },
  headerMod:    { fontSize: s(9),  fontWeight: '900', letterSpacing: 2, marginBottom: s(1) },
  headerTitle:  { color: '#fff',   fontSize: s(13),  fontWeight: 'bold' },
  moduleIcon:   { fontSize: s(28) },

  // Body layout
  body: {
    flex: 1,
    flexDirection: 'row',
  },

  // Sidebar
  sidebar: {
    width: s(120),
    backgroundColor: '#0c1525',
    borderRightWidth: bw(1),
    borderRightColor: '#1e3050',
    paddingTop: s(10),
  },
  sidebarLabel: {
    color: '#3fbf7f',
    fontSize: s(9),
    fontWeight: '900',
    letterSpacing: 2,
    paddingHorizontal: s(10),
    marginBottom: s(6),
  },
  lessonItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: s(10),
    gap: s(8),
    borderLeftWidth: bw(3),
    borderLeftColor: 'transparent',
    borderBottomWidth: bw(1),
    borderBottomColor: '#0f1e35',
  },
  lessonItemActive: {
    borderLeftWidth: bw(3),
  },
  lessonItemLocked: {
    opacity: 0.5,
  },
  lessonNum: {
    width: s(26),
    height: s(26),
    borderRadius: s(13),
    borderWidth: bw(1.5),
    borderColor: '#1e3050',
    backgroundColor: '#080e1a',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  lessonNumTxt: {
    color: '#5a7aaa',
    fontSize: s(10),
    fontWeight: 'bold',
  },
  lessonTitle: {
    color: '#8a9bc0',
    fontSize: s(11),
    lineHeight: s(14),
  },
  lessonDur: {
    color: '#3a4a60',
    fontSize: s(9),
    marginTop: s(2),
  },

  // Content area
  content: {
    flex: 1,
    paddingHorizontal: s(16),
  },
  contentHeader: {
    paddingVertical: s(16),
    borderBottomWidth: bw(1),
    marginBottom: s(16),
  },
  lessonBadge: {
    alignSelf: 'flex-start',
    borderWidth: bw(1),
    borderRadius: s(20),
    paddingHorizontal: s(10),
    paddingVertical: s(3),
    marginBottom: s(8),
  },
  lessonBadgeTxt: { fontSize: s(9), fontWeight: '900', letterSpacing: 2 },
  contentTitle:   { color: '#fff', fontSize: s(17), fontWeight: 'bold', marginBottom: s(4) },
  contentDur:     { color: '#5a7aaa', fontSize: s(11) },

  paragraph: {
    color: '#b0c8f0',
    fontSize: s(13),
    lineHeight: s(21),
    marginBottom: s(14),
  },

  // Simulation section
  simSection: {
    backgroundColor: '#0c1525',
    borderWidth: bw(1.5),
    borderRadius: s(14),
    padding: s(14),
    marginTop: s(8),
    marginBottom: s(12),
  },
  simHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(10),
    marginBottom: s(10),
  },
  simIcon:   { fontSize: s(22) },
  simLabel:  { fontSize: s(9), fontWeight: '900', letterSpacing: 2, marginBottom: s(2) },
  simTitle:  { color: '#fff', fontSize: s(13), fontWeight: 'bold' },
  simDesc:   { color: '#5a7aaa', fontSize: s(12), lineHeight: s(18), marginBottom: s(12) },
  simBtn: {
    borderWidth: bw(1.5),
    borderRadius: s(10),
    paddingVertical: s(12),
    alignItems: 'center',
  },
  simBtnTxt: { fontSize: s(12), fontWeight: 'bold', letterSpacing: 1 },

  completeBanner: {
    backgroundColor: '#0a2018',
    borderWidth: bw(1),
    borderColor: '#3fbf7f55',
    borderRadius: s(10),
    padding: s(12),
    alignItems: 'center',
    marginTop: s(4),
  },
  completeBannerTxt: { color: '#3fbf7f', fontSize: s(12), fontWeight: 'bold' },
});
