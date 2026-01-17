// Browser-compatible version of the game engine
// Import classes (in a real setup, you'd use a bundler like webpack or use ES modules)

class Pick {
  constructor(id, name, properties, image = null, propertyImages = {}) {
    this.id = id;
    this.name = name;
    this.properties = properties;
    this.image = image;
    this.propertyImages = propertyImages;
  }

  getPropertyNames() {
    return Object.keys(this.properties);
  }

  getPropertyValue(propertyName) {
    return this.properties[propertyName];
  }

  hasProperty(propertyName) {
    return propertyName in this.properties;
  }

  getPropertyImage(propertyName) {
    return this.propertyImages[propertyName] || null;
  }
}

class Question {
  constructor(targetPick, options, property, propertyImage = null) {
    this.targetPick = targetPick;
    this.options = options;
    this.property = property;
    this.propertyImage = propertyImage;
    this.correctAnswer = this.findCorrectAnswer();
  }

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

  checkAnswer(answerIndex) {
    return answerIndex === this.correctAnswer;
  }

  getQuestionText() {
    return `Which has more ${this.property} than ${this.targetPick.name}?`;
  }
}

class DataLoader {
  constructor() {
    this.picks = [];
    this.propertyCategories = {};
  }

  async load() {
    throw new Error('load() must be implemented by subclass');
  }

  getPicks() {
    return this.picks;
  }

  getRandomPick() {
    if (this.picks.length === 0) return null;
    const index = Math.floor(Math.random() * this.picks.length);
    return this.picks[index];
  }

  findPicksWithSharedProperties(pick, count = 3) {
    const propertyNames = pick.getPropertyNames();
    const candidates = this.picks.filter(p => {
      if (p.id === pick.id) return false;
      return propertyNames.some(prop => p.hasProperty(prop));
    });

    return this.getRandomSubset(candidates, count);
  }

  getRandomSubset(picks, count) {
    const shuffled = [...picks].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, shuffled.length));
  }

  getPropertyCategoryImage(propertyName) {
    return this.propertyCategories[propertyName]?.image || null;
  }
}

class JSONLoader extends DataLoader {
  constructor(source) {
    super();
    this.source = source;
  }

  async load() {
    let data;

    if (typeof this.source === 'string') {
      const response = await fetch(this.source);
      data = await response.json();
    } else {
      data = this.source;
    }

    this.parseData(data);
  }

  parseData(data) {
    if (data.propertyCategories) {
      this.propertyCategories = data.propertyCategories;
    }

    if (data.picks && Array.isArray(data.picks)) {
      this.picks = data.picks.map(pickData => {
        return new Pick(
          pickData.id,
          pickData.name,
          pickData.properties,
          pickData.image,
          pickData.propertyImages
        );
      });
    }
  }
}

class GameEngine {
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

  async initialize() {
    await this.dataLoader.load();
    if (this.dataLoader.getPicks().length === 0) {
      throw new Error('No picks loaded from data source');
    }
  }

  startGame() {
    this.score = 0;
    this.questionsAnswered = 0;
    this.gameStarted = true;
    this.currentTimeLimit = this.initialTime;
    this.generateNextQuestion();
  }

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
      ).filter(p => {
        // Ensure other options don't also have values greater than target
        if (p.id === selectedOption.id) return false;
        const value = p.getPropertyValue(property);
        return value === undefined || value <= targetPick.getPropertyValue(property);
      });

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

  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

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

  getCurrentQuestion() {
    return this.currentQuestion;
  }

  getScore() {
    return this.score;
  }

  getQuestionsAnswered() {
    return this.questionsAnswered;
  }

  isGameStarted() {
    return this.gameStarted;
  }

  getCurrentTimeLimit() {
    return this.currentTimeLimit;
  }

  getStreak() {
    return this.score;
  }

  getBestStreak() {
    const saved = localStorage.getItem('bestStreak');
    const best = saved ? parseInt(saved) : 0;
    if (this.score > best) {
      localStorage.setItem('bestStreak', this.score.toString());
      return this.score;
    }
    return best;
  }

  isGameOver() {
    return !this.gameStarted || this.score < this.questionsAnswered;
  }
}

// UI Controller
class GameUI {
  constructor(gameEngine) {
    this.gameEngine = gameEngine;
    this.TIMEOUT_ANSWER = -1;
    this.screens = {
      loading: document.getElementById('loading-screen'),
      start: document.getElementById('start-screen'),
      game: document.getElementById('game-screen'),
      result: document.getElementById('result-screen'),
      gameover: document.getElementById('gameover-screen')
    };
    
    this.elements = {
      score: document.getElementById('score'),
      bestScore: document.getElementById('best-score'),
      timer: document.getElementById('timer'),
      targetImage: document.getElementById('target-image'),
      targetName: document.getElementById('target-name'),
      question: document.getElementById('question'),
      propertyImage: document.getElementById('property-image'),
      options: document.getElementById('options'),
      resultTitle: document.getElementById('result-title'),
      resultMessage: document.getElementById('result-message'),
      finalScore: document.getElementById('final-score'),
      startButton: document.getElementById('start-button'),
      continueButton: document.getElementById('continue-button'),
      restartButton: document.getElementById('restart-button'),
      readyOverlay: document.getElementById('ready-overlay')
    };

    this.timerInterval = null;
    this.timeRemaining = 0;
    this.setupEventListeners();
  }

