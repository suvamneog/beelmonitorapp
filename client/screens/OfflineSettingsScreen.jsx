import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Switch,
  SafeAreaView
} from 'react-native';
import { 
  getDrafts, 
  getPendingSubmissions, 
  getOfflineDataSize,
  clearAllOfflineData,
  getLastSyncTimestamp 
} from '../utils/offlineStorage';
import syncManager from '../utils/syncManager';
import offlineMapManager from '../utils/offlineMapTiles';

const OfflineSettingsScreen = ({ route, navigation }) => {
  const { token } = route.params || {};
  const [draftsCount, setDraftsCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [dataSize, setDataSize] = useState(0);
  const [lastSync, setLastSync] = useState(null);
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(true);
  const [offlineMapAvailable, setOfflineMapAvailable] = useState(false);
  const [mapCacheSize, setMapCacheSize] = useState(0);
  const [downloadProgress, setDownloadProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOfflineData();
    checkMapAvailability();
    
    // Monitor sync status
    const handleSyncStatus = (status) => {
      setIsSyncing(status.syncStatus === 'started');
      if (status.syncStatus === 'completed') {
        loadOfflineData(); // Refresh data after sync
      }
    };

    // Monitor download progress
    const handleDownloadProgress = (progress) => {
      setDownloadProgress(progress);
    };

    syncManager.addSyncListener(handleSyncStatus);
    offlineMapManager.addProgressListener(handleDownloadProgress);

    return () => {
      syncManager.removeSyncListener(handleSyncStatus);
      offlineMapManager.removeProgressListener(handleDownloadProgress);
    };
  }, []);

  const loadOfflineData = async () => {
    try {
      const [drafts, pending, size, syncTime] = await Promise.all([
        getDrafts(),
        getPendingSubmissions(),
        getOfflineDataSize(),
        getLastSyncTimestamp()
      ]);

      setDraftsCount(Object.keys(drafts).length);
      setPendingCount(Object.keys(pending).length);
      setDataSize(size);
      setLastSync(syncTime);
      
      const networkStatus = await syncManager.getCurrentNetworkStatus();
      setIsOnline(networkStatus.isOnline);
    } catch (error) {
      console.error('Error loading offline data:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkMapAvailability = async () => {
    try {
      const available = await offlineMapManager.isOfflineMapAvailable();
      setOfflineMapAvailable(available);
      
      if (available) {
        const size = await offlineMapManager.getCacheSize();
        setMapCacheSize(size);
      }
    } catch (error) {
      console.error('Error checking map availability:', error);
    }
  };

  const handleForceSync = async () => {
    if (!isOnline) {
      Alert.alert('Offline', 'Please connect to internet to sync data.');
      return;
    }

    if (!token) {
      Alert.alert('Error', 'Authentication token not available.');
      return;
    }

    try {
      setIsSyncing(true);
      const result = await syncManager.forceSyncAll(token);
      
      if (result.success) {
        Alert.alert(
          'Sync Complete',
          `Successfully synced ${result.successCount} items.`
        );
      } else {
        Alert.alert(
          'Sync Issues',
          `Synced ${result.successCount} items, ${result.failureCount} failed.`
        );
      }
    } catch (error) {
      Alert.alert('Sync Error', error.message);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDownloadMaps = async () => {
    if (!isOnline) {
      Alert.alert('Offline', 'Please connect to internet to download maps.');
      return;
    }

    Alert.alert(
      'Download Offline Maps',
      'This will download map tiles for Assam region (approximately 10-50 MB). Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Download',
          onPress: async () => {
            try {
              const result = await offlineMapManager.downloadAssamMapTiles(8, 12);
              if (result.success) {
                Alert.alert(
                  'Download Complete',
                  `Successfully downloaded ${result.downloaded} map tiles.`
                );
                await checkMapAvailability();
              } else {
                Alert.alert('Download Failed', result.error);
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to download maps: ' + error.message);
            }
          }
        }
      ]
    );
  };

  const handleClearMaps = async () => {
    Alert.alert(
      'Clear Offline Maps',
      'This will remove all cached map tiles. You will need internet to view maps. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await offlineMapManager.clearCachedTiles();
              Alert.alert('Success', 'Offline maps cleared.');
              await checkMapAvailability();
            } catch (error) {
              Alert.alert('Error', 'Failed to clear maps: ' + error.message);
            }
          }
        }
      ]
    );
  };

  const handleClearAllData = async () => {
    Alert.alert(
      'Clear All Offline Data',
      'This will remove all drafts, pending submissions, and cached data. This action cannot be undone. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearAllOfflineData();
              await offlineMapManager.clearCachedTiles();
              Alert.alert('Success', 'All offline data cleared.');
              await loadOfflineData();
              await checkMapAvailability();
            } catch (error) {
              Alert.alert('Error', 'Failed to clear data: ' + error.message);
            }
          }
        }
      ]
    );
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
      <ScrollView contentContainerStyle={styles.content}>
        {/* Network Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Network Status</Text>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Connection:</Text>
            <View style={[styles.statusIndicator, { backgroundColor: isOnline ? '#27ae60' : '#e74c3c' }]}>
              <Text style={styles.statusText}>
                {isOnline ? '🌐 Online' : '📱 Offline'}
              </Text>
            </View>
          </View>
          
          {lastSync && (
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Last Sync:</Text>
              <Text style={styles.statusValue}>
                {new Date(lastSync).toLocaleString()}
              </Text>
            </View>
          )}
        </View>

        {/* Data Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Offline Data</Text>
          
          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>📝 Saved Drafts:</Text>
            <Text style={styles.dataValue}>{draftsCount}</Text>
          </View>
          
          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>📤 Pending Sync:</Text>
            <Text style={styles.dataValue}>{pendingCount}</Text>
          </View>
          
          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>💾 Data Size:</Text>
            <Text style={styles.dataValue}>{formatBytes(dataSize)}</Text>
          </View>
        </View>

        {/* Sync Controls */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sync Settings</Text>
          
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Auto Sync</Text>
            <Switch
              value={autoSyncEnabled}
              onValueChange={setAutoSyncEnabled}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={autoSyncEnabled ? '#3498db' : '#f4f3f4'}
            />
          </View>
          
          <TouchableOpacity
            style={[styles.actionButton, !isOnline && styles.disabledButton]}
            onPress={handleForceSync}
            disabled={!isOnline || isSyncing}
          >
            {isSyncing ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.actionButtonText}>
                🔄 Force Sync Now ({pendingCount} pending)
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Offline Maps */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Offline Maps</Text>
          
          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>📍 Maps Available:</Text>
            <Text style={styles.dataValue}>
              {offlineMapAvailable ? '✅ Yes' : '❌ No'}
            </Text>
          </View>
          
          {offlineMapAvailable && (
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>🗺️ Cache Size:</Text>
              <Text style={styles.dataValue}>{formatBytes(mapCacheSize)}</Text>
            </View>
          )}
          
          {downloadProgress && (
            <View style={styles.progressContainer}>
              <Text style={styles.progressText}>
                Downloading: {downloadProgress.downloaded || 0} / {downloadProgress.total || 0} tiles
              </Text>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${downloadProgress.progress || 0}%` }
                  ]} 
                />
              </View>
            </View>
          )}
          
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.actionButton, styles.secondaryButton, !isOnline && styles.disabledButton]}
              onPress={handleDownloadMaps}
              disabled={!isOnline}
            >
              <Text style={styles.secondaryButtonText}>
                📥 Download Maps
              </Text>
            </TouchableOpacity>
            
            {offlineMapAvailable && (
              <TouchableOpacity
                style={[styles.actionButton, styles.dangerButton]}
                onPress={handleClearMaps}
              >
                <Text style={styles.actionButtonText}>
                  🗑️ Clear Maps
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Data Management */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Management</Text>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.dangerButton]}
            onPress={handleClearAllData}
          >
            <Text style={styles.actionButtonText}>
              🗑️ Clear All Offline Data
            </Text>
          </TouchableOpacity>
          
          <Text style={styles.warningText}>
            ⚠️ This will remove all drafts, pending submissions, and cached data permanently.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 20,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
    paddingBottom: 8,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  statusIndicator: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  statusValue: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '500',
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dataLabel: {
    fontSize: 14,
    color: '#34495e',
  },
  dataValue: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '600',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  settingLabel: {
    fontSize: 16,
    color: '#2c3e50',
  },
  actionButton: {
    backgroundColor: '#3498db',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  secondaryButton: {
    backgroundColor: '#95a5a6',
    flex: 1,
    marginRight: 8,
  },
  dangerButton: {
    backgroundColor: '#e74c3c',
  },
  disabledButton: {
    backgroundColor: '#bdc3c7',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressText: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 8,
    textAlign: 'center',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#ecf0f1',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3498db',
  },
  warningText: {
    fontSize: 12,
    color: '#e67e22',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 8,
  },
});

export default OfflineSettingsScreen;