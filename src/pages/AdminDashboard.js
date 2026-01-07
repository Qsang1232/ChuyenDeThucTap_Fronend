// src/pages/AdminDashboard.js
import React, { useState, useEffect } from 'react';
import { Layout, Menu, Table, Button, Modal, Form, Input, TimePicker, message, Popconfirm, Card, Row, Col } from 'antd';
import { AppstoreOutlined, CalendarOutlined, LogoutOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import dayjs from 'dayjs'; // Dùng dayjs thay moment
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

const { Sider, Content } = Layout;

const AdminDashboard = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [selectedKey, setSelectedKey] = useState('1');
    const [courts, setCourts] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCourt, setEditingCourt] = useState(null);
    const [form] = Form.useForm();
    const navigate = useNavigate();

    // --- LẤY DỮ LIỆU ---
    const fetchCourts = async () => {
        try {
            const res = await axiosClient.get('/courts');
            // Kiểm tra kỹ dữ liệu trả về là mảng hay object
            setCourts(Array.isArray(res) ? res : (res.data || []));
        } catch (error) {
            console.error(error);
            // message.error("Lỗi tải danh sách sân!");
        }
    };

    const fetchBookings = async () => {
        try {
            // Giả sử API lấy hết booking là /bookings/all hoặc /bookings
            const res = await axiosClient.get('/bookings');
            setBookings(Array.isArray(res) ? res : (res.data || []));
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchCourts();
        fetchBookings();
    }, []);

    // --- XỬ LÝ ĐĂNG XUẤT ---
    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    // --- XỬ LÝ THÊM / SỬA SÂN ---
    const handleAddCourt = () => {
        setEditingCourt(null);
        form.resetFields();
        setIsModalOpen(true);
    };

    const handleEditCourt = (record) => {
        setEditingCourt(record);
        // Convert chuỗi giờ sang dayjs object để hiện lên form
        form.setFieldsValue({
            ...record,
            openingTime: record.openingTime ? dayjs(record.openingTime, 'HH:mm:ss') : null,
            closingTime: record.closingTime ? dayjs(record.closingTime, 'HH:mm:ss') : null,
        });
        setIsModalOpen(true);
    };

    const handleDeleteCourt = async (id) => {
        try {
            await axiosClient.delete(`/courts/${id}`);
            message.success("Xóa sân thành công!");
            fetchCourts();
        } catch (error) {
            message.error("Lỗi khi xóa sân!");
        }
    };

    const handleSave = async (values) => {
        try {
            // Convert dayjs object thành chuỗi HH:mm:ss gửi về server
            const payload = {
                ...values,
                openingTime: values.openingTime ? values.openingTime.format('HH:mm:ss') : null,
                closingTime: values.closingTime ? values.closingTime.format('HH:mm:ss') : null,
                categoryId: 1 // Hardcode tạm nếu chưa có category
            };

            if (editingCourt) {
                await axiosClient.put(`/courts/${editingCourt.id}`, payload);
                message.success("Cập nhật sân thành công!");
            } else {
                await axiosClient.post('/courts', payload);
                message.success("Thêm sân mới thành công!");
            }
            setIsModalOpen(false);
            fetchCourts();
        } catch (error) {
            message.error("Lỗi lưu thông tin sân!");
        }
    };

    // --- CẤU HÌNH CỘT BẢNG ---
    const courtColumns = [
        { title: 'ID', dataIndex: 'id', key: 'id', width: 50 },
        { title: 'Tên sân', dataIndex: 'name', key: 'name' },
        { title: 'Địa chỉ', dataIndex: 'address', key: 'address' },
        { title: 'Giá/Giờ', dataIndex: 'pricePerHour', key: 'pricePerHour', render: (val) => val ? val.toLocaleString() : 0 },
        { title: 'Giờ mở', dataIndex: 'openingTime', key: 'openingTime' },
        { title: 'Giờ đóng', dataIndex: 'closingTime', key: 'closingTime' },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => (
                <>
                    <Button icon={<EditOutlined />} onClick={() => handleEditCourt(record)} style={{ marginRight: 8, color: 'blue' }} />
                    <Popconfirm title="Bạn có chắc muốn xóa?" onConfirm={() => handleDeleteCourt(record.id)}>
                        <Button icon={<DeleteOutlined />} danger />
                    </Popconfirm>
                </>
            ),
        },
    ];

    const bookingColumns = [
        { title: 'ID', dataIndex: 'id', key: 'id' },
        { title: 'User ID', dataIndex: 'userId', key: 'userId' }, // Nếu backend trả về username thì đổi thành dataIndex: 'username'
        { title: 'Sân ID', dataIndex: 'courtId', key: 'courtId' }, // Tương tự với courtName
        { title: 'Ngày', dataIndex: 'date', key: 'date', render: (t) => t ? dayjs(t).format('DD/MM/YYYY') : '' },
        { title: 'Giờ', key: 'time', render: (_, r) => `${r.startTime ? r.startTime.slice(0, 5) : ''} - ${r.endTime ? r.endTime.slice(0, 5) : ''}` },
        { title: 'Tổng tiền', dataIndex: 'totalPrice', key: 'totalPrice', render: (val) => val ? val.toLocaleString() : '' },
        { title: 'Trạng thái', dataIndex: 'status', key: 'status', render: (st) => <span style={{ color: st === 'APPROVED' ? 'green' : 'orange' }}>{st}</span> }
    ];

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed}>
                <div style={{ height: 32, margin: 16, background: 'rgba(255, 255, 255, 0.2)', textAlign: 'center', color: 'white', lineHeight: '32px' }}>ADMIN</div>
                <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline" onClick={(e) => setSelectedKey(e.key)}>
                    <Menu.Item key="1" icon={<AppstoreOutlined />}>Quản lý sân</Menu.Item>
                    <Menu.Item key="2" icon={<CalendarOutlined />}>Đơn đặt sân</Menu.Item>
                    <Menu.Item key="3" icon={<LogoutOutlined />} onClick={handleLogout}>Đăng xuất</Menu.Item>
                </Menu>
            </Sider>
            <Layout className="site-layout">
                <Content style={{ margin: '16px' }}>
                    <Card>
                        {selectedKey === '1' && (
                            <>
                                <Button type="primary" icon={<PlusOutlined />} onClick={handleAddCourt} style={{ marginBottom: 16 }}>Thêm sân mới</Button>
                                <Table dataSource={courts} columns={courtColumns} rowKey="id" />
                            </>
                        )}
                        {selectedKey === '2' && (
                            <Table dataSource={bookings} columns={bookingColumns} rowKey="id" />
                        )}
                    </Card>
                </Content>
            </Layout>

            {/* Modal Thêm/Sửa Sân */}
            <Modal title={editingCourt ? "Sửa sân" : "Thêm sân mới"} open={isModalOpen} onCancel={() => setIsModalOpen(false)} footer={null}>
                <Form form={form} layout="vertical" onFinish={handleSave}>
                    <Form.Item name="name" label="Tên sân" rules={[{ required: true }]}> <Input /> </Form.Item>
                    <Form.Item name="address" label="Địa chỉ"> <Input /> </Form.Item>
                    <Form.Item name="pricePerHour" label="Giá mỗi giờ" rules={[{ required: true }]}> <Input type="number" /> </Form.Item>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="openingTime" label="Giờ mở cửa"> <TimePicker format="HH:mm:ss" style={{ width: '100%' }} /> </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="closingTime" label="Giờ đóng cửa"> <TimePicker format="HH:mm:ss" style={{ width: '100%' }} /> </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item name="imageUrl" label="Link ảnh"> <Input /> </Form.Item>
                    <Form.Item name="description" label="Mô tả"> <Input.TextArea /> </Form.Item>
                    <Button type="primary" htmlType="submit" block>Lưu thông tin</Button>
                </Form>
            </Modal>
        </Layout>
    );
};

export default AdminDashboard;