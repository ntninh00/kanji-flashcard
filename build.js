require('dotenv').config();
const fs = require('fs');
const path = require('path');

const templatePath = path.join(__dirname, 'script.template.js');
const outputPath = path.join(__dirname, 'script.js');

const template = fs.readFileSync(templatePath, 'utf8');

const env = {
    FIREBASE_API_KEY: process.env.FIREBASE_API_KEY,
    FIREBASE_AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN,
    FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
    FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET,
    FIREBASE_MESSAGING_SENDER_ID: process.env.FIREBASE_MESSAGING_SENDER_ID,
    FIREBASE_APP_ID: process.env.FIREBASE_APP_ID,
    FIREBASE_MEASUREMENT_ID: process.env.FIREBASE_MEASUREMENT_ID,
    FIREBASE_DATABASE_URL: process.env.FIREBASE_DATABASE_URL
};

const output = template.replace(/\${([^}]+)}/g, (match, key) => env[key] || '');

fs.writeFileSync(outputPath, output, 'utf8');
console.log('Built script.js with environment variables');