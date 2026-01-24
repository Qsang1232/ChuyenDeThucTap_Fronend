import React, { useState, useEffect } from 'react';
import { Modal, Form, DatePicker, TimePicker, Input, message, Typography } from 'antd';
import dayjs from 'dayjs';
import bookingApi from '../api/bookingApi';

const { Text } = Typography;

const BookingModal = ({ court, onClose, onSuccess }) => { // Thêm prop onSuccess để load lại trang nếu cần
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [totalPrice, setTotalPrice] = useState(0);

    // Reset form mỗi khi mở modal mới
    useEffect(() => {
        if (court) {
            form.resetFields();
            setTotalPrice(0);
        }
    }, [court, form]);

    // Hàm tính tiền khi thay đổi giờ
    const handleValuesChange = (_, allValues) => {
        const { date, timeRange } = allValues;

        if (date && timeRange && timeRange.length === 2) {
            const start = timeRange[0];
            const end = timeRange[1];

            // Tính số giờ chơi (phút / 60)
            const durationInMinutes = end.diff(start, 'minute');
            const durationInHours = durationInMinutes / 60;

            if (durationInHours > 0) {
                const total = durationInHours * court.pricePerHour;
                setTotalPrice(total);
            } else {
                setTotalPrice(0);
            }
        }
    };

    const handleBooking = async (values) => {
        // 1. Kiểm tra đăng nhập
        const user = JSON.parse(localStorage.getItem('currentUser'));
        if (!user) {
            message.warning("Vui lòng đăng nhập để đặt sân!");
            // navigate('/login'); // Nếu có hook navigate
            return;
        }

        setLoading(true);
        try {
            // 2. Format dữ liệu chuẩn ISO 8601
            // values.date là object dayjs -> format 'YYYY-MM-DD'
            // values.timeRange[0] là object dayjs -> format 'HH:mm:ss'

            const dateStr = values.date.format('YYYY-MM-DD');
            const startTimeStr = values.timeRange[0].format('HH:mm:ss');
            const endTimeStr = values.timeRange[1].format('HH:mm:ss');

            // Ghép lại thành LocalDateTime: "2024-05-20T14:30:00"
            const startDateTime = `${dateStr}T${startTimeStr}`;
            const endDateTime = `${dateStr}T${endTimeStr}`;

            // Gọi API
            await bookingApi.create({
                courtId: court.id,
                startTime: startDateTime,
                endTime: endDateTime
            });

            message.success("✅ Đặt sân thành công! Vui lòng kiểm tra lịch sử.");
            onClose(); // Đóng modal
            if (onSuccess) onSuccess(); // Gọi callback để refresh dữ liệu bên ngoài (nếu có)

        } catch (error) {
            console.error("Lỗi đặt sân:", error);
            const errorMessage = error.response?.data?.message || "Lỗi hệ thống, vui lòng thử lại sau.";
            message.error("❌ Đặt sân thất bại: " + errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Nếu không có court thì không render gì cả (hoặc Modal sẽ tự quản lý visible qua props open)
    // Ở đây ta giả định component cha sẽ unmount hoặc ẩn component này

    return (
        <Modal
            title={`Đặt sân: ${court?.name}`}
            open={!!court} // Modal mở khi có thông tin court
            onCancel={onClose}
            onOk={() => form.submit()}
            confirmLoading={loading}
            okText="Xác nhận đặt"
            cancelText="Hủy"
            okButtonProps={{ style: { backgroundColor: '#27ae60', borderColor: '#27ae60' } }}
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleBooking}
                onValuesChange={handleValuesChange}
            >
                {/* Chọn ngày */}
                <Form.Item
                    name="date"
                    label="Ngày chơi"
                    rules={[{ required: true, message: 'Vui lòng chọn ngày!' }]}
                >
                    <DatePicker
                        style={{ width: '100%' }}
                        format="DD/MM/YYYY"
                        // Chặn ngày quá khứ
                        disabledDate={(current) => current && current < dayjs().endOf('day').subtract(1, 'day')}
                    />
                </Form.Item>

                {/* Chọn giờ (Khoảng thời gian) */}
                <Form.Item
                    name="timeRange"
                    label="Khung giờ (Bắt đầu - Kết thúc)"
                    rules={[{ required: true, message: 'Vui lòng chọn giờ!' }]}
                >
                    <TimePicker.RangePicker
                        format="HH:mm"
                        minuteStep={30} // Chỉ cho chọn chẵn 30 phút (tuỳ chỉnh)
                        style={{ width: '100%' }}
                    />
                </Form.Item>

                {/* Hiển thị giá tiền */}
                <div style={{ background: '#f6ffed', padding: '15px', borderRadius: '8px', border: '1px solid #b7eb8f' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                        <Text type="secondary">Đơn giá:</Text>
                        <Text strong>{Number(court?.pricePerHour).toLocaleString()} đ/h</Text>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', borderTop: '1px dashed #d9d9d9', paddingTop: '10px' }}>
                        <Text style={{ fontSize: '16px' }}>Tạm tính:</Text>
                        <Text type="danger" style={{ fontSize: '20px', fontWeight: 'bold' }}>
                            {totalPrice.toLocaleString()} đ
                        </Text>
                    </div>
                </div>
            </Form>
        </Modal>
    );
};

export default BookingModal;    