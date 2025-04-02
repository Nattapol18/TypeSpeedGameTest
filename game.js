// define the time limit
let TIME_LIMIT = 60;

// define quotes to be used
let quotes_array = [
  "I told my wife she should embrace her mistakes... She gave me a hug.",
  "Why don't skeletons fight each other? They don't have the guts.",
  "I'm reading a book about anti-gravity… It's impossible to put down!",
  "Why did the scarecrow win an award? Because he was outstanding in his field!",
  "I asked the librarian if the library had any books on paranoia… She whispered, 'They're right behind you…'",
  "I told my computer I needed a break… Now it won't stop sending me vacation ads!",
  "I'm on a whiskey diet. I've lost three days already!",
  "Why did the coffee file a police report? It got mugged!",
  "Life's too short to be serious all the time… So if you can't laugh at yourself, call me—I'll do it for you!",
  "Some people graduate with honors, I am just honored to graduate."
];

// difficulty levels with corresponding time limits
const DIFFICULTY_LEVELS = {
  easy: 60,
  medium: 45,
  hard: 30
};

// selecting required elements
let timer_text = document.querySelector(".curr_time");
let accuracy_text = document.querySelector(".curr_accuracy");
let error_text = document.querySelector(".curr_errors");
let cpm_text = document.querySelector(".curr_cpm");
let wpm_text = document.querySelector(".curr_wpm");
let quote_text = document.querySelector(".quote");
let input_area = document.querySelector(".input_area");
let restart_btn = document.querySelector(".restart_btn");
let cpm_group = document.querySelector(".cpm");
let wpm_group = document.querySelector(".wpm");
let error_group = document.querySelector(".errors");
let accuracy_group = document.querySelector(".accuracy");
let difficulty_btns = document.querySelectorAll(".difficulty_btn");
let progress_bar = document.querySelector(".progress-bar");
let timer_bar = document.querySelector(".timer-bar");
let highest_wpm = document.querySelector(".highest_wpm");
let challenge_text = document.querySelector(".challenge_text");
let sound_toggle = document.querySelector(".sound-toggle");

let timeLeft = TIME_LIMIT;
let timeElapsed = 0;
let total_errors = 0;
let errors = 0;
let accuracy = 0;
let characterTyped = 0;
let current_quote = "";
let quoteNo = 0;
let timer = null;
let highest_wpm_value = localStorage.getItem("highest_wpm") || 0;
let soundEnabled = localStorage.getItem("soundEnabled") === "true" || true;
let currentDifficulty = localStorage.getItem("difficulty") || "easy";

// Sound effects
const keySounds = [
  new Audio('https://assets.mixkit.co/active_storage/sfx/2874/2874-preview.mp3'),
  new Audio('https://assets.mixkit.co/active_storage/sfx/2875/2875-preview.mp3')
];
const successSound = new Audio('https://assets.mixkit.co/active_storage/sfx/255/255-preview.mp3');
const errorSound = new Audio('https://assets.mixkit.co/active_storage/sfx/253/253-preview.mp3');
const gameOverSound = new Audio('https://assets.mixkit.co/active_storage/sfx/254/254-preview.mp3');

// Initialize the UI
function initializeUI() {
  // Set highest WPM display
  highest_wpm.textContent = highest_wpm_value;
  
  // Set sound toggle button state
  updateSoundToggleButton();
  
  // Set difficulty buttons state
  difficulty_btns.forEach(btn => {
    btn.classList.remove("active");
    if (btn.dataset.difficulty === currentDifficulty) {
      btn.classList.add("active");
    }
  });
  
  // Set time limit based on difficulty
  TIME_LIMIT = DIFFICULTY_LEVELS[currentDifficulty];
  
  resetValues();
}

function toggleSound() {
  soundEnabled = !soundEnabled;
  localStorage.setItem("soundEnabled", soundEnabled.toString());
  updateSoundToggleButton();
}

function updateSoundToggleButton() {
  sound_toggle.innerHTML = soundEnabled ? 
    '<i class="fas fa-volume-up"></i>' : 
    '<i class="fas fa-volume-mute"></i>';
}

function playSound(sound) {
  if (soundEnabled) {
    // Create a clone to allow overlapping sounds
    const soundClone = sound.cloneNode();
    soundClone.volume = 0.5;
    soundClone.play();
  }
}

