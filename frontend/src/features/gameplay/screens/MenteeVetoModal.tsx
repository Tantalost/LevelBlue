import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';

const { width, height } = Dimensions.get('window');
const s = (n: number) => Math.round(n * (Math.min(width, height) / 390));

type Props = {
  visible: boolean;
  mentorName: string;
  topic: string;
  onConfirm: () => Promise<void>;
  onDeny: () => Promise<void>;
};

export default function MenteeVetoModal({ visible, mentorName, topic, onConfirm, onDeny }: Props) {
  const [loading, setLoading] = useState(false);

  const handlePress = async (action: () => Promise<void>) => {
    setLoading(true);
    await action();
    setLoading(false);
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.panel}>
          <Text style={styles.header}>DEBRIEF REQUIRED</Text>
          <Text style={styles.subtitle}>BKT threshold crossed for {topic}.</Text>
          
          <Text style={styles.prompt}>
            Did Agent <Text style={{ color: '#5ac8ff', fontWeight: 'bold' }}>{mentorName}</Text> actively assist you in understanding this topic?
          </Text>

          {loading ? (
            <ActivityIndicator size="large" color="#3fbf7f" style={{ marginVertical: s(20) }} />
          ) : (
            <View style={styles.buttonRow}>
              <TouchableOpacity 
                style={[styles.button, { borderColor: '#3fbf7f', backgroundColor: '#3fbf7f18' }]}
                onPress={() => handlePress(onConfirm)}
              >
                <Text style={[styles.buttonText, { color: '#3fbf7f' }]}>YES, CONFIRM ASSIST</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.button, { borderColor: '#ff4466', backgroundColor: '#ff446618' }]}
                onPress={() => handlePress(onDeny)}
              >
                <Text style={[styles.buttonText, { color: '#ff4466' }]}>NO, I DID IT MYSELF</Text>
              </TouchableOpacity>
            </View>
          )}

          <Text style={styles.disclaimer}>
            Your response determines if the mentor receives their threat point bounty. Falsifying reports is a breach of protocol.
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: s(20),
  },
  panel: {
    backgroundColor: '#0c1525',
    borderWidth: 2,
    borderColor: '#3fbf7f',
    borderRadius: s(12),
    padding: s(20),
    width: '100%',
    maxWidth: 400,
  },
  header: {
    color: '#3fbf7f',
    fontSize: s(16),
    fontWeight: 'bold',
    letterSpacing: 2,
    textAlign: 'center',
  },
  subtitle: {
    color: '#5a7aaa',
    fontSize: s(12),
    textAlign: 'center',
    marginBottom: s(16),
  },
  prompt: {
    color: '#e8f0ff',
    fontSize: s(14),
    textAlign: 'center',
    lineHeight: s(20),
    marginBottom: s(24),
  },
  buttonRow: {
    gap: s(12),
  },
  button: {
    borderWidth: 2,
    borderRadius: s(8),
    paddingVertical: s(12),
    alignItems: 'center',
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: s(12),
    letterSpacing: 1,
  },
  disclaimer: {
    color: '#5a7aaa',
    fontSize: s(9),
    textAlign: 'center',
    marginTop: s(20),
    lineHeight: s(14),
  }
});
