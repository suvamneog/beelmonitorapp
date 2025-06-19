import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, RefreshControl, TouchableOpacity } from 'react-native';
import { getBeelList } from '../utils/api';
import BeelCard from '../components/BeelCard';

const DashboardScreen = ({ route, navigation }) => {
  const [beels, setBeels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const { token, user } = route.params;

  const fetchBeels = async () => {
    try {
      setError(null);
      console.log('Token being sent:', token);
      const response = await getBeelList(token);
      console.log('API Response:', response);
      
      if (response.status === 'success') {
        console.log('Beels data:', response.data);
        setBeels(response.data || []);
      } else {
        throw new Error(response.message || 'Failed to load data');
      }
    } catch (err) {
      console.log('Error details:', err);
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBeels();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchBeels();
  };

  const navigateToProfile = () => {
    navigation.navigate('Profile', { 
      userId: user.id, 
      token: token 
    });
  };

  if (loading && !refreshing) {
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
        <TouchableOpacity onPress={fetchBeels}>
          <Text style={styles.retry}>Tap to retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Navigation Bar */}
      <View style={styles.navbar}>
        <TouchableOpacity 
          style={styles.navItem} 
          onPress={() => navigation.navigate('Dashboard', { token, user })}
        >
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navItem} 
          onPress={navigateToProfile}
        >
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
        
  <TouchableOpacity 
  style={styles.navItem} 
  onPress={() => navigation.navigate('Settings', { token, user })}
>
  <Text style={styles.navText}>Settings</Text>
</TouchableOpacity>
      </View>

      <FlatList
        data={beels}
        renderItem={({ item }) => (
          <BeelCard 
            name={item.name}
            district={item.district_name}
            year={item.year}
            water_area={item.water_area}
            t_sanction_amount={item.t_sanction_amount}
            latitude={item.latitude}
            longitude={item.longitude}
          />
        )}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onPress={onRefresh}
            colors={['#3498db']}
          />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.welcome}>Welcome, {user.name}</Text>
            <Text style={styles.designation}>{user.designation}</Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.center}>
            <Text>No beel data available</Text>
          </View>
        }
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#3498db',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#2980b9',
  },
  navItem: {
    paddingHorizontal: 10,
  },
  navText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  error: {
    color: 'red',
    marginBottom: 10,
  },
  retry: {
    color: '#3498db',
  },
  header: {
    padding: 15,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  welcome: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  designation: {
    color: '#666',
  },
  list: {
    paddingBottom: 20,
  backgroundColor: '#f5f5f5',
  },
});

export default DashboardScreen;