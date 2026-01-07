import axiosClient from "./axiosClient";

const courtApi = {
    // Lấy danh sách tất cả sân
    getAll: () => axiosClient.get('/courts'),

    // Lấy chi tiết 1 sân theo ID
    getById: (id) => axiosClient.get(`/courts/${id}`),

    // Tạo sân mới (Admin)
    create: (data) => axiosClient.post('/courts', data),

    // Cập nhật sân (Admin)
    update: (id, data) => axiosClient.put(`/courts/${id}`, data),

    // Xóa sân (Admin)
    delete: (id) => axiosClient.delete(`/courts/${id}`),
};

export default courtApi;