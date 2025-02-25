# Kanji Flashcard

A web-based flashcard application for learning Japanese kanji, featuring user authentication, progress tracking, and sample sentence integration from Tatoeba.org and Linguee.com.

## Live Site
- Visit the live application at [kanji-flashcard.netlify.app](https://kanji-flashcard.netlify.app/)

## Features
- **User Authentication:** Secure login/signup.
- **Kanji Learning:** Flashcards for kanji with readings, meanings, and example sentences.
- **Progress Tracking:** Save and manage progress (e.g., "No Idea," "Seen but No Idea," "Remembered").
- **Sample Sentences:** Fetch Japanese-English examples from Tatoeba.org and Linguee.com.
- **Dark Mode:** Toggleable dark mode for better readability.

## Technologies
- **Frontend:** HTML5, CSS3, JavaScript
- **Backend/Data:** Netlify Functions (Node.js), Firebase (Authentication, Realtime Database), Axios, Cheerio
- **Deployment:** Netlify, GitHub

## Getting Started
1. Clone this repository: `git clone <repository-url>`
2. Install dependencies: `npm install`
3. Update `predefined-kanji-sets.json` with your own data.
4. Set up Firebase: Update `firebaseConfig` in `script.js` with your Firebase project credentials.
5. Run locally: `netlify dev`
6. Deploy to Netlify for live hosting.

## License
[MIT](LICENSE)

---
