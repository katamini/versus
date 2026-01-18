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
    
    // Timer-related configuration with defaults
    const {
      initialTime = 10,
      minTime = 3,
      timeDecrement = 0.5,
      optionsPerQuestion = 3,
      ...otherOptions
    } = options;
    
    this.options = {
      optionsPerQuestion,
      initialTime,
      minTime,
      timeDecrement,
      ...otherOptions
    };
    
    this.score = 0;
    this.questionsAnswered = 0;
    this.currentQuestion = null;
    this.gameStarted = false;
    this.initialTime = initialTime;
    this.minTime = minTime;
    this.timeDecrement = timeDecrement;
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
   * Picks a random fact and creates options with one correct pick (that has the fact)
   * and other unrelated picks (that don't have the fact)
   * @returns {Question|null}
   */
  generateNextQuestion() {
    // Keep trying until we find a valid question (slot machine behavior)
    let attempts = 0;
    const maxAttempts = 100;
    
    while (attempts < maxAttempts) {
      attempts++;
      
      // Pick a random fact
      const fact = this.dataLoader.getRandomFact();
      if (!fact) {
        continue;
      }

      // Find picks that have this fact
      const picksWithFact = this.dataLoader.findPicksWithFact(fact.id);
      if (picksWithFact.length === 0) {
        continue;
      }

      // Pick a random pick that has the fact (correct answer)
      const correctPick = picksWithFact[Math.floor(Math.random() * picksWithFact.length)];

      // Find picks that don't have this fact (incorrect options)
      const wrongPicks = this.dataLoader.findPicksWithoutFact(
        fact.id,
        this.options.optionsPerQuestion - 1
      );

      if (wrongPicks.length < this.options.optionsPerQuestion - 1) {
        continue;
      }

      // Combine correct and wrong picks
      const options = [correctPick, ...wrongPicks];
      
      // Shuffle options
      this.shuffleArray(options);
      
      // Find the index of the correct answer
      const correctAnswerIndex = options.findIndex(pick => pick.id === correctPick.id);

      this.currentQuestion = new Question(fact, options, correctAnswerIndex);
      
      return this.currentQuestion;
    }
    
    // If we couldn't find a question after max attempts, return null
    return null;
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
