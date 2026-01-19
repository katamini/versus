/**
 * Represents a single pick/entry in the game database
 * Each pick has associated facts
 */
class Pick {
  /**
   * @param {string} id - Unique identifier for the pick
   * @param {string} name - Display name of the pick
   * @param {string[]} factIds - Array of fact IDs associated with this pick
   * @param {string} [image] - Optional image URL for the pick (pixel art)
   */
  constructor(id, name, factIds = [], image = null) {
    this.id = id;
    this.name = name;
    this.factIds = factIds;
    this.image = image;
  }

  /**
   * Get all fact IDs for this pick
   * @returns {string[]}
   */
  getFactIds() {
    return this.factIds;
  }

  /**
   * Check if this pick has a specific fact
   * @param {string} factId
   * @returns {boolean}
   */
  hasFact(factId) {
    return this.factIds.includes(factId);
  }

  /**
   * Add a fact to this pick
   * @param {string} factId
   */
  addFact(factId) {
    if (!this.factIds.includes(factId)) {
      this.factIds.push(factId);
    }
  }
}

module.exports = Pick;
