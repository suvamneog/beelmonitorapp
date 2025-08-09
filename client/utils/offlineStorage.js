import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  DRAFTS: 'survey_drafts',
  PENDING_SUBMISSIONS: 'pending_submissions',
  OFFLINE_IMAGES: 'offline_images',
  SYNC_QUEUE: 'sync_queue',
  LAST_SYNC: 'last_sync_timestamp'
};

// Draft Management
export const saveDraft = async (draftData) => {
  try {
    const drafts = await getDrafts();
    const draftId = draftData.id || `draft_${Date.now()}`;
    const draftWithMetadata = {
      ...draftData,
      id: draftId,
      lastModified: new Date().toISOString(),
      status: 'draft'
    };
    
    drafts[draftId] = draftWithMetadata;
    await AsyncStorage.setItem(STORAGE_KEYS.DRAFTS, JSON.stringify(drafts));
    return draftId;
  } catch (error) {
    console.error('Error saving draft:', error);
    throw error;
  }
};

export const getDrafts = async () => {
  try {
    const draftsJson = await AsyncStorage.getItem(STORAGE_KEYS.DRAFTS);
    return draftsJson ? JSON.parse(draftsJson) : {};
  } catch (error) {
    console.error('Error getting drafts:', error);
    return {};
  }
};

export const getDraft = async (draftId) => {
  try {
    const drafts = await getDrafts();
    return drafts[draftId] || null;
  } catch (error) {
    console.error('Error getting draft:', error);
    return null;
  }
};

export const deleteDraft = async (draftId) => {
  try {
    const drafts = await getDrafts();
    delete drafts[draftId];
    await AsyncStorage.setItem(STORAGE_KEYS.DRAFTS, JSON.stringify(drafts));
  } catch (error) {
    console.error('Error deleting draft:', error);
    throw error;
  }
};

// Pending Submissions Management
export const addPendingSubmission = async (submissionData) => {
  try {
    const pending = await getPendingSubmissions();
    const submissionId = `pending_${Date.now()}`;
    const submissionWithMetadata = {
      ...submissionData,
      id: submissionId,
      timestamp: new Date().toISOString(),
      status: 'pending',
      retryCount: 0
    };
    
    pending[submissionId] = submissionWithMetadata;
    await AsyncStorage.setItem(STORAGE_KEYS.PENDING_SUBMISSIONS, JSON.stringify(pending));
    return submissionId;
  } catch (error) {
    console.error('Error adding pending submission:', error);
    throw error;
  }
};

export const getPendingSubmissions = async () => {
  try {
    const pendingJson = await AsyncStorage.getItem(STORAGE_KEYS.PENDING_SUBMISSIONS);
    return pendingJson ? JSON.parse(pendingJson) : {};
  } catch (error) {
    console.error('Error getting pending submissions:', error);
    return {};
  }
};

export const removePendingSubmission = async (submissionId) => {
  try {
    const pending = await getPendingSubmissions();
    delete pending[submissionId];
    await AsyncStorage.setItem(STORAGE_KEYS.PENDING_SUBMISSIONS, JSON.stringify(pending));
  } catch (error) {
    console.error('Error removing pending submission:', error);
    throw error;
  }
};

export const updatePendingSubmission = async (submissionId, updates) => {
  try {
    const pending = await getPendingSubmissions();
    if (pending[submissionId]) {
      pending[submissionId] = { ...pending[submissionId], ...updates };
      await AsyncStorage.setItem(STORAGE_KEYS.PENDING_SUBMISSIONS, JSON.stringify(pending));
    }
  } catch (error) {
    console.error('Error updating pending submission:', error);
    throw error;
  }
};

// Offline Images Management
export const saveOfflineImage = async (imageUri, metadata = {}) => {
  try {
    const images = await getOfflineImages();
    const imageId = `img_${Date.now()}`;
    const imageData = {
      id: imageId,
      uri: imageUri,
      metadata,
      timestamp: new Date().toISOString(),
      synced: false
    };
    
    images[imageId] = imageData;
    await AsyncStorage.setItem(STORAGE_KEYS.OFFLINE_IMAGES, JSON.stringify(images));
    return imageId;
  } catch (error) {
    console.error('Error saving offline image:', error);
    throw error;
  }
};

export const getOfflineImages = async () => {
  try {
    const imagesJson = await AsyncStorage.getItem(STORAGE_KEYS.OFFLINE_IMAGES);
    return imagesJson ? JSON.parse(imagesJson) : {};
  } catch (error) {
    console.error('Error getting offline images:', error);
    return {};
  }
};

// Sync Queue Management
export const addToSyncQueue = async (action, data) => {
  try {
    const queue = await getSyncQueue();
    const queueItem = {
      id: `sync_${Date.now()}`,
      action,
      data,
      timestamp: new Date().toISOString(),
      retryCount: 0
    };
    
    queue.push(queueItem);
    await AsyncStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(queue));
  } catch (error) {
    console.error('Error adding to sync queue:', error);
    throw error;
  }
};

export const getSyncQueue = async () => {
  try {
    const queueJson = await AsyncStorage.getItem(STORAGE_KEYS.SYNC_QUEUE);
    return queueJson ? JSON.parse(queueJson) : [];
  } catch (error) {
    console.error('Error getting sync queue:', error);
    return [];
  }
};

export const clearSyncQueue = async () => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify([]));
  } catch (error) {
    console.error('Error clearing sync queue:', error);
    throw error;
  }
};

// Network Status and Sync Timestamp
export const setLastSyncTimestamp = async (timestamp = new Date().toISOString()) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.LAST_SYNC, timestamp);
  } catch (error) {
    console.error('Error setting last sync timestamp:', error);
  }
};

export const getLastSyncTimestamp = async () => {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.LAST_SYNC);
  } catch (error) {
    console.error('Error getting last sync timestamp:', error);
    return null;
  }
};

// Utility Functions
export const clearAllOfflineData = async () => {
  try {
    await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
  } catch (error) {
    console.error('Error clearing offline data:', error);
    throw error;
  }
};

export const getOfflineDataSize = async () => {
  try {
    const keys = Object.values(STORAGE_KEYS);
    const data = await AsyncStorage.multiGet(keys);
    let totalSize = 0;
    
    data.forEach(([key, value]) => {
      if (value) {
        totalSize += new Blob([value]).size;
      }
    });
    
    return totalSize;
  } catch (error) {
    console.error('Error calculating offline data size:', error);
    return 0;
  }
};