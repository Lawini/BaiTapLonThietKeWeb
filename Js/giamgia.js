document.addEventListener('DOMContentLoaded', function() {
    const orderButtons = document.querySelectorAll('.order-promo');
    const orderDialog = document.getElementById('order-success');
    const successMessage = document.getElementById('success-message');
    const closeButton = document.getElementById('close-success');

    orderButtons.forEach(function(button) {
        button.addEventListener('click', function() {
            const offerName = button.dataset.offer;
            if (!offerName) {
                throw new Error('Thiếu thông tin combo khuyến mãi.');
            }

            successMessage.textContent = `Bạn đã đặt thành công: ${offerName}.`;
            orderDialog.showModal();
        });
    });

    closeButton.addEventListener('click', function() {
        orderDialog.close();
    });
});
