import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut, sendPasswordResetEmail } from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js';
import { getDatabase, ref, set, onValue } from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-database.js';
// ignore this LMAO
export const firebaseConfig = {
    apiKey: "AIzaSyAotuyVf5GV2f-w2_9nR3VsJ_LHbtX4xsM",
    authDomain: "kanji-flashcard.firebaseapp.com",
    projectId: "kanji-flashcard",
    storageBucket: "kanji-flashcard.firebasestorage.app",
    messagingSenderId: "158390700713",
    appId: "1:158390700713:web:e255acedd26a26d3c177b8",
    measurementId: "G-MRE2WC4Y7Q",
    databaseURL: "https://kanji-flashcard-default-rtdb.asia-southeast1.firebasedatabase.app/"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);
let kanjiList = [];
let currentKanji = null;
let noIdeaList = [];
let seenButNoIdeaList = [];
let rememberedList = [];
let currentSetTitle = 'please choose a kanji set below or add your own to start studying';
let savedSets = {};
let predefinedSets = {};
let currentReviewKanji = null; // Track the Kanji being reviewed
let markedKanji = null;
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const loginModal = document.getElementById('login-modal');
const signupModal = document.getElementById('signup-modal');
const closeLogin = document.getElementById('close-login');
const closeSignup = document.getElementById('close-signup');
const showSignup = document.getElementById('show-signup');
const showLogin = document.getElementById('show-login');
const authTrigger = document.getElementById('auth-trigger');
const userArea = document.getElementById('user-area'); // Ensure this is correctly defined
const userGreeting = document.getElementById('user-greeting');
const logoutBtn = document.getElementById('logout-btn');
const kanjiDisplay = document.getElementById('kanji');
const readingDisplay = document.getElementById('reading');
const meaningDisplay = document.getElementById('meaning');
const exampleDisplay = document.getElementById('example');
const noIdeaButton = document.getElementById('no-idea');
const seenButNoIdeaButton = document.getElementById('seen-but-no-idea');
const rememberedButton = document.getElementById('remembered');
const nextButton = document.getElementById('next');
const kanjiInput = document.getElementById('kanji-input');
const setTitleDisplay = document.getElementById('current-set-title');
const setTitleInput = document.getElementById('set-name');
const submitCustomButton = document.getElementById('submit-custom');
const kanjiSetSelects = document.querySelectorAll('.kanji-set-select');
const submitPredefinedButtons = document.querySelectorAll('.submit-predefined');
const savedSetsList = document.getElementById('saved-sets-list');
const readingMeaningDiv = document.getElementById('reading-meaning');
const noIdeaCountDisplay = document.getElementById('no-idea-count');
const seenButNoIdeaCountDisplay = document.getElementById('seen-but-no-idea-count');
const rememberedCountDisplay = document.getElementById('remembered-count');
const progressBar = document.getElementById('progress-bar');
const progressText = document.getElementById('progress-text');
const spoilerButtons = document.querySelectorAll('.spoiler-button');
const darkModeToggle = document.getElementById('dark-mode');
const resetProgressButton = document.getElementById('reset-progress');
const prevChunkButton = document.getElementById('prev-chunk');
const nextChunkButton = document.getElementById('next-chunk');
const chunkInfo = document.getElementById('chunk-info');
const chunkSizeBtn = document.getElementById('chunk-size-btn');
const chunkSizeModal = document.getElementById('chunk-size-modal');
const saveChunkSizeBtn = document.getElementById('save-chunk-size');
const chunkSizeInput = document.getElementById('chunk-size-input');
const closeChunkSizeModal = document.querySelector('.close-chunk-size');
const kanjiBackDisplay = document.getElementById('kanji-back');
const kanjiCard = document.querySelector('.kanji-card');
// Show/Hide Modals
function showLoginModal() {
    loginModal.style.display = 'block';
    signupModal.style.display = 'none';
}
function showSignupModal() {
    signupModal.style.display = 'block';
    loginModal.style.display = 'none';
}
document.addEventListener('DOMContentLoaded', () => {
    // Modal Triggers
    authTrigger.addEventListener('click', (e) => {
        e.preventDefault();
        showLoginModal();
    });
    showSignup.addEventListener('click', (e) => {
        e.preventDefault();
        showSignupModal();
    });

    showLogin.addEventListener('click', (e) => {
        e.preventDefault();
        showLoginModal();
    });

    closeLogin.addEventListener('click', () => loginModal.style.display = 'none');
    closeSignup.addEventListener('click', () => signupModal.style.display = 'none');

    window.addEventListener('click', (event) => {
        if (event.target === loginModal) loginModal.style.display = 'none';
        if (event.target === signupModal) signupModal.style.display = 'none';
    });

    // Login Form Submission
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            console.log('Logged in:', userCredential.user);
            loginModal.style.display = 'none';
            document.getElementById('login-error').textContent = 'Successfully logged in!';
            setTimeout(() => document.getElementById('login-error').textContent = '', 3000);
            updateAuthStatus(userCredential.user);
            loadUserProgress(userCredential.user.uid);
        } catch (error) {
            let errorMessage = 'Login failed. Please try again.';
            switch (error.code) {
                case 'auth/invalid-credential':
                    errorMessage = 'Incorrect password';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'Invalid email format. Please enter a valid email.';
                    break;
                case 'auth/user-not-found':
                    errorMessage = 'No user found with this email. Please sign up or check your email.';
                    break;
                case 'auth/wrong-password':
                    errorMessage = 'Incorrect password. Please try again or reset your password.';
                    break;
                case 'auth/too-many-requests':
                    errorMessage = 'Too many attempts. Please wait and try again later.';
                    break;
                default:
                    errorMessage = `Login failed: ${error.message}`;
            }
            document.getElementById('login-error').textContent = errorMessage;
        }
    });
    // Forgot Password Logic
    const forgotPasswordLink = document.getElementById('forgot-password');
    forgotPasswordLink.addEventListener('click', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value.trim();

        if (!email) {
            document.getElementById('login-error').textContent = 'Please enter your email address first.';
            return;
        }

        try {
            await sendPasswordResetEmail(auth, email);
            document.getElementById('login-error').textContent = 'Password reset email sent! Check your inbox.';
            document.getElementById('login-error').style.color = 'green';
            setTimeout(() => {
                document.getElementById('login-error').textContent = '';
                document.getElementById('login-error').style.color = 'red';
            }, 5000); // Clear message after 5 seconds
        } catch (error) {
            let errorMessage = 'Failed to send reset email.';
            switch (error.code) {
                case 'auth/invalid-email':
                    errorMessage = 'Invalid email format. Please enter a valid email.';
                    break;
                case 'auth/user-not-found':
                    errorMessage = 'No user found with this email.';
                    break;
                case 'auth/too-many-requests':
                    errorMessage = 'Too many requests. Please try again later.';
                    break;
                default:
                    errorMessage = `Error: ${error.message}`;
            }
            document.getElementById('login-error').textContent = errorMessage;
        }
    });
    // Signup Form Submission
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('signup-email').value.trim();
        const password = document.getElementById('signup-password').value.trim();
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            console.log('Signed up:', userCredential.user);
            signupModal.style.display = 'none';
            document.getElementById('signup-error').textContent = 'Successfully signed up!';
            setTimeout(() => document.getElementById('signup-error').textContent = '', 3000);
            updateAuthStatus(userCredential.user);
            saveUserProgress(userCredential.user.uid, {});
        } catch (error) {
            let errorMessage = 'Sign up failed. Please try again.';
            switch (error.code) {
                case 'auth/invalid-email':
                    errorMessage = 'Invalid email format. Please enter a valid email.';
                    break;
                case 'auth/email-already-in-use':
                    errorMessage = 'This email is already in use. Please login or use a different email.';
                    break;
                case 'auth/weak-password':
                    errorMessage = 'Password is too weak. Use at least 6 characters.';
                    break;
                case 'auth/too-many-requests':
                    errorMessage = 'Too many attempts. Please wait and try again later.';
                    break;
                default:
                    errorMessage = `Sign up failed: ${error.message}`;
            }
            document.getElementById('signup-error').textContent = errorMessage;
        }
    });

    // Auth State Listener
    onAuthStateChanged(auth, (user) => {
        if (user) {
            console.log('User logged in:', user.uid);
            updateAuthStatus(user);
            loadUserProgress(user.uid);
        } else {
            console.log('No user logged in');
            updateAuthStatus(null);
        }
    });

    // Update Auth Status
    function updateAuthStatus(user) {
        console.log('Updating auth status:', user ? user.email : 'No user');
        if (user) {
            authTrigger.style.display = 'none';
            userArea.style.display = 'flex';
            userArea.style.gap = '10px';
            userGreeting.textContent = `Hello, ${user.email.split('@')[0]}`; // Show first part of email as username
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                signOut(auth).then(() => {
                    console.log('Logged out');
                    userArea.style.display = 'none';
                    authTrigger.style.display = 'inline-block';
                    // Reset UI or disable features if needed
                    kanjiList = [];
                    noIdeaList = [];
                    seenButNoIdeaList = [];
                    rememberedList = [];
                    currentSetTitle = 'please choose a kanji set below or add your own to start studying';
                    savedSets = {};
                    updateProgress();
                    displayKanji();
                    renderSavedSets();
                    renderKanjiLists();
                }).catch((error) => {
                    console.error('Logout error:', error);
                });
            });
        } else {
            authTrigger.style.display = 'inline-block';
            userArea.style.display = 'none';
            userGreeting.textContent = '';
            // Remove any existing logout listener to prevent duplicates
            logoutBtn.replaceWith(logoutBtn.cloneNode(true));
        }
    }

    // Load User Progress from Firebase
    function loadUserProgress(userId) {
        const userProgressRef = ref(database, `users/${userId}/progress`);
        onValue(userProgressRef, (snapshot) => {
            const progress = snapshot.val() || {};
            kanjiList = progress.kanjiList || [];
            noIdeaList = progress.noIdeaList || [];
            seenButNoIdeaList = progress.seenButNoIdeaList || [];
            rememberedList = progress.rememberedList || [];
            currentSetTitle = progress.currentSetTitle || 'please choose a kanji set below or add your own to start studying';
            savedSets = progress.savedSets || {};
            // Ensure chunkProgress is initialized for each set
            for (const set of Object.values(savedSets)) {
                set.chunkProgress = set.chunkProgress || {};
            }
            updateProgress();
            displayKanji();
            renderSavedSets();
            renderKanjiLists();
        });
    }

    // Save User Progress to Firebase
    function saveData() {
        const user = auth.currentUser;
        if (user) {
            const userProgressRef = ref(database, `users/${user.uid}/progress`);
            // Structure savedSets to include chunk-specific progress
            const updatedSavedSets = {};
            for (const [title, set] of Object.entries(savedSets)) {
                updatedSavedSets[title] = {
                    ...set,
                    chunks: set.chunks,
                    currentChunkIndex: set.currentChunkIndex,
                    chunkProgress: set.chunkProgress || {} // Store progress per chunk
                };
                // Save current chunk progress if it matches this set
                if (currentSetTitle.startsWith(title)) {
                    const chunkIndex = set.currentChunkIndex;
                    updatedSavedSets[title].chunkProgress[chunkIndex] = {
                        noIdeaList: [...noIdeaList],
                        seenButNoIdeaList: [...seenButNoIdeaList],
                        rememberedList: [...rememberedList]
                    };
                }
            }
            const progressData = {
                kanjiList,
                noIdeaList,
                seenButNoIdeaList,
                rememberedList,
                currentSetTitle,
                savedSets: updatedSavedSets
            };
            set(userProgressRef, progressData)
                .then(() => console.log('Progress saved to Firebase'))
                .catch(error => console.error('Error saving progress:', error));
        }
        // Update localStorage as well
        localStorage.setItem('kanjiList', JSON.stringify(kanjiList));
        localStorage.setItem('noIdeaList', JSON.stringify(noIdeaList));
        localStorage.setItem('seenButNoIdeaList', JSON.stringify(seenButNoIdeaList));
        localStorage.setItem('rememberedList', JSON.stringify(rememberedList));
        localStorage.setItem('currentSetTitle', currentSetTitle);
        localStorage.setItem('savedSets', JSON.stringify(savedSets));
        updateProgress();
    }

    // Event listeners for navigation buttons
    prevChunkButton.addEventListener('click', () => {
        const set = savedSets[currentSetTitle.split(' (Part')[0]];
        if (set.currentChunkIndex > 0) {
            loadChunk(set.title, set.currentChunkIndex - 1);
        }
    });

    nextChunkButton.addEventListener('click', () => {
        const set = savedSets[currentSetTitle.split(' (Part')[0]];
        if (set.currentChunkIndex < set.chunks.length - 1) {
            loadChunk(set.title, set.currentChunkIndex + 1);
        }
    });

    function updateChunkInfo() {
        const chunkInfo = document.getElementById('chunk-info'); // Ensure this element exists
        if (chunkInfo) {
            const set = savedSets[currentSetTitle.split(' (Part')[0]];
            if (set) {
                chunkInfo.textContent = `Part ${set.currentChunkIndex + 1} of ${set.chunks.length}`;
            }
        } else {
            console.error('chunkInfo element not found');
        }
    }

    // Load Dark Mode Preference on Page Load
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    if (savedDarkMode) {
        document.body.classList.add('dark-mode');
        darkModeToggle.checked = true;
    }

    // Dark Mode Toggle
    darkModeToggle.addEventListener('change', () => {
        document.body.classList.toggle('dark-mode');
        localStorage.setItem('darkMode', darkModeToggle.checked);
    });

    // Function to disable the buttons
    function disableButtons() {
        noIdeaButton.disabled = true;
        seenButNoIdeaButton.disabled = true;
        rememberedButton.disabled = true;
        console.log('Buttons disabled');
    }

    // Function to enable the buttons
    function enableButtons() {
        noIdeaButton.disabled = false;
        seenButNoIdeaButton.disabled = false;
        rememberedButton.disabled = false;
        console.log('Buttons enabled');
    }

    // Hide the reading and meaning
    function hideReadingAndMeaning() {
        kanjiCard.classList.remove('flip');
        if (currentReviewKanji) {
            kanjiDisplay.textContent = currentReviewKanji.kanji; // Ensure front shows the same Kanji
            kanjiBackDisplay.textContent = currentReviewKanji.kanji; // Ensure back matches
            readingDisplay.textContent = '';
            meaningDisplay.textContent = '';
            exampleDisplay.textContent = '';
            nextButton.style.display = 'none';
            syncCardHeight(); // Sync height after hiding
        }
    }

    // Update Progress Bar
    function updateProgress() {
        const total = kanjiList.length;
        if (total === 0) {
            progressBar.value = 0;
            progressText.textContent = '0%';
            return;
        }
        const remembered = rememberedList.length;
        const progress = Math.round((remembered / total) * 100);
        progressBar.value = progress;
        progressText.textContent = `${progress}%`;
        noIdeaCountDisplay.textContent = noIdeaList.length;
        seenButNoIdeaCountDisplay.textContent = seenButNoIdeaList.length;
        rememberedCountDisplay.textContent = rememberedList.length;
    }

    // Get the next Kanji to display
    function getNextKanji() {
        if (noIdeaList.length > 0) {
            return noIdeaList[0]; // Show the first kanji in the noIdeaList
        } else if (seenButNoIdeaList.length > 0) {
            return seenButNoIdeaList[0]; // Show the first kanji in the seenButNoIdeaList
        } else {
            return null; // No more kanji to review
        }
    }

    function syncCardHeight() {
        const card = document.querySelector('.kanji-card');
        const front = document.querySelector('.card-front');
        const back = document.querySelector('.card-back');

        // Reset height to auto to measure natural height
        card.style.height = 'auto';
        front.style.height = 'auto';
        back.style.height = 'auto';

        // Ensure both front and back are visible temporarily to measure height
        front.style.display = 'flex';
        back.style.display = 'flex';

        // Get the tallest height
        const frontHeight = front.offsetHeight;
        const backHeight = back.offsetHeight;
        const maxHeight = Math.max(frontHeight, backHeight);

        // Set all to the tallest height
        card.style.height = `${maxHeight}px`;
        front.style.height = `${maxHeight}px`;
        back.style.height = `${maxHeight}px`;

        // Restore display states based on flip state
        if (!kanjiCard.classList.contains('flip')) {
            back.style.display = 'none';
        } else {
            front.style.display = 'none';
        }
    }

    // Display the current or next Kanji
    function displayKanji(kanji = null) {
        currentReviewKanji = kanji || getNextKanji(); // Use provided kanji or get the next one

        if (currentReviewKanji) {
            kanjiCard.classList.remove('flip');
            kanjiDisplay.textContent = currentReviewKanji.kanji; // Show only the Kanji on front without details
            kanjiBackDisplay.textContent = currentReviewKanji.kanji; // Ensure back matches front (without details initially)
            readingDisplay.textContent = '';
            meaningDisplay.textContent = '';
            exampleDisplay.textContent = '';
            nextButton.style.display = 'none';
            syncCardHeight(); // Sync height after updating content
        } else {
            kanjiCard.classList.remove('flip');
            kanjiDisplay.textContent = 'Nothing to review!';
            kanjiBackDisplay.textContent = 'Nothing to review!'; // Match the front side text
            readingDisplay.textContent = '';
            meaningDisplay.textContent = '';
            exampleDisplay.textContent = '';
            nextButton.style.display = 'none';
            syncCardHeight(); // Sync height for empty state
        }
    }

    // Show the reading and meaning of the current Kanji
    function showReadingAndMeaning() {
        if (!currentReviewKanji) {
            console.log('No current kanji to show details for.');
            return;
        }

        // Ensure both front and back show the same Kanji, then add details to the back
        kanjiDisplay.textContent = currentReviewKanji.kanji; // Keep the same Kanji on front (without details)
        kanjiBackDisplay.textContent = currentReviewKanji.kanji; // Ensure back shows the same Kanji
        readingDisplay.textContent = currentReviewKanji.reading;
        meaningDisplay.textContent = currentReviewKanji.meaning;
        if (currentReviewKanji.examples && currentReviewKanji.examples.length > 0) {
            exampleDisplay.innerHTML = currentReviewKanji.examples.join('<br>');
        } else {
            exampleDisplay.innerHTML = '';
        }

        kanjiCard.classList.add('flip');
        nextButton.style.display = 'block';
        syncCardHeight(); // Sync height after flipping
    }

    // Load data from local storage
    function loadData() {
        const savedProgress = localStorage.getItem('userProgress');
        if (savedProgress) {
            const progressData = JSON.parse(savedProgress);
            kanjiList = progressData.kanjiList || [];
            noIdeaList = progressData.noIdeaList || [];
            seenButNoIdeaList = progressData.seenButNoIdeaList || [];
            rememberedList = progressData.rememberedList || [];
            currentSetTitle = progressData.currentSetTitle || 'please choose a kanji set below or add your own to start studying';
            savedSets = progressData.savedSets || {};

            console.log('Progress loaded from localStorage');
            updateProgress(); // Update the progress bar and stats
            displayKanji(); // Display the next kanji
            renderSavedSets(); // Render the saved sets list
            renderKanjiLists();
        } else {
            console.log('No saved progress found');
        }
    }

    function renderKanjiLists() {
        console.log('Rendering kanji lists...');
        console.log('noIdeaList:', noIdeaList.map(k => k.kanji));
        console.log('seenButNoIdeaList:', seenButNoIdeaList.map(k => k.kanji));
        console.log('rememberedList:', rememberedList.map(k => k.kanji));

        // Render noIdeaList
        const noIdeaListElement = document.getElementById('no-idea-list');
        noIdeaListElement.innerHTML = noIdeaList.map(k => `<li>${k.kanji}</li>`).join('');

        // Render seenButNoIdeaList
        const seenButNoIdeaListElement = document.getElementById('seen-but-no-idea-list');
        seenButNoIdeaListElement.innerHTML = seenButNoIdeaList.map(k => `<li>${k.kanji}</li>`).join('');

        // Render rememberedList
        const rememberedListElement = document.getElementById('remembered-list');
        rememberedListElement.innerHTML = rememberedList.map(k => `<li>${k.kanji}</li>`).join('');
    }

    // Function to move a kanji to a specific list
    function moveKanjiToList(kanji, targetList) {
        console.log('Moving kanji:', kanji.kanji);
        console.log('Target List:', targetList === noIdeaList ? 'noIdeaList' : targetList === seenButNoIdeaList ? 'seenButNoIdeaList' : 'rememberedList');

        // Remove the kanji from all lists except the target list
        if (targetList !== noIdeaList) {
            noIdeaList = noIdeaList.filter(k => k.kanji !== kanji.kanji);
        }
        if (targetList !== seenButNoIdeaList) {
            seenButNoIdeaList = seenButNoIdeaList.filter(k => k.kanji !== kanji.kanji);
        }
        if (targetList !== rememberedList) {
            rememberedList = rememberedList.filter(k => k.kanji !== kanji.kanji);
        }

        // Add the kanji to the target list if it doesn't already exist
        const isDuplicate = targetList.some(k => k.kanji === kanji.kanji);
        if (!isDuplicate) {
            targetList.push(kanji);
            console.log(`Added kanji ${kanji.kanji} to ${targetList === noIdeaList ? 'noIdeaList' : targetList === seenButNoIdeaList ? 'seenButNoIdeaList' : 'rememberedList'}`);
        } else {
            console.log(`Kanji ${kanji.kanji} is already in the target list.`);
        }

        // Shuffle the target list after adding the kanji
        if (targetList === noIdeaList || targetList === seenButNoIdeaList) {
            shuffleArray(targetList);
        }

        // Render the updated lists
        renderKanjiLists();

        // Save progress
        saveData();
    }

    noIdeaButton.addEventListener('click', () => {
        if (!currentReviewKanji) return;
        markedKanji = { kanji: currentReviewKanji, targetList: noIdeaList }; // Mark the kanji
        disableButtons();
        showReadingAndMeaning();
    });

    seenButNoIdeaButton.addEventListener('click', () => {
        if (!currentReviewKanji) return;
        markedKanji = { kanji: currentReviewKanji, targetList: seenButNoIdeaList }; // Mark the kanji
        disableButtons();
        showReadingAndMeaning();
    });

    rememberedButton.addEventListener('click', () => {
        if (!currentReviewKanji) return;
        markedKanji = { kanji: currentReviewKanji, targetList: rememberedList }; // Mark the kanji
        disableButtons();
        showReadingAndMeaning();
    });

    // Handle "Next" button click
    nextButton.addEventListener('click', () => {
        if (markedKanji && markedKanji.kanji) {
            moveKanjiToList(markedKanji.kanji, markedKanji.targetList);
            markedKanji = null; // Clear after moving
        } else {
            console.warn('No marked kanji to move.');
        }
        enableButtons();
        hideReadingAndMeaning();
        const nextKanji = getNextKanji();
        if (nextKanji) {
            displayKanji(nextKanji);
        } else {
            displayKanji(); // Show "Nothing to review!" if no kanji left
        }
        saveData(); // Save progress after each action
    });

    // Hide the reading and meaning
    function hideReadingAndMeaning() {
        kanjiCard.classList.remove('flip');
        if (currentReviewKanji) {
            kanjiDisplay.textContent = currentReviewKanji.kanji; // Show only the Kanji on front without details
            kanjiBackDisplay.textContent = currentReviewKanji.kanji; // Ensure back matches front (without details)
            readingDisplay.textContent = '';
            meaningDisplay.textContent = '';
            exampleDisplay.textContent = '';
            nextButton.style.display = 'none';
            syncCardHeight(); // Sync height after hiding
        }
    }

    // Handle custom set submission
    submitCustomButton.addEventListener('click', () => {
        const setName = setTitleInput.value.trim();
        if (!setName) {
            alert('Please enter a name for your set.');
            return;
        }

        const lines = kanjiInput.value.split('\n');
        const newKanjiList = [];
        lines.forEach(line => {
            const [kanjiData, examples] = line.split('#'); // Split into kanji data and examples
            const parts = kanjiData.split(','); // Split kanji data by commas
            if (parts.length >= 3) {
                const kanji = parts[0].trim();
                const reading = parts[1].trim();
                const meaning = parts.slice(2).join(',').trim(); // Capture everything after the second comma
                if (kanji && reading && meaning) {
                    newKanjiList.push({
                        kanji,
                        reading,
                        meaning,
                        examples: examples ? examples.split('\n') : [] // Split examples into an array
                    });
                }
            }
        });

        if (newKanjiList.length === 0) {
            alert('Please enter valid Kanji data.');
            return;
        }

        const newSet = {
            title: setName,
            kanjiList: newKanjiList,
            noIdeaList: [...newKanjiList],
            seenButNoIdeaList: [],
            rememberedList: []
        };

        savedSets[setName] = newSet;
        loadSet(newSet);
        setTitleInput.value = '';
        kanjiInput.value = '';
        renderSavedSets();
    });

    function toggleNavigationButtons(show) {
        const prevChunkButton = document.getElementById('prev-chunk');
        const nextChunkButton = document.getElementById('next-chunk');

        if (show) {
            prevChunkButton.style.display = 'inline-block'; // Show the buttons
            nextChunkButton.style.display = 'inline-block';
        } else {
            prevChunkButton.style.display = 'none'; // Hide the buttons
            nextChunkButton.style.display = 'none';
        }
    }

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1)); // Random index from 0 to i
            [array[i], array[j]] = [array[j], array[i]]; // Swap elements
        }
        return array;
    }

    // Chunk Size Adjustment
    chunkSizeBtn.addEventListener('click', () => {
        chunkSizeModal.style.display = 'block';
    });

    closeChunkSizeModal.addEventListener('click', () => {
        chunkSizeModal.style.display = 'none';
    });

    saveChunkSizeBtn.addEventListener('click', () => {
        const newSize = parseInt(chunkSizeInput.value);
        if (!isNaN(newSize) && newSize > 0) {
            localStorage.setItem('chunkSize', newSize);
            chunkSizeModal.style.display = 'none';

            // Update current set with new chunk size
            const currentSetTitle = document.getElementById('current-set-title').textContent;
            const baseSetTitle = currentSetTitle.split(' (Part')[0];
            const currentSet = savedSets[baseSetTitle];

            if (currentSet) {
                // Save current progress before re-chunking
                currentSet.noIdeaList = noIdeaList;
                currentSet.seenButNoIdeaList = seenButNoIdeaList;
                currentSet.rememberedList = rememberedList;

                // Re-chunk the set
                const newChunks = splitIntoChunks(currentSet.kanjiList, newSize);
                currentSet.chunks = newChunks;

                // Reload current chunk
                const currentChunkIndex = currentSet.currentChunkIndex;
                loadChunk(baseSetTitle, currentChunkIndex);
            }
        }
    });

    window.addEventListener('click', (event) => {
        if (event.target === chunkSizeModal) {
            chunkSizeModal.style.display = 'none';
        }
    });

    // Initialize chunk size input
    chunkSizeInput.value = localStorage.getItem('chunkSize') || 30;

    // Load a set into the system
    function loadSet(set) {
        const chunkSize = parseInt(localStorage.getItem('chunkSize')) || 30;
        const chunks = splitIntoChunks(set.kanjiList, chunkSize);

        savedSets[set.title] = {
            title: set.title,
            chunks: chunks.map(chunk => shuffleArray([...chunk])), // Store fresh copies
            currentChunkIndex: 0,
            chunkProgress: {}, // Initialize chunk progress object
            noIdeaList: set.noIdeaList || [],
            seenButNoIdeaList: set.seenButNoIdeaList || [],
            rememberedList: set.rememberedList || []
        };

        toggleNavigationButtons(chunks.length > 1);
        loadChunk(set.title, 0);
        renderKanjiLists();
    }

    function loadChunk(setTitle, chunkIndex) {
        const set = savedSets[setTitle];
        if (!set || chunkIndex >= set.chunks.length || chunkIndex < 0) {
            console.log('Invalid chunk index or set not found.');
            return;
        }

        // Save progress of the current chunk before switching
        if (currentSetTitle && savedSets[currentSetTitle.split(' (Part')[0]]) {
            const currentSet = savedSets[currentSetTitle.split(' (Part')[0]];
            currentSet.chunkProgress = currentSet.chunkProgress || {};
            currentSet.chunkProgress[currentSet.currentChunkIndex] = {
                noIdeaList: [...noIdeaList],
                seenButNoIdeaList: [...seenButNoIdeaList],
                rememberedList: [...rememberedList]
            };
        }

        // Update the current chunk index
        set.currentChunkIndex = chunkIndex;

        // Load or initialize chunk progress
        set.chunkProgress = set.chunkProgress || {};
        const chunkProgress = set.chunkProgress[chunkIndex] || {};
        kanjiList = shuffleArray([...set.chunks[chunkIndex]]); // Fresh copy of chunk
        noIdeaList = chunkProgress.noIdeaList ? [...chunkProgress.noIdeaList] : [...kanjiList];
        seenButNoIdeaList = chunkProgress.seenButNoIdeaList ? [...chunkProgress.seenButNoIdeaList] : [];
        rememberedList = chunkProgress.rememberedList ? [...chunkProgress.rememberedList] : [];
        currentSetTitle = `${setTitle} (Part ${chunkIndex + 1})`;

        // Update UI
        setTitleDisplay.textContent = currentSetTitle;
        updateProgress();
        displayKanji();
        updateChunkInfo();
        enableButtons();
        saveData(); // Save immediately after loading to ensure consistency
    }

    // Render saved sets
    function renderSavedSets() {
        savedSetsList.innerHTML = '';
        for (const [name, set] of Object.entries(savedSets)) {
            const li = document.createElement('li');
            li.textContent = name;
            li.addEventListener('click', () => {
                // Save the current progress before loading the new set
                savedSets[currentSetTitle] = {
                    title: currentSetTitle,
                    kanjiList: kanjiList,
                    noIdeaList: noIdeaList,
                    seenButNoIdeaList: seenButNoIdeaList,
                    rememberedList: rememberedList
                };
                localStorage.setItem('savedSets', JSON.stringify(savedSets));
                loadSet(set);
            });
            savedSetsList.appendChild(li);
        }
    }

    // Spoiler functionality
    spoilerButtons.forEach(button => {
        button.addEventListener('click', () => {
            const spoiler = button.parentElement;
            spoiler.classList.toggle('open');
        });
    });

    // Fetch predefined sets from JSON file
    async function fetchPredefinedSets() {
        try {
            const response = await fetch('predefined-kanji-sets.json'); // Path to your JSON file
            if (!response.ok) {
                throw new Error('Failed to fetch predefined kanji sets.');
            }
            predefinedSets = await response.json();
            console.log('Predefined sets loaded from JSON file:', predefinedSets);

            // Group sets by prefix and generate dropdowns
            const groupedSets = groupSetsByPrefix(predefinedSets);
            generateDropdowns(groupedSets);
        } catch (error) {
            console.error('Error loading predefined sets:', error);
            predefinedSets = {}; // Fallback to an empty object
        }
    }

    // Function to toggle spoilers using event delegation
    function toggleSpoilers() {
        const spoilerButtons = document.querySelectorAll('.spoiler-button');
        console.log('Found spoiler buttons:', spoilerButtons.length);

        spoilerButtons.forEach(button => {
            button.addEventListener('click', (event) => {
                event.preventDefault(); // Prevent default behavior
                event.stopPropagation(); // Stop event propagation
                const spoiler = button.parentElement;
                spoiler.classList.toggle('open');
                console.log('Spoiler toggled:', spoiler.classList.contains('open'));
            });
        });
    }

    // Function to handle predefined set submission
    function handlePredefinedSetSubmission() {
        const predefinedSetsContainer = document.getElementById('predefined-kanji-sets');
        predefinedSetsContainer.addEventListener('click', (event) => {
            if (event.target.classList.contains('submit-predefined')) {
                const dropdown = event.target.previousElementSibling; // Get the associated dropdown
                const selectedSetKey = dropdown.value; // Get the selected value
                if (selectedSetKey && predefinedSets[selectedSetKey]) {
                    loadPredefinedSet(selectedSetKey);
                } else {
                    alert('Please select a valid set.');
                }
            }
        });
    }

    // Function to group sets by prefix
    function groupSetsByPrefix(sets) {
        const groupedSets = {};

        Object.keys(sets).forEach((setKey) => {
            const prefix = setKey.split(' ')[0]; // Extract the prefix (e.g., "n1", "tettei")
            if (!groupedSets[prefix]) {
                groupedSets[prefix] = [];
            }
            groupedSets[prefix].push(setKey);
        });

        return groupedSets;
    }

    // Function to add event listeners to dynamically created elements
    function addEventListenersToButtons() {
        const kanjiSetSelects = document.querySelectorAll('.kanji-set-select');
        const submitPredefinedButtons = document.querySelectorAll('.submit-predefined');

        if (kanjiSetSelects.length > 0 && submitPredefinedButtons.length > 0) {
            submitPredefinedButtons.forEach((button, index) => {
                button.addEventListener('click', () => {
                    const selectedSet = kanjiSetSelects[index].value;
                    if (selectedSet && predefinedSets[selectedSet]) {
                        loadPredefinedSet(selectedSet);
                    }
                });
            });
        } else {
            console.error('One or more elements not found:', { kanjiSetSelects, submitPredefinedButtons });
        }
    }

    // Function to generate dropdowns based on grouped sets
    function generateDropdowns(groupedSets) {
        const predefinedSetsContainer = document.getElementById('predefined-kanji-sets');
        predefinedSetsContainer.innerHTML = ''; // Clear existing content

        Object.keys(groupedSets).forEach((prefix, index) => {
            // Create a container for the set group
            const setGroup = document.createElement('div');
            setGroup.className = 'set-group';

            // Add the set title (prefix)
            const setTitle = document.createElement('div');
            setTitle.className = 'set-title';
            setTitle.textContent = prefix.toUpperCase(); // Display prefix as title
            setGroup.appendChild(setTitle);

            // Create the dropdown container
            const dropdownContainer = document.createElement('div');
            dropdownContainer.className = 'dropdown-container';

            // Create the dropdown
            const select = document.createElement('select');
            select.className = 'kanji-set-select';

            // Add a default "Select a set" option
            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.textContent = 'Select a set';
            select.appendChild(defaultOption);

            // Add options for each set in the group
            groupedSets[prefix].forEach((setKey) => {
                const option = document.createElement('option');
                option.value = setKey;
                option.textContent = setKey.replace(/([A-Z])/g, ' $1').trim(); // Format the set key
                select.appendChild(option);
            });

            dropdownContainer.appendChild(select);

            // Add a "Load Selected Set" button for each dropdown
            const loadButton = document.createElement('button');
            loadButton.className = 'submit-predefined';
            loadButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M246.6 9.4c-12.5-12.5-32.8-12.5-45.3 0l-128 128c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 109.3 192 320c0 17.7 14.3 32 32 32s32-14.3 32-32l0-210.7 73.4 73.4c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-128-128zM64 352c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 64c0 53 43 96 96 96l256 0c53 0 96-43 96-96l0-64c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 64c0 17.7-14.3 32-32 32L96 448c-17.7 0-32-14.3-32-32l0-64z"/></svg>
    `;
            dropdownContainer.appendChild(loadButton);

            // Add the dropdown container to the set group
            setGroup.appendChild(dropdownContainer);

            // Add the set group to the predefined sets container
            predefinedSetsContainer.appendChild(setGroup);
        });

        // Call this function after dynamically adding the elements
        addEventListenersToButtons();

        // Reattach spoiler event listeners after updating content
        toggleSpoilers();
    }

    // Function to load a predefined set
    function loadPredefinedSet(setKey) {
        const lines = predefinedSets[setKey]; // Array of strings
        const newKanjiList = [];
        lines.forEach(line => {
            const [kanjiData, examples] = line.split('#'); // Split into kanji data and examples
            const parts = kanjiData.split(','); // Split kanji data by commas
            if (parts.length >= 3) {
                const kanji = parts[0].trim();
                const reading = parts[1].trim();
                const meaning = parts.slice(2).join(',').trim(); // Capture everything after the second comma
                if (kanji && reading && meaning) {
                    newKanjiList.push({
                        kanji,
                        reading,
                        meaning,
                        examples: examples ? examples.split('\n') : [] // Split examples into an array
                    });
                }
            }
        });

        if (newKanjiList.length === 0) {
            return;
        }

        const newSet = {
            title: ` ${setKey}`,
            kanjiList: newKanjiList,
            noIdeaList: [...newKanjiList],
            seenButNoIdeaList: [],
            rememberedList: []
        };

        loadSet(newSet);
    }

    function splitIntoChunks(kanjiList, maxChunkSize = 50) {
        if (!kanjiList || !Array.isArray(kanjiList)) {
            console.error('Invalid kanjiList:', kanjiList);
            return [];
        }
    
        const totalKanji = kanjiList.length;
        if (totalKanji === 0) {
            console.warn('Empty kanjiList provided.');
            return [];
        }
    
        const numberOfChunks = Math.ceil(totalKanji / maxChunkSize); // Number of chunks needed
        const baseChunkSize = Math.floor(totalKanji / numberOfChunks); // Base size for each chunk
        const remainder = totalKanji % numberOfChunks; // Extra kanji to distribute
    
        const chunks = [];
        let startIndex = 0;
    
        for (let i = 0; i < numberOfChunks; i++) {
            const chunkSize = baseChunkSize + (i < remainder ? 1 : 0); // Add extra kanji to the first few chunks
            const chunk = kanjiList.slice(startIndex, startIndex + chunkSize);
            chunks.push(chunk);
            startIndex += chunkSize;
        }
    
        return chunks;
    }

    // Initial setup
    loadData(); // Load saved progress on page load
    fetchPredefinedSets(); // Fetch predefined sets and generate dropdowns
    setTitleDisplay.textContent = currentSetTitle;
    updateProgress();
    renderSavedSets();
    displayKanji();
    handlePredefinedSetSubmission(); // Attach event listeners for predefined set submission
    toggleSpoilers();
});