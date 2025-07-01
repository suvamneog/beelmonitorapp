import React, { useState, useEffect } from 'react';
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
  Platform
} from 'react-native';
import { submitSurvey, updateSurvey } from '../utils/api';

const { width, height } = Dimensions.get('window');
const isSmallDevice = width < 375;

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
    created_by: user.id
  });
  const [loading, setLoading] = useState(false);
  const [currentPhase, setCurrentPhase] = useState(1);
  const [errors, setErrors] = useState({});

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
        block_id: surveyData.block_id ? String(surveyData.block_id) : ''
      };
      setFormData(editData);
    }
  }, [isEdit, surveyData]);

  const validationRules = {
    year: { required: true, message: 'Year is required' },
    beel_name: { required: true, message: 'Beel name is required' },
    district_id: { 
      required: true, 
      numeric: true,
      message: 'District ID is required and must be a number' 
    },
    block_id: { 
      required: true, 
      numeric: true,
      message: 'Block ID is required and must be a number' 
    },
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

  const validateField = (name, value) => {
    const rules = validationRules[name];
    if (!rules) return null;

    if (rules.required && !value) {
      return rules.message;
    }

    if (rules.numeric && value && isNaN(value)) {
      return 'Must be a number';
    }

    if (rules.pattern && value && !rules.pattern.test(value)) {
      return rules.message;
    }

    if (rules.maxLength && value && value.length > rules.maxLength) {
      return rules.maxLengthMessage;
    }

    return null;
  };

  const validatePhase = (phase) => {
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
  };

  const shouldValidateInPhase = (field, phase) => {
    const phaseFields = {
      1: ['year', 'beel_name', 'district_id', 'block_id', 'lac', 'gp', 'village', 'mauza', 'po'],
      2: ['land_area', 'water_depth_monsoon', 'water_depth_summer', 'lat', 'lng', 'distance_hq', 'distance_market', 'road_accessibility'],
      3: ['land_dag_no', 'land_patta_no', 'land_trace_map', 'land_chitha_copy', 'noc_rev_circle', 'dfdo_conformation_certificate', 'noc_forest', 'classification_beel', 'percentage_weed_infestation'],
      4: ['type_aquatic', 'aquatic_name', 'no_village', 'no_household', 'percentage_sc', 'percentage_st', 'name_beel_managment_committee', 'nos_active_fishermen', 'name_contact', 'mobile_contact']
    };
    return phaseFields[phase].includes(field);
  };

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
      let response;
      if (isEdit) {
        response = await updateSurvey({ ...formData, id: surveyData.id }, token);
        Alert.alert(
          'Success', 
          'Survey updated successfully!',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } else {
        response = await submitSurvey(formData, token);
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

  const handleChange = (name, value) => {
    const numericFields = [
      'district_id', 'block_id', 'land_area', 'water_depth_monsoon', 
      'water_depth_summer', 'distance_hq', 'no_village', 'no_household',
      'nos_active_fishermen'
    ];
    
    if (name === 'mobile_contact' && value.length > 10) {
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: numericFields.includes(name) ? (value === '' ? '' : Number(value)) : value
    }));

    if (errors[name]) {
      setErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const nextPhase = () => {
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
  };

  const prevPhase = () => {
    if (currentPhase > 1) {
      setCurrentPhase(currentPhase - 1);
    }
  };

  const renderValidationGuidance = () => (
    <View style={styles.guidanceContainer}>
      <Text style={styles.guidanceTitle}>Validation Rules:</Text>
      <Text style={styles.guidanceText}>- Fields marked with * are required</Text>
      <Text style={styles.guidanceText}>- District ID and Block ID must be numbers</Text>
      <Text style={styles.guidanceText}>- Land area, water depth, and distance fields must be numbers</Text>
      <Text style={styles.guidanceText}>- Mobile number must contain only digits (max 10)</Text>
      {Object.keys(errors).length > 0 && (
        <Text style={[styles.guidanceText, { color: '#e74c3c' }]}>
          - Please fix the highlighted errors below
        </Text>
      )}
    </View>
  );

  const renderPhase = () => {
    switch(currentPhase) {
      case 1:
        return (
          <>
            <Text style={styles.phaseTitle}>Phase 1: Basic Information</Text>
            {renderValidationGuidance()}
            <Field 
              label="Year *" 
              value={formData.year} 
              onChangeText={text => handleChange('year', text)}
              error={errors.year}
            />
            <Field 
              label="Beel Name *" 
              value={formData.beel_name} 
              onChangeText={text => handleChange('beel_name', text)}
              error={errors.beel_name}
            />
            <Field 
              label="District ID *" 
              value={formData.district_id} 
              onChangeText={text => handleChange('district_id', text)} 
              keyboardType="numeric" 
              error={errors.district_id}
            />
            <Field 
              label="Block ID *" 
              value={formData.block_id} 
              onChangeText={text => handleChange('block_id', text)} 
              keyboardType="numeric" 
              error={errors.block_id}
            />
            <Field 
              label="LAC" 
              value={formData.lac} 
              onChangeText={text => handleChange('lac', text)} 
            />
            <Field 
              label="GP" 
              value={formData.gp} 
              onChangeText={text => handleChange('gp', text)} 
            />
            <Field 
              label="Village" 
              value={formData.village} 
              onChangeText={text => handleChange('village', text)} 
            />
            <Field 
              label="Mauza" 
              value={formData.mauza} 
              onChangeText={text => handleChange('mauza', text)} 
            />
            <Field 
              label="PO" 
              value={formData.po} 
              onChangeText={text => handleChange('po', text)} 
            />
          </>
        );
      case 2:
        return (
          <>
            <Text style={styles.phaseTitle}>Phase 2: Location & Land Information</Text>
            {renderValidationGuidance()}
            <Field 
              label="Land Area (ha)" 
              value={formData.land_area} 
              onChangeText={text => handleChange('land_area', text)}
              keyboardType="numeric"
              error={errors.land_area}
            />
            <Field 
              label="Water Depth (Monsoon)" 
              value={formData.water_depth_monsoon} 
              onChangeText={text => handleChange('water_depth_monsoon', text)}
              keyboardType="numeric"
              error={errors.water_depth_monsoon}
            />
            <Field 
              label="Water Depth (Summer)" 
              value={formData.water_depth_summer} 
              onChangeText={text => handleChange('water_depth_summer', text)}
              keyboardType="numeric"
              error={errors.water_depth_summer}
            />
            <Field 
              label="Latitude" 
              value={formData.lat} 
              onChangeText={text => handleChange('lat', text)}
              keyboardType="numeric"
            />
            <Field 
              label="Longitude" 
              value={formData.lng} 
              onChangeText={text => handleChange('lng', text)}
              keyboardType="numeric"
            />
            <Field 
              label="Distance to HQ (km)" 
              value={formData.distance_hq} 
              onChangeText={text => handleChange('distance_hq', text)}
              keyboardType="numeric"
              error={errors.distance_hq}
            />
            <Field 
              label="Distance to Market (km)" 
              value={formData.distance_market} 
              onChangeText={text => handleChange('distance_market', text)}
              keyboardType="numeric"
            />
            <Field 
              label="Road Accessibility" 
              value={formData.road_accessibility} 
              onChangeText={text => handleChange('road_accessibility', text)}
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
              onChangeText={text => handleChange('land_dag_no', text)}
            />
            <Field 
              label="Land Patta Number" 
              value={formData.land_patta_no} 
              onChangeText={text => handleChange('land_patta_no', text)}
            />
            <Field 
              label="Land Trace Map" 
              value={formData.land_trace_map} 
              onChangeText={text => handleChange('land_trace_map', text)}
            />
            <Field 
              label="Land Chitha Copy" 
              value={formData.land_chitha_copy} 
              onChangeText={text => handleChange('land_chitha_copy', text)}
            />
            <Field 
              label="NOC Revenue Circle" 
              value={formData.noc_rev_circle} 
              onChangeText={text => handleChange('noc_rev_circle', text)}
            />
            <Field 
              label="DFDO Conformation Certificate" 
              value={formData.dfdo_conformation_certificate} 
              onChangeText={text => handleChange('dfdo_conformation_certificate', text)}
            />
            <Field 
              label="NOC Forest" 
              value={formData.noc_forest} 
              onChangeText={text => handleChange('noc_forest', text)}
            />
            <Field 
              label="Beel Classification" 
              value={formData.classification_beel} 
              onChangeText={text => handleChange('classification_beel', text)}
            />
            <Field 
              label="Percentage Weed Infestation" 
              value={formData.percentage_weed_infestation} 
              onChangeText={text => handleChange('percentage_weed_infestation', text)}
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
              onChangeText={text => handleChange('type_aquatic', text)}
            />
            <Field 
              label="Aquatic Vegetation Name" 
              value={formData.aquatic_name} 
              onChangeText={text => handleChange('aquatic_name', text)}
            />
            <Field 
              label="Number of Villages" 
              value={formData.no_village} 
              onChangeText={text => handleChange('no_village', text)}
              keyboardType="numeric"
              error={errors.no_village}
            />
            <Field 
              label="Number of Households" 
              value={formData.no_household} 
              onChangeText={text => handleChange('no_household', text)}
              keyboardType="numeric"
              error={errors.no_household}
            />
            <Field 
              label="Percentage SC Population" 
              value={formData.percentage_sc} 
              onChangeText={text => handleChange('percentage_sc', text)}
            />
            <Field 
              label="Percentage ST Population" 
              value={formData.percentage_st} 
              onChangeText={text => handleChange('percentage_st', text)}
            />
            <Field 
              label="Beel Management Committee" 
              value={formData.name_beel_managment_committee} 
              onChangeText={text => handleChange('name_beel_managment_committee', text)}
            />
            <Field 
              label="Number of Active Fishermen" 
              value={formData.nos_active_fishermen} 
              onChangeText={text => handleChange('nos_active_fishermen', text)}
              keyboardType="numeric"
              error={errors.nos_active_fishermen}
            />
            <Field 
              label="Contact Person Name" 
              value={formData.name_contact} 
              onChangeText={text => handleChange('name_contact', text)}
            />
            <Field 
              label="Contact Mobile Number" 
              value={formData.mobile_contact} 
              onChangeText={text => handleChange('mobile_contact', text)}
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
  };

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
    </SafeAreaView>
  );
};

const Field = ({ 
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
      style={[
        styles.input, 
        !editable && styles.disabledInput,
        error && styles.errorInput
      ]}
      value={value}
      onChangeText={onChangeText}
      editable={editable}
      keyboardType={keyboardType}
      placeholder={`Enter ${label.replace('*', '').trim()}`}
      placeholderTextColor="#999"
      maxLength={maxLength}
    />
    {error && (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    )}
  </View>
);

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
    alignItems:'center',
    minWidth:'48%', 
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
});

export default SurveyFormScreen;