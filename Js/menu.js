document.addEventListener("DOMContentLoaded", () => {
    // Mảng lưu trữ các món đã chọn
    let cart = [];

    // Lấy phần tử DOM
    const addButtons = document.querySelectorAll('.add-btn');
    const orderBar = document.getElementById('orderBar');
    const totalItemsEl = document.getElementById('totalItems');
    const totalPriceEl = document.getElementById('totalPrice');

    const viewCartBtn = document.getElementById('viewCartBtn');
    const cartModal = document.getElementById('cartModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const cartItemList = document.getElementById('cartItemList');

    // Xử lý sự kiện bấm nút + trên mỗi món
    addButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const name = btn.getAttribute('data-name');
            const price = parseInt(btn.getAttribute('data-price'), 10);

            // Kiểm tra trùng món
            const existingItem = cart.find(item => item.name === name);
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                cart.push({ name, price, quantity: 1 });
            }

            updateOrderBar();
        });
    });

    // Cập nhật Thanh Order Bar
    function updateOrderBar() {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        if (totalItems > 0) {
            orderBar.classList.add('show');
            totalItemsEl.textContent = totalItems;
            totalPriceEl.textContent = totalPrice.toLocaleString('vi-VN') + ' vnd';
        } else {
            orderBar.classList.remove('show');
            cartModal.classList.remove('show');
        }
    }

    // Render danh sách món trong Popup Modal (chỉ hiện tên và giá)
    function renderCartItems() {
        cartItemList.innerHTML = '';

        if (cart.length === 0) {
            cartItemList.innerHTML = '<li class="empty-msg">Chưa có món nào trong danh sách.</li>';
            return;
        }

        cart.forEach(item => {
            const li = document.createElement('li');
            li.className = 'cart-item-row';

            const itemTotalPrice = item.price * item.quantity;
            const displayName = item.quantity > 1 ? `${item.name} (x${item.quantity})` : item.name;

            li.innerHTML = `
                <span class="cart-item-name">${displayName}</span>
                <span class="cart-item-price">${itemTotalPrice.toLocaleString('vi-VN')} vnd</span>
            `;

            cartItemList.appendChild(li);
        });
    }

    // Đóng / Mở Modal
    viewCartBtn.addEventListener('click', () => {
        renderCartItems();
        cartModal.classList.add('show');
    });

    closeModalBtn.addEventListener('click', () => {
        cartModal.classList.remove('show');
    });

    cartModal.addEventListener('click', (e) => {
        if (e.target === cartModal) {
            cartModal.classList.remove('show');
        }
    });
});