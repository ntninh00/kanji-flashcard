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
    const resetProgressButton = document.getElementById('reset-progress'); // New reset button

    let kanjiList = [];
    let currentKanji = null;
    let noIdeaList = [];
    let seenButNoIdeaList = [];
    let rememberedList = [];
    let currentSetTitle = 'None';
    let savedSets = {};


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
            hideReadingAndMeaning();
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
        rememberedList.push(currentKanji);
        disableButtons();
        showReadingAndMeaning();
        saveData();
    });

    // Handle "Next" button click
    nextButton.addEventListener('click', () => {
        enableButtons();
        hideReadingAndMeaning();
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

    // Handle pre-defined set submission
    submitPredefinedButton.addEventListener('click', () => {
        const selectedSet = kanjiSetSelect.value;
        if (selectedSet && predefinedSets[selectedSet]) {
            const lines = predefinedSets[selectedSet].split('\n');
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
        week72: `
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
棄却, ききゃく, bác bỏ
偽装, ぎそう, ngụy trang, cải trang
解毒, げどく, giải độc
懸念, けねん, lo lắng, lo sợ
下落, げらく, sụt giảm
個室, こしつ, phòng riêng
挫折, ざせつ, sụp đổ, thất bại
左遷, させん, giáng chức, hạ bậc
作動, さどう, thao tác, sử dụng (máy móc)
自炊, じすい, tự nấu
自重, じちょう, tự trọng
遮断, しゃだん, ngắt, làm gián đoạn
授与, じゅよ, trao tặng
受領, じゅりょう, nhận lãnh, tiếp nhận
是認, ぜにん, tán thành, chấp nhận
疎外, そがい, xa lánh, ghẻ lạnh
阻害, そがい, cản trở, trở ngại
遅延, ちえん, trì hoãn
波及, はきゅう, lan rộng
破綻, はたん, sụp đổ, phá sản
破滅, はめつ, tiêu tan, đổ nát
批准, ひじゅん, phê chuẩn
浮上, ふじょう, trồi lên, nổi lên
魅惑, みわく, quyến rũ, mê hoặc
癒着, ゆちゃく, dính chặt, liền lại
由来, ゆらい, nguồn gốc, gốc gác
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
婦人雑誌, ふじんざっし, tạp chí phụ nữ  
心をときめかせる, こころをときめかせる, khiến tim rung động, xao xuyến  
インテリア, インテリア, đồ nội thất  
衣食, いしょく, cái ăn cái mặc/cơm áo gạo tiền  
消費財, しょうひざい, hàng tiêu dùng  
手を伸ばす, てをのばす, lấn sân sang, làm thử những việc chưa từng làm  
胸がむかつく, むねがむかつく, ợ chua, đầy bụng  
満杯, まんぱい, chật cứng, đầy  
マイホーム, マイホーム, nhà riêng  
所得階層, しょとくかいそう, tầng lớp thu nhập  
プラント（観葉植物）, かんようしょくぶつ, thực vật, cây cối  
可動な室内装飾品, かどうなしつないそうしょくひん, đồ trang trí nội thất có thể di chuyển được  
安価, あんか, giá rẻ, rẻ tiền  
裁判官, さいばんかん, thẩm phán  
に基づく, にもとづく, dựa vào/dựa trên  
生の要求, なまのようきゅう, yêu cầu, kỳ vọng sống sót của một người  
区別する, くべつする, phân biệt  
中枢, ちゅうすう, trung khu, trung tâm  
気にする, きにする, bận tâm đến, để ý đến  
宮殿, きゅうでん, cung điện  
前庭, ぜんてい, sân trước  
揃い, そろい, bộ, đôi (n+揃い=> hoàn toàn là, tất cả là...)  
フード付き, フードつき, ~có mũ  
厚手のヤッケ, あつでのヤッケ, áo khoác ngoài, áo gió dày  
殺到する, さっとうする, dồn dập, chen lấn  
だらしない, だらしない, lôi thôi, luộm thuộm  
厳寒, げんかん, giá lạnh, rét buốt  
屋外, おくがい, ngoài trời  
立ち止まる, たちどまる, đứng lại, dừng lại  
異様, いよう, kỳ quặc, kỳ lạ  
目を丸くする, めをまるくする, mắt tròn xoe vì ngạc nhiên, bất ngờ  
オーバーを着こむ, オーバーをきこむ, mặc thêm áo khoác ngoài  
容姿, ようし, dáng vẻ, phong thái  
不幸感, ふこうかん, cảm giác bất hạnh  
自尊心, じそんしん, lòng tự tôn, tự trọng, kiêu hãnh  
直視する, ちょくしする, nhìn thẳng, đối mặt  
責任を押し付ける, せきにんをおしつける, đổ trách nhiệm  
同様, どうよう, tương tự, giống  
自己憐憫, じこれんびん, tự cảm thấy mình đáng thương, tự thương hại mình, tủi thân  
心のアンテナ, こころのアンテナ, tín hiệu con tim  
内向き, うちむき, hướng nội  
自分の苦悩, じぶんのくのう, phiền não của bản thân  
〜Vますの消し＋かねません, 〜Vますのけし＋かねません, có thể, e rằng, nguy cơ một điều gì đó dẫn đến kết quả, sự việc không tốt  
心を閉ざす, こころをとざす, khép, đóng trái tim mình lại  
抽象的な面, ちゅうしょうてきなめん, mặt trừu tượng  
比喩, ひゆ, ẩn dụ  


        `
    };

    let token = null;
    // Reset Progress Button
    resetProgressButton.addEventListener('click', resetProgress);
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

    // Reset Progress Button
    resetProgressButton.addEventListener('click', resetProgress);

    // Initial setup
    loadData(); // Load saved progress on page load
    setTitleDisplay.textContent = currentSetTitle;
    updateProgress();
    renderSavedSets();
    displayKanji();
});