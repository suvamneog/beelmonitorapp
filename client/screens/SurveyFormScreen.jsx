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
  ActivityIndicator
} from 'react-native';

const SurveyFormScreen = ({ route, navigation }) => {
  const { token, user } = route.params;
  const [formData, setFormData] = useState({
    beelId: '',
    waterQuality: '',
    observations: '',
    date: new Date().toISOString().split('T')[0],
    surveyor: user.name
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        'Success', 
        'Survey submitted successfully!',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    }, 1500);
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
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Beel ID *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Beel ID"
              value={formData.beelId}
              onChangeText={(text) => setFormData({...formData, beelId: text})}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Water Quality *</Text>
            <TextInput
              style={styles.input}
              placeholder="Good/Fair/Poor"
              value={formData.waterQuality}
              onChangeText={(text) => setFormData({...formData, waterQuality: text})}
            />
          </View>

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

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Observations</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Enter your observations"
              value={formData.observations}
              onChangeText={(text) => setFormData({...formData, observations: text})}
              multiline
              numberOfLines={4}
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
  inputGroup: {
    marginBottom: 20,
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