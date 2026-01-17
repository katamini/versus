const DataLoader = require('./DataLoader');
const Pick = require('../models/Pick');

/**
 * Loads game data from JSON (either local file or GitHub-hosted)
 */
class JSONLoader extends DataLoader {
  /**
   * @param {string|Object} source - URL to JSON file or JSON object
   */
  constructor(source) {
    super();
    this.source = source;
  }

  /**
   * Load data from JSON source
   * @returns {Promise<void>}
   */
  async load() {
    let data;

    if (typeof this.source === 'string') {
      if (this.source.startsWith('http://') || this.source.startsWith('https://')) {
        const response = await fetch(this.source);
        data = await response.json();
      } else if (typeof require !== 'undefined') {
        data = require(this.source);
      } else {
        const response = await fetch(this.source);
        data = await response.json();
      }
    } else {
      data = this.source;
    }

    this.parseData(data);
  }

  /**
   * Parse JSON data into Pick objects
   * @param {Object} data
   */
  parseData(data) {
    if (data.propertyCategories) {
      this.propertyCategories = data.propertyCategories;
    }

    if (data.picks && Array.isArray(data.picks)) {
      this.picks = data.picks.map(pickData => {
        return new Pick(
          pickData.id,
          pickData.name,
          pickData.properties,
          pickData.image,
          pickData.propertyImages
        );
      });
    }
  }
}

module.exports = JSONLoader;
