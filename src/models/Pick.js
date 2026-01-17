/**
 * Represents a single pick/entry in the game database
 * Each pick has properties with numeric values and optional images
 */
class Pick {
  /**
   * @param {string} id - Unique identifier for the pick
   * @param {string} name - Display name of the pick
   * @param {Object<string, number>} properties - Properties with numeric values (e.g., {DOGS: 10, MONEY: 5})
   * @param {string} [image] - Optional image URL for the pick
   * @param {Object<string, string>} [propertyImages] - Optional images for specific properties
   */
  constructor(id, name, properties, image = null, propertyImages = {}) {
    this.id = id;
    this.name = name;
    this.properties = properties;
    this.image = image;
    this.propertyImages = propertyImages;
  }

  /**
   * Get all property names for this pick
   * @returns {string[]}
   */
  getPropertyNames() {
    return Object.keys(this.properties);
  }

  /**
   * Get the value of a specific property
   * @param {string} propertyName
   * @returns {number|undefined}
   */
  getPropertyValue(propertyName) {
    return this.properties[propertyName];
  }

  /**
   * Check if this pick has a specific property
   * @param {string} propertyName
   * @returns {boolean}
   */
  hasProperty(propertyName) {
    return propertyName in this.properties;
  }

  /**
   * Get image for a specific property
   * @param {string} propertyName
   * @returns {string|null}
   */
  getPropertyImage(propertyName) {
    return this.propertyImages[propertyName] || null;
  }
}

module.exports = Pick;
