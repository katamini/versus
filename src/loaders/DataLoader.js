const Pick = require('../models/Pick');

/**
 * Base class for loading game data from various sources
 */
class DataLoader {
  constructor() {
    this.picks = [];
    this.propertyCategories = {};
  }

  /**
   * Load data from source
   * @returns {Promise<void>}
   */
  async load() {
    throw new Error('load() must be implemented by subclass');
  }

  /**
   * Get all picks
   * @returns {Pick[]}
   */
  getPicks() {
    return this.picks;
  }

  /**
   * Get a random pick
   * @returns {Pick|null}
   */
  getRandomPick() {
    if (this.picks.length === 0) return null;
    const index = Math.floor(Math.random() * this.picks.length);
    return this.picks[index];
  }

  /**
   * Find picks that share at least one property with the given pick
   * @param {Pick} pick
   * @param {number} count - Number of picks to return
   * @returns {Pick[]}
   */
  findPicksWithSharedProperties(pick, count = 3) {
    const propertyNames = pick.getPropertyNames();
    const candidates = this.picks.filter(p => {
      if (p.id === pick.id) return false;
      return propertyNames.some(prop => p.hasProperty(prop));
    });

    return this.getRandomSubset(candidates, count);
  }

  /**
   * Get a random subset of picks
   * @param {Pick[]} picks
   * @param {number} count
   * @returns {Pick[]}
   */
  getRandomSubset(picks, count) {
    const shuffled = [...picks].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, shuffled.length));
  }

  /**
   * Get image for a property category
   * @param {string} propertyName
   * @returns {string|null}
   */
  getPropertyCategoryImage(propertyName) {
    return this.propertyCategories[propertyName]?.image || null;
  }
}

module.exports = DataLoader;
