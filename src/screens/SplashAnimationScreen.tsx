import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, StatusBar } from 'react-native';

export default function SplashAnimationScreen({ navigation }: any) {
  // Initial opacity is 0
  const fadeAnim = useRef(new Animated.Value(0)).current; 

  useEffect(() => {
    // Chain animations in a sequence
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1, // Fade to full opacity
        duration: 2000, // 2 seconds
        useNativeDriver: true,
      }),
      Animated.delay(2000), // Hold it visible for 2 seconds
      Animated.timing(fadeAnim, {
        toValue: 0, // Fade out
        duration: 1500, // 1.5 seconds
        useNativeDriver: true,
      })
    ]).start(() => {
      // Once the entire animation sequence finishes, navigate to the IntroScreen
      navigation.replace('Intro'); 
    });
  }, [fadeAnim, navigation]);

  return (
    <View style={styles.container}>
      {/* Ensure status bar is hidden during the cinematic intro */}
      <StatusBar hidden />
      
      <Animated.View style={{ opacity: fadeAnim, alignItems: 'center' }}>
        <Text style={styles.studioText}>YOUR STUDIO NAME</Text>
        <Text style={styles.presentsText}>PRESENTS</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000', // Pitch black cinematic background
    justifyContent: 'center',
    alignItems: 'center',
  },
  studioText: {
    color: '#ffffff',
    fontSize: 24,
    letterSpacing: 4,
    marginBottom: 10,
    fontWeight: 'bold',
    // fontFamily: 'PressStart2P', // Uncomment when pixel font is added
  },
  presentsText: {
    color: '#a0a0a0',
    fontSize: 14,
    letterSpacing: 6,
    // fontFamily: 'PressStart2P', // Uncomment when pixel font is added
  }
});