// Kanji data (we'll load from JSON file later)
let kanjiData = [];
let currentKanji = null;
let attemptsLeft = 3;
let quizInterval = null;

// DOM elements
const kanjiDisplay = document.getElementById("kanji-display");
const answerInput = document.getElementById("answer-input");
const submitBtn = document.getElementById("submit-btn");
const giveUpBtn = document.getElementById("give-up-btn");
const resultContainer = document.getElementById("result-container");
const intervalInput = document.getElementById("interval");
const saveSettingsBtn = document.getElementById("save-settings");

// Initialize the extension
document.addEventListener("DOMContentLoaded", async function () {
  // Load kanji data
  await loadKanjiData();

  // Load saved settings
  loadSettings();

  // Start the quiz
  showRandomKanji();

  // Set up event listeners
  submitBtn.addEventListener("click", checkAnswer);
  giveUpBtn.addEventListener("click", showExplanation);
  answerInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") checkAnswer();
  });
  saveSettingsBtn.addEventListener("click", saveSettings);
});

// Load kanji data from JSON file
async function loadKanjiData() {
  try {
    const response = await fetch(chrome.runtime.getURL("kanji-data.json"));
    kanjiData = await response.json();
  } catch (error) {
    console.error("Error loading kanji data:", error);
    // Fallback data if JSON fails to load
    kanjiData = [
      {
        kanji: "日",
        meanings: ["day", "sun", "Japan"],
        readings: {
          onyomi: ["ニチ", "ジツ"],
          kunyomi: ["ひ", "-び", "-か"],
        },
        examples: [
          { japanese: "日曜日", reading: "にちようび", english: "Sunday" },
          { japanese: "日本", reading: "にほん", english: "Japan" },
        ],
      },
      {
        kanji: "水",
        meanings: ["water"],
        readings: {
          onyomi: ["スイ"],
          kunyomi: ["みず"],
        },
        examples: [
          { japanese: "水曜日", reading: "すいようび", english: "Wednesday" },
          { japanese: "水", reading: "みず", english: "water" },
        ],
      },
    ];
  }
}

document
  .getElementById("view-progress")
  .addEventListener("click", toggleAllProgress);

document
  .getElementById("next-kanji-btn")
  .addEventListener("click", showRandomKanji);

async function updateKanjiStats() {
  const progress = await getProgressData();
  const statsElement = document.getElementById("kanji-stats");

  if (currentKanji && progress[currentKanji.kanji]) {
    const stats = progress[currentKanji.kanji];
    const percentage =
      stats.attempts > 0
        ? Math.round((stats.correct / stats.attempts) * 100)
        : 0;
    statsElement.textContent = `This kanji: ${stats.correct}/${stats.attempts} correct (${percentage}%)`;
  } else {
    statsElement.textContent = "New kanji!";
  }
}

async function toggleAllProgress() {
  const container = document.getElementById("all-progress");
  const button = document.getElementById("view-progress");

  if (container.style.display === "none") {
    const progress = await getProgressData();

    if (Object.keys(progress).length === 0) {
      container.innerHTML = "<p>No progress data yet. Keep practicing!</p>";
    } else {
      let html = "<h4>Your Progress</h4><table>";
      html +=
        "<tr><th>Kanji</th><th>Correct</th><th>Attempts</th><th>%</th></tr>";

      // Sort by percentage (descending)
      const sortedProgress = Object.entries(progress).sort((a, b) => {
        const percentA = (a[1].correct / a[1].attempts) * 100;
        const percentB = (b[1].correct / b[1].attempts) * 100;
        return percentB - percentA;
      });

      sortedProgress.forEach(([kanji, stats]) => {
        const percentage = Math.round((stats.correct / stats.attempts) * 100);
        html += `
          <tr>
            <td>${kanji}</td>
            <td>${stats.correct}</td>
            <td>${stats.attempts}</td>
            <td>${percentage}%</td>
          </tr>
        `;
      });

      html += "</table>";
      container.innerHTML = html;
    }

    container.style.display = "block";
    button.textContent = "Hide Progress";
  } else {
    container.style.display = "none";
    button.textContent = "View All Progress";
  }
}

// Load saved settings
function loadSettings() {
  chrome.storage.sync.get(["quizInterval"], function (result) {
    if (result.quizInterval) {
      intervalInput.value = result.quizInterval;
    }
  });
}

// Save settings
function saveSettings() {
  const interval = parseInt(intervalInput.value);
  if (interval >= 1) {
    chrome.storage.sync.set({ quizInterval: interval }, function () {
      alert("Settings saved!");
      // Restart the interval with new timing
      if (quizInterval) {
        clearInterval(quizInterval);
      }
      quizInterval = setInterval(showRandomKanji, interval * 60 * 1000);
    });
  } else {
    alert("Please enter a valid interval (at least 1 minute)");
  }
}

