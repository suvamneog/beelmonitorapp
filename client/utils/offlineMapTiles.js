import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';

const ASSAM_BOUNDS = {
  north: 28.2,
  south: 24.1,
  east: 96.1,
  west: 89.7
};

const TILE_CACHE_KEY = 'cached_map_tiles';
const TILE_CACHE_DIR = `${FileSystem.documentDirectory}map_tiles/`;

class OfflineMapManager {
  constructor() {
    this.isDownloading = false;
    this.downloadProgress = 0;
    this.totalTiles = 0;
    this.downloadedTiles = 0;
    this.progressListeners = [];
  }

  addProgressListener(listener) {
    this.progressListeners.push(listener);
  }

  removeProgressListener(listener) {
    this.progressListeners = this.progressListeners.filter(l => l !== listener);
  }

  notifyProgress(progress) {
    this.progressListeners.forEach(listener => {
      try {
        listener(progress);
      } catch (error) {
        console.error('Error in progress listener:', error);
      }
    });
  }

  // Calculate tile coordinates for given bounds and zoom levels
  deg2num(lat_deg, lon_deg, zoom) {
    const lat_rad = lat_deg * Math.PI / 180.0;
    const n = Math.pow(2.0, zoom);
    const xtile = Math.floor((lon_deg + 180.0) / 360.0 * n);
    const ytile = Math.floor((1.0 - Math.asinh(Math.tan(lat_rad)) / Math.PI) / 2.0 * n);
    return { x: xtile, y: ytile };
  }

  // Generate tile URLs for Assam region
  generateTileList(minZoom = 8, maxZoom = 14) {
    const tiles = [];
    
    for (let zoom = minZoom; zoom <= maxZoom; zoom++) {
      const topLeft = this.deg2num(ASSAM_BOUNDS.north, ASSAM_BOUNDS.west, zoom);
      const bottomRight = this.deg2num(ASSAM_BOUNDS.south, ASSAM_BOUNDS.east, zoom);
      
      for (let x = topLeft.x; x <= bottomRight.x; x++) {
        for (let y = topLeft.y; y <= bottomRight.y; y++) {
          tiles.push({
            zoom,
            x,
            y,
            url: `https://tile.openstreetmap.org/${zoom}/${x}/${y}.png`,
            filename: `${zoom}_${x}_${y}.png`
          });
        }
      }
    }
    
    return tiles;
  }

  // Download and cache map tiles
  async downloadAssamMapTiles(minZoom = 8, maxZoom = 12) {
    if (this.isDownloading) {
      console.log('Download already in progress');
      return { success: false, message: 'Download already in progress' };
    }

    try {
      this.isDownloading = true;
      this.downloadProgress = 0;
      this.downloadedTiles = 0;

      // Create cache directory
      const dirInfo = await FileSystem.getInfoAsync(TILE_CACHE_DIR);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(TILE_CACHE_DIR, { intermediates: true });
      }

      // Generate tile list
      const tiles = this.generateTileList(minZoom, maxZoom);
      this.totalTiles = tiles.length;

      console.log(`Starting download of ${this.totalTiles} map tiles for Assam region`);
      this.notifyProgress({
        status: 'started',
        total: this.totalTiles,
        downloaded: 0,
        progress: 0
      });

      // Download tiles in batches to avoid overwhelming the server
      const batchSize = 10;
      const cachedTiles = {};

      for (let i = 0; i < tiles.length; i += batchSize) {
        const batch = tiles.slice(i, i + batchSize);
        const batchPromises = batch.map(tile => this.downloadTile(tile));
        
        const results = await Promise.allSettled(batchPromises);
        
        results.forEach((result, index) => {
          const tile = batch[index];
          if (result.status === 'fulfilled' && result.value) {
            cachedTiles[`${tile.zoom}_${tile.x}_${tile.y}`] = {
              ...tile,
              localPath: result.value,
              downloadedAt: new Date().toISOString()
            };
            this.downloadedTiles++;
          } else {
            console.warn(`Failed to download tile: ${tile.filename}`, result.reason);
          }
        });

        this.downloadProgress = (this.downloadedTiles / this.totalTiles) * 100;
        this.notifyProgress({
          status: 'downloading',
          total: this.totalTiles,
          downloaded: this.downloadedTiles,
          progress: this.downloadProgress
        });

        // Small delay between batches to be respectful to the tile server
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Save tile cache metadata
      await AsyncStorage.setItem(TILE_CACHE_KEY, JSON.stringify({
        tiles: cachedTiles,
        downloadedAt: new Date().toISOString(),
        bounds: ASSAM_BOUNDS,
        minZoom,
        maxZoom,
        totalTiles: Object.keys(cachedTiles).length
      }));

      console.log(`Successfully downloaded ${this.downloadedTiles} out of ${this.totalTiles} tiles`);
      
      this.notifyProgress({
        status: 'completed',
        total: this.totalTiles,
        downloaded: this.downloadedTiles,
        progress: 100
      });

      return {
        success: true,
        downloaded: this.downloadedTiles,
        total: this.totalTiles,
        message: `Downloaded ${this.downloadedTiles} map tiles`
      };

    } catch (error) {
      console.error('Error downloading map tiles:', error);
      this.notifyProgress({
        status: 'error',
        error: error.message
      });
      return {
        success: false,
        error: error.message
      };
    } finally {
      this.isDownloading = false;
    }
  }

