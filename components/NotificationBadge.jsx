// import React from "react";
// import { View, Text, StyleSheet } from "react-native";
// import { useNotifications } from "../context/notificationContext";

// const NotificationBadge = ({ size = 18, style }) => {
//   const { unreadCount } = useNotifications();

//   if (unreadCount <= 0) {
//     return null;
//   }

//   return (
//     <View style={[styles.badge, { width: size, height: size }, style]}>
//       <Text style={[styles.text, { fontSize: size * 0.6 }]}>
//         {unreadCount > 99 ? "99+" : unreadCount}
//       </Text>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   badge: {
//     backgroundColor: "#D32F2F",
//     borderRadius: 50,
//     justifyContent: "center",
//     alignItems: "center",
//     position: "absolute",
//     top: -5,
//     right: -5,
//     zIndex: 10,
//     minWidth: 18,
//     minHeight: 18,
//     paddingHorizontal: 2,
//   },
//   text: {
//     color: "#FFFFFF",
//     fontWeight: "bold",
//     fontSize: 10,
//     textAlign: "center",
//   },
// });

// export default NotificationBadge;
