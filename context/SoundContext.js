import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { Audio } from "expo-av";

const SoundContext = createContext();

export const SoundProvider = ({ children }) => {
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Initialize audio mode
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
        console.error("Error setting audio mode:", error);
      }
    };
    initializeAudio();

    return () => {
      if (sound) {
        sound
          .unloadAsync()
          .catch((error) => console.error("Error unloading sound:", error));
      }
    };
  }, [sound]);

  // Play local sound
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
      console.error("Error playing local sound:", error);
    }
  }, [sound]);

  // Stop sound
  const stopSound = useCallback(async () => {
    try {
      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
        setSound(null);
        setIsPlaying(false);
      }
    } catch (error) {
      console.error("Error stopping sound in context:", error);
    }
  }, [sound]);

  return (
    <SoundContext.Provider value={{ playSound, stopSound, isPlaying }}>
      {children}
    </SoundContext.Provider>
  );
};

export const useSound = () => useContext(SoundContext);
