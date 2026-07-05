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
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '../store/useAuthStore';
import { LevelBlueButton } from './LevelBlueButton';

function PatternItem({ met, text }: { met: boolean; text: string }) {
  return (
    <View style={styles.patternRow}>
      <Ionicons
        name={met ? "checkmark-circle" : "ellipse-outline"}
        size={14}
        color={met ? "#4CAF50" : "#7ab8d4"}
      />
      <Text style={[styles.patternText, { color: met ? "#4CAF50" : "#7ab8d4" }]}>{text}</Text>
    </View>
  );
}

// 1. ADDED 'navigation' to Props so we can intercept the route
type Props = {
  onLogin: () => void;
  navigation?: any; 
};

export function LoginScreen({ onLogin, navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // === MFA States ===
  const [mfaVisible, setMfaVisible] = useState(false);
  const [mfaCode, setMfaCode] = useState('');
  const [mfaError, setMfaError] = useState('');

  // === Password Change States ===
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const passwordPatterns = {
    length: newPassword.length >= 8,
    uppercase: /[A-Z]/.test(newPassword),
    lowercase: /[a-z]/.test(newPassword),
    number: /[0-9]/.test(newPassword),
    special: /[^A-Za-z0-9]/.test(newPassword),
  };
  const isPasswordStrong = Object.values(passwordPatterns).every(Boolean);

  // === STEP 1: AUTHENTICATE ===
  async function submit() {
    if (!email || !password) {
      setError('Enter your student email and password.');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const apiUrl = process.env.EXPO_PUBLIC_API_URL;
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password })
      });
      const data = await response.json();
      
      setIsLoading(false);

      if (!response.ok) {
        setError(data.error || 'Login failed');
        return;
      }

      if (data.mfaRequired) {
        setMfaVisible(true);
      } else if (data.token && data.user) {
        // Normal login without MFA (requires_password_change is false)
        if (Platform.OS === 'web') {
          await AsyncStorage.setItem('userToken', data.token);
        } else {
          await SecureStore.setItemAsync('userToken', data.token);
        }
        await AsyncStorage.setItem('userData', JSON.stringify(data.user));
        useAuthStore.getState().setAuth(data.user, data.token);
        onLogin();
      } else {
        setError('Unexpected response from server');
      }
    } catch (e: any) {
      setIsLoading(false);
      setError(e.message || 'Network error');
    }
  }

  // === STEP 2: VERIFY MFA AND CHECK FLAG ===
  async function verifyMfa() {
    if (mfaCode.length === 6) {
      setMfaError('');
      setMfaVisible(false);

      try {
        const apiUrl = process.env.EXPO_PUBLIC_API_URL;
        
        // 1. Verify the MFA code
        const response = await fetch(`${apiUrl}/auth/verify-mfa`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim(), code: mfaCode })
        });
        const data = await response.json();

        if (!response.ok) {
          setMfaError(data.error || 'Invalid verification code');
          return;
        }

        // MFA Success!
        setMfaVisible(false);
        const { token, user } = data;

        // Save to storage
        if (Platform.OS === 'web') {
          await AsyncStorage.setItem('userToken', token);
        } else {
          await SecureStore.setItemAsync('userToken', token);
        }
        await AsyncStorage.setItem('userData', JSON.stringify(user));
        useAuthStore.getState().setAuth(user, token);

        // Since MFA is only triggered on first login, prompt for new password
        setPasswordModalVisible(true);

      } catch (e: any) {
        setMfaError(e.message || 'Network error');
      }
    } else {
      setMfaError('Code must be 6 digits.');
    }
  }

  // === STEP 3: CHANGE PASSWORD (FIRST TIME ONLY) ===
  async function changePassword() {
    if (!newPassword || !confirmPassword) {
      setPasswordError('Please fill out both fields.');
      return;
    }
    if (!isPasswordStrong) {
      setPasswordError('Password does not meet all requirements.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }

    setPasswordError('');
    setIsLoading(true);
    try {
      const apiUrl = process.env.EXPO_PUBLIC_API_URL;
      const token = useAuthStore.getState().token;
      
      const response = await fetch(`${apiUrl}/auth/change-password`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ newPassword })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update password');
      }

      // Success!
      setPasswordModalVisible(false);
      onLogin();

    } catch (e: any) {
      setPasswordError(e.message || 'Error updating password');
    } finally {
      setIsLoading(false);
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
            <View style={styles.row}>
              <View style={styles.header}>
                <Image
                  source={require('../assets/logo.png')}
                  style={styles.logoImage}
                  resizeMode="contain"
                />
                <Text style={styles.tagline}>Defend the city{'\n'}Spot the scam</Text>
              </View>

              <View style={styles.body}>
                <View style={styles.fieldRow}>
                  <View style={[styles.field, { flex: 1 }]}>
                    <Text style={styles.label}>Email</Text>
                    <TextInput
                      autoCapitalize="none"
                      keyboardType="email-address"
                      onChangeText={setEmail}
                      style={styles.input}
                      value={email}
                      editable={!isLoading}
                    />
                  </View>

                  <View style={[styles.field, { flex: 1 }]}>
                    <Text style={styles.label}>Password</Text>
                    <TextInput
                      onChangeText={setPassword}
                      secureTextEntry
                      style={styles.input}
                      value={password}
                      editable={!isLoading}
                    />
                  </View>
                </View>

                {error ? (
                  <View style={styles.errorBox}>
                    <Text style={styles.errorText}>⚠  {error}</Text>
                  </View>
                ) : null}

                {isLoading ? (
                  <ActivityIndicator size="large" color="#F2B94B" style={{ marginTop: 10 }} />
                ) : (
                  <LevelBlueButton label="▶  Log In" onPress={submit} />
                )}

              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ── MFA Modal ── */}
      <Modal
        visible={mfaVisible}
        transparent
        animationType="fade"
        supportedOrientations={['landscape', 'landscape-left', 'landscape-right']}
      >
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
                    autoFocus 
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
                      setMfaCode(''); 
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

      {/* ── Change Password Modal ── */}
      <Modal
        visible={passwordModalVisible}
        transparent
        animationType="fade"
        supportedOrientations={['landscape', 'landscape-left', 'landscape-right']}
      >
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

              <View style={[styles.mfaHeader, { backgroundColor: '#3d0f0f', borderBottomColor: '#c0392b' }]}>
                <Text style={[styles.logo, { fontSize: 22, lineHeight: 26, color: '#fff' }]}>Security Alert</Text>
                <Text style={[styles.tagline, { color: '#ffb3ae' }]}>Update Temporary Password</Text>
              </View>

              <View style={styles.mfaBody}>
                <View style={styles.field}>
                  <Text style={[styles.label, { marginBottom: 6 }]}>New Password</Text>
                  <View style={styles.passwordInputContainer}>
                    <TextInput
                      style={styles.passwordInput}
                      value={newPassword}
                      onChangeText={setNewPassword}
                      secureTextEntry={!showNewPassword}
                      placeholder="Enter new password"
                      placeholderTextColor="#7ab8d4"
                      editable={!isLoading}
                    />
                    <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)} style={styles.eyeIcon}>
                      <Ionicons name={showNewPassword ? "eye-off" : "eye"} size={20} color="#7ab8d4" />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Password Pattern UI */}
                <View style={styles.patternContainer}>
                  <PatternItem met={passwordPatterns.length} text="At least 8 characters" />
                  <PatternItem met={passwordPatterns.uppercase} text="One uppercase letter" />
                  <PatternItem met={passwordPatterns.lowercase} text="One lowercase letter" />
                  <PatternItem met={passwordPatterns.number} text="One number" />
                  <PatternItem met={passwordPatterns.special} text="One special character" />
                </View>

                <View style={[styles.field, { marginTop: 8 }]}>
                  <Text style={[styles.label, { marginBottom: 6 }]}>Confirm Password</Text>
                  <View style={styles.passwordInputContainer}>
                    <TextInput
                      style={styles.passwordInput}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry={!showConfirmPassword}
                      placeholder="Re-type new password"
                      placeholderTextColor="#7ab8d4"
                      editable={!isLoading}
                    />
                    <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}>
                      <Ionicons name={showConfirmPassword ? "eye-off" : "eye"} size={20} color="#7ab8d4" />
                    </TouchableOpacity>
                  </View>
                </View>

                {passwordError ? (
                  <View style={styles.errorBox}>
                    <Text style={styles.errorText}>⚠  {passwordError}</Text>
                  </View>
                ) : null}

                <View style={{ marginTop: 10 }}>
                  {isLoading ? (
                    <ActivityIndicator size="large" color="#F2B94B" />
                  ) : (
                    <LevelBlueButton label="▶  Secure Account" onPress={changePassword} />
                  )}
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
    justifyContent: 'center', // Added to vertically center the new layout
  },

  fieldRow: {
    flexDirection: 'row',
    gap: 12,
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
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#0a1520',
    backgroundColor: '#F4F1E9',
    shadowColor: '#0a1520',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  passwordInput: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 12,
    color: '#1B2430',
    fontSize: 16,
    fontWeight: '700',
  },
  eyeIcon: {
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  patternContainer: {
    marginTop: 8,
    gap: 4,
  },
  patternRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  patternText: {
    fontSize: 12,
    fontWeight: '600',
  }
});