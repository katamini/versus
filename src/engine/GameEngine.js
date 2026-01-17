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
    this.streak = 0;
    this.bestStreak = 0;
    this.gameOver = false;
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
    this.streak = 0;
    this.gameOver = false;
    this.gameStarted = true;
    this.generateNextQuestion();
  }

  /**
   * Generate the next question
   * @returns {Question|null}
   */
  generateNextQuestion() {
    const targetPick = this.dataLoader.getRandomPick();
    if (!targetPick) {
      return null;
    }

    const sharedPropertyPicks = this.dataLoader.findPicksWithSharedProperties(
      targetPick,
      this.options.optionsPerQuestion
    );

    if (sharedPropertyPicks.length === 0) {
      return this.generateNextQuestion();
    }

    const commonProperties = this.findCommonProperties(targetPick, sharedPropertyPicks);
    if (commonProperties.length === 0) {
      return this.generateNextQuestion();
    }

    const property = commonProperties[Math.floor(Math.random() * commonProperties.length)];
    
    const validOptions = sharedPropertyPicks.filter(pick => {
      const value = pick.getPropertyValue(property);
      return value !== undefined && value > targetPick.getPropertyValue(property);
    });

    if (validOptions.length === 0) {
      return this.generateNextQuestion();
    }

    const selectedOption = validOptions[Math.floor(Math.random() * validOptions.length)];
    
    const otherOptions = this.dataLoader.findPicksWithSharedProperties(
      targetPick,
      this.options.optionsPerQuestion - 1
    ).filter(p => p.id !== selectedOption.id);

    const options = [selectedOption, ...otherOptions].slice(0, this.options.optionsPerQuestion);
    this.shuffleArray(options);

    const propertyImage = this.dataLoader.getPropertyCategoryImage(property);
    this.currentQuestion = new Question(targetPick, options, property, propertyImage);
    
    return this.currentQuestion;
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
      this.streak++;
      if (this.streak > this.bestStreak) {
        this.bestStreak = this.streak;
      }
    } else {
      this.gameOver = true;
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
   * Get current streak
   * @returns {number}
   */
  getStreak() {
    return this.streak;
  }

  /**
   * Get best streak
   * @returns {number}
   */
  getBestStreak() {
    return this.bestStreak;
  }

  /**
   * Check if game is over
   * @returns {boolean}
   */
  isGameOver() {
    return this.gameOver;
  }
}

module.exports = GameEngine;
