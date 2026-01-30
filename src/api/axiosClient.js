// src/api/axiosClient.js
import axios from 'axios';

const axiosClient = axios.create({
    baseURL: 'http://localhost:8080/api', // Khớp với Backend chạy port 8080
    headers: {
        'Content-Type': 'application/json',
    },
});

// --- Interceptor gửi Token ---
axiosClient.interceptors.request.use(async (config) => {
    // Lấy token từ localStorage
    const token = localStorage.getItem('token');

    if (token) {
        // Gửi kèm Header Authorization: Bearer <token>
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
}, (error) => {
    return Promise.reject(error);
});

// --- Interceptor xử lý phản hồi ---
axiosClient.interceptors.response.use((response) => {
    // Tự động trả về data để đỡ phải gọi response.data ở component
    if (response && response.data) {
        return response.data;
    }
    return response;
}, (error) => {
    // Bạn có thể log lỗi hoặc xử lý logout nếu nhận mã 401 ở đây
    if (error.response && error.response.status === 401) {
        // Ví dụ: localStorage.removeItem('token'); window.location.href = '/login';
    }
    return Promise.reject(error);
});

export default axiosClient;
