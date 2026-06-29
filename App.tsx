import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useFonts, PressStart2P_400Regular } from '@expo-google-fonts/press-start-2p'; // <-- Import font

import SplashAnimationScreen from './src/screens/SplashAnimationScreen';
import IntroScreen from './src/screens/IntroScreen';
import { LoginScreen } from './src/screens/LoginScreen'; 

const Stack = createNativeStackNavigator();

export default function App() {
  // Load the font and name it 'PixelFont'
  let [fontsLoaded] = useFonts({
    'PixelFont': PressStart2P_400Regular,
  });

  // Wait until font is loaded before rendering
  if (!fontsLoaded) {
    return null; 
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashAnimationScreen} />
        <Stack.Screen name="Intro" component={IntroScreen} />
        <Stack.Screen name="Login">
          {(props) => (
            <LoginScreen 
              {...props} 
              onLogin={() => console.log('MFA Success!')} 
            />
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}