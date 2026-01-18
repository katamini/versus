const DataLoader = require('./DataLoader');
const Pick = require('../models/Pick');
const Fact = require('../models/Fact');

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
   * Parse JSON data into Pick and Fact objects
   * @param {Object} data
   */
  parseData(data) {
    // Load facts first
    if (data.facts && Array.isArray(data.facts)) {
      this.facts = data.facts.map(factData => {
        return new Fact(
          factData.id,
          factData.description,
          factData.category,
          factData.image
        );
      });
    }

    // Load picks
    if (data.picks && Array.isArray(data.picks)) {
      this.picks = data.picks.map(pickData => {
        return new Pick(
          pickData.id,
          pickData.name,
          pickData.factIds || [],
          pickData.image
        );
      });
    }
  }
}

module.exports = JSONLoader;
