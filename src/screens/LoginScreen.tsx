import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
  Modal,
  TouchableOpacity
} from 'react-native';

// Assuming you have these in your project
import { DEMO_STUDENT } from './data';
import { LevelBlueButton } from './LevelBlueButton';

type Props = {
  onLogin: () => void;
};

export function LoginScreen({ onLogin }: Props) {
  const [email, setEmail] = useState(DEMO_STUDENT.email);
  const [password, setPassword] = useState(DEMO_STUDENT.password);
  const [error, setError] = useState('');

  // === MFA States ===
  const [mfaVisible, setMfaVisible] = useState(false);
  const [mfaCode, setMfaCode] = useState('');
  const [mfaError, setMfaError] = useState('');

  function submit() {
    if (email.trim().toLowerCase() === DEMO_STUDENT.email && password === DEMO_STUDENT.password) {
      setError('');
      // Trigger MFA Modal instead of logging in directly
      setMfaVisible(true);
      return;
    }
    setError('Use the demo student account to enter LevelBlue.');
  }

  function verifyMfa() {
    if (mfaCode.length === 6) {
      setMfaError('');
      setMfaVisible(false);
      onLogin(); // Proceed to the game!
    } else {
      setMfaError('Code must be 6 digits.');
    }
  }

  return (
    <View style={{ flex: 1 }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.wrapper}>

        <View style={styles.card}>

          {/* ── header ── */}
          <View style={styles.header}>
            <View style={styles.badge}>
              <Text style={styles.badgeIcon}>🛡</Text>
            </View>
            <Text style={styles.logo}>LevelBlue</Text>
            <Text style={styles.tagline}>Defend the city · Spot the scam</Text>
          </View>

          {/* ── module ribbon ── */}
          <View style={styles.ribbon}>
            <Text style={styles.ribbonText}>⚔  Module 1 — The Basics  ⚔</Text>
          </View>

          {/* ── body ── */}
          <View style={styles.body}>

            {/* demo credentials box */}
            <View style={styles.demoBox}>
              <View style={styles.demoAccent} />
              <Text style={styles.demoTitle}>Student Account</Text>
              <View style={styles.demoRow}>
                <Text style={styles.demoKey}>Email</Text>
                <Text style={styles.demoVal}>{DEMO_STUDENT.email}</Text>
              </View>
              <View style={styles.demoRow}>
                <Text style={styles.demoKey}>Pass</Text>
                <Text style={styles.demoVal}>{DEMO_STUDENT.password}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            {/* email field */}
            <View style={styles.field}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                autoCapitalize="none"
                keyboardType="email-address"
                onChangeText={setEmail}
                style={styles.input}
                value={email}
              />
            </View>

            {/* password field */}
            <View style={styles.field}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                onChangeText={setPassword}
                secureTextEntry
                style={styles.input}
                value={password}
              />
            </View>

            {/* error */}
            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>⚠  {error}</Text>
              </View>
            ) : null}

            {/* login button */}
            <LevelBlueButton label="▶  Log In" onPress={submit} />

          </View>
        </View>
      </KeyboardAvoidingView>

      {/* ── MFA Modal ── */}
      <Modal visible={mfaVisible} transparent animationType="fade">
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          {/* We reuse the styling of your main card for consistency */}
          <View style={styles.card}>
            
            <View style={styles.header}>
              <Text style={[styles.logo, { fontSize: 30 }]}>Security Uplink</Text>
              <Text style={styles.tagline}>Identity Verification Required</Text>
            </View>

            <View style={styles.body}>
              <View style={styles.field}>
                <Text style={[styles.label, { textAlign: 'center', marginBottom: 6 }]}>
                  Enter 6-Digit Auth Code
                </Text>
                <TextInput
                  style={styles.mfaInput}
                  value={mfaCode}
                  onChangeText={setMfaCode}
                  keyboardType="number-pad"
                  maxLength={6}
                  placeholder="000000"
                  placeholderTextColor="#7ab8d4"
                  autoFocus // Automatically pop the keyboard
                />
              </View>

              {mfaError ? (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>⚠  {mfaError}</Text>
                </View>
              ) : null}

              <LevelBlueButton label="▶  Verify" onPress={verifyMfa} />
              
              <TouchableOpacity 
                style={styles.cancelBtn} 
                onPress={() => {
                  setMfaVisible(false);
                  setMfaCode(''); // Reset code on cancel
                  setMfaError('');
                }}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>

          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#060e18',
    padding: 18,
  },

  // ── outer card ──
  card: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    backgroundColor: '#12243a',
    borderRadius: 6,
    borderWidth: 3,
    borderColor: '#0a1520',
    shadowColor: '#2e5a8a',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
    overflow: 'hidden',
  },

  // ── header block ──
  header: {
    backgroundColor: '#0d1c30',
    borderBottomWidth: 3,
    borderBottomColor: '#0a1520',
    paddingVertical: 18,
    paddingHorizontal: 20,
    alignItems: 'center',
    gap: 6,
  },
  badge: {
    width: 56,
    height: 56,
    backgroundColor: '#F2B94B',
    borderRadius: 4,
    borderWidth: 3,
    borderColor: '#0a1520',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    shadowColor: '#0a1520',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  badgeIcon: {
    fontSize: 28,
    lineHeight: 34,
  },
  logo: {
    fontFamily: 'PixelFont',
    fontSize: 38,
    color: '#F2B94B',
    textAlign: 'center',
    textShadowColor: '#0a1520',
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 0,
    lineHeight: 44,
  },
  tagline: {
    color: '#7ab8d4',
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },

  // ── module ribbon ──
  ribbon: {
    backgroundColor: '#c0392b',
    borderTopWidth: 2,
    borderTopColor: '#e74c3c',
    borderBottomWidth: 2,
    borderBottomColor: '#0a1520',
    paddingVertical: 5,
    alignItems: 'center',
  },
  ribbonText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 2.5,
  },

  // ── body ──
  body: {
    padding: 16,
    gap: 12,
  },

  // demo box
  demoBox: {
    backgroundColor: '#0b1827',
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#0a1520',
    padding: 12,
    gap: 4,
    shadowColor: '#0a1520',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
    overflow: 'hidden',
  },
  demoAccent: {
    position: 'absolute',
    top: 0,
    left: 10,
    width: 60,
    height: 2,
    backgroundColor: '#F2B94B',
  },
  demoTitle: {
    color: '#F2B94B',
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 4,
  },
  demoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  demoKey: {
    color: '#5a8aaa',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    width: 36,
  },
  demoVal: {
    color: '#e8e2d4',
    fontSize: 13,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },

  divider: {
    height: 1,
    backgroundColor: '#0a1520',
    shadowColor: '#1e3a55',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },

  field: {
    gap: 4,
  },
  label: {
    color: '#9FC4D6',
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 2,
    paddingLeft: 2,
  },
  input: {
    height: 46,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#0a1520',
    backgroundColor: '#F4F1E9',
    color: '#1B2430',
    paddingHorizontal: 14,
    fontSize: 15,
    fontWeight: '700',
    shadowColor: '#0a1520',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },

  errorBox: {
    backgroundColor: '#3d0f0f',
    borderWidth: 2,
    borderColor: '#c0392b',
    borderRadius: 4,
    paddingVertical: 7,
    paddingHorizontal: 12,
  },
  errorText: {
    color: '#ffb3ae',
    fontSize: 11,
    fontWeight: '800',
    textAlign: 'center',
  },

  // === MFA MODAL STYLES ===
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(6, 14, 24, 0.9)', // Deep dark overlay
    padding: 18,
  },
  mfaInput: {
    height: 70,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#0a1520',
    backgroundColor: '#F4F1E9',
    color: '#1B2430',
    fontSize: 32,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 12, // Space out the 6 digits nicely
    shadowColor: '#0a1520',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  cancelBtn: {
    marginTop: 8,
    alignItems: 'center',
    paddingVertical: 10,
  },
  cancelText: {
    color: '#7ab8d4',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  }
});