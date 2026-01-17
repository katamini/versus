const Question = require('../models/Question');

/**
 * Core game engine that manages the game flow
 */
class GameEngine {
  /**
   * @param {DataLoader} dataLoader - Data loader instance
   * @param {Object} options - Game options
   */
  constructor(dataLoader, options = {}) {
    this.dataLoader = dataLoader;
    this.options = {
      optionsPerQuestion: options.optionsPerQuestion || 3,
      ...options
    };
    
    this.score = 0;
    this.questionsAnswered = 0;
    this.currentQuestion = null;
    this.gameStarted = false;
    this.initialTime = 10;
    this.minTime = 3;
    this.timeDecrement = 0.5;
    this.currentTimeLimit = this.initialTime;
  }

  /**
   * Initialize the game engine
   * @returns {Promise<void>}
   */
  async initialize() {
    await this.dataLoader.load();
    if (this.dataLoader.getPicks().length === 0) {
      throw new Error('No picks loaded from data source');
    }
  }

  /**
   * Start a new game
   */
  startGame() {
    this.score = 0;
    this.questionsAnswered = 0;
    this.gameStarted = true;
    this.currentTimeLimit = this.initialTime;
    this.generateNextQuestion();
  }

  /**
   * Generate the next question
   * Uses slot machine retry behavior to ensure valid questions
   * @returns {Question|null}
   */
  generateNextQuestion() {
    // Keep trying until we find a valid question (slot machine behavior)
    let attempts = 0;
    const maxAttempts = 100;
    
    while (attempts < maxAttempts) {
      attempts++;
      
      const targetPick = this.dataLoader.getRandomPick();
      if (!targetPick) {
        continue;
      }

      const sharedPropertyPicks = this.dataLoader.findPicksWithSharedProperties(
        targetPick,
        this.options.optionsPerQuestion * 3 // Get more candidates
      );

      if (sharedPropertyPicks.length === 0) {
        continue;
      }

      const commonProperties = this.findCommonProperties(targetPick, sharedPropertyPicks);
      if (commonProperties.length === 0) {
        continue;
      }

      const property = commonProperties[Math.floor(Math.random() * commonProperties.length)];
      
      const validOptions = sharedPropertyPicks.filter(pick => {
        const value = pick.getPropertyValue(property);
        return value !== undefined && value > targetPick.getPropertyValue(property);
      });

      if (validOptions.length === 0) {
        continue;
      }

      const selectedOption = validOptions[Math.floor(Math.random() * validOptions.length)];
      
      const otherOptions = this.dataLoader.findPicksWithSharedProperties(
        targetPick,
        this.options.optionsPerQuestion - 1
      ).filter(p => p.id !== selectedOption.id);

      const options = [selectedOption, ...otherOptions].slice(0, this.options.optionsPerQuestion);
      
      if (options.length < this.options.optionsPerQuestion) {
        continue;
      }
      
      this.shuffleArray(options);

      const propertyImage = this.dataLoader.getPropertyCategoryImage(property);
      this.currentQuestion = new Question(targetPick, options, property, propertyImage);
      
      return this.currentQuestion;
    }
    
    // If we couldn't find a question after max attempts, return null
    return null;
  }

  /**
   * Find properties that are common between target pick and other picks
   * @param {Pick} targetPick
   * @param {Pick[]} otherPicks
   * @returns {string[]}
   */
  findCommonProperties(targetPick, otherPicks) {
    const targetProperties = targetPick.getPropertyNames();
    const common = [];

    for (const prop of targetProperties) {
      if (otherPicks.some(pick => pick.hasProperty(prop))) {
        common.push(prop);
      }
    }

    return common;
  }

  /**
   * Shuffle array in place
   * @param {Array} array
   */
  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  /**
   * Submit an answer for the current question
   * @param {number} answerIndex
   * @returns {boolean} - Whether the answer was correct
   */
  submitAnswer(answerIndex) {
    if (!this.currentQuestion) {
      throw new Error('No current question');
    }

    const isCorrect = this.currentQuestion.checkAnswer(answerIndex);
    this.questionsAnswered++;

    if (isCorrect) {
      this.score++;
      this.currentTimeLimit = Math.max(this.minTime, this.currentTimeLimit - this.timeDecrement);
    }

    return isCorrect;
  }

  /**
   * Get the current question
   * @returns {Question|null}
   */
  getCurrentQuestion() {
    return this.currentQuestion;
  }

  /**
   * Get current score
   * @returns {number}
   */
  getScore() {
    return this.score;
  }

  /**
   * Get number of questions answered
   * @returns {number}
   */
  getQuestionsAnswered() {
    return this.questionsAnswered;
  }

  /**
   * Check if game has started
   * @returns {boolean}
   */
  isGameStarted() {
    return this.gameStarted;
  }



  /**
   * Get current time limit
   * @returns {number}
   */
  getCurrentTimeLimit() {
    return this.currentTimeLimit;
  }
}

module.exports = GameEngine;
