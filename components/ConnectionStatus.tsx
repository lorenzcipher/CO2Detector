import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react-native';

interface ConnectionStatusProps {
  status: 'connecting' | 'connected' | 'disconnected' | 'error';
  onReconnect: () => void;
}

export function ConnectionStatus({ status, onReconnect }: ConnectionStatusProps) {
  const colorScheme = useColorScheme();
  
  const getStatusConfig = () => {
    switch (status) {
      case 'connected':
        return {
          color: '#10B981',
          icon: Wifi,
          text: 'Connected to ESP32',
          showReconnect: false,
        };
      case 'connecting':
        return {
          color: '#F59E0B',
          icon: RefreshCw,
          text: 'Connecting...',
          showReconnect: false,
        };
      case 'disconnected':
        return {
          color: '#6B7280',
          icon: WifiOff,
          text: 'Disconnected',
          showReconnect: true,
        };
      case 'error':
        return {
          color: '#EF4444',
          icon: WifiOff,
          text: 'Connection Error',
          showReconnect: true,
        };
      default:
        return {
          color: '#6B7280',
          icon: WifiOff,
          text: 'Unknown Status',
          showReconnect: true,
        };
    }
  };

  const config = getStatusConfig();
  const IconComponent = config.icon;
  const textColor = colorScheme === 'dark' ? '#E5E7EB' : '#374151';
  const bgColor = colorScheme === 'dark' ? '#1F2937' : '#F9FAFB';

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <View style={styles.statusInfo}>
        <IconComponent 
          size={16} 
          color={config.color} 
          style={status === 'connecting' ? styles.spinning : undefined}
        />
        <Text style={[styles.statusText, { color: textColor }]}>
          {config.text}
        </Text>
      </View>
      {config.showReconnect && (
        <TouchableOpacity 
          style={[styles.reconnectButton, { borderColor: config.color }]}
          onPress={onReconnect}
        >
          <Text style={[styles.reconnectText, { color: config.color }]}>
            Reconnect
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    margin: 16,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  statusInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  reconnectButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderRadius: 6,
  },
  reconnectText: {
    fontSize: 12,
    fontWeight: '600',
  },
  spinning: {
    // Note: In a real app, you'd use react-native-reanimated for smooth rotation
    transform: [{ rotate: '45deg' }],
  },
});