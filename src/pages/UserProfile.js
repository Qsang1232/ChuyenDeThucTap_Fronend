import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Card, Table, Tag, Typography, Avatar, Spin, message, Button, Popconfirm, Modal, Form, Input, Rate } from 'antd';
import { UserOutlined, HistoryOutlined, QrcodeOutlined, StarOutlined, DeleteOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import bookingApi from '../api/bookingApi';
import axiosClient from '../api/axiosClient';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const UserProfile = () => {
    // --- 1. HOOKS ---
    const navigate = useNavigate();
    const location = useLocation();
    const [form] = Form.useForm();

    // --- 2. STATE ---
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isReviewOpen, setIsReviewOpen] = useState(false);
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);
    const [currentBooking, setCurrentBooking] = useState(null);

    // --- 3. LOGIC ---

    // Lấy thông tin User
    const user = useMemo(() => {
        try {
            return JSON.parse(localStorage.getItem('currentUser')) || { name: 'Khách hàng', email: 'Chưa cập nhật' };
        } catch {
            return { name: 'Khách hàng', email: 'Chưa cập nhật' };
        }
    }, []);

    // Fetch Data
    const fetchHistory = useCallback(async () => {
        try {
            const res = await bookingApi.getMyBookings();
            const data = Array.isArray(res) ? res : (res.data || []);
            setBookings(data.sort((a, b) => b.id - a.id));
        } catch (error) {
            console.error("Lỗi tải lịch sử:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    // Effect khởi tạo
    useEffect(() => {
        if (!user || user.name === 'Khách hàng') {
            navigate('/login');
            return;
        }
        fetchHistory();
    }, [user, navigate, fetchHistory]);

    // Hủy đơn
    const handleCancel = useCallback(async (id) => {
        try {
            await bookingApi.cancelBooking(id);
            message.success("Đã hủy lịch thành công!");
            fetchHistory();
        } catch (error) {
            const errorMsg = error.response?.data?.message || "Hủy thất bại!";
            message.error(errorMsg);
        }
    }, [fetchHistory]);

    // Mở Modal Thanh toán
    const openPaymentModal = useCallback((booking) => {
        setCurrentBooking(booking);
        setIsPaymentOpen(true);
    }, []);

    // Xác nhận chuyển khoản
    const handleConfirmPayment = async () => {
        try {
            message.loading({ content: "Đang gửi yêu cầu...", key: 'pay' });
            // Giả lập gọi API verify
            await bookingApi.verifyPayment(`?vnp_TxnRef=${currentBooking.id}&vnp_ResponseCode=00`);
            message.success({ content: "Đã gửi yêu cầu! Vui lòng chờ Admin duyệt.", key: 'pay' });
            setIsPaymentOpen(false);
            fetchHistory();
        } catch (error) {
            message.error({ content: "Lỗi xác nhận!", key: 'pay' });
        }
    };

    // Mở Modal Review
    const openReviewModal = useCallback((booking) => {
        setCurrentBooking(booking);
        setIsReviewOpen(true);
        form.resetFields();
    }, [form]);

    // --- SỬA CHÍNH Ở ĐÂY: Thêm /api vào đường dẫn ---
    const handleReviewSubmit = async (values) => {
        try {
            if (!currentBooking) {
                message.error("Không tìm thấy đơn hàng!");
                return;
            }

            // CHỈNH SỬA Ở ĐÂY: Xóa '/api', chỉ để lại '/reviews'
            // Vì axiosClient đã tự động thêm '/api' ở đầu rồi.
            await axiosClient.post('/reviews', {
                bookingId: currentBooking.id,
                rating: values.rating,
                comment: values.comment
            });

            message.success("Đánh giá thành công! Cảm ơn bạn.");
            setIsReviewOpen(false);
            form.resetFields();

        } catch (error) {
            console.error("Lỗi đánh giá:", error);
            const msg = error.response?.data?.message || "Lỗi kết nối Server!";
            message.error(msg);
        }
    };

    // Cấu hình Cột Bảng
    // Cấu hình Cột Bảng
    const columns = useMemo(() => [
        {
            title: 'Sân Cầu Lông',
            dataIndex: 'courtName',
            key: 'courtName',
            render: (text) => <span className="font-bold text-green-600">{text}</span>,
        },
        {
            title: 'Ngày chơi',
            dataIndex: 'startTime',
            key: 'date',
            render: (text) => dayjs(text).format('DD/MM/YYYY'),
        },
        {
            title: 'Khung giờ',
            key: 'time',
            render: (_, record) => (
                <span className="bg-gray-100 px-2 py-1 rounded text-sm text-gray-600">
                    {dayjs(record.startTime).format('HH:mm')} - {dayjs(record.endTime).format('HH:mm')}
                </span>
            ),
        },
        {
            title: 'Tổng tiền',
            dataIndex: 'totalPrice',
            key: 'totalPrice',
            render: (price) => <span className="text-red-500 font-bold">{Number(price).toLocaleString()} đ</span>,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            align: 'center',
            render: (status) => {
                let color = 'default';
                let text = status;

                if (status === 'CONFIRMED') { color = 'green'; text = 'Đã duyệt'; }
                else if (status === 'PENDING') { color = 'orange'; text = 'Chưa thanh toán'; }
                else if (status === 'WAITING') { color = 'gold'; text = 'Chờ duyệt'; }
                else if (status === 'CANCELLED') { color = 'red'; text = 'Đã hủy'; }

                return <Tag color={color} className="min-w-[100px] text-center font-medium">{text}</Tag>;
            },
        },
        {
            title: 'Hành động',
            key: 'action',
            width: 240,
            render: (_, record) => (
                <div className="flex gap-2 justify-center items-center">

                    {/* Nút Thanh toán (PENDING) */}
                    {record.status === 'PENDING' && (
                        <Button
                            type="primary" size="small"
                            icon={<QrcodeOutlined />}
                            onClick={() => openPaymentModal(record)}
                            style={{ background: '#1890ff', borderColor: '#1890ff', fontSize: '12px' }}
                        >
                            Thanh toán
                        </Button>
                    )}

                    {/* Thông báo (WAITING) */}
                    {record.status === 'WAITING' && (
                        <span style={{ color: '#faad14', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <ClockCircleOutlined /> Đang xử lý...
                        </span>
                    )}

                    {/* --- LOGIC MỚI: Nút Đánh giá (chỉ hiện khi chưa đánh giá) --- */}
                    {record.status === 'CONFIRMED' && !record.hasReviewed && (
                        <Button
                            size="small"
                            icon={<StarOutlined />}
                            onClick={() => openReviewModal(record)}
                            style={{ borderColor: '#f1c40f', color: '#f1c40f', fontSize: '12px' }}
                        >
                            Đánh giá
                        </Button>
                    )}

                    {/* --- LOGIC MỚI: Nếu đã đánh giá rồi thì hiện Label --- */}
                    {record.status === 'CONFIRMED' && record.hasReviewed && (
                        <Tag color="cyan">Đã đánh giá</Tag>
                    )}

                    {/* Nút Hủy (PENDING) */}
                    {record.status === 'PENDING' && (
                        <Popconfirm
                            title="Bạn chắc chắn muốn hủy?"
                            onConfirm={() => handleCancel(record.id)}
                            okText="Đồng ý"
                            cancelText="Không"
                        >
                            <Button type="text" danger size="small" icon={<DeleteOutlined />}>Hủy</Button>
                        </Popconfirm>
                    )}
                </div>
            )
        }
    ], [handleCancel, openReviewModal, openPaymentModal]);

    return (
        <div className="container mx-auto p-6 max-w-5xl">
            <Card className="shadow-md rounded-lg border-none">
                <div className="flex items-center gap-6 border-b pb-6 mb-6">
                    <Avatar size={80} icon={<UserOutlined />} className="bg-green-500" />
                    <div>
                        <Title level={3} style={{ margin: 0 }} className="text-gray-800">{user.name}</Title>
                        <Text type="secondary">{user.email || 'Thành viên'}</Text> <br />
                        <Tag color="blue" className="mt-2">Thành viên chính thức</Tag>
                    </div>
                </div>

                <div className="mb-4 flex items-center gap-2">
                    <HistoryOutlined className="text-xl text-green-500" />
                    <Title level={4} style={{ margin: 0 }}>Lịch sử đặt sân</Title>
                </div>

                {loading ? (
                    <div className="text-center py-10"><Spin size="large" /></div>
                ) : (
                    <Table
                        dataSource={bookings}
                        columns={columns}
                        rowKey="id"
                        pagination={{ pageSize: 5 }}
                        bordered
                        className="overflow-x-auto"
                    />
                )}
            </Card>

            {/* MODAL THANH TOÁN QR */}
            <Modal
                title="Quét mã QR để thanh toán"
                open={isPaymentOpen}
                onCancel={() => setIsPaymentOpen(false)}
                footer={[
                    <Button key="back" onClick={() => setIsPaymentOpen(false)}>Đóng</Button>,
                    <Button key="submit" type="primary" onClick={handleConfirmPayment} style={{ background: '#27ae60' }}>
                        Đã chuyển khoản xong
                    </Button>
                ]}
                width={400}
            >
                {currentBooking && (
                    <div style={{ textAlign: 'center' }}>
                        <p className="mb-4">Vui lòng chuyển khoản: <b className="text-red-500 text-lg">{Number(currentBooking.totalPrice).toLocaleString()} đ</b></p>
                        <div className="border p-2 rounded-lg inline-block mb-4">
                            <img
                                src={`https://img.vietqr.io/image/MB-0909123456-compact2.jpg?amount=${currentBooking.totalPrice}&addInfo=Dat san ${currentBooking.id}`}
                                alt="QR Code"
                                style={{ width: '250px' }}
                            />
                        </div>
                        <div className="bg-gray-50 p-3 rounded text-sm text-left">
                            <p className="mb-1">🏦 Ngân hàng: <b>MB Bank</b></p>
                            <p className="mb-1">💳 STK: <b>0909123456</b></p>
                            <p className="mb-1">👤 Chủ TK: <b>NGUYEN VAN A</b></p>
                            <p className="mb-0">📝 Nội dung: <b>Dat san {currentBooking.id}</b></p>
                        </div>
                    </div>
                )}
            </Modal>

            {/* MODAL ĐÁNH GIÁ */}
            <Modal
                title="Đánh giá trải nghiệm"
                open={isReviewOpen}
                onCancel={() => setIsReviewOpen(false)}
                footer={null}
            >
                <Form form={form} onFinish={handleReviewSubmit} layout="vertical">
                    <Form.Item name="rating" label="Mức độ hài lòng" rules={[{ required: true, message: 'Vui lòng chọn sao!' }]}>
                        <Rate />
                    </Form.Item>
                    <Form.Item name="comment" label="Nhận xét">
                        <Input.TextArea rows={4} placeholder="Nhập đánh giá..." />
                    </Form.Item>
                    <div className="flex justify-end gap-2">
                        <Button onClick={() => setIsReviewOpen(false)}>Hủy</Button>
                        <Button type="primary" htmlType="submit" className="bg-green-500">Gửi đánh giá</Button>
                    </div>
                </Form>
            </Modal>
        </div>
    );
};

export default UserProfile;