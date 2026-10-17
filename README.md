# O(Pizza)

## Chạy ứng dụng

Ứng dụng cần chạy qua máy chủ Node.js; không mở trực tiếp tệp HTML bằng `file://`.

Trong PowerShell, đặt thông tin admin rồi chạy máy chủ:

```powershell
$env:ADMIN_EMAIL = "admin@opizza.local"
$env:ADMIN_PASSWORD = "your-unique-password-at-least-12-characters"
node server.js
```

Mở `http://127.0.0.1:3000`. Thay email hoặc mật khẩu bằng thông tin riêng trước khi khởi động. Máy chủ tạo tài khoản admin từ biến môi trường; biểu mẫu công khai chỉ tạo tài khoản khách hàng.

## Phân quyền

- Khách hàng đăng ký/đăng nhập tại `/dangnhap.html`, sau đó có thể gửi đặt bàn. Phiên đăng nhập dùng cookie `HttpOnly`.
- Máy chủ chỉ trả `/onsale.html` và mã giao diện liên quan cho phiên admin. API `/api/revenue` cũng kiểm tra vai trò admin.
- Đặt bàn chỉ được chấp nhận từ tài khoản khách hàng đã đăng nhập; tài khoản và đặt bàn được lưu trong `data/`, thư mục này không được đưa vào Git.
- Doanh thu hiện vẫn là dữ liệu mẫu trong dự án. Khi có dữ liệu thật, báo cáo cần được lấy từ cơ sở dữ liệu phía máy chủ.

Đây là cấu hình chạy cho dự án học tập. Khi đưa lên môi trường công khai, hãy dùng HTTPS và đặt `NODE_ENV=production` để bật thuộc tính `Secure` cho cookie.
