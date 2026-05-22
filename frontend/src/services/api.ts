import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  withCredentials: true, // Quan trọng: Bắt buộc để gửi/nhận cookie (JWT)
});

// Interceptor xử lý lỗi chung (VD: hết hạn token)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Có thể xử lý logic logout ở đây nếu cần
      console.warn('Unauthorized, please login again.');
    }
    return Promise.reject(error);
  }
);

export default api;
