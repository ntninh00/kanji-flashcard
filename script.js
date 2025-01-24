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
    const kanjiSetSelect = document.getElementById('kanji-set-select');
    const submitPredefinedButton = document.getElementById('submit-predefined');
    const savedSetsList = document.getElementById('saved-sets-list');
    const readingMeaningDiv = document.getElementById('reading-meaning');
    const noIdeaCountDisplay = document.getElementById('no-idea-count');
    const seenButNoIdeaCountDisplay = document.getElementById('seen-but-no-idea-count');
    const rememberedCountDisplay = document.getElementById('remembered-count');
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');
    const spoilerButtons = document.querySelectorAll('.spoiler-button');
    const darkModeToggle = document.getElementById('dark-mode');

    let kanjiList = [];
    let currentKanji = null;
    let noIdeaList = [];
    let seenButNoIdeaList = [];
    let rememberedList = [];
    let currentSetTitle = 'None';
    let savedSets = {};

    // Load data from local storage
    if (localStorage.getItem('kanjiList')) {
        kanjiList = JSON.parse(localStorage.getItem('kanjiList'));
        noIdeaList = JSON.parse(localStorage.getItem('noIdeaList')) || [];
        seenButNoIdeaList = JSON.parse(localStorage.getItem('seenButNoIdeaList')) || [];
        rememberedList = JSON.parse(localStorage.getItem('rememberedList')) || [];
        currentSetTitle = localStorage.getItem('currentSetTitle') || 'None';
        savedSets = JSON.parse(localStorage.getItem('savedSets')) || {};
    }

    // Dark Mode Toggle
    darkModeToggle.addEventListener('change', () => {
        document.body.classList.toggle('dark-mode');
    });

    // Update Progress Bar
    function updateProgress() {
        const total = kanjiList.length;
        const remembered = rememberedList.length;
        const progress = total > 0 ? Math.round((remembered / total) * 100) : 0;
        progressBar.value = progress;
        progressText.textContent = `${progress}%`;
        noIdeaCountDisplay.textContent = noIdeaList.length;
        seenButNoIdeaCountDisplay.textContent = seenButNoIdeaList.length;
        rememberedCountDisplay.textContent = rememberedList.length;
    }

    // Get the next Kanji to display
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

    // Display the next Kanji
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

    // Show the reading and meaning of the current Kanji
    function showReadingAndMeaning() {
        readingDisplay.textContent = currentKanji.reading;
        meaningDisplay.textContent = currentKanji.meaning;
        readingMeaningDiv.style.display = 'block';
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
    }

    // Handle "No Idea" button click
    noIdeaButton.addEventListener('click', () => {
        noIdeaList.push(currentKanji);
        showReadingAndMeaning();
        saveData();
    });

    // Handle "Seen but No Idea" button click
    seenButNoIdeaButton.addEventListener('click', () => {
        seenButNoIdeaList.push(currentKanji);
        showReadingAndMeaning();
        saveData();
    });

    // Handle "Remembered" button click
    rememberedButton.addEventListener('click', () => {
        rememberedList.push(currentKanji);
        showReadingAndMeaning();
        saveData();
    });

    // Handle "Next" button click
    nextButton.addEventListener('click', () => {
        saveData();
        displayKanji();
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
            const [kanji, reading, meaning] = line.split(',').map(item => item.trim());
            if (kanji && reading && meaning) {
                newKanjiList.push({ kanji, reading, meaning });
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

    // Handle pre-defined set submission
    submitPredefinedButton.addEventListener('click', () => {
        const selectedSet = kanjiSetSelect.value;
        if (selectedSet && predefinedSets[selectedSet]) {
            const lines = predefinedSets[selectedSet].split('\n');
            const newKanjiList = [];
            lines.forEach(line => {
                const [kanji, reading, meaning] = line.split(',').map(item => item.trim());
                if (kanji && reading && meaning) {
                    newKanjiList.push({ kanji, reading, meaning });
                }
            });

            const newSet = {
                title: `Pre-defined: ${selectedSet}`,
                kanjiList: newKanjiList,
                noIdeaList: [...newKanjiList],
                seenButNoIdeaList: [],
                rememberedList: []
            };

            loadSet(newSet);
        }
    });

    // Load a set into the system
    function loadSet(set) {
        kanjiList = set.kanjiList;
        noIdeaList = set.noIdeaList || [...set.kanjiList]; // Default to all Kanji in "No Idea" if not set
        seenButNoIdeaList = set.seenButNoIdeaList || [];
        rememberedList = set.rememberedList || [];
        currentSetTitle = set.title;
        setTitleDisplay.textContent = currentSetTitle;
        saveData();
        displayKanji();
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

    // Pre-defined Kanji sets
    const predefinedSets = {
        week7: `
            移行, いこう, di trú, chuyển tiếp
            委託, いたく, ủy thác
            違反, いはん, vi phạm
            依頼, いらい, nhờ cậy, yêu cầu
            汚染, おせん, ô nhiễm
            加減, かげん, gia giảm, điều chỉnh
            企画, きかく, kế hoạch
            棄権, きけん, bỏ phiếu trắng, hủy quyền
            記載, きさい, ghi chép, viết
            規制, きせい, quy chế
            偽造, ぎぞう, ngụy tạo, giả mạo
            誤解, ごかい, hiểu sai, hiểu lầm
            故障, こしょう, trục trặc, hỏng hóc
            誇張, こちょう, khoa trương, phóng đại
            雇用, こよう, tuyển dụng
            孤立, こりつ, cô lập
            作用, さよう, tác dụng
            飼育, しいく, chăn nuôi
            自覚, じかく, tự giác
        `,
        week8: `
            志向, しこう, chí hướng
            思考, しこう, suy nghĩ
            施行, しこう・せこう, thực hiện, thi hành
            試行, しこう, thử nghiệm
            視察, しさつ, thị sát
            辞退, じたい, từ chối, khước từ
            指摘, してき, chỉ trích
            自慢, じまん, tự mãn
            謝罪, しゃざい, tạ tội
            謝絶, しゃぜつ, cự tuyệt, từ chối
            修行, しゅぎょう, tu nghiệp, tu hành
            主張, しゅちょう, chủ trương
            主導, しゅどう, chủ đạo
            樹立, じゅりつ, thành lập
            助言, じょげん, lời khuyên
            処罰, しょばつ, xử phạt
            署名, しょめい, chữ ký, đề tên
            所有, しょゆう, sở hữu
            是正, ぜせい, sửa cho đúng, làm cho ngay ngắn
            訴訟, そしょう, kiện tụng, thưa kiện
            打開, だかい, công phá, vượt qua
            妥協, だきょう, thỏa hiệp
            把握, はあく, nắm bắt
            派遣, はけん, phái cử
            避難, ひなん, lánh nạn, tị nạn
            非難, ひなん, chỉ trích, phê bình
            披露, ひろう, công khai, tuyên bố
            疲労, ひろう, mệt mỏi
            普及, ふきゅう, phổ biến, phổ cập
            負傷, ふしょう, bị thương
            侮辱, ぶじょく, lăng mạ, xỉ nhục
            負担, ふたん, gánh vác
            赴任, ふにん, nhận chức
            腐敗, ふはい, hủ bại, mục nát
            扶養, ふよう, cấp dưỡng
            保管, ほかん, bảo quản
            補充, ほじゅう, bổ sung
            募集, ぼしゅう, chiêu mộ, tuyển mộ
            保障, ほしょう, bảo đảm
            補償, ほしょう, bồi thường
            摩擦, まさつ, ma sát
            矛盾, むじゅん, mâu thuẫn
            模索, もさく, dò dẫm
            移住, いじゅう, di trú
            依存, いぞん, dựa vào, phụ thuộc
            異動, いどう, dời chỗ, thay đổi, chuyển bộ phận
            化合, かごう, hợp chất hóa học
            加入, かにゅう, gia nhập
            議決, ぎけつ, nghị quyết
            記述, きじゅつ, viết mô tả
            寄贈, きぞう, tặng, biếu
            規定, きてい, quy định
            居住, きょじゅう, cư trú, sinh sống
            拒絶, きょぜつ, cự tuyệt
            許容, きょよう, chấp nhận, cho phép
            区画, くかく, khu đất, ngăn chia
            護衛, ごえい, bảo vệ, hộ tống
            死刑, しけい, tử hình
            辞職, じしょく, từ chức
            持続, じぞく, tiếp diễn, kéo dài
            志望, しぼう, nguyện vọng
            始末, しまつ, giải quyết, xử lý, tiết kiệm, kết cục
            主催, しゅさい, tổ chức, chủ trì
            取材, しゅざい, lấy tin tức
            所属, しょぞく, thuộc về
            除外, じょがい, ngoại trừ
            徐行, じょこう, giảm tốc độ, hãm lại
            処分, しょぶん, trừng phạt, xử lý, vứt
            自立, じりつ, tự lập
            指令, しれい, chỉ thị, mệnh lệnh
            妥結, だけつ, thỏa thuận
        `,
        week9: `
            貯蓄, ちょちく, tiết kiệm (tiền)
            治療, ちりょう, điều trị
            破壊, はかい, phá hoại
            破損, はそん, hư tổn
            破裂, はれつ, phá vỡ
            悲観, ひかん, bi quan
            否決, ひけつ, phủ quyết
            微笑, びしょう, mỉm cười
            比例, ひれい, tỉ lệ
            布告, ふこく, tuyên bố, bố cáo
            武装, ぶそう, vũ trang
            捕獲, ほかく, giành được, bắt được
            補給, ほきゅう, cung cấp thêm
            募金, ぼきん, tiền quyên góp
            舗装, ほそう, lát đường
            補足, ほそく, bổ sung
            保養, ほよう, bảo dưỡng
            模倣, もほう, mô phỏng, bắt chước
            預金, よきん, tiền gửi ngân hàng
            予言, よげん, nói trước, điềm báo trước
            移植, いしょく, cấy ghép
            遺伝, いでん, di truyền
            会釈, えしゃく, cúi đầu, cúi chào
            祈願, きがん, cầu khấn, nguyện cầu
        `
    };

    // Initial setup
    setTitleDisplay.textContent = currentSetTitle;
    updateProgress();
    renderSavedSets();
    displayKanji();
});