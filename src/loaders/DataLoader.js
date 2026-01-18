/**
 * Base class for loading game data from various sources
 */
class DataLoader {
  constructor() {
    this.picks = [];
    this.facts = [];
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
   * Get all facts
   * @returns {Fact[]}
   */
  getFacts() {
    return this.facts;
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
   * Get a random fact
   * @returns {Fact|null}
   */
  getRandomFact() {
    if (this.facts.length === 0) return null;
    const index = Math.floor(Math.random() * this.facts.length);
    return this.facts[index];
  }

  /**
   * Find picks that have a specific fact
   * @param {string} factId
   * @returns {Pick[]}
   */
  findPicksWithFact(factId) {
    return this.picks.filter(pick => pick.hasFact(factId));
  }

  /**
   * Find picks that don't have a specific fact
   * @param {string} factId
   * @param {number} count - Number of picks to return
   * @returns {Pick[]}
   */
  findPicksWithoutFact(factId, count = 2) {
    const candidates = this.picks.filter(pick => !pick.hasFact(factId));
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
   * Get fact by ID
   * @param {string} factId
   * @returns {Fact|null}
   */
  getFactById(factId) {
    return this.facts.find(fact => fact.id === factId) || null;
  }
}

module.exports = DataLoader;
