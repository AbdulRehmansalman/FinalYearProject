const { getDefaultConfig } = require("expo/metro-config");
const { getSentryExpoConfig } = require("@sentry/react-native/metro");

module.exports = (async () => {
  const defaultConfig = await getDefaultConfig(__dirname);
  const config = getSentryExpoConfig(__dirname, defaultConfig);

  config.resolver.assetExts.push("glb", "gltf", "mtl", "obj", "png", "jpg");

  config.transformer.minifierConfig = {
    mangle: false,
    compress: {
      warnings: false,
    },
  };

  return config;
})();