// Display a random kanji
function showRandomKanji() {
  if (kanjiData.length === 0) return;

  const randomIndex = Math.floor(Math.random() * kanjiData.length);
  currentKanji = kanjiData[randomIndex];
  attemptsLeft = 3;

  kanjiDisplay.textContent = currentKanji.kanji;
  answerInput.value = "";
  answerInput.style.display = "block";
  submitBtn.style.display = "inline-block";
  giveUpBtn.style.display = "inline-block";
  resultContainer.style.display = "block";
  document.getElementById("next-kanji-btn").style.display = "none";

  answerInput.focus();
  updateKanjiStats();
}

// Check the user's answer
function checkAnswer() {
  const userAnswer = answerInput.value.trim().toLowerCase();
  const correctAnswers = currentKanji.meanings.map((m) => m.toLowerCase());
  const isCorrect = correctAnswers.includes(userAnswer);

  trackProgress(currentKanji.kanji, isCorrect);

  if (isCorrect) {
    showResult(true);
  } else {
    attemptsLeft--;
    if (attemptsLeft > 0) {
      showResult(false, `Incorrect. ${attemptsLeft} attempt(s) left.`);
    } else {
      showExplanation();
    }
  }
}

// Track user progress
async function trackProgress(kanji, isCorrect) {
  const progress = await getProgressData();

  if (!progress[kanji]) {
    progress[kanji] = {
      attempts: 0,
      correct: 0,
      lastAttempt: new Date().toISOString(),
    };
  }

  progress[kanji].attempts++;

  if (isCorrect) {
    progress[kanji].correct++;
  }

  // Ensure we never have more correct than attempts
  if (progress[kanji].correct > progress[kanji].attempts) {
    progress[kanji].correct = progress[kanji].attempts;
  }

  progress[kanji].lastAttempt = new Date().toISOString();
  await saveProgressData(progress);
  updateKanjiStats();
}

async function getProgressData() {
  return new Promise((resolve) => {
    chrome.storage.local.get(["kanjiProgress"], (result) => {
      const progress = result.kanjiProgress || {};

      Object.keys(progress).forEach((kanji) => {
        if (
          !progress[kanji].attempts ||
          progress[kanji].attempts < progress[kanji].correct
        ) {
          progress[kanji].attempts = Math.max(
            progress[kanji].correct || 0,
            progress[kanji].attempts || 0
          );
        }
      });

      resolve(progress);
    });
  });
}

async function saveProgressData(progress) {
  return new Promise((resolve) => {
    chrome.storage.local.set({ kanjiProgress: progress }, () => {
      resolve();
    });
  });
}

// Show result feedback
function showResult(isCorrect, message = "") {
  resultContainer.style.display = "block";
  resultContainer.className = isCorrect ? "correct" : "incorrect";

  if (isCorrect) {
    resultContainer.innerHTML = "<strong>Correct!</strong>";
    setTimeout(showExplanation, 1000);
  } else {
    resultContainer.textContent = message || "Incorrect. Try again.";
  }
}

// Show the kanji explanation
function showExplanation() {
  answerInput.style.display = "none";
  submitBtn.style.display = "none";
  giveUpBtn.style.display = "none";

  resultContainer.style.display = "block";
  document.getElementById("next-kanji-btn").style.display = "block";

  let html = `<h4>${currentKanji.kanji}</h4>`;
  html += `<p><strong>Meanings:</strong> ${currentKanji.meanings.join(
    ", "
  )}</p>`;

  if (currentKanji.readings) {
    html += `<p><strong>Onyomi:</strong> ${currentKanji.readings.onyomi.join(
      ", "
    )}</p>`;
    html += `<p><strong>Kunyomi:</strong> ${currentKanji.readings.kunyomi.join(
      ", "
    )}</p>`;
  }

  if (currentKanji.examples && currentKanji.examples.length > 0) {
    html += "<h5>Examples:</h5><ul>";
    currentKanji.examples.forEach((example) => {
      html += `<li>${example.japanese} (${example.reading}): ${example.english}</li>`;
    });
    html += "</ul>";
  }

  resultContainer.innerHTML = html;

  // Schedule next kanji (if interval is set)
  const interval = parseInt(intervalInput.value) || 60;
  setTimeout(showRandomKanji, interval * 60 * 1000);
}

// Clear notification badge when popup opens
chrome.action.setBadgeText({ text: "" });

// Check if there's a pending quiz notification when popup opens
chrome.alarms.get("kanjiQuizAlarm", (alarm) => {
  if (alarm) {
    // You could add visual indication in the popup if desired
  }
});
