document.addEventListener('DOMContentLoaded', () => {
    const kanjiDisplay = document.getElementById('kanji');
    const readingDisplay = document.getElementById('reading');
    const meaningDisplay = document.getElementById('meaning');
    const noIdeaButton = document.getElementById('no-idea');
    const seenButNoIdeaButton = document.getElementById('seen-but-no-idea');
    const rememberedButton = document.getElementById('remembered');
    const nextButton = document.getElementById('next');
    const kanjiInput = document.getElementById('kanji-input');
    const submitButton = document.getElementById('submit');
    const readingMeaningDiv = document.getElementById('reading-meaning');

    let kanjiList = [];
    let currentKanji = null;
    let noIdeaList = [];
    let seenButNoIdeaList = [];
    let rememberedList = [];

    // Load data from local storage
    if (localStorage.getItem('kanjiList')) {
        kanjiList = JSON.parse(localStorage.getItem('kanjiList'));
        noIdeaList = JSON.parse(localStorage.getItem('noIdeaList')) || [];
        seenButNoIdeaList = JSON.parse(localStorage.getItem('seenButNoIdeaList')) || [];
        rememberedList = JSON.parse(localStorage.getItem('rememberedList')) || [];
    }

    function saveData() {
        localStorage.setItem('kanjiList', JSON.stringify(kanjiList));
        localStorage.setItem('noIdeaList', JSON.stringify(noIdeaList));
        localStorage.setItem('seenButNoIdeaList', JSON.stringify(seenButNoIdeaList));
        localStorage.setItem('rememberedList', JSON.stringify(rememberedList));
    }

    function getNextKanji() {
        if (noIdeaList.length > 0) {
            currentKanji = noIdeaList.shift();
        } else if (seenButNoIdeaList.length > 0) {
            currentKanji = seenButNoIdeaList.shift();
        } else if (rememberedList.length > 0) {
            currentKanji = rememberedList.shift();
        } else {
            currentKanji = null;
        }
        return currentKanji;
    }

    function displayKanji() {
        const kanji = getNextKanji();
        if (kanji) {
            kanjiDisplay.textContent = kanji.kanji;
            readingMeaningDiv.style.display = 'none';
        } else {
            kanjiDisplay.textContent = 'No more kanji to review!';
            readingMeaningDiv.style.display = 'none';
        }
    }

    function showReadingAndMeaning() {
        readingDisplay.textContent = currentKanji.reading;
        meaningDisplay.textContent = currentKanji.meaning;
        readingMeaningDiv.style.display = 'block';
    }

    noIdeaButton.addEventListener('click', () => {
        noIdeaList.push(currentKanji);
        showReadingAndMeaning();
    });

    seenButNoIdeaButton.addEventListener('click', () => {
        seenButNoIdeaList.push(currentKanji);
        showReadingAndMeaning();
    });

    rememberedButton.addEventListener('click', () => {
        rememberedList.push(currentKanji);
        showReadingAndMeaning();
    });

    nextButton.addEventListener('click', () => {
        saveData();
        displayKanji();
    });

    submitButton.addEventListener('click', () => {
        const lines = kanjiInput.value.split('\n');
        lines.forEach(line => {
            const [kanji, reading, meaning] = line.split(',').map(item => item.trim());
            if (kanji && reading && meaning) {
                kanjiList.push({ kanji, reading, meaning });
                noIdeaList.push({ kanji, reading, meaning });
            }
        });
        kanjiInput.value = '';
        saveData();
        displayKanji();
    });

    displayKanji();
});