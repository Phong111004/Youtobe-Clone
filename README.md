# 📺 YouTube Clone - Fullstack Project

Dự án YouTube Clone với đầy đủ các tính năng cơ bản, được xây dựng bằng kiến trúc Fullstack (Frontend và Backend tách biệt), sử dụng các công nghệ hiện đại nhất hiện nay.

---

## 📖 Giới thiệu chung

Dự án mô phỏng lại nền tảng chia sẻ video lớn nhất thế giới - YouTube. Người dùng có thể đăng ký, đăng nhập (hỗ trợ cả Google OAuth), xem video, tải video lên, tương tác như like, bình luận, và đăng ký kênh của những người dùng khác. 

Hệ thống được thiết kế tối ưu, giao diện đẹp mắt, hỗ trợ responsive và đi kèm với tính năng quản lý state mạnh mẽ trên Frontend, cùng API bảo mật, hiệu suất cao ở Backend.

---

## 🚀 Công nghệ sử dụng (Tech Stack)

### 🎨 Frontend
Được xây dựng tại thư mục `frontend/`, tập trung vào trải nghiệm người dùng (UX/UI) và hiệu năng (Performance):
- **Core:** [Next.js 16](https://nextjs.org/) (App Router), [React 19](https://react.dev/).
- **Ngôn ngữ:** TypeScript.
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) cho giao diện hiện đại, dễ bảo trì.
- **State Management:** 
  - [Zustand](https://zustand-demo.pmnd.rs/) quản lý Global State gọn nhẹ.
  - [@tanstack/react-query](https://tanstack.com/query/v5) để quản lý Data Fetching, Caching dữ liệu API.
- **Animation & UI:** [Framer Motion](https://www.framer.com/motion/) cho các hiệu ứng chuyển động mượt mà, [Lucide React](https://lucide.dev/) cho icon.
- **Media:** [React Player](https://github.com/cookpete/react-player) làm trình phát video tùy chỉnh (Custom Video Player).
- **HTTP Client:** [Axios](https://axios-http.com/).

### ⚙️ Backend
Được xây dựng tại thư mục `backend/`, đảm nhiệm xử lý logic, dữ liệu và xác thực:
- **Core:** [Node.js](https://nodejs.org/), [Express.js](https://expressjs.com/).
- **Ngôn ngữ:** TypeScript.
- **Database:** [MongoDB](https://www.mongodb.com/) & [Mongoose](https://mongoosejs.com/).
- **Authentication & Security:** 
  - [JWT (JSON Web Token)](https://jwt.io/) để xác thực người dùng (Authorization).
  - [Passport.js](https://www.passportjs.org/) (Google OAuth 2.0) cho tính năng "Đăng nhập bằng Google".
  - [Bcryptjs](https://www.npmjs.com/package/bcryptjs) để băm mật khẩu.
  - [Helmet](https://helmetjs.github.io/), [CORS](https://expressjs.com/en/resources/middleware/cors.html) chống các cuộc tấn công bảo mật và xử lý Cross-Origin.
- **File Upload & Storage:** 
  - [Multer](https://www.npmjs.com/package/multer) để parse form-data (video/ảnh upload).
  - [Cloudinary](https://cloudinary.com/) API để lưu trữ media trực tuyến, tiết kiệm bộ nhớ server.

### 🐳 DevOps & Deployment
- [Docker](https://www.docker.com/) & `docker-compose` để dễ dàng thiết lập môi trường chạy chung cho toàn bộ dự án chỉ với một dòng lệnh.

---

## ✨ Các tính năng chính (Key Features)

### 👤 Xác thực & Quản lý người dùng (User & Auth)
- Đăng ký / Đăng nhập tài khoản bằng Email và Mật khẩu.
- Đăng nhập nhanh bằng tài khoản Google.
- Xem và chỉnh sửa thông tin Profile.
- Theo dõi (Subscribe) và Hủy theo dõi (Unsubscribe) kênh.
- Lưu Lịch sử xem video (History).

### 🎬 Quản lý Video (Video Management)
- Tải video lên hệ thống (Upload Video).
- Cung cấp Custom Video Player với giao diện trực quan.
- Trang Home hiển thị danh sách video đề xuất.
- Xem danh sách video thịnh hành (Trending).
- Xem video dạng ngắn (Shorts).
- Tính lượt xem video (View counting).
- Tương tác: Thích (Like) và Không thích (Dislike) video.

### 💬 Tương tác cộng đồng (Community)
- Hệ thống bình luận (Comment) đa tầng trên mỗi video.
- Chỉnh sửa hoặc Xóa bình luận của bản thân.

---

## 📁 Cấu trúc thư mục dự án (Folder Structure)

```text
Youtobe-Clone/
├── backend/                  # Mã nguồn Backend (API, Database, Logic)
│   ├── src/
│   │   ├── controllers/      # Xử lý logic cho các endpoints (auth, user, video, comment)
│   │   ├── models/           # Định nghĩa Schema cho MongoDB (Mongoose Models)
│   │   ├── routes/           # Định nghĩa API endpoints
│   │   ├── app.ts            # Điểm khởi chạy của Express app
│   │   └── ...
│   ├── .env                  # Biến môi trường Backend
│   ├── package.json
│   └── Dockerfile
├── frontend/                 # Mã nguồn Frontend (Giao diện web)
│   ├── src/
│   │   ├── app/              # Các trang chính (Router của Next.js: Home, Watch, Upload, Trending, Shorts...)
│   │   ├── components/       # Các UI Component có thể tái sử dụng (Video Player, Button, Card...)
│   │   └── ...
│   ├── .env                  # Biến môi trường Frontend
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml        # File cấu hình Docker để chạy đồng thời cả FE và BE
└── README.md                 # File tài liệu dự án
```

---

## ⚙️ Hướng dẫn cài đặt và chạy dự án (Setup & Installation)

### 1. Yêu cầu hệ thống (Prerequisites)
- [Node.js](https://nodejs.org/en/) (phiên bản 18 trở lên).
- [MongoDB](https://www.mongodb.com/try/download/community) (chạy dưới local hoặc dùng MongoDB Atlas).
- Tài khoản [Cloudinary](https://cloudinary.com/) (để lưu trữ Video và Hình ảnh).
- Lấy thông tin Client ID & Secret từ [Google Cloud Console](https://console.cloud.google.com/) cho chức năng đăng nhập Google.
- (Tùy chọn) [Docker Desktop](https://www.docker.com/products/docker-desktop/) nếu muốn chạy qua Docker.

### 2. Thiết lập Biến môi trường (.env)

**Tại thư mục `backend/`, tạo file `.env`:**
```env
PORT=5000
MONGODB_URI=mongodb_uri_cua_ban
JWT_SECRET=chuoi_ky_tu_bi_mat_cho_jwt
CLIENT_URL=http://localhost:3000

# Google OAuth
GOOGLE_CLIENT_ID=google_client_id_cua_ban
GOOGLE_CLIENT_SECRET=google_client_secret_cua_ban

# Cloudinary
CLOUDINARY_CLOUD_NAME=ten_cloud_cua_ban
CLOUDINARY_API_KEY=api_key_cua_ban
CLOUDINARY_API_SECRET=api_secret_cua_ban
```

**Tại thư mục `frontend/`, tạo file `.env`:**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 3. Cách chạy dự án

#### Cách A: Chạy bằng Docker (Khuyên dùng)
Đảm bảo bạn đã cài đặt Docker và mở Docker Desktop. Ở thư mục gốc của dự án (`Youtobe-Clone/`), chạy lệnh:
```bash
docker-compose up --build
```
- Frontend sẽ chạy tại: `http://localhost:3000`
- Backend API sẽ chạy tại: `http://localhost:5000`

#### Cách B: Chạy thủ công (Manual)
**Bước 1: Chạy Backend**
Mở terminal mới:
```bash
cd backend
npm install
npm run dev
```

**Bước 2: Chạy Frontend**
Mở thêm một terminal khác:
```bash
cd frontend
npm install
npm run dev
```

Truy cập `http://localhost:3000` trên trình duyệt để trải nghiệm.

---

## 🤝 Đóng góp (Contributing)
Nếu bạn có bất kỳ ý tưởng hay phát hiện lỗi nào, vui lòng tạo **Issue** hoặc **Pull Request**. Mọi đóng góp đều được trân trọng!

---
*Developed with ❤️*
