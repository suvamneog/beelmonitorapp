import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { getProfile, getBeelList } from '../utils/api';

const Dashboard = ({ route }) => {
  const [profile, setProfile] = useState(null);
  const [beelList, setBeelList] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, token } = route.params;

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch profile
        const profileResponse = await getProfile(user.id, token);
        setProfile(profileResponse.data);
        
        // Fetch beel list
        const beelResponse = await getBeelList(token);
        setBeelList(beelResponse.data);
      } catch (error) {
        console.error('Dashboard error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome, {profile?.name}</Text>
      <Text style={styles.subtitle}>Designation: {profile?.designation}</Text>
      <Text style={styles.subtitle}>Email: {profile?.email}</Text>
      
      <Text style={styles.sectionTitle}>Beel List</Text>
      {beelList.map(beel => (
        <View key={beel.id} style={styles.beelCard}>
          <Text style={styles.beelName}>{beel.name}</Text>
          <Text>District: {beel.district_name}</Text>
          <Text>Water Area: {beel.water_area} hectares</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  beelCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  beelName: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
});

export default Dashboard;