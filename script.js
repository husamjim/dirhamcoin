const apiUrl = 'http://144.126.201.180:3000';
const tg = window.Telegram.WebApp;
tg.ready();
const telegramId = tg.initDataUnsafe.user ? tg.initDataUnsafe.user.id.toString() : 'test_user';
let user = {
    balance: 0,
    dailyMined: 0,
    maxDaily: 1,
    referrals: 0
};

// إخفاء شاشة التحميل
function hideLoading() {
    console.log('Hiding loading screen...');
    document.getElementById('loading').style.display = 'none';
    document.getElementById('main-container').style.display = 'block';
}

// عرض رسالة
function showMessage(message) {
    console.log('Message:', message);
    tg.showAlert(message);
}

// تحميل بيانات المستخدم
async function initUser() {
    try {
        console.log('Fetching user data for telegramId:', telegramId);
        const response = await fetch(`${apiUrl}/user/${telegramId}`);
        const data = await response.json();
        console.log('User data:', data);
        if (data.success) {
            user.balance = data.balance || 0;
            user.dailyMined = data.dailyMined || 0;
            user.maxDaily = data.maxDaily || 1;
            user.referrals = data.referrals || 0;
            showSection('mine');
        } else {
            showMessage(data.message || 'خطأ في استرجاع البيانات');
        }
    } catch (error) {
        console.error('Init user error:', error);
        showMessage('خطأ في استرجاع البيانات');
    }
}

// عرض القسم المحدد
function showSection(section) {
    console.log('Showing section:', section);
    const content = document.getElementById('content');
    content.innerHTML = '';

    switch (section) {
        case 'mine':
            content.innerHTML = `
                <div class="counter">
                    تم تعدين اليوم: ${user.dailyMined.toFixed(2)} / ${user.maxDaily.toFixed(2)} DRM
                </div>
                <button class="tap-btn" onclick="tapMine()"></button>
                <button onclick="claimGift()">استلم هديتك (2 DRM)</button>
            `;
            break;
        case 'earn':
            content.innerHTML = `
                <div class="tasks-container">
                    <h3>المهام المتاحة</h3>
                    <div class="task">
                        <img src="https://i.postimg.cc/mh3DKMjb/tasks.png" alt="مهمة" onerror="this.src='https://via.placeholder.com/30'">
                        <p>أكمل مهمة يومية (مكافأة: 0.2 DRM)</p>
                        <button onclick="completeTask('daily')">أكمل المهمة</button>
                    </div>
                    <div class="task">
                        <img src="https://i.postimg.cc/mh3DKMjb/tasks.png" alt="مهمة" onerror="this.src='https://via.placeholder.com/30'">
                        <p>أكمل مهمة شريك (مكافأة: 0.5 DRM)</p>
                        <button onclick="completeTask('partner')">أكمل المهمة</button>
                    </div>
                </div>
            `;
            break;
        case 'refer':
            const referLink = `https://t.me/DirhamBot?start=ref${telegramId}`;
            content.innerHTML = `
                <div class="refer-container">
                    <div class="refer-left">
                        <div class="refer-box">
                            <img src="https://telegram.org/img/t_logo.png" alt="تلغرام" onerror="this.src='https://via.placeholder.com/50'">
                            <p>ادعِ أصدقاءك واربح 0.5 DRM + 10% زيادة تعدين</p>
                        </div>
                        <div class="refer-link">
                            <input type="text" value="${referLink}" readonly>
                            <img src="https://i.postimg.cc/Wdz1Dyv3/link.png" alt="رابط" onclick="copyReferLink('${referLink}')" onerror="this.src='https://via.placeholder.com/40'">
                        </div>
                    </div>
                    <div class="refer-right">
                        <div class="friends-list">
                            <h3>الأصدقاء المحالون</h3>
                            <p>عدد الأصدقاء: ${user.referrals}</p>
                            <p>حد التعدين اليومي: ${user.maxDaily.toFixed(2)} DRM</p>
                        </div>
                    </div>
                </div>
            `;
            break;
        case 'stake':
            content.innerHTML = `
                <div class="stake-container">
                    <h3>الستيكينغ</h3>
                    <p>رصيدك الحالي: ${user.balance.toFixed(2)} DRM</p>
                    <input type="number" id="stakeAmount" placeholder="أدخل الكمية للستيكينغ" min="0" step="0.1">
                    <button onclick="stake()">ستيك الآن</button>
                </div>
            `;
            break;
        case 'wallet':
            content.innerHTML = `
                <div class="wallet-container">
                    <h3>المحفظة</h3>
                    <p>الرصيد: ${user.balance.toFixed(2)} DRM</p>
                    <input type="number" id="withdrawAmount" placeholder="أدخل الكمية للسحب" min="0" step="0.1">
                    <button onclick="withdraw()">سحب</button>
                </div>
            `;
            break;
    }
}

