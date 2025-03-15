// import React, { useRef, useEffect } from "react";
// import { StyleSheet, View, PanResponder, Dimensions } from "react-native";
// import { GLView } from "expo-gl";
// import { Renderer } from "expo-three";
// import { Asset } from "expo-asset";
// import * as THREE from "three";
// import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

// export default function BirdAnimation() {
//   const rendererRef = useRef(null);
//   const cameraRef = useRef(null);
//   const sceneRef = useRef(null);
//   const birdRef = useRef(null);
//   const clockRef = useRef(new THREE.Clock());
//   const animationFrameRef = useRef(null);

//   const { width, height } = Dimensions.get("window");

//   const panResponder = useRef(
//     PanResponder.create({
//       onStartShouldSetPanResponder: () => true,
//       onPanResponderMove: (event, gesture) => {
//         if (birdRef.current) {
//           birdRef.current.rotation.y += gesture.dx * 0.01;
//           birdRef.current.rotation.x += gesture.dy * 0.01;
//         }
//       },
//     })
//   ).current;

//   const onContextCreate = async (gl) => {
//     try {
//       // Initialize renderer
//       const renderer = new Renderer({ gl });
//       renderer.setSize(width, height);
//       renderer.setClearColor("#87CEEB");

//       // Initialize camera
//       const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
//       camera.position.z = 5;

//       // Initialize scene
//       const scene = new THREE.Scene();
//       scene.add(new THREE.AmbientLight(0xffffff, 0.6));

//       const spotLight = new THREE.SpotLight(0xffffff, 0.8);
//       spotLight.position.set(0, 5, 10);
//       scene.add(spotLight);

//       // Store references
//       rendererRef.current = renderer;
//       cameraRef.current = camera;
//       sceneRef.current = scene;

//       // Load bird model
//       const asset = Asset.fromModule(require("../assets/models/bird.glb"));
//       await asset.downloadAsync();
//       const fileUri = asset.localUri || asset.uri;

//       const loader = new GLTFLoader();
//       loader.load(
//         fileUri,
//         (gltf) => {
//           const birdModel = gltf.scene;

//           // Process textures to avoid unsupported pixelStorei calls
//           birdModel.traverse((child) => {
//             if (child.isMesh && child.material) {
//               const texture = child.material.map;
//               if (texture) {
//                 // Explicitly set supported properties
//                 texture.flipY = true; // Expo GL should handle this internally
//                 texture.needsUpdate = true;

//                 // Avoid unsupported settings
//                 texture.premultiplyAlpha = false; // Disable if causing issues
//                 texture.unpackAlignment = 4; // Default, typically supported
//               }
//             }
//           });

//           birdModel.scale.set(0.5, 0.5, 0.5);
//           sceneRef.current.add(birdModel);
//           birdRef.current = birdModel;
//           animate();
//         },
//         undefined,
//         (error) => console.error("Error loading model:", error)
//       );
//     } catch (error) {
//       console.error("Error in onContextCreate:", error);
//     }
//   };

//   const animate = () => {
//     if (
//       birdRef.current &&
//       rendererRef.current &&
//       sceneRef.current &&
//       cameraRef.current
//     ) {
//       const delta = clockRef.current.getDelta();
//       birdRef.current.position.y = Math.sin(clockRef.current.elapsedTime) * 0.2;
//       birdRef.current.rotation.y += 0.01;
//       rendererRef.current.render(sceneRef.current, cameraRef.current);
//     }
//     animationFrameRef.current = requestAnimationFrame(animate);
//   };

//   useEffect(() => {
//     return () => {
//       if (animationFrameRef.current) {
//         cancelAnimationFrame(animationFrameRef.current);
//       }
//       if (rendererRef.current) {
//         rendererRef.current.dispose();
//       }
//     };
//   }, []);

//   return (
//     <View style={styles.container} {...panResponder.panHandlers}>
//       <GLView style={styles.glView} onContextCreate={onContextCreate} />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#fff",
//   },
//   glView: {
//     flex: 1,
//   },
// });
