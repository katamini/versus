const DataLoader = require('./DataLoader');
const Pick = require('../models/Pick');
const Fact = require('../models/Fact');

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
   * - facts (id, description, category, image)
   * - pick_facts (pick_id, fact_id)
   */
  parseDatabase() {
    const picksResult = this.db.exec('SELECT * FROM picks');
    const factsResult = this.db.exec('SELECT * FROM facts');
    const pickFactsResult = this.db.exec('SELECT * FROM pick_facts');

    // Parse facts
    if (factsResult.length > 0) {
      const factsData = factsResult[0];
      factsData.values.forEach(row => {
        const [id, description, category, image] = row;
        this.facts.push(new Fact(id, description, category, image || null));
      });
    }

    if (picksResult.length === 0) return;

    const picksData = picksResult[0];
    const picksMap = new Map();

    // Parse picks
    picksData.values.forEach(row => {
      const id = row[0].toString();
      const name = row[1];
      const image = row[2] || null;
      picksMap.set(id, { id, name, image, factIds: [] });
    });

    // Parse pick_facts relationships
    if (pickFactsResult.length > 0) {
      const pickFactsData = pickFactsResult[0];
      pickFactsData.values.forEach(row => {
        const pickId = row[0].toString();
        const factId = row[1];

        if (picksMap.has(pickId)) {
          const pick = picksMap.get(pickId);
          pick.factIds.push(factId);
        }
      });
    }

    // Create Pick objects
    this.picks = Array.from(picksMap.values()).map(pickData => {
      return new Pick(
        pickData.id,
        pickData.name,
        pickData.factIds,
        pickData.image
      );
    });
  }
}

module.exports = SQLiteLoader;
