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
    const checkoutBtn = document.querySelector('.checkout-btn');
    const orderSuccessDialog = document.getElementById('orderSuccessDialog');
    const orderSuccessMessage = document.getElementById('orderSuccessMessage');
    const closeOrderSuccessBtn = document.getElementById('closeOrderSuccessBtn');

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

            const name = document.createElement('span');
            name.className = 'cart-item-name';
            name.textContent = displayName;

            const price = document.createElement('span');
            price.className = 'cart-item-price';
            price.textContent = `${itemTotalPrice.toLocaleString('vi-VN')} vnd`;

            const removeButton = document.createElement('button');
            removeButton.className = 'remove-cart-item';
            removeButton.type = 'button';
            removeButton.textContent = 'Bỏ món';
            removeButton.setAttribute('aria-label', `Bỏ ${item.name} khỏi danh sách`);
            removeButton.addEventListener('click', () => {
                cart = cart.filter(cartItem => cartItem.name !== item.name);
                updateOrderBar();
                renderCartItems();
            });

            li.append(name, price, removeButton);
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

    checkoutBtn.addEventListener('click', () => {
        if (cart.length === 0) return;

        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        orderSuccessMessage.textContent = `Bạn đã đặt thành công ${totalItems} món với tổng giá trị ${totalPrice.toLocaleString('vi-VN')} vnd.`;
        cart = [];
        cartModal.classList.remove('show');
        updateOrderBar();
        orderSuccessDialog.showModal();
    });

    closeOrderSuccessBtn.addEventListener('click', () => {
        orderSuccessDialog.close();
    });
});