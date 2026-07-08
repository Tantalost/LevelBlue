import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import React from 'react';
import { Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useFonts, PressStart2P_400Regular } from '@expo-google-fonts/press-start-2p';

import SplashAnimationScreen from './src/screens/SplashAnimationScreen';
import IntroScreen from './src/screens/IntroScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import MissionBriefingScreen from './src/screens/MissionBriefingScreen';
import StageSelectScreen from './src/screens/StageSelectScreen';
import GameScreen from './src/screens/GameScreen';
import ProgressScreen from './src/screens/ProgressScreen';
import IntelligenceScreen from './src/screens/IntelligenceScreen';
import StoreScreen from './src/screens/StoreScreen';
import LessonsScreen from './src/screens/LessonsScreen';
import ModuleDetailScreen from './src/screens/ModuleDetailScreen';
import CodexScreen from './src/screens/CodexScreen';
import PvPHubScreen from './src/screens/PvPHubScreen';
import PayloadForgeScreen from './src/screens/PayloadForgeScreen';
import InboxTriageScreen from './src/screens/InboxTriageScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import InboxScreen from './src/screens/InboxScreen';
import { useProgressionStore } from './src/store/useProgressionStore';

// Wrapper component for StageSelectScreen to work with navigation
function StageSelectWrapper({ navigation }: any) {
  const currentStage = useProgressionStore((s) => s.currentStage);
  const highestUnlockedStage = useProgressionStore((s) => s.highestUnlockedStage);
  const materials = useProgressionStore((s) => s.materials);
  const buildingLevels = useProgressionStore((s) => s.buildingLevels);
  const upgradeBuilding = useProgressionStore((s) => s.upgradeBuilding);
  const setCurrentStage = useProgressionStore((s) => s.setCurrentStage);

  return (
    <StageSelectScreen
      visible={true}
      onClose={() => navigation.goBack()}
      navigation={navigation}
      currentStage={currentStage}
      highestUnlockedStage={highestUnlockedStage}
      materials={materials}
      onSelectStage={(stage) => {
        setCurrentStage(stage);
        navigation.replace('Game', {
          stage,
          moduleName: 'Module 1: The Basics',
        });
      }}
      buildingLevels={buildingLevels}
      onUpgradeBuilding={upgradeBuilding}
    />
  );
}

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
    <GestureHandlerRootView style={{ flex: 1 }}>
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
          <Stack.Screen name="StageSelect" component={StageSelectWrapper} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="Inbox" component={InboxScreen} />
          <Stack.Screen
            name="Game"
            component={GameScreen}
            options={{
              gestureEnabled: false,
              animation: 'fade',
              contentStyle: { backgroundColor: '#080e1a' },
              ...(Platform.OS === 'ios' ? { presentation: 'fullScreenModal' as const } : {}),
            }}
          />
          <Stack.Screen name="Progress" component={ProgressScreen} />
          <Stack.Screen name="Intelligence" component={IntelligenceScreen} />
          <Stack.Screen name="Lessons" component={LessonsScreen} />
          <Stack.Screen name="ModuleDetail" component={ModuleDetailScreen} />
          <Stack.Screen name="Codex" component={CodexScreen} />
          <Stack.Screen name="PvPHub" component={PvPHubScreen} />
          <Stack.Screen name="PayloadForge" component={PayloadForgeScreen} />
          <Stack.Screen name="InboxTriage" component={InboxTriageScreen} />
          <Stack.Screen name="Store" component={StoreScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}