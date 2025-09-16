import { Tabs } from 'expo-router';
import { Activity, ChartBar as BarChart3, Settings } from 'lucide-react-native';
import { useColorScheme } from 'react-native';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  
  const tintColor = colorScheme === 'dark' ? '#10B981' : '#059669';
  const backgroundColor = colorScheme === 'dark' ? '#111827' : '#FFFFFF';
  const inactiveColor = colorScheme === 'dark' ? '#6B7280' : '#9CA3AF';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor,
          borderTopColor: colorScheme === 'dark' ? '#374151' : '#E5E7EB',
        },
        tabBarActiveTintColor: tintColor,
        tabBarInactiveTintColor: inactiveColor,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Monitor',
          tabBarIcon: ({ size, color }) => (
            <Activity size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ size, color }) => (
            <BarChart3 size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ size, color }) => (
            <Settings size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}