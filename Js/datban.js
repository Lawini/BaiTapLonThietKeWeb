document.addEventListener('DOMContentLoaded', function() {
    const citySelect = document.getElementById('city');
    const restaurantSelect = document.getElementById('restaurant');
    const allOptions = Array.from(restaurantSelect.options);
    const bookingForm = document.querySelector('form');
    const bookingDialog = document.getElementById('booking-dialog');
    const bookingTitle = document.getElementById('booking-title');
    const bookingMessage = document.getElementById('booking-message');
    const confirmButton = document.getElementById('confirm-booking');
    const cancelButton = document.getElementById('cancel-booking');
    const closeButton = document.getElementById('close-booking');
    const bookingDetails = bookingDialog.querySelector('.chi-tiet-dat-ban');
    const dateInput = document.getElementById('date');
    const timeInput = document.getElementById('time');
    let pendingBooking = null;
    let authChoiceRequired = false;

    function navigateToAuth(mode) {
        const authUrl = new URL('dangnhap.html', window.location.href);
        if (mode === 'register') authUrl.searchParams.set('mode', 'register');
        authUrl.searchParams.set('next', 'datban.html');
        window.location.assign(authUrl.href);
    }

    function updateDateMinimum() {
        const now = new Date();
        const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        dateInput.min = today;
    }

    updateDateMinimum();

    citySelect.addEventListener('change', function() {
        const selectedCity = this.value;
        restaurantSelect.innerHTML = '';

        allOptions.forEach(option => {
            const optionCity = option.getAttribute('data-city');
            if (optionCity === selectedCity || optionCity === 'all') {
                restaurantSelect.appendChild(option);
            }
        });
    });

    citySelect.dispatchEvent(new Event('change'));

    bookingForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        updateDateMinimum();

        const formData = new FormData(bookingForm);
        const date = String(formData.get('date') || '');
        const time = String(formData.get('time') || '');
        const dateParts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
        const timeParts = /^(\d{2}):(\d{2})$/.exec(time);
        if (!dateParts) {
            bookingMessage.textContent = 'Ngày hoặc giờ đặt bàn không hợp lệ.';
            dateInput.setCustomValidity('Vui lòng chọn ngày có năm gồm đúng 4 chữ số.');
            dateInput.reportValidity();
            dateInput.setCustomValidity('');
            return;
        }
        if (!timeParts) {
            bookingMessage.textContent = 'Ngày hoặc giờ đặt bàn không hợp lệ.';
            timeInput.setCustomValidity('Vui lòng chọn giờ đặt bàn hợp lệ.');
            timeInput.reportValidity();
            timeInput.setCustomValidity('');
            return;
        }

        const [, year, month, day] = dateParts;
        const [, hour, minute] = timeParts;
        const bookingDate = new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute));
        if (
            bookingDate.getFullYear() !== Number(year) ||
            bookingDate.getMonth() !== Number(month) - 1 ||
            bookingDate.getDate() !== Number(day) ||
            bookingDate.getHours() !== Number(hour) ||
            bookingDate.getMinutes() !== Number(minute) ||
            bookingDate <= new Date()
        ) {
            timeInput.setCustomValidity('Vui lòng chọn ngày và giờ hợp lệ trong tương lai.');
            timeInput.reportValidity();
            timeInput.setCustomValidity('');
            return;
        }

        try {
            const response = await fetch('/api/me', { cache: 'no-store' });
            if (!response.ok) throw new Error('Không thể kiểm tra trạng thái đăng nhập.');
            const { user } = await response.json();
            if (!user) {
                authChoiceRequired = true;
                bookingTitle.textContent = 'Bạn chưa đăng nhập tài khoản';
                bookingMessage.textContent = 'Vui lòng đăng ký hoặc đăng nhập để tiếp tục đặt bàn.';
                bookingDetails.hidden = true;
                cancelButton.textContent = 'Đăng ký';
                confirmButton.textContent = 'Đăng nhập';
                confirmButton.disabled = false;
                confirmButton.hidden = false;
                cancelButton.hidden = false;
                closeButton.hidden = true;
                bookingDialog.showModal();
                return;
            }
            if (user.role !== 'customer') {
                authChoiceRequired = false;
                bookingTitle.textContent = 'Không thể đặt bàn';
                bookingMessage.textContent = 'Chỉ tài khoản khách hàng mới có thể đặt bàn.';
                bookingDetails.hidden = true;
                confirmButton.hidden = true;
                cancelButton.hidden = true;
                closeButton.hidden = false;
                bookingDialog.showModal();
                return;
            }
        } catch (error) {
            authChoiceRequired = true;
            bookingTitle.textContent = 'Bạn chưa đăng nhập tài khoản';
            bookingMessage.textContent = 'Vui lòng đăng ký hoặc đăng nhập để tiếp tục đặt bàn.';
            bookingDetails.hidden = true;
            cancelButton.textContent = 'Đăng ký';
            confirmButton.textContent = 'Đăng nhập';
            confirmButton.disabled = false;
            confirmButton.hidden = false;
            cancelButton.hidden = false;
            closeButton.hidden = true;
            bookingDialog.showModal();
            return;
        }

        const selectedRestaurant = restaurantSelect.selectedOptions[0];
        const selectedCity = citySelect.selectedOptions[0].textContent;
        const selectedGuests = bookingForm.elements.guests.selectedOptions[0].textContent;
        const formattedDate = bookingDate.toLocaleDateString('vi-VN');

        authChoiceRequired = false;
        pendingBooking = {
            restaurant: restaurantSelect.value,
            city: citySelect.value,
            guests: bookingForm.elements.guests.value,
            date: formData.get('date'),
            time: formData.get('time')
        };

        document.getElementById('booking-restaurant').textContent = selectedRestaurant.textContent;
        document.getElementById('booking-city').textContent = selectedCity;
        document.getElementById('booking-guests').textContent = selectedGuests;
        document.getElementById('booking-date').textContent = formattedDate;
        document.getElementById('booking-time').textContent = formData.get('time');

        bookingTitle.textContent = 'Xác nhận đặt bàn';
        bookingMessage.textContent = 'Vui lòng kiểm tra thông tin trước khi xác nhận đặt bàn.';
        bookingDetails.hidden = false;
        cancelButton.textContent = 'Quay lại';
        confirmButton.hidden = false;
        cancelButton.hidden = false;
        confirmButton.disabled = false;
        closeButton.hidden = true;
        bookingDialog.showModal();
    });

    cancelButton.addEventListener('click', function() {
        if (authChoiceRequired) {
            navigateToAuth('register');
            return;
        }
        bookingDialog.close();
    });

    confirmButton.addEventListener('click', async function() {
        if (authChoiceRequired) {
            navigateToAuth('login');
            return;
        }

        const restaurant = document.getElementById('booking-restaurant').textContent;
        const city = document.getElementById('booking-city').textContent;
        const guests = document.getElementById('booking-guests').textContent;
        const date = document.getElementById('booking-date').textContent;
        const time = document.getElementById('booking-time').textContent;

        confirmButton.disabled = true;
        try {
            const response = await fetch('/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(pendingBooking)
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Không thể lưu thông tin đặt bàn.');

            bookingTitle.textContent = 'Đặt bàn thành công!';
            bookingMessage.textContent = `Bạn đã đặt bàn thành công tại nhà hàng ${restaurant}, ${city}, cho ${guests}, vào ngày ${date} lúc ${time}.`;
            confirmButton.hidden = true;
            cancelButton.hidden = true;
            closeButton.hidden = false;
        } catch (error) {
            bookingTitle.textContent = 'Chưa thể đặt bàn';
            bookingMessage.textContent = error.message;
            confirmButton.disabled = false;
        }
    });

    closeButton.addEventListener('click', function() {
        bookingDialog.close();
    });
});
