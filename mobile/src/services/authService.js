import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure base URL for your backend
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL; // Change this to your backend URL
console.log('API BASE URL =', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  
});

// Add token to requests
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const authService = {
  async login(identifier, password) {
    try {
      const response = await api.post('/auth/login', {
        identifier,
        password,
      });
      
      return {
        success: true,
        token: response.data.token,
        user: response.data.user,
      };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      return { success: false, message };
    }
  },

  async signup(userData) {
    try {
      const response = await api.post('/auth/register', userData);
      
      return {
        success: true,
        token: response.data.token,
        user: response.data.user,
      };
    } catch (error) {
      const message = error.response?.data?.message || 'Signup failed';
      return { success: false, message };
    }
  },

  async verifyToken(token) {
    try {
      const response = await api.get('/auth/verify', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      return response.data.user;
    } catch (error) {
      return null;
    }
  },

  async updatePreferences(preferences) {
    try {
      const response = await api.put('/auth/preferences', preferences);
      
      return {
        success: true,
        user: response.data.user,
      };
    } catch (error) {
      const message = error.response?.data?.message || 'Update failed';
      return { success: false, message };
    }
  },

  async getProfile() {
    try {
      const response = await api.get('/auth/profile');
      return response.data.user;
    } catch (error) {
      throw error;
    }
  },
};
