const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { promisify } = require('node:util');

const scrypt = promisify(crypto.scrypt);
const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const BOOKINGS_FILE = path.join(DATA_DIR, 'bookings.json');
const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || '127.0.0.1';
const SESSION_TTL_MS = 24 * 60 * 60 * 1000;
const sessions = new Map();
const MIME_TYPES = { '.css': 'text/css; charset=utf-8', '.html': 'text/html; charset=utf-8', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.js': 'text/javascript; charset=utf-8', '.png': 'image/png', '.svg': 'image/svg+xml' };

function readJson(file, fallback) {
    try { return JSON.parse(fs.readFileSync(file, 'utf8')); }
    catch (error) { if (error.code === 'ENOENT') return fallback; throw error; }
}
function writeJson(file, value) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}
function getUsers() { return readJson(USERS_FILE, []); }
function getBookings() { return readJson(BOOKINGS_FILE, []); }
async function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
    const key = await scrypt(password, salt, 64);
    return { salt, hash: key.toString('hex') };
}
async function seedAdmin() {
    const email = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
    const password = process.env.ADMIN_PASSWORD || '';
    if (!email || password.length < 12) throw new Error('Set ADMIN_EMAIL and ADMIN_PASSWORD (at least 12 characters) before starting the server.');
    const users = getUsers();
    const existing = users.find(user => user.email === email);
    const admin = { id: existing?.id || crypto.randomUUID(), name: 'Quản trị viên', email, role: 'admin', ...await hashPassword(password) };
    if (existing) users[users.indexOf(existing)] = admin;
    else users.push(admin);
    writeJson(USERS_FILE, users);
}
function sendJson(response, status, value, headers = {}) {
    response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers });
    response.end(JSON.stringify(value));
}
function readBody(request) {
    return new Promise((resolve, reject) => {
        let body = '';
        request.on('data', chunk => {
            body += chunk;
            if (body.length > 1_000_000) { reject(Object.assign(new Error('Yêu cầu quá lớn.'), { statusCode: 413 })); request.destroy(); }
        });
        request.on('end', () => {
            try { resolve(JSON.parse(body || '{}')); }
            catch { reject(Object.assign(new Error('Dữ liệu gửi lên không hợp lệ.'), { statusCode: 400 })); }
        });
        request.on('error', reject);
    });
}
function getSession(request) {
    const part = (request.headers.cookie || '').split(';').map(item => item.trim()).find(item => item.startsWith('opizza_session='));
    const token = part?.slice('opizza_session='.length);
    const session = token && sessions.get(token);
    if (!session || session.expiresAt <= Date.now()) { if (token) sessions.delete(token); return null; }
    session.expiresAt = Date.now() + SESSION_TTL_MS;
    return { token, ...session };
}
function cookie(value, maxAge) {
    const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
    return `opizza_session=${value}; HttpOnly; Path=/; SameSite=Strict; Max-Age=${maxAge}${secure}`;
}
function publicUser(user) { return { id: user.id, name: user.name, email: user.email, role: user.role }; }
function requireRole(request, response, role) {
    const session = getSession(request);
    if (!session || (role && session.role !== role)) {
        sendJson(response, session ? 403 : 401, { error: session ? 'Bạn không có quyền truy cập.' : 'Vui lòng đăng nhập.' });
        return null;
    }
    return session;
}
async function login(request, response) {
    const body = await readBody(request);
    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '');
    const user = getUsers().find(candidate => candidate.email === email);
    if (!user) {
        await hashPassword(password, 'opizza-invalid-account');
        return sendJson(response, 401, { error: 'Email hoặc mật khẩu không chính xác.' });
    }
    const candidate = await hashPassword(password, user.salt);
    const expected = Buffer.from(user.hash, 'hex');
    const actual = Buffer.from(candidate.hash, 'hex');
    if (expected.length !== actual.length || !crypto.timingSafeEqual(expected, actual)) return sendJson(response, 401, { error: 'Email hoặc mật khẩu không chính xác.' });
    const token = crypto.randomBytes(32).toString('hex');
    sessions.set(token, { userId: user.id, name: user.name, email: user.email, role: user.role, expiresAt: Date.now() + SESSION_TTL_MS });
    sendJson(response, 200, { user: publicUser(user) }, { 'Set-Cookie': cookie(token, SESSION_TTL_MS / 1000) });
}
async function register(request, response) {
    const body = await readBody(request);
    const name = String(body.name || '').trim();
    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '');
    if (name.length < 2 || name.length > 80) return sendJson(response, 400, { error: 'Tên cần có từ 2 đến 80 ký tự.' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) return sendJson(response, 400, { error: 'Email không hợp lệ.' });
    if (password.length < 8 || password.length > 128) return sendJson(response, 400, { error: 'Mật khẩu cần có từ 8 đến 128 ký tự.' });
    const users = getUsers();
    if (users.some(user => user.email === email)) return sendJson(response, 409, { error: 'Email này đã được sử dụng.' });
    const user = { id: crypto.randomUUID(), name, email, role: 'customer', ...await hashPassword(password) };
    users.push(user);
    writeJson(USERS_FILE, users);
    const token = crypto.randomBytes(32).toString('hex');
    sessions.set(token, { userId: user.id, name: user.name, email: user.email, role: user.role, expiresAt: Date.now() + SESSION_TTL_MS });
    sendJson(response, 201, { user: publicUser(user) }, { 'Set-Cookie': cookie(token, SESSION_TTL_MS / 1000) });
}
async function createBooking(request, response) {
    const session = requireRole(request, response, 'customer');
    if (!session) return;
    const body = await readBody(request);
    const restaurants = new Set(['hcm1', 'hcm2', 'hcm3', 'hcm4', 'hcm5', 'hn1', 'hn2', 'hn3', 'hn4', 'hn5', 'dn1', 'dn2', 'dn3', 'dn4', 'dn5']);
    const guests = new Set(['1', '2', '3', '4', 'more']);
    const date = String(body.date || '');
    const time = String(body.time || '');
    if (!restaurants.has(body.restaurant) || !guests.has(String(body.guests)) || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) return sendJson(response, 400, { error: 'Thông tin đặt bàn không hợp lệ.' });
    const booking = { id: crypto.randomUUID(), userId: session.userId, customerName: session.name, customerEmail: session.email, restaurant: body.restaurant, city: String(body.city || ''), guests: String(body.guests), date, time, createdAt: new Date().toISOString() };
    const bookings = getBookings();
    bookings.push(booking);
    writeJson(BOOKINGS_FILE, bookings);
    sendJson(response, 201, { booking: { id: booking.id } });
}

