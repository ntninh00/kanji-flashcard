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
    const savedSetsList = document.getElementById('saved-sets-list');
    const noIdeaCountDisplay = document.getElementById('no-idea-count');
    const seenButNoIdeaCountDisplay = document.getElementById('seen-but-no-idea-count');
    const rememberedCountDisplay = document.getElementById('remembered-count');
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');
    const spoilerButtons = document.querySelectorAll('.spoiler-button');
    const darkModeToggle = document.getElementById('dark-mode');
    const prevChunkButton = document.getElementById('prev-chunk');
    const nextChunkButton = document.getElementById('next-chunk');
    const chunkInfo = document.getElementById('chunk-info');
    const chunkSizeBtn = document.getElementById('chunk-size-btn');
    const chunkSizeModal = document.getElementById('chunk-size-modal');
    const saveChunkSizeBtn = document.getElementById('save-chunk-size');
    const chunkSizeInput = document.getElementById('chunk-size-input');
    const closeChunkSizeModal = document.querySelector('.close-chunk-size');
    const cardInner = document.getElementById('card-inner'); // Added for flip animation

    let kanjiList = [];
    let currentKanji = null;
    let noIdeaList = [];
    let seenButNoIdeaList = [];
    let rememberedList = [];
    let currentSetTitle = 'please choose a kanji set below or add your own to start studying';
    let savedSets = {};
    let predefinedSets = {};
    let currentReviewKanji = null;
    let cardStats = JSON.parse(localStorage.getItem('cardStats')) || {};

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
        const set = savedSets[currentSetTitle.split(' (Part')[0]];
        if (set) {
            chunkInfo.textContent = `Part ${set.currentChunkIndex + 1} of ${set.chunks.length}`;
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
    }

    // Function to enable the buttons
    function enableButtons() {
        noIdeaButton.disabled = false;
        seenButNoIdeaButton.disabled = false;
        rememberedButton.disabled = false;
    }

    // Show the reading and meaning by flipping the card
    function showReadingAndMeaning() {
        if (!currentKanji) return;
        readingDisplay.textContent = currentKanji.reading;
        meaningDisplay.textContent = currentKanji.meaning;
        exampleDisplay.innerHTML = currentKanji.examples && currentKanji.examples.length > 0 
            ? currentKanji.examples.join('<br>') 
            : '';
        cardInner.classList.add('flipped');
        nextButton.style.display = 'block';
    }

    // Hide the reading and meaning by unflipping the card
    function hideReadingAndMeaning() {
        cardInner.classList.remove('flipped');
        nextButton.style.display = 'none';
    }

    // Update Progress Bar with spaced repetition stats
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

    // Spaced repetition logic: Get next Kanji based on review intervals
    function getNextKanji() {
        const now = Date.now();
        const dueCards = noIdeaList.concat(seenButNoIdeaList)
            .map(card => ({
                card,
                stats: cardStats[card.kanji] || { interval: 0, lastReviewed: null }
            }))
            .filter(item => !item.stats.lastReviewed || (now - item.stats.lastReviewed >= item.stats.interval * 24 * 60 * 60 * 1000));

        if (dueCards.length > 0) {
            return dueCards[Math.floor(Math.random() * dueCards.length)].card;
        }
        if (noIdeaList.length > 0) return noIdeaList[0];
        if (seenButNoIdeaList.length > 0) return seenButNoIdeaList[0];
        return null;
    }

    // Display the next Kanji
    function displayKanji() {
        currentKanji = getNextKanji();
        if (currentKanji) {
            kanjiDisplay.textContent = currentKanji.kanji;
            hideReadingAndMeaning();
        } else {
            kanjiDisplay.textContent = 'Nothing to review!';
            readingDisplay.textContent = '';
            meaningDisplay.textContent = '';
            exampleDisplay.textContent = '';
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
        localStorage.setItem('cardStats', JSON.stringify(cardStats));
        updateProgress();
        const progressData = {
            kanjiList,
            noIdeaList,
            seenButNoIdeaList,
            rememberedList,
            currentSetTitle,
            savedSets,
            cardStats
        };
        localStorage.setItem('userProgress', JSON.stringify(progressData));
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
            cardStats = progressData.cardStats || {};
            updateProgress();
            displayKanji();
            renderSavedSets();
            renderKanjiLists();
        }
    }

    function renderKanjiLists() {
        document.getElementById('no-idea-list').innerHTML = noIdeaList.map(k => `<li>${k.kanji}</li>`).join('');
        document.getElementById('seen-but-no-idea-list').innerHTML = seenButNoIdeaList.map(k => `<li>${k.kanji}</li>`).join('');
        document.getElementById('remembered-list').innerHTML = rememberedList.map(k => `<li>${k.kanji}</li>`).join('');
    }

    // Function to move a kanji to a specific list with spaced repetition
    function moveKanjiToList(kanji, targetList) {
        noIdeaList = noIdeaList.filter(k => k.kanji !== kanji.kanji);
        seenButNoIdeaList = seenButNoIdeaList.filter(k => k.kanji !== kanji.kanji);
        rememberedList = rememberedList.filter(k => k.kanji !== kanji.kanji);
        if (!targetList.some(k => k.kanji === kanji.kanji)) {
            targetList.push(kanji);
        }
        if (targetList === noIdeaList || targetList === seenButNoIdeaList) {
            shuffleArray(targetList);
        }
        renderKanjiLists();
        if (!cardStats[kanji.kanji]) {
            cardStats[kanji.kanji] = { interval: 0, lastReviewed: null };
        }
        cardStats[kanji.kanji].lastReviewed = Date.now();
        if (targetList === rememberedList) {
            cardStats[kanji.kanji].interval = cardStats[kanji.kanji].interval ? cardStats[kanji.kanji].interval * 2 : 1;
        } else if (targetList === noIdeaList) {
            cardStats[kanji.kanji].interval = 0;
        } else if (targetList === seenButNoIdeaList) {
            cardStats[kanji.kanji].interval = 0.5;
        }
    }

    // Handle "No Idea" button click
    noIdeaButton.addEventListener('click', () => {
        if (!currentKanji) return;
        moveKanjiToList(currentKanji, noIdeaList);
        currentReviewKanji = currentKanji;
        disableButtons();
        saveData();
        showReadingAndMeaning();
    });

    // Handle "Seen but No Idea" button click
    seenButNoIdeaButton.addEventListener('click', () => {
        if (!currentKanji) return;
        moveKanjiToList(currentKanji, seenButNoIdeaList);
        currentReviewKanji = currentKanji;
        disableButtons();
        saveData();
        showReadingAndMeaning();
    });

    // Handle "Remembered" button click
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

    // Flip card on Kanji click
    kanjiDisplay.addEventListener('click', () => {
        if (!cardInner.classList.contains('flipped') && currentKanji) {
            showReadingAndMeaning();
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
            const [kanjiData, examples] = line.split('#');
            const parts = kanjiData.split(',');
            if (parts.length >= 3) {
                const kanji = parts[0].trim();
                const reading = parts[1].trim();
                const meaning = parts.slice(2).join(',').trim();
                if (kanji && reading && meaning) {
                    newKanjiList.push({
                        kanji,
                        reading,
                        meaning,
                        examples: examples ? examples.split('\n') : []
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
        prevChunkButton.style.display = show ? 'inline-block' : 'none';
        nextChunkButton.style.display = show ? 'inline-block' : 'none';
    }

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
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
            const currentSetTitleBase = currentSetTitle.split(' (Part')[0];
            const currentSet = savedSets[currentSetTitleBase];
            if (currentSet) {
                currentSet.noIdeaList = noIdeaList;
                currentSet.seenButNoIdeaList = seenButNoIdeaList;
                currentSet.rememberedList = rememberedList;
                const newChunks = splitIntoChunks(currentSet.kanjiList, newSize);
                currentSet.chunks = newChunks;
                loadChunk(currentSetTitleBase, currentSet.currentChunkIndex);
            }
        }
    });

    window.addEventListener('click', (event) => {
        if (event.target === chunkSizeModal) {
            chunkSizeModal.style.display = 'none';
        }
    });

    chunkSizeInput.value = localStorage.getItem('chunkSize') || 30;

    // Load a set into the system
    function loadSet(set) {
        const chunkSize = parseInt(localStorage.getItem('chunkSize')) || 30;
        const chunks = splitIntoChunks(set.kanjiList, chunkSize);
        savedSets[set.title] = {
            title: set.title,
            chunks: chunks.map(chunk => shuffleArray(chunk)),
            currentChunkIndex: 0,
            noIdeaList: [],
            seenButNoIdeaList: [],
            rememberedList: []
        };
        toggleNavigationButtons(chunks.length > 1);
        loadChunk(set.title, 0);
        renderKanjiLists();
    }

    function loadChunk(setTitle, chunkIndex) {
        const set = savedSets[setTitle];
        if (!set || chunkIndex >= set.chunks.length) return;
        set.currentChunkIndex = chunkIndex;
        kanjiList = shuffleArray(set.chunks[chunkIndex]);
        noIdeaList = [...kanjiList];
        seenButNoIdeaList = [];
        rememberedList = [];
        currentSetTitle = `${set.title} (Part ${chunkIndex + 1})`;
        setTitleDisplay.textContent = currentSetTitle;
        updateProgress();
        displayKanji();
        enableButtons();
    }

    // Render saved sets
    function renderSavedSets() {
        savedSetsList.innerHTML = '';
        for (const [name, set] of Object.entries(savedSets)) {
            const li = document.createElement('li');
            li.textContent = name;
            li.addEventListener('click', () => {
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
            const response = await fetch('predefined-kanji-sets.json');
            if (!response.ok) throw new Error('Failed to fetch predefined kanji sets.');
            predefinedSets = await response.json();
            const groupedSets = groupSetsByPrefix(predefinedSets);
            generateDropdowns(groupedSets);
        } catch (error) {
            console.error('Error loading predefined sets:', error);
            predefinedSets = {};
        }
    }

    function toggleSpoilers() {
        const spoilerButtons = document.querySelectorAll('.spoiler-button');
        spoilerButtons.forEach(button => {
            button.addEventListener('click', (event) => {
                event.preventDefault();
                event.stopPropagation();
                const spoiler = button.parentElement;
                spoiler.classList.toggle('open');
            });
        });
    }

    function handlePredefinedSetSubmission() {
        document.getElementById('predefined-kanji-sets').addEventListener('click', (event) => {
            if (event.target.classList.contains('submit-predefined')) {
                const dropdown = event.target.previousElementSibling;
                const selectedSet = dropdown.value;
                if (selectedSet && predefinedSets[selectedSet]) {
                    loadPredefinedSet(selectedSet);
                }
            }
        });
    }

    function groupSetsByPrefix(sets) {
        const groupedSets = {};
        Object.keys(sets).forEach((setKey) => {
            const prefix = setKey.split(' ')[0];
            if (!groupedSets[prefix]) groupedSets[prefix] = [];
            groupedSets[prefix].push(setKey);
        });
        return groupedSets;
    }

    function addEventListenersToButtons() {
        const kanjiSetSelects = document.querySelectorAll('.kanji-set-select');
        const submitPredefinedButtons = document.querySelectorAll('.submit-predefined');
        submitPredefinedButtons.forEach((button, index) => {
            button.addEventListener('click', () => {
                const selectedSet = kanjiSetSelects[index].value;
                if (selectedSet && predefinedSets[selectedSet]) {
                    loadPredefinedSet(selectedSet);
                }
            });
        });
    }

    toggleSpoilers();

    function generateDropdowns(groupedSets) {
        const predefinedSetsContainer = document.getElementById('predefined-kanji-sets');
        predefinedSetsContainer.innerHTML = '';
        Object.keys(groupedSets).forEach((prefix) => {
            const setGroup = document.createElement('div');
            setGroup.className = 'set-group';
            const setTitle = document.createElement('div');
            setTitle.className = 'set-title';
            setTitle.textContent = prefix.toUpperCase();
            setGroup.appendChild(setTitle);
            const dropdownContainer = document.createElement('div');
            dropdownContainer.className = 'dropdown-container';
            const select = document.createElement('select');
            select.className = 'kanji-set-select';
            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.textContent = 'Select a set';
            select.appendChild(defaultOption);
            groupedSets[prefix].forEach((setKey) => {
                const option = document.createElement('option');
                option.value = setKey;
                option.textContent = setKey.replace(/([A-Z])/g, ' $1').trim();
                select.appendChild(option);
            });
            dropdownContainer.appendChild(select);
            const loadButton = document.createElement('button');
            loadButton.className = 'submit-predefined';
            loadButton.textContent = 'Load';
            dropdownContainer.appendChild(loadButton);
            setGroup.appendChild(dropdownContainer);
            predefinedSetsContainer.appendChild(setGroup);
        });
        addEventListenersToButtons();
        toggleSpoilers();
    }

    function loadPredefinedSet(setKey) {
        const lines = predefinedSets[setKey];
        const newKanjiList = [];
        lines.forEach(line => {
            const [kanjiData, examples] = line.split('#');
            const parts = kanjiData.split(',');
            if (parts.length >= 3) {
                const kanji = parts[0].trim();
                const reading = parts[1].trim();
                const meaning = parts.slice(2).join(',').trim();
                if (kanji && reading && meaning) {
                    newKanjiList.push({
                        kanji,
                        reading,
                        meaning,
                        examples: examples ? examples.split('\n') : []
                    });
                }
            }
        });
        if (newKanjiList.length === 0) return;
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
        const numberOfChunks = Math.ceil(totalKanji / maxChunkSize);
        const baseChunkSize = Math.floor(totalKanji / numberOfChunks);
        const remainder = totalKanji % numberOfChunks;
        const chunks = [];
        let startIndex = 0;
        for (let i = 0; i < numberOfChunks; i++) {
            const chunkSize = baseChunkSize + (i < remainder ? 1 : 0);
            const chunk = kanjiList.slice(startIndex, startIndex + chunkSize);
            chunks.push(chunk);
            startIndex += chunkSize;
        }
        return chunks;
    }

    // Initial setup
    loadData();
    fetchPredefinedSets();
    setTitleDisplay.textContent = currentSetTitle;
    updateProgress();
    renderSavedSets();
    displayKanji();
    handlePredefinedSetSubmission();
});