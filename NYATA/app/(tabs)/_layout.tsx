import { Tabs } from 'expo-router';
import { colors } from '@/src/theme/tokens';
export default function TabLayout() { return <Tabs screenOptions={{ headerShown: false, tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border }, tabBarActiveTintColor: colors.text, tabBarInactiveTintColor: colors.muted }}><Tabs.Screen name="index" options={{ title: 'Today' }} /><Tabs.Screen name="calendar" options={{ title: 'Calendar' }} /><Tabs.Screen name="tracking" options={{ title: 'Tracking' }} /><Tabs.Screen name="settings" options={{ title: 'Settings' }} /></Tabs>; }

