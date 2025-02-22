require('dotenv').config();
const fs = require('fs');
const path = require('path');

const templatePath = path.join(__dirname, 'script.template.js');
const outputPath = path.join(__dirname, 'script.js');

// Ensure dist directory exists
const distPath = path.join(__dirname, 'dist');
if (!fs.existsSync(distPath)) {
    fs.mkdirSync(distPath);
}

const template = fs.readFileSync(templatePath, 'utf8');

const env = {
    FIREBASE_API_KEY: process.env.FIREBASE_API_KEY || 'YOUR_DEFAULT_KEY',
    FIREBASE_AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN || 'kanji-flashcard.firebaseapp.com',
    FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID || 'kanji-flashcard',
    FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET || 'kanji-flashcard.firebasestorage.app',
    FIREBASE_MESSAGING_SENDER_ID: process.env.FIREBASE_MESSAGING_SENDER_ID || '158390700713',
    FIREBASE_APP_ID: process.env.FIREBASE_APP_ID || '1:158390700713:web:e255acedd26a26d3c177b8',
    FIREBASE_MEASUREMENT_ID: process.env.FIREBASE_MEASUREMENT_ID || 'G-MRE2WC4Y7Q',
    FIREBASE_DATABASE_URL: process.env.FIREBASE_DATABASE_URL || 'https://kanji-flashcard-default-rtdb.asia-southeast1.firebasedatabase.app/'
};

const output = template.replace(/%%([^%]+)%%/g, (match, key) => env[key] || '');

fs.writeFileSync(outputPath, output, 'utf8');
console.log('Built script.js with environment variables');

// Copy files to dist/
fs.copyFileSync(path.join(__dirname, 'index.html'), path.join(distPath, 'index.html'));
fs.copyFileSync(path.join(__dirname, 'styles.css'), path.join(distPath, 'styles.css'));
fs.copyFileSync(path.join(__dirname, 'predefined-kanji-sets.json'), path.join(distPath, 'predefined-kanji-sets.json'));
fs.copyFileSync(outputPath, path.join(distPath, 'script.js'));
console.log('Copied files to dist/');