# Beel Monitor App - React Native Application

## Overview

The Beel Monitor App is a mobile application designed for officers to monitor and manage beel (water body) information. It includes features for authentication, viewing beel data, adding new beels, and managing user profiles.

## Features(till 19june)

- User authentication (login/logout)
- Dashboard with beel listings
- Add new beel with location mapping
- User profile management
- Password change functionality
- Settings screen

## Prerequisites

Before running the application, ensure you have the following installed:

- Node.js (v14 or later)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Android Studio/Xcode (for emulator) or Expo Go app (for physical device)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/BeelMonitorApp.git
   cd BeelMonitorApp/beel-survey-app/client
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

## Running the Application

### Using Expo Go (Recommended for Development)

1. Start the development server:
   ```bash
   npm expo start
   ```

2. Scan the QR code with:
   - The Expo Go app (available on iOS App Store and Google Play Store) on your physical device
   - Or press `i` for iOS simulator or `a` for Android emulator if you have them set up

### Building for Production

To create standalone builds:

1. For Android:
   ```bash
   expo build:android
   ```

2. For iOS:
   ```bash
   expo build:ios
   ```

## Configuration

The app connects to a backend API. The base URL is configured in `utils/api.js`:

```javascript
const BASE_URL = 'http://122.185.169.250/gisapi/public/api';
```

If you need to change this to point to a different backend, modify this URL.

## Project Structure

```
beel-survey-app/
└─ client/
   ├─ components/        # Reusable components
   ├─ screens/           # Application screens
   ├─ utils/             # Utility functions and API calls
   ├─ App.js             # Main application entry point
   └─ package.json       # Project dependencies
```

## Troubleshooting

1. **Network Errors**: Ensure your device/emulator has internet access and can reach the API server.

2. **Expo Go Issues**: If the app doesn't load in Expo Go:
   - Clear the Expo Go app cache
   - Restart the development server
   - Reinstall Expo Go if problems persist

3. **Dependency Issues**: If you encounter package conflicts:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For any issues or questions, please open an issue on the GitHub repository.

---

Happy monitoring! 🐝🌊