document.addEventListener('DOMContentLoaded', () => {
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


    let kanjiList = [];
    let currentKanji = null;
    let noIdeaList = [];
    let seenButNoIdeaList = [];
    let rememberedList = [];
    let currentSetTitle = 'please choose a kanji set below or add your own to start studying';
    let savedSets = {};
    let predefinedSets = {};
    let currentReviewKanji = null

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
        
        // Get the tallest height
        const frontHeight = front.offsetHeight;
        const backHeight = back.offsetHeight;
        const maxHeight = Math.max(frontHeight, backHeight);
        
        // Set all to the tallest height
        card.style.height = `${maxHeight}px`;
        front.style.height = `${maxHeight}px`;
        back.style.height = `${maxHeight}px`;
    }
    

    // Display the next Kanji
    function displayKanji() {
        currentKanji = getNextKanji();
    
        if (currentKanji) {
            kanjiCard.classList.remove('flip');
            kanjiDisplay.textContent = currentKanji.kanji;
            kanjiBackDisplay.textContent = currentKanji.kanji;
            readingDisplay.textContent = '';
            meaningDisplay.textContent = '';
            exampleDisplay.textContent = '';
            nextButton.style.display = 'none';
            syncCardHeight(); // Sync height after updating content
        } else {
            kanjiCard.classList.remove('flip');
            kanjiDisplay.textContent = 'Nothing to review!';
            kanjiBackDisplay.textContent = '';
            readingDisplay.textContent = '';
            meaningDisplay.textContent = '';
            exampleDisplay.textContent = '';
            nextButton.style.display = 'none';
            syncCardHeight(); // Sync height for empty state
        }
    }

    // Show the reading and meaning of the current Kanji
    function showReadingAndMeaning() {
        if (!currentKanji) {
            console.log('No current kanji to show details for.');
            return;
        }
        
        readingDisplay.textContent = currentKanji.reading;
        meaningDisplay.textContent = currentKanji.meaning;
        if (currentKanji.examples && currentKanji.examples.length > 0) {
            exampleDisplay.innerHTML = currentKanji.examples.join('<br>');
        } else {
            exampleDisplay.innerHTML = '';
        }
        
        kanjiBackDisplay.textContent = currentKanji.kanji;
        kanjiCard.classList.add('flip');
        nextButton.style.display = 'block';
        syncCardHeight(); // Sync height after flipping
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

        // Step 1: Remove the kanji from all lists except the target list
        if (targetList !== noIdeaList) {
            noIdeaList = noIdeaList.filter(k => k.kanji !== kanji.kanji);
        }
        if (targetList !== seenButNoIdeaList) {
            seenButNoIdeaList = seenButNoIdeaList.filter(k => k.kanji !== kanji.kanji);
        }
        if (targetList !== rememberedList) {
            rememberedList = rememberedList.filter(k => k.kanji !== kanji.kanji);
        }

        // Step 2: Add the kanji to the target list if it doesn't already exist
        const isDuplicate = targetList.some(k => k.kanji === kanji.kanji);
        if (!isDuplicate) {
            targetList.push(kanji); // Add the kanji to the target list
            console.log(`Added kanji ${kanji.kanji} to ${targetList === noIdeaList ? 'noIdeaList' : targetList === seenButNoIdeaList ? 'seenButNoIdeaList' : 'rememberedList'}`);
        } else {
            console.log(`Kanji ${kanji.kanji} is already in the target list.`);
        }

            // Shuffle the target list after adding the kanji
        if (targetList === noIdeaList || targetList === seenButNoIdeaList) {
            shuffleArray(targetList);
        }

        // Step 3: Render the updated lists
        renderKanjiLists();

    }

    noIdeaButton.addEventListener('click', () => {
        if (!currentKanji) return;
        moveKanjiToList(currentKanji, noIdeaList);
        currentReviewKanji = currentKanji;
        disableButtons();
        saveData();
        showReadingAndMeaning();
    });

    seenButNoIdeaButton.addEventListener('click', () => {
        if (!currentKanji) return;
        moveKanjiToList(currentKanji, seenButNoIdeaList);
        currentReviewKanji = currentKanji;
        disableButtons();
        saveData();
        showReadingAndMeaning();
    });

    rememberedButton.addEventListener('click', () => {
        if (!currentKanji) return;
        moveKanjiToList(currentKanji, rememberedList);
        currentReviewKanji = currentKanji;
        disableButtons();
        saveData();
        showReadingAndMeaning();
    });


    // Handle "Next" button click
    nextButton.addEventListener('click', () => {
        if (currentKanji) {
            enableButtons();
            hideReadingAndMeaning();
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
        
        // Store all chunks and track the current chunk
        savedSets[set.title] = {
            title: set.title,
            chunks: chunks.map(chunk => shuffleArray(chunk)),
            currentChunkIndex: 0, // Start with the first chunk
            noIdeaList: [],
            seenButNoIdeaList: [],
            rememberedList: []
        };

        // Show/hide navigation buttons based on the number of chunks
        toggleNavigationButtons(chunks.length > 1);

        // Load the first chunk
        loadChunk(set.title, 0);
        renderKanjiLists();

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
        kanjiList = shuffleArray(set.chunks[chunkIndex]); // Shuffle the kanjis in the chunk
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

    toggleSpoilers();

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

    // Initial setup
    loadData(); // Load saved progress on page load
    fetchPredefinedSets(); // Fetch predefined sets and generate dropdowns
    setTitleDisplay.textContent = currentSetTitle;
    updateProgress();
    renderSavedSets();
    displayKanji();
    handlePredefinedSetSubmission(); // Attach event listeners for predefined set submission
});