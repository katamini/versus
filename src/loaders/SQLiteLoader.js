const DataLoader = require('./DataLoader');
const Pick = require('../models/Pick');

/**
 * Loads game data from SQLite database
 * Note: Requires sql.js library for browser-based SQLite
 */
class SQLiteLoader extends DataLoader {
  /**
   * @param {string|ArrayBuffer} source - Path or ArrayBuffer of SQLite database
   */
  constructor(source) {
    super();
    this.source = source;
    this.db = null;
  }

  /**
   * Load data from SQLite database
   * @returns {Promise<void>}
   */
  async load() {
    if (typeof window !== 'undefined' && window.SQL) {
      await this.loadInBrowser();
    } else {
      throw new Error('SQLite loading requires sql.js library in browser environment');
    }
  }

  /**
   * Load SQLite in browser using sql.js
   * @returns {Promise<void>}
   */
  async loadInBrowser() {
    const SQL = window.SQL;
    let buffer;

    if (typeof this.source === 'string') {
      const response = await fetch(this.source);
      buffer = await response.arrayBuffer();
    } else {
      buffer = this.source;
    }

    this.db = new SQL.Database(new Uint8Array(buffer));
    this.parseDatabase();
  }

  /**
   * Parse SQLite database structure
   * Expected tables:
   * - picks (id, name, image)
   * - properties (pick_id, property_name, value, image)
   * - property_categories (name, image)
   */
  parseDatabase() {
    const picksResult = this.db.exec('SELECT * FROM picks');
    const propertiesResult = this.db.exec('SELECT * FROM properties');
    
    let categoriesResult;
    try {
      categoriesResult = this.db.exec('SELECT * FROM property_categories');
    } catch (e) {
      categoriesResult = [];
    }

    if (categoriesResult.length > 0) {
      const categoriesData = categoriesResult[0];
      categoriesData.values.forEach(row => {
        const [name, image] = row;
        this.propertyCategories[name] = { image };
      });
    }

    if (picksResult.length === 0) return;

    const picksData = picksResult[0];
    const propertiesData = propertiesResult.length > 0 ? propertiesResult[0] : null;

    const picksMap = new Map();

    picksData.values.forEach(row => {
      const id = row[0].toString();
      const name = row[1];
      const image = row[2] || null;
      picksMap.set(id, { id, name, image, properties: {}, propertyImages: {} });
    });

    if (propertiesData) {
      propertiesData.values.forEach(row => {
        const pickId = row[0].toString();
        const propertyName = row[1];
        const value = row[2];
        const image = row[3] || null;

        if (picksMap.has(pickId)) {
          const pick = picksMap.get(pickId);
          pick.properties[propertyName] = value;
          if (image) {
            pick.propertyImages[propertyName] = image;
          }
        }
      });
    }

    this.picks = Array.from(picksMap.values()).map(pickData => {
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

module.exports = SQLiteLoader;
