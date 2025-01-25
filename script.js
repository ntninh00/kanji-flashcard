document.addEventListener('DOMContentLoaded', () => {
    const kanjiDisplay = document.getElementById('kanji');
    const readingDisplay = document.getElementById('reading');
    const meaningDisplay = document.getElementById('meaning');
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


    let kanjiList = [];
    let currentKanji = null;
    let noIdeaList = [];
    let seenButNoIdeaList = [];
    let rememberedList = [];
    let currentSetTitle = 'None';
    let savedSets = {};
    let predefinedSets = {};

    
    
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

    // Add similar checks for other elements



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

    // Show the reading and meaning of the current Kanji
    function showReadingAndMeaning() {
        if (!currentKanji) {
            console.log('No current kanji to show details for.');
            return;
        }
        readingDisplay.textContent = currentKanji.reading;
        meaningDisplay.textContent = currentKanji.meaning;
        readingMeaningDiv.style.display = 'block';
        nextButton.style.display = 'block'; // Ensure the Next button is visible
    }


    // Hide the reading and meaning
    function hideReadingAndMeaning() {
        readingMeaningDiv.style.display = 'none';
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
            currentKanji = noIdeaList[0]; // Show the first kanji in the list
            return currentKanji;
        } else if (seenButNoIdeaList.length > 0) {
            currentKanji = seenButNoIdeaList[0]; // Show the first kanji in the list
            return currentKanji;
        } else {
            currentKanji = null; // No more kanji to review
            return null;
        }
    }

    // Display the next Kanji
    function displayKanji() {
        const kanji = getNextKanji();
        if (kanji) {
            kanjiDisplay.textContent = kanji.kanji;
            hideReadingAndMeaning();
        } else {
            // No more kanji to review
            kanjiDisplay.textContent = 'Nothing to review!';
            readingDisplay.textContent = '';
            meaningDisplay.textContent = '';
            hideReadingAndMeaning();
        }
    }

    // Save data to local storage
    function saveData() {
        localStorage.setItem('kanjiList', JSON.stringify(kanjiList));
        localStorage.setItem('noIdeaList', JSON.stringify(noIdeaList));
        localStorage.setItem('seenButNoIdeaList', JSON.stringify(seenButNoIdeaList));
        localStorage.setItem('rememberedList', JSON.stringify(rememberedList));
        localStorage.setItem('currentSetTitle', currentSetTitle);
        localStorage.setItem('savedSets', JSON.stringify(savedSets));
        updateProgress();
        const progressData = {
            kanjiList,
            noIdeaList,
            seenButNoIdeaList,
            rememberedList,
            currentSetTitle,
            savedSets
        };
        localStorage.setItem('userProgress', JSON.stringify(progressData));
        console.log('Progress saved to localStorage');
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
            currentSetTitle = progressData.currentSetTitle || 'None';
            savedSets = progressData.savedSets || {};

            console.log('Progress loaded from localStorage');
            updateProgress(); // Update the progress bar and stats
            displayKanji(); // Display the next kanji
            renderSavedSets(); // Render the saved sets list
        } else {
            console.log('No saved progress found');
        }
    }

    // Reset progress
    function resetProgress() {
        kanjiList = [];
        noIdeaList = [];
        seenButNoIdeaList = [];
        rememberedList = [];
        currentSetTitle = 'None';
        savedSets = {};
        localStorage.removeItem('userProgress');
        updateProgress();
        displayKanji();
        renderSavedSets();
        console.log('Progress reset');
    }

    // Handle "No Idea" button click
    noIdeaButton.addEventListener('click', () => {
        if (!currentKanji) {
            console.log('No current kanji to add to No Idea list.');
            return;
        }
        noIdeaList.push(currentKanji);
        disableButtons();
        showReadingAndMeaning();
        saveData();
    });

    // Handle "Seen but No Idea" button click
    seenButNoIdeaButton.addEventListener('click', () => {
        if (!currentKanji) {
            console.log('No current kanji to add to Seen but No Idea list.');
            return;
        }
        seenButNoIdeaList.push(currentKanji);
        disableButtons();
        showReadingAndMeaning();
        saveData();
    });

    // Handle "Remembered" button click
    rememberedButton.addEventListener('click', () => {
        if (!currentKanji) {
            console.log('No current kanji to add to Remembered list.');
            return;
        }

        // Remove the current kanji from all active lists
        noIdeaList = noIdeaList.filter(k => k.kanji !== currentKanji.kanji);
        seenButNoIdeaList = seenButNoIdeaList.filter(k => k.kanji !== currentKanji.kanji);
        rememberedList.push(currentKanji); // Add to remembered list

        // Disable buttons and show reading/meaning
        disableButtons();
        showReadingAndMeaning();

        // Save progress and display the next kanji
        saveData();
    });


    // Handle "Next" button click
    nextButton.addEventListener('click', () => {
        if (currentKanji) {
            // Remove the current kanji from the active list
            if (noIdeaList.includes(currentKanji)) {
                noIdeaList = noIdeaList.filter(k => k.kanji !== currentKanji.kanji);
            } else if (seenButNoIdeaList.includes(currentKanji)) {
                seenButNoIdeaList = seenButNoIdeaList.filter(k => k.kanji !== currentKanji.kanji);
            }

            // Enable buttons and hide reading/meaning
            enableButtons();
            hideReadingAndMeaning();

            // Save progress and display the next kanji
            saveData();
            displayKanji();
        }
    });


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
            const parts = line.split(',');
            if (parts.length >= 3) {
                const kanji = parts[0].trim();
                const reading = parts[1].trim();
                const meaning = parts.slice(2).join(',').trim(); // Everything after the second comma
                if (kanji && reading && meaning) {
                    newKanjiList.push({ kanji, reading, meaning });
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

    // Load a set into the system
    function loadSet(set) {
        const chunks = splitIntoChunks(set.kanjiList, 50); // Split into chunks of <= 50 kanji

        // Store all chunks and track the current chunk
        savedSets[set.title] = {
            title: set.title,
            chunks: chunks,
            currentChunkIndex: 0, // Start with the first chunk
            noIdeaList: [],
            seenButNoIdeaList: [],
            rememberedList: []
        };

        // Show/hide navigation buttons based on the number of chunks
        toggleNavigationButtons(chunks.length > 1);

        // Load the first chunk
        loadChunk(set.title, 0);
    }

    function loadChunk(setTitle, chunkIndex) {
        const set = savedSets[setTitle];
        if (!set || chunkIndex >= set.chunks.length) {
            console.log('Invalid chunk index or set not found.');
            return;
        }

        // Update the current chunk index
        set.currentChunkIndex = chunkIndex;

        // Load the kanji from the current chunk
        kanjiList = set.chunks[chunkIndex];
        noIdeaList = [...kanjiList]; // Reset progress for the new chunk
        seenButNoIdeaList = [];
        rememberedList = [];
        currentSetTitle = `${set.title} (Part ${chunkIndex + 1})`;

        // Update the UI
        setTitleDisplay.textContent = currentSetTitle;
        updateProgress();
        displayKanji();
        updateChunkInfo();

        // Enable the buttons when loading a new set
        enableButtons(); // Ensure this is called
        console.log('New set loaded, buttons should be enabled'); // Debug: Confirm this is being called

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
        document.body.addEventListener('click', (event) => {
            if (event.target.classList.contains('spoiler-button')) {
                const spoiler = event.target.parentElement;
                spoiler.classList.toggle('open');
            }
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
    document.getElementById('predefined-kanji-sets').addEventListener('click', (event) => {
        if (event.target.classList.contains('submit-predefined')) {
            const dropdown = event.target.previousElementSibling; // Get the associated dropdown
            const selectedSet = dropdown.value;
            if (selectedSet && predefinedSets[selectedSet]) {
                loadPredefinedSet(selectedSet);
            }
        }
    });
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
            loadButton.className = 'submit-predefined'; // Ensure this class is applied
            loadButton.textContent = 'Load';
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
        const lines = predefinedSets[setKey]; // Already an array of strings
        const newKanjiList = [];
        lines.forEach(line => {
            const parts = line.split(',');
            if (parts.length >= 3) {
                const kanji = parts[0].trim();
                const reading = parts[1].trim();
                const meaning = parts.slice(2).join(',').trim();
                if (kanji && reading && meaning) {
                    newKanjiList.push({ kanji, reading, meaning });
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
        const totalKanji = kanjiList.length;
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


    let token = null;

    // Save Progress Function
    async function saveProgress() {
        if (!token) return;
        const progress = {
            kanjiList,
            noIdeaList,
            seenButNoIdeaList,
            rememberedList,
            currentSetTitle,
        };
        await fetch('http://localhost:5000/save-progress', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, progress }),
        });
    }
    // Load Progress Function
    async function loadProgress() {
        if (!token) return;
        const response = await fetch('http://localhost:5000/load-progress', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token }),
        });
        const data = await response.json();
        if (response.ok) {
            kanjiList = data.kanjiList || [];
            noIdeaList = data.noIdeaList || [];
            seenButNoIdeaList = data.seenButNoIdeaList || [];
            rememberedList = data.rememberedList || [];
            currentSetTitle = data.currentSetTitle || 'None';
            updateProgress();
            displayKanji();
        }
    }

    // Call saveProgress whenever progress changes
    // Example: After clicking "No Idea", "Seen but No Idea", or "Remembered"
    noIdeaButton.addEventListener('click', () => {
        noIdeaList.push(currentKanji);
        showReadingAndMeaning();
        saveProgress();
    });

    seenButNoIdeaButton.addEventListener('click', () => {
        seenButNoIdeaList.push(currentKanji);
        showReadingAndMeaning();
        saveProgress();
    });
    // Initial setup
    loadData(); // Load saved progress on page load
    fetchPredefinedSets(); // Fetch predefined sets and generate dropdowns
    setTitleDisplay.textContent = currentSetTitle;
    updateProgress();
    renderSavedSets();
    displayKanji();
    toggleSpoilers(); // Ensure spoilers work on initial load
    handlePredefinedSetSubmission(); // Attach event listeners for predefined set submission
});