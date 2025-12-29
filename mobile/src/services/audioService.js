import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import * as Speech from 'expo-speech';

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

export const playAlertSound = async (severity, settings) => {
  if (!settings?.audioAlerts) return;

  try {
    await initAudio();

    // Stop previous sound
    if (soundObject) {
      await soundObject.unloadAsync();
      soundObject = null;
    }

    // 🔔 HAPTIC FEEDBACK
    if (settings.vibration) {
      if (severity === 'Critical' || severity === 'High') {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        setTimeout(() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        }, 200);
      } else {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    }
  } catch (error) {
    console.error('Error playing alert sound:', error);
  }
};

export const speakAlert = async (message, settings) => {
  if (!settings?.voiceAlerts || !settings?.audioAlerts) return;

  try {
    // Stop any previous speech
    Speech.stop();

    Speech.speak(message, {
      language: 'en-IN', // 🇮🇳 Indian English
      pitch: 1.0,
      rate: 0.95,
      volume: 1.0,
    });
  } catch (error) {
    console.error('TTS error:', error);
  }
};

export const stopAllSounds = async () => {
  try {
    Speech.stop();

    if (soundObject) {
      await soundObject.stopAsync();
      await soundObject.unloadAsync();
      soundObject = null;
    }
  } catch (error) {
    console.error('Error stopping sound:', error);
  }
};
