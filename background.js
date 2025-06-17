// Set up the alarm when extension is installed/updated
chrome.runtime.onInstalled.addListener(() => {
  // Load saved interval or use default (5 minutes)
  chrome.storage.sync.get(["quizInterval"], (result) => {
    const interval = result.quizInterval || 60;
    createAlarm(interval);
  });
});

// Update alarm when settings change
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (changes.quizInterval) {
    chrome.alarms.clear("kanjiQuizAlarm", () => {
      createAlarm(changes.quizInterval.newValue);
    });
  }
});

// Create the alarm
function createAlarm(intervalInMinutes) {
  chrome.alarms.create("kanjiQuizAlarm", {
    delayInMinutes: intervalInMinutes,
    periodInMinutes: intervalInMinutes,
  });
}

// When alarm triggers, show notification or update badge
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "kanjiQuizAlarm") {
    // Set badge text to indicate new quiz available
    chrome.action.setBadgeText({ text: "!" });
    chrome.action.setBadgeBackgroundColor({ color: "#FF0000" });

    // Show notification
    chrome.notifications.create("kanjiQuizNotification", {
      type: "basic",
      iconUrl: "icons/icon48.png",
      title: "Kanji Quiz Time!",
      message: "Click the extension icon to practice your kanji!",
      priority: 2,
    });
  }
});

// Clear badge when user opens the popup
chrome.action.onClicked.addListener(() => {
  chrome.action.setBadgeText({ text: "" });
});
