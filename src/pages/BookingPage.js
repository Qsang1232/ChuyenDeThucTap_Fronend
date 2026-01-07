// src/pages/BookingPage.js
import React, { useState, useEffect } from 'react';
import { Card, Button, Modal, Form, DatePicker, TimePicker, message, Row, Col, Tag } from 'antd';
import axiosClient from '../api/axiosClient';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';

const BookingPage = () => {
    const [courts, setCourts] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCourt, setSelectedCourt] = useState(null);
    const [form] = Form.useForm();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCourts = async () => {
            try {
                const res = await axiosClient.get('/courts');
                setCourts(Array.isArray(res) ? res : (res.data || []));
            } catch (error) {
                console.error(error);
            }
        };
        fetchCourts();
    }, []);

    const handleBookClick = (court) => {
        const user = localStorage.getItem('currentUser');
        if (!user) {
            message.warning("Vui lòng đăng nhập để đặt sân!");
            navigate('/login');
            return;
        }
        setSelectedCourt(court);
        setIsModalOpen(true);
    };

    const handleFinish = async (values) => {
        try {
            const user = JSON.parse(localStorage.getItem('currentUser'));
            // Chuẩn bị dữ liệu gửi lên API
            const bookingData = {
                courtId: selectedCourt.id,
                userId: user.id || 2, // Lấy ID từ token hoặc localStorage (nếu có)
                date: values.date.format('YYYY-MM-DD'),
                startTime: values.startTime.format('HH:mm:ss'),
                endTime: values.endTime.format('HH:mm:ss'),
                totalPrice: selectedCourt.pricePerHour // Tạm tính đơn giản
            };

            await axiosClient.post('/bookings', bookingData);
            message.success("Đặt sân thành công! Vui lòng chờ duyệt.");
            setIsModalOpen(false);
            form.resetFields();
        } catch (error) {
            console.error(error);
            message.error("Đặt sân thất bại! Có thể giờ này đã kín.");
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h1 style={{ color: '#2ecc71' }}>🏸 Danh Sách Sân Cầu Lông</h1>
                <Button onClick={() => navigate('/login')}>Đăng nhập / Đăng ký</Button>
            </div>

            <Row gutter={[24, 24]}>
                {courts.map(court => (
                    <Col xs={24} sm={12} md={8} key={court.id}>
                        <Card
                            hoverable
                            cover={<img alt={court.name} src={court.imageUrl || "https://img.freepik.com/free-vector/badminton-court-indoor-scene_1308-53744.jpg"} style={{ height: '200px', objectFit: 'cover' }} />}
                            actions={[
                                <Button type="primary" style={{ background: '#2ecc71', borderColor: '#2ecc71' }} onClick={() => handleBookClick(court)}>
                                    Đặt Sân Ngay
                                </Button>
                            ]}
                        >
                            <Card.Meta
                                title={court.name}
                                description={
                                    <div>
                                        <p>📍 {court.address}</p>
                                        <p>💰 <b style={{ color: '#e74c3c' }}>{Number(court.pricePerHour).toLocaleString()} đ/h</b></p>
                                        <Tag color="blue">{court.openingTime} - {court.closingTime}</Tag>
                                    </div>
                                }
                            />
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* Modal Đặt Sân */}
            <Modal
                title={`Đặt sân: ${selectedCourt?.name}`}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={null}
            >
                <Form form={form} layout="vertical" onFinish={handleFinish}>
                    <Form.Item name="date" label="Ngày đặt" rules={[{ required: true, message: 'Vui lòng chọn ngày!' }]}>
                        <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" disabledDate={(current) => current && current < dayjs().endOf('day')} />
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="startTime" label="Giờ bắt đầu" rules={[{ required: true }]}>
                                <TimePicker format="HH:mm" minuteStep={30} style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="endTime" label="Giờ kết thúc" rules={[{ required: true }]}>
                                <TimePicker format="HH:mm" minuteStep={30} style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Button type="primary" htmlType="submit" block style={{ marginTop: '10px', height: '40px', background: '#2ecc71' }}>
                        Xác Nhận Đặt
                    </Button>
                </Form>
            </Modal>
        </div>
    );
};

export default BookingPage;