function playRandomKeySound() {
  if (soundEnabled) {
    const randomSound = keySounds[Math.floor(Math.random() * keySounds.length)];
    randomSound.volume = 0.2;
    randomSound.play();
  }
}

function updateQuote() {
  quote_text.textContent = null;
  current_quote = quotes_array[quoteNo];

  // separate each character and make an element 
  // out of each of them to individually style them
  current_quote.split('').forEach(char => {
    const charSpan = document.createElement('span');
    charSpan.innerText = char;
    quote_text.appendChild(charSpan);
  });

  // roll over to the first quote
  if (quoteNo < quotes_array.length - 1)
    quoteNo++;
  else
    quoteNo = 0;
}

function processCurrentText() {
  // get current input text and split it
  curr_input = input_area.value;
  curr_input_array = curr_input.split('');

  // increment total characters typed
  characterTyped++;
  playRandomKeySound();

  errors = 0;

  quoteSpanArray = quote_text.querySelectorAll('span');
  quoteSpanArray.forEach((char, index) => {
    let typedChar = curr_input_array[index];

    // character not currently typed
    if (typedChar == null) {
      char.classList.remove('correct_char');
      char.classList.remove('incorrect_char');

      // correct character
    } else if (typedChar === char.innerText) {
      char.classList.add('correct_char');
      char.classList.remove('incorrect_char');

      // incorrect character
    } else {
      char.classList.add('incorrect_char');
      char.classList.remove('correct_char');

      // increment number of errors
      errors++;
    }
  });

  // display the number of errors
  error_text.textContent = total_errors + errors;

  // update accuracy text
  let correctCharacters = (characterTyped - (total_errors + errors));
  let accuracyVal = ((correctCharacters / characterTyped) * 100);
  accuracy_text.textContent = Math.round(accuracyVal);

  // Update progress bar
  updateProgressBar(curr_input.length, current_quote.length);

  // if current text is completely typed
  // irrespective of errors
  if (curr_input.length == current_quote.length) {
    if (errors === 0) {
      playSound(successSound);
    } else {
      playSound(errorSound);
    }
    updateQuote();

    // update total errors
    total_errors += errors;

    // clear the input area
    input_area.value = "";
  }
}

function updateProgressBar(currentLength, totalLength) {
  const percentage = (currentLength / totalLength) * 100;
  progress_bar.style.width = `${percentage}%`;
  
  if (percentage < 30) {
    progress_bar.className = "progress-bar bg-danger";
  } else if (percentage < 70) {
    progress_bar.className = "progress-bar bg-warning";
  } else {
    progress_bar.className = "progress-bar bg-success";
  }
}

function updateTimerBar() {
  const percentage = (timeLeft / TIME_LIMIT) * 100;
  timer_bar.style.width = `${percentage}%`;
  
  if (percentage < 30) {
    timer_bar.className = "progress-bar bg-danger";
  } else if (percentage < 70) {
    timer_bar.className = "progress-bar bg-warning";
  } else {
    timer_bar.className = "progress-bar bg-success";
  }
}

function setDifficulty(level) {
  currentDifficulty = level;
  localStorage.setItem("difficulty", level);
  TIME_LIMIT = DIFFICULTY_LEVELS[level];
  
  // Update active button
  difficulty_btns.forEach(btn => {
    btn.classList.remove("active");
    if (btn.dataset.difficulty === level) {
      btn.classList.add("active");
    }
  });
  
  // Reset the game
  resetValues();
  updateChallengeBanner();
}

function updateChallengeBanner() {
  let challenge = "";
  switch(currentDifficulty) {
    case "easy":
      challenge = "Beginner's Pace - Aim for 30+ WPM";
      break;
    case "medium":
      challenge = "Intermediate Challenge - Aim for 50+ WPM";
      break;
    case "hard":
      challenge = "Expert Test - Can you reach 70+ WPM?";
      break;
  }
  challenge_text.textContent = challenge;
}

function startGame() {
  resetValues();
  updateQuote();

  // clear old and start a new timer
  clearInterval(timer);
  timer = setInterval(updateTimer, 1000);
  
  updateChallengeBanner();
}

