import axiosClient from "./axiosClient";

const bookingApi = {
    // API tạo đơn
    create: (data) => {
        return axiosClient.post('/bookings', data);
    },
    // Lịch sử của tôi
    getMyBookings: () => {
        return axiosClient.get('/bookings/my-history');
    },
    // Admin xem tất cả
    getAll: () => {
        return axiosClient.get('/bookings/all');
    },
    // Xem giờ trống
    checkAvailability: (courtId, dateStr) => {
        return axiosClient.get(`/bookings/check-availability?courtId=${courtId}&date=${dateStr}`);
    }
};

export default bookingApi;