import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

const api = axios.create({
  baseURL: `${API_BASE_URL}/reports`,
  timeout: 10000,
});

// Attach token automatically
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
 * REPORT SERVICE
 */
export const reportService = {
  // 🔹 POST /api/reports
  async createReport(reportData) {
    try {
      const response = await api.post('/', reportData);
      return response.data;
    } catch (error) {
      console.error('❌ createReport failed:', error?.response?.data || error.message);
      throw error;
    }
  },

  // 🔹 GET /api/reports
  async getAllReports() {
    try {
      const response = await api.get('/');
      return response.data;
    } catch (error) {
      console.error('❌ getAllReports failed:', error?.response?.data || error.message);
      throw error;
    }
  },

  // 🔹 GET /api/reports?lat=&lng=&radius=
  async getNearbyReports({ lat, lng, radius = 5000 }) {
    try {
      const response = await api.get('/', {
        params: { lat, lng, radius },
      });
      return response.data;
    } catch (error) {
      console.error(
        '❌ getNearbyReports failed:',
        error?.response?.data || error.message
      );
      throw error;
    }
  },

  // 🔹 GET /api/reports/:id
  async getReportById(reportId) {
    try {
      const response = await api.get(`/${reportId}`);
      return response.data;
    } catch (error) {
      console.error(
        `❌ getReportById failed (id=${reportId}):`,
        error?.response?.data || error.message
      );
      throw error;
    }
  },

  // 🔹 POST /api/reports/:id/upvote
  async upvoteReport(reportId) {
    try {
      const response = await api.post(`/${reportId}/upvote`);
      return response.data;
    } catch (error) {
      console.error(
        `❌ upvoteReport failed (id=${reportId}):`,
        error?.response?.data || error.message
      );
      throw error;
    }
  },

  // 🔹 POST /api/reports/:id/verify (admin)
  async verifyReport(reportId) {
    try {
      const response = await api.post(`/${reportId}/verify`);
      return response.data;
    } catch (error) {
      console.error(
        `❌ verifyReport failed (id=${reportId}):`,
        error?.response?.data || error.message
      );
      throw error;
    }
  },

  // 🔹 DELETE /api/reports/:id
  async deleteReport(reportId) {
    try {
      const response = await api.delete(`/${reportId}`);
      return response.data;
    } catch (error) {
      console.error(
        `❌ deleteReport failed (id=${reportId}):`,
        error?.response?.data || error.message
      );
      throw error;
    }
  },
};
