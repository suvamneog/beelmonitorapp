import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dimensions,
  Platform,
  ActivityIndicator,
  SafeAreaView,
  StatusBar
} from 'react-native';
import MapView, { Marker, UrlTile, PROVIDER_DEFAULT  } from 'react-native-maps';
import * as Location from 'expo-location';

const { width, height } = Dimensions.get('window');
const isSmallDevice = width < 375;

// Calculate distance between two points using Haversine formula
const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

const DistanceToolScreen = ({ route, navigation }) => {
  const { 
    beelLocation, 
    initialHqDistance, 
    initialMarketDistance,
    onDistanceUpdate 
  } = route.params || {};

  const [markers, setMarkers] = useState({
    beel: null,
    hq: null,
    market: null
  });
  const [mode, setMode] = useState('view'); // 'view', 'hq', 'market'
  const [distances, setDistances] = useState({
    hq: initialHqDistance || '',
    market: initialMarketDistance || ''
  });
  const [region, setRegion] = useState({
    latitude: 26.123456,
    longitude: 92.987654,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [mapReady, setMapReady] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const mapRef = useRef(null);

  useEffect(() => {
    console.log('DistanceToolScreen mounted with beelLocation:', beelLocation);
    
    if (beelLocation && (beelLocation.lat || beelLocation.lng)) {
      const lat = parseFloat(beelLocation.lat) || 26.123456;
      const lng = parseFloat(beelLocation.lng) || 92.987654;

      console.log('Setting beel marker at:', { lat, lng });
      const beelPos = { latitude: lat, longitude: lng };
      setMarkers(prev => ({ ...prev, beel: beelPos }));
      setRegion({
        latitude: lat,
        longitude: lng,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    } else {
      console.log('No valid beel location, using default region');
      setRegion({
        latitude: 26.123456,
        longitude: 92.987654,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }

    // Initialize distances if provided
    if (initialHqDistance) {
      setDistances(prev => ({ ...prev, hq: initialHqDistance }));
    }
    if (initialMarketDistance) {
      setDistances(prev => ({ ...prev, market: initialMarketDistance }));
    }
  }, [beelLocation, initialHqDistance, initialMarketDistance]);

  const handleMapPress = (event) => {
    if (mode === 'view' || !mapReady) return;
    
    const { latitude, longitude } = event.nativeEvent.coordinate;
    const newMarkers = { ...markers };
    
    if (mode === 'hq') {
      newMarkers.hq = { latitude, longitude };
      let distance = 0;
      if (markers.beel && markers.beel.latitude !== 26.123456 && markers.beel.longitude !== 92.987654) {
        distance = calculateDistance(
          markers.beel.latitude, markers.beel.longitude,
          latitude, longitude
        );
      }
      const newDistances = { ...distances, hq: distance.toFixed(2) };
      setDistances(newDistances);
      
      Alert.alert(
        'HQ Location Set', 
        markers.beel && markers.beel.latitude !== 26.123456 && markers.beel.longitude !== 92.987654
          ? `Distance from beel to HQ: ${distance.toFixed(2)} km`
          : 'HQ location set. Upload image with GPS data to calculate distance.',
        [{ text: 'OK' }]
      );
    } else if (mode === 'market') {
      newMarkers.market = { latitude, longitude };
      let distance = 0;
      if (markers.beel && markers.beel.latitude !== 26.123456 && markers.beel.longitude !== 92.987654) {
        distance = calculateDistance(
          markers.beel.latitude, markers.beel.longitude,
          latitude, longitude
        );
      }
      const newDistances = { ...distances, market: distance.toFixed(2) };
      setDistances(newDistances);
      
      Alert.alert(
        'Market Location Set', 
        markers.beel && markers.beel.latitude !== 26.123456 && markers.beel.longitude !== 92.987654
          ? `Distance from beel to market: ${distance.toFixed(2)} km`
          : 'Market location set. Upload image with GPS data to calculate distance.',
        [{ text: 'OK' }]
      );
    }
    
    setMarkers(newMarkers);
    setMode('view');
  };

  const clearMarker = (type) => {
    Alert.alert(
      'Clear Location',
      `Are you sure you want to clear the ${type === 'hq' ? 'HQ' : 'Market'} location?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            const newMarkers = { ...markers };
            newMarkers[type] = null;
            setMarkers(newMarkers);
            
            if (type === 'hq') {
              setDistances(prev => ({ ...prev, hq: '' }));
            } else if (type === 'market') {
              setDistances(prev => ({ ...prev, market: '' }));
            }
          }
        }
      ]
    );
  };

  const getCurrentLocation = async () => {
    setLoadingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required', 
          'Location permission is required to center the map on your current location'
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeout: 10000,
      });

      const newRegion = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };

      setRegion(newRegion);
      if (mapRef.current) {
        mapRef.current.animateToRegion(newRegion, 1000);
      }
    } catch (error) {
      console.error('Location error:', error);
      Alert.alert(
        'Location Error', 
        'Failed to get your current location. Please try again or manually navigate the map.'
      );
    } finally {
      setLoadingLocation(false);
    }
  };

  const centerOnBeel = () => {
    if (markers.beel && markers.beel.latitude !== 26.123456 && markers.beel.longitude !== 92.987654) {
      const newRegion = {
        latitude: markers.beel.latitude,
        longitude: markers.beel.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      setRegion(newRegion);
      if (mapRef.current) {
        mapRef.current.animateToRegion(newRegion, 1000);
      }
    } else {
      Alert.alert(
        'No GPS Location', 
        'Upload an image with GPS location data to center on the actual beel location.'
      );
    }
  };

  const handleSave = () => {
    if (onDistanceUpdate) {
      if (distances.hq) {
        onDistanceUpdate('distance_hq', distances.hq);
      }
      if (distances.market) {
        onDistanceUpdate('distance_market', distances.market);
      }
    }
    
    Alert.alert(
      'Distances Saved',
      'Distance measurements have been saved to the survey form.',
      [
        {
          text: 'OK',
          onPress: () => navigation.goBack()
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#3498db" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>📏 Distance Measurement Tool</Text>
        <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>

      {/* Instructions */}
      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionsText}>
          {markers.beel && markers.beel.latitude !== 26.123456 && markers.beel.longitude !== 92.987654
            ? 'Tap buttons below to set HQ/Market locations, then tap on map' 
            : 'Upload an image with GPS data first for accurate distance measurement'
          }
        </Text>
      </View>

      {/* Mode Selection Buttons */}
      <View style={styles.modeButtonsContainer}>
        <TouchableOpacity
          onPress={() => setMode('hq')}
          style={[
            styles.modeButton,
            { backgroundColor: mode === 'hq' ? '#e74c3c' : '#ecf0f1' }
          ]}
        >
          <Text style={[
            styles.modeButtonText,
            { color: mode === 'hq' ? 'white' : '#2c3e50' }
          ]}>
            📍 Set HQ
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={() => setMode('market')}
          style={[
            styles.modeButton,
            { backgroundColor: mode === 'market' ? '#27ae60' : '#ecf0f1' }
          ]}
        >
          <Text style={[
            styles.modeButtonText,
            { color: mode === 'market' ? 'white' : '#2c3e50' }
          ]}>
            🏪 Set Market
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={() => setMode('view')}
          style={[
            styles.modeButton,
            { backgroundColor: mode === 'view' ? '#34495e' : '#ecf0f1' }
          ]}
        >
          <Text style={[
            styles.modeButtonText,
            { color: mode === 'view' ? 'white' : '#2c3e50' }
          ]}>
             View
          </Text>
        </TouchableOpacity>
      </View>

      {/* Distance Display */}
      <View style={styles.distanceContainer}>
        <View style={styles.distanceCard}>
          <View style={styles.distanceHeader}>
            <Text style={styles.distanceLabel}>HQ Distance:</Text>
            {markers.hq && (
              <TouchableOpacity
                onPress={() => clearMarker('hq')}
                style={styles.clearButton}
              >
                <Text style={styles.clearButtonText}>Clear</Text>
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.distanceValue}>
            {distances.hq ? `${distances.hq} km` : 'Not set'}
          </Text>
        </View>
        
        <View style={styles.distanceCard}>
          <View style={styles.distanceHeader}>
            <Text style={styles.distanceLabel}>Market Distance:</Text>
            {markers.market && (
              <TouchableOpacity
                onPress={() => clearMarker('market')}
                style={styles.clearButton}
              >
                <Text style={styles.clearButtonText}>Clear</Text>
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.distanceValue}>
            {distances.market ? `${distances.market} km` : 'Not set'}
          </Text>
        </View>
      </View>

      {/* Map Container */}
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_DEFAULT} 
          initialRegion={region}
          onMapReady={() => {
            console.log('Map is ready');
            setMapReady(true);
          }}
          onPress={handleMapPress}
          showsUserLocation={true}
          showsMyLocationButton={false}
          zoomEnabled={true}
          scrollEnabled={true}
          rotateEnabled={true}
          pitchEnabled={true}
        >
          <UrlTile
            urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            maximumZ={19}
            flipY={false}
          />

          {/* Beel Marker */}
          {markers.beel && (
            <Marker
              coordinate={markers.beel}
              title="Beel Location"
              description="Image GPS Location"
              pinColor="#3498db"
            />
          )}

          {/* HQ Marker */}
          {markers.hq && (
            <Marker
              coordinate={markers.hq}
              title="HQ Location"
              pinColor="#e74c3c"
            />
          )}

          {/* Market Marker */}
          {markers.market && (
            <Marker
              coordinate={markers.market}
              title="Market Location"
              pinColor="#27ae60"
            />
          )}
        </MapView>

        {!mapReady && (
          <View style={styles.mapLoadingOverlay}>
            <ActivityIndicator size="large" color="#3498db" />
            <Text style={styles.loadingText}>Loading Map...</Text>
          </View>
        )}

        {/* Mode Instruction Overlay */}
        {mode !== 'view' && (
          <View style={styles.instructionOverlay}>
            <View style={styles.instructionCard}>
              <Text style={styles.instructionText}>
                {mode === 'hq' 
                  ? 'Tap anywhere on the map to set HQ location and calculate distance' 
                  : 'Tap anywhere on the map to set Market location and calculate distance'
                }
              </Text>
            </View>
          </View>
        )}

        {/* No Beel Location Overlay */}
        {(!markers.beel || (markers.beel && markers.beel.latitude === 26.123456 && markers.beel.longitude === 92.987654)) && (
          <View style={styles.noBeelOverlay}>
            <View style={styles.noBeelCard}>
              <Text style={styles.noBeelIcon}>🏞️</Text>
              <Text style={styles.noBeelTitle}>No GPS Location Available</Text>
              <Text style={styles.noBeelText}>
                Upload an image with GPS location data to enable accurate distance measurement. You can still set HQ and Market locations, but distances will be calculated from default coordinates.
              </Text>
            </View>
          </View>
        )}

        {/* Map Controls */}
        <View style={styles.mapControls}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={getCurrentLocation}
            disabled={loadingLocation}
          >
            {loadingLocation ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.controlButtonText}>📍</Text>
            )}
          </TouchableOpacity>
          
          {markers.beel && (
            <TouchableOpacity
              style={[styles.controlButton, styles.beelButton]}
              onPress={centerOnBeel}
            >
              <Text style={styles.controlButtonText}>🏞️</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#3498db' }]} />
          <Text style={styles.legendText}>Beel (Image Location)</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#e74c3c' }]} />
          <Text style={styles.legendText}>HQ Location</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#27ae60' }]} />
          <Text style={styles.legendText}>Market Location</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#3498db',
    paddingVertical: 15,
    paddingHorizontal: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  backButton: {
    padding: 5,
  },
  backButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerTitle: {
    color: 'white',
    fontSize: isSmallDevice ? 16 : 18,
    fontWeight: '600',
    textAlign: 'center',
    flex: 1,
  },
  saveButton: {
    backgroundColor: '#27ae60',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  instructionsContainer: {
    backgroundColor: '#e8f5e8',
    padding: 12,
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#27ae60',
  },
  instructionsText: {
    color: '#2c3e50',
    fontSize: isSmallDevice ? 12 : 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  modeButtonsContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  modeButtonText: {
    fontSize: isSmallDevice ? 12 : 14,
    fontWeight: '500',
  },
  distanceContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  distanceCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  distanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  distanceLabel: {
    color: '#2c3e50',
    fontSize: isSmallDevice ? 12 : 14,
    fontWeight: '500',
  },
  clearButton: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  clearButtonText: {
    color: '#e74c3c',
    fontSize: 12,
  },
  distanceValue: {
    color: '#3498db',
    fontSize: isSmallDevice ? 16 : 18,
    fontWeight: 'bold',
  },
  mapContainer: {
    flex: 1,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  map: {
    flex: 1,
  },
  mapLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  loadingText: {
    marginTop: 10,
    color: '#3498db',
    fontSize: 14,
  },
  instructionOverlay: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    zIndex: 1,
  },
  instructionCard: {
    backgroundColor: '#f39c12',
    padding: 12,
    borderRadius: 6,
    borderLeftWidth: 4,
    borderLeftColor: '#e67e22',
  },
  instructionText: {
    color: 'white',
    fontSize: isSmallDevice ? 12 : 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  noBeelOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  noBeelCard: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 8,
    alignItems: 'center',
    maxWidth: width * 0.8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  noBeelIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  noBeelTitle: {
    fontSize: isSmallDevice ? 16 : 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
    textAlign: 'center',
  },
  noBeelText: {
    fontSize: isSmallDevice ? 12 : 14,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 20,
  },
  mapControls: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    flexDirection: 'column',
    gap: 8,
    zIndex: 1,
  },
  controlButton: {
    backgroundColor: '#3498db',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  beelButton: {
    backgroundColor: '#27ae60',
  },
  controlButtonText: {
    fontSize: 20,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: isSmallDevice ? 11 : 12,
    color: '#6c757d',
  },
});

export default DistanceToolScreen;