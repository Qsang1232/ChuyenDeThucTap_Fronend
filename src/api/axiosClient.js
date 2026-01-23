import axios from 'axios';

const axiosClient = axios.create({
    // Đọc baseURL từ biến môi trường đã định nghĩa trong file .env
    baseURL: 'http://localhost:8080/api',
    headers: {
        'Content-Type': 'application/json',
    },

});

// Interceptor: Tự động gắn Token vào mỗi request gửi đi
axiosClient.interceptors.request.use(async (config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Interceptor: Xử lý dữ liệu trả về từ API
axiosClient.interceptors.response.use(
    (response) => {
        // Chỉ trả về phần 'data' của response để code ở các nơi khác gọn hơn
        if (response && response.data) {
            return response.data;
        }
        return response;
    },
    (error) => {
        // Ném lỗi để các hàm gọi API có thể bắt và xử lý (ví dụ: hiển thị thông báo)
        console.error('API Error:', error.response || error.message);
        throw error;
    }
);

export default axiosClient;