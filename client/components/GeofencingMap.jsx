import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dimensions,
  Platform
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
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

const GeofencingMap = ({ 
  beelLocation, 
  onDistanceUpdate, 
  initialHqDistance, 
  initialMarketDistance,
  isVisible 
}) => {
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
    latitude: 22.5726,
    longitude: 88.3639,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  useEffect(() => {
    if (beelLocation && beelLocation.lat && beelLocation.lng) {
      const beelPos = { 
        latitude: parseFloat(beelLocation.lat), 
        longitude: parseFloat(beelLocation.lng) 
      };
       if (!beelLocation || (!beelLocation.lat && !beelLocation.lng)) {
    Alert.alert('Location Required', 'Please set a beel location first');
    return;
  }
  
      setMarkers(prev => ({ ...prev, beel: beelPos }));
      setRegion({
        latitude: beelPos.latitude,
        longitude: beelPos.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    }
  }, [beelLocation]);

  const handleMapPress = (event) => {
    if (mode === 'view') return;
    
    if (!markers.beel) {
      Alert.alert('Error', 'Please set beel location first by uploading an image with location data');
      return;
    }

    const { latitude, longitude } = event.nativeEvent.coordinate;
    const newMarkers = { ...markers };
    
    if (mode === 'hq') {
      newMarkers.hq = { latitude, longitude };
      const distance = calculateDistance(
        markers.beel.latitude, markers.beel.longitude,
        latitude, longitude
      );
      const newDistances = { ...distances, hq: distance.toFixed(2) };
      setDistances(newDistances);
      onDistanceUpdate('distance_hq', distance.toFixed(2));
      Alert.alert('Success', `HQ location set. Distance: ${distance.toFixed(2)} km`);
    } else if (mode === 'market') {
      newMarkers.market = { latitude, longitude };
      const distance = calculateDistance(
        markers.beel.latitude, markers.beel.longitude,
        latitude, longitude
      );
      const newDistances = { ...distances, market: distance.toFixed(2) };
      setDistances(newDistances);
      onDistanceUpdate('distance_market', distance.toFixed(2));
      Alert.alert('Success', `Market location set. Distance: ${distance.toFixed(2)} km`);
    }
    
    setMarkers(newMarkers);
    setMode('view');
  };

  const clearMarker = (type) => {
    const newMarkers = { ...markers };
    newMarkers[type] = null;
    setMarkers(newMarkers);
    
    if (type === 'hq') {
      setDistances(prev => ({ ...prev, hq: '' }));
      onDistanceUpdate('distance_hq', '');
    } else if (type === 'market') {
      setDistances(prev => ({ ...prev, market: '' }));
      onDistanceUpdate('distance_market', '');
    }
  };

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required to use this feature');
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.BestForNavigation,
      });

      const newRegion = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };

      setRegion(newRegion);
    } catch (error) {
      Alert.alert('Error', 'Failed to get current location');
    }
  };

  if (!isVisible) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Distance Measurement Tool</Text>
        
        <View style={styles.buttonRow}>
          <TouchableOpacity
            onPress={() => setMode('hq')}
            style={[
              styles.modeButton,
              mode === 'hq' && styles.activeModeButton,
              { backgroundColor: mode === 'hq' ? '#e74c3c' : '#ecf0f1' }
            ]}
          >
            <Text style={[
              styles.modeButtonText,
              mode === 'hq' && styles.activeModeButtonText
            ]}>
              📍 Set HQ
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => setMode('market')}
            style={[
              styles.modeButton,
              mode === 'market' && styles.activeModeButton,
              { backgroundColor: mode === 'market' ? '#27ae60' : '#ecf0f1' }
            ]}
          >
            <Text style={[
              styles.modeButtonText,
              mode === 'market' && styles.activeModeButtonText
            ]}>
              🏪 Set Market
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => setMode('view')}
            style={[
              styles.modeButton,
              mode === 'view' && styles.activeModeButton,
              { backgroundColor: mode === 'view' ? '#34495e' : '#ecf0f1' }
            ]}
          >
            <Text style={[
              styles.modeButtonText,
              mode === 'view' && styles.activeModeButtonText
            ]}>
              👁️ View
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.distanceRow}>
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
      </View>

      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          region={region}
          onRegionChangeComplete={setRegion}
          onPress={handleMapPress}
          provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
          showsUserLocation={true}
          showsMyLocationButton={false}
        >
          {markers.beel && (
            <Marker
              coordinate={markers.beel}
              title="Beel Location"
              description={`Lat: ${markers.beel.latitude.toFixed(6)}, Lng: ${markers.beel.longitude.toFixed(6)}`}
              pinColor="blue"
            />
          )}
          
          {markers.hq && (
            <Marker
              coordinate={markers.hq}
              title="HQ Location"
              description={`Distance: ${distances.hq} km`}
              pinColor="red"
            />
          )}
          
          {markers.market && (
            <Marker
              coordinate={markers.market}
              title="Market Location"
              description={`Distance: ${distances.market} km`}
              pinColor="green"
            />
          )}
        </MapView>

        {mode !== 'view' && (
          <View style={styles.instructionOverlay}>
            <View style={styles.instructionCard}>
              <Text style={styles.instructionText}>
                {mode === 'hq' ? '📍 Tap on the map to set HQ location' : '🏪 Tap on the map to set Market location'}
              </Text>
            </View>
          </View>
        )}

        {!markers.beel && (
          <View style={styles.noBeelOverlay}>
            <View style={styles.noBeelCard}>
              <Text style={styles.noBeelIcon}>📍</Text>
              <Text style={styles.noBeelTitle}>Beel Location Required</Text>
              <Text style={styles.noBeelText}>
                Please upload an image with location data first to set the beel location on the map.
              </Text>
            </View>
          </View>
        )}

        <TouchableOpacity
          style={styles.locationButton}
          onPress={getCurrentLocation}
        >
          <Text style={styles.locationButtonText}>📍</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#3498db' }]} />
          <Text style={styles.legendText}>Beel Location</Text>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 8,
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
  header: {
    padding: 16,
    backgroundColor: '#3498db',
  },
  headerTitle: {
    color: 'white',
    fontSize: isSmallDevice ? 16 : 18,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  activeModeButton: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  modeButtonText: {
    fontSize: isSmallDevice ? 12 : 14,
    fontWeight: '500',
    color: '#2c3e50',
  },
  activeModeButtonText: {
    color: 'white',
  },
  distanceRow: {
    flexDirection: 'row',
    gap: 12,
  },
  distanceCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 6,
    padding: 12,
  },
  distanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  distanceLabel: {
    color: 'white',
    fontSize: isSmallDevice ? 12 : 14,
    fontWeight: '500',
  },
  clearButton: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  clearButtonText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
  },
  distanceValue: {
    color: 'white',
    fontSize: isSmallDevice ? 16 : 18,
    fontWeight: 'bold',
  },
  mapContainer: {
    position: 'relative',
    height: 300,
  },
  map: {
    flex: 1,
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
  locationButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: '#3498db',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
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
  locationButtonText: {
    fontSize: 20,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    backgroundColor: '#f8f9fa',
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

export default GeofencingMap;