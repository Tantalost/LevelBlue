import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useFonts, PressStart2P_400Regular } from '@expo-google-fonts/press-start-2p';

import SplashAnimationScreen from './src/screens/SplashAnimationScreen';
import IntroScreen from './src/screens/IntroScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import MissionBriefingScreen from './src/screens/MissionBriefingScreen';
import GameScreen from './src/screens/GameScreen';
import ProgressScreen from './src/screens/ProgressScreen';
import IntelligenceScreen from './src/screens/IntelligenceScreen';
import StoreScreen from './src/screens/StoreScreen';



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
              onLogin={() => {
                props.navigation.reset({
                  index: 0,
                  routes: [{ name: 'Dashboard' }],
                });
              }}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="MissionBriefing" component={MissionBriefingScreen} />
        <Stack.Screen name="Game" component={GameScreen} />
        <Stack.Screen name="Progress" component={ProgressScreen} />
        <Stack.Screen name="Intelligence" component={IntelligenceScreen} />
        <Stack.Screen name="Store" component={StoreScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}