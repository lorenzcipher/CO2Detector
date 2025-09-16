import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  useColorScheme,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCO2 } from '@/contexts/CO2Context';
import { CO2Card } from '@/components/CO2Card';
import { ConnectionStatus } from '@/components/ConnectionStatus';
import { TriangleAlert as AlertTriangle, Thermometer } from 'lucide-react-native';

export default function MonitorScreen() {
  const colorScheme = useColorScheme();
  const { 
    currentReading, 
    isConnected, 
    connectionStatus, 
    settings, 
    reconnect 
  } = useCO2();

  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    reconnect();
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, [reconnect]);

  const getOverallStatus = () => {
    if (!currentReading) return null;
    
    const maxCO2 = Math.max(currentReading.co2_1, currentReading.co2_2);
    
    if (maxCO2 < 0) {
      return {
        level: 'Error',
        color: '#EF4444',
        description: 'Sensor reading error',
        icon: AlertTriangle,
      };
    } else if (maxCO2 < settings.lowThreshold) {
      return {
        level: 'Good',
        color: '#10B981',
        description: 'Air quality is excellent',
        icon: Thermometer,
      };
    } else if (maxCO2 < settings.highThreshold) {
      return {
        level: 'Moderate',
        color: '#F59E0B',
        description: 'Consider improving ventilation',
        icon: AlertTriangle,
      };
    } else {
      return {
        level: 'High',
        color: '#EF4444',
        description: 'Poor air quality - ventilate immediately',
        icon: AlertTriangle,
      };
    }
  };

  const overallStatus = getOverallStatus();
  const backgroundColor = colorScheme === 'dark' ? '#111827' : '#F9FAFB';
  const textColor = colorScheme === 'dark' ? '#E5E7EB' : '#374151';
  const secondaryTextColor = colorScheme === 'dark' ? '#9CA3AF' : '#6B7280';

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: textColor }]}>
            CO2 Monitor
          </Text>
          <Text style={[styles.subtitle, { color: secondaryTextColor }]}>
            Real-time air quality monitoring
          </Text>
        </View>

        <ConnectionStatus status={connectionStatus} onReconnect={reconnect} />

        {currentReading && (
          <>
            <View style={styles.cardsContainer}>
              <CO2Card
                title="Sensor 1"
                value={currentReading.co2_1}
                isError={currentReading.co2_1 < 0}
              />
              <CO2Card
                title="Sensor 2"
                value={currentReading.co2_2}
                isError={currentReading.co2_2 < 0}
              />
            </View>

            {overallStatus && (
              <View style={[styles.statusCard, { 
                backgroundColor: colorScheme === 'dark' ? '#1F2937' : '#FFFFFF',
                borderColor: overallStatus.color 
              }]}>
                <View style={styles.statusHeader}>
                  <overallStatus.icon size={24} color={overallStatus.color} />
                  <Text style={[styles.statusLevel, { color: overallStatus.color }]}>
                    {overallStatus.level}
                  </Text>
                </View>
                <Text style={[styles.statusDescription, { color: textColor }]}>
                  {overallStatus.description}
                </Text>
              </View>
            )}

            <View style={[styles.infoCard, { 
              backgroundColor: colorScheme === 'dark' ? '#1F2937' : '#FFFFFF' 
            }]}>
              <Text style={[styles.infoTitle, { color: textColor }]}>
                Device Information
              </Text>
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: secondaryTextColor }]}>
                  Last Update:
                </Text>
                <Text style={[styles.infoValue, { color: textColor }]}>
                  {formatTimestamp(currentReading.timestamp)}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: secondaryTextColor }]}>
                  WiFi Signal:
                </Text>
                <Text style={[styles.infoValue, { color: textColor }]}>
                  {currentReading.wifi_rssi} dBm
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: secondaryTextColor }]}>
                  Free Memory:
                </Text>
                <Text style={[styles.infoValue, { color: textColor }]}>
                  {Math.round(currentReading.heap_free / 1024)} KB
                </Text>
              </View>
            </View>
          </>
        )}

        {!currentReading && isConnected && (
          <View style={[styles.noDataCard, { 
            backgroundColor: colorScheme === 'dark' ? '#1F2937' : '#FFFFFF' 
          }]}>
            <Text style={[styles.noDataText, { color: secondaryTextColor }]}>
              Waiting for sensor data...
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
  },
  cardsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 8,
  },
  statusCard: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusLevel: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  statusDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  infoCard: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  noDataCard: {
    margin: 16,
    padding: 32,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  noDataText: {
    fontSize: 16,
    textAlign: 'center',
  },
});