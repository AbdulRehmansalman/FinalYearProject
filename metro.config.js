const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Add glb/gltf support
config.resolver.assetExts.push("glb", "gltf", "mtl", "obj", "png", "jpg");

module.exports = config;
