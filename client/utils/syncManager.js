import NetInfo from '@react-native-netinfo/netinfo';
import { 
  getPendingSubmissions, 
  removePendingSubmission, 
  updatePendingSubmission,
  getSyncQueue,
  clearSyncQueue,
  setLastSyncTimestamp,
  getOfflineImages
} from './offlineStorage';
import { submitSurvey, updateSurvey, uploadBeelPhoto } from './api';

class SyncManager {
  constructor() {
    this.isOnline = false;
    this.isSyncing = false;
    this.syncListeners = [];
    this.initNetworkListener();
  }

  initNetworkListener() {
    NetInfo.addEventListener(state => {
      const wasOffline = !this.isOnline;
      this.isOnline = state.isConnected && state.isInternetReachable;
      
      console.log('Network status changed:', {
        isConnected: state.isConnected,
        isInternetReachable: state.isInternetReachable,
        type: state.type
      });

      // Notify listeners about network status change
      this.notifyListeners({
        isOnline: this.isOnline,
        connectionType: state.type
      });

      // Auto-sync when coming back online
      if (wasOffline && this.isOnline) {
        console.log('Device came back online, starting auto-sync...');
        setTimeout(() => this.syncPendingData(), 2000); // Wait 2 seconds for stable connection
      }
    });
  }

  addSyncListener(listener) {
    this.syncListeners.push(listener);
  }

  removeSyncListener(listener) {
    this.syncListeners = this.syncListeners.filter(l => l !== listener);
  }

  notifyListeners(data) {
    this.syncListeners.forEach(listener => {
      try {
        listener(data);
      } catch (error) {
        console.error('Error in sync listener:', error);
      }
    });
  }

  async getCurrentNetworkStatus() {
    try {
      const state = await NetInfo.fetch();
      this.isOnline = state.isConnected && state.isInternetReachable;
      return {
        isOnline: this.isOnline,
        connectionType: state.type,
        isWiFi: state.type === 'wifi',
        isCellular: state.type === 'cellular'
      };
    } catch (error) {
      console.error('Error getting network status:', error);
      return { isOnline: false, connectionType: 'unknown' };
    }
  }

  async syncPendingData(token) {
    if (this.isSyncing) {
      console.log('Sync already in progress, skipping...');
      return { success: false, message: 'Sync already in progress' };
    }

    if (!this.isOnline) {
      console.log('Device is offline, cannot sync');
      return { success: false, message: 'Device is offline' };
    }

    if (!token) {
      console.log('No token provided for sync');
      return { success: false, message: 'Authentication token required' };
    }

    this.isSyncing = true;
    let syncResults = {
      success: true,
      totalItems: 0,
      successCount: 0,
      failureCount: 0,
      errors: []
    };

    try {
      console.log('Starting sync process...');
      this.notifyListeners({ syncStatus: 'started' });

      // Sync pending survey submissions
      const pendingSubmissions = await getPendingSubmissions();
      const submissionIds = Object.keys(pendingSubmissions);
      syncResults.totalItems += submissionIds.length;

      console.log(`Found ${submissionIds.length} pending submissions to sync`);

      for (const submissionId of submissionIds) {
        const submission = pendingSubmissions[submissionId];
        try {
          console.log(`Syncing submission: ${submissionId}`);
          
          let result;
          if (submission.isEdit) {
            result = await updateSurvey(submission.data, token);
          } else {
            result = await submitSurvey(submission.data, token);
          }

          if (result) {
            await removePendingSubmission(submissionId);
            syncResults.successCount++;
            console.log(`Successfully synced submission: ${submissionId}`);
          } else {
            throw new Error('No result returned from server');
          }
        } catch (error) {
          console.error(`Failed to sync submission ${submissionId}:`, error);
          syncResults.failureCount++;
          syncResults.errors.push({
            id: submissionId,
            error: error.message
          });

          // Update retry count
          await updatePendingSubmission(submissionId, {
            retryCount: (submission.retryCount || 0) + 1,
            lastError: error.message,
            lastRetry: new Date().toISOString()
          });
        }
      }

      // Sync offline images
      await this.syncOfflineImages(token, syncResults);

      // Update last sync timestamp
      await setLastSyncTimestamp();

      console.log('Sync completed:', syncResults);
      this.notifyListeners({ 
        syncStatus: 'completed', 
        results: syncResults 
      });

    } catch (error) {
      console.error('Sync process failed:', error);
      syncResults.success = false;
      syncResults.errors.push({ general: error.message });
      
      this.notifyListeners({ 
        syncStatus: 'failed', 
        error: error.message 
      });
    } finally {
      this.isSyncing = false;
    }

    return syncResults;
  }

  async syncOfflineImages(token, syncResults) {
    try {
      const offlineImages = await getOfflineImages();
      const imageIds = Object.keys(offlineImages).filter(id => !offlineImages[id].synced);
      
      console.log(`Found ${imageIds.length} offline images to sync`);
      syncResults.totalItems += imageIds.length;

      for (const imageId of imageIds) {
        const imageData = offlineImages[imageId];
        try {
          const formData = new FormData();
          formData.append('s_beel_id', imageData.metadata.beelId || 0);
          formData.append('title', imageData.metadata.title || 'Offline Photo');
          formData.append('photo[]', {
            uri: imageData.uri,
            name: `offline_photo_${Date.now()}.jpg`,
            type: 'image/jpeg'
          });
          formData.append('latitude', imageData.metadata.latitude || '0');
          formData.append('longitude', imageData.metadata.longitude || '0');

          const result = await uploadBeelPhoto(formData, token);
          if (result) {
            // Mark as synced
            offlineImages[imageId].synced = true;
            offlineImages[imageId].syncedAt = new Date().toISOString();
            syncResults.successCount++;
            console.log(`Successfully synced image: ${imageId}`);
          }
        } catch (error) {
          console.error(`Failed to sync image ${imageId}:`, error);
          syncResults.failureCount++;
          syncResults.errors.push({
            id: imageId,
            type: 'image',
            error: error.message
          });
        }
      }
    } catch (error) {
      console.error('Error syncing offline images:', error);
    }
  }

  async forceSyncAll(token) {
    console.log('Force sync requested...');
    return await this.syncPendingData(token);
  }

  getSyncStatus() {
    return {
      isOnline: this.isOnline,
      isSyncing: this.isSyncing
    };
  }
}

// Create singleton instance
const syncManager = new SyncManager();
export default syncManager;