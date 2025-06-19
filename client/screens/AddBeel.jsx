import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  Alert,
  ActivityIndicator,
  Modal,
  Dimensions
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { addBeel } from '../utils/api';

const { width, height } = Dimensions.get('window');

const AddBeelScreen = ({ route, navigation }) => {
  const [formData, setFormData] = useState({
    name: '',
    year: '',
    water_area: '',
    t_sanction_amount: '',
    production: '',
    account_no: '',
    ifsc: '',
    branch: '',
    nom: '',
    nof: '',
    latitude: '',
    longitude: '',
    district_id: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(true);
  const [mapVisible, setMapVisible] = useState(false);
  const [region, setRegion] = useState(null);
  const [marker, setMarker] = useState(null);
  const [address, setAddress] = useState('');
  const mapRef = useRef(null);
  const { token, user } = route.params;

  useEffect(() => {
    const fetchLocation = async () => {
      await getCurrentLocation();
    };
    fetchLocation();
  }, []);

  const getCurrentLocation = async () => {
    setLocationLoading(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required');
        setLocationLoading(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeout: 15000
      });
      
      const coords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      
      setRegion({
        ...coords,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
      
      setMarker(coords);
      await getAddress(coords.latitude, coords.longitude);
      
      setFormData(prev => ({
        ...prev,
        latitude: coords.latitude.toString(),
        longitude: coords.longitude.toString(),
      }));
      
    } catch (error) {
      console.log('Location error:', error);
      Alert.alert('Error', 'Could not get location. Please try again or enter manually.');
    } finally {
      setLocationLoading(false);
    }
  };

  const getAddress = async (lat, lng) => {
    try {
      const geocode = await Location.reverseGeocodeAsync({ 
        latitude: lat, 
        longitude: lng 
      });
      if (geocode.length > 0) {
        const first = geocode[0];
        setAddress([
          first.street,
          first.city,
          first.region,
          first.postalCode,
          first.country
        ].filter(Boolean).join(', '));
      }
    } catch (error) {
      console.log('Geocoding error:', error);
      setAddress('Address not available');
    }
  };

  const handleMapPress = (e) => {
    const newCoords = e.nativeEvent.coordinate;
    setMarker(newCoords);
    getAddress(newCoords.latitude, newCoords.longitude);
  };

  const confirmLocation = () => {
    if (marker) {
      setFormData(prev => ({
        ...prev,
        latitude: marker.latitude.toString(),
        longitude: marker.longitude.toString(),
      }));
      setMapVisible(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    const requiredFields = ['name', 'year', 'water_area', 't_sanction_amount', 'production'];
    
    for (let field of requiredFields) {
      if (!formData[field].trim()) {
        Alert.alert('Validation Error', `${field.replace('_', ' ')} is required`);
        return false;
      }
    }

    if (!formData.latitude || !formData.longitude) {
      Alert.alert('Location Required', 'Please select location on map');
      return false;
    }

    return true;
  };

const handleSubmit = async () => {
  if (!validateForm()) return;

  setLoading(true);
  
  try {
    const result = await addBeel({
      ...formData,
      district_id: user.district_id || 1, 
    }, token);

    Alert.alert(
      'Success',
      result.message || 'Beel added successfully!',
      [
        {
          text: 'OK',
          onPress: () => navigation.goBack()
        }
      ]
    );
  } catch (error) {
    console.log('Submit error:', error);
    // Display a more user-friendly error message
    let errorMessage = error.message;
    if (errorMessage.includes('Network request failed')) {
      errorMessage = 'Network error. Please check your internet connection.';
    }
    Alert.alert('Error', errorMessage);
  } finally {
    setLoading(false);
  }
};

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Add New Beel</Text>
      </View>

      <View style={styles.form}>
        {/* Location Section */}
        <View style={styles.locationSection}>
          <Text style={styles.sectionTitle}>Location Information</Text>
          
          <View style={styles.locationRow}>
            <TouchableOpacity 
              style={styles.locationButton} 
              onPress={() => {
                setMapVisible(true);
                if (marker) {
                  setRegion({
                    latitude: parseFloat(formData.latitude),
                    longitude: parseFloat(formData.longitude),
                    latitudeDelta: 26.200604,
                    longitudeDelta: 92.937574,
                  });
                }
              }}
            >
              <Text style={styles.locationButtonText}>🗺️ View/Edit Location</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.refreshButton} 
              onPress={getCurrentLocation}
              disabled={locationLoading}
            >
              {locationLoading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.refreshButtonText}>🔄</Text>
              )}
            </TouchableOpacity>
          </View>
          
          {formData.latitude && formData.longitude ? (
            <View style={styles.coordinatesContainer}>
              <Text style={styles.coordinatesText}>
                Latitude: {parseFloat(formData.latitude).toFixed(6)}
              </Text>
              <Text style={styles.coordinatesText}>
                Longitude: {parseFloat(formData.longitude).toFixed(6)}
              </Text>
              {address ? (
                <Text style={styles.addressText}>📍 {address}</Text>
              ) : (
                <Text style={styles.addressText}>📍 Loading address...</Text>
              )}
            </View>
          ) : (
            <View style={styles.locationLoadingContainer}>
              {locationLoading ? (
                <>
                  <ActivityIndicator size="small" color="#3498db" />
                  <Text style={styles.locationHint}>Fetching your location...</Text>
                </>
              ) : (
                <Text style={styles.locationHint}>
                  Could not get location. Please try again or select manually.
                </Text>
              )}
            </View>
          )}
        </View>

        {/* Beel Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Beel Information</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Beel Name *"
            value={formData.name}
            onChangeText={(value) => handleInputChange('name', value)}
          />

          <TextInput
            style={styles.input}
            placeholder="Year (e.g., 2019-20) *"
            value={formData.year}
            onChangeText={(value) => handleInputChange('year', value)}
          />

          <TextInput
            style={styles.input}
            placeholder="Water Area (in hectares) *"
            value={formData.water_area}
            onChangeText={(value) => handleInputChange('water_area', value)}
            keyboardType="decimal-pad"
          />

          <TextInput
            style={styles.input}
            placeholder="Total Sanction Amount *"
            value={formData.t_sanction_amount}
            onChangeText={(value) => handleInputChange('t_sanction_amount', value)}
            keyboardType="decimal-pad"
          />

          <TextInput
            style={styles.input}
            placeholder="Production (in kg) *"
            value={formData.production}
            onChangeText={(value) => handleInputChange('production', value)}
            keyboardType="decimal-pad"
          />
        </View>

        {/* Bank Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bank Information</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Account Number"
            value={formData.account_no}
            onChangeText={(value) => handleInputChange('account_no', value)}
            keyboardType="numeric"
          />

          <TextInput
            style={styles.input}
            placeholder="IFSC Code"
            value={formData.ifsc}
            onChangeText={(value) => handleInputChange('ifsc', value.toUpperCase())}
          />

          <TextInput
            style={styles.input}
            placeholder="Branch Name"
            value={formData.branch}
            onChangeText={(value) => handleInputChange('branch', value)}
          />
        </View>

        {/* Additional Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Information</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Number of Members (NOM)"
            value={formData.nom}
            onChangeText={(value) => handleInputChange('nom', value)}
            keyboardType="numeric"
          />

          <TextInput
            style={styles.input}
            placeholder="Number of Families (NOF)"
            value={formData.nof}
            onChangeText={(value) => handleInputChange('nof', value)}
            keyboardType="numeric"
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity 
          style={[styles.submitButton, loading && styles.disabledButton]} 
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={styles.submitButtonText}>Add Beel</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Map Modal */}
      <Modal visible={mapVisible} animationType="slide">
        <View style={styles.mapContainer}>
          {region && (
            <MapView
              ref={mapRef}
              style={styles.map}
              initialRegion={region}
              region={region}
              onPress={handleMapPress}
              showsUserLocation={true}
              showsMyLocationButton={true}
              followsUserLocation={false}
              toolbarEnabled={true}
              zoomEnabled={true}
              scrollEnabled={true}
              rotateEnabled={true}
            >
              {marker && (
                <Marker 
                  coordinate={marker}
                  draggable
                  onDragEnd={(e) => {
                    const newCoords = e.nativeEvent.coordinate;
                    setMarker(newCoords);
                    getAddress(newCoords.latitude, newCoords.longitude);
                  }}
                  pinColor="#3498db"
                />
              )}
            </MapView>
          )}
          
          <View style={styles.mapControls}>
            <View style={styles.addressBox}>
              <Text style={styles.addressTitle}>Selected Location:</Text>
              {address ? (
                <Text style={styles.addressText}>{address}</Text>
              ) : (
                <Text style={styles.addressText}>Loading address...</Text>
              )}
              <Text style={styles.coordsText}>
                {marker ? `${marker.latitude.toFixed(6)}, ${marker.longitude.toFixed(6)}` : ''}
              </Text>
            </View>
            
            <View style={styles.mapButtons}>
              <TouchableOpacity 
                style={[styles.mapButton, styles.cancelButton]}
                onPress={() => setMapVisible(false)}
              >
                <Text style={styles.mapButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.mapButton, styles.confirmButton]}
                onPress={confirmLocation}
                disabled={!marker}
              >
                <Text style={styles.mapButtonText}>Confirm Location</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#3498db',
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  form: {
    padding: 20,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  locationSection: {
    backgroundColor: '#e8f5e8',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  locationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  locationButton: {
    backgroundColor: '#27ae60',
    padding: 12,
    borderRadius: 6,
    flex: 1,
    alignItems: 'center',
  },
  refreshButton: {
    backgroundColor: '#3498db',
    padding: 12,
    borderRadius: 6,
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  refreshButtonText: {
    color: 'white',
    fontSize: 18,
  },
  locationButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  locationLoadingContainer: {
    alignItems: 'center',
    padding: 10,
  },
  locationHint: {
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
    fontStyle: 'italic',
  },
  coordinatesContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
  },
  coordinatesText: {
    fontSize: 14,
    color: '#333',
  },
  addressText: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  input: {
    height: 45,
    borderColor: '#ddd',
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: 'white',
  },
  submitButton: {
    backgroundColor: '#e74c3c',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  disabledButton: {
    backgroundColor: '#bdc3c7',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  mapContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  mapControls: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 15,
  },
  addressBox: {
    marginBottom: 15,
  },
  addressTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  coordsText: {
    color: '#666',
    fontSize: 12,
  },
  mapButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  mapButton: {
    padding: 15,
    borderRadius: 8,
    width: '48%',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#e74c3c',
  },
  confirmButton: {
    backgroundColor: '#27ae60',
  },
  mapButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default AddBeelScreen;