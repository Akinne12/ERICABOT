// ./utils/timeParser.js
/**
 * Time parsing and formatting utilities
 * Supports: seconds (s), minutes (m), hours (h), days (d), weeks (w)
 * Example formats: "30s", "2h", "7d", "1w"
 */

const units = {
    s: 1000,          // seconds
    m: 1000 * 60,     // minutes
    h: 1000 * 60 * 60,// hours
    d: 1000 * 60 * 60 * 24,   // days
    w: 1000 * 60 * 60 * 24 * 7 // weeks
  };
  
  module.exports = {
    /**
     * Parse duration string to milliseconds
     * @param {string} input - Duration string (e.g. "30d")
     * @returns {number|null} Milliseconds or null if invalid
     */
    parseDuration(input) {
      if (!input) return null;
      
      // Match patterns like "30d", "2h", "15m"
      const match = input.match(/^(\d+)([smhdw])$/i);
      if (!match) return null;
  
      const [, amount, unit] = match;
      const lowerUnit = unit.toLowerCase();
      
      return parseInt(amount) * units[lowerUnit];
    },
  
    /**
     * Format milliseconds to human-readable string
     * @param {number} ms - Milliseconds
     * @param {boolean} [verbose=false] - Detailed output
     * @returns {string} Formatted duration (e.g. "2d 5h")
     */
    formatDuration(ms, verbose = false) {
      if (typeof ms !== 'number' || ms < 0) return 'Invalid duration';
  
      const seconds = Math.floor((ms / 1000) % 60);
      const minutes = Math.floor((ms / (1000 * 60)) % 60);
      const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
      const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  
      if (verbose) {
        const parts = [];
        if (days > 0) parts.push(`${days} day${days > 1 ? 's' : ''}`);
        if (hours > 0) parts.push(`${hours} hour${hours > 1 ? 's' : ''}`);
        if (minutes > 0) parts.push(`${minutes} minute${minutes > 1 ? 's' : ''}`);
        if (seconds > 0 || parts.length === 0) {
          parts.push(`${seconds} second${seconds !== 1 ? 's' : ''}`);
        }
        return parts.join(' ');
      }
  
      // Compact format (e.g. "2d 5h")
      const parts = [];
      if (days > 0) parts.push(`${days}d`);
      if (hours > 0) parts.push(`${hours}h`);
      if (minutes > 0 && days === 0) parts.push(`${minutes}m`);
      if (seconds > 0 && days === 0 && hours === 0) parts.push(`${seconds}s`);
  
      return parts.join(' ') || '0s';
    },
  
    /**
     * Convert date to relative time string
     * @param {Date|number} date - Date object or timestamp
     * @returns {string} Relative time (e.g. "in 2 days", "3 hours ago")
     */
    relativeTime(date) {
      const now = Date.now();
      const timestamp = date instanceof Date ? date.getTime() : date;
      const diff = timestamp - now;
      const absDiff = Math.abs(diff);
  
      const minutes = Math.floor(absDiff / (1000 * 60));
      const hours = Math.floor(absDiff / (1000 * 60 * 60));
      const days = Math.floor(absDiff / (1000 * 60 * 60 * 24));
  
      if (absDiff < 60000) { // Less than 1 minute
        return diff < 0 ? 'just now' : 'in a moment';
      } else if (absDiff < 3600000) { // Less than 1 hour
        return diff < 0 
          ? `${minutes} minute${minutes !== 1 ? 's' : ''} ago` 
          : `in ${minutes} minute${minutes !== 1 ? 's' : ''}`;
      } else if (absDiff < 86400000) { // Less than 1 day
        return diff < 0 
          ? `${hours} hour${hours !== 1 ? 's' : ''} ago` 
          : `in ${hours} hour${hours !== 1 ? 's' : ''}`;
      } else {
        return diff < 0 
          ? `${days} day${days !== 1 ? 's' : ''} ago` 
          : `in ${days} day${days !== 1 ? 's' : ''}`;
      }
    },
  
    /**
     * Validate and normalize duration string
     * @param {string} input - Raw duration input
     * @returns {string|null} Normalized string (e.g. "30d") or null if invalid
     */
    normalizeDuration(input) {
      if (!input) return null;
      const match = input.match(/^(\d+)([smhdw])$/i);
      return match ? `${match[1]}${match[2].toLowerCase()}` : null;
    }
  };