import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  useWindowDimensions,
  PixelRatio,
} from 'react-native';

type Props = {
  visible: boolean;
  mentorName: string;
  topic: string;
  onConfirm: () => Promise<void>;
  onDeny: () => Promise<void>;
};

export default function MenteeVetoModal({ visible, mentorName, topic, onConfirm, onDeny }: Props) {
  const [loading, setLoading] = useState(false);
  const { width, height } = useWindowDimensions();
  const shortSide = Math.min(width, height);
  const s = (n: number) => Math.round(PixelRatio.roundToNearestPixel(n * (shortSide / 390)));

  // Fully unmount when not visible — mirrors the StageSelectScreen pattern
  if (!visible) return null;

  const handlePress = async (action: () => Promise<void>) => {
    setLoading(true);
    await action();
    setLoading(false);
  };

  return (
    <Modal
      visible
      transparent
      animationType="fade"
      supportedOrientations={['portrait', 'landscape', 'landscape-left', 'landscape-right']}
      onRequestClose={() => {}} // Android back button — do nothing; user must choose
    >
      <View style={[styles.overlay]}>
        <View style={[styles.panel, { padding: s(20), borderRadius: s(12), maxWidth: Math.min(width * 0.85, 460) }]}>
          <Text style={[styles.header, { fontSize: s(15) }]}>DEBRIEF REQUIRED</Text>
          <Text style={[styles.subtitle, { fontSize: s(11), marginBottom: s(12) }]}>
            BKT threshold crossed for <Text style={{ color: '#ff4466' }}>{topic}</Text>.
          </Text>

          <Text style={[styles.prompt, { fontSize: s(13), lineHeight: s(19), marginBottom: s(20) }]}>
            Did Agent{' '}
            <Text style={{ color: '#5ac8ff', fontWeight: 'bold' }}>{mentorName}</Text>
            {' '}actively assist you in understanding this topic?
          </Text>

          {loading ? (
            <ActivityIndicator size="large" color="#3fbf7f" style={{ marginVertical: s(16) }} />
          ) : (
            <View style={[styles.buttonRow, { gap: s(10) }]}>
              <TouchableOpacity
                style={[styles.button, { borderColor: '#3fbf7f', backgroundColor: '#3fbf7f18', paddingVertical: s(11), borderRadius: s(8) }]}
                onPress={() => handlePress(onConfirm)}
              >
                <Text style={[styles.buttonText, { color: '#3fbf7f', fontSize: s(11) }]}>✓  YES, CONFIRM ASSIST</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, { borderColor: '#ff4466', backgroundColor: '#ff446618', paddingVertical: s(11), borderRadius: s(8) }]}
                onPress={() => handlePress(onDeny)}
              >
                <Text style={[styles.buttonText, { color: '#ff4466', fontSize: s(11) }]}>✕  NO, I DID IT MYSELF</Text>
              </TouchableOpacity>
            </View>
          )}

          <Text style={[styles.disclaimer, { fontSize: s(9), marginTop: s(16), lineHeight: s(14) }]}>
            Your response determines if the mentor receives their threat point bounty.{'\n'}Falsifying reports is a breach of protocol.
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.88)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  panel: {
    backgroundColor: '#0c1525',
    borderWidth: 2,
    borderColor: '#3fbf7f',
    width: '100%',
  },
  header: {
    color: '#3fbf7f',
    fontWeight: 'bold',
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    color: '#5a7aaa',
    textAlign: 'center',
  },
  prompt: {
    color: '#e8f0ff',
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'column',
  },
  button: {
    borderWidth: 2,
    alignItems: 'center',
  },
  buttonText: {
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  disclaimer: {
    color: '#5a7aaa',
    textAlign: 'center',
  },
});
