import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  ActivityIndicator, 
  StyleSheet, 
  RefreshControl, 
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions
} from 'react-native';
import { getBeelList } from '../utils/api';
import BeelCard from '../components/BeelCard';

const { width } = Dimensions.get('window');

const DashboardScreen = ({ route, navigation }) => {
  const [beels, setBeels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const slideAnim = useState(new Animated.Value(-width * 0.8))[0];
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

  const toggleMenu = () => {
    if (menuVisible) {
      // Close menu
      Animated.timing(slideAnim, {
        toValue: -width * 0.8,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setMenuVisible(false));
    } else {
      // Open menu
      setMenuVisible(true);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  const navigateToProfile = () => {
    toggleMenu();
    navigation.navigate('Profile', { 
      userId: user.id, 
      token: token 
    });
  };

  const navigateToSettings = () => {
    toggleMenu();
    navigation.navigate('Settings', { token, user });
  };

  const navigateToHome = () => {
    toggleMenu();
    navigation.navigate('Home', { token, user });
  };

  const navigateToSurveyForm = () => {
    toggleMenu();
    navigation.navigate('SurveyForm', { token, user });
  };

  const navigateToAddBeel = () => {
    navigation.navigate('AddBeel', { token, user });
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
      {/* Header with Menu Icon */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuButton} onPress={toggleMenu}>
          <View style={styles.menuIcon}>
            <View style={styles.menuLine} />
            <View style={styles.menuLine} />
            <View style={styles.menuLine} />
          </View>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Beel Dashboard</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Popup Navigation Menu */}
      <Modal
        visible={menuVisible}
        transparent={true}
        animationType="none"
        onRequestClose={toggleMenu}
      >
        <TouchableOpacity 
          style={styles.overlay} 
          activeOpacity={1} 
          onPress={toggleMenu}
        >
          <Animated.View 
            style={[
              styles.menuContainer,
              {
                transform: [{ translateX: slideAnim }]
              }
            ]}
          >
            <TouchableOpacity activeOpacity={1}>
              {/* User Info Section */}
              <View style={styles.userSection}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {user.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <Text style={styles.userName}>{user.name}</Text>
                <Text style={styles.userDesignation}>{user.designation}</Text>
              </View>

              {/* Menu Items */}
              <View style={styles.menuItems}>
                <TouchableOpacity style={styles.menuItem} onPress={navigateToHome}>
                  <Text style={styles.menuIcon}>🏠</Text>
                  <Text style={styles.menuText}>Home</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem} onPress={toggleMenu}>
                  <Text style={styles.menuIcon}>🏢</Text>
                  <Text style={styles.menuText}>Dashboard</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem} onPress={navigateToSurveyForm}>
                  <Text style={styles.menuIcon}>📋</Text>
                  <Text style={styles.menuText}>Survey Form</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem} onPress={navigateToProfile}>
                  <Text style={styles.menuIcon}>👤</Text>
                  <Text style={styles.menuText}>Profile</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem} onPress={navigateToSettings}>
                  <Text style={styles.menuIcon}>⚙️</Text>
                  <Text style={styles.menuText}>Settings</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Modal>

      {/* Main Content */}
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
            onRefresh={onRefresh}
            colors={['#3498db']}
          />
        }
        ListHeaderComponent={
          <View style={styles.welcomeSection}>
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

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab} onPress={navigateToAddBeel}>
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </View>
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
    paddingHorizontal: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  menuButton: {
    padding: 5,
  },
  menuIcon: {
    width: 24,
    height: 18,
    justifyContent: 'space-between',
  },
  menuLine: {
    width: 24,
    height: 3,
    backgroundColor: 'white',
    borderRadius: 2,
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 34, // Same width as menu button to center title
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  menuContainer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: width * 0.8,
    backgroundColor: 'white',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  userSection: {
    backgroundColor: '#3498db',
    padding: 20,
    alignItems: 'center',
    paddingTop: 50,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatarText: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
  },
  userName: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  userDesignation: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
  },
  menuItems: {
    paddingTop: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuText: {
    fontSize: 16,
    marginLeft: 15,
    color: '#333',
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
  welcomeSection: {
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
    paddingBottom: 80, // Add bottom padding to avoid FAB overlap
  },
  // Floating Action Button
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#e74c3c',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  fabIcon: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default DashboardScreen;