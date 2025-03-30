// // import React, { Suspense, useRef, useState, useMemo } from "react";
// // import { View, Dimensions, StyleSheet, Text } from "react-native";
// // import { Canvas } from "@react-three/fiber/native";
// // import { useGLTF } from "@react-three/drei/native";
// // import * as THREE from "three";

// // const { width, height } = Dimensions.get("window");

// // function BirdModel() {
// //   const birdRef = useRef();
// //   const { scene } = useGLTF(require("../assets/models/bird.glb"));

// //   // ✅ Prevent infinite loop by using useMemo
// //   const processedScene = useMemo(() => {
// //     if (scene) {
// //       const box = new THREE.Box3().setFromObject(scene);
// //       const center = box.getCenter(new THREE.Vector3());
// //       scene.position.sub(center);

// //       const size = box.getSize(new THREE.Vector3());
// //       const maxDim = Math.max(size.x, size.y, size.z);
// //       const scaleFactor = Math.min(width, height) / 200;
// //       const scale = scaleFactor / maxDim;
// //       scene.scale.set(scale, scale, scale);
// //     }
// //     return scene;
// //   }, [scene]); // ✅ Runs only once

// //   return <primitive ref={birdRef} object={processedScene} />;
// // }

// // export default function BirdDisplay() {
// //   const [isLoading, setIsLoading] = useState(true);

// //   return (
// //     <View style={styles.container}>
// //       {isLoading && <Text style={styles.loadingText}>Loading Model...</Text>}

// //       <Canvas
// //         camera={{ position: [0, 0, 5], fov: 45 }}
// //         style={{ flex: 1 }}
// //         onCreated={() => setIsLoading(false)}
// //       >
// //         <ambientLight intensity={0.5} />
// //         <directionalLight position={[5, 5, 5]} intensity={0.8} />

// //         {/* ✅ FIXED: Wrapped inside a valid Suspense fallback */}
// //         <Suspense fallback={null}>
// //           <BirdModel />
// //         </Suspense>
// //       </Canvas>
// //     </View>
// //   );
// // }

// // const styles = StyleSheet.create({
// //   container: {
// //     flex: 1,
// //     backgroundColor: "#87CEEB",
// //   },
// //   loadingText: {
// //     position: "absolute",
// //     top: "50%",
// //     width: "100%",
// //     textAlign: "center",
// //     color: "#fff",
// //     fontSize: 18,
// //   },
// // });

// // useGLTF.preload(require("../assets/models/bird.glb"));

// // Rest of the file remains unchanged...
// // import React, { Suspense, useEffect, useState } from "react";
// // import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
// // import { Canvas } from "@react-three/fiber/native";
// // import {
// //   OrbitControls,
// //   useGLTF,
// //   Center,
// //   useAnimations,
// // } from "@react-three/drei/native";
// // import * as THREE from "three";

// // function AnimatedBird() {
// //   const { scene, materials, animations } = useGLTF(
// //     require("../assets/models/bird.glb"),
// //     true
// //   );
// //   const { actions, mixer } = useAnimations(animations, scene);
// //   const [animation, setAnimation] = useState("FeatherAction"); // Name of your feather animation

// //   // Set up animations
// //   useEffect(() => {
// //     if (actions[animation]) {
// //       actions[animation].play();
// //       return () => actions[animation]?.stop();
// //     }
// //   }, [actions, animation]);

// //   // Update mixer every frame
// //   useFrame((state, delta) => mixer.update(delta));

// //   // Material fixes
// //   useEffect(() => {
// //     if (materials) {
// //       Object.values(materials).forEach((material) => {
// //         material.needsUpdate = true;
// //         material.roughness = 1;
// //         material.metalness = 0;
// //       });
// //     }
// //   }, [materials]);

// //   return (
// //     <Center>
// //       <primitive
// //         object={scene}
// //         scale={[0.5, 0.5, 0.5]}
// //         rotation={[0, Math.PI / 2, 0]}
// //       />
// //     </Center>
// //   );
// // }

// // export default function BirdAnimation() {
// //   const [isAnimating, setIsAnimating] = useState(true);

// //   return (
// //     <View style={styles.container}>
// //       <Canvas
// //         camera={{ position: [0, 0, 150], fov: 50 }}
// //         gl={{
// //           powerPreference: "low-power",
// //           antialias: false,
// //           stencil: false,
// //           depth: false,
// //         }}
// //       >
// //         <ambientLight intensity={1} />
// //         <directionalLight position={[10, 10, 10]} intensity={0.8} />

// //         <Suspense
// //           fallback={<Text style={styles.loading}>Loading Bird...</Text>}
// //         >
// //           <AnimatedBird />
// //         </Suspense>

// //         <OrbitControls
// //           autoRotate={isAnimating}
// //           enableZoom={true}
// //           maxDistance={200}
// //           minDistance={50}
// //         />
// //       </Canvas>

// //       <TouchableOpacity
// //         style={styles.button}
// //         onPress={() => setIsAnimating(!isAnimating)}
// //       >
// //         <Text>{isAnimating ? "Pause" : "Play"} Animation</Text>
// //       </TouchableOpacity>
// //     </View>
// //   );
// // }