  setupEventListeners() {
    this.elements.startButton.addEventListener('click', () => this.startGame());
    this.elements.continueButton.addEventListener('click', () => this.continueGame());
    this.elements.restartButton.addEventListener('click', () => this.startGame());
  }

  showScreen(screenName) {
    this.clearTimer();
    Object.values(this.screens).forEach(screen => screen.classList.remove('active'));
    this.screens[screenName].classList.add('active');
  }

  async initialize() {
    this.showScreen('loading');
    try {
      await this.gameEngine.initialize();
      this.showScreen('start');
    } catch (error) {
      console.error('Failed to initialize game:', error);
      alert('Failed to load game data. Please refresh the page.');
    }
  }

  async startGame() {
    this.gameEngine.startGame();
    this.updateScore();
    this.showScreen('game');
    await this.showReadyAnimation();
    this.displayQuestion();
  }

  async showReadyAnimation() {
    const overlay = this.elements.readyOverlay;
    const words = ['READY...', 'SET...', 'GO!'];
    
    for (const word of words) {
      overlay.textContent = word;
      overlay.classList.add('active');
      await new Promise(resolve => setTimeout(resolve, 600));
      overlay.classList.remove('active');
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }

  async displayQuestion() {
    const question = this.gameEngine.getCurrentQuestion();
    if (!question) {
      alert('No more questions available!');
      return;
    }

    await this.showSlotMachineAnimation(question);
    this.startTimer();
  }

  async showSlotMachineAnimation(question) {
    const targetPick = question.targetPick;
    const allPicks = this.gameEngine.dataLoader.getPicks();
    const shuffleCount = 8;
    const shuffleDuration = 60;

    // Display options
    this.elements.options.innerHTML = '';
    question.options.forEach((option, index) => {
      const optionCard = document.createElement('div');
      optionCard.className = 'option-card';
      
      const optionImage = document.createElement('div');
      optionImage.className = 'option-image';
      
      const optionName = document.createElement('div');
      optionName.className = 'option-name pixel-text';

      const optionValue = document.createElement('div');
      optionValue.className = 'option-value pixel-text';
      
      optionCard.appendChild(optionImage);
      optionCard.appendChild(optionName);
      optionCard.appendChild(optionValue);
      
      optionCard.addEventListener('click', () => this.handleAnswer(index, optionCard));
      
      this.elements.options.appendChild(optionCard);
    });

    const optionCards = Array.from(this.elements.options.children);

    // Animate target pick
    for (let i = 0; i < shuffleCount; i++) {
      const randomPick = allPicks[Math.floor(Math.random() * allPicks.length)];
      this.elements.targetName.textContent = randomPick.name;
      if (randomPick.image) {
        this.elements.targetImage.innerHTML = `<img src="${randomPick.image}" alt="${randomPick.name}">`;
      } else {
        this.elements.targetImage.innerHTML = '👤';
      }
      await new Promise(resolve => setTimeout(resolve, shuffleDuration));
    }

    // Set final target
    this.elements.targetName.textContent = targetPick.name;
    if (targetPick.image) {
      this.elements.targetImage.innerHTML = `<img src="${targetPick.image}" alt="${targetPick.name}">`;
    } else {
      this.elements.targetImage.innerHTML = '👤';
    }

    // Display question text
    this.elements.question.textContent = question.getQuestionText();

    // Display property image if available
    if (question.propertyImage) {
      this.elements.propertyImage.innerHTML = `<img src="${question.propertyImage}" alt="${question.property}">`;
      this.elements.propertyImage.classList.add('visible');
    } else {
      this.elements.propertyImage.classList.remove('visible');
    }

    // Animate options
    for (let i = 0; i < shuffleCount; i++) {
      optionCards.forEach((card, index) => {
        const randomPick = allPicks[Math.floor(Math.random() * allPicks.length)];
        const optionImage = card.querySelector('.option-image');
        const optionName = card.querySelector('.option-name');
        const optionValue = card.querySelector('.option-value');

        optionName.textContent = randomPick.name;
        if (randomPick.image) {
          optionImage.innerHTML = `<img src="${randomPick.image}" alt="${randomPick.name}">`;
        } else {
          optionImage.textContent = '👤';
        }
        optionValue.textContent = `???`;
      });
      await new Promise(resolve => setTimeout(resolve, shuffleDuration));
    }

    // Set final options
    optionCards.forEach((card, index) => {
      const option = question.options[index];
      const optionImage = card.querySelector('.option-image');
      const optionName = card.querySelector('.option-name');
      const optionValue = card.querySelector('.option-value');

      optionName.textContent = option.name;
      if (option.image) {
        optionImage.innerHTML = `<img src="${option.image}" alt="${option.name}">`;
      } else {
        optionImage.textContent = '👤';
      }
      optionValue.textContent = `${question.property}: ${option.getPropertyValue(question.property)}`;
    });
  }

  startTimer() {
    this.clearTimer();
    this.timeRemaining = this.gameEngine.getCurrentTimeLimit();
    this.updateTimerDisplay();

    this.timerInterval = setInterval(() => {
      this.timeRemaining -= 0.1;
      if (this.timeRemaining <= 0) {
        this.timeRemaining = 0;
        this.clearTimer();
        this.handleTimeout();
      }
      this.updateTimerDisplay();
    }, 100);
  }

  clearTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    if (this.elements.timer) {
      this.elements.timer.classList.remove('low', 'critical');
    }
  }

