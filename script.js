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

    // Function to disable the buttons
    function disableButtons() {
        noIdeaButton.disabled = true;
        seenButNoIdeaButton.disabled = true;
        rememberedButton.disabled = true;
        console.log('Buttons disabled'); // Debugging
    }

    // Function to enable the buttons
    function enableButtons() {
        noIdeaButton.disabled = false;
        seenButNoIdeaButton.disabled = false;
        rememberedButton.disabled = false;
        console.log('Buttons enabled'); // Debugging
    }

    // Show the reading and meaning of the current Kanji
    function showReadingAndMeaning() {
        if (!currentKanji) {
            console.log('No current kanji to show details for.'); // Debugging
            return;
        }
        readingDisplay.textContent = currentKanji.reading;
        meaningDisplay.textContent = currentKanji.meaning;
        readingMeaningDiv.style.display = 'block';
    }

    // Hide the reading and meaning
    function hideReadingAndMeaning() {
        readingMeaningDiv.style.display = 'none';
    }

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
            hideReadingAndMeaning(); // Hide details for the next Kanji
        } else {
            kanjiDisplay.textContent = 'No more kanji to review!';
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
    }

    // Handle "No Idea" button click
    noIdeaButton.addEventListener('click', () => {
        if (!currentKanji) {
            console.log('No current kanji to add to No Idea list.'); // Debugging
            return;
        }
        noIdeaList.push(currentKanji);
        disableButtons(); // Disable buttons immediately
        showReadingAndMeaning();
        saveData();
    });

    // Handle "Seen but No Idea" button click
    seenButNoIdeaButton.addEventListener('click', () => {
        if (!currentKanji) {
            console.log('No current kanji to add to Seen but No Idea list.'); // Debugging
            return;
        }
        seenButNoIdeaList.push(currentKanji);
        disableButtons(); // Disable buttons immediately
        showReadingAndMeaning();
        saveData();
    });

    // Handle "Remembered" button click
    rememberedButton.addEventListener('click', () => {
        if (!currentKanji) {
            console.log('No current kanji to add to Remembered list.'); // Debugging
            return;
        }
        rememberedList.push(currentKanji);
        disableButtons(); // Disable buttons immediately
        showReadingAndMeaning();
        saveData();
    });

    // Handle "Next" button click
    nextButton.addEventListener('click', () => {
        enableButtons(); // Enable buttons immediately
        hideReadingAndMeaning();
        saveData();
        displayKanji();
    });

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

    // Display the next Kanji
    function displayKanji() {
        const kanji = getNextKanji();
        if (kanji) {
            kanjiDisplay.textContent = kanji.kanji;
            hideReadingAndMeaning(); // Ensure buttons are enabled for the next Kanji
        } else {
            kanjiDisplay.textContent = 'No more kanji to review!';
            hideReadingAndMeaning();
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
        week81: `
            著書, ちょしょ, tác phẩm
            独創的な・ユニークな, どくそうてき, tác phẩm độc đáo
            原文のニュアンス, げんぶんのニュアンス, sắc thái của bản gốc
            詩を朗読する, しをろうどく, ngâm thơ
書評を読む, しょひょうをよむ, đọc bài bình phẩm về cuốn sách
戯曲, ぎきょく, kịch
文庫本, ぶんこぼん, thể loại sách nhỏ viết theo chiều dọc
重厚な曲, じゅうこうなきょく, ca khúc trang nghiêm, hào hùng
軽快な曲, けいかいなきょく, ca khúc vui nhộn, tươi vui
音楽一筋に打ち込む, おんがくひとすじにうちこむ, tập trung toàn bộ sức lực cho âm nhạc
美しい音色が響く, うつくしいねいろがひびく, âm sắc tuyệt hảo vang lên
音が反響する, おとがはんきょうする, âm thanh vọng lại
楽譜をめくる, がくふをめくる, lật trang nhạc phổ
歌の一節を口ずさむ, うたのいっせつをくちずさむ, hát thầm một đoạn nhạc
盛大な拍手が沸き起こる, せいだいなはくしゅがわきおこる, tràng vỗ tay rộn ràng, lớn vang lên
繊細な作風, せんさいなさくふう, tác phong tinh tế
大胆な作風, だいたんなさくふう, tác phong táo bạo
丁寧な描写, ていねいなびょうしゃ, miêu tả một cách chỉnh chu
壮大な建築物, そうだいなけんちくぶつ, công trình kiến trúc hùng vĩ
画廊で個展を開く, がろうでこてんをひらく, mở triển lãm cá nhân tại khu triển lãm
手芸, しゅげい, nghề thủ công
織物, おりもの, vải dệt
意図を読み取る, いとをよみとる, nắm bắt được ý đồ
茶道を嗜む, さどうをたしなむ, hứng thú, yêu thích trà đạo
オペラを鑑賞する, オペラをかんしょうする, thưởng thức opera
客席ががらんとしていた, きゃくせきががらんとしていた, trống trải, rộng mênh mông
試合を観戦する, しあいをかんせんする, quan sát trận đấu
巧みな戦術, たくみなせんじゅつ, chiến thuật tinh vi
作戦を制する, さくせんをせいする, kiểm soát kế hoạch tác chiến
チームの結束・連帯, ちーむのけっそく・れんたい, mối liên kết giữa các thành viên trong đội
成績が不振, せいせきがふしん, thành tích không tốt
人材を育成する・養成する, じんざいをいくせいする・ようせいする, nuôi dưỡng nguồn nhân lực
強豪を相手に健闘する・奮闘する, きょうごうをあいてにけんとうする・ふんとうする, lấy đội cực mạnh làm đối thủ để chiến đấu
意気込む, いきごむ, hăng hái, hào hứng

        `,
        week82: `
            自己利益の追求, じこりえきのついきゅう, theo đuổi lợi ích cá nhân  
衝き動く, つきうごく, kích thích, thúc giục  
散々働く, さんざんはたらく, làm việc chăm chỉ  
問い直す, といなおす, tự đặt câu hỏi và suy nghĩ, xem xét lại vấn đề  
享受する, きょうじゅする, hưởng, thừa hưởng  
確実, かくじつ, chắc chắn  
幸運, こううん, may mắn  
願望を実現する, がんぼうをじつげんする, thực hiện mong ước, nguyện vọng  
不況, ふきょう, khủng hoảng kinh tế, tình hình kinh tế trì trệ  
ボランタリーな活動, ボランタリーなかつどう, hoạt động tình nguyện  
に向かう, にむかう, hướng đến, tiến đến  
アクロポリス, アクロポリス, thành cổ Hy Lạp  
柱, はしら, cột, cây cột  
死海の水につける, しかいのみずにつける, ngâm (mình, chân..) vào trong biển chết  
イスラエル, イスラエル, nước Israel  
ピラミッド, ピラミッド, kim tự tháp  
ガンジスを下る, ガンジスをくだる, sông Hằng ở Ấn Độ  
きりがない, きりがない, vô tận, không kết thúc  
表層的理由づけ, ひょうそうてきりゆうづけ, biện minh, lý do trên bề mặt  
動機, どうき, lý do, động cơ (hành động), duyên cớ  
存在理由, そんざいりゆう, lý do tồn tại  
不快感を与える, ふかいかんをあたえる, mang đến cảm giác không thoải mái, khó chịu  
束縛, そくばく, trói buộc, ràng buộc  
せずにはいられない, せずにはいられない, không thể không, không khỏi cảm thấy  
好意, こうい, lòng tốt, thiện chí  
押し付け, おしつけ, áp đặt/đùn đẩy việc cho người khác  
強制, きょうせい, cưỡng chế, bắt buộc  
無理強い, むりじい, ép buộc  
束縛, そくばく, trói buộc, ràng buộc  
窮屈, きゅうくつ, cảm giác bó buộc, miễn cưỡng/cứng nhắc/tình trạng khốn khó  
陶芸家, とうげいか, thợ gốm  
命じる, めいじる, bắt, lệnh, ra lệnh, bổ nhiệm  
あれこれ, あれこれ, cái này cái kia/tất cả  
罵声を浴びせられる, ばせいをあびせられる, bị la ó, cười nhạo  
充実感, じゅうじつかん, cảm giác đủ đầy, viên mãn, trọn vẹn  
ひたすら, ひたすら, toàn tâm toàn ý, hết sức/khẩn khoản, tha thiết  
図式, ずしき, sơ đồ  
弟子入り, でしいり, bái sư  
師匠, ししょう, sư phụ  
宿命, しゅくめい, số mệnh  

        `

    };

    let token = null;

    // Login Function
    document.getElementById('login-btn').addEventListener('click', async () => {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const response = await fetch('http://localhost:5000/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });
        const data = await response.json();
        if (response.ok) {
            token = data.token;
            alert('Login successful');
            loadProgress();
        } else {
            alert('Login failed');
        }
    });

    // Register Function
    document.getElementById('register-btn').addEventListener('click', async () => {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const response = await fetch('http://localhost:5000/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });
        if (response.ok) {
            alert('Registration successful');
        } else {
            alert('Registration failed');
        }
    });

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

    rememberedButton.addEventListener('click', () => {
        rememberedList.push(currentKanji);
        showReadingAndMeaning();
        saveProgress();
    });
    // Initial setup
    setTitleDisplay.textContent = currentSetTitle;
    updateProgress();
    renderSavedSets();
    displayKanji();
});