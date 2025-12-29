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
import { pointService } from '../services/pointService';
import { reportService } from '../services/reportService';

import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');



export default function MapScreen({ navigation }) {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [speed, setSpeed] = useState(0);
  const [speedLimit, setSpeedLimit] = useState(50);
  const [alertPoints, setAlertPoints] = useState([]);
  const [reports, setReports] = useState([]);

  const [currentAlert, setCurrentAlert] = useState(null);
  const [isLocationEnabled, setIsLocationEnabled] = useState(false);
  const { user, logout, isGuest } = useAuth();
  const { settings } = useSettings();
  const [lastAlertTime, setLastAlertTime] = useState({});
  //Stat data
  const tripStartTimeRef = React.useRef(null);
  const tripActiveRef = React.useRef(false);
  const lastLocationRef = React.useRef(null);
  const totalDistanceRef = React.useRef(0);
  const maxSpeedRef = React.useRef(0);
  const alertCountRef = React.useRef(0);
  const idleTimerRef = React.useRef(null);

  const [isMapExpanded, setIsMapExpanded] = useState(true);

  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  const [isMapFullScreen, setIsMapFullScreen] = useState(false);

  const [activeTab, setActiveTab] = useState('points'); 




  
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
  }, []);

  const saveTripStats = async () => {
    if (!tripStartTimeRef.current) return;

    const durationSec = Math.floor(
      (Date.now() - tripStartTimeRef.current) / 1000
    );

    const avgSpeed =
      durationSec > 0
        ? (totalDistanceRef.current / durationSec) * 3.6
        : 0;

    const existing = await AsyncStorage.getItem('tripStats');
    const prev = existing ? JSON.parse(existing) : {
      totalDistance: 0,
      totalTime: 0,
      maxSpeed: 0,
      avgSpeed: 0,
      alertsReceived: 0,
      trips: [],
    };

    const newTrip = {
      date: new Date().toISOString(),
      distance: totalDistanceRef.current,
      duration: durationSec,
      avgSpeed,
    };

    const updatedStats = {
      totalDistance: prev.totalDistance + totalDistanceRef.current,
      totalTime: prev.totalTime + durationSec,
      maxSpeed: Math.max(prev.maxSpeed, maxSpeedRef.current),
      avgSpeed:
        prev.totalTime + durationSec > 0
          ? ((prev.totalDistance + totalDistanceRef.current) /
              (prev.totalTime + durationSec)) * 3.6
          : 0,
      alertsReceived: prev.alertsReceived + alertCountRef.current,
      trips: [newTrip, ...prev.trips],
    };

    await AsyncStorage.setItem('tripStats', JSON.stringify(updatedStats));
  };

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
          // 🚀 Start trip
          if (speedKmh > 3 && !tripActiveRef.current) {
            tripActiveRef.current = true;
            if (!tripStartTimeRef.current) {
              tripStartTimeRef.current = Date.now();
            }
          }


          // ⏸ Pause trip if idle
          if (speedKmh <= 3) {
            if (!idleTimerRef.current) {
              idleTimerRef.current = setTimeout(() => {
                tripActiveRef.current = false;
              }, 30000); // 30 sec idle
            }
          } else {
            if (idleTimerRef.current) {
              clearTimeout(idleTimerRef.current);
              idleTimerRef.current = null;
            }
          }

          if (tripActiveRef.current && lastLocationRef.current) {
            const dist = calculateDistance(
              lastLocationRef.current.latitude,
              lastLocationRef.current.longitude,
              latitude,
              longitude
            );
            totalDistanceRef.current += dist;
          }

          lastLocationRef.current = { latitude, longitude };
          if (speedKmh > maxSpeedRef.current) {
            maxSpeedRef.current = speedKmh;
          }


        }
      ).then(subscription => {
        locationSubscription = subscription;
      });

      return () => {
        if (locationSubscription) {
          locationSubscription.remove();
        }
        if (!tripStartTimeRef.current || totalDistanceRef.current < 5) return;
        saveTripStats()
        tripActiveRef.current = false;
        tripStartTimeRef.current = null;
        lastLocationRef.current = null;
        totalDistanceRef.current = 0;
        maxSpeedRef.current = 0;
        alertCountRef.current = 0;

      };
    }
  }, [isLocationEnabled, alertPoints]);

  const handleUpvoteReport = async () => {
    try {
      if (!selectedReport) return;

      await reportService.upvoteReport(selectedReport._id);

      Alert.alert('Thank you!', 'Report upvoted successfully');
      setReportModalVisible(false);

      // Refresh nearby reports
      if (location) {
        fetchNearbyData(location.latitude, location.longitude);
      }
    } catch (error) {
      console.error('Upvote failed:', error);
      Alert.alert('Error', 'Failed to upvote report');
    }
  };

  const handleResolveReport = async () => {
    try {
      if (!selectedReport) return;

      await reportService.deleteReport(selectedReport._id);

      Alert.alert('Resolved', 'Report has been closed');
      setReportModalVisible(false);

      // Refresh reports
      setReports(prev =>
        prev.filter(r => r._id !== selectedReport._id)
      );
    } catch (error) {
      console.error('Delete failed:', error);
      Alert.alert('Error', 'Failed to resolve report');
    }
  };



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

  const fetchNearbyData = async (latitude, longitude) => {
    try {
      const [points, reportsData] = await Promise.all([
        pointService.getNearbyPoints({
          lat: latitude,
          lng: longitude,
          radius: safeSettings.alertRadius || 1500,
        }),
        reportService.getNearbyReports({
          lat: latitude,
          lng: longitude,
          radius: safeSettings.alertRadius || 2000,
        }),
      ]);
      setAlertPoints(points);
      setReports(reportsData);
    } catch (error) {
      console.error('Error fetching nearby data:', error);
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

      // ✅ FETCH POINTS + REPORTS
      fetchNearbyData(latitude, longitude);

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
    alertCountRef.current += 1; 
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
      case 'Speed-Camera':
      case 'Speed Camera':
        return 'camera';

      case 'Speed-Breaker':
      case 'Speed Breaker':
        return 'warning';

      case 'Red-Light':
      case 'Red Light':
        return 'stop-circle';

      case 'Accident':
        return 'car-crash-outline'; // 🚗💥 (fallback to warning if not available)

      case 'Traffic':
        return 'car-outline';

      case 'Road Block':
        return 'close-circle';

      case 'Police Check':
        return 'shield-checkmark';

      case 'Flood':
        return 'water';

      case 'Construction':
        return 'construct';

      case 'Broken Signal':
        return 'alert-circle';

      case 'Hazard':
        return 'alert';

      case 'School Zone':
        return 'school';

      case 'Hospital Zone':
        return 'medical';

      case 'Other':
        return 'information-circle';

      default:
        return 'warning';
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
      {/* <View style={styles.locationContainer}>
        <Ionicons name="location" size={20} color="#4CAF50" />
        <Text style={styles.locationText}>
          {location ? 
            `Lat: ${location.latitude.toFixed(6)}, Lng: ${location.longitude.toFixed(6)}` : 
            'Getting location...'
          }
        </Text>
      </View> */}
      {/* Map Toggle Header */}
      <TouchableOpacity
        style={styles.mapToggle}
        onPress={() => setIsMapExpanded(prev => !prev)}
      >
        <Ionicons
          name={isMapExpanded ? 'chevron-up' : 'chevron-down'}
          size={22}
          color="#333"
        />
        <Text style={styles.mapToggleText}>
          {isMapExpanded ? 'Hide Map' : 'Show Map'}
        </Text>
      </TouchableOpacity>


      {/* Map View */}
      {location && safeSettings.showMap && isMapExpanded && (
        <View style={styles.mapContainer}>
          <TouchableOpacity
            style={styles.fullscreenButtonMap}
            onPress={() => setIsMapFullScreen(true)}
          >
            <Ionicons name="expand" size={22} color="#fff" />
          </TouchableOpacity>

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
            showsUserLocation
            showsMyLocationButton
            followsUserLocation
          >
            {/* User Marker */}
            <Marker
              coordinate={{
                latitude: location.latitude,
                longitude: location.longitude,
              }}
              title="Your Location"
            >
              <Ionicons name="location" size={30} color="#00d4ff" />
            </Marker>

            {/* Alert Points */}
            {alertPoints.map((point, index) => (
              <Marker
                key={`point-${index}`}
                coordinate={{ latitude: point.lat, longitude: point.lng }}
                title={point.name}
              >
                <Ionicons
                  name={getAlertIcon(point.type)}
                  size={25}
                  color={getAlertColor(point.severity)}
                />
              </Marker>
            ))}

            {/* Reports */}
            {reports
              .filter(
                r =>
                  r.location &&
                  Array.isArray(r.location.coordinates) &&
                  r.location.coordinates.length === 2
              )
              .map((report, index) => (
                <Marker
                  key={`report-${report._id || index}`}
                  coordinate={{
                    latitude: report.location.coordinates[1],
                    longitude: report.location.coordinates[0],
                  }}
                  title={report.type}
                >
                  <Ionicons
                    name={getAlertIcon(report.type)}
                    size={22}
                    color="#ff1744"
                  />
                </Marker>
            ))}
          </MapView>
        </View>
      )}


      {/* Alert Points List */}
      <ScrollView
        style={styles.alertListContainer}
        scrollEnabled={!isMapFullScreen}
      >
        {/* 🔀 TAB BAR */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === 'points' && styles.activeTab
            ]}
            onPress={() => setActiveTab('points')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'points' && styles.activeTabText
              ]}
            >
              Alert Points ({alertPoints.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === 'reports' && styles.activeTab
            ]}
            onPress={() => setActiveTab('reports')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'reports' && styles.activeTabText
              ]}
            >
              Reports ({reports.length})
            </Text>
          </TouchableOpacity>
        </View>


        {/* 📍 ALERT POINTS TAB */}
        {activeTab === 'points' && (
          <>
            <Text style={styles.alertListTitle}>Nearby Alert Points</Text>

            {alertPoints.length === 0 && (
              <Text style={styles.emptyText}>No alert points nearby</Text>
            )}

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
          </>
        )}

        {/* 🚨 REPORTS TAB */}
        {activeTab === 'reports' && (
          <>
            <Text style={styles.alertListTitle}>Nearby Reports</Text>

            {reports.length === 0 && (
              <Text style={styles.emptyText}>No reports nearby</Text>
            )}

            {reports.map((report, index) => (
              <View key={report._id || index} style={styles.alertPointItem}>
                <Ionicons
                  name={getAlertIcon(report.type)}
                  size={24}
                  color="#ff1744"
                />

                <View style={styles.alertPointInfo}>
                  <Text style={styles.alertPointName}>
                    {report.label || report.type}
                  </Text>
                  <Text style={styles.alertPointType}>
                    Reported by {report.reportedBy || 'User'}
                  </Text>
                  <Text style={styles.alertPointDetails}>
                    {report.description}
                    {report.upvotes ? ` • votes: ${report.upvotes}` : ''}
                  </Text>
                </View>

                {/* ❗ Action */}
                <TouchableOpacity
                  onPress={() => {
                    setSelectedReport(report);
                    setReportModalVisible(true);
                  }}
                >
                  <Ionicons name="alert-circle" size={26} color="#ff9800" />
                </TouchableOpacity>
              </View>
            ))}
          </>
        )}



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

      {/* 🔥 REPORT CONFIRMATION MODAL — ADD HERE */}
      {reportModalVisible && selectedReport && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Ionicons name="alert-circle" size={40} color="#ff9800" />

            <Text style={styles.modalTitle}>
              Is this situation still the same?
            </Text>

            <Text style={styles.modalSubtitle}>
              {selectedReport.label || selectedReport.type}
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleUpvoteReport}
              >
                <Text style={styles.modalButtonText}>Yes</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.resolveButton]}
                onPress={handleResolveReport}
              >
                <Text style={styles.modalButtonText}>Resolved</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setReportModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* 🗺️ FULL SCREEN MAP — ADD HERE */}
      {isMapFullScreen && location && (
        <View style={styles.fullscreenMapOverlay}>
          <View style={styles.fullscreenMapOverlay}>
            <MapView
              style={styles.fullscreenMap}
              initialRegion={{
                latitude: location.latitude,
                longitude: location.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
              showsUserLocation
              followsUserLocation

              // 🔥 IMPORTANT
              scrollEnabled={true}
              zoomEnabled={true}
              rotateEnabled={true}
              pitchEnabled={true}
              zoomTapEnabled={true}
            >
              {/* User Marker */}
              <Marker
                coordinate={{
                  latitude: location.latitude,
                  longitude: location.longitude,
                }}
              />

              {/* Alert Points */}
              {alertPoints.map((point, index) => (
                <Marker
                  key={`fs-point-${index}`}
                  coordinate={{ latitude: point.lat, longitude: point.lng }}
                >
                  <Ionicons
                    name={getAlertIcon(point.type)}
                    size={26}
                    color={getAlertColor(point.severity)}
                  />
                </Marker>
              ))}

              {/* Reports */}
              {reports
                .filter(r => r?.location?.coordinates?.length === 2)
                .map((report, index) => (
                  <Marker
                    key={`fs-report-${index}`}
                    coordinate={{
                      latitude: report.location.coordinates[1],
                      longitude: report.location.coordinates[0],
                    }}
                  >
                    <Ionicons
                      name={getAlertIcon(report.type)}
                      size={24}
                      color="#ff1744"
                    />
                  </Marker>
              ))}
            </MapView>

            {/* ❌ Close Fullscreen */}
            <TouchableOpacity
              style={styles.closeFullscreenButton}
              onPress={() => setIsMapFullScreen(false)}
            >
              <Ionicons name="close" size={28} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      )}


      
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
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2000,
  },
  modalBox: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginVertical: 10,
    textAlign: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    marginBottom: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    overflow: 'hidden',
  },

  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },

  activeTab: {
    backgroundColor: '#1a1a2e',
  },

  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555',
  },

  activeTabText: {
    color: '#fff',
  },

  emptyText: {
    textAlign: 'center',
    color: '#888',
    fontSize: 12,
    marginVertical: 20,
  },

  modalButtons: {
    flexDirection: 'row',
    marginTop: 20,
  },
  fullscreenButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#000',
    padding: 8,
    borderRadius: 20,
    zIndex: 10,
    opacity: 0.8,
  },
  fullscreenButtonMap: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#000',
    padding: 8,
    borderRadius: 20,
    zIndex: 10,
    opacity: 0.8,
  },

  fullscreenMapOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000',
    zIndex: 3000,
    pointerEvents: 'auto',
  },

  fullscreenMapWrapper: {
    flex: 1,
    pointerEvents: 'auto',
  },


  fullscreenMap: {
    flex: 1,
  },

  closeFullscreenButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: '#000',
    padding: 10,
    borderRadius: 20,
    opacity: 0.8,
  },

  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  confirmButton: {
    backgroundColor: '#4CAF50',
  },
  resolveButton: {
    backgroundColor: '#f44336',
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  cancelButton: {
    marginTop: 15,
  },
  cancelButtonText: {
    color: '#888',
    fontSize: 14,
  },

  mapToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 10,
    paddingVertical: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  mapToggleText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
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
    height: 180,
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