// // const styles = StyleSheet.create({
// //   container: {
// //     flex: 1,
// //     backgroundColor: "#87CEEB",
// //   },
// //   button: {
// //     position: "absolute",
// //     bottom: 40,
// //     alignSelf: "center",
// //     padding: 15,
// //     backgroundColor: "white",
// //     borderRadius: 10,
// //   },
// //   loading: {
// //     position: "absolute",
// //     alignSelf: "center",
// //     top: "50%",
// //   },
// // });

// // // Preload model
// // try {
// //   useGLTF.preload(require("../assets/models/bird.glb"), true);
// // } catch (error) {
// //   console.error("Model preload failed:", error);
// // }

// // Sattaic
// import React, { useState, useEffect, Suspense } from "react";
// import { View, Dimensions, StyleSheet, Text } from "react-native";
// import { Canvas } from "@react-three/fiber/native";
// import { useGLTF } from "@react-three/drei/native";
// import * as THREE from "three";

// // Get screen dimensions
// const { width, height } = Dimensions.get("window");

// // Bird Model Component
// function BirdModel() {
//   const [loadError, setLoadError] = useState(null);
//   let gltf;

//   // Load GLTF with error handling
//   try {
//     const assetPath = require("../assets/models/bird.glb");
//     console.log("Asset path resolved:", assetPath);

//     gltf = useGLTF(assetPath);
//     if (!gltf || !gltf.scene) {
//       throw new Error("GLTF or GLTF.scene is undefined");
//     }
//     console.log("GLTF loaded successfully:", gltf);
//   } catch (error) {
//     console.error("GLTF loading error:", error.message);
//     setLoadError(error.message);
//     return null;
//   }

//   const { scene } = gltf;

//   // Center and scale the model
//   useEffect(() => {
//     if (!scene) return;

//     try {
//       // Ensure scene is fully traversed for bounding box
//       scene.updateMatrixWorld(true); // Force update for accurate bounds
//       const box = new THREE.Box3().setFromObject(scene, true); // Include children
//       const size = box.getSize(new THREE.Vector3());
//       const center = box.getCenter(new THREE.Vector3());

//       // Log raw size before centering
//       console.log("Raw bounding box size:", size);

//       // Center the model
//       scene.position.sub(center);

//       // Scale to fit screen
//       const maxDim = Math.max(size.x, size.y, size.z);
//       const screenScaleFactor = Math.min(width, height) / 100; // ~3.6 for 360px
//       const desiredSize = 50 * screenScaleFactor; // ~180 units
//       const scale = maxDim > 0 ? desiredSize / maxDim : 1; // Avoid division by zero
//       scene.scale.set(scale, scale, scale);

//       console.log("Adjusted bounding box size:", size);
//       console.log("Calculated scale:", scale);
//     } catch (error) {
//       console.error("Error during centering/scaling:", error.message);
//       setLoadError(error.message);
//     }
//   }, [scene]);

//   if (loadError || !scene) return null;

//   return <primitive object={scene} position={[0, 0, 0]} />;
// }

// // Main Bird Display Component
// export default function BirdDisplay() {
//   const [isLoading, setIsLoading] = useState(true);
//   const [loadError, setLoadError] = useState(null);

//   const handleCanvasCreated = ({ gl }) => {
//     if (!gl) {
//       setLoadError("WebGL context initialization failed");
//     }
//     setIsLoading(false);
//   };

//   return (
//     <View style={styles.container}>
//       {isLoading && (
//         <Text style={styles.loadingText}>Loading Bird Model...</Text>
//       )}
//       {loadError && (
//         <Text style={styles.errorText}>
//           {`Error: ${loadError || "Failed to load bird model"}`}
//         </Text>
//       )}
//       <Canvas
//         camera={{ position: [0, 0, 500], fov: 45 }}
//         style={{ flex: 1 }}
//         gl={{ antialias: true, powerPreference: "high-performance" }}
//         onCreated={handleCanvasCreated}
//         onError={(error) => {
//           console.error("Canvas error:", error);
//           setLoadError("Canvas rendering failed");
//           setIsLoading(false);
//         }}
//       >
//         <ambientLight intensity={0.6} />
//         <directionalLight position={[5, 5, 5]} intensity={0.9} />
//         <Suspense fallback={null}>
//           <BirdModel />
//         </Suspense>
//       </Canvas>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#87CEEB",
//   },
//   loadingText: {
//     position: "absolute",
//     top: "50%",
//     width: "100%",
//     textAlign: "center",
//     color: "#fff",
//     fontSize: 18,
//     zIndex: 1,
//   },
//   errorText: {
//     position: "absolute",
//     top: "50%",
//     width: "100%",
//     textAlign: "center",
//     color: "#ff0000",
//     fontSize: 18,
//     zIndex: 1,
//   },
// });

// // Preload model (optional)
// try {
//   useGLTF.preload(require("../assets/models/bird.glb"));
//   console.log("Model preloaded successfully");
// } catch (e) {
//   console.error("Model preload failed:", e.message);
// }
