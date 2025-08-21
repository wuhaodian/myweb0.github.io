document.addEventListener('DOMContentLoaded', function() {
    updateDateTime();
    setInterval(updateDateTime, 1000); 

    // 1. 表单验证
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            validateForm();
        });
    }

    // 2. 显示/隐藏演员详情
    setupActorToggles();

    // 3. 初始化剧集列表
    displayEpisodes();

    // 新增：添加到收藏夹功能
    document.getElementById('addToFavorites').addEventListener('click', function() {
        const title = document.title || "电视剧滤镜";
        const url = window.location.href;
        
        try {
            // IE浏览器
            if (window.external && ('AddFavorite' in window.external)) {
                window.external.AddFavorite(url, title);
            }
            // 其他浏览器（会显示浏览器自带的添加收藏对话框）
            else if (window.sidebar && window.sidebar.addPanel) {
                window.sidebar.addPanel(title, url, "");
            }
            // Chrome、Firefox等现代浏览器
            else {
                alert('请按 Ctrl+D (Windows) 或 ⌘+D (Mac) 将本页添加到收藏夹');
            }
        } catch (e) {
            alert('您的浏览器不支持自动添加收藏，请手动添加');
        }
    });
    
    // 新增：设为首页功能
    document.getElementById('setAsHomepage').addEventListener('click', function() {
        const url = window.location.href;
        
        try {
            // IE浏览器
            if (document.body.setHomePage) {
                document.body.setHomePage(url);
            }
            // 其他浏览器
            else {
                alert('请手动设置首页:\n1. 复制此链接: ' + url + '\n2. 打开浏览器设置\n3. 在首页设置中粘贴此链接');
            }
        } catch (e) {
            alert('您的浏览器不支持自动设为首页，请手动设置');
        }
    });
    initMouseFollow();
    initSiteSearch();
    initMemoryGame(); 
});


// 表单验证函数
function validateForm() {
    const username = document.getElementById('username');
    const email = document.getElementById('email');
    const message = document.getElementById('message');
    let isValid = true;

    // 验证用户名（非空且≤10字符）
    if (username.value.trim() === '') {
        showError('usernameError', '用户名不能为空', username);
        isValid = false;
    } else if (username.value.length > 10) {
        showError('usernameError', '用户名不能超过10个字符', username);
        isValid = false;
    } else {
        clearError('usernameError', username);
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.value)) {
        showError('emailError', '请输入有效的邮箱地址', email);
        isValid = false;
    } else {
        clearError('emailError', email);
    }

    // 验证留言（非空）
    if (message.value.trim() === '') {
        showError('messageError', '留言不能为空', message);
        isValid = false;
    } else {
        clearError('messageError', message);
    }

    // 提交成功处理
    if (isValid) {
        alert('表单提交成功！');
        contactForm.reset();
    }
}

// 显示错误信息
function showError(elementId, message, inputElement) {
    const errorElement = document.getElementById(elementId);
    errorElement.textContent = message;
    inputElement.style.borderColor = 'red';
}

// 清除错误信息
function clearError(elementId, inputElement) {
    document.getElementById(elementId).textContent = '';
    inputElement.style.borderColor = '';
}

// 演员详情切换功能
function setupActorToggles() {
    const actorHeaders = document.querySelectorAll('.actor-card h3');
    actorHeaders.forEach(header => {
        header.addEventListener('click', function() {
            const detailsId = this.getAttribute('data-target');
            const details = document.getElementById(detailsId);
            details.style.display = details.style.display === 'none' ? 'block' : 'none';
        });
    });
}

// 剧集列表数据
const episodes = [
    { title: "第1集: 初遇", date: "2025-03-01", rating: 8.5 },
    { title: "第2集: 心动", date: "2025-03-08", rating: 9.0 },
    { title: "第3集: 误会", date: "2025-03-15", rating: 8.7 }
];

// 动态渲染剧集列表
function displayEpisodes() {
    const container = document.getElementById('episodes-container');
    if (!container) return;

    container.innerHTML = episodes.map(episode => `
        <div class="episode">
            <h4>${episode.title}</h4>
            <p>播出日期: ${episode.date}</p>
            <p>评分: ${episode.rating}/10</p>
        </div>
    `).join('');
}

// 新增：更新日期时间和欢迎词函数
function updateDateTime() {
    const now = new Date();
    const dateTimeElement = document.getElementById('currentDateTime');
    const welcomeElement = document.getElementById('welcomeMessage');
    
    // 格式化日期和时间
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    };
    dateTimeElement.textContent = now.toLocaleDateString('zh-CN', options);
    
    // 根据时间显示不同的欢迎词
    const hour = now.getHours();
    let welcomeMessage = '';
    
    if (hour >= 5 && hour < 11) {
        welcomeMessage = '早上好！一起来看滤镜吧';
    } else if (hour >= 11 && hour < 13) {
        welcomeMessage = '中午好！一起来看滤镜吧';
    } else if (hour >= 13 && hour < 18) {
        welcomeMessage = '下午好！一起来看滤镜吧';
    } else if (hour >= 18 && hour < 24) {
        welcomeMessage = '晚上好！一起来看滤镜吧';
    } else {
        welcomeMessage = '夜深了，早点休息';
    }
    
    welcomeElement.textContent = welcomeMessage;
}

