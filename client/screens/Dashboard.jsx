import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { getProfile, getBeelList } from '../utils/api';

const Dashboard = ({ route }) => {
  const { user, token } = route.params;
  const [profile, setProfile] = useState(null);
  const [beelList, setBeelList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const profileRes = await getProfile(user.id, token);
        const beelRes = await getBeelList(token);
        setProfile(profileRes.data);
        setBeelList(beelRes.data);
      } catch (error) {
        console.error('Dashboard error:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#007AFF" /></View>;
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Welcome, {profile?.name}</Text>
      <Text style={styles.subtitle}>Designation: {profile?.designation}</Text>
      <Text style={styles.subtitle}>Email: {profile?.email}</Text>

      <Text style={styles.sectionTitle}>Beel List</Text>
      {beelList.map(beel => (
        <View key={beel.id} style={styles.card}>
          <Text style={styles.beelName}>{beel.name}</Text>
          <Text>District: {beel.district_name}</Text>
          <Text>Water Area: {beel.water_area} hectares</Text>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  subtitle: { fontSize: 16, marginBottom: 5 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 20, marginBottom: 10 },
  card: {
    backgroundColor: '#f2f2f2',
    padding: 12,
    marginBottom: 10,
    borderRadius: 6,
  },
  beelName: { fontWeight: 'bold' }
});

export default Dashboard;