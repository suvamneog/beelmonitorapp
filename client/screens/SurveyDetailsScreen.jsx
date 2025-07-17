import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  SafeAreaView,
  Linking,
  Alert
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { getAllSurveys } from '../utils/api';

const SurveyDetailsScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { surveyId, token, user } = route.params || {};
  const [surveys, setSurveys] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadSurveys = async () => {
    try {
      setLoading(true);
      const data = await getAllSurveys(token);
      setSurveys(data);
      if (surveyId) {
        const index = data.findIndex(s => s.id === surveyId);
        if (index >= 0) setCurrentIndex(index);
      }
      setError(null);
    } catch (err) {
      console.error('Failed to load surveys:', err);
      setError(err.message || 'Failed to load surveys');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSurveys();
  }, [surveyId, token]);

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < surveys.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleEdit = () => {
    const survey = surveys[currentIndex];
    navigation.navigate('SurveyForm', {
      token,
      user: user || {},
      surveyData: survey,
      isEdit: true
    });
  };

  const openMap = (lat, lng) => {
    if (lat && lng) {
      Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`);
    }
  };

  const viewDocument = (doc) => {
    if (doc) {
      Linking.openURL(`http://122.185.169.250/gisapi/public/documents/${doc}`);
    }
  };

  const renderSection = (title, fields) => {
    const survey = surveys[currentIndex];
    if (!survey) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {fields.map(({ label, key, type = 'text', unit = '' }) => (
          <View key={key} style={styles.field}>
            <Text style={styles.label}>{label}:</Text>
            {type === 'link' ? (
              <TouchableOpacity onPress={() => {
                if (key === 'lat') openMap(survey.lat, survey.lng);
                else viewDocument(survey[key]);
              }}>
                <Text style={styles.link}>{survey[key] || 'N/A'}</Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.value}>{survey[key] || 'N/A'}{unit}</Text>
            )}
          </View>
        ))}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.retry}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (surveys.length === 0) {
    return (
      <View style={styles.center}>
        <Text>No surveys found</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.retry}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currentSurvey = surveys[currentIndex];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>
          {currentSurvey.beel_name || 'Unnamed Beel'} ({currentSurvey.year})
        </Text>
        <TouchableOpacity onPress={handleEdit}>
          <Text style={styles.editButton}>Edit</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {renderSection('Basic Information', [
          { label: 'Beel Name', key: 'beel_name' },
          { label: 'Year', key: 'year' },
          { label: 'District', key: 'district_name' },
          { label: 'Block', key: 'block_name' },
          { label: 'Mauza', key: 'mauza' },
          { label: 'PO', key: 'po' },
          { label: 'Created By', key: 'created_by_name' },
        ])}

        {renderSection('Location', [
          { label: 'LAC', key: 'lac' },
          { label: 'GP', key: 'gp' },
          { label: 'Village', key: 'village' },
          { label: 'Coordinates', key: 'lat', type: 'link' },
          { label: 'Distance to HQ', key: 'distance_hq', unit: ' km' },
          { label: 'Distance to Market', key: 'distance_market', unit: ' km' },
          { label: 'Road Accessibility', key: 'road_accessibility' },
        ])}

        {renderSection('Land & Water', [
          { label: 'Land Area', key: 'land_area', unit: ' ha' },
          { label: 'Water Depth (Monsoon)', key: 'water_depth_monsoon', unit: ' m' },
          { label: 'Water Depth (Summer)', key: 'water_depth_summer', unit: ' m' },
          { label: 'Classification', key: 'classification_beel' },
          { label: 'Weed Infestation', key: 'percentage_weed_infestation', unit: '%' },
          { label: 'Aquatic Type', key: 'type_aquatic' },
          { label: 'Aquatic Name', key: 'aquatic_name' },
        ])}

        {renderSection('Documents', [
          { label: 'Dag Number', key: 'land_dag_no' },
          { label: 'Patta Number', key: 'land_patta_no' },
          { label: 'Trace Map', key: 'land_trace_map', type: 'link' },
          { label: 'Chitha Copy', key: 'land_chitha_copy', type: 'link' },
          { label: 'NOC Revenue Circle', key: 'noc_rev_circle' },
          { label: 'DFDO Certificate', key: 'dfdo_conformation_certificate' },
          { label: 'NOC Forest', key: 'noc_forest' },
        ])}

        {renderSection('Community', [
          { label: 'Number of Villages', key: 'no_village' },
          { label: 'Number of Households', key: 'no_household' },
          { label: 'SC Population', key: 'percentage_sc', unit: '%' },
          { label: 'ST Population', key: 'percentage_st', unit: '%' },
          { label: 'Management Committee', key: 'name_beel_managment_committee' },
          { label: 'Active Fishermen', key: 'nos_active_fishermen' },
        ])}

        {renderSection('Contact', [
          { label: 'Contact Person', key: 'name_contact' },
          { label: 'Contact Number', key: 'mobile_contact' },
        ])}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.navButton, currentIndex === 0 && styles.disabled]}
          onPress={handlePrev}
          disabled={currentIndex === 0}
        >
          <Text style={styles.buttonText}>Previous</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navButton, currentIndex === surveys.length - 1 && styles.disabled]}
          onPress={handleNext}
          disabled={currentIndex === surveys.length - 1}
        >
          <Text style={styles.buttonText}>Next</Text>
        </TouchableOpacity>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#3498db',
  },
  backButton: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  title: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  editButton: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  content: {
    padding: 15,
    paddingBottom: 80,
  },
  section: {
    marginBottom: 20,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3498db',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 5,
  },
  field: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    color: '#666',
  },
  value: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  link: {
    color: '#3498db',
    textDecorationLine: 'underline',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  navButton: {
    backgroundColor: '#3498db',
    padding: 12,
    borderRadius: 6,
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  disabled: {
    backgroundColor: '#95a5a6',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  error: {
    color: '#e74c3c',
    marginBottom: 10,
  },
  retry: {
    color: '#3498db',
    fontWeight: 'bold',
  },
});

export default SurveyDetailsScreen;