// 鼠标跟随特效 - 彩色气泡
function initMouseFollow() {
    const colors = ['#ff9ff3', '#feca57', '#ff6b6b', '#48dbfb', '#1dd1a1'];
    let mouseX = 0, mouseY = 0;
    let bubbles = [];
    
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        // 创建新气泡
        if (Math.random() > 0.7) {
            createBubble();
        }
    });
    
    function createBubble() {
        const bubble = document.createElement('div');
        bubble.className = 'mouse-bubble';
        
        // 随机属性
        const size = Math.random() * 30 + 10;
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        bubble.style.width = `${size}px`;
        bubble.style.height = `${size}px`;
        bubble.style.background = color;
        bubble.style.left = `${mouseX + (Math.random() * 40 - 20)}px`;
        bubble.style.top = `${mouseY + (Math.random() * 40 - 20)}px`;
        
        document.body.appendChild(bubble);
        
        // 动画
        const duration = Math.random() * 3 + 2;
        bubble.style.transition = `all ${duration}s linear`;
        
        setTimeout(() => {
            bubble.style.transform = `translate(${Math.random() * 200 - 100}px, ${Math.random() * 200 - 100}px)`;
            bubble.style.opacity = '0';
        }, 10);
        
        // 移除元素
        setTimeout(() => {
            bubble.remove();
        }, duration * 1000);
    }
}

// 站内搜索功能
function initSiteSearch() {
    const searchInput = document.getElementById('siteSearch');
    const searchBtn = document.getElementById('searchBtn');
    const resultsContainer = document.getElementById('searchResults');
    
    // 模拟网站内容（实际应用中可以从服务器获取）
    const siteContent = [
        { title: '剧集介绍', url: '#', keywords: ['剧集', '介绍', '剧情'] },
        { title: '角色介绍', url: '#', keywords: ['角色', '演员', '介绍'] },
        { title: '分集剧情', url: '#', keywords: ['分集', '剧情', '每集'] },
        { title: '幕后花絮', url: '#', keywords: ['幕后', '花絮', '拍摄'] },
        { title: '联系我们', url: 'demo1.html', keywords: ['联系', '我们', '反馈'] }
    ];
    
    function performSearch() {
        const query = searchInput.value.toLowerCase();
        if (!query) {
            resultsContainer.style.display = 'none';
            return;
        }
        
        const results = siteContent.filter(item => {
            return item.title.toLowerCase().includes(query) || 
                   item.keywords.some(kw => kw.toLowerCase().includes(query));
        });
        
        displayResults(results);
    }
    
    function displayResults(results) {
        resultsContainer.innerHTML = '';
        
        if (results.length === 0) {
            resultsContainer.innerHTML = '<div class="no-results">没有找到匹配的结果</div>';
        } else {
            results.forEach(item => {
                const resultItem = document.createElement('a');
                resultItem.href = item.url;
                resultItem.textContent = item.title;
                resultsContainer.appendChild(resultItem);
            });
        }
        
        resultsContainer.style.display = 'block';
    }
    
    searchInput.addEventListener('input', performSearch);
    searchBtn.addEventListener('click', performSearch);
    
    // 点击页面其他地方关闭搜索结果
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !resultsContainer.contains(e.target)) {
            resultsContainer.style.display = 'none';
        }
    });
}

// 记忆卡片游戏
function initMemoryGame() {
    const gameContainer = document.querySelector('.memory-game');
    if (!gameContainer) return;
    
    const restartBtn = document.getElementById('restartGame');
    const matchesDisplay = document.getElementById('matches');
    
    const icons = ['🌟', '🎬', '🎭', '🎥', '📺', '🎞️'];
    const cards = [...icons, ...icons]; // 每对卡片
    let flippedCards = [];
    let matchedPairs = 0;
    let canFlip = true;
    
    function shuffleArray(array) {
        return array.sort(() => Math.random() - 0.5);
    }
    
    function createGame() {
        gameContainer.innerHTML = '';
        flippedCards = [];
        matchedPairs = 0;
        matchesDisplay.textContent = '0';
        canFlip = true;
        
        const shuffledCards = shuffleArray(cards);
        
        shuffledCards.forEach((icon, index) => {
            const card = document.createElement('div');
            card.className = 'memory-card';
            card.dataset.index = index;
            card.dataset.icon = icon;
            
            card.addEventListener('click', flipCard);
            gameContainer.appendChild(card);
        });
    }
    
    function flipCard() {
        if (!canFlip || this.classList.contains('flipped') || this.classList.contains('matched')) {
            return;
        }
        
        this.classList.add('flipped');
        this.textContent = this.dataset.icon;
        flippedCards.push(this);
        
        if (flippedCards.length === 2) {
            canFlip = false;
            checkForMatch();
        }
    }
    
    function checkForMatch() {
        const [card1, card2] = flippedCards;
        
        if (card1.dataset.icon === card2.dataset.icon) {
            // 匹配成功
            card1.classList.add('matched');
            card2.classList.add('matched');
            matchedPairs++;
            matchesDisplay.textContent = matchedPairs;
            
            if (matchedPairs === icons.length) {
                setTimeout(() => {
                    alert('恭喜你赢了！所有卡片都匹配成功！');
                }, 500);
            }
            
            flippedCards = [];
            canFlip = true;
        } else {
            // 不匹配
            setTimeout(() => {
                card1.classList.remove('flipped');
                card2.classList.remove('flipped');
                card1.textContent = '';
                card2.textContent = '';
                flippedCards = [];
                canFlip = true;
            }, 1000);
        }
    }
    
    restartBtn.addEventListener('click', createGame);
    createGame();
}