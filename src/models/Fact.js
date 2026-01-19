/**
 * Represents a fact that can be associated with picks/characters
 * Example: "WON THE NOBEL PRIZE", "ATE THE MOST HOTDOGS"
 */
class Fact {
  /**
   * @param {string} description - The fact description (e.g., "WON THE NOBEL PRIZE")
   * @param {string} category - Category/topic hint (e.g., "POLITICS", "FOOD")
   * @param {number} [quantity] - Optional quantity for comparison (e.g., 10 dogs vs 5 dogs)
   * @param {string} [image] - Optional image URL for the fact
   */
  constructor(description, category, quantity = null, image = null) {
    this.description = description;
    this.category = category;
    this.quantity = quantity;
    this.image = image;
  }

  /**
   * Validate that required fields are not empty
   * @returns {boolean}
   */
  isValid() {
    return Boolean(this.description && this.description.trim() && 
                   this.category && this.category.trim());
  }
}

module.exports = Fact;
