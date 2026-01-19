import axios from 'axios';

const axiosClient = axios.create({
    // Ưu tiên lấy biến môi trường từ Vercel. 
    // Nếu Vercel bị lỗi biến, nó sẽ tự động dùng link Render cứng phía sau.
    baseURL: process.env.REACT_APP_API_URL || 'https://badminton-api-y86c.onrender.com/api',
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