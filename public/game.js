// Browser-compatible version of the game engine
// Import classes (in a real setup, you'd use a bundler like webpack or use ES modules)

class Fact {
  constructor(description, category, quantity = null, image = null) {
    this.description = description;
    this.category = category;
    this.quantity = quantity;
    this.image = image;
  }
}

class Pick {
  constructor(id, name, facts = [], image = null, description = null) {
    this.id = id;
    this.name = name;
    this.facts = facts;
    this.image = image;
    this.description = description;
  }

  getFacts() {
    return this.facts;
  }

  hasFact(factDescription) {
    return this.facts.some(fact => fact.description === factDescription);
  }

  getFactQuantity(factDescription) {
    const fact = this.facts.find(f => f.description === factDescription);
    return fact ? (fact.quantity || 1) : 0;
  }

  addFact(fact) {
    if (!this.hasFact(fact.description)) {
      this.facts.push(fact);
    }
  }
}

class Question {
  constructor(fact, options, correctAnswerIndex) {
    this.fact = fact;
    this.options = options;
    this.correctAnswer = correctAnswerIndex;
  }

  checkAnswer(answerIndex) {
    return answerIndex === this.correctAnswer;
  }

  getQuestionText() {
    return `Who ${this.fact.description}?`;
  }
}

class DataLoader {
  constructor() {
    this.picks = [];
    this.facts = [];
  }

  async load() {
    throw new Error('load() must be implemented by subclass');
  }

  getPicks() {
    return this.picks;
  }

  getFacts() {
    return this.facts;
  }

  getRandomPick() {
    if (this.picks.length === 0) return null;
    const index = Math.floor(Math.random() * this.picks.length);
    return this.picks[index];
  }

  getRandomFact() {
    if (this.facts.length === 0) return null;
    const index = Math.floor(Math.random() * this.facts.length);
    return this.facts[index];
  }

  findPicksWithFact(factDescription) {
    return this.picks.filter(pick => pick.hasFact(factDescription));
  }

  findPicksWithoutFact(factDescription, count = 2) {
    const candidates = this.picks.filter(pick => !pick.hasFact(factDescription));
    return this.getRandomSubset(candidates, count);
  }

  getRandomSubset(picks, count) {
    const shuffled = [...picks].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, shuffled.length));
  }

  getFactByDescription(factDescription) {
    return this.facts.find(fact => fact.description === factDescription) || null;
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
    // Load picks with embedded facts
    if (data.picks && Array.isArray(data.picks)) {
      this.picks = data.picks.map(pickData => {
        // Parse facts for this pick
        const facts = (pickData.facts || []).map(factData => {
          return new Fact(
            factData.description,
            factData.category,
            factData.quantity,
            factData.image
          );
        });

        return new Pick(
          pickData.id,
          pickData.name,
          facts,
          pickData.image,
          pickData.description
        );
      });
    }

    // Build global facts list from all picks
    // Keep the fact with the highest quantity when duplicates exist
    const factMap = new Map();
    for (const pick of this.picks) {
      for (const fact of pick.getFacts()) {
        const key = fact.description;
        const existingFact = factMap.get(key);
        
        if (!existingFact) {
          factMap.set(key, fact);
        } else {
          // Keep the fact with the higher quantity
          const existingQty = existingFact.quantity || 0;
          const newQty = fact.quantity || 0;
          if (newQty > existingQty) {
            factMap.set(key, fact);
          }
        }
      }
    }
    this.facts = Array.from(factMap.values());
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
      
      // Pick a random fact
      const fact = this.dataLoader.getRandomFact();
      if (!fact) {
        continue;
      }

      // Find picks that have this fact
      const picksWithFact = this.dataLoader.findPicksWithFact(fact.description);
      if (picksWithFact.length === 0) {
        continue;
      }

      // Find the pick(s) with the highest quantity for this fact
      let maxQuantity = 0;
      let tiedPicks = [];
      
      for (const pick of picksWithFact) {
        const quantity = pick.getFactQuantity(fact.description);
        if (quantity > maxQuantity) {
          maxQuantity = quantity;
          tiedPicks = [pick];
        } else if (quantity === maxQuantity) {
          tiedPicks.push(pick);
        }
      }
      
      // Randomly select among tied picks
      const correctPick = tiedPicks[Math.floor(Math.random() * tiedPicks.length)];

      // Find picks that don't have this fact (incorrect options)
      const wrongPicks = this.dataLoader.findPicksWithoutFact(
        fact.description,
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
    const best = saved ? parseInt(saved, 10) : 0;
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
      categoryBadge: document.getElementById('category-badge'),
      factImage: document.getElementById('fact-image'),
      question: document.getElementById('question'),
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
    const allPicks = this.gameEngine.dataLoader.getPicks();
    const allFacts = this.gameEngine.dataLoader.getFacts();
    const shuffleCount = 8;
    const shuffleDuration = 60;

    // Display category badge
    if (this.elements.categoryBadge) {
      this.elements.categoryBadge.textContent = question.fact.category;
      this.elements.categoryBadge.classList.add('visible');
    }

    // Display fact image if available
    if (question.fact.image && this.elements.factImage) {
      this.elements.factImage.innerHTML = `<img src="${question.fact.image}" alt="${question.fact.category}">`;
      this.elements.factImage.classList.add('visible');
    } else if (this.elements.factImage) {
      this.elements.factImage.classList.remove('visible');
    }

    // Display options
    this.elements.options.innerHTML = '';
    question.options.forEach((option, index) => {
      const optionCard = document.createElement('div');
      optionCard.className = 'option-card';
      
      const optionImage = document.createElement('div');
      optionImage.className = 'option-image';
      
      const optionName = document.createElement('div');
      optionName.className = 'option-name pixel-text';
      
      optionCard.appendChild(optionImage);
      optionCard.appendChild(optionName);
      
      optionCard.addEventListener('click', () => this.handleAnswer(index, optionCard));
      
      this.elements.options.appendChild(optionCard);
    });

    const optionCards = Array.from(this.elements.options.children);

    // Animate question text with random facts
    for (let i = 0; i < shuffleCount; i++) {
      const randomFact = allFacts[Math.floor(Math.random() * allFacts.length)];
      this.elements.question.textContent = `Who ${randomFact.description}?`;
      await new Promise(resolve => setTimeout(resolve, shuffleDuration));
    }

    // Set final question text
    this.elements.question.textContent = question.getQuestionText();

    // Animate options
    for (let i = 0; i < shuffleCount; i++) {
      optionCards.forEach((card, index) => {
        const randomPick = allPicks[Math.floor(Math.random() * allPicks.length)];
        const optionImage = card.querySelector('.option-image');
        const optionName = card.querySelector('.option-name');

        optionName.textContent = randomPick.name;
        if (randomPick.image) {
          optionImage.innerHTML = `<img src="${randomPick.image}" alt="${randomPick.name}">`;
        } else {
          optionImage.textContent = '👤';
        }
      });
      await new Promise(resolve => setTimeout(resolve, shuffleDuration));
    }

    // Set final options
    optionCards.forEach((card, index) => {
      const option = question.options[index];
      const optionImage = card.querySelector('.option-image');
      const optionName = card.querySelector('.option-name');

      optionName.textContent = option.name;
      if (option.image) {
        optionImage.innerHTML = `<img src="${option.image}" alt="${option.name}">`;
      } else {
        optionImage.textContent = '👤';
      }
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
      `${correctOption.name} ${question.fact.description}!`;
    
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
