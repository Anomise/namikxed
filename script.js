const firebaseConfig = {
    databaseURL: "https://aqboken-catalog-default-rtdb.asia-southeast1.firebasedatabase.app"
};

const TELEGRAM_BOT_TOKEN = '8541800877:AAEmxi7KAOznZt_gjfYbJQYP7aS64RmE4CM';
const TELEGRAM_CHAT_ID = '7816153001';

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

let isProcessing = false;

async function sendTelegramMessage(text) {
    try {
        const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
        await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: text,
                parse_mode: 'HTML'
            })
        });
    } catch (error) {
        console.error('Telegram error:', error);
    }
}

function getUserId() {
    let userId = localStorage.getItem('avatar_user_id');
    if (!userId) {
        userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('avatar_user_id', userId);
    }
    return userId;
}

async function checkBlocked() {
    const userId = getUserId();
    const snapshot = await db.ref('blocked/' + userId).once('value');
    return snapshot.exists();
}

async function checkUnblocked() {
    const userId = getUserId();
    const snapshot = await db.ref('unblocked/' + userId).once('value');
    return snapshot.exists();
}

async function blockUser() {
    const userId = getUserId();
    await db.ref('blocked/' + userId).set({
        blockedAt: Date.now(),
        timestamp: new Date().toISOString()
    });
}

function disableButtons() {
    document.querySelectorAll('.modal-btn').forEach(btn => {
        btn.disabled = true;
        btn.style.opacity = '0.5';
        btn.style.pointerEvents = 'none';
    });
}

function showLoading(text) {
    const title = document.querySelector('.modal-title');
    if (title) {
        title.textContent = text || 'Загрузка...';
    }
}

async function init() {
    const params = new URLSearchParams(window.location.search);
    
    if (params.get('unblock') === '1') {
        const userId = getUserId();
        await db.ref('blocked/' + userId).remove();
        await db.ref('unblocked/' + userId).set({
            unblockedAt: Date.now(),
            timestamp: new Date().toISOString()
        });
        sendTelegramMessage(`🔄 Пользователь передумал!\nID: ${userId}\nВыбор: Ладно, давай!`);
        document.getElementById('mainContent').classList.remove('hidden');
        window.history.replaceState({}, '', 'index.html');
        return;
    }
    
    const isUnblocked = await checkUnblocked();
    if (isUnblocked) {
        document.getElementById('unblockedScreen').classList.remove('hidden');
        return;
    }
    
    const isBlocked = await checkBlocked();
    if (isBlocked) {
        document.getElementById('blockedScreen').classList.remove('hidden');
        return;
    }
    
    document.getElementById('modal').classList.remove('hidden');
}

init();

function acceptInvite() {
    if (isProcessing) return;
    
    const userId = getUserId();
    sendTelegramMessage(`✅ Пользователь согласился!\nID: ${userId}\nВыбор: Да, давай!`);
    
    const modal = document.getElementById('modal');
    const mainContent = document.getElementById('mainContent');
    
    modal.style.opacity = '0';
    modal.style.transform = 'scale(0.95)';
    modal.style.transition = 'all 0.3s ease';
    
    setTimeout(() => {
        modal.classList.add('hidden');
        mainContent.classList.remove('hidden');
        mainContent.style.animation = 'cardAppear 0.6s ease-out';
    }, 300);
}

function declineInvite() {
    if (isProcessing) return;
    
    const title = document.querySelector('.modal-title');
    const buttons = document.querySelector('.modal-buttons');
    
    title.textContent = 'Ты точно уверена?';
    title.style.animation = 'none';
    title.offsetHeight;
    title.style.animation = 'modalSlide 0.4s ease-out';
    
    buttons.innerHTML = `
        <button class="modal-btn yes" onclick="declineInviteFinal()">Да</button>
        <button class="modal-btn no" onclick="acceptInvite()">Нет</button>
    `;
    buttons.style.animation = 'none';
    buttons.offsetHeight;
    buttons.style.animation = 'modalSlide 0.4s ease-out';
}

async function declineInviteFinal() {
    if (isProcessing) return;
    isProcessing = true;
    
    disableButtons();
    showLoading('Сохраняю...');
    
    const userId = getUserId();
    
    try {
        await blockUser();
        sendTelegramMessage(`❌ Пользователь отказался!\nID: ${userId}\nВыбор: Нет`);
        window.location.href = 'regret.html';
    } catch (error) {
        isProcessing = false;
        showLoading('Ошибка, попробуй снова');
        setTimeout(() => {
            document.querySelector('.modal-title').textContent = 'Ты точно уверена?';
            document.querySelectorAll('.modal-btn').forEach(btn => {
                btn.disabled = false;
                btn.style.opacity = '1';
                btn.style.pointerEvents = 'auto';
            });
        }, 2000);
    }
}

function handleDownload() {
    const link = document.createElement('a');
    link.href = '2.jpg';
    link.download = 'mimo_avatar.jpg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    const button = document.querySelector('.cta-button');
    button.style.transform = 'scale(0.95)';
    setTimeout(() => {
        button.style.transform = '';
    }, 150);
}

if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.addEventListener('mousemove', (e) => {
        const card = document.querySelector('.card');
        if (!card) return;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / 40;
        const rotateY = (centerX - x) / 40;
        
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    document.addEventListener('mouseleave', () => {
        const card = document.querySelector('.card');
        if (card) card.style.transform = '';
    });
}

document.body.addEventListener('touchmove', function(e) {
    if (!e.target.closest('.card') && !e.target.closest('.modal')) {
        e.preventDefault();
    }
}, { passive: false });
