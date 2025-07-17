import React, { useState, useEffect, useCallback, useMemo,
} from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView,
  Alert,
  SafeAreaView,
  ActivityIndicator,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
  Image,
  PermissionsAndroid
} from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { 
  submitSurvey, 
  updateSurvey, 
  getMasterData, 
  uploadBeelPhoto  
} from '../utils/api';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { Alert as RNAlert } from 'react-native';
import GeofencingMapModal from "../components/GeofencingMap";

const { width, height } = Dimensions.get('window');
const isSmallDevice = width < 375;

// Create DropdownField component outside of main component
const DropdownField = React.memo(({ label, value, onChange, options, error, loading }) => {
  const [isFocus, setIsFocus] = useState(false);
  
  return (
    <View style={styles.inputGroup}>
      <View style={styles.labelContainer}>
        <Text style={styles.label}>{label}</Text>
        {error && <Text style={styles.errorHint}>!</Text>}
      </View>
      
      {loading ? (
        <ActivityIndicator size="small" color="#3498db" />
      ) : (
        <Dropdown
          style={[styles.dropdown, isFocus && { borderColor: 'blue' }, error && styles.errorInput]}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          inputSearchStyle={styles.inputSearchStyle}
          iconStyle={styles.iconStyle}
          data={options}
          search
          maxHeight={300}
          labelField="name"
          valueField="id"
          placeholder={!isFocus ? `Select ${label}` : '...'}
          searchPlaceholder="Search..."
          value={value}
          onFocus={() => setIsFocus(true)}
          onBlur={() => setIsFocus(false)}
          onChange={item => {
            onChange(item.id);
            setIsFocus(false);
          }}
          renderLeftIcon={() => (
            <View style={styles.dropdownIcon}>
              <Text>📌</Text>
            </View>
          )}
        />
      )}
      
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
});

const SurveyFormScreen = ({ route, navigation }) => {
  const { token, user, surveyData, isEdit } = route.params;
  const [formData, setFormData] = useState({
    year: new Date().getFullYear().toString(),
    beel_name: '',
    district_id: '',
    block_id: '',
    lac: '',
    gp: '',
    village: '',
    mauza: '',
    po: '',
    land_area: '',
    water_depth_monsoon: '',
    water_depth_summer: '',
    lat: '',
    lng: '',
    name_contact: '',
    mobile_contact: '',
    distance_hq: '',
    distance_market: '',
    road_accessibility: '',
    land_dag_no: '',
    land_patta_no: '',
    land_trace_map: '',
    land_chitha_copy: '',
    noc_rev_circle: '',
    dfdo_conformation_certificate: '',
    noc_forest: '',
    classification_beel: '',
    percentage_weed_infestation: '',
    type_aquatic: '',
    aquatic_name: '',
    no_village: '',
    no_household: '',
    percentage_sc: '',
    percentage_st: '',
    name_beel_managment_committee: '',
    nos_active_fishermen: '',
    surveyor: user.name,
    date: new Date().toISOString().split('T')[0],
    created_by: user.id,
    beel_images: [],
    image_lat: '',
    image_lng: ''
  });
  const [loading, setLoading] = useState(false);
  const [currentPhase, setCurrentPhase] = useState(1);
  const [errors, setErrors] = useState({});
  const [districts, setDistricts] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [allBlocks, setAllBlocks] = useState([]);
  const [loadingMasterData, setLoadingMasterData] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [mapModalVisible, setMapModalVisible] = useState(false);

  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        setLoadingMasterData(true);
        const data = await getMasterData(token);
       
        if (data && data.data) {
          setDistricts(data.data.district || []);
          setAllBlocks(data.data.block || []);
          if (isEdit && surveyData && surveyData.district_id) {
            const selectedDistrict = data.data.district.find(
              d => d.id.toString() === surveyData.district_id.toString()
            );
          
            if (selectedDistrict) {
              const districtBlocks = data.data.block.filter(
                b => b.district_id.toString() === surveyData.district_id.toString()
              );
              setBlocks(districtBlocks);
            } else {
              console.warn('No matching district found for district_id:', surveyData.district_id);
              setBlocks([]);
            }
          }
        } else {
          console.error('No data or invalid response');
          Alert.alert('Error', 'Failed to load master data.');
        }
      } catch (error) {
        console.error('Error fetching master data:', error);
        Alert.alert('Error', 'Failed to load districts and blocks.');
      } finally {
        setLoadingMasterData(false);
      }
    };

    fetchMasterData();
  }, [token, isEdit, surveyData]);

  useEffect(() => {
    if (isEdit && surveyData) {
      const editData = {
        ...surveyData,
        land_area: surveyData.land_area ? String(surveyData.land_area) : '',
        water_depth_monsoon: surveyData.water_depth_monsoon ? String(surveyData.water_depth_monsoon) : '',
        water_depth_summer: surveyData.water_depth_summer ? String(surveyData.water_depth_summer) : '',
        distance_hq: surveyData.distance_hq ? String(surveyData.distance_hq) : '',
        no_village: surveyData.no_village ? String(surveyData.no_village) : '',
        no_household: surveyData.no_household ? String(surveyData.no_household) : '',
        nos_active_fishermen: surveyData.nos_active_fishermen ? String(surveyData.nos_active_fishermen) : '',
        district_id: surveyData.district_id ? String(surveyData.district_id) : '',
        block_id: surveyData.block_id ? String(surveyData.block_id) : '',
        beel_images: surveyData.beel_images || [],
        image_lat: surveyData.image_lat || '',
        image_lng: surveyData.image_lng || ''
      };
      setFormData(editData);
    }
  }, [isEdit, surveyData]);

  const validationRules = {
    year: { required: true, message: 'Year is required' },
    beel_name: { required: true, message: 'Beel name is required' },
    district_id: { required: true, message: 'District is required' },
    block_id: { required: true, message: 'Block is required' },
    land_area: { numeric: true, message: 'Must be a number' },
    water_depth_monsoon: { numeric: true, message: 'Must be a number' },
    water_depth_summer: { numeric: true, message: 'Must be a number' },
    distance_hq: { numeric: true, message: 'Must be a number' },
    no_village: { numeric: true, message: 'Must be a number' },
    no_household: { numeric: true, message: 'Must be a number' },
    nos_active_fishermen: { numeric: true, message: 'Must be a number' },
    mobile_contact: { 
      pattern: /^\d+$/,
      message: 'Must contain only digits',
      maxLength: 10,
      maxLengthMessage: 'Mobile number cannot exceed 10 digits'
    }
  };

  const validateField = useCallback((name, value) => {
    const rules = validationRules[name];
    if (!rules) return null;

    if (rules.required && !value) {
      return rules.message;
    }

    if (rules.numeric && value && isNaN(Number(value))) {
      return 'Must be a number';
    }

    if (rules.pattern && value && !rules.pattern.test(value)) {
      return rules.message;
    }

    if (rules.maxLength && value && value.length > rules.maxLength) {
      return rules.maxLengthMessage;
    }

    return null;
  }, []);

  const validatePhase = useCallback((phase) => {
    const newErrors = {};
    let isValid = true;

    Object.keys(formData).forEach(field => {
      if (shouldValidateInPhase(field, phase)) {
        const error = validateField(field, formData[field]);
        if (error) {
          newErrors[field] = error;
          isValid = false;
        }
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [formData, validateField]);

  const shouldValidateInPhase = useCallback((field, phase) => {
    const phaseFields = {
      1: ['year', 'beel_name', 'district_id', 'block_id', 'lac', 'gp', 'village', 'mauza', 'po'],
      2: ['land_area', 'water_depth_monsoon', 'water_depth_summer', 'lat', 'lng', 'distance_hq', 'distance_market', 'road_accessibility'],
      3: ['land_dag_no', 'land_patta_no', 'land_trace_map', 'land_chitha_copy', 'noc_rev_circle', 'dfdo_conformation_certificate', 'noc_forest', 'classification_beel', 'percentage_weed_infestation'],
      4: ['type_aquatic', 'aquatic_name', 'no_village', 'no_household', 'percentage_sc', 'percentage_st', 'name_beel_managment_committee', 'nos_active_fishermen', 'name_contact', 'mobile_contact']
    };
    return phaseFields[phase].includes(field);
  }, []);

  const handleSubmit = async () => {
    for (let phase = 1; phase <= 4; phase++) {
      if (!validatePhase(phase)) {
        setCurrentPhase(phase);
        Alert.alert(
          'Validation Error', 
          `Please complete all required fields in Phase ${phase}`,
          [{ text: 'OK' }]
        );
        return;
      }
    }

    setLoading(true);
    try {
      const numericFields = [
        'land_area', 'water_depth_monsoon', 
        'water_depth_summer', 'distance_hq', 'no_village', 'no_household',
        'nos_active_fishermen'
      ];
      const submitData = {
        ...formData,
        ...Object.fromEntries(
          numericFields.map(field => [field, formData[field] ? Number(formData[field]) : ''])
        )
      };
      let response;
      if (isEdit) {
        response = await updateSurvey({ ...submitData, id: surveyData.id }, token);
        Alert.alert(
          'Success', 
          'Survey updated successfully!',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } else {
        response = await submitSurvey(submitData, token);
        Alert.alert(
          'Success', 
          'Survey submitted successfully!',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      }
    } catch (error) {
      Alert.alert(
        'Error',
        error.message || (isEdit ? 'Failed to update survey' : 'Failed to submit survey')
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = useCallback((name, value) => {
    if (name === 'mobile_contact' && value.length > 10) {
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  }, [errors]);

  const handleDistrictChange = useCallback((value) => {
    const districtBlocks = allBlocks.filter(
      b => b.district_id.toString() === value.toString()
    );
    setBlocks(districtBlocks);
    
    setFormData(prev => ({
      ...prev,
      district_id: value,
      block_id: ''
    }));

    if (errors.district_id) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.district_id;
        return newErrors;
      });
    }
  }, [allBlocks, errors.district_id]);

  const handleBlockChange = useCallback((value) => {
    setFormData(prev => ({
      ...prev,
      block_id: value
    }));

    if (errors.block_id) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.block_id;
        return newErrors;
      });
    }
  }, [errors.block_id]);

  const nextPhase = useCallback(() => {
    if (!validatePhase(currentPhase)) {
      Alert.alert(
        'Validation Error',
        'Please fix the errors before proceeding to the next phase',
        [{ text: 'OK' }]
      );
      return;
    }
    
    if (currentPhase < 4) {
      setCurrentPhase(currentPhase + 1);
    }
  }, [currentPhase, validatePhase]);

  const prevPhase = useCallback(() => {
    if (currentPhase > 1) {
      setCurrentPhase(currentPhase - 1);
    }
  }, [currentPhase]);

  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: "Camera Permission",
            message: "App needs access to your camera",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "OK"
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      console.log('Location permission status:', status);
      return status === 'granted';
    } catch (err) {
      console.warn('Location permission error:', err);
      return false;
    }
  };

const captureImage = async () => {
  try {
    // 1. Request camera permissions
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    if (cameraStatus !== 'granted') {
      Alert.alert('Permission required', 'Camera access is needed to take photos');
      return;
    }

    // 2. Request location permissions
    let lat = null;
    let lng = null;
    
    try {
      console.log('Requesting location permission...');
      const locationPermissionGranted = await requestLocationPermission();
      
      if (locationPermissionGranted) {
        console.log('Location permission granted, getting current location...');
        
        // Check if location services are enabled
        const isLocationEnabled = await Location.hasServicesEnabledAsync();
        if (!isLocationEnabled) {
          console.warn('Location services are disabled');
          Alert.alert(
            'Location Services Disabled', 
            'Please enable location services in your device settings to capture location with photos.',
            [{ text: 'OK' }]
          );
        } else {
          console.log('Location services are enabled, fetching location...');
          
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
            timeout: 15000,
            maximumAge: 30000,
          });
          
          if (location?.coords?.latitude && location?.coords?.longitude) {
            lat = location.coords.latitude;
            lng = location.coords.longitude;
            console.log('Location obtained successfully:', { lat, lng });
          } else {
            console.warn('Location coords not available in response:', location);
          }
        }
      } else {
        console.warn('Location permission denied by user');
        Alert.alert(
          'Location Permission Required', 
          'Location access is needed to tag photos with GPS coordinates. You can still take photos, but they won\'t have location data.',
          [{ text: 'OK' }]
        );
      }
    } catch (locationError) {
      console.error('Location error details:', locationError);
      Alert.alert(
        'Location Error', 
        `Could not get current location: ${locationError.message}. Photo will be uploaded without location data.`,
        [{ text: 'OK' }]
      );
    }

    // 3. Launch camera
    console.log('Launching camera...');
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.5, // Reduced quality to avoid file size issues
      allowsEditing: true,
      aspect: [4, 3],
      exif: true,
      base64: false,
    });

    if (result.canceled) return;

    if (result.assets && result.assets.length > 0) {
      const { uri } = result.assets[0];
      setUploadingImage(true);

      try {
        const formData = new FormData();
        // Use existing beel ID if editing, otherwise use 0 for new surveys
        const beelId = isEdit && surveyData?.id ? parseInt(surveyData.id) : 0;

        formData.append('s_beel_id', beelId);
        formData.append('title', 'Beel Photo');
        formData.append('photo[]', {
          uri,
          name: `photo_${Date.now()}.jpg`,
          type: 'image/jpeg'
        });

        // Always add latitude and longitude (required by API)
        // Use actual coordinates if available, otherwise use default values
        const latitude = (lat !== null && !isNaN(lat)) ? lat.toString() : '0';
        const longitude = (lng !== null && !isNaN(lng)) ? lng.toString() : '0';
        
        formData.append('latitude', latitude);
        formData.append('longitude', longitude);
        
        console.log('Uploading with coordinates:', { latitude, longitude });
        console.log('Location data status:', lat !== null && lng !== null ? 'Real GPS coordinates' : 'Default coordinates (0,0)');


        // Upload image
        const response = await uploadBeelPhoto(formData, token);
        console.log('Upload response status:', response?.status);

        // Update form data with the new image and location
        if (response && response.status && response.data && response.data.length > 0) {
          const uploadedImages = response.data;
          const newImageUrls = uploadedImages.map(img => img.photo);
          
          setFormData(prev => ({
            ...prev,
            beel_images: [...prev.beel_images, ...newImageUrls],
            image_lat: lat !== null ? lat.toString() : prev.image_lat,
            image_lng: lng !== null ? lng.toString() : prev.image_lng,
            // Auto-populate main lat/lng fields if they're empty and we have valid coordinates
            lat: (lat !== null && (!prev.lat || prev.lat === '')) ? lat.toString() : prev.lat,
            lng: (lng !== null && (!prev.lng || prev.lng === '')) ? lng.toString() : prev.lng
          }));
          
          const locationMessage = lat !== null && lng !== null 
            ? `Image uploaded successfully with GPS location (${parseFloat(lat).toFixed(6)}, ${parseFloat(lng).toFixed(6)})`
            : 'Image uploaded successfully (no GPS location - using default coordinates)';
          Alert.alert('Success', locationMessage);
        } else if (response && response.status) {
          // Handle case where upload was successful but no data array returned
          // Still update main lat/lng fields if we have coordinates
          if (lat !== null && lng !== null) {
            setFormData(prev => ({
              ...prev,
              image_lat: lat.toString(),
              image_lng: lng.toString(),
              // Auto-populate main lat/lng fields if they're empty
              lat: (!prev.lat || prev.lat === '') ? lat.toString() : prev.lat,
              lng: (!prev.lng || prev.lng === '') ? lng.toString() : prev.lng
            }));
          }
          
          const locationMessage = lat !== null && lng !== null 
            ? `Image uploaded successfully with GPS location (${parseFloat(lat).toFixed(6)}, ${parseFloat(lng).toFixed(6)})`
            : 'Image uploaded successfully (no GPS location - using default coordinates)';
          Alert.alert('Success', locationMessage);
        } else {
          console.warn('Unexpected response structure:', response);
          Alert.alert('Success', 'Image uploaded successfully');
        }

      } catch (error) {
        console.error('Upload error:', error);
        let errorMessage = error.message || 'Failed to upload image';
        
        // Handle specific file size error
        if (errorMessage.includes('may not be greater than 2048 kilobytes')) {
          errorMessage = 'Image file is too large (max 2MB). Please try taking another photo or reduce image quality.';
        }
        
        Alert.alert('Upload Error', errorMessage);
      } finally {
        setUploadingImage(false);
      }
    }
  } catch (error) {
    console.error('Camera error:', error);
    setUploadingImage(false);
    Alert.alert('Camera Error', 'Failed to access camera: ' + error.message);
  }
};

  const removeImage = (index) => {
    const newImages = [...formData.beel_images];
    newImages.splice(index, 1);
    setFormData(prev => ({
      ...prev,
      beel_images: newImages
    }));
  };

  const handleDistanceUpdate = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const renderValidationGuidance = useCallback(() => (
    <View style={styles.guidanceContainer}>
      <Text style={styles.guidanceTitle}>Validation Rules:</Text>
      <Text style={styles.guidanceText}>- Fields marked with * are required</Text>
      <Text style={styles.guidanceText}>- Land area, water depth, and distance fields must be numbers</Text>
      <Text style={styles.guidanceText}>- Mobile number must contain only digits (max 10)</Text>
      {Object.keys(errors).length > 0 && (
        <Text style={[styles.guidanceText, { color: '#e74c3c' }]}>
          - Please fix the highlighted errors below
        </Text>
      )}
    </View>
  ), [errors]);

  const renderDropdown = ({ label, value, onChange, options, error, loading }) => (
    <View style={styles.inputGroup}>
      <View style={styles.labelContainer}>
        <Text style={styles.label}>{label}</Text>
        {error && <Text style={styles.errorHint}>!</Text>}
      </View>
      
      {loading ? (
        <ActivityIndicator size="small" color="#3498db" />
      ) : (
        <Dropdown
          style={[styles.dropdown, isFocus && { borderColor: 'blue' }, error && styles.errorInput]}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          inputSearchStyle={styles.inputSearchStyle}
          iconStyle={styles.iconStyle}
          data={options}
          search
          maxHeight={300}
          labelField="name"
          valueField="id"
          placeholder={!isFocus ? `Select ${label}` : '...'}
          searchPlaceholder="Search..."
          value={value}
          onFocus={() => setIsFocus(true)}
          onBlur={() => setIsFocus(false)}
          onChange={item => {
            onChange(item.id);
            setIsFocus(false);
          }}
          renderLeftIcon={() => (
            <View style={styles.dropdownIcon}>
              <Text>📌</Text>
            </View>
          )}
        />
      )}
      
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );

  const renderImageGallery = () => (
    <View style={styles.imageGalleryContainer}>
      <Text style={styles.sectionTitle}>Beel Images</Text>
      <View style={styles.imageGallery}>
        {formData.beel_images.map((image, index) => (
          <View key={index} style={styles.imageContainer}>
            <Image source={{ uri: image }} style={styles.image} />
            <TouchableOpacity 
              style={styles.removeImageButton} 
              onPress={() => removeImage(index)}
            >
              <Text style={styles.removeImageText}>×</Text>
            </TouchableOpacity>
          </View>
        ))}
        <TouchableOpacity 
          style={styles.addImageButton} 
          onPress={captureImage}
          disabled={uploadingImage}
        >
          {uploadingImage ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.addImageText}>+ Add Photo</Text>
          )}
        </TouchableOpacity>
      </View>
      {formData.image_lat && formData.image_lng && (
        <View style={styles.locationInfo}>
          <Text style={styles.locationText}>
            Last image location: {parseFloat(formData.image_lat).toFixed(6)}, {parseFloat(formData.image_lng).toFixed(6)}
          </Text>
        </View>
      )}
    </View>
  );

  const renderPhase = useCallback(() => {
    switch (currentPhase) {
      case 1:
        return (
          <>
            <Text style={styles.phaseTitle}>Phase 1: Basic Information</Text>
            {renderValidationGuidance()}
            <Field 
              label="Year *" 
              value={formData.year} 
              onChangeText={fieldHandlers.year}
              error={errors.year}
            />
            <Field 
              label="Beel Name *" 
              value={formData.beel_name} 
              onChangeText={fieldHandlers.beel_name}
              error={errors.beel_name}
            />
            <DropdownField
              label="District *"
              value={formData.district_id}
              onChange={memoizedHandleDistrictChange}
              options={districts}
              error={errors.district_id}
              loading={loadingMasterData}
            />
            <DropdownField
              label="Block *"
              value={formData.block_id}
              onChange={memoizedHandleBlockChange}
              options={blocks}
              error={errors.block_id}
              loading={loadingMasterData}
            />
            <Field 
              label="LAC" 
              value={formData.lac} 
              onChangeText={fieldHandlers.lac}
            />
            <Field 
              label="GP" 
              value={formData.gp} 
              onChangeText={fieldHandlers.gp}
            />
            <Field 
              label="Village" 
              value={formData.village} 
              onChangeText={fieldHandlers.village}
            />
            <Field 
              label="Mauza" 
              value={formData.mauza} 
              onChangeText={fieldHandlers.mauza}
            />
            <Field 
              label="PO" 
              value={formData.po} 
              onChangeText={fieldHandlers.po}
            />
          </>
        );
      case 2:
        return (
          <>
            <Text style={styles.phaseTitle}>Phase 2: Location & Land Information</Text>
            {renderValidationGuidance()}
            {renderImageGallery()}
            <Field 
              label="Land Area (ha)" 
              value={formData.land_area} 
              onChangeText={fieldHandlers.land_area}
              keyboardType="numeric"
              error={errors.land_area}
            />
            <Field 
              label="Water Depth (Monsoon)" 
              value={formData.water_depth_monsoon} 
              onChangeText={fieldHandlers.water_depth_monsoon}
              keyboardType="numeric"
              error={errors.water_depth_monsoon}
            />
            <Field 
              label="Water Depth (Summer)" 
              value={formData.water_depth_summer} 
              onChangeText={fieldHandlers.water_depth_summer}
              keyboardType="numeric"
              error={errors.water_depth_summer}
            />
            <Field 
              label="Latitude" 
              value={formData.lat} 
              onChangeText={fieldHandlers.lat}
              keyboardType="numeric"
            />
            <Field 
              label="Longitude" 
              value={formData.lng} 
              onChangeText={fieldHandlers.lng}
              keyboardType="numeric"
            />
            <Field 
              label="Distance to HQ (km)" 
              value={formData.distance_hq} 
              onChangeText={fieldHandlers.distance_hq}
              keyboardType="numeric"
              error={errors.distance_hq}
            />
            <TouchableOpacity 
              style={styles.geofencingButton}
              onPress={() => setMapModalVisible(true)}
      
            >
              <Text style={styles.geofencingButtonText}>
                🗺️ Use Map Distance Tool
              </Text>
            </TouchableOpacity>
            
            <GeofencingMapModal
              visible={mapModalVisible}
              onClose={() => setMapModalVisible(false)}
              beelLocation={{
                lat: formData.image_lat || formData.lat || '22.5726',
                lng: formData.image_lng || formData.lng || '88.3639'
              }}
              onDistanceUpdate={handleDistanceUpdate}
              initialHqDistance={formData.distance_hq}
              initialMarketDistance={formData.distance_market}
            />
            
            <Field 
              label="Distance to Market (km)" 
              value={formData.distance_market} 
              onChangeText={fieldHandlers.distance_market}
              keyboardType="numeric"
            />
            <Field 
              label="Road Accessibility" 
              value={formData.road_accessibility} 
              onChangeText={fieldHandlers.road_accessibility}
            />
          </>
        );
      case 3:
        return (
          <>
            <Text style={styles.phaseTitle}>Phase 3: Land Documents & Classification</Text>
            {renderValidationGuidance()}
            <Field 
              label="Land Dag Number" 
              value={formData.land_dag_no} 
              onChangeText={fieldHandlers.land_dag_no}
            />
            <Field 
              label="Land Patta Number" 
              value={formData.land_patta_no} 
              onChangeText={fieldHandlers.land_patta_no}
            />
            <Field 
              label="Land Trace Map" 
              value={formData.land_trace_map} 
              onChangeText={fieldHandlers.land_trace_map}
            />
            <Field 
              label="Land Chitha Copy" 
              value={formData.land_chitha_copy} 
              onChangeText={fieldHandlers.land_chitha_copy}
            />
            <Field 
              label="NOC Revenue Circle" 
              value={formData.noc_rev_circle} 
              onChangeText={fieldHandlers.noc_rev_circle}
            />
            <Field 
              label="DFDO Conformation Certificate" 
              value={formData.dfdo_conformation_certificate} 
              onChangeText={fieldHandlers.dfdo_conformation_certificate}
            />
            <Field 
              label="NOC Forest" 
              value={formData.noc_forest} 
              onChangeText={fieldHandlers.noc_forest}
            />
            <Field 
              label="Beel Classification" 
              value={formData.classification_beel} 
              onChangeText={fieldHandlers.classification_beel}
            />
            <Field 
              label="Percentage Weed Infestation" 
              value={formData.percentage_weed_infestation} 
              onChangeText={fieldHandlers.percentage_weed_infestation}
            />
          </>
        );
      case 4:
        return (
          <>
            <Text style={styles.phaseTitle}>Phase 4: Community & Contact Information</Text>
            {renderValidationGuidance()}
            <Field 
              label="Type of Aquatic Vegetation" 
              value={formData.type_aquatic} 
              onChangeText={fieldHandlers.type_aquatic}
            />
            <Field 
              label="Aquatic Vegetation Name" 
              value={formData.aquatic_name} 
              onChangeText={fieldHandlers.aquatic_name}
            />
            <Field 
              label="Number of Villages" 
              value={formData.no_village} 
              onChangeText={fieldHandlers.no_village}
              keyboardType="numeric"
              error={errors.no_village}
            />
            <Field 
              label="Number of Households" 
              value={formData.no_household} 
              onChangeText={fieldHandlers.no_household}
              keyboardType="numeric"
              error={errors.no_household}
            />
            <Field 
              label="Percentage SC Population" 
              value={formData.percentage_sc} 
              onChangeText={fieldHandlers.percentage_sc}
            />
            <Field 
              label="Percentage ST Population" 
              value={formData.percentage_st} 
              onChangeText={fieldHandlers.percentage_st}
            />
            <Field 
              label="Beel Management Committee" 
              value={formData.name_beel_managment_committee} 
              onChangeText={fieldHandlers.name_beel_managment_committee}
            />
            <Field 
              label="Number of Active Fishermen" 
              value={formData.nos_active_fishermen} 
              onChangeText={fieldHandlers.nos_active_fishermen}
              keyboardType="numeric"
              error={errors.nos_active_fishermen}
            />
            <Field 
              label="Contact Person Name" 
              value={formData.name_contact} 
              onChangeText={fieldHandlers.name_contact}
            />
            <Field 
              label="Contact Mobile Number" 
              value={formData.mobile_contact} 
              onChangeText={fieldHandlers.mobile_contact}
              keyboardType="phone-pad"
              error={errors.mobile_contact}
              maxLength={10}
            />
            <Field 
              label="Surveyor" 
              value={formData.surveyor} 
              editable={false}
            />
            <Field 
              label="Date" 
              value={formData.date} 
              editable={false}
            />
          </>
        );
      default:
        return null;
    }
  }, [currentPhase, errors, formData, blocks, districts, loadingMasterData, 
      handleChange, handleDistrictChange, handleBlockChange, renderValidationGuidance]);

  // Move Field component outside of render to prevent recreation
  const Field = useCallback(({ 
    label, 
    value, 
    onChangeText, 
    editable = true, 
    keyboardType = 'default', 
    error,
    maxLength
  }) => (
    <View style={styles.inputGroup}>
      <View style={styles.labelContainer}>
        <Text style={styles.label}>{label}</Text>
        {error && <Text style={styles.errorHint}>!</Text>}
      </View>
      
      <TextInput
        style={[styles.input, !editable && styles.disabledInput, error && styles.errorInput]}
        value={value}
        onChangeText={onChangeText}
        editable={editable}
        keyboardType={keyboardType}
        placeholder={`Enter ${label.replace('*', '').trim()}`}
        placeholderTextColor="#999"
        maxLength={maxLength}
        autoCorrect={false}
        autoCapitalize="words"
        blurOnSubmit={false}
        returnKeyType="next"
      />
      
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  ), []);

  // Create stable field handlers
  const createFieldHandler = useCallback((fieldName) => {
    return (text) => {
      setFormData(prev => {
        if (prev[fieldName] === text) return prev;
        return { ...prev, [fieldName]: text };
      });
      
      if (errors[fieldName]) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[fieldName];
          return newErrors;
        });
      }
    };
  }, [errors]);

  // Memoize field handlers
  const fieldHandlers = useMemo(() => ({
    year: createFieldHandler('year'),
    beel_name: createFieldHandler('beel_name'),
    lac: createFieldHandler('lac'),
    gp: createFieldHandler('gp'),
    village: createFieldHandler('village'),
    mauza: createFieldHandler('mauza'),
    po: createFieldHandler('po'),
    land_area: createFieldHandler('land_area'),
    water_depth_monsoon: createFieldHandler('water_depth_monsoon'),
    water_depth_summer: createFieldHandler('water_depth_summer'),
    lat: createFieldHandler('lat'),
    lng: createFieldHandler('lng'),
    distance_hq: createFieldHandler('distance_hq'),
    distance_market: createFieldHandler('distance_market'),
    road_accessibility: createFieldHandler('road_accessibility'),
    land_dag_no: createFieldHandler('land_dag_no'),
    land_patta_no: createFieldHandler('land_patta_no'),
    land_trace_map: createFieldHandler('land_trace_map'),
    land_chitha_copy: createFieldHandler('land_chitha_copy'),
    noc_rev_circle: createFieldHandler('noc_rev_circle'),
    dfdo_conformation_certificate: createFieldHandler('dfdo_conformation_certificate'),
    noc_forest: createFieldHandler('noc_forest'),
    classification_beel: createFieldHandler('classification_beel'),
    percentage_weed_infestation: createFieldHandler('percentage_weed_infestation'),
    type_aquatic: createFieldHandler('type_aquatic'),
    aquatic_name: createFieldHandler('aquatic_name'),
    no_village: createFieldHandler('no_village'),
    no_household: createFieldHandler('no_household'),
    percentage_sc: createFieldHandler('percentage_sc'),
    percentage_st: createFieldHandler('percentage_st'),
    name_beel_managment_committee: createFieldHandler('name_beel_managment_committee'),
    nos_active_fishermen: createFieldHandler('nos_active_fishermen'),
    name_contact: createFieldHandler('name_contact'),
    mobile_contact: createFieldHandler('mobile_contact'),
  }), [createFieldHandler]);

  // Memoize dropdown handlers
  const memoizedHandleDistrictChange = useCallback((value) => {
    const districtBlocks = allBlocks.filter(
      b => b.district_id.toString() === value.toString()
    );
    setBlocks(districtBlocks);
    
    setFormData(prev => ({
      ...prev,
      district_id: value,
      block_id: ''
    }));

    if (errors.district_id) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.district_id;
        return newErrors;
      });
    }
  }, [allBlocks, errors.district_id]);

  const memoizedHandleBlockChange = useCallback((value) => {
    setFormData(prev => ({
      ...prev,
      block_id: value
    }));

    if (errors.block_id) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.block_id;
        return newErrors;
      });
    }
  }, [errors.block_id]);


  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => currentPhase === 1 ? navigation.goBack() : prevPhase()}
          style={styles.backButtonContainer}
        >
          <Text style={styles.backButton}>{currentPhase === 1 ? '✕' : '←'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Survey Form {isEdit ? '(Edit Mode)' : ''} (Phase {currentPhase}/4)</Text>
        <View style={styles.headerRight} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
      >
        <ScrollView 
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {renderPhase()}
          
          <View style={styles.navigationButtons}>
            {currentPhase > 1 && (
              <TouchableOpacity 
                style={[styles.navButton, styles.prevButton]} 
                onPress={prevPhase}
                activeOpacity={0.7}
              >
                <Text style={styles.buttonText}>Previous</Text>
              </TouchableOpacity>
            )}
            
            {currentPhase < 4 ? (
              <TouchableOpacity 
                style={[styles.navButton, styles.nextButton]} 
                onPress={nextPhase}
                activeOpacity={0.7}
              >
                <Text style={styles.buttonText}>Next</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                style={styles.submitButton} 
                onPress={handleSubmit}
                disabled={loading}
                activeOpacity={0.7}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.submitButtonText}>{isEdit ? 'Update Survey' : 'Submit Survey'}</Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#2c3e50',
    paddingVertical: 12,
    paddingHorizontal: 10,
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
  backButtonContainer: {
    padding: 8,
  },
  backButton: {
    color: 'white',
    fontSize: isSmallDevice ? 20 : 24,
    fontWeight: 'bold',
  },
  headerTitle: {
    color: 'white',
    fontSize: isSmallDevice ? 16 : 18,
    fontWeight: '600',
    textAlign: 'center',
    flex: 1,
    marginHorizontal: 10,
  },
  headerRight: {
    width: isSmallDevice ? 30 : 40,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: isSmallDevice ? 12 : 20,
    paddingBottom: 30,
  },
  phaseTitle: {
    fontSize: isSmallDevice ? 16 : 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#2c3e50',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  guidanceContainer: {
    backgroundColor: '#f0f8ff',
    padding: 12,
    borderRadius: 6,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#3498db',
  },
  guidanceTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#2c3e50',
  },
  guidanceText: {
    fontSize: 12,
    color: '#34495e',
    marginBottom: 3,
  },
  inputGroup: {
    marginBottom: isSmallDevice ? 12 : 15,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontSize: isSmallDevice ? 13 : 14,
    fontWeight: '500',
    marginBottom: 6,
    color: '#34495e',
  },
  errorHint: {
    color: '#e74c3c',
    marginLeft: 5,
    fontWeight: 'bold',
  },
  input: {
    height: isSmallDevice ? 44 : 50,
    borderColor: '#ddd',
    borderWidth: 1,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: 'white',
    fontSize: isSmallDevice ? 14 : 16,
    color: '#333',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 1,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  disabledInput: {
    backgroundColor: '#f0f0f0',
    color: '#777',
  },
  errorInput: {
    borderColor: '#e74c3c',
  },
  errorContainer: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 12,
    marginLeft: 5,
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 25,
    gap: 10,
  },
  navButton: {
    paddingVertical: isSmallDevice ? 12 : 15,
    borderRadius: 6,
    alignItems: 'center',
    minWidth: '48%',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  prevButton: {
    backgroundColor: '#7f8c8d',
  },
  nextButton: {
    backgroundColor: '#3498db',
  },
  submitButton: {
    backgroundColor: '#27ae60',
    paddingVertical: isSmallDevice ? 12 : 15,
    borderRadius: 6,
    alignItems: 'center',
    minWidth: '48%',
    marginTop: 10,
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  buttonText: {
    color: 'white',
    fontSize: isSmallDevice ? 14 : 16,
    fontWeight: '500',
  },
  submitButtonText: {
    color: 'white',
    fontSize: isSmallDevice ? 15 : 16,
    fontWeight: '500',
  },
  dropdown: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    backgroundColor: 'white',
  },
  placeholderStyle: {
    fontSize: isSmallDevice ? 14 : 16,
    color: '#999',
  },
  selectedTextStyle: {
    fontSize: isSmallDevice ? 14 : 16,
    color: '#333',
  },
  inputSearchStyle: {
    height: 40,
    fontSize: isSmallDevice ? 14 : 16,
    color: '#333',
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  dropdownIcon: {
    marginRight: 10,
  },
  // Image gallery styles
  imageGalleryContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: isSmallDevice ? 14 : 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#2c3e50',
  },
  imageGallery: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 15,
  },
  imageContainer: {
    position: 'relative',
    width: 100,
    height: 100,
    borderRadius: 8,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  removeImageButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(231, 76, 60, 0.8)',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeImageText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  addImageButton: {
    width: 100,
    height: 100,
    backgroundColor: '#3498db',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addImageText: {
    color: 'white',
    fontSize: isSmallDevice ? 12 : 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  locationInfo: {
    backgroundColor: '#f0f8ff',
    padding: 10,
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#3498db',
  },
  locationText: {
    fontSize: isSmallDevice ? 12 : 13,
    color: '#2c3e50',
  },
  geofencingButton: {
    backgroundColor: '#3498db',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 15,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  geofencingButtonText: {
    color: 'white',
    fontSize: isSmallDevice ? 14 : 16,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default SurveyFormScreen;