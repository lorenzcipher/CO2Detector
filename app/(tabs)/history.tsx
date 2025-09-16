import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useColorScheme,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LineChart } from 'react-native-chart-kit';
import { useCO2 } from '@/contexts/CO2Context';

export default function HistoryScreen() {
  const colorScheme = useColorScheme();
  const { historicalData, settings } = useCO2();
  const screenWidth = Dimensions.get('window').width;

  const chartData = useMemo(() => {
    if (historicalData.length === 0) return null;

    // Get last 20 readings for the chart
    const recentData = historicalData.slice(-20);
    const co2_1_data = recentData.map(reading => Math.max(0, reading.co2_1));
    const co2_2_data = recentData.map(reading => Math.max(0, reading.co2_2));
    const labels = recentData.map((reading, index) => {
      if (index % 4 === 0) {
        const date = new Date(reading.timestamp * 1000);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
      return '';
    });

    return {
      labels,
      datasets: [
        {
          data: co2_1_data,
          color: () => '#10B981',
          strokeWidth: 2,
        },
        {
          data: co2_2_data,
          color: () => '#3B82F6',
          strokeWidth: 2,
        },
      ],
      legend: ['Sensor 1', 'Sensor 2'],
    };
  }, [historicalData]);

  const getStatistics = useMemo(() => {
    if (historicalData.length === 0) return null;

    const recentReadings = historicalData.slice(-50); // Last 50 readings
    const allCO2Values = recentReadings.flatMap(reading => [reading.co2_1, reading.co2_2])
      .filter(value => value > 0);

    if (allCO2Values.length === 0) return null;

    const avg = allCO2Values.reduce((sum, val) => sum + val, 0) / allCO2Values.length;
    const max = Math.max(...allCO2Values);
    const min = Math.min(...allCO2Values);

    const goodReadings = allCO2Values.filter(val => val < settings.lowThreshold).length;
    const moderateReadings = allCO2Values.filter(val => 
      val >= settings.lowThreshold && val < settings.highThreshold
    ).length;
    const highReadings = allCO2Values.filter(val => val >= settings.highThreshold).length;

    return {
      average: Math.round(avg),
      maximum: max,
      minimum: min,
      goodPercentage: Math.round((goodReadings / allCO2Values.length) * 100),
      moderatePercentage: Math.round((moderateReadings / allCO2Values.length) * 100),
      highPercentage: Math.round((highReadings / allCO2Values.length) * 100),
      totalReadings: allCO2Values.length,
    };
  }, [historicalData, settings.lowThreshold, settings.highThreshold]);

  const backgroundColor = colorScheme === 'dark' ? '#111827' : '#F9FAFB';
  const textColor = colorScheme === 'dark' ? '#E5E7EB' : '#374151';
  const secondaryTextColor = colorScheme === 'dark' ? '#9CA3AF' : '#6B7280';
  const cardColor = colorScheme === 'dark' ? '#1F2937' : '#FFFFFF';

  const chartConfig = {
    backgroundColor: cardColor,
    backgroundGradientFrom: cardColor,
    backgroundGradientTo: cardColor,
    color: (opacity = 1) => colorScheme === 'dark' ? `rgba(229, 231, 235, ${opacity})` : `rgba(55, 65, 81, ${opacity})`,
    labelColor: () => textColor,
    style: {
      borderRadius: 16,
    },
    propsForVerticalLabels: {
      fontSize: 10,
    },
    propsForHorizontalLabels: {
      fontSize: 10,
    },
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: textColor }]}>
            Historical Data
          </Text>
          <Text style={[styles.subtitle, { color: secondaryTextColor }]}>
            CO2 trends and statistics
          </Text>
        </View>

        {chartData && (
          <View style={[styles.chartCard, { backgroundColor: cardColor }]}>
            <Text style={[styles.cardTitle, { color: textColor }]}>
              CO2 Levels Over Time
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <LineChart
                data={chartData}
                width={Math.max(screenWidth - 32, 400)}
                height={220}
                chartConfig={chartConfig}
                bezier
                style={styles.chart}
                withHorizontalLabels={true}
                withVerticalLabels={true}
                withShadow={false}
                withDots={false}
                fromZero={false}
              />
            </ScrollView>
          </View>
        )}

        {getStatistics && (
          <View style={[styles.statsCard, { backgroundColor: cardColor }]}>
            <Text style={[styles.cardTitle, { color: textColor }]}>
              Statistics
            </Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: textColor }]}>
                  {getStatistics.average}
                </Text>
                <Text style={[styles.statLabel, { color: secondaryTextColor }]}>
                  Average ppm
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: textColor }]}>
                  {getStatistics.maximum}
                </Text>
                <Text style={[styles.statLabel, { color: secondaryTextColor }]}>
                  Max ppm
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: textColor }]}>
                  {getStatistics.minimum}
                </Text>
                <Text style={[styles.statLabel, { color: secondaryTextColor }]}>
                  Min ppm
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: textColor }]}>
                  {getStatistics.totalReadings}
                </Text>
                <Text style={[styles.statLabel, { color: secondaryTextColor }]}>
                  Total Readings
                </Text>
              </View>
            </View>
          </View>
        )}

        {getStatistics && (
          <View style={[styles.qualityCard, { backgroundColor: cardColor }]}>
            <Text style={[styles.cardTitle, { color: textColor }]}>
              Air Quality Distribution
            </Text>
            <View style={styles.qualityItem}>
              <View style={[styles.qualityIndicator, { backgroundColor: '#10B981' }]} />
              <Text style={[styles.qualityLabel, { color: textColor }]}>
                Good (&lt;{settings.lowThreshold} ppm)
              </Text>
              <Text style={[styles.qualityPercentage, { color: textColor }]}>
                {getStatistics.goodPercentage}%
              </Text>
            </View>
            <View style={styles.qualityItem}>
              <View style={[styles.qualityIndicator, { backgroundColor: '#F59E0B' }]} />
              <Text style={[styles.qualityLabel, { color: textColor }]}>
                Moderate ({settings.lowThreshold}-{settings.highThreshold} ppm)
              </Text>
              <Text style={[styles.qualityPercentage, { color: textColor }]}>
                {getStatistics.moderatePercentage}%
              </Text>
            </View>
            <View style={styles.qualityItem}>
              <View style={[styles.qualityIndicator, { backgroundColor: '#EF4444' }]} />
              <Text style={[styles.qualityLabel, { color: textColor }]}>
                High (&gt;{settings.highThreshold} ppm)
              </Text>
              <Text style={[styles.qualityPercentage, { color: textColor }]}>
                {getStatistics.highPercentage}%
              </Text>
            </View>
          </View>
        )}

        {historicalData.length === 0 && (
          <View style={[styles.noDataCard, { backgroundColor: cardColor }]}>
            <Text style={[styles.noDataText, { color: secondaryTextColor }]}>
              No historical data available yet.{'\n'}
              Connect to your ESP32 device to start collecting data.
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
  chartCard: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statsCard: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  qualityCard: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 16,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  qualityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  qualityIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  qualityLabel: {
    flex: 1,
    fontSize: 14,
  },
  qualityPercentage: {
    fontSize: 14,
    fontWeight: '600',
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
    lineHeight: 24,
  },
});