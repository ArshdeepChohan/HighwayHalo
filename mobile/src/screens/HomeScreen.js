import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  StatusBar,
} from 'react-native';
// import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

const { width, height } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  const { skipLogin } = useAuth();

  const handleSkipLogin = () => {
    skipLogin();
    navigation.navigate('LocationPermission');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />
      
      <View style={styles.gradient}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Ionicons name="car-sport" size={60} color="#00d4ff" />
            <Text style={styles.logoText}>Highway Halo</Text>
          </View>
          <Text style={styles.tagline}>Your Smart Driving Companion</Text>
        </View>

        {/* Features */}
        <View style={styles.featuresContainer}>
          <View style={styles.featureItem}>
            <Ionicons name="speedometer" size={30} color="#00d4ff" />
            <Text style={styles.featureText}>Speed Monitoring</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="warning" size={30} color="#ff6b6b" />
            <Text style={styles.featureText}>Hazard Alerts</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="location" size={30} color="#4ecdc4" />
            <Text style={styles.featureText}>Real-time Location</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="shield-checkmark" size={30} color="#45b7d1" />
            <Text style={styles.featureText}>Safety First</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.primaryButtonText}>Get Started</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('Signup')}
          >
            <Text style={styles.secondaryButtonText}>Create Account</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleSkipLogin}
          >
            <Text style={styles.skipButtonText}>Skip Login</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Drive Smart, Drive Safe with Highway Halo
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
    backgroundColor: '#1a1a2e',
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 10,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 16,
    color: '#b0b0b0',
    textAlign: 'center',
    marginTop: 10,
  },
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginVertical: 40,
  },
  featureItem: {
    alignItems: 'center',
    width: width * 0.4,
    marginBottom: 30,
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  featureText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 10,
    textAlign: 'center',
  },
  buttonContainer: {
    marginVertical: 20,
  },
  primaryButton: {
    backgroundColor: '#00d4ff',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#00d4ff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 10,
  },
  secondaryButton: {
    borderWidth: 2,
    borderColor: '#00d4ff',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#00d4ff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    marginTop: 20,
  },
  footerText: {
    color: '#b0b0b0',
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  skipButton: {
    marginTop: 15,
    paddingVertical: 12,
    alignItems: 'center',
  },
  skipButtonText: {
    color: '#b0b0b0',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
});
