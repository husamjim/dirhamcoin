function showMessage(message) {
    const popup = document.getElementById('popup');
    const popupMessage = document.getElementById('popupMessage');
    popupMessage.textContent = message;
    popup.style.display = 'block';
}

function closePopup() {
    document.getElementById('popup').style.display = 'none';
}

async function initUser() {
    try {
        const telegramId = window.Telegram.WebApp.initDataUnsafe.user?.id?.toString() || 'test_user';
        console.log('جارٍ جلب بيانات المستخدم لـ:', telegramId);
        const response = await fetch(`http://144.126.201.180/user/${telegramId}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        if (!response.ok) {
            console.error('خطأ في استجابة /user:', response.status, response.statusText);
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        console.log('البيانات المستلمة:', data);
        if (data.success) {
            user.balance = data.balance;
            user.dailyMined = data.dailyMined;
            user.maxDaily = data.maxDaily;
            user.referrals = data.referrals;
            showSection('mine');
        } else {
            console.error('فشل استرجاع البيانات:', data.message);
            showMessage(data.message || 'خطأ في استرجاع البيانات');
            showSection('mine');
        }
    } catch (error) {
        console.error('خطأ في initUser:', error);
        showMessage('حدث خطأ أثناء التهيئة. تحقق من اتصال الشبكة.');
        showSection('mine');
    }
}

async function tapMine() {
    try {
        const telegramId = window.Telegram.WebApp.initDataUnsafe.user?.id?.toString() || 'test_user';
        console.log('جارٍ التعدين لـ:', telegramId);
        const response = await fetch('http://144.126.201.180/mine', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ telegramId })
        });
        if (!response.ok) {
            console.error('خطأ في استجابة /mine:', response.status, response.statusText);
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        console.log('استجابة التعدين:', data);
        if (data.success) {
            user.dailyMined = data.dailyMined;
            user.balance = data.balance;
            document.querySelector('.counter').innerText = `تم تعدين اليوم: ${user.dailyMined.toFixed(0)} / ${user.maxDaily.toFixed(0)} DRM`;
            const tapBtn = document.querySelector('.tap-btn');
            tapBtn.classList.add('spinning');
            setTimeout(() => tapBtn.classList.remove('spinning'), 10000);
            tapBtn.disabled = true;
            showMessage('تم التعدين بنجاح! لقد حصلت على 1 DRM لهذا اليوم.');
            showSection('mine');
        } else {
            showMessage(data.message || 'خطأ أثناء التعدين');
        }
    } catch (error) {
        console.error('خطأ في tapMine:', error);
        showMessage('حدث خطأ أثناء التعدين. تحقق من اتصال الشبكة.');
    }
}

async function claimGift() {
    try {
        const telegramId = window.Telegram.WebApp.initDataUnsafe.user?.id?.toString() || 'test_user';
        console.log('جارٍ استلام الهدية لـ:', telegramId);
        const response = await fetch('http://144.126.201.180/claimGift', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ telegramId })
        });
        if (!response.ok) {
            console.error('خطأ في استجابة /claimGift:', response.status, response.statusText);
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        console.log('استجابة استلام الهدية:', data);
        if (data.success) {
            user.balance = data.balance;
            showMessage('تم استلام الهدية الترحيبية: 2 DRM!');
        } else {
            showMessage(data.message || 'خطأ في استلام الهدية');
        }
    } catch (error) {
        console.error('خطأ في claimGift:', error);
        showMessage('حدث خطأ أثناء استلام الهدية. تحقق من اتصال الشبكة.');
    }
}

async function referFriend() {
    try {
        const telegramId = window.Telegram.WebApp.initDataUnsafe.user?.id?.toString() || 'test_user';
        const refereeId = prompt('أدخل معرف Telegram للشخص المحال:');
        if (refereeId) {
            console.log('جارٍ إحالة صديق:', { referrerId: telegramId, refereeId });
            const response = await fetch('http://144.126.201.180/refer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ referrerId: telegramId, refereeId })
            });
            if (!response.ok) {
                console.error('خطأ في استجابة /refer:', response.status, response.statusText);
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            console.log('استجابة الإحالة:', data);
            if (data.success) {
                user.referrals += 1;
                user.maxDaily = data.maxDaily;
                showMessage('تمت الإحالة بنجاح! مكافأتك: 0.5 DRM');
                showSection('refer');
            } else {
                showMessage(data.message || 'خطأ في الإحالة');
            }
        }
    } catch (error) {
        console.error('خطأ في referFriend:', error);
        showMessage('حدث خطأ أثناء الإحالة. تحقق من اتصال الشبكة.');
    }
}

async function completeTask(taskType) {
    try {
        const telegramId = window.Telegram.WebApp.initDataUnsafe.user?.id?.toString() || 'test_user';
        console.log('جارٍ إكمال المهمة:', taskType, 'لـ:', telegramId);
        const response = await fetch('http://144.126.201.180/task', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ telegramId, taskType })
        });
        if (!response.ok) {
            console.error('خطأ في استجابة /task:', response.status, response.statusText);
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        console.log('استجابة إكمال المهمة:', data);
        if (data.success) {
            user.balance = data.balance;
            showMessage(`تم إكمال المهمة '${taskType}' بنجاح! تمت إضافة المكافأة إلى رصيدك.`);
            showSection('earn');
        } else {
            showMessage(data.message || 'خطأ في إكمال المهمة');
        }
    } catch (error) {
        console.error('خطأ في completeTask:', error);
        showMessage('حدث خطأ أثناء إكمال المهمة. تحقق من اتصال الشبكة.');
    }
}

async function stake() {
    try {
        const telegramId = window.Telegram.WebApp.initDataUnsafe.user?.id?.toString() || 'test_user';
        const amount = document.getElementById('stakeAmount').value;
        if (!amount || amount <= 0) {
            showMessage('يرجى إدخال كمية صالحة للستيكينغ!');
            return;
        }
        console.log('جارٍ الستيكينغ:', amount, 'لـ:', telegramId);
        const response = await fetch('http://144.126.201.180/stake', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ telegramId, amount })
        });
        if (!response.ok) {
            console.error('خطأ في استجابة /stake:', response.status, response.statusText);
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        console.log('استجابة الستيكينغ:', data);
        if (data.success) {
            user.balance = data.balance;
            showMessage(`تم الستيكينغ بنجاح! الكمية: ${amount} DRM`);
            showSection('stake');
        } else {
            showMessage(data.message || 'خطأ في الستيكينغ');
        }
    } catch (error) {
        console.error('خطأ في stake:', error);
        showMessage('حدث خطأ أثناء الستيكينغ. تحقق من اتصال الشبكة.');
    }
}

async function withdraw() {
    try {
        const telegramId = window.Telegram.WebApp.initDataUnsafe.user?.id?.toString() || 'test_user';
        const amount = document.getElementById('withdrawAmount').value;
        if (!amount || amount <= 0) {
            showMessage('يرجى إدخل كمية صالحة للسحب!');
            return;
        }
        console.log('جارٍ السحب:', amount, 'لـ:', telegramId);
        const response = await fetch('http://144.126.201.180/withdraw', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ telegramId, amount })
        });
        if (!response.ok) {
            console.error('خطأ في استجابة /withdraw:', response.status, response.statusText);
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        console.log('استجابة السحب:', data);
        if (data.success) {
            user.balance = data.balance;
            showMessage(`تم السحب بنجاح! الكمية: ${amount} DRM`);
            showSection('wallet');
        } else {
            showMessage(data.message || 'خطأ في السحب');
        }
    } catch (error) {
        console.error('خطأ في withdraw:', error);
        showMessage('حدث خطأ أثناء السحب. تحقق من اتصال الشبكة.');
    }
}

function showSection(section) {
    const content = document.getElementById('content');
    content.innerHTML = '';
    switch (section) {
        case 'mine':
            const isMiningDisabled = user.dailyMined >= user.maxDaily;
            content.innerHTML = `
                <div class="counter">
                    تم تعدين اليوم: ${user.dailyMined.toFixed(0)} / ${user.maxDaily.toFixed(0)} DRM
                </div>
                <button class="tap-btn" onclick="tapMine()" ${isMiningDisabled ? 'disabled' : ''}></button>
                <button onclick="claimGift()">استلم هديتك (2 DRM)</button>
            `;
            break;
        case 'earn':
            content.innerHTML = `
                <div class="tasks-container">
                    <h3>المهام المتاحة</h3>
                    <div class="task">
                        <img src="https://i.postimg.cc/mh3DKMjb/tasks.png" alt="مهمة">
                        <p>أكمل مهمة يومية (مكافأة: 0.2 DRM)</p>
                        <button onclick="completeTask('daily')">أكمل المهمة</button>
                    </div>
                    <div class="task">
                        <img src="https://i.postimg.cc/mh3DKMjb/tasks.png" alt="مهمة">
                        <p>أكمل مهمة شريك (مكافأة: 0.5 DRM)</p>
                        <button onclick="completeTask('partner')">أكمل المهمة</button>
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
        case 'refer':
            const referLink = window.Telegram.WebApp.initDataUnsafe.user
                ? `https://t.me/DirhamBot?start=ref${window.Telegram.WebApp.initDataUnsafe.user.id}`
                : 'https://t.me/DirhamBot?start=ref12345';
            content.innerHTML = `
                <div class="refer-container">
                    <div class="refer-left">
                        <div class="refer-box">
                            <img src="https://telegram.org/img/t_logo.png" alt="تلغرام">
                            <p>ادعِ أصدقاءك واربح 0.5 DRM + 10% زيادة تعدين</p>
                            <button onclick="referFriend()">إحالة صديق</button>
                        </div>
                        <div class="refer-link">
                            <input type="text" value="${referLink}" readonly>
                            <img src="https://i.postimg.cc/Wdz1Dyv3/link.png" alt="نسخ" onclick="copyReferLink('${referLink}')">
                        </div>
                    </div>
                    <div class="refer-right">
                        <div class="friends-list">
                            <h3>الأصدقاء المحالون</h3>
                            <p>عدد الأصدقاء: ${user.referrals}</p>
                            <p>حد التعدين اليومي: ${user.maxDaily.toFixed(0)} DRM</p>
                        </div>
                    </div>
                </div>
            `;
            break;
    }
}

function copyReferLink(link) {
    navigator.clipboard.writeText(link).then(() => {
        showMessage('تم نسخ رابط الإحالة!');
    });
}

window.onload = function () {
    console.log('بدء التحميل...');
    if (window.Telegram.WebApp) {
        window.Telegram.WebApp.ready();
    }
    setTimeout(() => {
        console.log('انتهى التحميل، تشغيل initUser...');
        document.getElementById('loading').style.display = 'none';
        document.getElementById('main-container').style.display = 'block';
        initUser();
    }, 500);
};

let user = {
    balance: 0,
    dailyMined: 0,
    maxDaily: 1,
    referrals: 0
};