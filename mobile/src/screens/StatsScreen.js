import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSettings } from '../contexts/SettingsContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

export default function StatsScreen({ navigation }) {
  const { settings } = useSettings();
  const [stats, setStats] = useState({
    totalDistance: 34,
    totalTime: 40,
    maxSpeed: 60,
    avgSpeed: 55,
    alertsReceived: 2,
    trips: [{
      date: new Date("2025-12-21").toISOString(),
       distance: 34000,
      duration: 3600,
      avgSpeed:55,
    }],
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const savedStats = await AsyncStorage.getItem('tripStats');
      if (savedStats) {
        setStats(JSON.parse(savedStats));
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const formatDistance = (meters) => {
    if (settings.speedUnit === 'mph') {
      const miles = meters * 0.000621371;
      return `${miles.toFixed(2)} mi`;
    }
    const km = meters / 1000;
    return `${km.toFixed(2)} km`;
  };

  const formatSpeed = (kmh) => {
    if (settings.speedUnit === 'mph') {
      return `${Math.round(kmh * 0.621371)} mph`;
    }
    return `${Math.round(kmh)} km/h`;
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const resetStats = () => {
    const emptyStats = {
      totalDistance: 34000,
      totalTime: 3600,
      maxSpeed: 60,
      avgSpeed: 65,
      alertsReceived: 4,
      trips: [{
         date: new Date("2025-12-21").toISOString(),
       distance: 34000,
      duration: 3600,
      avgSpeed:55,
      }],
    };
    setStats(emptyStats);
    AsyncStorage.setItem('tripStats', JSON.stringify(emptyStats));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Trip Statistics</Text>
        <TouchableOpacity onPress={resetStats} style={styles.resetButton}>
          <Ionicons name="refresh" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Summary Cards */}
        <View style={styles.summaryGrid}>
          <View style={styles.summaryCard}>
            <View style={[styles.summaryIcon, { backgroundColor: '#00d4ff20' }]}>
              <Ionicons name="speedometer" size={32} color="#00d4ff" />
            </View>
            <Text style={styles.summaryValue}>{formatSpeed(stats.maxSpeed)}</Text>
            <Text style={styles.summaryLabel}>Max Speed</Text>
          </View>

          <View style={styles.summaryCard}>
            <View style={[styles.summaryIcon, { backgroundColor: '#4CAF5020' }]}>
              <Ionicons name="navigate" size={32} color="#4CAF50" />
            </View>
            <Text style={styles.summaryValue}>{formatDistance(stats.totalDistance)}</Text>
            <Text style={styles.summaryLabel}>Total Distance</Text>
          </View>

          <View style={styles.summaryCard}>
            <View style={[styles.summaryIcon, { backgroundColor: '#ff980020' }]}>
              <Ionicons name="time" size={32} color="#ff9800" />
            </View>
            <Text style={styles.summaryValue}>{formatTime(stats.totalTime)}</Text>
            <Text style={styles.summaryLabel}>Total Time</Text>
          </View>

          <View style={styles.summaryCard}>
            <View style={[styles.summaryIcon, { backgroundColor: '#ff6b6b20' }]}>
              <Ionicons name="warning" size={32} color="#ff6b6b" />
            </View>
            <Text style={styles.summaryValue}>{stats.alertsReceived}</Text>
            <Text style={styles.summaryLabel}>Alerts</Text>
          </View>
        </View>

        {/* Average Speed */}
        <View style={styles.avgSpeedCard}>
          <View style={styles.avgSpeedHeader}>
            <Ionicons name="stats-chart" size={24} color="#00d4ff" />
            <Text style={styles.avgSpeedTitle}>Average Speed</Text>
          </View>
          <Text style={styles.avgSpeedValue}>{formatSpeed(stats.avgSpeed)}</Text>
        </View>

        {/* Recent Trips */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Trips</Text>
          {stats.trips.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="car-outline" size={48} color="#ccc" />
              <Text style={styles.emptyText}>No trips recorded yet</Text>
              <Text style={styles.emptySubtext}>Start driving to see your trip statistics</Text>
            </View>
          ) : (
            stats.trips.slice(0, 5).map((trip, index) => (
              <View key={index} style={styles.tripCard}>
                <View style={styles.tripHeader}>
                  <Ionicons name="car" size={20} color="#00d4ff" />
                  <Text style={styles.tripDate}>
                    {new Date(trip.date).toLocaleDateString()}
                  </Text>
                </View>
                <View style={styles.tripStats}>
                  <View style={styles.tripStatItem}>
                    <Text style={styles.tripStatValue}>{formatDistance(trip.distance)}</Text>
                    <Text style={styles.tripStatLabel}>Distance</Text>
                  </View>
                  <View style={styles.tripStatItem}>
                    <Text style={styles.tripStatValue}>{formatTime(trip.duration)}</Text>
                    <Text style={styles.tripStatLabel}>Duration</Text>
                  </View>
                  <View style={styles.tripStatItem}>
                    <Text style={styles.tripStatValue}>{formatSpeed(trip.avgSpeed)}</Text>
                    <Text style={styles.tripStatLabel}>Avg Speed</Text>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1a1a2e',
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: 50,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  resetButton: {
    padding: 5,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
    marginBottom: 20,
  },
  summaryCard: {
    width: (width - 55) / 2,
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
  },
  avgSpeedCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avgSpeedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  avgSpeedTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 10,
  },
  avgSpeedValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#00d4ff',
  },
  section: {
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#fff',
    borderRadius: 15,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginTop: 15,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
    textAlign: 'center',
  },
  tripCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tripHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  tripDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginLeft: 10,
  },
  tripStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  tripStatItem: {
    alignItems: 'center',
  },
  tripStatValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00d4ff',
  },
  tripStatLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
});

