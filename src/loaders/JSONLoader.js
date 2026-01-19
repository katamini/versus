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
    // Load picks with embedded facts
    if (data.picks && Array.isArray(data.picks)) {
      this.picks = data.picks.map(pickData => {
        // Parse facts for this pick
        const facts = (pickData.facts || []).map(factData => {
          return new Fact(
            factData.description,
            factData.category,
            factData.quantity,
            factData.image
          );
        });

        return new Pick(
          pickData.id,
          pickData.name,
          facts,
          pickData.image,
          pickData.description
        );
      });
    }

    // Build global facts list from all picks
    // Keep the fact with the highest quantity when duplicates exist
    const factMap = new Map();
    for (const pick of this.picks) {
      for (const fact of pick.getFacts()) {
        const key = fact.description;
        const existingFact = factMap.get(key);
        
        if (!existingFact) {
          factMap.set(key, fact);
        } else {
          // Keep the fact with the higher quantity
          const existingQty = existingFact.quantity || 0;
          const newQty = fact.quantity || 0;
          if (newQty > existingQty) {
            factMap.set(key, fact);
          }
        }
      }
    }
    this.facts = Array.from(factMap.values());
  }
}

module.exports = JSONLoader;
