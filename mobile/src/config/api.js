// API Configuration
// For physical device testing, replace 'localhost' with your computer's IP address
// Find your IP: macOS/Linux: ifconfig | grep "inet " | grep -v 127.0.0.1
// Windows: ipconfig

const API_BASE_URL = __DEV__ 
  ? 'http://localhost:3000'  // Development - use localhost for simulator
  : 'https://your-production-api.com';  // Production URL

export default {
  BASE_URL: API_BASE_URL,
  ENDPOINTS: {
    AUTH: {
      LOGIN: `${API_BASE_URL}/api/auth/login`,
      SIGNUP: `${API_BASE_URL}/api/auth/signup`,
      VERIFY: `${API_BASE_URL}/api/auth/verify`,
    },
    POINTS: `${API_BASE_URL}/api/points`,
    REPORTS: `${API_BASE_URL}/api/reports`,
  },
};

