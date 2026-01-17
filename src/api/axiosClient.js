import axios from 'axios';

const axiosClient = axios.create({
    // Ưu tiên lấy link từ biến môi trường Vercel (khi đã up backend lên Render)
    // Nếu chưa có thì dùng localhost:8081 (để chạy máy nhà)
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8081/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor: Tự động gắn Token vào request
axiosClient.interceptors.request.use(async (config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Interceptor: Xử lý phản hồi
axiosClient.interceptors.response.use(
    (response) => {
        if (response && response.data) {
            return response.data;
        }
        return response;
    },
    (error) => {
        throw error;
    }
);

export default axiosClient;