const adminOnlyFiles = new Set(['/onsale.html', '/Js/onsale.js', '/css/onsale.css']);
async function handle(request, response) {
    const url = new URL(request.url, `http://${request.headers.host || 'localhost'}`);
    const pathname = decodeURIComponent(url.pathname);
    const canonicalPath = path.posix.normalize(pathname.replace(/\\/g, '/'));
    const normalizedPath = canonicalPath.toLowerCase();
    if (request.method === 'GET' && pathname === '/api/me') {
        const session = getSession(request);
        return sendJson(response, 200, { user: session ? { id: session.userId, name: session.name, email: session.email, role: session.role } : null });
    }
    if (request.method === 'POST' && pathname === '/api/login') return login(request, response);
    if (request.method === 'POST' && pathname === '/api/register') return register(request, response);
    if (request.method === 'POST' && pathname === '/api/logout') {
        const session = getSession(request);
        if (session) sessions.delete(session.token);
        return sendJson(response, 200, { ok: true }, { 'Set-Cookie': cookie('', 0) });
    }
    if (request.method === 'POST' && pathname === '/api/bookings') return createBooking(request, response);
    if (request.method === 'GET' && pathname === '/api/revenue') {
        if (!requireRole(request, response, 'admin')) return;
        return sendJson(response, 200, { today: 5200000, weeklyProfit: 12450000, totalOrders: 156, source: 'Dữ liệu doanh thu mẫu cho giao diện dự án.' });
    }

    const protectedPath = [...adminOnlyFiles].some(file => file.toLowerCase() === normalizedPath);
    if (protectedPath && (request.method === 'GET' || request.method === 'HEAD')) {
        const session = getSession(request);
        if (!session) {
            response.writeHead(302, { Location: '/dangnhap.html?next=%2Fonsale.html', 'Cache-Control': 'no-store' });
            return response.end();
        }
        if (session.role !== 'admin') {
            response.writeHead(302, { Location: '/trangchu.html?error=forbidden', 'Cache-Control': 'no-store' });
            return response.end();
        }
    }
    if (request.method !== 'GET' && request.method !== 'HEAD') return sendJson(response, 405, { error: 'Phương thức không được hỗ trợ.' });
    const relativePath = canonicalPath === '/' ? 'trangchu.html' : canonicalPath.replace(/^\/+/, '');
    const blockedSegments = new Set(['data', 'node_modules']);
    if (normalizedPath === '/server.js' || canonicalPath.split('/').some(segment => segment.startsWith('.') || blockedSegments.has(segment.toLowerCase()))) {
        return sendJson(response, 404, { error: 'Không tìm thấy trang.' });
    }
    const filePath = path.resolve(ROOT, relativePath);
    if (!filePath.startsWith(`${ROOT}${path.sep}`)) return sendJson(response, 404, { error: 'Không tìm thấy trang.' });
    fs.readFile(filePath, (error, contents) => {
        if (error) return sendJson(response, error.code === 'ENOENT' ? 404 : 500, { error: error.code === 'ENOENT' ? 'Không tìm thấy trang.' : 'Không thể đọc trang.' });
        response.writeHead(200, { 'Content-Type': MIME_TYPES[path.extname(filePath).toLowerCase()] || 'application/octet-stream', 'Cache-Control': protectedPath ? 'no-store' : 'no-cache', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'same-origin' });
        response.end(request.method === 'HEAD' ? undefined : contents);
    });
}
async function start() {
    await seedAdmin();
    const server = http.createServer((request, response) => handle(request, response).catch(error => {
        console.error(error);
        if (!response.headersSent) sendJson(response, error.statusCode || 500, { error: error.statusCode ? error.message : 'Máy chủ gặp lỗi.' });
        else response.destroy();
    }));
    server.listen(PORT, HOST, () => console.log(`O(Pizza) đang chạy tại http://${HOST}:${PORT}`));
}
start().catch(error => { console.error(error.message); process.exitCode = 1; });
