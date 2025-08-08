# Beel Monitor App - React Native Application

## 📋 Overview

The Beel Monitor App is a comprehensive mobile application designed for government officers to monitor, survey, and manage beel (water body) information across different districts and blocks. The app provides a complete solution for field data collection, GPS-based location tracking, image capture with geolocation, and comprehensive survey management.

## 🏗️ Technology Stack

### Frontend (Mobile App)
- **React Native** (v0.79.3) - Cross-platform mobile development
- **Expo** (v53.0.11) - Development platform and build tools
- **React Navigation** (v7.x) - Navigation library
- **React Native Maps** - Interactive maps and location services
- **Expo Location** - GPS and location services
- **Expo Image Picker** - Camera and image handling
- **React Native Chart Kit** - Data visualization
- **React Native Element Dropdown** - Enhanced dropdown components
- **Victory Native** - Advanced charting library

### Backend Integration
- **REST API** - HTTP-based API communication
- **Bearer Token Authentication** - Secure API access
- **FormData** - File upload handling
- **JSON** - Data exchange format

### Development Tools
- **Android Studio** - Android development environment
- **Xcode** - iOS development environment
- **Expo CLI** - Command-line interface
- **Metro Bundler** - JavaScript bundler

## 🚀 Features & Functionality

### 1. Authentication System
- **Officer Login**: Secure email/password authentication
- **Token-based Security**: JWT bearer token implementation
- **Session Management**: Automatic token handling
- **Role-based Access**: Officer-specific permissions

### 2. Dashboard & Analytics
- **Beel Overview**: Complete list of managed beels
- **Statistics Display**: Total beels, water area, production data
- **Interactive Charts**: Bar charts for data visualization
- **Real-time Data**: Live updates from server
- **Search & Filter**: Easy data navigation

### 3. Beel Management
- **Add New Beels**: Complete beel registration
- **Edit Existing Beels**: Update beel information
- **Location Mapping**: GPS coordinate capture
- **Validation System**: Data integrity checks
- **Master Data Integration**: District/block dropdown population

### 4. Survey System
- **Multi-phase Survey Forms**: 4-phase comprehensive surveys
- **Field Validation**: Real-time form validation
- **Progress Tracking**: Phase-by-phase completion
- **Data Persistence**: Auto-save functionality
- **Edit Capabilities**: Modify existing surveys

### 5. Image & Location Services
- **GPS Photo Capture**: Images with embedded coordinates
- **Location Permissions**: Automatic permission handling
- **Image Gallery**: Multiple image support per survey
- **Geolocation Display**: Coordinate visualization
- **Map Integration**: Interactive map views

### 6. Distance Measurement Tool
- **Interactive Maps**: Google Maps integration
- **Distance Calculation**: Haversine formula implementation
- **HQ Distance**: Distance to headquarters
- **Market Distance**: Distance to nearest market
- **Visual Markers**: Color-coded location pins
- **Real-time Updates**: Live distance calculations

### 7. Profile & Settings
- **User Profile**: Officer information display
- **Password Management**: Secure password updates
- **Settings Panel**: App configuration options
- **Logout Functionality**: Secure session termination

## 📱 App Architecture

### Screen Structure
```
App.js (Navigation Container)
├── LoginScreen - Authentication
├── HomeScreen - Analytics Dashboard
├── DashboardScreen - Beel Management
├── AddBeelScreen - Beel Creation/Editing
├── SurveyFormScreen - Survey Data Collection
├── SurveyDetailsScreen - Survey Viewing
├── DistanceToolScreen - Distance Measurement
├── ProfileScreen - User Information
├── SettingsScreen - App Settings
└── ChangePasswordScreen - Password Management
```

### Component Architecture
```
components/
└── BeelCard.js - Reusable beel display component

utils/
└── api.js - API communication layer

screens/
├── Authentication screens
├── Data management screens
├── Survey screens
└── Utility screens
```

## 🔄 Workflow

### 1. Officer Authentication
```
Login → Token Generation → Dashboard Access
```

### 2. Beel Management Workflow
```
Dashboard → Add/Edit Beel → Location Capture → Data Validation → Save
```

### 3. Survey Workflow
```
Survey Form → Phase 1 (Basic Info) → Phase 2 (Location/Images) → 
Phase 3 (Documents) → Phase 4 (Community) → Submit
```

### 4. Distance Measurement Workflow
```
Survey Form → Distance Tool → Map Selection → 
Distance Calculation → Data Return
```

## 🗄️ Data Models

### Beel Data Structure
```javascript
{
  id: number,
  name: string,
  year: string,
  district_id: number,
  water_area: number,
  t_sanction_amount: number,
  production: number,
  latitude: string,
  longitude: string,
  // ... additional fields
}
```

### Survey Data Structure
```javascript
{
  id: number,
  beel_name: string,
  year: string,
  district_id: number,
  block_id: number,
  land_area: number,
  water_depth_monsoon: number,
  water_depth_summer: number,
  lat: string,
  lng: string,
  beel_images: array,
  // ... 30+ additional survey fields
}
```

