# Japanese Kanji Quiz - Chrome Extension
## Overview

The Japanese Kanji Quiz is a Chrome extension designed to help users learn and practice Japanese kanji characters and vocabulary through interactive quizzes. The extension displays kanji characters at regular intervals and tests your knowledge of their meanings.
## Key Features
### 1. Interactive Kanji Quizzing

    Displays random kanji characters from a comprehensive library

    Provides an input field to test your knowledge of the kanji's meaning

    Gives immediate feedback on your answers

    Offers multiple attempts for incorrect answers

### 2. Smart Progress Tracking

    Records your performance for each kanji

    Calculates your success rate percentage

    Displays detailed statistics about your learning progress

    Shows which kanji you've mastered and which need more practice

### 3. Customizable Learning Experience

    Adjustable quiz interval (1 minute to several hours)

    Three attempts per kanji before revealing the answer

    Detailed explanations after each answer

    Example words and readings for context

### 4. Comprehensive Kanji Database

    Includes fundamental kanji (N5/N4 level)

    Multiple meanings for each character

    On'yomi and kun'yomi readings

    Example compounds with translations

## How It Works

### Installation:

        Add the extension to Chrome through the Chrome Web Store

        The icon will appear in your browser toolbar

### Daily Use:

        Click the extension icon to start a quiz session

        A random kanji appears with an input field

        Type the English meaning and submit your answer

        Get immediate feedback and detailed explanations

### Automatic Reminders:

        The extension can notify you when it's time to practice

        Badge indicator shows when new quizzes are available

### Progress Tracking:

        View your stats for each kanji

        See which characters need more practice

        Monitor your overall improvement

## Technical Details
### Data Structure

The extension uses a JSON database containing:

    Kanji character

    English meanings

    On'yomi and kun'yomi readings

    Example words with readings and translations

### Storage

    Your progress is saved locally using chrome.storage

    Settings are synchronized across devices (if logged into Chrome)

### Compatibility

    Works on all Chromium-based browsers (Chrome, Edge, Brave)

    Firefox version available with minor adjustments

### Installation

    Download the extension files

    Go to chrome://extensions in your browser

    Enable "Developer mode" (toggle in top right)

    Click "Load unpacked" and select the extension folder

## Technical Architecture

### Core Files Structure
<pre>
kanji-quiz/
│
├── <b>manifest.json</b> - Extension configuration and permissions
│
├── <b>popup/</b> - Main user interface
│   ├── popup.html - Quiz HTML structure
│   ├── popup.css - Styling for the quiz
│   └── popup.js - Quiz logic and interactions
│
├── <b>background/</b> - Background processes
│   └── background.js - Alarm scheduling and notifications
│
├── <b>assets/</b> - Resource files
│   ├── kanji-data.json - Kanji database
│   └── icons/ - Extension icons
│       ├── icon16.png
│       ├── icon48.png
│       └── icon128.png
│
└── <b>README.md</b> - Project documentation
</pre>

### Key Components Breakdown

1. **manifest.json**
   - Declares extension permissions (storage, alarms, notifications)
   - Specifies action popup and background service worker
   - Defines icon sets for different display contexts
   - Uses Manifest V3 for modern Chrome compatibility

2. **popup.html**
   - Contains the complete quiz interface with:
     - Kanji display area
     - Answer input field
     - Progress tracking section
     - Settings controls
   - Semantic HTML5 structure for accessibility
   - Responsive container for various window sizes

3. **popup.css**
   - Mobile-first responsive design
   - Animated transitions for correct/incorrect feedback
   - Accessible color contrast ratios
   - Print-friendly styles for study sheets

4. **popup.js**
   - Manages all quiz interactions:
     - Random kanji selection algorithm
     - Answer validation logic
     - Attempt counting system
     - Progress tracking functions
   - Handles Chrome storage operations
   - Implements settings synchronization

5. **background.js**
   - Scheduled quiz reminders using chrome.alarms
   - Badge notification system
   - Cross-window event coordination
   - Error handling for inactive tabs

6. **kanji-data.json**
   - Curated collection of 70+ essential kanji
   - Each entry includes:
     - Multiple English meanings
     - On'yomi and kun'yomi readings
     - Example compounds with translations
     - JLPT level classification
     - Stroke count information