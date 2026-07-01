import { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
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
      <Image
        source={require('../assets/background.png')}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      />
      <View style={styles.darkOverlay} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.wrapper}>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>

            {/* ── module ribbon (full width strip) ── */}
            <View style={styles.ribbon}>
              <Text style={styles.ribbonText}>⚔  Module 1 — The Basics  ⚔</Text>
            </View>

            <View style={styles.row}>

              {/* ── left: branding ── */}
              <View style={styles.header}>
                <Image
                  source={require('../assets/logo.png')}
                  style={styles.logoImage}
                  resizeMode="contain"
                />
                <Text style={styles.tagline}>Defend the city{'\n'}Spot the scam</Text>
              </View>

              {/* ── right: form ── */}
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

                {/* email + password side by side to save vertical space */}
                <View style={styles.fieldRow}>
                  <View style={[styles.field, { flex: 1 }]}>
                    <Text style={styles.label}>Email</Text>
                    <TextInput
                      autoCapitalize="none"
                      keyboardType="email-address"
                      onChangeText={setEmail}
                      style={styles.input}
                      value={email}
                    />
                  </View>

                  <View style={[styles.field, { flex: 1 }]}>
                    <Text style={styles.label}>Password</Text>
                    <TextInput
                      onChangeText={setPassword}
                      secureTextEntry
                      style={styles.input}
                      value={password}
                    />
                  </View>
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
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ── MFA Modal ── */}
      <Modal visible={mfaVisible} transparent animationType="fade">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <ScrollView
            contentContainerStyle={styles.modalScrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.mfaCard}>

              <View style={styles.mfaHeader}>
                <Text style={[styles.logo, { fontSize: 22, lineHeight: 26 }]}>Security Uplink</Text>
                <Text style={styles.tagline}>Identity Verification Required</Text>
              </View>

              <View style={styles.mfaBody}>
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

                <View style={styles.mfaActions}>
                  <View style={{ flex: 1 }}>
                    <LevelBlueButton label="▶  Verify" onPress={verifyMfa} />
                  </View>
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

            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  darkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(5, 8, 20, 0.72)',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 18,
  },

  // ── outer card ──
  card: {
    width: '100%',
    maxWidth: 720,
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

  // ── row split: header | body ──
  row: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },

  // ── header block (left column) ──
  header: {
    width: 180,
    backgroundColor: 'rgba(13, 28, 48, 0.9)',
    borderRightWidth: 3,
    borderRightColor: '#0a1520',
    paddingVertical: 18,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  logoImage: {
    width: '100%',
    height: 76,
    marginBottom: 2,
  },
  logo: {
    fontFamily: 'PixelFont',
    fontSize: 26,
    color: '#F2B94B',
    textAlign: 'center',
    textShadowColor: '#0a1520',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
    lineHeight: 30,
  },
  tagline: {
    color: '#7ab8d4',
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  // ── module ribbon ──
  ribbon: {
    backgroundColor: '#c0392b',
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

  // ── body (right column) ──
  body: {
    flex: 1,
    padding: 18,
    gap: 14,
  },

  fieldRow: {
    flexDirection: 'row',
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
    marginBottom: 2,
  },
  demoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 1,
  },
  demoKey: {
    color: '#5a8aaa',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    width: 50,
  },
  demoVal: {
    color: '#e8e2d4',
    fontSize: 12,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
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
    height: 44,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#0a1520',
    backgroundColor: '#F4F1E9',
    color: '#1B2430',
    paddingHorizontal: 12,
    fontSize: 14,
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
    paddingVertical: 6,
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
    backgroundColor: 'rgba(6, 14, 24, 0.9)',
  },
  modalScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 18,
  },
  mfaCard: {
    width: '100%',
    maxWidth: 420,
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
  mfaHeader: {
    backgroundColor: '#0d1c30',
    borderBottomWidth: 3,
    borderBottomColor: '#0a1520',
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
    gap: 4,
  },
  mfaBody: {
    padding: 14,
    gap: 10,
  },
  mfaInput: {
    height: 52,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#0a1520',
    backgroundColor: '#F4F1E9',
    color: '#1B2430',
    fontSize: 26,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 10,
    shadowColor: '#0a1520',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  mfaActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  cancelText: {
    color: '#7ab8d4',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  }
});