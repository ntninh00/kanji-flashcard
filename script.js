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
        week51: `
        
        `,
        week61: `
        木の葉, このは, lá cây  
砂浜, すなはま, bãi cát  
家中, いえじゅう, trong nhà  
ひざ掛け, ひざがけ, chăn đắp vào chân (đùi) khi ngồi  
防寒, ぼうかん, chống lạnh  
与党＜＝＞野党, よとう＜＝＞やとう, đảng cầm quyền => đảng đối lập  
盛り付ける, もりつける, bày biện, trang trí món ăn  
研ぐ, とぐ, mài, giũa (dao), (vo gạo)  
浸す, ひたす, nhúng vào (nước), đắm chìm trong (niềm vui...)  
水気, みずけ, nước (nước bám trên các đồ vật)  
拭き取る, ふきとる, lau  
小麦粉, こむぎこ, bột mì  
練る, ねる, nhào (trộn), trau dồi, hoạch định (chiến lược...)  
染み込む, しみこむ, thấm vào, ngấm vào  
添える, そえる, thêm vào  
フィルターで濾す, フィルターでこす, lọc bằng màng lọc  
⼿際, てぎわ, tay nghề  
腕前, うでまえ, trình độ, kỹ năng, kỹ thuật  
素材を吟味する, そざいをぎんみする, lựa chọn nguyên liệu kỹ càng  
恵み, めぐみ, ân huệ, ưu ái  
名産・特産, めいさん・とくさん, đặc sản  
着⾊料, ちゃくしょくりょう, phẩm màu, màu thực phẩm  
なめる・しゃぶる・くわえる, liếm/mút, hút/ngậm  
かみ切る, かみきる, cắt, thái  
飲み込む, のみこむ, nuốt/hiểu, khả năng tiếp thu nhanh  
うどんをすする, うどんをすする, húp mì udon (có phát ra tiếng soàn soạt)  
旬の食材, しゅんのしょくざい, nguyên liệu theo mùa  
本場, ほんば, bản xứ/hương vị đích thực, đậm chất (nói về món ăn)  
あっさり, vị thanh đạm  
こってり, vị béo, đậm đà  
甘口, あまくち, vị ngọt/lời nịnh hót, lời ngon ngọt  
辛口, からくち, vị cay/lời khó nghe, gay gắt  
甘酸っぱい, あまずっぱい, vị chua ngọt/buồn vui lẫn lộn, ngọt ngào cay đắng  
生臭い, なまぐさい, mùi tanh  
香ばしい, こうばしい, mùi thơm, thơm phức  
焦げ臭い, こげくさい, mùi khét, cháy két  
屋敷の外観, やしきのがいかん, nhìn từ bên ngoài của biệt phủ  
照明に凝る, しょうめいにこる, tập trung vào ánh sáng  
軋む, きしむ, tiếng cót két  
家を新築する, いえをしんちくする, xây nhà mới  
壊れた家を再建する, こわれたいえをさいけんする, xây dựng lại căn nhà bị hư hỏng  
壊れた家を補強する, こわれたいえをほきょうする, tăng cường, gia cố căn nhà bị hư hỏng  
改修する, かいしゅうする, cải tạo, sửa chữa (tòa nhà)  
首都圏, しゅとけん, khu vực thủ đô  
沿線, えんせん, dọc tuyến đường  
徒歩, とほ, đi bộ  
住居を構える, じゅうきょをかまえる, nơi ở/dựng, lập  
⼾締り, とじまり, khóa cửa, chốt cửa  
居住者, きょじゅうしゃ, người cư trú  
結成する, けっせいする, thành lập (công đoàn)  
待ち望む, まちのぞむ, kỳ vọng, mong chờ cái gì đó  
⼦どもをしつける, こどもをしつける, dạy dỗ, giáo dục trẻ con  
健やか, すこやか, khỏe mạnh, khỏe khoắn, lành mạnh  
育ち盛り, そだちざかり, dậy thì, giai đoạn tăng trưởng của trẻ đang tuổi lớn  
頭を悩ます, あたまになやます, lo lắng, đau đầu về vấn đề gì đó  
吸い取る, すいとる, hút/hấp thu  
香辛料, こうしんりょう, gia vị (dùng để tạo màu, vị cay, mùi cho thức ăn...)  
調味料, ちょうみりょう, đồ gia vị  
放り込む, ほうりこむ, nhét vào, ném vào, tống vào, đẩy vào  
食べ盛り, たべざかり, ăn ngon miệng, ăn khỏe, đang tuổi ăn tuổi lớn  
働き盛り, はたらきざかり, thời kỳ đỉnh cao của sự nghiệp, phong độ đỉnh cao, rực rỡ nhất  
てきぱき, tháo vát, nhanh chóng  
ずるずる, húp, uống soàn soạt/lê mề, trì trệ  
保存料, ほぞんりょう, chất bảo quản  
いっそ, thà rằng, đành rằng  
手が出ない, てがでない, ngoài tầm với, không đủ khả năng, quá khả năng, không thể với tới  
内装, ないそう, nội thất (nhà cửa)  
念願, ねんがん, tâm nguyện, điều mình ao ước  

        `,
        week6dokkai: `
        宝⽯箱, ほうせきばこ, hộp trang sức, đá quý  
そうはいかない, điều đó sẽ không xảy ra  
横わたる, よこわたる, nằm, trải dài  
秘密めく, ひみつめく, có vẻ bí mật (có cảm giác, đầy mùi, sặc mùi..)  
⼼打たれる, こころうたれる, rung động, xúc động  
掠れ気味, かすれぎみ, có chút mơ hồ  
盗み聞き, ぬすむぎき, nghe lén, nghe trộm  
⽤⼼, ようじん, thận trọng, cẩn thận  
裏庭, うらにわ, vườn sau nhà  
⽚隅, かたすみ, góc, góc khuất  
ひっそりと湧き出す, ひっそりとわきだす, trào dâng một cách lặng lẽ  
泉の底に沈める, いずみのそこにしずめる, chìm sâu đáy của con suối  
疲れ果てる, つかれはてる, mệt rã rời, phờ phạc, vô cùng mệt  
ほとり, vùng  
掬い上げる, すくいあげる, múc, vớt  
掌, てのひら, lòng bàn tay  
⼈間の営み, にんげんのいとなみ, hoạt động của con người  
荒野, こうや, vùng hoang vu  
誰かの温もり, だれかのぬくもり, hơi ấm của ai đó  
画期, かっき, bước ngoặt  
啓蒙的な知識人たち, けいもうてきなちしきじんたち, những nhà tri thức khai sáng (tư tưởng, kiến thức..)  
社会的な覚醒, しゃかいてきなかくせい, thức tỉnh xã hội  
地位向上, ちいこうじょう, nâng cao địa vị  
自認する, じにんする, tự thừa nhận, tự chấp nhận  
解明的な女性論, かいめいてきなじょせいろん, thuyết phụ nữ được làm sáng tỏ  
社会進出, しゃかいしんしゅつ, tiến bộ xã hội  
受け入れる, うけいれる, tiếp nhận, chấp nhận  
精神的な土壌, せいしんてきなどじょう, nền tảng tinh thần  
新しい層, あたらしいそう, tầng lớp mới  
刊行する, かんこうする, phát hành  
自身の内面的な覚醒, じしんのないめんてきなかくせい, thức tỉnh nội tâm bên trong bản thân  
促す, うながす, thúc giục, thúc đẩy, khuyến khích  
文壇, ぶんだん, giới văn học  

        `,
        week62: `
        刈る, かる, cắt, gọt, tỉa  
釣る, つる, câu cá  
撮る, とる, chụp ảnh  
振る, ふる, vẫy, rắc, chỉ định (công việc)  
彫る, ほる, khắc, chạm, tạc  
盛る, もる, làm đầy, đổ đầy, phục vụ  
⾄る, いたる, đạt đến, đạt tới, tới nơi  
劣る, おとる, kém, yếu thế, thấp kém  
飾る, かざる, trang trí, tô điểm, trang hoàng  
腐る, くさる, thiu, hỏng (đồ ăn)  
削る, けずる, gọt, bào, cắt  
茂る, しげる, rậm rạp, um tùm, xanh tốt  
縛る, しばる, buộc, trói, ràng buộc  
絞る, しぼる, vắt (chanh, giẻ lau), giới hạn (phạm vi, mục tiêu)  
滑る, すべる, trơn, trượt (tuyết)  
迫る, せまる, cưỡng bức, tiến sát, gấp gáp  
黙る, だまる, im lặng, làm thinh  
殴る, なぐる, đánh  
握る, にぎる, nắm (tay)  
濁る, にごる, đục (nước)  
巡る, めぐる, dạo quanh, đi quanh  
潜る, もぐる, nhảy lao đầu xuống, lặn, trải qua  
譲る, ゆずる, nhường  
謝る, あやまる, tạ lỗi  
偏る, かたよる, thiên lệch, mất cân bằng  
透き通る, すきとおる, trong suốt, trong vắt  
煮る, にる, nấu  
診る, みる, chẩn đoán, khám bệnh  
飽きる, あきる, chán, ngán  
飢える, うえる, thèm, khát, đói  
殖える, ふえる, tăng, nhân lên  
訴える, うったえる, kiện tụng  
蓄える, たくわえる, tích trữ  
掛ける, かける, treo  
避ける, さける, tránh, lảng tránh  
漬ける, つける, ngâm, tẩm, ướp, muối dưa  
怠ける, なまける, lười biếng  
揚げる, あげる, thả, kéo (cờ), rán (tempura)  
焦げる, こげる, cháy, khê  
妨げる, さまたげる, gây trở ngại, cản trở  
載せる, のせる, chất (lên xe), đăng tải (báo)  
慌てる, あわてる, hoảng, bối rối, luống cuống  
隔てる, へだてる, phân chia, ngăn cách, cách biệt  
企てる, くわだてる, dự tính, lên kế hoạch  
兼ねる, かねる, kiêm nhiệm, kết hợp  
跳ねる, はねる, bắn lên, nhảy, kết thúc  
尋ねる, たずねる, hỏi, thăm hỏi  
締める, しめる, thắt, vặn chặt  
攻める, せめる, tấn công  
褒める, ほめる, khen ngợi, tán dương  
納める, おさめる, nộp, thu, cất giữ, tiếp thu  
勧める, すすめる, gợi ý, khuyên, khuyến khích  
眺める, ながめる, nhìn, ngắm  
慰める, なぐさめる, an ủi, động viên  
揺れる, ゆれる, rung, lắc, lay động  

        `,
        week71: `
        装飾, そうしょく, trang trí  
名高い, なだかい, nổi tiếng  
エリック・ギル, エリック・ギル, eric gill  
種族, しゅぞく, bộ lạc, loài, chủng tộc  
人間が人間たる所以, にんげんがにんげんたるゆえん, bởi vì nếu đã là con người  
気の向くままに, きのむくままに, theo hứng, tùy theo cảm xúc  
パラドックス＝逆説, ぎゃくせつ, nghịch lý  
連想, れんそう, liên tưởng  
果たして, はたして, quả thật là, liệu rằng  
解放する, かいほうする, giải phóng, tháo gỡ  
及ぶ, およぶ, ảnh hưởng/không bằng/lan ra  
間食, かんしょく, ăn vặt, ăn giữa buổi (sáng~trưa/tối~khuya)  
我ながら焦ったい, わながらじれったい, tự cảm thấy bản thân rất vội vàng, thiếu kiên nhẫn  
引っ込み思案, ひっこみじあん, e dè, rụt rè, thụ động  
気が小さい, きがちいさい, nhút nhát/nhỏ mọn, hẹp hòi  
度胸, どきょう, can đảm, dũng cảm  
循環論, じゅんかんろん, thuyết tuần hoàn  
反語, はんご, từ trái nghĩa  
皮膚, ひふ, da, lớp da  
個体意識, こたいいしき, ý thức cá nhân  
錯覚, さっかく, nhầm tưởng, ảo tưởng  
近所付き合い, きんじょづきあい, quan hệ hàng xóm láng giềng  
引きこもり, ひきこもり, tự kỷ, tự nhốt mình trong phòng, không giao thiệp với xã hội  
欠如する, けつじょする, thiếu  
災害弱者, さいがいじゃくしゃ, người dễ tổn thương/yếu đuối do thiên tai  
施行, しこうする・せこう, thi hành, tiến hành, thực hiện  
実情, じつじょう, tình hình thực tế, thực trạng/thực tâm, thật lòng  
レム睡眠, レムすいみん, giấc ngủ nông, không sâu  
瞼がピクピクする, まぶたがピクピクする, mí mắt co giật  
自然忘却, しぜんぼうきゃく, lãng quên tự nhiên, quên lãng  
気分爽快, きぶんそうかい, cảm giác/tinh thần sảng khoái  
広々として, ひろびろとして, rộng rãi, nhiều không gian trống  
妨げる, さまたげる, gây trở ngại, ảnh hưởng  
寝覚が悪く、頭が重い, ねざめがわるく、あたまがおもい, trằn trọc khó ngủ, nên đầu nặng trĩu  
病気に⽴ち向かう, びょうきにたちむかう, chống chọi với bệnh tật  
病気の兆候に気づく, びょうきのちょうこうにきづく, chú ý đến triệu chứng của bệnh  
持病がある, じびょうがある, bệnh mãn tính  
体の不調を訴える, からだのふちょうをうったえる, chịu đựng, cảm nhận được sự bất ổn của cơ thể  
栄養失調になる, えいようしっちょうになる, bị suy dinh dưỡng  
先天的な病気, せんてんてきなびょうき, bệnh bẩm sinh  
慢性の病気, まんせいのびょうき, bệnh mãn tính  
急性の病気, きゅうせいのびょうき, bệnh cấp tính  
関節が外れる, かんせつがはずれる, trật khớp  
まぶたが腫れる, まぶたがはれる, mí mắt bị sưng  
微熱が出る, びねつがでる, bị sốt nhẹ  
便秘気味になる, べんぴぎみになる, bị táo bón  
自覚症状, じかくしょうじょう, triệu chứng bệnh tình do chính người bệnh cảm nhận như mệt mỏi, chán ăn,…  
腹痛が起こる, ふくつうがおこる, lên cơn đau bụng  
けいれんが起こる, けいれんがおこる, lên cơn co giật  
発作が起こる, ほっさがおこる, bệnh phát ra  
往診に来てもらう, おうしんにきてもらう, đến khám tại nhà  
聴診器で胸の音を聞く, ちょうしんきでむねのおとをきく, nghe âm thanh từ ngực bằng ống nghe  
点滴, てんてき, truyền dịch, truyền nước biển  
応急処置をする, おうきゅうしょちをする, xử lý khẩn cấp (người bệnh), cấp cứu  
適切な処置を取る, てきせつなしょちをとる, xử lý thích hợp  
病人を介抱する, びょうにんをかいほうする, chăm sóc người bệnh  
痛いところをさする, いたいところをさする, massage, xoa bóp chỗ đau  
痛みを和らげる, いたみをやわらげる, làm dịu chỗ đau  
面会謝絶になる, めんかいしゃぜつになる, từ chối người đến gặp, thăm  
安静を保つ, あんせいをたもつ, giữ yên tĩnh  
胃腸薬を処⽅する, いちょうやくをしょほうする, kê đơn thuốc đau dạ dày  
患部に薬を塗る, かんぶにくすりをぬる, bôi thuốc vào chỗ bị nhiễm bệnh  
薬の効き⽬が切れる, くすりのききめがきれる, hiệu quả của thuốc hết hiệu lực  
早寝早起きを⼼掛ける, はやねはやおきをこころがける, cố gắng ngủ sớm dậy sớm  
⽔分の補給を⼼掛ける, すいぶんのほきゅうをこころがける, cố gắng cung cấp đủ nước  
バランスの取れた⾷⽣活, しょくせいかつ, sinh hoạt ăn uống cân bằng  
健康を維持する, けんこうをいじする, duy trì sức khỏe  
健康を害する・損なう, けんこうをがいする・そこなう, gây tổn hại đến sức khỏe  
健康を増進する, けんこうをぞうしんする, nâng cao sức khỏe  
健康を取り戻す, けんこうをとりもどす, lấy lại, khôi phục sức khỏe  
不摂⽣な⽣活は禁物だ, ふせっせいなせいかつはきんもつだ, tránh sinh hoạt không điều độ  
頑丈そうな体つき, がんじょうそうなからだつき, cơ thể rắn chắc  

        `,
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