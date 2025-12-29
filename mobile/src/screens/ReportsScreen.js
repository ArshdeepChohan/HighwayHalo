import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { reportService } from '../services/reportService';

const REPORT_TYPES = [
  { id: 'Speed-Camera', label: 'Speed Camera', icon: 'camera', color: '#ff6b6b' },
  { id: 'Speed-Breaker', label: 'Speed Breaker', icon: 'warning', color: '#ffa726' },
  { id: 'Red-Light', label: 'Red Light Camera', icon: 'stop-circle', color: '#ef5350' },
  { id: 'Accident', label: 'Accident', icon: 'alert-circle', color: '#f44336' },
  { id: 'Construction', label: 'Construction', icon: 'construct', color: '#ff9800' },
  { id: 'Police Check', label: 'Police Checkpoint', icon: 'shield', color: '#2196f3' },
  { id: 'Hazard', label: 'Road Hazard', icon: 'warning', color: '#ff5722' },
  { id: 'Traffic', label: 'Traffic Jam', icon: 'car', color: '#9c27b0' },
  { id: 'Road Block', label: 'Road Block', icon: 'ban', color: '#607d8b' },
  { id: 'Flood', label: 'Flooded Road', icon: 'water', color: '#03a9f4' },
  { id: 'Broken Signal', label: 'Broken Traffic Signal', icon: 'flash', color: '#ffeb3b' },
  { id: 'Other', label: 'Other', icon: 'ellipsis-horizontal', color: '#795548' },
];

export default function ReportsScreen({ navigation }) {
  const { user, isGuest } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedType, setSelectedType] = useState(null);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReportTypeSelect = (type) => {
    setSelectedType(type);
    setModalVisible(true);
  };

  const handleSubmitReport = async () => {
    if (!selectedType) {
      Alert.alert('Error', 'Please select a report type');
      return;
    }

    setIsSubmitting(true);
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const reportData = {
        type: selectedType.id,
        label: selectedType.label,
        lat: location.coords.latitude,
        lng: location.coords.longitude,
        description: description.trim(),
        reportedBy: isGuest ? null : user?.id,
      };
      const response = await reportService.createReport(reportData);


      if (response) {
        Alert.alert('Success', 'Report submitted successfully!', [
          { text: 'OK', onPress: () => {
            setModalVisible(false);
            setSelectedType(null);
            setDescription('');
          }}
        ]);
      } else {
        throw new Error('Failed to submit report');
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      Alert.alert('Error', 'Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Report Hazard</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color="#00d4ff" />
          <Text style={styles.infoText}>
            Help keep the community safe by reporting hazards, speed cameras, and other road conditions.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Select Report Type</Text>
        
        <View style={styles.reportTypesGrid}>
          {REPORT_TYPES.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={styles.reportTypeCard}
              onPress={() => handleReportTypeSelect(type)}
            >
              <View style={[styles.iconContainer, { backgroundColor: `${type.color}20` }]}>
                <Ionicons name={type.icon} size={32} color={type.color} />
              </View>
              <Text style={styles.reportTypeLabel}>{type.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.communitySection}>
          <Text style={styles.sectionTitle}>Community Reports</Text>
          <Text style={styles.communityText}>
            Reports from other users help everyone stay safe on the road.
          </Text>
        </View>
      </ScrollView>

      {/* Report Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Report {selectedType?.label}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.modalLabel}>Additional Details (Optional)</Text>
              <TextInput
                style={styles.descriptionInput}
                placeholder="Describe the hazard or situation..."
                multiline
                numberOfLines={4}
                value={description}
                onChangeText={setDescription}
                placeholderTextColor="#999"
              />

              <View style={styles.modalInfo}>
                <Ionicons name="location" size={16} color="#666" />
                <Text style={styles.modalInfoText}>
                  Your current location will be used
                </Text>
              </View>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
                onPress={handleSubmitReport}
                disabled={isSubmitting}
              >
                <Text style={styles.submitButtonText}>
                  {isSubmitting ? 'Submitting...' : 'Submit Report'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  placeholder: {
    width: 34,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#e3f2fd',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  infoText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: '#1976d2',
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  reportTypesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
    marginBottom: 30,
  },
  reportTypeCard: {
    width: '47%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  reportTypeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  communitySection: {
    marginTop: 20,
  },
  communityText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalBody: {
    marginBottom: 20,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  descriptionInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 15,
    fontSize: 14,
    color: '#333',
    textAlignVertical: 'top',
    minHeight: 100,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  modalInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  modalInfoText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 5,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 10,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  submitButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 10,
    backgroundColor: '#00d4ff',
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

