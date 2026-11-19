# NOCTIA – Trang web sàng lọc giấc ngủ và tâm lý cho người bệnh ĐTĐ típ 2

Dự án Digital Health liên ngành Khoa Y – Dược & CNTT, **Trường Đại học Tây Nguyên**.

## 1. Yêu cầu hệ thống
- Node.js >= 18.0.0
- npm >= 9.0.0

## 2. Cài đặt và chạy Local
```bash
# Bước 1: Giải nén và vào thư mục dự án
cd noctia

# Bước 2: Cài đặt thư viện
npm install

# Bước 3: Tạo file cấu hình môi trường
cp .env.example .env

# Bước 4: Khởi tạo cơ sở dữ liệu SQLite & tài khoản admin mặc định
npm run init-db

# Bước 5: (Tùy chọn) Nạp 5 ca dữ liệu giả lập DEMO (Xanh, Vàng, Đỏ)
npm run seed-demo

# Bước 6: Chạy server
npm start
```
Truy cập ứng dụng tại: `http://localhost:3000`
Truy cập Admin Dashboard tại: `http://localhost:3000/admin.html` (mặc định: `admin_noctia` / `Noctia@2026!`).

## 3. Chạy kiểm thử tự động (Unit Tests)
```bash
npm test
```

## 4. Triển khai bản DEMO (Render + GitHub Pages)
- **Backend (Render):** Tạo Web Service từ repo GitHub, Build Command: `npm install && npm run init-db`, Start Command: `npm start`. Thiết lập biến môi trường `APP_MODE=DEMO`, `JWT_SECRET`, `ALLOWED_ORIGINS`.
- **Lưu ý dữ liệu:** SQLite trên Render Free Tier dùng filesystem tạm thời (chỉ phù hợp chạy DEMO). Khi triển khai dữ liệu thật tại Bệnh viện Trường ĐH Tây Nguyên, cần chuyển sang **PostgreSQL** hoặc persistent disk có mã hóa và sao lưu định kỳ.
- **Tạo mã QR:** Dùng công cụ tạo QR trỏ trực tiếp tới URL trang chủ (ví dụ `https://noctia-demo.onrender.com`), in khổ A4/A5 dán tại bàn tiếp đón Phòng khám Nội 2.
