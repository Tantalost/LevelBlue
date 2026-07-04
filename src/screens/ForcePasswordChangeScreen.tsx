import React, { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  ActivityIndicator
} from 'react-native';

import { supabase } from '../utils/supabase';
import { LevelBlueButton } from './LevelBlueButton';

type Props = {
  navigation: any;
};

export default function ForcePasswordChangeScreen({ navigation }: Props) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handlePasswordUpdate() {
    // 1. Basic Validation
    if (!newPassword || !confirmPassword) {
      setError('Please fill out both fields.');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      // 2. Tell Supabase Auth to update the password securely
      const { error: authError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (authError) throw authError;

      // 3. Fetch the current user ID to update their database flag
      const { data: authData, error: userError } = await supabase.auth.getUser();
      if (userError || !authData.user) throw new Error('Could not verify user session.');

      // 4. Update the public.students table to clear the flag
      const { error: dbError } = await supabase
        .from('students')
        .update({ requires_password_change: false })
        .eq('id', authData.user.id);

      if (dbError) throw dbError;

      // 5. Success! Route them to the Dashboard
      navigation.reset({
        index: 0,
        routes: [{ name: 'Dashboard' }],
      });

    } catch (err: any) {
      setError(err.message || 'An error occurred while updating your password.');
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
            
            {/* ── Warning Ribbon ── */}
            <View style={styles.ribbon}>
              <Text style={styles.ribbonText}>⚠ SECURITY PROTOCOL INITIATED ⚠</Text>
            </View>

            <View style={styles.body}>
              <View style={styles.headerTextContainer}>
                <Text style={styles.title}>Update Credentials</Text>
                <Text style={styles.subtitle}>
                  Your account is using a temporary professor-issued password. You must secure your account before deploying.
                </Text>
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>New Password</Text>
                <TextInput
                  onChangeText={setNewPassword}
                  secureTextEntry
                  style={styles.input}
                  value={newPassword}
                  editable={!isLoading}
                  placeholder="Minimum 6 characters"
                  placeholderTextColor="#7ab8d4"
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Confirm Password</Text>
                <TextInput
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  style={styles.input}
                  value={confirmPassword}
                  editable={!isLoading}
                  placeholder="Re-type new password"
                  placeholderTextColor="#7ab8d4"
                />
              </View>

              {/* error */}
              {error ? (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>⚠  {error}</Text>
                </View>
              ) : null}

              {/* Submit Button */}
              {isLoading ? (
                <ActivityIndicator size="large" color="#F2B94B" style={{ marginTop: 10 }} />
              ) : (
                <View style={{ marginTop: 10 }}>
                  <LevelBlueButton label="▶  Secure Account" onPress={handlePasswordUpdate} />
                </View>
              )}

            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  card: {
    width: '100%',
    maxWidth: 500,
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
  ribbon: {
    backgroundColor: '#c0392b',
    borderBottomWidth: 2,
    borderBottomColor: '#0a1520',
    paddingVertical: 8,
    alignItems: 'center',
  },
  ribbonText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 2.5,
  },
  body: {
    padding: 24,
    gap: 16,
  },
  headerTextContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontFamily: 'PixelFont',
    fontSize: 18,
    color: '#F2B94B',
    textAlign: 'center',
    textShadowColor: '#0a1520',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
    marginBottom: 8,
  },
  subtitle: {
    color: '#7ab8d4',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 18,
  },
  field: {
    gap: 6,
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
    height: 48,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#0a1520',
    backgroundColor: '#F4F1E9',
    color: '#1B2430',
    paddingHorizontal: 12,
    fontSize: 16,
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
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  errorText: {
    color: '#ffb3ae',
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
  },
});