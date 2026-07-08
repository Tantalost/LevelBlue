import React, { useState, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  PixelRatio,
  useWindowDimensions,
  ScrollView,
  PanResponder,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const BASE_WIDTH = 932;

function makeStyles(width: number) {
  const scaleFactor = width / BASE_WIDTH;
  const normalize = (size: number) =>
    Math.round(PixelRatio.roundToNearestPixel(size * scaleFactor));
  const bw = (size: number) => Math.max(1, normalize(size));

  return StyleSheet.create({
    container: {
      flex: 1,
      width: '100%',
      height: '100%',
      backgroundColor: '#060e18',
    },
    safeArea: {
      flex: 1,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: normalize(24),
      paddingTop: normalize(24),
      paddingBottom: normalize(16),
    },
    headerTitle: {
      color: '#ffffff',
      fontSize: normalize(24),
      fontFamily: 'PixelFont',
      textShadowColor: '#5ac8ff',
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 8,
    },
    backButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: normalize(8),
    },
    backButtonText: {
      color: '#7ab8d4',
      fontSize: normalize(14),
      fontFamily: 'PixelFont',
    },
    content: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: normalize(24),
      paddingTop: normalize(16),
      paddingBottom: normalize(32),
    },
    section: {
      marginBottom: normalize(24),
    },
    sectionTitle: {
      color: '#00d2d3',
      fontSize: normalize(12),
      fontFamily: 'PixelFont',
      letterSpacing: 2,
      marginBottom: normalize(12),
    },
    settingItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: 'rgba(18, 36, 58, 0.85)',
      borderWidth: bw(2),
      borderColor: '#3a6a8a',
      borderRadius: normalize(8),
      paddingHorizontal: normalize(16),
      paddingVertical: normalize(14),
      marginBottom: normalize(12),
    },
    settingLabel: {
      color: '#ffffff',
      fontSize: normalize(14),
      fontFamily: 'PixelFont',
    },
    settingDescription: {
      color: '#5a8aaa',
      fontSize: normalize(10),
      fontFamily: 'PixelFont',
      marginTop: normalize(4),
    },
    toggleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    toggle: {
      width: normalize(48),
      height: normalize(24),
      borderRadius: normalize(12),
      backgroundColor: '#1a252f',
      borderWidth: bw(2),
      borderColor: '#3a6a8a',
      justifyContent: 'center',
      paddingHorizontal: normalize(2),
    },
    toggleActive: {
      backgroundColor: '#3fbf7f',
      borderColor: '#3fbf7f',
    },
    toggleKnob: {
      width: normalize(18),
      height: normalize(18),
      borderRadius: normalize(9),
      backgroundColor: '#5a8aaa',
    },
    toggleKnobActive: {
      backgroundColor: '#ffffff',
      alignSelf: 'flex-end',
    },
    sliderContainer: {
      width: normalize(120),
    },
    slider: {
      height: normalize(6),
      backgroundColor: '#1a252f',
      borderRadius: normalize(3),
      overflow: 'hidden',
    },
    sliderFill: {
      height: '100%',
      backgroundColor: '#5ac8ff',
    },
    sliderKnob: {
      position: 'absolute',
      width: normalize(14),
      height: normalize(14),
      borderRadius: normalize(7),
      backgroundColor: '#ffffff',
      borderWidth: bw(2),
      borderColor: '#3a6a8a',
      top: '50%',
      marginTop: normalize(-7),
      marginLeft: normalize(-7),
    },
    sliderValue: {
      color: '#5ac8aaa',
      fontSize: normalize(10),
      fontFamily: 'PixelFont',
      marginTop: normalize(4),
    },
  });
}

