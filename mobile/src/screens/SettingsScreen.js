import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSettings } from '../contexts/SettingsContext';
import { useAuth } from '../contexts/AuthContext';

export default function SettingsScreen({ navigation }) {
  const { settings, updateSettings } = useSettings();
  const { logout, isGuest } = useAuth();
  const [localSettings, setLocalSettings] = useState(settings);

  const handleToggle = async (key, value) => {
    const newSettings = { ...localSettings, [key]: value };
    setLocalSettings(newSettings);
    await updateSettings({ [key]: value });
  };

  const handleSpeedUnitChange = async () => {
    const newUnit = localSettings.speedUnit === 'kmh' ? 'mph' : 'kmh';
    await handleToggle('speedUnit', newUnit);
  };

  const handleAlertRadiusChange = async (radius) => {
    await handleToggle('alertRadius', radius);
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', onPress: logout, style: 'destructive' }
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Alert Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Alert Settings</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Ionicons name="volume-high" size={24} color="#00d4ff" />
            <View style={styles.settingText}>
              <Text style={styles.settingLabel}>Audio Alerts</Text>
              <Text style={styles.settingDescription}>Play sound for alerts</Text>
            </View>
          </View>
          <Switch
            value={localSettings.audioAlerts}
            onValueChange={(value) => handleToggle('audioAlerts', value)}
            trackColor={{ false: '#ccc', true: '#00d4ff' }}
            thumbColor="#fff"
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Ionicons name="mic" size={24} color="#00d4ff" />
            <View style={styles.settingText}>
              <Text style={styles.settingLabel}>Voice Alerts</Text>
              <Text style={styles.settingDescription}>Announce alerts verbally</Text>
            </View>
          </View>
          <Switch
            value={localSettings.voiceAlerts}
            onValueChange={(value) => handleToggle('voiceAlerts', value)}
            trackColor={{ false: '#ccc', true: '#00d4ff' }}
            thumbColor="#fff"
            disabled={!localSettings.audioAlerts}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Ionicons name="phone-portrait" size={24} color="#00d4ff" />
            <View style={styles.settingText}>
              <Text style={styles.settingLabel}>Vibration</Text>
              <Text style={styles.settingDescription}>Vibrate on alerts</Text>
            </View>
          </View>
          <Switch
            value={localSettings.vibration}
            onValueChange={(value) => handleToggle('vibration', value)}
            trackColor={{ false: '#ccc', true: '#00d4ff' }}
            thumbColor="#fff"
          />
        </View>
      </View>

      {/* Display Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Display Settings</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Ionicons name="moon" size={24} color="#00d4ff" />
            <View style={styles.settingText}>
              <Text style={styles.settingLabel}>Dark Mode</Text>
              <Text style={styles.settingDescription}>Use dark theme</Text>
            </View>
          </View>
          <Switch
            value={localSettings.darkMode}
            onValueChange={(value) => handleToggle('darkMode', value)}
            trackColor={{ false: '#ccc', true: '#00d4ff' }}
            thumbColor="#fff"
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Ionicons name="speedometer" size={24} color="#00d4ff" />
            <View style={styles.settingText}>
              <Text style={styles.settingLabel}>Speed Unit</Text>
              <Text style={styles.settingDescription}>
                Current: {localSettings.speedUnit === 'kmh' ? 'km/h' : 'mph'}
              </Text>
            </View>
          </View>
          <TouchableOpacity onPress={handleSpeedUnitChange} style={styles.changeButton}>
            <Text style={styles.changeButtonText}>Change</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Ionicons name="radio-button-on" size={24} color="#00d4ff" />
            <View style={styles.settingText}>
              <Text style={styles.settingLabel}>Alert Radius</Text>
              <Text style={styles.settingDescription}>
                {localSettings.alertRadius}m warning distance
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.radiusOptions}>
          {[100, 150, 200, 250, 300].map((radius) => (
            <TouchableOpacity
              key={radius}
              style={[
                styles.radiusButton,
                localSettings.alertRadius === radius && styles.radiusButtonActive
              ]}
              onPress={() => handleAlertRadiusChange(radius)}
            >
              <Text
                style={[
                  styles.radiusButtonText,
                  localSettings.alertRadius === radius && styles.radiusButtonTextActive
                ]}
              >
                {radius}m
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Map Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Map Settings</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Ionicons name="map" size={24} color="#00d4ff" />
            <View style={styles.settingText}>
              <Text style={styles.settingLabel}>Show Map</Text>
              <Text style={styles.settingDescription}>Display map view</Text>
            </View>
          </View>
          <Switch
            value={localSettings.showMap}
            onValueChange={(value) => handleToggle('showMap', value)}
            trackColor={{ false: '#ccc', true: '#00d4ff' }}
            thumbColor="#fff"
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Ionicons name="flag" size={24} color="#00d4ff" />
            <View style={styles.settingText}>
              <Text style={styles.settingLabel}>Show Speed Limit</Text>
              <Text style={styles.settingDescription}>Display speed limit signs</Text>
            </View>
          </View>
          <Switch
            value={localSettings.showSpeedLimit}
            onValueChange={(value) => handleToggle('showSpeedLimit', value)}
            trackColor={{ false: '#ccc', true: '#00d4ff' }}
            thumbColor="#fff"
          />
        </View>
      </View>

      {/* Account Settings */}
      {!isGuest && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color="#ff6b6b" />
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* About */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.aboutItem}>
          <Text style={styles.aboutLabel}>Version</Text>
          <Text style={styles.aboutValue}>1.0.0</Text>
        </View>
        <View style={styles.aboutItem}>
          <Text style={styles.aboutLabel}>Highway Halo</Text>
          <Text style={styles.aboutValue}>Your Smart Driving Companion</Text>
        </View>
      </View>
    </ScrollView>
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
  placeholder: {
    width: 34,
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 20,
    paddingVertical: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: 15,
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  settingDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  changeButton: {
    backgroundColor: '#00d4ff',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  changeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  radiusOptions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 15,
    gap: 10,
  },
  radiusButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  radiusButtonActive: {
    backgroundColor: '#00d4ff',
    borderColor: '#00d4ff',
  },
  radiusButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  radiusButtonTextActive: {
    color: '#fff',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ff6b6b',
    marginLeft: 15,
  },
  aboutItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  aboutLabel: {
    fontSize: 14,
    color: '#666',
  },
  aboutValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
});

