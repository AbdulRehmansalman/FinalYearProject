// import React from "react";
// import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
// import { useRouter } from "expo-router";
// import Icon from "react-native-vector-icons/Ionicons";
// import { useNotifications } from "../context/notificationContext";

// const NotificationItem = ({ notification }) => {
//   const router = useRouter();
//   const { markAsRead } = useNotifications();

//   /**
//    * Formats timestamp as relative time (e.g., "2h ago").
//    * @param {Date|string|number} timestamp
//    * @returns {string}
//    */
//   const formatRelativeTime = (timestamp) => {
//     if (!timestamp) return "";

//     const now = new Date();
//     const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
//     const seconds = Math.floor((now - date) / 1000);

//     if (seconds < 60) return "just now";
//     if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
//     if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
//     if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;

//     return date.toLocaleDateString();
//   };

//   /**
//    * Handles notification press (marks as read + navigates if needed).
//    */
//   const handlePress = async () => {
//     if (!notification.read) await markAsRead(notification.id);

//     if (notification.data?.type === "security_alert" && notification.alertId) {
//       router.push({
//         pathname: "/(tabs)/AlertDetailPage",
//         params: { alertId: notification.alertId },
//       });
//     }
//   };

//   // Icon configuration
//   const iconConfig = {
//     name:
//       notification.data?.type === "security_alert"
//         ? "warning-outline"
//         : "notifications-outline",
//     color: notification.data?.type === "security_alert" ? "#FF9800" : "#4CAF50",
//   };

//   return (
//     <TouchableOpacity
//       style={[styles.container, !notification.read && styles.unreadContainer]}
//       onPress={handlePress}
//       activeOpacity={0.7}
//     >
//       {/* Icon with unread indicator */}
//       <View style={styles.iconWrapper}>
//         <Icon name={iconConfig.name} size={24} color={iconConfig.color} />
//         {!notification.read && <View style={styles.unreadBadge} />}
//       </View>

//       {/* Notification content */}
//       <View style={styles.content}>
//         <Text style={styles.title} numberOfLines={1}>
//           {notification.title}
//         </Text>
//         <Text style={styles.body} numberOfLines={2}>
//           {notification.body}
//         </Text>
//         <Text style={styles.timestamp}>
//           {formatRelativeTime(notification.createdAt)}
//         </Text>
//       </View>
//     </TouchableOpacity>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flexDirection: "row",
//     padding: 16,
//     backgroundColor: "#1E1E1E",
//     borderRadius: 10,
//     marginBottom: 12,
//   },
//   unreadContainer: {
//     backgroundColor: "#2A2A2A",
//     borderLeftWidth: 3,
//     borderLeftColor: "#4CAF50",
//   },
//   iconWrapper: {
//     marginRight: 16,
//     position: "relative",
//     justifyContent: "center",
//   },
//   unreadBadge: {
//     position: "absolute",
//     top: -2,
//     right: -2,
//     width: 10,
//     height: 10,
//     borderRadius: 5,
//     backgroundColor: "#4CAF50",
//   },
//   content: {
//     flex: 1,
//     justifyContent: "center",
//   },
//   title: {
//     color: "#FFFFFF",
//     fontSize: 16,
//     fontWeight: "600",
//     marginBottom: 4,
//   },
//   body: {
//     color: "#BBBBBB",
//     fontSize: 14,
//     lineHeight: 20,
//     marginBottom: 4,
//   },
//   timestamp: {
//     color: "#999999",
//     fontSize: 12,
//   },
// });

// export default NotificationItem;