export default function SettingsScreen({ navigation }: any) {
  const { width } = useWindowDimensions();
  const styles = makeStyles(width);

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [masterVolume, setMasterVolume] = useState(80);
  const [sfxVolume, setSfxVolume] = useState(70);

  const Toggle = ({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) => (
    <TouchableOpacity
      style={[styles.toggle, enabled && styles.toggleActive]}
      onPress={onToggle}
      activeOpacity={0.8}
    >
      <View style={[styles.toggleKnob, enabled && styles.toggleKnobActive]} />
    </TouchableOpacity>
  );

  const Slider = ({ value, label, onValueChange }: { value: number; label: string; onValueChange: (val: number) => void }) => {
    const sliderWidthRef = useRef(0);
    const onValueChangeRef = useRef(onValueChange);
    const startValueRef = useRef(value);

    onValueChangeRef.current = onValueChange;

    const panResponder = useMemo(() => PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const width = sliderWidthRef.current;
        if (width > 0) {
          let newValue = (evt.nativeEvent.locationX / width) * 100;
          newValue = Math.max(0, Math.min(100, Math.round(newValue)));
          onValueChangeRef.current(newValue);
          startValueRef.current = newValue; 
        }
      },
      onPanResponderMove: (evt, gestureState) => {
        const width = sliderWidthRef.current;
        if (width > 0) {
          let deltaValue = (gestureState.dx / width) * 100;
          let newValue = startValueRef.current + deltaValue;
          newValue = Math.max(0, Math.min(100, Math.round(newValue)));
          onValueChangeRef.current(newValue);
        }
      },
    }), []);

    return (
      <View style={styles.sliderContainer}>
        <View 
          style={{ height: 24, justifyContent: 'center' }}
          onLayout={(e) => { sliderWidthRef.current = e.nativeEvent.layout.width; }}
          {...panResponder.panHandlers}
        >
          <View pointerEvents="none" style={styles.slider}>
            <View style={[styles.sliderFill, { width: `${value}%` }]} />
          </View>
          <View 
            pointerEvents="none" 
            style={[styles.sliderKnob, { left: `${value}%` }]} 
          />
        </View>
        <Text style={styles.sliderValue}>{label}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar hidden />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>{'< BACK'}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>SETTINGS</Text>
          <View style={{ width: 60 }} />
        </View>

        <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
          {/* AUDIO SETTINGS */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>AUDIO</Text>
            
            <View style={styles.settingItem}>
              <View>
                <Text style={styles.settingLabel}>Master Volume</Text>
                <Text style={styles.settingDescription}>Adjust overall game volume</Text>
              </View>
              <Slider value={masterVolume} label={`${masterVolume}%`} onValueChange={setMasterVolume} />
            </View>

            <View style={styles.settingItem}>
              <View>
                <Text style={styles.settingLabel}>Sound Effects</Text>
                <Text style={styles.settingDescription}>Enable game sound effects</Text>
              </View>
              <Toggle enabled={soundEnabled} onToggle={() => setSoundEnabled(!soundEnabled)} />
            </View>

            <View style={styles.settingItem}>
              <View>
                <Text style={styles.settingLabel}>SFX Volume</Text>
                <Text style={styles.settingDescription}>Sound effects volume level</Text>
              </View>
              <Slider value={sfxVolume} label={`${sfxVolume}%`} onValueChange={setSfxVolume} />
            </View>

            <View style={styles.settingItem}>
              <View>
                <Text style={styles.settingLabel}>Background Music</Text>
                <Text style={styles.settingDescription}>Play ambient music</Text>
              </View>
              <Toggle enabled={musicEnabled} onToggle={() => setMusicEnabled(!musicEnabled)} />
            </View>
          </View>

          {/* GAMEPLAY SETTINGS */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>GAMEPLAY</Text>
            
            <View style={styles.settingItem}>
              <View>
                <Text style={styles.settingLabel}>Vibration</Text>
                <Text style={styles.settingDescription}>Haptic feedback on actions</Text>
              </View>
              <Toggle enabled={vibrationEnabled} onToggle={() => setVibrationEnabled(!vibrationEnabled)} />
            </View>

            <View style={styles.settingItem}>
              <View>
                <Text style={styles.settingLabel}>Auto-Deploy Towers</Text>
                <Text style={styles.settingDescription}>Automatically place towers</Text>
              </View>
              <Toggle enabled={false} onToggle={() => {}} />
            </View>

            <View style={styles.settingItem}>
              <View>
                <Text style={styles.settingLabel}>Show Damage Numbers</Text>
                <Text style={styles.settingDescription}>Display damage indicators</Text>
              </View>
              <Toggle enabled={true} onToggle={() => {}} />
            </View>
          </View>

          {/* NOTIFICATIONS */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>NOTIFICATIONS</Text>
            
            <View style={styles.settingItem}>
              <View>
                <Text style={styles.settingLabel}>Push Notifications</Text>
                <Text style={styles.settingDescription}>Receive game alerts</Text>
              </View>
              <Toggle enabled={notificationsEnabled} onToggle={() => setNotificationsEnabled(!notificationsEnabled)} />
            </View>

            <View style={styles.settingItem}>
              <View>
                <Text style={styles.settingLabel}>Mission Reminders</Text>
                <Text style={styles.settingDescription}>Daily mission alerts</Text>
              </View>
              <Toggle enabled={true} onToggle={() => {}} />
            </View>
          </View>

          {/* DISPLAY */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>DISPLAY</Text>
            
            <View style={styles.settingItem}>
              <View>
                <Text style={styles.settingLabel}>High Quality Graphics</Text>
                <Text style={styles.settingDescription}>Enhanced visual effects</Text>
              </View>
              <Toggle enabled={true} onToggle={() => {}} />
            </View>

            <View style={styles.settingItem}>
              <View>
                <Text style={styles.settingLabel}>Show FPS Counter</Text>
                <Text style={styles.settingDescription}>Display frame rate</Text>
              </View>
              <Toggle enabled={false} onToggle={() => {}} />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
