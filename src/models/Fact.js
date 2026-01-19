/**
 * Represents a fact that can be associated with picks/characters
 * Example: "WON THE NOBEL PRIZE", "ATE THE MOST HOTDOGS"
 */
class Fact {
  /**
   * @param {string} id - Unique identifier for the fact
   * @param {string} description - The fact description (e.g., "WON THE NOBEL PRIZE")
   * @param {string} category - Category/topic hint (e.g., "POLITICS", "FOOD")
   * @param {string} [image] - Optional image URL for the fact
   */
  constructor(id, description, category, image = null) {
    this.id = id;
    this.description = description;
    this.category = category;
    this.image = image;
  }

  /**
   * Validate that required fields are not empty
   * @returns {boolean}
   */
  isValid() {
    return Boolean(this.id && this.id.trim() && 
                   this.description && this.description.trim() && 
                   this.category && this.category.trim());
  }
}

module.exports = Fact;
