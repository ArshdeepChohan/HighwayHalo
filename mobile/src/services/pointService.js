import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

const api = axios.create({
  baseURL: `${API_BASE_URL}/points`,
  timeout: 10000,
});

// Attach token automatically (for protected routes)
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * POINT SERVICE
 */
export const pointService = {

    async getNearbyPoints({ lat, lng, radius = 1500 }) {
        try {
            const response = await api.get('/', {
                params: { lat, lng, radius },
            });
            return response.data;
        } catch (error) {
            console.error(
                '❌ getNearbyPoints failed:',
                error?.response?.data || error.message
            );
            throw error;
        }
        
    },
  // 🔹 GET /api/points
  async getAllPoints() {
    try {
      const response = await api.get('/');
      return response.data;
    } catch (error) {
      console.error('❌ getAllPoints failed:', error?.response?.data || error.message);
      throw error;
    }
  },

  // 🔹 GET /api/points/:id
  async getPointById(pointId) {
    try {
      const response = await api.get(`/${pointId}`);
      return response.data;
    } catch (error) {
      console.error(
        `❌ getPointById failed (id=${pointId}):`,
        error?.response?.data || error.message
      );
      throw error;
    }
  },

  // 🔹 POST /api/points (Admin)
  async createPoint(pointData) {
    try {
      const response = await api.post('/', pointData, {
        headers: { 'Content-Type': 'application/json' },
      });
      return response.data;
    } catch (error) {
      console.error('❌ createPoint failed:', error?.response?.data || error.message);
      throw error;
    }
  },

  // 🔹 PUT /api/points/:id (Admin)
  async updatePoint(pointId, updateData) {
    try {
      const response = await api.put(`/${pointId}`, updateData, {
        headers: { 'Content-Type': 'application/json' },
      });
      return response.data;
    } catch (error) {
      console.error(
        `❌ updatePoint failed (id=${pointId}):`,
        error?.response?.data || error.message
      );
      throw error;
    }
  },

  // 🔹 DELETE /api/points/:id (Soft delete)
  async deletePoint(pointId) {
    try {
      const response = await api.delete(`/${pointId}`);
      return response.data;
    } catch (error) {
      console.error(
        `❌ deletePoint failed (id=${pointId}):`,
        error?.response?.data || error.message
      );
      throw error;
    }
  },

  // 🔹 DELETE /api/points/hard/:id (Hard delete)
  async hardDeletePoint(pointId) {
    try {
      const response = await api.delete(`/hard/${pointId}`);
      return response.data;
    } catch (error) {
      console.error(
        `❌ hardDeletePoint failed (id=${pointId}):`,
        error?.response?.data || error.message
      );
      throw error;
    }
  },
};
