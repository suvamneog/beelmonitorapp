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
import { Picker } from '@react-native-picker/picker';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { addBeel, updateBeel, getMasterData } from '../utils/api';

const { width, height } = Dimensions.get('window');

const AddBeelScreen = ({ route, navigation }) => {
  const { token, user, beelData, isEdit } = route.params || {};
  const [formData, setFormData] = useState({
    id: beelData?.id || '',
    name: beelData?.name || '',
    year: beelData?.year || '',
    water_area: beelData?.water_area || '',
    t_sanction_amount: beelData?.t_sanction_amount || '',
    production: beelData?.production || '',
    pm: beelData?.pm || '',
    fp: beelData?.fp || '',
    account_no: beelData?.account_no || '',
    ifsc: beelData?.ifsc || '',
    branch: beelData?.branch || '',
    nom: beelData?.nom || '',
    nof: beelData?.nof || '',
    latitude: beelData?.latitude || '',
    longitude: beelData?.longitude || '',
    district_id: beelData?.district_id || user?.district_id || 1
  });
  
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(!isEdit);
  const [mapVisible, setMapVisible] = useState(false);
  const [region, setRegion] = useState(null);
  const [marker, setMarker] = useState(null);
  const [address, setAddress] = useState('');
  const [districts, setDistricts] = useState([]);
  const [loadingDistricts, setLoadingDistricts] = useState(true);
  const mapRef = useRef(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const masterData = await getMasterData(token);
        setDistricts(masterData.data.district);
        
        const initialDistrictId = beelData?.district_id || user?.district_id || 1;
        
        setFormData(prev => ({
          ...prev,
          district_id: initialDistrictId
        }));
      } catch (error) {
        console.error('Error fetching districts:', error);
        Alert.alert('Error', 'Failed to load district data');
      } finally {
        setLoadingDistricts(false);
      }

      if (!isEdit && !beelData?.latitude) {
        await getCurrentLocation();
      } else if (beelData?.latitude && beelData?.longitude) {
        const coords = {
          latitude: parseFloat(beelData.latitude),
          longitude: parseFloat(beelData.longitude)
        };
        setMarker(coords);
        setRegion({
          ...coords,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
        getAddress(coords.latitude, coords.longitude);
      }
    };
    
    fetchInitialData();
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
    // Required fields
    const requiredFields = [
      { field: 'name', label: 'Beel Name', type: 'string', maxLength: 255 },
      { field: 'year', label: 'Year', type: 'string' },
      { field: 'district_id', label: 'District', type: 'numeric' }
    ];

    // Validate required fields
    for (let {field, label, type, maxLength} of requiredFields) {
      const value = formData[field]?.toString().trim();
      
      if (!value) {
        Alert.alert('Validation Error', `${label} is required`);
        return false;
      }

      if (type === 'numeric' && isNaN(Number(value))) {
        Alert.alert('Validation Error', `${label} must be a number`);
        return false;
      }

      if (maxLength && value.length > maxLength) {
        Alert.alert('Validation Error', `${label} cannot exceed ${maxLength} characters`);
        return false;
      }
    }

    // Validate numeric fields
    const numericFields = [
      { field: 'water_area', label: 'Water Area' },
      { field: 't_sanction_amount', label: 'Total Sanction Amount' },
      { field: 'production', label: 'Production' },
      { field: 'nom', label: 'Number of Members' },
      { field: 'nof', label: 'Number of Families' }
    ];

    for (let {field, label} of numericFields) {
      if (formData[field] && isNaN(Number(formData[field]))) {
        Alert.alert('Validation Error', `${label} must be a number`);
        return false;
      }
    }

    // Validate account number
    if (formData.account_no) {
      const accountNo = formData.account_no.toString();
      if (accountNo.length < 9 || accountNo.length > 20 || !/^\d+$/.test(accountNo)) {
        Alert.alert('Validation Error', 'Account Number must be 9-20 digits');
        return false;
      }
    }

    // Validate IFSC code
    if (formData.ifsc && formData.ifsc.length > 11) {
      Alert.alert('Validation Error', 'IFSC Code cannot exceed 11 characters');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    
    try {
      // Prepare data with proper types
      const submissionData = {
        ...formData,
        water_area: formData.water_area ? parseFloat(formData.water_area) : null,
        t_sanction_amount: formData.t_sanction_amount ? parseFloat(formData.t_sanction_amount) : null,
        production: formData.production ? parseFloat(formData.production) : null,
        nom: formData.nom ? parseInt(formData.nom) : null,
        nof: formData.nof ? parseInt(formData.nof) : null,
        district_id: parseInt(formData.district_id)
      };

      let result;
      if (isEdit) {
        result = await updateBeel(submissionData, token);
      } else {
        result = await addBeel(submissionData, token);
      }

      Alert.alert(
        'Success',
        result.message || `Beel ${isEdit ? 'updated' : 'added'} successfully!`,
        [
          {
            text: 'OK',
            onPress: () => {
              navigation.navigate('Dashboard', {
                token,
                user,
                shouldRefresh: true
              });
            }
          }
        ]
      );
    } catch (error) {
      console.log('Submit error:', error);
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
        <Text style={styles.title}>{isEdit ? 'Edit Beel' : 'Add New Beel'}</Text>
      </View>

      <View style={styles.form}>
        {/* District Picker */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>District *</Text>
          {loadingDistricts ? (
            <ActivityIndicator size="small" color="#3498db" />
          ) : (
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.district_id}
                style={styles.picker}
                onValueChange={(itemValue) => handleInputChange('district_id', itemValue)}
              >
                {districts.map((district) => (
                  <Picker.Item 
                    key={district.id} 
                    label={district.name} 
                    value={district.id} 
                  />
                ))}
              </Picker>
            </View>
          )}
        </View>

        {/* Location Information */}
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
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
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
            maxLength={255}
          />

          <TextInput
            style={styles.input}
            placeholder="Year (e.g., 2019-20) *"
            value={formData.year}
            onChangeText={(value) => handleInputChange('year', value)}
          />

          <TextInput
            style={styles.input}
            placeholder="Water Area (in hectares)"
            value={formData.water_area}
            onChangeText={(value) => handleInputChange('water_area', value.replace(/[^0-9.]/g, ''))}
            keyboardType="decimal-pad"
          />

          <TextInput
            style={styles.input}
            placeholder="Total Sanction Amount"
            value={formData.t_sanction_amount}
            onChangeText={(value) => handleInputChange('t_sanction_amount', value.replace(/[^0-9.]/g, ''))}
            keyboardType="decimal-pad"
          />

          <TextInput
            style={styles.input}
            placeholder="Production (in kg)"
            value={formData.production}
            onChangeText={(value) => handleInputChange('production', value.replace(/[^0-9.]/g, ''))}
            keyboardType="decimal-pad"
          />
        </View>

        {/* Project Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Project Information</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Project Manager (PM)"
            value={formData.pm}
            onChangeText={(value) => handleInputChange('pm', value)}
          />

          <TextInput
            style={styles.input}
            placeholder="Fisheries Personnel (FP)"
            value={formData.fp}
            onChangeText={(value) => handleInputChange('fp', value)}
          />
        </View>

        {/* Bank Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bank Information</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Account Number (9-20 digits)"
            value={formData.account_no}
            onChangeText={(value) => handleInputChange('account_no', value.replace(/[^0-9]/g, ''))}
            keyboardType="numeric"
            maxLength={20}
          />

          <TextInput
            style={styles.input}
            placeholder="IFSC Code (max 11 chars)"
            value={formData.ifsc}
            onChangeText={(value) => handleInputChange('ifsc', value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
            maxLength={11}
          />

          <TextInput
            style={styles.input}
            placeholder="Branch Name"
            value={formData.branch}
            onChangeText={(value) => handleInputChange('branch', value)}
            maxLength={255}
          />
        </View>

        {/* Additional Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Information</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Number of Members (NOM)"
            value={formData.nom}
            onChangeText={(value) => handleInputChange('nom', value.replace(/[^0-9]/g, ''))}
            keyboardType="numeric"
          />

          <TextInput
            style={styles.input}
            placeholder="Number of Families (NOF)"
            value={formData.nof}
            onChangeText={(value) => handleInputChange('nof', value.replace(/[^0-9]/g, ''))}
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
            <Text style={styles.submitButtonText}>
              {isEdit ? 'Update Beel' : 'Add Beel'}
            </Text>
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
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    marginBottom: 15,
    backgroundColor: 'white',
    overflow: 'hidden',
  },
  picker: {
    height: 45,
    width: '100%',
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