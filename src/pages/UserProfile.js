import React, { useEffect, useState } from 'react';
import { Card, Table, Tag, Typography, Avatar, Spin, message } from 'antd';
import { UserOutlined, HistoryOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import bookingApi from '../api/bookingApi';
import moment from 'moment';

const { Title, Text } = Typography;

const UserProfile = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Lấy thông tin user từ localStorage
    const user = JSON.parse(localStorage.getItem('currentUser')) || { name: 'Khách hàng', email: 'Chưa cập nhật' };

    useEffect(() => {
        if (!user || user.name === 'Khách hàng') {
            navigate('/login');
            return;
        }

        const fetchHistory = async () => {
            try {
                const res = await bookingApi.getMyBookings();
                const data = Array.isArray(res) ? res : (res.data || []);
                const sortedData = data.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
                setBookings(sortedData);
            } catch (error) {
                console.error("Lỗi tải lịch sử:", error);
                message.error("Không thể tải lịch sử đặt sân.");
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleCancel = async (id) => {
        if (window.confirm("Bạn chắc chắn muốn hủy lịch này?")) {
            try {
                await bookingApi.cancelBooking(id);
                message.success("Đã hủy lịch thành công!");
                // Gọi lại API để cập nhật danh sách
                const res = await bookingApi.getMyBookings();
                const data = Array.isArray(res) ? res : (res.data || []);
                setBookings(data.sort((a, b) => new Date(b.startTime) - new Date(a.startTime)));
            } catch (error) {
                message.error("Hủy thất bại! (Chỉ được hủy trước giờ chơi)");
            }
        }
    };

    const columns = [
        {
            title: 'Sân Cầu Lông',
            dataIndex: 'courtName',
            key: 'courtName',
            render: (text) => <span style={{ fontWeight: 'bold', color: '#2ecc71' }}>{text}</span>,
        },
        {
            title: 'Ngày chơi',
            dataIndex: 'startTime',
            key: 'date',
            render: (text) => moment(text).format('DD/MM/YYYY'),
        },
        {
            title: 'Khung giờ',
            key: 'time',
            render: (_, record) => (
                <span style={{ background: '#f0f2f5', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem' }}>
                    {moment(record.startTime).format('HH:mm')} - {moment(record.endTime).format('HH:mm')}
                </span>
            ),
        },
        {
            title: 'Tổng tiền',
            dataIndex: 'totalPrice',
            key: 'totalPrice',
            render: (price) => <span style={{ color: '#e74c3c', fontWeight: 'bold' }}>{Number(price).toLocaleString()} đ</span>,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            align: 'center',
            render: (status) => {
                let color = status === 'CONFIRMED' ? 'green' : status === 'PENDING' ? 'orange' : 'red';
                let text = status === 'CONFIRMED' ? 'Đã duyệt' : status === 'PENDING' ? 'Chờ duyệt' : 'Đã hủy';
                return <Tag color={color} style={{ minWidth: '80px', textAlign: 'center' }}>{text}</Tag>;
            },
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => (
                (record.status === 'PENDING' || record.status === 'CONFIRMED') && (
                    <button
                        onClick={() => handleCancel(record.id)}
                        style={{ color: '#999', fontSize: '0.85rem', textDecoration: 'underline', border: 'none', background: 'none', cursor: 'pointer' }}
                    >
                        Hủy
                    </button>
                )
            )
        }
    ];

    return (
        <div className="container mx-auto p-6 max-w-5xl">
            <Card className="shadow-md rounded-lg border-none">
                <div className="flex items-center justify-between border-b pb-6 mb-6">
                    <div className="flex items-center gap-6">
                        <Avatar size={80} icon={<UserOutlined />} style={{ backgroundColor: '#2ecc71' }} />
                        <div>
                            <Title level={3} style={{ margin: 0, color: '#2c3e50' }}>{user.name}</Title>
                            <Text type="secondary">{user.email || 'Thành viên BadmintonPro'}</Text> <br />
                            <Tag color="blue" className="mt-2">Thành viên chính thức</Tag>
                        </div>
                    </div>
                </div>

                <div className="mb-4 flex items-center gap-2">
                    <HistoryOutlined style={{ fontSize: '1.2rem', color: '#2ecc71' }} />
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
                    />
                )}
            </Card>
        </div>
    );
};

export default UserProfile;