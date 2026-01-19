/**
 * Represents a single pick/entry in the game database
 * Each pick has associated facts
 */
class Pick {
  /**
   * @param {string} id - Unique identifier for the pick
   * @param {string} name - Display name of the pick
   * @param {Array<Object>} facts - Array of fact objects associated with this pick
   * @param {string} [image] - Optional image URL for the pick (pixel art)
   * @param {string} [description] - Optional description of the pick
   */
  constructor(id, name, facts = [], image = null, description = null) {
    this.id = id;
    this.name = name;
    this.facts = facts;
    this.image = image;
    this.description = description;
  }

  /**
   * Get all facts for this pick
   * @returns {Array<Object>}
   */
  getFacts() {
    return this.facts;
  }

  /**
   * Check if this pick has a specific fact by description
   * @param {string} factDescription
   * @returns {boolean}
   */
  hasFact(factDescription) {
    return this.facts.some(fact => fact.description === factDescription);
  }

  /**
   * Get the quantity for a specific fact
   * @param {string} factDescription
   * @returns {number}
   */
  getFactQuantity(factDescription) {
    const fact = this.facts.find(f => f.description === factDescription);
    return fact ? (fact.quantity || 1) : 0;
  }

  /**
   * Add a fact to this pick
   * @param {Object} fact
   */
  addFact(fact) {
    if (!this.hasFact(fact.description)) {
      this.facts.push(fact);
    }
  }
}

module.exports = Pick;
