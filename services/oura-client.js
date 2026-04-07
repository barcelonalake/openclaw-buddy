// Oura API Client
// Fetches sleep and readiness data from Oura Ring API v2

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const os = require('os');

class OuraAPIError extends Error {
  constructor(message, type) {
    super(message);
    this.name = 'OuraAPIError';
    this.type = type;
  }
}

class OuraClient {
  constructor() {
    this.baseURL = 'https://api.ouraring.com/v2';
    this.apiToken = null;
    this.cacheFile = path.join(os.homedir(), '.openclaw-buddy', 'oura-cache.json');
    this.loadToken();
  }

  /**
   * Load API token from config file
   */
  loadToken() {
    try {
      const configPath = path.join(os.homedir(), '.openclaw-buddy', 'config.json');
      if (fs.existsSync(configPath)) {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        this.apiToken = config.ouraToken;
      }
    } catch (error) {
      console.warn('Failed to load Oura token from config:', error.message);
    }
  }

  /**
   * Set API token and save to config
   */
  setToken(token) {
    this.apiToken = token;

    // Save to config
    const configDir = path.join(os.homedir(), '.openclaw-buddy');
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }

    const configPath = path.join(configDir, 'config.json');
    let config = {};
    if (fs.existsSync(configPath)) {
      config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    }

    config.ouraToken = token;
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  }

  /**
   * Format date to YYYY-MM-DD
   */
  formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Fetch sleep data for a specific date
   * @param {Date} date - Default: yesterday
   */
  async fetchSleepData(date) {
    if (!date) {
      // Default to yesterday
      date = new Date();
      date.setDate(date.getDate() - 1);
    }

    if (!this.apiToken) {
      throw new OuraAPIError('API token not set', 'INVALID_TOKEN');
    }

    const dateStr = this.formatDate(date);

    try {
      const response = await axios.get(
        `${this.baseURL}/usercollection/daily_sleep`,
        {
          params: {
            start_date: dateStr,
            end_date: dateStr
          },
          headers: {
            'Authorization': `Bearer ${this.apiToken}`
          }
        }
      );

      if (!response.data.data || response.data.data.length === 0) {
        throw new OuraAPIError('No sleep data found for this date', 'NO_DATA');
      }

      return response.data.data[0];
    } catch (error) {
      if (error.response) {
        if (error.response.status === 401) {
          throw new OuraAPIError('Invalid API token', 'INVALID_TOKEN');
        }
        throw new OuraAPIError(`HTTP ${error.response.status}: ${error.response.statusText}`, 'NETWORK_ERROR');
      }
      throw new OuraAPIError(error.message, 'NETWORK_ERROR');
    }
  }

  /**
   * Fetch readiness data for a specific date
   * @param {Date} date - Default: today
   */
  async fetchReadinessData(date) {
    if (!date) {
      date = new Date();
    }

    if (!this.apiToken) {
      throw new OuraAPIError('API token not set', 'INVALID_TOKEN');
    }

    const dateStr = this.formatDate(date);

    try {
      const response = await axios.get(
        `${this.baseURL}/usercollection/daily_readiness`,
        {
          params: {
            start_date: dateStr,
            end_date: dateStr
          },
          headers: {
            'Authorization': `Bearer ${this.apiToken}`
          }
        }
      );

      if (!response.data.data || response.data.data.length === 0) {
        throw new OuraAPIError('No readiness data found for this date', 'NO_DATA');
      }

      return response.data.data[0];
    } catch (error) {
      if (error.response) {
        if (error.response.status === 401) {
          throw new OuraAPIError('Invalid API token', 'INVALID_TOKEN');
        }
        throw new OuraAPIError(`HTTP ${error.response.status}: ${error.response.statusText}`, 'NETWORK_ERROR');
      }
      throw new OuraAPIError(error.message, 'NETWORK_ERROR');
    }
  }

  /**
   * Get aggregated health data
   * @returns {Promise<{sleepScore: number, readinessScore: number, healthState: string}>}
   */
  async fetchUserHealthData() {
    const [sleepData, readinessData] = await Promise.all([
      this.fetchSleepData(),
      this.fetchReadinessData()
    ]);

    const sleepScore = sleepData.score || 0;
    const readinessScore = readinessData.score || 0;

    const healthState = this.determineHealthState(sleepScore, readinessScore);

    return {
      sleepScore,
      readinessScore,
      healthState,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Determine health state based on scores
   * @param {number} sleepScore - Sleep score (0-100)
   * @param {number} readinessScore - Readiness score (0-100)
   * @returns {'HEALTHY'|'WEAK'|'OVERLOAD'}
   */
  determineHealthState(sleepScore, readinessScore) {
    // Overload: Either score is critically low
    if (sleepScore < 60 || readinessScore < 50) {
      return 'OVERLOAD';
    }

    // Healthy: Both scores are good
    if (sleepScore >= 80 && readinessScore >= 75) {
      return 'HEALTHY';
    }

    // Weak: Moderate scores
    return 'WEAK';
  }

  /**
   * Test API connection
   */
  async testConnection() {
    try {
      await this.fetchReadinessData();
      return { success: true, message: 'Connection successful' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  /**
   * Get cached health data
   */
  getCachedHealth() {
    try {
      if (fs.existsSync(this.cacheFile)) {
        const cache = JSON.parse(fs.readFileSync(this.cacheFile, 'utf-8'));

        // Cache is valid for 1 hour
        const cacheAge = Date.now() - new Date(cache.timestamp).getTime();
        if (cacheAge < 3600000) {
          return cache;
        }
      }
    } catch (error) {
      console.warn('Failed to read cache:', error.message);
    }
    return null;
  }

  /**
   * Save health data to cache
   */
  saveCacheHealth(healthData) {
    try {
      const cacheDir = path.dirname(this.cacheFile);
      if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir, { recursive: true });
      }
      fs.writeFileSync(this.cacheFile, JSON.stringify(healthData, null, 2));
    } catch (error) {
      console.warn('Failed to save cache:', error.message);
    }
  }
}

module.exports = OuraClient;
module.exports.OuraAPIError = OuraAPIError;
