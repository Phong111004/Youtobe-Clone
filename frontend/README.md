# 📺 YouTube Clone - Frontend Project

Đây là phần Frontend của dự án **YouTube Clone** được xây dựng bằng **Next.js** và **React**. Giao diện được thiết kế hiện đại, responsive và tối ưu hiệu suất.

Để xem tài liệu chi tiết của toàn bộ dự án (cả Frontend và Backend, tính năng, hướng dẫn cài đặt DB), vui lòng tham khảo [README.md chính ở thư mục gốc](../README.md).

---

## 🚀 Công nghệ sử dụng trong Frontend

- **Framework:** [Next.js 16](https://nextjs.org/) (Sử dụng App Router) & [React 19](https://react.dev/).
- **Ngôn ngữ:** TypeScript, đảm bảo chặt chẽ kiểu dữ liệu.
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) giúp tùy biến giao diện linh hoạt.
- **Quản lý State:** 
  - **[Zustand](https://zustand-demo.pmnd.rs/):** Quản lý Global State (thông tin user đăng nhập, cài đặt ứng dụng,...).
  - **[@tanstack/react-query](https://tanstack.com/query/latest):** Fetching, caching, đồng bộ và cập nhật dữ liệu từ Server API một cách mượt mà.
- **UI & Animations:** [Framer Motion](https://www.framer.com/motion/) tạo hiệu ứng chuyển động, [Lucide React](https://lucide.dev/) cung cấp hệ thống Icon.
- **Trình phát Video:** [React Player](https://github.com/cookpete/react-player) kết hợp xây dựng Custom Video Player với đầy đủ các control (Play, pause, volume, fullscreen).
- **HTTP Client:** [Axios](https://axios-http.com/) dùng để gọi API từ Backend.
- **Tiện ích khác:** `date-fns` (xử lý ngày tháng), `clsx` & `tailwind-merge` (xử lý class name).

---

## 📁 Cấu trúc thư mục (Frontend)

```text
frontend/
├── src/
│   ├── app/                  # Các định tuyến chính (Routes) của Next.js
│   │   ├── (auth)/           # Route đăng nhập, đăng ký
│   │   ├── history/          # Route lịch sử xem video
│   │   ├── shorts/           # Route xem video ngắn (Shorts)
│   │   ├── trending/         # Route video thịnh hành
│   │   ├── upload/           # Route upload video
│   │   ├── watch/            # Route chi tiết video đang xem
│   │   ├── layout.tsx        # Layout tổng của ứng dụng (Sidebar, Header...)
│   │   └── page.tsx          # Trang chủ (Home Page)
│   ├── components/           # Chứa các component dùng chung (UI components, VideoPlayer,...)
│   ├── hooks/                # Custom React Hooks
│   ├── lib/                  # Các hàm tiện ích, cấu hình axios
│   ├── store/                # Nơi định nghĩa các store của Zustand
│   └── types/                # Nơi định nghĩa TypeScript Interfaces / Types
├── public/                   # Thư mục chứa các tài nguyên tĩnh (hình ảnh, favicon...)
├── .env                      # File chứa biến môi trường (Ví dụ: NEXT_PUBLIC_API_URL)
└── package.json
```

---

## ⚙️ Hướng dẫn cài đặt & Chạy dưới Local

### 1. Cài đặt các gói phụ thuộc (Dependencies)
```bash
npm install
# hoặc
yarn install
# hoặc
pnpm install
```

### 2. Thiết lập Biến môi trường (.env)
Tạo file `.env` ở thư mục `frontend/` và điền URL của Backend API:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 3. Chạy Development Server
```bash
npm run dev
# hoặc
yarn dev
# hoặc
pnpm dev
```
Sau đó mở trình duyệt và truy cập: [http://localhost:3000](http://localhost:3000)

### 4. Build lên Production
```bash
npm run build
npm run start
```

---

## 🎨 Tùy chỉnh Font chữ và Giao diện
Dự án có sử dụng phông chữ **Geist** được Next.js tối ưu hoá. Bạn có thể thay đổi thiết lập phông chữ hoặc màu sắc mặc định của Tailwind bằng cách sửa trực tiếp trong `src/app/layout.tsx` và cấu hình CSS tại `src/app/globals.css`.

---
*Tham khảo chi tiết API Backend tại mã nguồn `backend/`.*