function resetValues() {
  timeLeft = TIME_LIMIT;
  timeElapsed = 0;
  errors = 0;
  total_errors = 0;
  accuracy = 0;
  characterTyped = 0;
  quoteNo = 0;
  input_area.disabled = false;

  input_area.value = "";
  quote_text.textContent = 'Click on the area below to start the game.';
  accuracy_text.textContent = 100;
  timer_text.textContent = timeLeft + 's';
  error_text.textContent = 0;
  restart_btn.style.display = "none";
  cpm_group.style.display = "none";
  wpm_group.style.display = "none";
  
  // Reset progress bars
  progress_bar.style.width = "0%";
  progress_bar.className = "progress-bar bg-success";
  timer_bar.style.width = "100%";
  timer_bar.className = "progress-bar bg-success";
}

function updateTimer() {
  if (timeLeft > 0) {
    // decrease the current time left
    timeLeft--;

    // increase the time elapsed
    timeElapsed++;

    // update the timer text
    timer_text.textContent = timeLeft + "s";
    
    // Update timer bar
    updateTimerBar();
  }
  else {
    // finish the game
    finishGame();
  }
}

function finishGame() {
  // stop the timer
  clearInterval(timer);

  // disable the input area
  input_area.disabled = true;

  // show finishing text
  quote_text.textContent = "Click on restart to start a new game.";

  // display restart button
  restart_btn.style.display = "block";

  // calculate cpm and wpm
  cpm = Math.round(((characterTyped / timeElapsed) * 60));
  wpm = Math.round((((characterTyped / 5) / timeElapsed) * 60));

  // update cpm and wpm text
  cpm_text.textContent = cpm;
  wpm_text.textContent = wpm;

  // display the cpm and wpm
  cpm_group.style.display = "block";
  wpm_group.style.display = "block";
  
  // Update highest WPM if needed
  if (wpm > highest_wpm_value) {
    highest_wpm_value = wpm;
    highest_wpm.textContent = highest_wpm_value;
    localStorage.setItem("highest_wpm", highest_wpm_value);
    
    // Show achievement banner
    showAchievement("New Record! 🏆");
  }
  
  // Play game over sound
  playSound(gameOverSound);
  
  // Save results for history
  saveResult(wpm, cpm, accuracy);
}

function showAchievement(message) {
  const achievementDiv = document.createElement("div");
  achievementDiv.className = "achievement";
  achievementDiv.textContent = message;
  document.body.appendChild(achievementDiv);
  
  setTimeout(() => {
    achievementDiv.classList.add("show");
  }, 100);
  
  setTimeout(() => {
    achievementDiv.classList.remove("show");
    setTimeout(() => {
      document.body.removeChild(achievementDiv);
    }, 500);
  }, 3000);
}

function saveResult(wpm, cpm, accuracy) {
  // Get existing results or initialize empty array
  let results = JSON.parse(localStorage.getItem("typingResults")) || [];
  
  // Add new result
  results.push({
    date: new Date().toISOString(),
    wpm: wpm,
    cpm: cpm,
    accuracy: parseInt(accuracy_text.textContent),
    difficulty: currentDifficulty
  });
  
  // Keep only last 10 results
  if (results.length > 10) {
    results = results.slice(results.length - 10);
  }
  
  // Save back to local storage
  localStorage.setItem("typingResults", JSON.stringify(results));
}

function viewHistory() {
  const results = JSON.parse(localStorage.getItem("typingResults")) || [];
  
  const historyModal = document.getElementById("historyModal");
  const historyBody = document.querySelector(".history-content");
  
  historyBody.innerHTML = "";
  
  if (results.length === 0) {
    historyBody.innerHTML = "<p>No history available yet.</p>";
  } else {
    const table = document.createElement("table");
    table.className = "table table-dark table-striped";
    
    // Create header
    const thead = document.createElement("thead");
    thead.innerHTML = `
      <tr>
        <th>Date</th>
        <th>WPM</th>
        <th>CPM</th>
        <th>Accuracy</th>
        <th>Difficulty</th>
      </tr>
    `;
    table.appendChild(thead);
    
    // Create body
    const tbody = document.createElement("tbody");
    results.forEach(result => {
      const tr = document.createElement("tr");
      const date = new Date(result.date);
      tr.innerHTML = `
        <td>${date.toLocaleDateString()} ${date.toLocaleTimeString()}</td>
        <td>${result.wpm}</td>
        <td>${result.cpm}</td>
        <td>${result.accuracy}%</td>
        <td class="text-capitalize">${result.difficulty}</td>
      `;
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    
    historyBody.appendChild(table);
  }
  
  // Show modal
  const modal = new bootstrap.Modal(historyModal);
  modal.show();
}

// Initialize when page loads
document.addEventListener("DOMContentLoaded", initializeUI);