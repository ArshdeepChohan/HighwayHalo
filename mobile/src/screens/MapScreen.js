import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from 'react-native';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { playAlertSound, speakAlert } from '../services/audioService';

const { width, height } = Dimensions.get('window');

export default function MapScreen({ navigation }) {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [speed, setSpeed] = useState(0);
  const [speedLimit, setSpeedLimit] = useState(50);
  const [alertPoints, setAlertPoints] = useState([]);
  const [currentAlert, setCurrentAlert] = useState(null);
  const [isLocationEnabled, setIsLocationEnabled] = useState(false);
  const { user, logout, isGuest } = useAuth();
  const { settings } = useSettings();
  const [lastAlertTime, setLastAlertTime] = useState({});
  
  // Ensure settings are available
  const safeSettings = settings || {
    audioAlerts: true,
    voiceAlerts: true,
    speedUnit: 'kmh',
    alertRadius: 150,
    vibration: true,
    showSpeedLimit: true,
    showMap: true,
  };

  useEffect(() => {
    getLocationPermission();
    fetchAlertPoints();
  }, []);

  useEffect(() => {
    let locationSubscription = null;
    
    if (isLocationEnabled) {
      startLocationTracking();
      // Set up location updates
      Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 1000,
          distanceInterval: 1,
        },
        (newLocation) => {
          const { latitude, longitude, speed: locationSpeed } = newLocation.coords;
          setLocation({ latitude, longitude });
          
          // Calculate speed in km/h
          const speedKmh = locationSpeed ? Math.abs(locationSpeed * 3.6) : 0;
          setSpeed(Math.round(speedKmh));

          // Check for proximity alerts if alert points are loaded
          if (alertPoints.length > 0) {
            checkProximityAlerts(latitude, longitude, speedKmh);
          }
        }
      ).then(subscription => {
        locationSubscription = subscription;
      });

      return () => {
        if (locationSubscription) {
          locationSubscription.remove();
        }
      };
    }
  }, [isLocationEnabled, alertPoints]);

  const getLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        Alert.alert(
          'Location Permission Required',
          'Highway Halo needs location access to provide safety alerts and speed monitoring.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Settings', onPress: () => Location.requestForegroundPermissionsAsync() }
          ]
        );
        return;
      }
      setIsLocationEnabled(true);
    } catch (error) {
      setErrorMsg('Error requesting location permission');
    }
  };

  const fetchAlertPoints = async () => {
    try {
      // Try to get IP from environment or use localhost
      const API_URL = 'http://localhost:3000';
      const response = await fetch(`${API_URL}/api/points`);
      const points = await response.json();
      setAlertPoints(points);
    } catch (error) {
      console.error('Error fetching alert points:', error);
      // Fallback data
      setAlertPoints([
        {
          name: "Speed Camera",
          type: "Speed Camera",
          lat: 30.8600959,
          lng: 75.8610409,
          speedLimit: 40,
          alertDistance: 150,
          severity: "High"
        },
        {
          name: "Speed Breaker",
          type: "Speed Breaker",
          lat: 30.8611150,
          lng: 75.8610131,
          speedLimit: 20,
          alertDistance: 100,
          severity: "High"
        }
      ]);
    }
  };

  const startLocationTracking = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      
      const { latitude, longitude, speed: locationSpeed } = location.coords;
      setLocation({ latitude, longitude });
      
      // Calculate speed in km/h
      const speedKmh = locationSpeed ? Math.abs(locationSpeed * 3.6) : 0;
      setSpeed(Math.round(speedKmh));

      // Check for proximity alerts
      checkProximityAlerts(latitude, longitude, speedKmh);
      
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371000; // Earth's radius in meters
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const checkProximityAlerts = (userLat, userLng, userSpeed) => {
    let nearestAlert = null;
    let minDistance = Infinity;

    alertPoints.forEach(point => {
      const distance = calculateDistance(userLat, userLng, point.lat, point.lng);
      const alertRadius = safeSettings.alertRadius || point.alertDistance;
      
      if (distance <= alertRadius && distance < minDistance) {
        minDistance = distance;
        nearestAlert = {
          ...point,
          distance: Math.round(distance),
          userSpeed: Math.round(userSpeed)
        };
      }
    });

    if (nearestAlert && nearestAlert.distance <= nearestAlert.alertDistance) {
      showAlert(nearestAlert);
    }
  };

  const showAlert = async (alertData) => {
    const alertKey = `${alertData.lat}-${alertData.lng}`;
    const now = Date.now();
    
    // Prevent duplicate alerts within 3 seconds
    if (lastAlertTime[alertKey] && now - lastAlertTime[alertKey] < 3000) {
      return;
    }
    
    setLastAlertTime({ ...lastAlertTime, [alertKey]: now });
    setCurrentAlert(alertData);
    
    // Play audio alert
    if (safeSettings.audioAlerts) {
      await playAlertSound(alertData.severity, safeSettings);
    }
    
    // Voice alert
    if (safeSettings.voiceAlerts) {
      const message = `${alertData.type} ahead, ${alertData.distance} meters away`;
      await speakAlert(message, safeSettings);
    }
    
    setTimeout(() => setCurrentAlert(null), 5000);
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'Speed Camera': return 'camera';
      case 'Speed Breaker': return 'warning';
      case 'Red Light': return 'stop-circle';
      case 'School Zone': return 'school';
      case 'Hospital Zone': return 'medical';
      case 'Construction': return 'construct';
      default: return 'warning';
    }
  };

  const getAlertColor = (severity) => {
    switch (severity) {
      case 'Critical': return '#ff0000';
      case 'High': return '#ff6b6b';
      case 'Medium': return '#ffa726';
      case 'Low': return '#66bb6a';
      default: return '#ffa726';
    }
  };

  const handleLogout = () => {
    if (isGuest) {
      Alert.alert(
        'Exit App',
        'Are you sure you want to exit?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Exit', onPress: logout }
        ]
      );
    } else {
      Alert.alert(
        'Logout',
        'Are you sure you want to logout?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Logout', onPress: logout }
        ]
      );
    }
  };

  if (errorMsg) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="location-off" size={60} color="#ff6b6b" />
        <Text style={styles.errorText}>{errorMsg}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={getLocationPermission}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Highway Halo</Text>
          <Text style={styles.headerSubtitle}>
            {user?.vehicleType || 'Vehicle'} • {user?.username || 'Guest'}
          </Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.headerButton} 
            onPress={() => navigation.navigate('Reports')}
          >
            <Ionicons name="add-circle" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name={isGuest ? "close-outline" : "log-out-outline"} size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Speed Display */}
      <View style={styles.speedContainer}>
        <View style={styles.speedDisplay}>
          <Text style={styles.speedLabel}>Current Speed</Text>
          <Text style={[
            styles.speedValue,
            speed > speedLimit && styles.speedValueWarning
          ]}>
            {safeSettings.speedUnit === 'mph' ? Math.round(speed * 0.621371) : speed}
          </Text>
          <Text style={styles.speedUnit}>
            {safeSettings.speedUnit === 'mph' ? 'mph' : 'km/h'}
          </Text>
        </View>
        {safeSettings.showSpeedLimit && (
          <View style={styles.speedLimitDisplay}>
            <Text style={styles.speedLimitLabel}>Speed Limit</Text>
            <Text style={styles.speedLimitValue}>{speedLimit}</Text>
            <Text style={styles.speedLimitUnit}>km/h</Text>
          </View>
        )}
      </View>

      {/* Location Info */}
      <View style={styles.locationContainer}>
        <Ionicons name="location" size={20} color="#4CAF50" />
        <Text style={styles.locationText}>
          {location ? 
            `Lat: ${location.latitude.toFixed(6)}, Lng: ${location.longitude.toFixed(6)}` : 
            'Getting location...'
          }
        </Text>
      </View>

      {/* Map View */}
      {location && safeSettings.showMap && (
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: location.latitude,
              longitude: location.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
            region={{
              latitude: location.latitude,
              longitude: location.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
            showsUserLocation={true}
            showsMyLocationButton={true}
            followsUserLocation={true}
            mapType="standard"
          >
            <Marker
              coordinate={{
                latitude: location.latitude,
                longitude: location.longitude,
              }}
              title="Your Location"
              description={`Speed: ${speed} km/h`}
            >
              <Ionicons name="location" size={30} color="#00d4ff" />
            </Marker>
            {alertPoints.map((point, index) => (
              <Marker
                key={index}
                coordinate={{
                  latitude: point.lat,
                  longitude: point.lng,
                }}
                title={point.name}
                description={point.type}
              >
                <Ionicons 
                  name={getAlertIcon(point.type)} 
                  size={25} 
                  color={getAlertColor(point.severity)} 
                />
              </Marker>
            ))}
          </MapView>
        </View>
      )}

      {/* Alert Points List */}
      <ScrollView style={styles.alertListContainer}>
        <Text style={styles.alertListTitle}>Nearby Alert Points</Text>
        {alertPoints.map((point, index) => (
          <View key={index} style={styles.alertPointItem}>
            <Ionicons 
              name={getAlertIcon(point.type)} 
              size={24} 
              color={getAlertColor(point.severity)} 
            />
            <View style={styles.alertPointInfo}>
              <Text style={styles.alertPointName}>{point.name}</Text>
              <Text style={styles.alertPointType}>{point.type}</Text>
              <Text style={styles.alertPointDetails}>
                Speed Limit: {point.speedLimit} km/h • Alert: {point.alertDistance}m
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Alert Modal */}
      {currentAlert && (
        <View style={styles.alertContainer}>
          <View style={[
            styles.alertBox,
            { borderColor: getAlertColor(currentAlert.severity) }
          ]}>
            <Ionicons 
              name={getAlertIcon(currentAlert.type)} 
              size={30} 
              color={getAlertColor(currentAlert.severity)} 
            />
            <Text style={styles.alertTitle}>{currentAlert.name}</Text>
            <Text style={styles.alertMessage}>
              {currentAlert.type} - {currentAlert.distance}m away
            </Text>
            {currentAlert.userSpeed > currentAlert.speedLimit && (
              <Text style={styles.speedWarning}>
                ⚠️ Slow down! You're going {currentAlert.userSpeed} km/h
              </Text>
            )}
          </View>
        </View>
      )}

      {/* Status Bar */}
      <View style={styles.statusBar}>
        <View style={styles.statusItem}>
          <Ionicons name="location" size={16} color="#4CAF50" />
          <Text style={styles.statusText}>GPS Active</Text>
        </View>
        <View style={styles.statusItem}>
          <Ionicons name="shield-checkmark" size={16} color="#4CAF50" />
          <Text style={styles.statusText}>Alerts On</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginVertical: 20,
  },
  retryButton: {
    backgroundColor: '#00d4ff',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: 50,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: 8,
    marginRight: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#b0b0b0',
    marginTop: 2,
  },
  logoutButton: {
    padding: 8,
  },
  speedContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  speedDisplay: {
    flex: 1,
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#eee',
  },
  speedLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  speedValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  speedValueWarning: {
    color: '#ff6b6b',
  },
  speedUnit: {
    fontSize: 10,
    color: '#666',
  },
  speedLimitDisplay: {
    flex: 1,
    alignItems: 'center',
  },
  speedLimitLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  speedLimitValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00d4ff',
  },
  speedLimitUnit: {
    fontSize: 10,
    color: '#666',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 15,
    borderRadius: 10,
  },
  locationText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 10,
    flex: 1,
  },
  mapContainer: {
    height: 300,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  map: {
    flex: 1,
  },
  alertListContainer: {
    flex: 1,
    marginHorizontal: 20,
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
  },
  alertListTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  alertPointItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  alertPointInfo: {
    flex: 1,
    marginLeft: 15,
  },
  alertPointName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  alertPointType: {
    fontSize: 12,
    color: '#666',
  },
  alertPointDetails: {
    fontSize: 10,
    color: '#999',
    marginTop: 2,
  },
  alertContainer: {
    position: 'absolute',
    top: 200,
    left: 20,
    right: 20,
    zIndex: 1000,
  },
  alertBox: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    borderWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
    textAlign: 'center',
  },
  alertMessage: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
    textAlign: 'center',
  },
  speedWarning: {
    fontSize: 14,
    color: '#ff6b6b',
    marginTop: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 15,
    padding: 15,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 5,
    fontWeight: '600',
  },
});