/**
 * Represents a question in the game
 */
class Question {
  /**
   * @param {Pick} targetPick - The main pick to compare against
   * @param {Pick[]} options - Array of picks to choose from
   * @param {string} property - The property being compared
   * @param {string} [propertyImage] - Optional image for the property category
   */
  constructor(targetPick, options, property, propertyImage = null) {
    this.targetPick = targetPick;
    this.options = options;
    this.property = property;
    this.propertyImage = propertyImage;
    this.correctAnswer = this.findCorrectAnswer();
  }

  /**
   * Find which option has more of the property than the target pick
   * @returns {number} - Index of the correct option
   */
  findCorrectAnswer() {
    const targetValue = this.targetPick.getPropertyValue(this.property);
    
    for (let i = 0; i < this.options.length; i++) {
      const optionValue = this.options[i].getPropertyValue(this.property);
      if (optionValue !== undefined && optionValue > targetValue) {
        return i;
      }
    }
    
    return -1;
  }

  /**
   * Check if the player's answer is correct
   * @param {number} answerIndex - Index of the selected option
   * @returns {boolean}
   */
  checkAnswer(answerIndex) {
    return answerIndex === this.correctAnswer;
  }

  /**
   * Get the question text
   * @returns {string}
   */
  getQuestionText() {
    return `Which has more ${this.property} than ${this.targetPick.name}?`;
  }
}

module.exports = Question;
