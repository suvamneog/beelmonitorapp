import React, { useState } from 'react';
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
  Picker
} from 'react-native';

const SurveyFormScreen = ({ route, navigation }) => {
  const { token, user } = route.params;
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
    date: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://122.185.169.250/gisapi/public/api/survey', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to submit survey');
      }

      Alert.alert(
        'Success', 
        'Survey submitted successfully!',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert(
        'Error',
        error.message || 'Failed to submit survey'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Survey</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.form}>
          {/* Basic Information Section */}
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Year *</Text>
            <TextInput
              style={styles.input}
              value={formData.year}
              onChangeText={(text) => handleChange('year', text)}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Beel Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Beel Name"
              value={formData.beel_name}
              onChangeText={(text) => handleChange('beel_name', text)}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>District ID *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter District ID"
              value={formData.district_id}
              onChangeText={(text) => handleChange('district_id', text)}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Block ID *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Block ID"
              value={formData.block_id}
              onChangeText={(text) => handleChange('block_id', text)}
            />
          </View>

          {/* Location Information Section */}
          <Text style={styles.sectionTitle}>Location Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>LAC</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter LAC"
              value={formData.lac}
              onChangeText={(text) => handleChange('lac', text)}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>GP</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter GP"
              value={formData.gp}
              onChangeText={(text) => handleChange('gp', text)}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Village</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Village"
              value={formData.village}
              onChangeText={(text) => handleChange('village', text)}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mauza</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Mauza"
              value={formData.mauza}
              onChangeText={(text) => handleChange('mauza', text)}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>PO</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter PO"
              value={formData.po}
              onChangeText={(text) => handleChange('po', text)}
            />
          </View>

          {/* Land and Water Information */}
          <Text style={styles.sectionTitle}>Land and Water Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Land Area (ha)</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Land Area"
              value={formData.land_area}
              onChangeText={(text) => handleChange('land_area', text)}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Water Depth (Monsoon)</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Water Depth in Monsoon"
              value={formData.water_depth_monsoon}
              onChangeText={(text) => handleChange('water_depth_monsoon', text)}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Water Depth (Summer)</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Water Depth in Summer"
              value={formData.water_depth_summer}
              onChangeText={(text) => handleChange('water_depth_summer', text)}
              keyboardType="numeric"
            />
          </View>

          {/* Continue with all other fields... */}

          {/* Contact Information */}
          <Text style={styles.sectionTitle}>Contact Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Contact Person Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Contact Person Name"
              value={formData.name_contact}
              onChangeText={(text) => handleChange('name_contact', text)}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Contact Mobile Number</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Mobile Number"
              value={formData.mobile_contact}
              onChangeText={(text) => handleChange('mobile_contact', text)}
              keyboardType="phone-pad"
            />
          </View>

          {/* Survey Information */}
          <Text style={styles.sectionTitle}>Survey Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Date</Text>
            <TextInput
              style={styles.input}
              value={formData.date}
              editable={false}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Surveyor</Text>
            <TextInput
              style={styles.input}
              value={formData.surveyor}
              editable={false}
            />
          </View>

          <TouchableOpacity 
            style={styles.submitButton} 
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.submitButtonText}>Submit Survey</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#3498db',
    paddingVertical: 15,
    paddingHorizontal: 15,
  },
  backButton: {
    padding: 5,
  },
  backButtonText: {
    color: 'white',
    fontSize: 20,
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerRight: {
    width: 30,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  form: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 15,
    color: '#3498db',
    borderBottomWidth: 1,
    borderBottomColor: '#3498db',
    paddingBottom: 5,
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'white',
    fontSize: 16,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  submitButton: {
    backgroundColor: '#27ae60',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SurveyFormScreen;