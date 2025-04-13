const board = document.getElementById('game-board');
const resetBtn = document.getElementById('reset-btn');
const timerDisplay = document.getElementById('timer');
const movesDisplay = document.getElementById('moves');

const easyPairs = ['🍕', '🎮', '🎧', '🚀', '🐱', '🎲', '🌈', '⚡'];
const hardPairs = ['🍕', '🎮', '🎧', '🚀', '🐱', '🎲', '🌈', '⚡', '🐶', '🍔', '🦄', '🪐', '🎵', '👾', '🍩', '🧃', '📱', '🧸'];

let cards = [];
let firstCard = null;
let secondCard = null;
let lockBoard = false;
let moves = 0;
let matchedPairs = 0;
let totalPairs = 0;
let timer;
let timeLeft = 0;
let difficulty = 'easy';

const flipSound = new Audio('sounds/flip.mp3');
const matchSound = new Audio('sounds/match.mp3');
const winSound = new Audio('sounds/win.mp3');
const loseSound = new Audio('sounds/lose.mp3');

// Preload sounds
flipSound.load();
matchSound.load();
winSound.load();
loseSound.load();

// Parse difficulty from URL
function getDifficultyFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get('difficulty') || 'easy';
}

// Timer logic
function startTimer() {
  timer = setInterval(() => {
    timeLeft--;
    timerDisplay.textContent = `⏱️ Time: ${timeLeft}s`;
    if (timeLeft <= 0) {
      clearInterval(timer);
      endGame(false);
    }
  }, 1000);
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function createCard(value) {
  const card = document.createElement('div');
  card.className = 'card h-24 w-20 sm:h-32 sm:w-24 cursor-pointer';
  card.dataset.value = value;

  card.innerHTML = `
    <div class="card-inner">
      <div class="card-back">❓</div>
      <div class="card-front">${value}</div>
    </div>
  `;

  card.addEventListener('click', handleCardClick);
  return card;
}

function handleCardClick(e) {
  if (lockBoard) return;
  const clicked = e.currentTarget;
  if (clicked === firstCard || clicked.classList.contains('flipped')) return;

  console.log("Playing flip sound");  // Debugging log
  flipSound.play();
  clicked.classList.add('flipped');

  if (!firstCard) {
    firstCard = clicked;
    return;
  }

  secondCard = clicked;
  moves++;
  movesDisplay.textContent = `🎯 Moves: ${moves}`;
  checkForMatch();
}

function checkForMatch() {
  const isMatch = firstCard.dataset.value === secondCard.dataset.value;

  if (isMatch) {
    matchSound.play();
    disableCards();
    matchedPairs++;
    if (matchedPairs === totalPairs) {
      clearInterval(timer);
      setTimeout(() => endGame(true), 500);
    }
  } else {
    unflipCards();
  }
}

function disableCards() {
  firstCard.removeEventListener('click', handleCardClick);
  secondCard.removeEventListener('click', handleCardClick);
  resetSelection();
}

function unflipCards() {
  lockBoard = true;
  setTimeout(() => {
    firstCard.classList.remove('flipped');
    secondCard.classList.remove('flipped');
    resetSelection();
  }, 800);
}

function resetSelection() {
  [firstCard, secondCard, lockBoard] = [null, null, false];
}

function initGame() {
  difficulty = getDifficultyFromURL();
  cards = difficulty === 'easy' ? [...easyPairs, ...easyPairs] : [...hardPairs, ...hardPairs];
  totalPairs = cards.length / 2;
  
  // Set time based on difficulty
  timeLeft = difficulty === 'easy' ? 40 : difficulty === 'medium' ? 60 : 120;

  moves = 0;
  matchedPairs = 0;

  board.className = difficulty === 'easy'
    ? 'grid grid-cols-4 gap-4 max-w-[600px]'
    : difficulty === 'medium'
    ? 'grid grid-cols-5 gap-4 max-w-[640px]'
    : 'grid grid-cols-6 gap-3 max-w-[720px]'; // Adjust grid for harder levels

  timerDisplay.textContent = `⏱️ Time: ${timeLeft}s`;
  movesDisplay.textContent = `🎯 Moves: 0`;

  board.innerHTML = '';
  shuffle(cards).forEach(value => {
    const card = createCard(value);
    board.appendChild(card);
  });

  clearInterval(timer);
  startTimer();
}

function endGame(won) {
  // if (won) winSound.play();
  // else loseSound.play();

  const result = won ? 'win' : 'lose';
  window.location.href = `result.html?result=${result}&time=${difficulty === 'easy' ? 40 - timeLeft : 80 - timeLeft}&moves=${moves}`;
}

resetBtn.addEventListener('click', initGame);
window.addEventListener('load', initGame);