  // Download individual tile
  async downloadTile(tile) {
    try {
      const localPath = `${TILE_CACHE_DIR}${tile.filename}`;
      
      // Check if tile already exists
      const fileInfo = await FileSystem.getInfoAsync(localPath);
      if (fileInfo.exists) {
        return localPath;
      }

      // Download tile
      const downloadResult = await FileSystem.downloadAsync(tile.url, localPath);
      
      if (downloadResult.status === 200) {
        return localPath;
      } else {
        throw new Error(`HTTP ${downloadResult.status}`);
      }
    } catch (error) {
      console.error(`Error downloading tile ${tile.filename}:`, error);
      return null;
    }
  }

  // Get cached tile info
  async getCachedTileInfo() {
    try {
      const cacheInfo = await AsyncStorage.getItem(TILE_CACHE_KEY);
      return cacheInfo ? JSON.parse(cacheInfo) : null;
    } catch (error) {
      console.error('Error getting cached tile info:', error);
      return null;
    }
  }

  // Check if tiles are available for offline use
  async isOfflineMapAvailable() {
    const cacheInfo = await this.getCachedTileInfo();
    return cacheInfo && cacheInfo.totalTiles > 0;
  }

  // Get offline tile URL template for MapView
  getOfflineTileUrlTemplate() {
    return `file://${TILE_CACHE_DIR}{z}_{x}_{y}.png`;
  }

  // Clear cached tiles
  async clearCachedTiles() {
    try {
      // Remove cache directory
      const dirInfo = await FileSystem.getInfoAsync(TILE_CACHE_DIR);
      if (dirInfo.exists) {
        await FileSystem.deleteAsync(TILE_CACHE_DIR);
      }

      // Clear cache metadata
      await AsyncStorage.removeItem(TILE_CACHE_KEY);

      console.log('Cached map tiles cleared');
      return { success: true };
    } catch (error) {
      console.error('Error clearing cached tiles:', error);
      return { success: false, error: error.message };
    }
  }

  // Get cache size
  async getCacheSize() {
    try {
      const dirInfo = await FileSystem.getInfoAsync(TILE_CACHE_DIR);
      if (!dirInfo.exists) {
        return 0;
      }

      const files = await FileSystem.readDirectoryAsync(TILE_CACHE_DIR);
      let totalSize = 0;

      for (const file of files) {
        const fileInfo = await FileSystem.getInfoAsync(`${TILE_CACHE_DIR}${file}`);
        totalSize += fileInfo.size || 0;
      }

      return totalSize;
    } catch (error) {
      console.error('Error calculating cache size:', error);
      return 0;
    }
  }

  // Format cache size for display
  formatCacheSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getDownloadStatus() {
    return {
      isDownloading: this.isDownloading,
      progress: this.downloadProgress,
      downloaded: this.downloadedTiles,
      total: this.totalTiles
    };
  }
}

// Create singleton instance
const offlineMapManager = new OfflineMapManager();
export default offlineMapManager;