  updateTimerDisplay() {
    if (!this.elements.timer) return;
    
    const display = Math.max(0, this.timeRemaining).toFixed(1);
    this.elements.timer.textContent = display + 's';

    this.elements.timer.classList.remove('low', 'critical');
    if (this.timeRemaining <= 2) {
      this.elements.timer.classList.add('critical');
    } else if (this.timeRemaining <= 4) {
      this.elements.timer.classList.add('low');
    }
  }

  handleTimeout() {
    const allOptions = document.querySelectorAll('.option-card');
    allOptions.forEach(card => {
      card.style.pointerEvents = 'none';
      card.classList.add('revealed');
    });

    const question = this.gameEngine.getCurrentQuestion();
    allOptions[question.correctAnswer].classList.add('correct');
    
    this.gameEngine.submitAnswer(this.TIMEOUT_ANSWER);
    this.updateScore();

    setTimeout(() => {
      this.showGameOver();
    }, 2000);
  }

  handleAnswer(answerIndex, optionCard) {
    this.clearTimer();
    
    const question = this.gameEngine.getCurrentQuestion();
    const isCorrect = this.gameEngine.submitAnswer(answerIndex);

    // Disable all option cards
    const allOptions = document.querySelectorAll('.option-card');
    allOptions.forEach(card => {
      card.style.pointerEvents = 'none';
      card.classList.add('revealed');
    });

    // Mark the selected answer
    if (isCorrect) {
      optionCard.classList.add('correct');
    } else {
      optionCard.classList.add('incorrect');
      // Highlight the correct answer
      allOptions[question.correctAnswer].classList.add('correct');
    }

    this.updateScore();

    // Show result screen after delay
    setTimeout(() => {
      if (this.gameEngine.isGameOver()) {
        this.showGameOver();
      } else {
        this.showResult(isCorrect);
      }
    }, 2000);
  }

  showResult(isCorrect) {
    this.elements.resultTitle.textContent = isCorrect ? 'CORRECT!' : 'WRONG!';
    this.elements.resultTitle.className = isCorrect ? 'pixel-text correct' : 'pixel-text incorrect';
    
    const question = this.gameEngine.getCurrentQuestion();
    const correctOption = question.options[question.correctAnswer];
    this.elements.resultMessage.textContent = 
      `${correctOption.name} has ${correctOption.getPropertyValue(question.property)} ${question.property}!\n` +
      `${question.targetPick.name} has ${question.targetPick.getPropertyValue(question.property)} ${question.property}.`;
    
    this.showScreen('result');
  }

  async continueGame() {
    this.gameEngine.generateNextQuestion();
    this.showScreen('game');
    await this.displayQuestion();
  }

  showGameOver() {
    const finalStreak = this.gameEngine.getStreak();
    const bestStreak = this.gameEngine.getBestStreak();
    
    this.elements.finalScore.textContent = 
      `You got ${finalStreak} correct guesses in a row!\n` +
      (bestStreak > finalStreak ? `Your best is ${bestStreak}!` : 'NEW BEST SCORE!');
    
    this.showScreen('gameover');
  }

  updateScore() {
    this.elements.score.textContent = this.gameEngine.getStreak();
    this.elements.bestScore.textContent = this.gameEngine.getBestStreak();
  }
}

// Initialize the game
document.addEventListener('DOMContentLoaded', async () => {
  const dataLoader = new JSONLoader('data/example-data.json');
  const gameEngine = new GameEngine(dataLoader);
  const gameUI = new GameUI(gameEngine);
  
  await gameUI.initialize();
});
