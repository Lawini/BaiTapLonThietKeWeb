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

    bookingForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const formData = new FormData(bookingForm);
        const selectedRestaurant = restaurantSelect.selectedOptions[0];
        const selectedCity = citySelect.selectedOptions[0].textContent;
        const selectedGuests = bookingForm.elements.guests.selectedOptions[0].textContent;
        const [year, month, day] = formData.get('date').split('-').map(Number);
        const formattedDate = new Date(year, month - 1, day).toLocaleDateString('vi-VN');

        document.getElementById('booking-restaurant').textContent = selectedRestaurant.textContent;
        document.getElementById('booking-city').textContent = selectedCity;
        document.getElementById('booking-guests').textContent = selectedGuests;
        document.getElementById('booking-date').textContent = formattedDate;
        document.getElementById('booking-time').textContent = formData.get('time');

        bookingTitle.textContent = 'Xác nhận đặt bàn';
        bookingMessage.textContent = 'Vui lòng kiểm tra thông tin trước khi xác nhận đặt bàn.';
        confirmButton.hidden = false;
        cancelButton.hidden = false;
        closeButton.hidden = true;
        bookingDialog.showModal();
    });

    cancelButton.addEventListener('click', function() {
        bookingDialog.close();
    });

    confirmButton.addEventListener('click', function() {
        const restaurant = document.getElementById('booking-restaurant').textContent;
        const city = document.getElementById('booking-city').textContent;
        const guests = document.getElementById('booking-guests').textContent;
        const date = document.getElementById('booking-date').textContent;
        const time = document.getElementById('booking-time').textContent;

        bookingTitle.textContent = 'Đặt bàn thành công!';
        bookingMessage.textContent = `Bạn đã đặt bàn thành công tại nhà hàng ${restaurant}, ${city}, cho ${guests}, vào ngày ${date} lúc ${time}.`;
        confirmButton.hidden = true;
        cancelButton.hidden = true;
        closeButton.hidden = false;
    });

    closeButton.addEventListener('click', function() {
        bookingDialog.close();
    });
});