## 🔧 Installation & Setup

### Prerequisites
- Node.js (v14 or later)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Android Studio/Xcode (for emulator)
- Expo Go app (for physical device testing)

### Installation Steps
1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/BeelMonitorApp.git
   cd BeelMonitorApp/client
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure API endpoint**
   ```javascript
   // In utils/api.js
   const BASE_URL = 'http://122.185.169.250/gisapi/public/api';
   ```

4. **Start development server**
   ```bash
   npm start
   # or
   expo start
   ```

### Running the Application

#### Using Expo Go (Recommended)
1. Install Expo Go from App Store/Google Play
2. Scan QR code from terminal
3. App loads on your device

#### Using Emulator
1. Start Android Studio/Xcode emulator
2. Press `a` for Android or `i` for iOS in terminal
3. App loads in emulator

## 🏗️ Build & Deployment

### Development Build
```bash
expo build:android --type apk
expo build:ios
```

### Production Build
```bash
# Android APK
expo build:android --type app-bundle

# iOS App Store
expo build:ios --type archive
```

### EAS Build (Recommended)
```bash
# Install EAS CLI
npm install -g @expo/eas-cli

# Configure build
eas build:configure

# Build for Android
eas build --platform android

# Build for iOS
eas build --platform ios
```

## 🔐 Security Features

### Authentication
- JWT Bearer token authentication
- Secure token storage
- Automatic token refresh
- Session timeout handling

### Data Security
- HTTPS API communication
- Input validation and sanitization
- SQL injection prevention
- XSS protection

### Permissions
- Location permission handling
- Camera permission management
- Storage permission control
- Runtime permission requests

## 📊 API Integration

### Base Configuration
```javascript
const BASE_URL = 'http://122.185.169.250/gisapi/public/api';
```

### Key Endpoints
- `POST /login` - Officer authentication
- `GET /beellist` - Fetch beel data
- `POST /beeladd` - Add new beel
- `POST /beelupdate` - Update beel
- `GET /beelsurvey` - Fetch surveys
- `POST /beelsurvey` - Submit survey
- `POST /beelphotos` - Upload images
- `GET /masterdata` - Fetch dropdown data

### Error Handling
- Network error detection
- API error parsing
- User-friendly error messages
- Retry mechanisms

## 🧪 Testing

### Manual Testing
- Device testing on Android/iOS
- Network condition testing
- Permission testing
- Form validation testing

### Debugging
- React Native Debugger
- Expo development tools
- Console logging
- Network inspection

## 📱 Platform Support

### Android
- Minimum SDK: API 21 (Android 5.0)
- Target SDK: API 34 (Android 14)
- Architecture: ARM64, ARM, x86, x86_64
- Permissions: Location, Camera, Storage

### iOS
- Minimum iOS: 15.1
- Target iOS: Latest
- Architecture: ARM64
- Permissions: Location, Camera, Photo Library

## 🔧 Configuration Files

### Key Configuration
- `app.json` - Expo configuration
- `package.json` - Dependencies and scripts
- `android/app/build.gradle` - Android build config
- `ios/BeelMonitor.xcodeproj` - iOS project config

### Environment Variables
- API base URL configuration
- Google Maps API key
- Build-specific configurations

## 🐛 Troubleshooting

### Common Issues
1. **Network Errors**
   - Check internet connectivity
   - Verify API server status
   - Check firewall settings

2. **Location Issues**
   - Enable location services
   - Grant location permissions
   - Check GPS accuracy

3. **Build Issues**
   - Clear node_modules and reinstall
   - Update Expo CLI
   - Check platform-specific requirements

### Debug Commands
```bash
# Clear cache
expo start --clear

# Reset Metro bundler
npx react-native start --reset-cache

# Clean build
cd android && ./gradlew clean
```

## 📈 Performance Optimization

### Image Optimization
- Image compression before upload
- Lazy loading for image galleries
- Efficient image caching

### Data Management
- Efficient API calls
- Data caching strategies
- Optimized re-renders

### Memory Management
- Component cleanup
- Event listener removal
- Image memory management

## 🤝 Contributing

### Development Guidelines
1. Follow React Native best practices
2. Use consistent code formatting
3. Add proper error handling
4. Include comprehensive comments
5. Test on both platforms

### Code Style
- Use functional components
- Implement proper prop types
- Follow naming conventions
- Use meaningful variable names

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For any issues or questions:
- Create an issue on GitHub repository
- Contact the development team
- Check documentation for common solutions

## 🔄 Version History

### Current Version: 1.0.0
- Initial release
- Complete beel management system
- Survey functionality
- Distance measurement tool
- Image capture with GPS
- Multi-platform support

---

**Note**: This application is designed specifically for government officers managing beel (water body) surveys and requires proper authentication credentials for access.