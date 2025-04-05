import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  Platform,
  TextInput,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { db } from "../../services/firebase";
import {
  doc,
  getDoc,
  updateDoc,
  Timestamp,
  collection,
  addDoc,
} from "firebase/firestore";
import Icon from "react-native-vector-icons/Ionicons";
import { Audio } from "expo-av";
import Slider from "@react-native-community/slider";
import { StatusBar } from "expo-status-bar";
import { useAuth, role } from "../../context/authContext";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown } from "react-native-reanimated";
import {
  sendPushNotification,
  getSecurityPushTokens,
} from "../../services/notificationService";

// Debounce hook to delay state updates
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};
console.log("rerender", role);

// Separate NotesSection component to isolate notes functionality
const NotesSection = ({
  role,
  notes,
  notesInput,
  setNotesInput,
  handleUpdateNotes,
}) => {
  // Debounce the notesInput to prevent frequent rerenders
  const debouncedNotesInput = useDebounce(notesInput, 300);

  // Log for debugging
  useEffect(() => {
    console.log(
      "NotesSection rerendered with notesInput:",
      debouncedNotesInput
    );
  }, [debouncedNotesInput]);

  return (
    <>
      <View style={styles.detailRow}>
        <Icon
          name="document-text-outline"
          size={20}
          color="#4CAF50"
          style={styles.detailIcon}
        />
        <Text style={styles.detailText}>
          <Text style={styles.label}>Notes:</Text> {notes || "N/A"}
        </Text>
      </View>
      {role === "admin" && (
        <View style={styles.notesUpdateContainer}>
          <TextInput
            style={styles.notesInput}
            value={notesInput}
            onChangeText={setNotesInput}
            placeholder="Update notes..."
            placeholderTextColor="#999"
            multiline
          />
          <TouchableOpacity
            onPress={handleUpdateNotes}
            style={styles.updateNotesButton}
          >
            <LinearGradient
              colors={["#4CAF50", "#388E3C"]}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>Update Notes</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}
    </>
  );
};

const AlertDetailPage = () => {
  const { alertId } = useLocalSearchParams();
  const router = useRouter();
  const { user, role } = useAuth();
  const [alertDetails, setAlertDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [soundPosition, setSoundPosition] = useState(0);
  const [soundDuration, setSoundDuration] = useState(0);
  const [imageError, setImageError] = useState({});
  const [soundError, setSoundError] = useState({});
  const [notesInput, setNotesInput] = useState("");

  // Debug logs for role and conditions
  console.log("Current user role:", role);
  useEffect(() => {
    if (alertDetails) {
      console.log("Alert status:", alertDetails.status);
      console.log(
        "Should show buttons:",
        role === "admin" && alertDetails.status === "pending"
      );
    }
  }, [alertDetails, role]);

  // Convert Firestore timestamp to readable date string
  const convertTimestampToDateString = useCallback((timestamp) => {
    if (!timestamp) return "Unknown";
    try {
      const date = timestamp.toDate();
      return date.toLocaleString();
    } catch (error) {
      console.warn("Unexpected timestamp format:", timestamp);
      return "Unknown";
    }
  }, []);

  // Resolve Firestore references (e.g., deviceId, resolvedBy,)
  const resolveReference = useCallback(async (ref) => {
    if (!ref) return "Unknown";
    try {
      const docSnap = await getDoc(ref);
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (ref.path.startsWith("devices")) {
          return data.name || docSnap.id;
        } else if (ref.path.startsWith("users")) {
          return data.username || docSnap.id;
        }
      }
      return docSnap.id;
    } catch (error) {
      console.error("Error resolving reference:", error);
      return "Unknown";
    }
  }, []);

  // Parse location array into latitude and longitude
  const parseLocation = useCallback((locationArray) => {
    if (!Array.isArray(locationArray) || locationArray.length !== 2) {
      return { latitude: "N/A", longitude: "N/A" };
    }

    const [latStr, lonStr] = locationArray;
    const latitude = latStr.replace(/[^0-9.-]/g, "") || "N/A";
    const longitude = lonStr.replace(/[^0-9.-]/g, "") || "N/A";
    return { latitude, longitude };
  }, []);

  // Initialize audio settings and clean up sound on unmount
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

  // Fetch alert details from Firestore
  const fetchAlertDetails = useCallback(async () => {
    if (!alertId) {
      setError("No alert ID provided.");
      setLoading(false);
      return;
    }

    try {
      const alertDoc = await getDoc(doc(db, "alerts", alertId));
      if (!alertDoc.exists()) {
        setError("Alert not found.");
        setLoading(false);
        return;
      }

      const data = alertDoc.data();
      const deviceId = await resolveReference(data.deviceId);

      const formattedData = {
        ...data,
        deviceId,
        deviceRef: data.deviceId,
        occur_at: convertTimestampToDateString(data.occur_at),
        resolvedAt: data.resolvedAt
          ? convertTimestampToDateString(data.resolvedAt)
          : "N/A",
        securityNotified: data.securityNotified || "N/A",
        detections: data.detections || {},
        location: parseLocation(data.location),
      };

      console.log("Fetched alert status:", formattedData.status);

      if (formattedData.detections) {
        if (formattedData.detections.image?.timestamp) {
          formattedData.detections.image.timestamp =
            convertTimestampToDateString(
              formattedData.detections.image.timestamp
            );
        }
        if (formattedData.detections.sound?.timestamp) {
          formattedData.detections.sound.timestamp =
            convertTimestampToDateString(
              formattedData.detections.sound.timestamp
            );
        }
        if (formattedData.detections.smoke?.timestamp) {
          formattedData.detections.smoke.timestamp =
            convertTimestampToDateString(
              formattedData.detections.smoke.timestamp
            );
        }
      }

      if (data.resolvedBy) {
        try {
          const resolvedByUser = await resolveReference(data.resolvedBy);
          formattedData.resolvedBy = resolvedByUser;
        } catch (err) {
          console.error("Error resolving resolvedBy:", err);
          formattedData.resolvedBy = "Unknown User";
        }
      }

      setAlertDetails(formattedData);
      setNotesInput(data.notes || "");
    } catch (error) {
      console.error("Error fetching alert details:", error);
      setError("Failed to load alert details: " + error.message);
    } finally {
      setLoading(false);
    }
  }, [alertId, convertTimestampToDateString, resolveReference, parseLocation]);

  useEffect(() => {
    fetchAlertDetails();
  }, [fetchAlertDetails]);

  // Play sound from URL
  const playSound = useCallback(
    async (url, index) => {
      try {
        const audioExtensions = [".mp3", ".wav", ".m4a", ".aac"];
        const isAudio = audioExtensions.some((ext) =>
          url.toLowerCase().endsWith(ext)
        );
        if (!isAudio) {
          setSoundError((prev) => ({ ...prev, [index]: true }));
          return;
        }

        if (sound) {
          await sound.unloadAsync();
        }
        const { sound: newSound } = await Audio.Sound.createAsync({ uri: url });
        setSound(newSound);
        await newSound.playAsync();
        setIsPlaying(true);

        newSound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded) {
            setSoundPosition(status.positionMillis);
            setSoundDuration(status.durationMillis || 0);
            if (status.didJustFinish) {
              setIsPlaying(false);
              setSoundPosition(0);
            }
          }
        });
      } catch (error) {
        console.error("Error playing sound:", error);
        setSoundError((prev) => ({ ...prev, [index]: true }));
      }
    },
    [sound]
  );

  // Pause sound playback
  const pauseSound = useCallback(async () => {
    try {
      if (sound) {
        await sound.pauseAsync();
        setIsPlaying(false);
      }
    } catch (error) {
      console.error("Error pausing sound:", error);
      setError("Failed to pause sound: " + error.message);
    }
  }, [sound]);

  // Handle sound slider value change
  const handleSliderValueChange = useCallback(
    async (value) => {
      if (sound && soundDuration > 0) {
        const newPosition = (value / 100) * soundDuration;
        try {
          await sound.setPositionAsync(newPosition);
          setSoundPosition(newPosition);
        } catch (error) {
          console.error("Error seeking sound:", error);
        }
      }
    },
    [sound, soundDuration]
  );

  // Handle image loading errors
  const handleImageError = useCallback((index) => {
    setImageError((prev) => ({ ...prev, [index]: true }));
  }, []);

  // Handle admin approving the alert
  const handleApprove = useCallback(async () => {
    try {
      const alertRef = doc(db, "alerts", alertId);
      const userRef = user?.uid ? doc(db, "users", user.uid) : null;
      const now = Timestamp.now();

      // Fetch security user push tokens
      const securityTokens = await getSecurityPushTokens();
      if (securityTokens.length === 0) {
        console.log("No security members found to notify.");
      }

      await updateDoc(alertRef, {
        status: "approved",
        resolvedAt: now,
        resolvedBy: userRef,
        securityNotified: "notified",
        notification: securityTokens,
      });

      // Log the notification in the notifications collection (without body)
      if (securityTokens.length > 0) {
        await addDoc(collection(db, "notifications"), {
          alertId: alertId,
          recipients: securityTokens,
          title: "Alert Approved",
          sentAt: now,
          type: "push",
        });
        console.log(
          "Notification logged in Firestore notifications collection"
        );
      }

      // Send push notifications to security members with a categoryIdentifier for actions
      if (securityTokens.length > 0) {
        const notificationPromises = securityTokens.map((token) =>
          sendPushNotification(
            token,
            "Alert Approved",
            `An alert from device ${alertDetails.deviceId} at ${alertDetails.occur_at} has been approved.`,
            {
              alertId,
              categoryIdentifier: "SECURITY_RESPONSE",
            }
          )
        );
        await Promise.all(notificationPromises);
        console.log(
          "Push notifications sent to security members:",
          securityTokens
        );
      }

      await fetchAlertDetails();
      router.back();
    } catch (error) {
      console.error("Error approving alert:", error);
      setError("Failed to approve alert: " + error.message);
    }
  }, [alertId, user?.uid, router, fetchAlertDetails, alertDetails]);

  // Handle admin rejecting the alert
  const handleReject = useCallback(async () => {
    try {
      const alertRef = doc(db, "alerts", alertId);
      const userRef = user?.uid ? doc(db, "users", user.uid) : null;
      const now = Timestamp.now();

      await updateDoc(alertRef, {
        status: "rejected",
        resolvedAt: now,
        resolvedBy: userRef,
        securityNotified: "not notified",
      });

      await fetchAlertDetails();
      router.back();
    } catch (error) {
      console.error("Error rejecting alert:", error);
      setError("Failed to reject alert: " + error.message);
    }
  }, [alertId, user?.uid, router, fetchAlertDetails]);

  // Handle updating notes
  const handleUpdateNotes = useCallback(async () => {
    try {
      const alertRef = doc(db, "alerts", alertId);
      await updateDoc(alertRef, {
        notes: notesInput,
      });
      await fetchAlertDetails();
    } catch (error) {
      console.error("Error updating notes:", error);
      setError("Failed to update notes: " + error.message);
    }
  }, [alertId, notesInput, fetchAlertDetails]);

  // Memoize status color based on alert status
  const statusColor = useMemo(
    () => getStatusColor(alertDetails?.status),
    [alertDetails?.status]
  );

  // Render loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Loading alert details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Render error state
  if (error || !alertDetails) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error || "Alert not found."}</Text>
          <TouchableOpacity
            onPress={() => {
              setLoading(true);
              setError(null);
              fetchAlertDetails();
            }}
            style={styles.retryButton}
          >
            <LinearGradient
              colors={["#4CAF50", "#388E3C"]}
              style={styles.buttonGradient}
            >
              <Text style={styles.retryText}>Retry</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const {
    detections,
    location,
    notes,
    occur_at,
    resolvedAt,
    resolvedBy,
    status,
    securityNotified,
  } = alertDetails;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header */}
        <LinearGradient colors={["#4CAF50", "#2E7D32"]} style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Icon name="arrow-back" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Alert Details</Text>
        </LinearGradient>

        {/* General Information */}
        <Animated.View
          entering={FadeInDown.duration(500)}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>General Information</Text>
          <View style={styles.detailRow}>
            <Icon
              name="cube-outline"
              size={20}
              color="#4CAF50"
              style={styles.detailIcon}
            />
            <Text style={styles.detailText}>
              <Text style={styles.label}>Device ID:</Text>{" "}
              {alertDetails.deviceId || "Unknown"}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Icon
              name="alert-circle-outline"
              size={20}
              color={statusColor}
              style={styles.detailIcon}
            />
            <Text style={styles.detailText}>
              <Text style={styles.label}>Status:</Text>{" "}
              <Text style={{ color: statusColor }}>{status || "N/A"}</Text>
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Icon
              name="time-outline"
              size={20}
              color="#4CAF50"
              style={styles.detailIcon}
            />
            <Text style={styles.detailText}>
              <Text style={styles.label}>Occurred At:</Text> {occur_at}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Icon
              name="shield-checkmark-outline"
              size={20}
              color={securityNotified === "notified" ? "#4CAF50" : "#D32F2F"}
              style={styles.detailIcon}
            />
            <Text style={styles.detailText}>
              <Text style={styles.label}>Security Notified:</Text>{" "}
              <Text
                style={{
                  color:
                    securityNotified === "notified" ? "#4CAF50" : "#D32F2F",
                }}
              >
                {securityNotified}
              </Text>
            </Text>
          </View>
          {resolvedAt !== "N/A" && (
            <>
              <View style={styles.detailRow}>
                <Icon
                  name="checkmark-circle-outline"
                  size={20}
                  color="#4CAF50"
                  style={styles.detailIcon}
                />
                <Text style={styles.detailText}>
                  <Text style={styles.label}>Resolved At:</Text> {resolvedAt}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Icon
                  name="person-outline"
                  size={20}
                  color="#4CAF50"
                  style={styles.detailIcon}
                />
                <Text style={styles.detailText}>
                  <Text style={styles.label}>Resolved By:</Text>{" "}
                  {resolvedBy || "N/A"}
                </Text>
              </View>
            </>
          )}
          {/* Notes Display and Update */}
          <NotesSection
            role={role}
            notes={notes}
            notesInput={notesInput}
            setNotesInput={setNotesInput}
            handleUpdateNotes={handleUpdateNotes}
          />
        </Animated.View>

        {/* Location Information */}
        {location && (
          <Animated.View
            entering={FadeInDown.duration(500).delay(100)}
            style={styles.section}
          >
            <Text style={styles.sectionTitle}>Location</Text>
            <View style={styles.detailRow}>
              <Icon
                name="location-outline"
                size={20}
                color="#4CAF50"
                style={styles.detailIcon}
              />
              <Text style={styles.detailText}>
                <Text style={styles.label}>Latitude:</Text>{" "}
                {location.latitude || "N/A"}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Icon
                name="location-outline"
                size={20}
                color="#4CAF50"
                style={styles.detailIcon}
              />
              <Text style={styles.detailText}>
                <Text style={styles.label}>Longitude:</Text>{" "}
                {location.longitude || "N/A"}
              </Text>
            </View>
          </Animated.View>
        )}

        {/* Detections */}
        {detections && (
          <>
            {/* Image Detections */}
            {detections.image && (
              <Animated.View
                entering={FadeInDown.duration(500).delay(200)}
                style={styles.section}
              >
                <Text style={styles.sectionTitle}>Image Detection</Text>
                {detections.image.detected &&
                  detections.image.imageUrl?.length > 0 && (
                    <FlatList
                      horizontal
                      data={detections.image.imageUrl}
                      keyExtractor={(item, index) => `image-${index}`}
                      renderItem={({ item, index }) => (
                        <View style={styles.imageWrapper}>
                          {imageError[index] ? (
                            <View style={styles.imagePlaceholder}>
                              <Icon
                                name="image-outline"
                                size={40}
                                color="#D32F2F"
                              />
                              <Text style={styles.imageErrorText}>
                                Failed to load
                              </Text>
                            </View>
                          ) : (
                            <Image
                              source={{ uri: item }}
                              style={styles.image}
                              onError={() => handleImageError(index)}
                              resizeMode="cover"
                            />
                          )}
                        </View>
                      )}
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.imageList}
                    />
                  )}
                <View style={styles.detailRow}>
                  <Icon
                    name="checkmark-circle-outline"
                    size={20}
                    color={detections.image.detected ? "#4CAF50" : "#D32F2F"}
                    style={styles.detailIcon}
                  />
                  <Text style={styles.detailText}>
                    <Text style={styles.label}>Detected:</Text>{" "}
                    {detections.image.detected ? "Yes" : "No"}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Icon
                    name="stats-chart-outline"
                    size={20}
                    color="#4CAF50"
                    style={styles.detailIcon}
                  />
                  <Text style={styles.detailText}>
                    <Text style={styles.label}>Confidence:</Text>{" "}
                    {(detections.image.confidence * 100).toFixed(2)}%
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Icon
                    name="information-circle-outline"
                    size={20}
                    color="#4CAF50"
                    style={styles.detailIcon}
                  />
                  <Text style={styles.detailText}>
                    <Text style={styles.label}>Type:</Text>{" "}
                    {detections.image.type || "N/A"}
                  </Text>
                </View>
                {detections.image.timestamp && (
                  <View style={styles.detailRow}>
                    <Icon
                      name="time-outline"
                      size={20}
                      color="#4CAF50"
                      style={styles.detailIcon}
                    />
                    <Text style={styles.detailText}>
                      <Text style={styles.label}>Detected At:</Text>{" "}
                      {detections.image.timestamp}
                    </Text>
                  </View>
                )}
              </Animated.View>
            )}

            {/* Sound Detections */}
            {detections.sound && (
              <Animated.View
                entering={FadeInDown.duration(500).delay(300)}
                style={styles.section}
              >
                <Text style={styles.sectionTitle}>Sound Detection</Text>
                {detections.sound.detected &&
                  detections.sound.soundUrl?.length > 0 && (
                    <>
                      {detections.sound.soundUrl.map((url, index) => (
                        <View
                          key={`sound-${index}`}
                          style={styles.soundContainer}
                        >
                          <View style={styles.soundHeader}>
                            {soundError[index] ? (
                              <View style={styles.soundPlaceholder}>
                                <Icon
                                  name="volume-mute-outline"
                                  size={20}
                                  color="#D32F2F"
                                />
                                <Text style={styles.soundErrorText}>
                                  Invalid audio file
                                </Text>
                              </View>
                            ) : (
                              <TouchableOpacity
                                onPress={() =>
                                  isPlaying
                                    ? pauseSound()
                                    : playSound(url, index)
                                }
                                style={styles.playButton}
                              >
                                <LinearGradient
                                  colors={
                                    isPlaying
                                      ? ["#FF9800", "#F57C00"]
                                      : ["#4CAF50", "#388E3C"]
                                  }
                                  style={styles.playButtonGradient}
                                >
                                  <Icon
                                    name={isPlaying ? "pause" : "play"}
                                    size={20}
                                    color="#fff"
                                  />
                                </LinearGradient>
                              </TouchableOpacity>
                            )}
                            <Text style={styles.soundLabel}>
                              Sound File #{index + 1}
                            </Text>
                          </View>
                          {!soundError[index] && (
                            <>
                              <Slider
                                style={styles.slider}
                                value={
                                  (soundPosition / soundDuration) * 100 || 0
                                }
                                onValueChange={handleSliderValueChange}
                                minimumValue={0}
                                maximumValue={100}
                                minimumTrackTintColor="#4CAF50"
                                maximumTrackTintColor="#555"
                                thumbTintColor="#4CAF50"
                                disabled={!sound}
                              />
                              <Text style={styles.timeText}>
                                {new Date(soundPosition)
                                  .toISOString()
                                  .substr(14, 5)}{" "}
                                /{" "}
                                {new Date(soundDuration)
                                  .toISOString()
                                  .substr(14, 5)}
                              </Text>
                            </>
                          )}
                        </View>
                      ))}
                    </>
                  )}
                <View style={styles.detailRow}>
                  <Icon
                    name="checkmark-circle-outline"
                    size={20}
                    color={detections.sound.detected ? "#4CAF50" : "#D32F2F"}
                    style={styles.detailIcon}
                  />
                  <Text style={styles.detailText}>
                    <Text style={styles.label}>Detected:</Text>{" "}
                    {detections.sound.detected ? "Yes" : "No"}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Icon
                    name="stats-chart-outline"
                    size={20}
                    color="#4CAF50"
                    style={styles.detailIcon}
                  />
                  <Text style={styles.detailText}>
                    <Text style={styles.label}>Confidence:</Text>{" "}
                    {(detections.sound.confidence * 100).toFixed(2)}%
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Icon
                    name="information-circle-outline"
                    size={20}
                    color="#4CAF50"
                    style={styles.detailIcon}
                  />
                  <Text style={styles.detailText}>
                    <Text style={styles.label}>Type:</Text>{" "}
                    {detections.sound.type || "N/A"}
                  </Text>
                </View>
                {detections.sound.timestamp && (
                  <View style={styles.detailRow}>
                    <Icon
                      name="time-outline"
                      size={20}
                      color="#4CAF50"
                      style={styles.detailIcon}
                    />
                    <Text style={styles.detailText}>
                      <Text style={styles.label}>Detected At:</Text>{" "}
                      {detections.sound.timestamp}
                    </Text>
                  </View>
                )}
              </Animated.View>
            )}

            {/* Smoke Detections */}
            {detections.smoke && (
              <Animated.View
                entering={FadeInDown.duration(500).delay(400)}
                style={styles.section}
              >
                <Text style={styles.sectionTitle}>Smoke Detection</Text>
                <View style={styles.detailRow}>
                  <Icon
                    name="checkmark-circle-outline"
                    size={20}
                    color={detections.smoke.detected ? "#4CAF50" : "#D32F2F"}
                    style={styles.detailIcon}
                  />
                  <Text style={styles.detailText}>
                    <Text style={styles.label}>Detected:</Text>{" "}
                    {detections.smoke.detected ? "Yes" : "No"}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Icon
                    name="warning-outline"
                    size={20}
                    color="#D32F2F"
                    style={styles.detailIcon}
                  />
                  <Text style={styles.detailText}>
                    <Text style={styles.label}>Level:</Text>{" "}
                    {detections.smoke.level || "N/A"}
                  </Text>
                </View>
                {detections.smoke.timestamp && (
                  <View style={styles.detailRow}>
                    <Icon
                      name="time-outline"
                      size={20}
                      color="#4CAF50"
                      style={styles.detailIcon}
                    />
                    <Text style={styles.detailText}>
                      <Text style={styles.label}>Detected At:</Text>{" "}
                      {detections.smoke.timestamp}
                    </Text>
                  </View>
                )}
              </Animated.View>
            )}
          </>
        )}

        {/* Admin Actions */}
        {role === "admin" && status === "pending" && (
          <Animated.View
            entering={FadeInDown.duration(500).delay(500)}
            style={styles.actionContainer}
          >
            <TouchableOpacity
              style={styles.approveButton}
              onPress={handleApprove}
            >
              <LinearGradient
                colors={["#4CAF50", "#388E3C"]}
                style={styles.buttonGradient}
              >
                <Icon
                  name="checkmark-outline"
                  size={20}
                  color="#fff"
                  style={styles.buttonIcon}
                />
                <Text style={styles.buttonText}>Approve</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.rejectButton}
              onPress={handleReject}
            >
              <LinearGradient
                colors={["#D32F2F", "#B71C1C"]}
                style={styles.buttonGradient}
              >
                <Icon
                  name="close-outline"
                  size={20}
                  color="#fff"
                  style={styles.buttonIcon}
                />
                <Text style={styles.buttonText}>Reject</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

// Function to determine status color
const getStatusColor = (status) => {
  switch (status) {
    case "pending":
      return "#FF9800";
    case "approved":
      return "#4CAF50";
    case "rejected":
      return "#D32F2F";
    default:
      return "#FFFFFF";
  }
};

export default AlertDetailPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  scrollContainer: {
    paddingVertical: 20,
    paddingHorizontal: 15,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    paddingTop: Platform.OS === "ios" ? 40 : 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "700",
  },
  section: {
    marginBottom: 20,
    padding: 20,
    backgroundColor: "#1e1e1e",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  sectionTitle: {
    color: "#4CAF50",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 15,
    textTransform: "uppercase",
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  detailIcon: {
    marginRight: 10,
  },
  detailText: {
    color: "#bbb",
    fontSize: 16,
    flex: 1,
    flexWrap: "wrap",
  },
  label: {
    color: "#fff",
    fontWeight: "600",
  },
  imageWrapper: {
    marginRight: 10,
    borderRadius: 8,
    overflow: "hidden",
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 8,
  },
  imagePlaceholder: {
    width: 200,
    height: 200,
    backgroundColor: "#2a2a2a",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
  },
  imageErrorText: {
    color: "#D32F2F",
    fontSize: 14,
    marginTop: 5,
  },
  imageList: {
    paddingVertical: 10,
  },
  soundContainer: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: "#2a2a2a",
    borderRadius: 8,
  },
  soundHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  playButton: {
    marginRight: 10,
  },
  playButtonGradient: {
    padding: 10,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  soundLabel: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  soundPlaceholder: {
    flexDirection: "row",
    alignItems: "center",
  },
  soundErrorText: {
    color: "#D32F2F",
    fontSize: 14,
    marginLeft: 5,
  },
  slider: {
    width: "100%",
    height: 40,
  },
  timeText: {
    color: "#999",
    fontSize: 12,
    textAlign: "right",
    marginTop: 5,
  },
  actionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    paddingHorizontal: 10,
  },
  approveButton: {
    flex: 1,
    marginRight: 10,
  },
  rejectButton: {
    flex: 1,
    marginLeft: 10,
  },
  buttonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#121212",
  },
  loadingText: {
    color: "#fff",
    fontSize: 16,
    marginTop: 10,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#121212",
    padding: 20,
  },
  errorText: {
    color: "#D32F2F",
    fontSize: 18,
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    padding: 10,
    borderRadius: 8,
  },
  retryText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  notesUpdateContainer: {
    marginTop: 15,
    padding: 10,
    backgroundColor: "#2a2a2a",
    borderRadius: 8,
  },
  notesInput: {
    color: "#fff",
    fontSize: 16,
    backgroundColor: "#333",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    minHeight: 80,
    textAlignVertical: "top",
  },
  updateNotesButton: {
    alignSelf: "flex-end",
  },
});
