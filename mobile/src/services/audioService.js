import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';

let soundObject = null;
let audioInitialized = false;

// Initialize audio mode once
const initAudio = async () => {
  if (audioInitialized) return;
  try {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
      shouldDuckAndroid: true,
    });
    audioInitialized = true;
  } catch (error) {
    console.log('Audio initialization error (non-critical):', error);
  }
};

export const playAlertSound = async (type, settings) => {
  if (!settings || !settings.audioAlerts) return;

  try {
    await initAudio();
    
    // Stop any currently playing sound
    if (soundObject) {
      try {
        await soundObject.unloadAsync();
      } catch (e) {
        // Ignore unload errors
      }
    }

    // Vibrate based on severity
    if (settings.vibration) {
      if (type === 'Critical' || type === 'High') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        // Double vibration for critical
        setTimeout(() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        }, 200);
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    }
  } catch (error) {
    console.error('Error playing alert sound:', error);
    // Fallback to vibration only
    if (settings.vibration) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }
};

export const speakAlert = async (message, settings) => {
  if (!settings.voiceAlerts || !settings.audioAlerts) return;

  // For now, we'll use a simple approach
  // In production, you might want to use expo-speech or a TTS library
  console.log('Voice alert:', message);
};

export const stopAllSounds = async () => {
  if (soundObject) {
    try {
      await soundObject.stopAsync();
      await soundObject.unloadAsync();
      soundObject = null;
    } catch (error) {
      console.error('Error stopping sound:', error);
    }
  }
};

