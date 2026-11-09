// Build-time map key (for a custom Android development/production build).
// This is NOT the Firebase apiKey. Restrict it to Maps SDK for Android and
// your Android application ID + signing SHA-1 in Google Cloud.
export default ({ config }) => ({
  ...config,
  plugins: [
    ...(config.plugins || []),
    ...(process.env.GOOGLE_MAPS_API_KEY_ANDROID
      ? [['react-native-maps', { androidGoogleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY_ANDROID }]]
      : []),
  ],
});
