import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface CO2CardProps {
  title: string;
  value: number;
  isError?: boolean;
}

export function CO2Card({ title, value, isError }: CO2CardProps) {
  const colorScheme = useColorScheme();
  
  const getColorScheme = () => {
    if (isError || value < 0) {
      return {
        gradient: ['#EF4444', '#DC2626'],
        text: '#FFFFFF',
        bg: colorScheme === 'dark' ? '#1F2937' : '#FFFFFF',
        border: '#EF4444',
      };
    }
    
    if (value < 800) {
      return {
        gradient: ['#10B981', '#059669'],
        text: '#FFFFFF',
        bg: colorScheme === 'dark' ? '#1F2937' : '#FFFFFF',
        border: '#10B981',
      };
    } else if (value < 1200) {
      return {
        gradient: ['#F59E0B', '#D97706'],
        text: '#FFFFFF',
        bg: colorScheme === 'dark' ? '#1F2937' : '#FFFFFF',
        border: '#F59E0B',
      };
    } else {
      return {
        gradient: ['#EF4444', '#DC2626'],
        text: '#FFFFFF',
        bg: colorScheme === 'dark' ? '#1F2937' : '#FFFFFF',
        border: '#EF4444',
      };
    }
  };

  const colors = getColorScheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.bg, borderColor: colors.border }]}>
      <Text style={[styles.title, { color: colorScheme === 'dark' ? '#E5E7EB' : '#374151' }]}>
        {title}
      </Text>
      <LinearGradient
        colors={colors.gradient}
        style={styles.valueContainer}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={[styles.value, { color: colors.text }]}>
          {isError || value < 0 ? 'Error' : `${value}`}
        </Text>
        {!isError && value >= 0 && (
          <Text style={[styles.unit, { color: colors.text }]}>ppm</Text>
        )}
      </LinearGradient>
      <View style={[styles.statusDot, { backgroundColor: colors.gradient[0] }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 8,
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    position: 'relative',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  valueContainer: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
  },
  value: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  unit: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
  },
  statusDot: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});