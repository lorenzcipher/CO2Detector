import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Client, Message } from 'paho-mqtt';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export interface CO2Reading {
  timestamp: number;
  co2_1: number;
  co2_2: number;
  wifi_rssi: number;
  heap_free: number;
  device: string;
}

export interface CO2Settings {
  lowThreshold: number;
  highThreshold: number;
  notificationsEnabled: boolean;
  autoRefresh: boolean;
  refreshInterval: number;
}

interface CO2ContextType {
  currentReading: CO2Reading | null;
  isConnected: boolean;
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
  historicalData: CO2Reading[];
  settings: CO2Settings;
  updateSettings: (newSettings: Partial<CO2Settings>) => void;
  reconnect: () => void;
}

const CO2Context = createContext<CO2ContextType | undefined>(undefined);

const DEFAULT_SETTINGS: CO2Settings = {
  lowThreshold: 800,
  highThreshold: 1200,
  notificationsEnabled: true,
  autoRefresh: true,
  refreshInterval: 10000,
};

// MQTT configuration from your ESP32
const MQTT_CONFIG = {
  host: '495e05bee6cb40cd97eeb41fc597850e.s1.eu.hivemq.cloud',
  port: 8884, // WebSocket port
  clientId: `mobile-app-${Math.random().toString(16).substr(2, 8)}`,
  username: 'esp32-device1',
  password: 'Password@2025',
  topic: 'sensors/esp32-co2-01/data',
  useSSL: true,
};

export function CO2Provider({ children }: { children: React.ReactNode }) {
  const [currentReading, setCurrentReading] = useState<CO2Reading | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  const [historicalData, setHistoricalData] = useState<CO2Reading[]>([]);
  const [settings, setSettings] = useState<CO2Settings>(DEFAULT_SETTINGS);
  const [mqttClient, setMqttClient] = useState<Client | null>(null);

  // Load settings and historical data on app start
  useEffect(() => {
    loadSettings();
    loadHistoricalData();
    if (Platform.OS !== 'web') {
      setupNotifications();
    }
  }, []);

  // Connect to MQTT when component mounts
  useEffect(() => {
    connectToMQTT();
    return () => {
      if (mqttClient && mqttClient.isConnected()) {
        mqttClient.disconnect();
      }
    };
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('co2_settings');
      if (savedSettings) {
        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(savedSettings) });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const loadHistoricalData = async () => {
    try {
      const savedData = await AsyncStorage.getItem('co2_historical_data');
      if (savedData) {
        const data = JSON.parse(savedData);
        // Keep only last 100 readings to prevent storage overflow
        setHistoricalData(data.slice(-100));
      }
    } catch (error) {
      console.error('Error loading historical data:', error);
    }
  };

  const setupNotifications = async () => {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.log('Notification permissions not granted');
        return;
      }

      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
        }),
      });
    } catch (error) {
      console.error('Error setting up notifications:', error);
    }
  };

  const connectToMQTT = useCallback(() => {
    setConnectionStatus('connecting');
    
    const client = new Client(
      `wss://${MQTT_CONFIG.host}:${MQTT_CONFIG.port}/mqtt`,
      MQTT_CONFIG.clientId
    );

    client.onConnectionLost = (responseObject) => {
      console.log('MQTT connection lost:', responseObject.errorMessage);
      setIsConnected(false);
      setConnectionStatus('disconnected');
      
      // Auto-reconnect after 5 seconds
      setTimeout(() => {
        connectToMQTT();
      }, 5000);
    };

    client.onMessageArrived = (message: Message) => {
      try {
        const data: CO2Reading = JSON.parse(message.payloadString);
        setCurrentReading(data);
        
        // Add to historical data
        setHistoricalData(prev => {
          const newData = [...prev, data].slice(-100); // Keep last 100 readings
          // Save to storage
          AsyncStorage.setItem('co2_historical_data', JSON.stringify(newData));
          return newData;
        });

        // Check for high CO2 levels and send notification
        if (settings.notificationsEnabled) {
          const maxCO2 = Math.max(data.co2_1, data.co2_2);
          if (maxCO2 > settings.highThreshold) {
            sendHighCO2Notification(maxCO2);
          }
        }
      } catch (error) {
        console.error('Error parsing MQTT message:', error);
      }
    };

    const connectOptions = {
      userName: MQTT_CONFIG.username,
      password: MQTT_CONFIG.password,
      useSSL: MQTT_CONFIG.useSSL,
      onSuccess: () => {
        console.log('MQTT connected successfully');
        setIsConnected(true);
        setConnectionStatus('connected');
        client.subscribe(MQTT_CONFIG.topic, { qos: 0 });
      },
      onFailure: (error: any) => {
        console.log('MQTT connection failed:', error);
        setIsConnected(false);
        setConnectionStatus('error');
        
        // Retry connection after 10 seconds
        setTimeout(() => {
          connectToMQTT();
        }, 10000);
      },
    };

    try {
      client.connect(connectOptions);
      setMqttClient(client);
    } catch (error) {
      console.error('MQTT connection error:', error);
      setConnectionStatus('error');
    }
  }, [settings.notificationsEnabled, settings.highThreshold]);

  const sendHighCO2Notification = async (co2Level: number) => {
    if (Platform.OS === 'web') {
      // Use browser notifications for web
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('High CO2 Level Alert!', {
          body: `CO2 level is ${co2Level} ppm. Please ventilate the area.`,
          icon: '/favicon.ico', // Optional: add an icon
        });
      } else if ('Notification' in window && Notification.permission === 'default') {
        // Request permission first
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          new Notification('High CO2 Level Alert!', {
            body: `CO2 level is ${co2Level} ppm. Please ventilate the area.`,
            icon: '/favicon.ico',
          });
        }
      } else {
        // Fallback: log to console or show in-app notification
        console.warn(`High CO2 Alert: ${co2Level} ppm - Please ventilate the area.`);
      }
    } else {
      // Use Expo notifications for mobile
      try {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'High CO2 Level Alert!',
            body: `CO2 level is ${co2Level} ppm. Please ventilate the area.`,
            sound: true,
          },
          trigger: null,
        });
      } catch (error) {
        console.error('Error sending notification:', error);
      }
    }
  };

  const updateSettings = async (newSettings: Partial<CO2Settings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    try {
      await AsyncStorage.setItem('co2_settings', JSON.stringify(updatedSettings));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const reconnect = () => {
    if (mqttClient && mqttClient.isConnected()) {
      mqttClient.disconnect();
    }
    setTimeout(() => {
      connectToMQTT();
    }, 1000);
  };

  return (
    <CO2Context.Provider
      value={{
        currentReading,
        isConnected,
        connectionStatus,
        historicalData,
        settings,
        updateSettings,
        reconnect,
      }}
    >
      {children}
    </CO2Context.Provider>
  );
}

export const useCO2 = () => {
  const context = useContext(CO2Context);
  if (context === undefined) {
    throw new Error('useCO2 must be used within a CO2Provider');
  }
  return context;
};