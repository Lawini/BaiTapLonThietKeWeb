document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const loginTab = document.getElementById('login-tab');
    const registerTab = document.getElementById('register-tab');
    const message = document.getElementById('auth-message');
    const params = new URLSearchParams(window.location.search);

    function showTab(tab) {
        const registering = tab === 'register';
        loginForm.hidden = registering;
        registerForm.hidden = !registering;
        loginTab.classList.toggle('active', !registering);
        registerTab.classList.toggle('active', registering);
        loginTab.setAttribute('aria-selected', String(!registering));
        registerTab.setAttribute('aria-selected', String(registering));
        message.textContent = '';
    }
    async function submit(endpoint, form) {
        message.textContent = '';
        try {
            const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.fromEntries(new FormData(form))) });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Không thể đăng nhập.');
            if (result.user.role === 'admin') return window.location.assign('/onsale.html');
            const next = params.get('next');
            window.location.assign(next && next.startsWith('/') && !next.startsWith('//') ? next : '/datban.html');
        } catch (error) { message.textContent = error.message; }
    }
    loginTab.addEventListener('click', () => showTab('login'));
    registerTab.addEventListener('click', () => showTab('register'));
    loginForm.addEventListener('submit', event => { event.preventDefault(); submit('/api/login', loginForm); });
    registerForm.addEventListener('submit', event => { event.preventDefault(); submit('/api/register', registerForm); });
    if (params.get('mode') === 'register') showTab('register');
});
