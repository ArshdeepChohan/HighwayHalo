import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SettingsContext = createContext();

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

const defaultSettings = {
  audioAlerts: true,
  voiceAlerts: true,
  speedUnit: 'kmh', // 'kmh' or 'mph'
  alertRadius: 150, // meters
  darkMode: false,
  vibration: true,
  alertVolume: 0.8,
  showSpeedLimit: true,
  showMap: true,
  autoStart: true,
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('appSettings');
      if (savedSettings) {
        setSettings({ ...defaultSettings, ...JSON.parse(savedSettings) });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSettings = async (newSettings) => {
    try {
      const updated = { ...settings, ...newSettings };
      setSettings(updated);
      await AsyncStorage.setItem('appSettings', JSON.stringify(updated));
      return { success: true };
    } catch (error) {
      console.error('Error saving settings:', error);
      return { success: false, message: 'Failed to save settings' };
    }
  };

  const resetSettings = async () => {
    try {
      setSettings(defaultSettings);
      await AsyncStorage.setItem('appSettings', JSON.stringify(defaultSettings));
      return { success: true };
    } catch (error) {
      console.error('Error resetting settings:', error);
      return { success: false };
    }
  };

  const value = {
    settings: settings || defaultSettings,
    isLoading,
    updateSettings,
    resetSettings,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

