// ==========================================
// 1. CHUYỂN ĐỔI TAB (NAVIGATION)
// ==========================================
const navLinks = document.querySelectorAll('#nav-menu a');
const viewSections = document.querySelectorAll('.view-section');

document.getElementById('admin-logout').addEventListener('click', async () => {
    await fetch('/api/logout', { method: 'POST' });
    window.location.assign('/trangchu.html');
});

// Sử dụng forEach để lặp qua các mảng/NodeList một cách gọn gàng
navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Cập nhật trạng thái active cho menu
        navLinks.forEach(l => l.classList.remove('active'));
        this.classList.add('active');
        
        // Hiển thị view tương ứng
        const targetId = this.getAttribute('data-target');
        viewSections.forEach(section => {
            section.classList.remove('active');
            if(section.id === targetId) {
                section.classList.add('active');
            }
        });
    });
});

// ==========================================
// 2. CHẾ ĐỘ TỐI SÁNG (DARK MODE)
// ==========================================
const themeToggle = document.getElementById('theme-toggle');
themeToggle.addEventListener('change', function() {
    if(this.checked) {
        document.body.classList.add('dark-mode');
        Chart.defaults.color = '#f5eee6'; // Cập nhật màu chữ Chart.js
    } else {
        document.body.classList.remove('dark-mode');
        Chart.defaults.color = '#59483b';
    }
    // Render lại biểu đồ để áp dụng màu mới
    pizzaTypeChart.update();
    renderProfitChart(currentProfitType);
});

// ==========================================
// 3. BIỂU ĐỒ (CHART.JS)
// ==========================================
Chart.defaults.color = '#59483b';
Chart.defaults.font.family = "'Segoe UI', sans-serif";

// Biểu đồ Pizza
const pizzaTypeCtx = document.getElementById('pizzaTypeChart').getContext('2d');
const pizzaTypeChart = new Chart(pizzaTypeCtx, {
    type: 'bar',
    data: {
        labels: ['Margherita', 'Pepperoni', 'Hải sản', 'Thập cẩm', 'Phô mai'],
        datasets: [{
            label: 'Số lượng bán (Bánh)',
            data: [120, 190, 80, 150, 100],
            backgroundColor: 'rgba(182, 106, 60, 0.7)',
            borderColor: 'rgba(182, 106, 60, 1)',
            borderWidth: 1,
            borderRadius: 5
        }]
    },
    options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true } }
    }
});

// Biểu đồ Lợi nhuận (Có thể chuyển đổi Dữ liệu mảng 2 chiều/1 chiều)
const profitData = {
    day: {
        labels: ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'],
        data: [0.5, 1.2, 3.5, 2.0, 1.8, 4.2, 5.0],
        label: 'Lợi nhuận theo giờ (Triệu VNĐ)'
    },
    week: {
        labels: ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN'],
        data: [10, 12, 11, 15, 20, 25, 22],
        label: 'Lợi nhuận theo thứ (Triệu VNĐ)'
    },
    month: {
        labels: ['Tuần 1', 'Tuần 2', 'Tuần 3', 'Tuần 4'],
        data: [45, 50, 48, 60],
        label: 'Lợi nhuận theo tuần (Triệu VNĐ)'
    },
    year: {
        labels: ['Q1', 'Q2', 'Q3', 'Q4'],
        data: [150, 180, 210, 250],
        label: 'Lợi nhuận theo quý (Triệu VNĐ)'
    }
};

let profitChartInstance = null;
let currentProfitType = 'day';

function renderProfitChart(type) {
    const ctx = document.getElementById('profitChart').getContext('2d');
    const chartConfig = profitData[type];
    
    if (profitChartInstance) {
        profitChartInstance.destroy();
    }
    
    profitChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: chartConfig.labels,
            datasets: [{
                label: chartConfig.label,
                data: chartConfig.data,
                backgroundColor: 'rgba(138, 98, 71, 0.7)',
                borderColor: 'rgba(116, 81, 61, 1)',
                borderWidth: 1,
                borderRadius: 5
            }]
        },
        options: {
            responsive: true,
            scales: { y: { beginAtZero: true } }
        }
    });
}

// Khởi tạo biểu đồ lợi nhuận mặc định
renderProfitChart(currentProfitType);

// Xử lý nút filter lợi nhuận
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        currentProfitType = this.getAttribute('data-type');
        renderProfitChart(currentProfitType);
    });
});

