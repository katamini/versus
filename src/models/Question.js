/**
 * Represents a question in the game
 */
class Question {
  /**
   * @param {Fact} fact - The fact being asked about
   * @param {Pick[]} options - Array of picks to choose from (one has the fact)
   * @param {number} correctAnswerIndex - Index of the correct option
   */
  constructor(fact, options, correctAnswerIndex) {
    this.fact = fact;
    this.options = options;
    this.correctAnswer = correctAnswerIndex;
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
    return this.fact.description;
  }
}

module.exports = Question;