// التعدين
async function tapMine() {
    if (user.dailyMined >= user.maxDaily) {
        showMessage('لقد وصلت إلى الحد الأقصى للتعدين اليومي!');
        return;
    }
    const tapBtn = document.querySelector('.tap-btn');
    tapBtn.classList.add('spinning');
    try {
        console.log('Mining for telegramId:', telegramId);
        const response = await fetch(`${apiUrl}/mine`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ telegramId })
        });
        const data = await response.json();
        console.log('Mine response:', data);
        if (data.success) {
            user.balance = data.balance;
            user.dailyMined = data.dailyMined;
            user.maxDaily = data.maxDaily;
            showMessage('تم التعدين بنجاح!');
            showSection('mine');
        } else {
            showMessage(data.message);
        }
    } catch (error) {
        console.error('Mine error:', error);
        showMessage('خطأ أثناء التعدين');
    } finally {
        setTimeout(() => tapBtn.classList.remove('spinning'), 10000);
    }
}

// استلام الهدية الترحيبية
async function claimGift() {
    try {
        console.log('Claiming gift for telegramId:', telegramId);
        const response = await fetch(`${apiUrl}/claimGift`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ telegramId })
        });
        const data = await response.json();
        console.log('Claim gift response:', data);
        if (data.success) {
            user.balance = data.balance;
            showMessage('تم استلام الهدية الترحيبية: 2 DRM!');
            showSection('mine');
        } else {
            showMessage(data.message);
        }
    } catch (error) {
        console.error('Claim gift error:', error);
        showMessage('خطأ أثناء استلام الهدية');
    }
}

// إكمال المهام
async function completeTask(taskType) {
    try {
        console.log('Completing task:', taskType, 'for telegramId:', telegramId);
        const response = await fetch(`${apiUrl}/completeTask`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ telegramId, taskType })
        });
        const data = await response.json();
        console.log('Complete task response:', data);
        if (data.success) {
            user.balance = data.balance;
            showMessage(`تم إكمال المهمة '${taskType}' بنجاح!`);
            showSection('earn');
        } else {
            showMessage(data.message);
        }
    } catch (error) {
        console.error('Complete task error:', error);
        showMessage('خطأ أثناء إكمال المهمة');
    }
}

// نسخ رابط الإحالة
function copyReferLink(link) {
    navigator.clipboard.writeText(link).then(() => {
        showMessage('تم نسخ رابط الإحالة!');
    }).catch(err => {
        console.error('Copy link error:', err);
        showMessage('خطأ أثناء نسخ الرابط');
    });
}

// الستيكينغ
async function stake() {
    const amount = document.getElementById('stakeAmount').value;
    if (!amount || amount <= 0) {
        showMessage('يرجى إدخل كمية صالحة للستيكينغ!');
        return;
    }
    try {
        console.log('Staking amount:', amount, 'for telegramId:', telegramId);
        const response = await fetch(`${apiUrl}/stake`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ telegramId, amount })
        });
        const data = await response.json();
        console.log('Stake response:', data);
        if (data.success) {
            user.balance = data.balance;
            showMessage(`تم الستيكينغ بنجاح! الكمية: ${amount} DRM`);
            showSection('stake');
        } else {
            showMessage(data.message);
        }
    } catch (error) {
        console.error('Stake error:', error);
        showMessage('خطأ أثناء الستيكينغ');
    }
}

// السحب
async function withdraw() {
    const amount = document.getElementById('withdrawAmount').value;
    if (!amount || amount <= 0) {
        showMessage('يرجى إدخل كمية صالحة للسحب!');
        return;
    }
    try {
        console.log('Withdrawing amount:', amount, 'for telegramId:', telegramId);
        const response = await fetch(`${apiUrl}/withdraw`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ telegramId, amount })
        });
        const data = await response.json();
        console.log('Withdraw response:', data);
        if (data.success) {
            user.balance = data.balance;
            showMessage(`تم السحب بنجاح! الكمية: ${amount} DRM`);
            showSection('wallet');
        } else {
            showMessage(data.message);
        }
    } catch (error) {
        console.error('Withdraw error:', error);
        showMessage('خطأ أثناء السحب');
    }
}

// تهيئة التطبيق
window.onload = function() {
    console.log('App loading...');
    setTimeout(() => {
        console.log('App loaded, initializing user...');
        hideLoading();
        initUser();
    }, 3000);
};