// ==========================================
// 4. LỊCH SỬ BÁN HÀNG VÀ HIỆU SUẤT THEO NGÀY
// ==========================================
const calendarGrid = document.getElementById('calendar-grid');
const orderDetailsPanel = document.getElementById('order-details-panel');
const overviewDateInput = document.getElementById('overview-date');
const targetInput = document.getElementById('daily-target');
const orderTypes = [
    { id: 'tai-quan', name: 'Tại quán' },
    { id: 'mang-ve', name: 'Mang về' },
    { id: 'giao-hang', name: 'Giao hàng' }
];
const pizzaCatalog = [
    { name: 'Margherita', price: 149000 },
    { name: 'Pepperoni', price: 189000 },
    { name: 'Pizza hải sản', price: 229000 },
    { name: 'Pizza thập cẩm', price: 209000 },
    { name: 'Pizza phô mai', price: 179000 },
    { name: 'Pizza bò Mỹ', price: 239000 }
];
const moneyFormatter = new Intl.NumberFormat('vi-VN');
const reportToday = new Date();
let selectedDate = dateKey(reportToday);
let calendarMonth = new Date(reportToday.getFullYear(), reportToday.getMonth(), 1);

function dateKey(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function dateFromKey(value) {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day);
}

function formatMoney(value) {
    return `${moneyFormatter.format(value)} ₫`;
}

