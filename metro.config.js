const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Ensure PNG files are included in asset extensions
config.resolver.assetExts.push('png');

module.exports = config;
