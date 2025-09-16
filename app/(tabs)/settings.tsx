import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TextInput,
  TouchableOpacity,
  Alert,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCO2 } from '@/contexts/CO2Context';
import { Bell, Wifi, TriangleAlert as AlertTriangle, Save } from 'lucide-react-native';

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const { settings, updateSettings, connectionStatus } = useCO2();
  
  const [localSettings, setLocalSettings] = useState(settings);
  const [hasChanges, setHasChanges] = useState(false);

  const backgroundColor = colorScheme === 'dark' ? '#111827' : '#F9FAFB';
  const textColor = colorScheme === 'dark' ? '#E5E7EB' : '#374151';
  const secondaryTextColor = colorScheme === 'dark' ? '#9CA3AF' : '#6B7280';
  const cardColor = colorScheme === 'dark' ? '#1F2937' : '#FFFFFF';
  const borderColor = colorScheme === 'dark' ? '#374151' : '#E5E7EB';

  const handleSettingChange = (key: keyof typeof settings, value: any) => {
    const newSettings = { ...localSettings, [key]: value };
    setLocalSettings(newSettings);
    setHasChanges(true);
  };

  const saveSettings = () => {
    // Validate settings
    if (localSettings.lowThreshold >= localSettings.highThreshold) {
      Alert.alert(
        'Invalid Settings',
        'Low threshold must be less than high threshold.',
        [{ text: 'OK' }]
      );
      return;
    }

    if (localSettings.refreshInterval < 5000) {
      Alert.alert(
        'Invalid Settings',
        'Refresh interval must be at least 5 seconds.',
        [{ text: 'OK' }]
      );
      return;
    }

    updateSettings(localSettings);
    setHasChanges(false);
    Alert.alert(
      'Settings Saved',
      'Your settings have been updated successfully.',
      [{ text: 'OK' }]
    );
  };

  const resetSettings = () => {
    Alert.alert(
      'Reset Settings',
      'Are you sure you want to reset all settings to default values?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            const defaultSettings = {
              lowThreshold: 800,
              highThreshold: 1200,
              notificationsEnabled: true,
              autoRefresh: true,
              refreshInterval: 10000,
            };
            setLocalSettings(defaultSettings);
            setHasChanges(true);
          },
        },
      ]
    );
  };

  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'Connected to ESP32';
      case 'connecting':
        return 'Connecting...';
      case 'disconnected':
        return 'Disconnected';
      case 'error':
        return 'Connection Error';
      default:
        return 'Unknown';
    }
  };

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return '#10B981';
      case 'connecting':
        return '#F59E0B';
      case 'disconnected':
        return '#6B7280';
      case 'error':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: textColor }]}>
            Settings
          </Text>
          <Text style={[styles.subtitle, { color: secondaryTextColor }]}>
            Configure your CO2 monitoring preferences
          </Text>
        </View>

        {/* Connection Status */}
        <View style={[styles.section, { backgroundColor: cardColor }]}>
          <View style={styles.sectionHeader}>
            <Wifi size={20} color={getConnectionStatusColor()} />
            <Text style={[styles.sectionTitle, { color: textColor }]}>
              Connection Status
            </Text>
          </View>
          <View style={styles.statusRow}>
            <Text style={[styles.statusText, { color: textColor }]}>
              {getConnectionStatusText()}
            </Text>
            <View style={[styles.statusDot, { backgroundColor: getConnectionStatusColor() }]} />
          </View>
        </View>

        {/* Notification Settings */}
        <View style={[styles.section, { backgroundColor: cardColor }]}>
          <View style={styles.sectionHeader}>
            <Bell size={20} color={textColor} />
            <Text style={[styles.sectionTitle, { color: textColor }]}>
              Notifications
            </Text>
          </View>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: textColor }]}>
                Enable Notifications
              </Text>
              <Text style={[styles.settingDescription, { color: secondaryTextColor }]}>
                Receive alerts for high CO2 levels
              </Text>
            </View>
            <Switch
              value={localSettings.notificationsEnabled}
              onValueChange={(value) => handleSettingChange('notificationsEnabled', value)}
              trackColor={{ false: borderColor, true: '#10B981' }}
              thumbColor={localSettings.notificationsEnabled ? '#FFFFFF' : '#F3F4F6'}
            />
          </View>
        </View>

        {/* Threshold Settings */}
        <View style={[styles.section, { backgroundColor: cardColor }]}>
          <View style={styles.sectionHeader}>
            <AlertTriangle size={20} color={textColor} />
            <Text style={[styles.sectionTitle, { color: textColor }]}>
              CO2 Thresholds
            </Text>
          </View>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: textColor }]}>
                Low Threshold (ppm)
              </Text>
              <Text style={[styles.settingDescription, { color: secondaryTextColor }]}>
                Below this level is considered good air quality
              </Text>
            </View>
            <TextInput
              style={[styles.numberInput, { 
                backgroundColor: backgroundColor, 
                color: textColor,
                borderColor: borderColor,
              }]}
              value={String(localSettings.lowThreshold)}
              onChangeText={(text) => {
                const value = parseInt(text) || 0;
                handleSettingChange('lowThreshold', value);
              }}
              keyboardType="numeric"
              placeholder="800"
              placeholderTextColor={secondaryTextColor}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: textColor }]}>
                High Threshold (ppm)
              </Text>
              <Text style={[styles.settingDescription, { color: secondaryTextColor }]}>
                Above this level triggers notifications
              </Text>
            </View>
            <TextInput
              style={[styles.numberInput, { 
                backgroundColor: backgroundColor, 
                color: textColor,
                borderColor: borderColor,
              }]}
              value={String(localSettings.highThreshold)}
              onChangeText={(text) => {
                const value = parseInt(text) || 0;
                handleSettingChange('highThreshold', value);
              }}
              keyboardType="numeric"
              placeholder="1200"
              placeholderTextColor={secondaryTextColor}
            />
          </View>
        </View>

        {/* Refresh Settings */}
        <View style={[styles.section, { backgroundColor: cardColor }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>
              Auto-Refresh
            </Text>
          </View>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: textColor }]}>
                Enable Auto-Refresh
              </Text>
              <Text style={[styles.settingDescription, { color: secondaryTextColor }]}>
                Automatically update readings
              </Text>
            </View>
            <Switch
              value={localSettings.autoRefresh}
              onValueChange={(value) => handleSettingChange('autoRefresh', value)}
              trackColor={{ false: borderColor, true: '#10B981' }}
              thumbColor={localSettings.autoRefresh ? '#FFFFFF' : '#F3F4F6'}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: textColor }]}>
                Refresh Interval (seconds)
              </Text>
              <Text style={[styles.settingDescription, { color: secondaryTextColor }]}>
                How often to check for new data
              </Text>
            </View>
            <TextInput
              style={[styles.numberInput, { 
                backgroundColor: backgroundColor, 
                color: textColor,
                borderColor: borderColor,
              }]}
              value={String(localSettings.refreshInterval / 1000)}
              onChangeText={(text) => {
                const value = (parseInt(text) || 0) * 1000;
                handleSettingChange('refreshInterval', value);
              }}
              keyboardType="numeric"
              placeholder="10"
              placeholderTextColor={secondaryTextColor}
              editable={localSettings.autoRefresh}
            />
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          {hasChanges && (
            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: '#10B981' }]}
              onPress={saveSettings}
            >
              <Save size={20} color="#FFFFFF" />
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.resetButton, { backgroundColor: cardColor, borderColor }]}
            onPress={resetSettings}
          >
            <Text style={[styles.resetButtonText, { color: textColor }]}>
              Reset to Defaults
            </Text>
          </TouchableOpacity>
        </View>
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
  section: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusText: {
    fontSize: 16,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 12,
    lineHeight: 16,
  },
  numberInput: {
    width: 80,
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    textAlign: 'center',
  },
  buttonContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  resetButton: {
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
});