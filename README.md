# CO2 Monitor Mobile App

A React Native Expo application for monitoring CO2 levels from ESP32 sensors via MQTT.

## Features

- Real-time CO2 monitoring from dual sensors
- MQTT connectivity to ESP32 devices
- Push notifications for high CO2 levels
- Historical data visualization
- Configurable thresholds and settings
- Dark/light theme support

## Development Setup

### Prerequisites

1. Install Node.js (v18 or later)
2. Install Expo CLI: `npm install -g @expo/cli`
3. Install EAS CLI: `npm install -g eas-cli`

### Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## Building for Mobile Devices

Since this app uses native dependencies (MQTT, notifications), you need to create a development build:

### Step 1: Setup EAS Build

1. Create an Expo account at https://expo.dev
2. Login to EAS CLI:
   ```bash
   eas login
   ```

3. Configure your project:
   ```bash
   eas build:configure
   ```

### Step 2: Create Development Build

For Android:
```bash
eas build --platform android --profile development
```

For iOS:
```bash
eas build --platform ios --profile development
```

### Step 3: Install Development Build

1. Download the APK/IPA from the EAS build dashboard
2. Install on your device
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Scan the QR code with your development build

### Step 4: Create Production Build

For Android APK:
```bash
eas build --platform android --profile preview
```

For iOS TestFlight:
```bash
eas build --platform ios --profile preview
```

For Production:
```bash
eas build --platform all --profile production
```

## Configuration

### MQTT Settings

The app connects to HiveMQ Cloud with these settings (configured in `contexts/CO2Context.tsx`):

- Host: `495e05bee6cb40cd97eeb41fc597850e.s1.eu.hivemq.cloud`
- Port: `8884` (WebSocket Secure)
- Username: `esp32-device1`
- Password: `Password@2025`
- Topic: `sensors/esp32-co2-01/data`

### ESP32 Compatibility

This app is designed to work with ESP32 devices running the provided CO2 monitoring firmware that publishes data in this JSON format:

```json
{
  "device": "esp32-co2-01",
  "co2_1": 450,
  "co2_2": 460,
  "timestamp": 1640995200,
  "wifi_rssi": -45,
  "heap_free": 234567
}
```

## Deployment Options

### Option 1: EAS Build (Recommended)
- Builds in the cloud
- Supports both iOS and Android
- Automatic code signing
- Easy distribution

### Option 2: Local Build
```bash
# Android
npx expo run:android

# iOS (macOS only)
npx expo run:ios
```

### Option 3: Expo Application Services
Use EAS Submit to distribute to app stores:
```bash
eas submit --platform android
eas submit --platform ios
```

## Troubleshooting

### Common Issues

1. **MQTT Connection Failed**
   - Check internet connection
   - Verify HiveMQ Cloud credentials
   - Ensure ESP32 is publishing data

2. **Notifications Not Working**
   - Grant notification permissions
   - Check notification settings in app
   - Verify device notification settings

3. **Build Errors**
   - Clear cache: `npx expo install --fix`
   - Reset Metro: `npx expo start --clear`
   - Check EAS build logs

### Development Tips

- Use `npx expo doctor` to check for common issues
- Monitor logs with `npx expo logs`
- Test on physical devices for best results
- Use EAS Build for production deployments

## License

MIT License - see LICENSE file for details