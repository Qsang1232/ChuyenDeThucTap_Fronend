import axiosClient from "./axiosClient";

const bookingApi = {
    // 1. Tạo đơn đặt sân
    create: (data) => {
        return axiosClient.post('/bookings', data);
    },

    // 2. Lấy lịch sử đặt sân của tôi
    getMyBookings: () => {
        return axiosClient.get('/bookings/my-history');
    },

    // 3. Admin xem tất cả lịch đặt
    getAll: () => {
        return axiosClient.get('/bookings/all');
    },

    // 4. Xem giờ trống (Check Availability)
    checkAvailability: (courtId, dateStr) => {
        return axiosClient.get(`/bookings/check-availability?courtId=${courtId}&date=${dateStr}`);
    },

    // 5. Hủy đơn đặt (QUAN TRỌNG: Còn thiếu cái này)
    cancelBooking: (id) => {
        return axiosClient.post(`/bookings/${id}/cancel`);
    },

    // 6. Tạo link thanh toán VNPay (QUAN TRỌNG: Còn thiếu cái này)
    createPaymentUrl: (amount, bookingId) => {
        // Gọi API backend: /api/payment/create-payment-url?amount=...&bookingId=...
        return axiosClient.get(`/payment/create-payment-url?amount=${amount}&bookingId=${bookingId}`);
    },

    // Sửa hàm này:
    verifyPayment: (params) => {
        // params ví dụ: ?vnp_TxnRef=42...
        // Chúng ta cần lấy ID từ params ra để gọi API mới
        const urlParams = new URLSearchParams(params);
        const bookingId = urlParams.get('vnp_TxnRef');

        // Gọi API xác nhận mới
        return axiosClient.post(`/payment/confirm-transfer?bookingId=${bookingId}`);
    }
};

export default bookingApi;