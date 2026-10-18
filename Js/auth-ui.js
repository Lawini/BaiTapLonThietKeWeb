document.addEventListener('DOMContentLoaded', async () => {
    const accountLink = document.getElementById('account-link');
    const navList = document.querySelector('.nav-item ul');
    if (!accountLink || !navList) return;
    try {
        const response = await fetch('/api/me', { cache: 'no-store' });
        const { user } = await response.json();
        if (!user) return;
        accountLink.textContent = user.name;
        accountLink.removeAttribute('href');
        accountLink.classList.add('account-name');
        if (user.role === 'admin') {
            const item = document.createElement('li');
            const link = document.createElement('a');
            link.href = '/onsale.html';
            link.textContent = 'Doanh thu';
            item.appendChild(link);
            navList.insertBefore(item, accountLink.closest('li'));
        }
        const logoutItem = document.createElement('li');
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'logout-button';
        button.textContent = 'Đăng xuất';
        button.addEventListener('click', async () => { await fetch('/api/logout', { method: 'POST' }); window.location.assign('/trangchu.html'); });
        logoutItem.appendChild(button);
        navList.appendChild(logoutItem);
    } catch { /* Public pages remain available when the account status endpoint is unavailable. */ }
});