function formatShortMoney(value) {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}tr`;
    return `${Math.round(value / 1000)}k`;
}

function getDailyTarget() {
    const savedTarget = Number(localStorage.getItem('opizza_daily_revenue_target'));
    return Number.isFinite(savedTarget) && savedTarget > 0 ? savedTarget : 5000000;
}

function randomForDate(value) {
    let seed = 2166136261;
    for (const character of value) seed = Math.imul(seed ^ character.charCodeAt(0), 16777619);
    return function() {
        seed += 0x6D2B79F5;
        let result = seed;
        result = Math.imul(result ^ (result >>> 15), result | 1);
        result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
        return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
    };
}

function generateOrdersForDate(value) {
    const random = randomForDate(value);
    const count = Math.floor(random() * 16) + 3;
    const orders = [];
    for (let index = 0; index < count; index++) {
        const pizza = pizzaCatalog[Math.floor(random() * pizzaCatalog.length)];
        const quantity = Math.floor(random() * 3) + 1;
        const type = orderTypes[Math.floor(random() * orderTypes.length)];
        const hour = Math.floor(random() * 12) + 9;
        const minute = Math.floor(random() * 60);
        orders.push({
            id: `${value.replaceAll('-', '')}-${String(index + 1).padStart(3, '0')}`,
            time: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
            pizza: pizza.name,
            quantity,
            amount: pizza.price * quantity,
            typeId: type.id,
            typeName: type.name
        });
    }
    return orders.sort((first, second) => first.time.localeCompare(second.time));
}

function daySummary(value) {
    const history = generateOrdersForDate(value);
    const revenue = history.reduce((sum, order) => sum + order.amount, 0);
    const channels = Object.fromEntries(orderTypes.map(type => [type.id, history.filter(order => order.typeId === type.id).length]));
    const yesterday = dateFromKey(value);
    yesterday.setDate(yesterday.getDate() - 1);
    const previousRevenue = generateOrdersForDate(dateKey(yesterday)).reduce((sum, order) => sum + order.amount, 0);
    const target = getDailyTarget();
    return {
        date: value,
        history,
        total: history.length,
        revenue,
        average: history.length ? Math.round(revenue / history.length) : 0,
        channels,
        previousRevenue,
        target,
        performance: target ? revenue / target * 100 : 0
    };
}

function renderOverview(value) {
    const data = daySummary(value);
    const rate = Math.round(data.performance);
    const delta = data.revenue - data.previousRevenue;
    const score = document.getElementById('performance-score');
    const progressTrack = document.getElementById('performance-progress-track');
    const progress = document.getElementById('performance-progress');
    const status = document.getElementById('performance-status');

    overviewDateInput.value = value;
    document.getElementById('overview-revenue').textContent = formatMoney(data.revenue);
    document.getElementById('overview-orders').textContent = `${data.total} đơn`;
    document.getElementById('overview-average').textContent = formatMoney(data.average);
    document.getElementById('performance-rate').textContent = `${rate}%`;
    document.getElementById('performance-target').textContent = `Mục tiêu: ${formatMoney(data.target)} · Thực tế: ${formatMoney(data.revenue)}`;
    document.getElementById('performance-comparison').textContent = delta === 0
        ? 'Doanh thu bằng ngày trước.'
        : delta > 0
            ? `Tăng ${formatMoney(delta)} so với ngày trước.`
            : `Giảm ${formatMoney(Math.abs(delta))} so với ngày trước.`;

    score.classList.toggle('is-good', rate >= 100);
    score.classList.toggle('is-low', rate < 100);
    progress.classList.toggle('is-good', rate >= 100);
    progress.style.width = `${Math.min(rate, 100)}%`;
    progressTrack.setAttribute('aria-valuenow', String(Math.min(rate, 100)));
    status.classList.toggle('is-good', rate >= 100);
    status.classList.toggle('is-low', rate < 100);
    if (rate >= 100) status.textContent = 'Đạt mục tiêu doanh thu';
    else if (rate >= 80) status.textContent = 'Gần đạt mục tiêu — cần tăng thêm';
    else status.textContent = 'Chưa đạt mục tiêu — cần cải thiện';
}

function selectReportDate(value) {
    selectedDate = value;
    const selected = dateFromKey(value);
    calendarMonth = new Date(selected.getFullYear(), selected.getMonth(), 1);
    renderCalendar();
    renderOverview(value);
    showDayDetails(value, daySummary(value));
}

function renderCalendar() {
    calendarGrid.innerHTML = '';
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstWeekday = new Date(year, month, 1).getDay();
    document.getElementById('month-year').textContent = new Intl.DateTimeFormat('vi-VN', { month: 'long', year: 'numeric' }).format(calendarMonth);

    for (let index = 0; index < firstWeekday; index++) {
        const blank = document.createElement('div');
        blank.className = 'calendar-blank';
        calendarGrid.appendChild(blank);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const value = dateKey(new Date(year, month, day));
        const data = daySummary(value);
        const dayButton = document.createElement('button');
        dayButton.type = 'button';
        dayButton.className = `calendar-day${value === selectedDate ? ' selected' : ''}${data.performance >= 100 ? ' over-target' : ''}`;
        dayButton.dataset.date = value;
        dayButton.setAttribute('aria-pressed', String(value === selectedDate));
        dayButton.setAttribute('aria-label', `${day}/${month + 1}/${year}, ${data.total} đơn, doanh thu ${formatMoney(data.revenue)}, đạt ${Math.round(data.performance)}% mục tiêu`);
        dayButton.innerHTML = `<span class="day-number">${day}</span><span class="order-indicator">${data.total} đơn</span><span class="calendar-revenue">${formatShortMoney(data.revenue)}</span>`;
        dayButton.addEventListener('click', () => selectReportDate(value));
        calendarGrid.appendChild(dayButton);
    }
}

function showDayDetails(value, data) {
    const localizedDate = new Intl.DateTimeFormat('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(dateFromKey(value));
    const historyHTML = data.history.length ? data.history.map(order => `
        <article class="history-item">
            <div class="item-info">
                <span class="item-time">${order.time} · Mã ${order.id.slice(-3)}</span>
                <span class="item-name">${order.pizza} × ${order.quantity}</span>
                <span class="item-amount">${formatMoney(order.amount)}</span>
            </div>
            <span class="item-type type-${order.typeId}">${order.typeName}</span>
        </article>
    `).join('') : '<div class="empty-state"><p>Ngày này chưa có đơn hàng.</p></div>';

    orderDetailsPanel.innerHTML = `
        <div class="detail-header">
            <h2>${localizedDate}</h2>
            <p>Lịch sử đơn bán trong ngày · dữ liệu minh họa</p>
        </div>
        <div class="stats-grid">
            <div class="stat-box highlight"><div class="label">Doanh thu</div><div class="value">${formatMoney(data.revenue)}</div></div>
            <div class="stat-box"><div class="label">Tổng đơn</div><div class="value">${data.total}</div></div>
            <div class="stat-box"><div class="label">Mang về</div><div class="value">${data.channels['mang-ve']}</div></div>
            <div class="stat-box"><div class="label">Tại quán</div><div class="value">${data.channels['tai-quan']}</div></div>
            <div class="stat-box"><div class="label">Giao hàng</div><div class="value">${data.channels['giao-hang']}</div></div>
            <div class="stat-box"><div class="label">Hiệu suất</div><div class="value ${data.performance >= 100 ? 'text-good' : 'text-low'}">${Math.round(data.performance)}%</div></div>
        </div>
        <div class="history-heading"><h3>Đơn đã bán</h3><span>${data.total} đơn · TB ${formatMoney(data.average)}/đơn</span></div>
        <div class="history-list">${historyHTML}</div>
    `;
}

document.getElementById('prev-month').addEventListener('click', () => {
    calendarMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1);
    const day = Math.min(dateFromKey(selectedDate).getDate(), new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0).getDate());
    selectReportDate(dateKey(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day)));
});

document.getElementById('next-month').addEventListener('click', () => {
    calendarMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1);
    const day = Math.min(dateFromKey(selectedDate).getDate(), new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0).getDate());
    selectReportDate(dateKey(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day)));
});

overviewDateInput.addEventListener('change', () => {
    if (overviewDateInput.value) selectReportDate(overviewDateInput.value);
});

targetInput.value = String(getDailyTarget());
targetInput.addEventListener('change', () => {
    const target = Number(targetInput.value);
    if (!Number.isFinite(target) || target <= 0) {
        targetInput.value = String(getDailyTarget());
        return;
    }
    localStorage.setItem('opizza_daily_revenue_target', String(Math.round(target)));
    selectReportDate(selectedDate);
});

renderCalendar();
selectReportDate(selectedDate);
