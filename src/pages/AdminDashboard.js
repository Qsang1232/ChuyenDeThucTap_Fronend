import React, { useState, useEffect } from 'react';
import { Layout, Menu, Card, Table, Button, Modal, Form, Input, InputNumber, TimePicker, message, Row, Col, Tag, Popconfirm } from 'antd';
import { AppstoreOutlined, CalendarOutlined, PlusOutlined, EditOutlined, DeleteOutlined, CheckCircleOutlined, CloseCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import axiosClient from '../api/axiosClient';
import bookingApi from '../api/bookingApi';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

const { Sider, Content } = Layout;

const AdminDashboard = () => {
    const [selectedKey, setSelectedKey] = useState('1'); // 1: Sân, 2: Booking
    const [courts, setCourts] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCourt, setEditingCourt] = useState(null);
    const [form] = Form.useForm();

    // Load dữ liệu khi vào trang
    useEffect(() => {
        fetchCourts();
        fetchBookings();
    }, []);

    const fetchCourts = async () => {
        try {
            const res = await axiosClient.get('/courts');
            const data = Array.isArray(res) ? res : (res.data || []);
            setCourts(data);
        } catch (error) {
            console.error("Lỗi tải sân:", error);
        }
    };

    const fetchBookings = async () => {
        try {
            const res = await bookingApi.getAll();
            const data = Array.isArray(res) ? res : (res.data || []);
            // Sắp xếp: ID lớn nhất (mới nhất) lên đầu
            setBookings(data.sort((a, b) => b.id - a.id));
        } catch (error) {
            console.error("Lỗi tải booking:", error);
        }
    };

    // --- 1. QUẢN LÝ SÂN (CRUD) ---
    const handleAdd = () => {
        setEditingCourt(null);
        form.resetFields();
        // Mặc định ảnh đẹp
        form.setFieldsValue({
            imageUrl: "https://cdn.shopvnb.com/uploads/images/tin_tuc/bo-cau-long-1.webp",
            openingTime: dayjs('05:00:00', 'HH:mm:ss'),
            closingTime: dayjs('22:00:00', 'HH:mm:ss'),
        });
        setIsModalOpen(true);
    };

    const handleEdit = (record) => {
        setEditingCourt(record);
        form.setFieldsValue({
            ...record,
            openingTime: record.openingTime ? dayjs(record.openingTime, 'HH:mm:ss') : null,
            closingTime: record.closingTime ? dayjs(record.closingTime, 'HH:mm:ss') : null,
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Cảnh báo: Xóa sân sẽ xóa luôn lịch sử đặt của sân đó. Tiếp tục?")) {
            try {
                await axiosClient.delete(`/courts/${id}`);
                message.success("Đã xóa sân!");
                fetchCourts();
            } catch (error) {
                message.error("Lỗi xóa sân (Có thể do ràng buộc dữ liệu).");
            }
        }
    };

    const handleSave = async (values) => {
        const payload = {
            ...values,
            openingTime: values.openingTime ? values.openingTime.format('HH:mm:ss') : '05:00:00',
            closingTime: values.closingTime ? values.closingTime.format('HH:mm:ss') : '22:00:00',
            categoryId: 1
        };

        try {
            if (editingCourt) {
                await axiosClient.put(`/courts/${editingCourt.id}`, payload);
                message.success("Cập nhật sân thành công!");
            } else {
                await axiosClient.post('/courts', payload);
                message.success("Thêm sân thành công!");
            }
            setIsModalOpen(false);
            fetchCourts();
        } catch (error) {
            message.error("Lỗi lưu dữ liệu!");
        }
    };

    // --- 2. QUẢN LÝ ĐẶT SÂN ---

    // Duyệt đơn (CONFIRM)
    const handleConfirmBooking = async (id) => {
        try {
            await axiosClient.put(`/bookings/${id}/confirm`);
            message.success("Đã duyệt đơn thành công!");
            fetchBookings();
        } catch (error) {
            message.error("Lỗi duyệt đơn!");
        }
    };

    // Hủy đơn (CANCEL)
    const handleCancelBooking = async (id) => {
        try {
            await axiosClient.post(`/bookings/${id}/cancel`);
            message.success("Đã hủy đơn thành công!");
            fetchBookings();
        } catch (error) {
            const msg = error.response?.data?.message || "Lỗi hủy đơn!";
            message.error(msg);
        }
    };

    // Cấu hình Cột Bảng Sân
    const courtColumns = [
        { title: 'ID', dataIndex: 'id', width: 50 },
        { title: 'Tên sân', dataIndex: 'name', width: 200 },
        { title: 'Địa chỉ', dataIndex: 'address' },
        { title: 'Giá/h', dataIndex: 'pricePerHour', render: (val) => val ? val.toLocaleString() : 0 },
        {
            title: 'Hành động',
            width: 150,
            render: (_, record) => (
                <div style={{ display: 'flex', gap: '8px' }}>
                    <Button type="primary" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
                    <Button type="primary" danger size="small" icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} />
                </div>
            )
        }
    ];

    // Cấu hình Cột Bảng Booking
    const bookingColumns = [
        { title: 'ID', dataIndex: 'id', width: 50 },
        {
            title: 'Khách hàng',
            dataIndex: 'username',
            render: (text) => <span style={{ fontWeight: 'bold' }}>{text || 'Khách vãng lai'}</span>
        },
        { title: 'Sân', dataIndex: 'courtName' },
        { title: 'Ngày', dataIndex: 'startTime', render: (t) => t ? dayjs(t).format('DD/MM/YYYY') : '' },
        { title: 'Giờ', render: (_, r) => r.startTime ? `${dayjs(r.startTime).format('HH:mm')} - ${dayjs(r.endTime).format('HH:mm')}` : '' },
        { title: 'Tiền', dataIndex: 'totalPrice', render: (val) => val ? <span style={{ color: 'red', fontWeight: 'bold' }}>{val.toLocaleString()}</span> : 0 },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            align: 'center',
            render: (status) => {
                let color = 'default';
                let text = status;

                if (status === 'CONFIRMED') { color = 'green'; text = 'Đã duyệt'; }
                else if (status === 'PENDING') { color = 'orange'; text = 'Chờ duyệt'; }
                else if (status === 'WAITING') { color = 'gold'; text = 'Đợi xác nhận'; }
                else if (status === 'CANCELLED') { color = 'red'; text = 'Đã hủy'; }

                return <Tag color={color}>{text}</Tag>;
            }
        },
        {
            title: 'Hành động',
            render: (_, record) => (
                <div style={{ display: 'flex', gap: '5px' }}>
                    {/* Nút DUYỆT: Hiện khi PENDING hoặc WAITING */}
                    {(record.status === 'PENDING' || record.status === 'WAITING') && (
                        <Popconfirm
                            title={record.status === 'WAITING' ? "Xác nhận tiền đã về tài khoản?" : "Duyệt đơn này?"}
                            onConfirm={() => handleConfirmBooking(record.id)}
                        >
                            <Button type="primary" size="small" style={{ background: '#2ecc71', borderColor: '#2ecc71' }} icon={<CheckCircleOutlined />}>
                                {record.status === 'WAITING' ? 'Duyệt TT' : 'Duyệt'}
                            </Button>
                        </Popconfirm>
                    )}

                    {/* Nút HỦY: Hiện khi chưa bị Hủy và chưa Hoàn thành */}
                    {(record.status !== 'CANCELLED' && record.status !== 'COMPLETED') && (
                        <Popconfirm title="Bạn chắc chắn muốn hủy đơn này?" onConfirm={() => handleCancelBooking(record.id)} okText="Hủy ngay" cancelText="Không">
                            <Button type="primary" danger size="small" icon={<CloseCircleOutlined />}>Hủy</Button>
                        </Popconfirm>
                    )}
                </div>
            )
        }
    ];

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider theme="light" collapsible width={250}>
                <div className="p-4 text-center font-bold text-xl text-green-600 border-b">ADMIN PANEL</div>
                <Menu
                    mode="inline"
                    defaultSelectedKeys={['1']}
                    onClick={(e) => setSelectedKey(e.key)}
                    style={{ marginTop: '10px' }}
                    items={[
                        { key: '1', icon: <AppstoreOutlined />, label: 'Quản lý Sân Cầu Lông' },
                        { key: '2', icon: <CalendarOutlined />, label: 'Quản lý Đặt Sân' },
                    ]}
                />
            </Sider>
            <Layout className="p-6 bg-gray-100">
                <Content>
                    {selectedKey === '1' ? (
                        <Card
                            title="Danh sách Sân Cầu Lông"
                            extra={
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <Button icon={<ReloadOutlined />} onClick={fetchCourts}>Tải lại</Button>
                                    <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd} style={{ background: '#2ecc71', borderColor: '#2ecc71' }}>Thêm Sân</Button>
                                </div>
                            }
                        >
                            <Table dataSource={courts} columns={courtColumns} rowKey="id" pagination={{ pageSize: 6 }} />
                        </Card>
                    ) : (
                        <Card
                            title="Danh sách Đơn Đặt Sân"
                            extra={<Button icon={<ReloadOutlined />} onClick={fetchBookings}>Làm mới</Button>}
                        >
                            <Table dataSource={bookings} columns={bookingColumns} rowKey="id" pagination={{ pageSize: 8 }} />
                        </Card>
                    )}
                </Content>
            </Layout>

            {/* Modal Form */}
            <Modal
                title={editingCourt ? "Sửa Sân" : "Thêm Sân"}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={null}
                width={600}
            >
                <Form form={form} layout="vertical" onFinish={handleSave}>
                    <Form.Item name="name" label="Tên sân" rules={[{ required: true, message: 'Vui lòng nhập tên sân' }]}>
                        <Input placeholder="Ví dụ: Sân Cầu Lông Số 1" />
                    </Form.Item>

                    <Form.Item name="address" label="Địa chỉ" rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}>
                        <Input placeholder="Ví dụ: 123 Nguyễn Trãi, Quận 1" />
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="pricePerHour" label="Giá (VNĐ/h)" rules={[{ required: true, message: 'Nhập giá tiền' }]}>
                                <InputNumber style={{ width: '100%' }} min={0} step={1000} formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} parser={value => value.replace(/\$\s?|(,*)/g, '')} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="imageUrl" label="Link Ảnh">
                                <Input placeholder="https://..." />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="openingTime" label="Giờ mở cửa" rules={[{ required: true, message: 'Chọn giờ mở' }]}>
                                <TimePicker format="HH:mm" style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="closingTime" label="Giờ đóng cửa" rules={[{ required: true, message: 'Chọn giờ đóng' }]}>
                                <TimePicker format="HH:mm" style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item name="description" label="Mô tả">
                        <Input.TextArea rows={3} placeholder="Mô tả về sân..." />
                    </Form.Item>

                    <div className="flex justify-end gap-2 mt-4">
                        <Button onClick={() => setIsModalOpen(false)}>Hủy</Button>
                        <Button type="primary" htmlType="submit" style={{ background: '#2ecc71', borderColor: '#2ecc71' }}>
                            {editingCourt ? "Cập nhật" : "Lưu lại"}
                        </Button>
                    </div>
                </Form>
            </Modal>
        </Layout>
    );
};

export default AdminDashboard;