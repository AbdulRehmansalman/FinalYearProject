const {
  getSentryExpoConfig
} = require("@sentry/react-native/metro");

const config = getSentryExpoConfig(__dirname);

// Add glb/gltf support
config.resolver.assetExts.push("glb", "gltf", "mtl", "obj", "png", "jpg");

module.exports = config;