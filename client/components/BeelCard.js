import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const BeelCard = ({ 
  name, 
  district, 
  year, 
  water_area, 
  t_sanction_amount, 
  latitude, 
  longitude,
  onEditPress
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.name}>{name}</Text>
        <View style={styles.headerRight}>
          <Text style={styles.year}>{year}</Text>
          <TouchableOpacity onPress={onEditPress} style={styles.editButton}>
            <Icon name="edit" size={18} color="#3498db" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Icon name="location-on" size={18} color="#7f8c8d" />
          <Text style={styles.detailText}>{district || 'N/A'}</Text>
        </View>

        <View style={styles.detailRow}>
          <Icon name="water" size={18} color="#3498db" />
          <Text style={styles.detailText}>
            {water_area ? `${water_area} hectares` : 'N/A'}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Icon name="attach-money" size={18} color="#2ecc71" />
          <Text style={styles.detailText}>
            {t_sanction_amount ? `₹${t_sanction_amount}` : 'N/A'}
          </Text>
        </View>
      </View>

      {latitude && longitude && (
        <View style={styles.coordinates}>
          <Text style={styles.coordinateText}>
            {latitude}, {longitude}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  year: {
    fontSize: 14,
    color: '#7f8c8d',
    marginRight: 10,
  },
  editButton: {
    padding: 4,
  },
  details: {
    marginVertical: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#34495e',
  },
  coordinates: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
  },
  coordinateText: {
    fontSize: 12,
    color: '#7f8c8d',
  },
});

export default BeelCard;