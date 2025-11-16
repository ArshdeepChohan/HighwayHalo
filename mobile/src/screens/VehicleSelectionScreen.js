import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

const { width } = Dimensions.get('window');

export default function VehicleSelectionScreen({ navigation }) {
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const { updateUserPreferences } = useAuth();

  const handleVehicleSelection = async (vehicleType) => {
    setSelectedVehicle(vehicleType);
    
    try {
      const result = await updateUserPreferences({ vehicleType });
      if (result.success) {
        navigation.replace('MainTabs');
      } else {
        // Even if update fails, navigate to main app
        navigation.replace('MainTabs');
      }
    } catch (error) {
      console.error('Error saving vehicle preference:', error);
      // Navigate anyway
      navigation.replace('MainTabs');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="car-sport" size={50} color="#00d4ff" />
        <Text style={styles.title}>What are you driving today?</Text>
        <Text style={styles.subtitle}>Select your vehicle type for personalized alerts</Text>
      </View>

      <View style={styles.vehicleContainer}>
        <TouchableOpacity
          style={[
            styles.vehicleCard,
            selectedVehicle === '2-wheeler' && styles.selectedCard
          ]}
          onPress={() => handleVehicleSelection('2-wheeler')}
        >
          <View style={styles.vehicleIcon}>
            <Ionicons name="bicycle" size={60} color={selectedVehicle === '2-wheeler' ? '#00d4ff' : '#666'} />
          </View>
          <Text style={[
            styles.vehicleTitle,
            selectedVehicle === '2-wheeler' && styles.selectedText
          ]}>
            2-Wheeler
          </Text>
          <Text style={styles.vehicleDescription}>
            Motorcycle, Scooter, Bicycle
          </Text>
          <View style={styles.featuresList}>
            <Text style={styles.featureItem}>• Speed alerts for bikes</Text>
            <Text style={styles.featureItem}>• Lane change warnings</Text>
            <Text style={styles.featureItem}>• Helmet reminders</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.vehicleCard,
            selectedVehicle === '4-wheeler' && styles.selectedCard
          ]}
          onPress={() => handleVehicleSelection('4-wheeler')}
        >
          <View style={styles.vehicleIcon}>
            <Ionicons name="car" size={60} color={selectedVehicle === '4-wheeler' ? '#00d4ff' : '#666'} />
          </View>
          <Text style={[
            styles.vehicleTitle,
            selectedVehicle === '4-wheeler' && styles.selectedText
          ]}>
            4-Wheeler
          </Text>
          <Text style={styles.vehicleDescription}>
            Car, SUV, Truck, Van
          </Text>
          <View style={styles.featuresList}>
            <Text style={styles.featureItem}>• Highway speed limits</Text>
            <Text style={styles.featureItem}>• Parking zone alerts</Text>
            <Text style={styles.featureItem}>• Seatbelt reminders</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.infoContainer}>
        <Ionicons name="information-circle" size={20} color="#666" />
        <Text style={styles.infoText}>
          You can change this preference anytime in settings
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  vehicleContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  vehicleCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 30,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedCard: {
    borderColor: '#00d4ff',
    backgroundColor: '#f0fdff',
  },
  vehicleIcon: {
    marginBottom: 20,
  },
  vehicleTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  selectedText: {
    color: '#00d4ff',
  },
  vehicleDescription: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  featuresList: {
    alignSelf: 'stretch',
  },
  featureItem: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
    textAlign: 'left',
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 10,
    textAlign: 'center',
  },
});


