import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { Audio } from "expo-av";
import * as Sentry from "@sentry/react-native";

const SoundContext = createContext();

export const SoundProvider = ({ children }) => {
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const initializeAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          shouldDuckAndroid: true,
        });
      } catch (error) {
        Sentry.captureException(error);
      }
    };
    initializeAudio();

    return () => {
      if (sound) {
        sound.unloadAsync().catch((error) => Sentry.captureException(error));
      }
    };
  }, [sound]);

  const playSound = useCallback(async () => {
    try {
      if (sound) {
        await sound.unloadAsync();
      }
      const { sound: newSound } = await Audio.Sound.createAsync(
        require("../assets/sounds/alert.mp3"),
        { shouldPlay: true, isLooping: true }
      );
      setSound(newSound);
      setIsPlaying(true);
    } catch (error) {
      Sentry.captureException(error);
    }
  }, [sound]);

  const stopSound = useCallback(async () => {
    try {
      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
        setSound(null);
        setIsPlaying(false);
      }
    } catch (error) {
      Sentry.captureException(error);
    }
  }, [sound]);

  return (
    <SoundContext.Provider value={{ playSound, stopSound, isPlaying }}>
      {children}
    </SoundContext.Provider>
  );
};

export const useSound = () => useContext(SoundContext);
