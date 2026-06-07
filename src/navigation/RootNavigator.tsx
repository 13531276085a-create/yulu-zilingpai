import React from 'react';
import { NavigationContainer, LinkingOptions } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import HomeScreen from '../screens/HomeScreen';
import DrawScreen from '../screens/DrawScreen';
import ResultScreen from '../screens/ResultScreen';
import HistoryScreen from '../screens/HistoryScreen';
import HistoryDetailScreen from '../screens/HistoryDetailScreen';
import EncyclopediaScreen from '../screens/EncyclopediaScreen';
import CardDetailScreen from '../screens/CardDetailScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

// URL linking configuration — enables browser back/forward & deep linking
const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ['https://yuluzilingpai.fun', 'http://localhost:8081'],
  config: {
    screens: {
      Home: '',
      Draw: 'draw',
      Result: 'result',
      History: 'history',
      HistoryDetail: 'history/:id',
      Encyclopedia: 'encyclopedia',
      CardDetail: 'card/:id',
      Settings: 'settings',
    },
  },
};

export default function RootNavigator() {
  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: '#F5F0E8' },
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Draw" component={DrawScreen} />
        <Stack.Screen name="Result" component={ResultScreen} />
        <Stack.Screen name="History" component={HistoryScreen} />
        <Stack.Screen name="HistoryDetail" component={HistoryDetailScreen} />
        <Stack.Screen name="Encyclopedia" component={EncyclopediaScreen} />
        <Stack.Screen name="CardDetail" component={CardDetailScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
