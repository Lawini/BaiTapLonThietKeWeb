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
        if (window.location.protocol === 'file:') {
            message.textContent = 'Không thể tạo tài khoản khi mở file trực tiếp. Hãy chạy máy chủ rồi mở http://127.0.0.1:3000/dangnhap.html.';
            return;
        }

        try {
            const apiUrl = new URL(endpoint, window.location.origin);
            const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.fromEntries(new FormData(form))) });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Không thể đăng nhập.');
            const next = params.get('next');
            if (result.user.role === 'admin') {
                window.location.assign(new URL('onsale.html', window.location.href).href);
                return;
            }
            const nextPage = next && !next.startsWith('/') && !next.startsWith('\\') && !next.includes('://')
                ? next
                : 'datban.html';
            window.location.assign(new URL(nextPage, window.location.href).href);
        } catch (error) {
            message.textContent = error instanceof TypeError
                ? 'Không kết nối được máy chủ. Hãy chạy node server.js trong thư mục dự án rồi mở http://127.0.0.1:3000.'
                : error.message;
        }
    }
    loginTab.addEventListener('click', () => showTab('login'));
    registerTab.addEventListener('click', () => showTab('register'));
    loginForm.addEventListener('submit', event => { event.preventDefault(); submit('/api/login', loginForm); });
    registerForm.addEventListener('submit', event => { event.preventDefault(); submit('/api/register', registerForm); });
    if (params.get('mode') === 'register') showTab('register');
});
