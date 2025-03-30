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
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { db } from "../../services/firebase";
import { doc, getDoc, updateDoc, Timestamp } from "firebase/firestore";
import Icon from "react-native-vector-icons/Ionicons";
import { Audio } from "expo-av";
import Slider from "@react-native-community/slider";
import { StatusBar } from "expo-status-bar";
import { useAuth } from "../../context/authContext";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown } from "react-native-reanimated";

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

  const parseLocation = useCallback((locationArray) => {
    if (!Array.isArray(locationArray) || locationArray.length !== 2) {
      return { latitude: "N/A", longitude: "N/A" };
    }

    const [latStr, lonStr] = locationArray;
    const latitude = latStr.replace(/[^0-9.-]/g, "") || "N/A";
    const longitude = lonStr.replace(/[^0-9.-]/g, "") || "N/A";
    return { latitude, longitude };
  }, []);

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
        deviceRef: data.deviceId, // Store the device reference
        occur_at: convertTimestampToDateString(data.occur_at),
        resolvedAt: data.resolvedAt
          ? convertTimestampToDateString(data.resolvedAt)
          : "N/A",
        securityNotified: data.securityNotified || "N/A", // Include securityNotified
        detections: data.detections || {},
        location: parseLocation(data.location),
      };

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

  const handleImageError = useCallback((index) => {
    setImageError((prev) => ({ ...prev, [index]: true }));
  }, []);

  const handleApprove = useCallback(async () => {
    try {
      const alertRef = doc(db, "alerts", alertId);
      const userRef = user?.uid ? doc(db, "users", user.uid) : null;
      const now = Timestamp.now();

      await updateDoc(alertRef, {
        status: "approved",
        resolvedAt: now,
        resolvedBy: userRef,
        securityNotified: "notified",
      });

      // Refresh the alert details to reflect the updated status
      await fetchAlertDetails();
      router.back();
    } catch (error) {
      console.error("Error approving alert:", error);
      setError("Failed to approve alert: " + error.message);
    }
  }, [alertId, user?.uid, router, fetchAlertDetails]);

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

      // Refresh the alert details to reflect the updated status
      await fetchAlertDetails();
      router.back();
    } catch (error) {
      console.error("Error rejecting alert:", error);
      setError("Failed to reject alert: " + error.message);
    }
  }, [alertId, user?.uid, router, fetchAlertDetails]);

  const statusColor = useMemo(
    () => getStatusColor(alertDetails?.status),
    [alertDetails?.status]
  );

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
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#4CAF50",
    marginBottom: 15,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  detailIcon: {
    marginRight: 10,
  },
  detailText: {
    color: "#fff",
    fontSize: 16,
    flex: 1,
  },
  label: {
    fontWeight: "600",
    color: "#bbb",
  },
  imageList: {
    paddingVertical: 10,
  },
  imageWrapper: {
    width: 220,
    height: 220,
    marginRight: 15,
    borderRadius: 10,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
  },
  imagePlaceholder: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
    backgroundColor: "#2d2d2d",
    justifyContent: "center",
    alignItems: "center",
  },
  imageErrorText: {
    color: "#D32F2F",
    fontSize: 14,
    marginTop: 5,
    textAlign: "center",
  },
  soundContainer: {
    backgroundColor: "#2d2d2d",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  soundHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  playButton: {
    borderRadius: 25,
    overflow: "hidden",
  },
  playButtonGradient: {
    padding: 10,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  soundLabel: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
  slider: {
    width: "100%",
    height: 40,
  },
  timeText: {
    color: "#bbb",
    fontSize: 12,
    textAlign: "right",
    marginTop: 5,
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#121212",
  },
  loadingText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginTop: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#121212",
  },
  errorText: {
    color: "#F44336",
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 15,
    textAlign: "center",
  },
  retryButton: {
    borderRadius: 10,
    overflow: "hidden",
  },
  buttonGradient: {
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  retryText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  actionContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
    marginBottom: 20,
  },
  approveButton: {
    borderRadius: 10,
    overflow: "hidden",
    flex: 1,
    marginHorizontal: 10,
  },
  rejectButton: {
    borderRadius: 10,
    overflow: "hidden",
    flex: 1,
    marginHorizontal: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  buttonIcon: {
    marginRight: 5,
  },
});

export default AlertDetailPage;
