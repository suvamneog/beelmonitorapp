
import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  ActivityIndicator,
  Animated,
  Dimensions,
  SafeAreaView
} from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { getBeelStats } from '../utils/api';

const { width } = Dimensions.get('window');

const HomeScreen = ({ route, navigation }) => {
  const { token, user } = route.params;
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [menuVisible, setMenuVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(-width * 0.7)).current;

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await getBeelStats(token);
        if (response.status === 'success') {
          setStats(response.data);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const toggleMenu = () => {
    if (menuVisible) {
      Animated.timing(slideAnim, {
        toValue: -width * 0.7,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setMenuVisible(false));
    } else {
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

  const navigateToSurveyForm = () => {
    toggleMenu();
    navigation.navigate('SurveyForm', { token, user });
  };

  const navigateToDashboard = () => {
    toggleMenu();
    navigation.navigate('Dashboard', { token, user });
  };

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(52, 152, 219, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Menu Button */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuButton} onPress={toggleMenu}>
          <View style={styles.menuIcon}>
            <View style={styles.menuLine} />
            <View style={styles.menuLine} />
            <View style={styles.menuLine} />
          </View>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Beel Analytics</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Slide-out Menu */}
      {menuVisible && (
        <TouchableOpacity 
          style={styles.overlay} 
          activeOpacity={1} 
          onPress={toggleMenu}
        >
          <Animated.View 
            style={[
              styles.menuContainer,
              { transform: [{ translateX: slideAnim }] }
            ]}
          >
            <View style={styles.userSection}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {user.name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userDesignation}>{user.designation}</Text>
            </View>

            <View style={styles.menuItems}>
              <TouchableOpacity style={styles.menuItem} onPress={toggleMenu}>
                <Text style={styles.menuIcon}>📊</Text>
                <Text style={styles.menuText}>Analytics</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuItem} onPress={navigateToDashboard}>
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
          </Animated.View>
        </TouchableOpacity>
      )}

      {/* Main Content */}
      <ScrollView style={styles.content}>
        <View style={styles.welcomeSection}>
          <Text style={styles.welcome}>Hello, {user.name}</Text>
          <Text style={styles.designation}>{user.designation}</Text>
        </View>

        {/* Summary Cards */}
        <View style={styles.cardRow}>
          <View style={styles.card}>
            <Text style={styles.cardValue}>{stats?.total_beels || 0}</Text>
            <Text style={styles.cardLabel}>Total Beels</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardValue}>{stats?.total_water_area || 0}</Text>
            <Text style={styles.cardLabel}>Total Area (ha)</Text>
          </View>
        </View>

        {/* Water Area Chart */}
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Water Area Distribution</Text>
          <BarChart
            data={{
              labels: stats?.water_area_distribution?.labels || [],
              datasets: [{
                data: stats?.water_area_distribution?.values || []
              }]
            }}
            width={width - 40}
            height={220}
            chartConfig={chartConfig}
            verticalLabelRotation={30}
            fromZero
          />
        </View>
      </ScrollView>

      {/* Bottom Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => navigation.navigate('SurveyForm', { token, user })}
        >
          <Text style={styles.actionButtonText}>Survey</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => navigation.navigate('Dashboard', { token, user })}
        >
          <Text style={styles.actionButtonText}>Manage</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#3498db',
    paddingVertical: 15,
    paddingHorizontal: 20,
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
    width: 34,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1,
  },
  menuContainer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: width * 0.7,
    backgroundColor: 'white',
    zIndex: 2,
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
  content: {
    flex: 1,
    padding: 20,
  },
  welcomeSection: {
    marginBottom: 20,
  },
  welcome: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  designation: {
    color: '#666',
    fontSize: 14,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    width: '48%',
    alignItems: 'center',
    elevation: 2,
  },
  cardValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3498db',
  },
  cardLabel: {
    color: '#666',
    fontSize: 14,
    marginTop: 5,
  },
  chartContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  actionButtons: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingVertical: 12,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
  },
  actionButtonText: {
    color: '#3498db',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HomeScreen;