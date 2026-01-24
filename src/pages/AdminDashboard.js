import React, { useState, useEffect } from 'react';
import { Layout, Menu, Card, Table, Button, Modal, Form, Input, InputNumber, TimePicker, message, Row, Col, Tag, Popconfirm, Upload } from 'antd';
import { AppstoreOutlined, CalendarOutlined, PlusOutlined, EditOutlined, DeleteOutlined, CheckCircleOutlined, CloseCircleOutlined, ReloadOutlined, UploadOutlined, LoadingOutlined } from '@ant-design/icons';
import axiosClient from '../api/axiosClient';
import bookingApi from '../api/bookingApi';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

const { Sider, Content } = Layout;
const BACKEND_URL = "http://localhost:8080"; // URL Backend của bạn

const AdminDashboard = () => {
    const [selectedKey, setSelectedKey] = useState('1');
    const [courts, setCourts] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCourt, setEditingCourt] = useState(null);
    const [uploading, setUploading] = useState(false); // State cho upload
    const [imageUrl, setImageUrl] = useState(""); // State để lưu URL ảnh tạm thời
    const [form] = Form.useForm();

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
            setBookings(data.sort((a, b) => b.id - a.id));
        } catch (error) {
            console.error("Lỗi tải booking:", error);
        }
    };

    // --- HÀM UPLOAD ẢNH MỚI ---
    const handleUploadImage = async (info) => {
        const file = info.file;
        const formData = new FormData();
        formData.append("file", file);

        setUploading(true);
        try {
            // Gọi API upload Java
            const response = await axiosClient.post("/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            // Backend trả về: { url: "/uploads/..." }
            const uploadedUrl = response.url || response.data?.url;

            // Cập nhật vào Form và State
            setImageUrl(uploadedUrl);
            form.setFieldsValue({ imageUrl: uploadedUrl });
            message.success("Upload ảnh thành công!");
        } catch (error) {
            console.error(error);
            message.error("Upload thất bại!");
        } finally {
            setUploading(false);
        }
    };

    const handleAdd = () => {
        setEditingCourt(null);
        setImageUrl(""); // Reset ảnh
        form.resetFields();
        form.setFieldsValue({
            openingTime: dayjs('05:00:00', 'HH:mm:ss'),
            closingTime: dayjs('22:00:00', 'HH:mm:ss'),
        });
        setIsModalOpen(true);
    };

    const handleEdit = (record) => {
        setEditingCourt(record);
        setImageUrl(record.imageUrl); // Hiển thị ảnh hiện tại
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
                message.error("Lỗi xóa sân.");
            }
        }
    };

    const handleSave = async (values) => {
        const payload = {
            ...values,
            imageUrl: imageUrl, // Lấy từ state upload
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

    // ... (Giữ nguyên các hàm Booking Confirm/Cancel)
    const handleConfirmBooking = async (id) => {
        try {
            await axiosClient.put(`/bookings/${id}/confirm`);
            message.success("Đã duyệt đơn thành công!");
            fetchBookings();
        } catch (error) { message.error("Lỗi duyệt đơn!"); }
    };
    const handleCancelBooking = async (id) => {
        try {
            await axiosClient.post(`/bookings/${id}/cancel`);
            message.success("Đã hủy đơn thành công!");
            fetchBookings();
        } catch (error) { message.error("Lỗi hủy đơn!"); }
    };

    // Hàm hiển thị ảnh (xử lý link local vs online)
    const renderImage = (url) => {
        if (!url) return null;
        if (url.startsWith("http")) return url;
        return `${BACKEND_URL}${url}`;
    };

    const courtColumns = [
        { title: 'ID', dataIndex: 'id', width: 50 },
        {
            title: 'Ảnh',
            dataIndex: 'imageUrl',
            render: (url) => (
                <img
                    src={renderImage(url)}
                    alt="court"
                    style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 4 }}
                />
            )
        },
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

    const bookingColumns = [
        { title: 'ID', dataIndex: 'id', width: 50 },
        { title: 'Khách hàng', dataIndex: 'username', render: (text) => <span className="font-bold">{text || 'Khách vãng lai'}</span> },
        { title: 'Sân', dataIndex: 'courtName' },
        { title: 'Ngày', dataIndex: 'startTime', render: (t) => t ? dayjs(t).format('DD/MM/YYYY') : '' },
        { title: 'Giờ', render: (_, r) => r.startTime ? `${dayjs(r.startTime).format('HH:mm')} - ${dayjs(r.endTime).format('HH:mm')}` : '' },
        { title: 'Tiền', dataIndex: 'totalPrice', render: (val) => val ? <span className="text-red-500 font-bold">{val.toLocaleString()}</span> : 0 },
        {
            title: 'Trạng thái', dataIndex: 'status', align: 'center',
            render: (status) => {
                let color = status === 'CONFIRMED' ? 'green' : status === 'PENDING' ? 'orange' : status === 'CANCELLED' ? 'red' : 'gold';
                return <Tag color={color}>{status}</Tag>;
            }
        },
        {
            title: 'Hành động',
            render: (_, record) => (
                <div style={{ display: 'flex', gap: '5px' }}>
                    {(record.status === 'PENDING' || record.status === 'WAITING') && (
                        <Popconfirm title="Duyệt đơn này?" onConfirm={() => handleConfirmBooking(record.id)}>
                            <Button type="primary" size="small" style={{ background: '#2ecc71', borderColor: '#2ecc71' }} icon={<CheckCircleOutlined />}>Duyệt</Button>
                        </Popconfirm>
                    )}
                    {(record.status !== 'CANCELLED' && record.status !== 'COMPLETED') && (
                        <Popconfirm title="Hủy đơn này?" onConfirm={() => handleCancelBooking(record.id)}>
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
                        <Card title="Danh sách Sân Cầu Lông" extra={<Button type="primary" icon={<PlusOutlined />} onClick={handleAdd} style={{ background: '#2ecc71' }}>Thêm Sân</Button>}>
                            <Table dataSource={courts} columns={courtColumns} rowKey="id" pagination={{ pageSize: 6 }} />
                        </Card>
                    ) : (
                        <Card title="Danh sách Đơn Đặt Sân" extra={<Button icon={<ReloadOutlined />} onClick={fetchBookings}>Làm mới</Button>}>
                            <Table dataSource={bookings} columns={bookingColumns} rowKey="id" pagination={{ pageSize: 8 }} />
                        </Card>
                    )}
                </Content>
            </Layout>

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

                        {/* --- PHẦN UPLOAD ẢNH ĐÃ SỬA --- */}
                        <Col span={12}>
                            <Form.Item label="Hình ảnh sân">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <Upload
                                        showUploadList={false}
                                        beforeUpload={() => false}
                                        onChange={handleUploadImage}
                                        accept="image/*"
                                    >
                                        <Button icon={uploading ? <LoadingOutlined /> : <UploadOutlined />}>
                                            {uploading ? "Đang tải..." : "Chọn ảnh"}
                                        </Button>
                                    </Upload>

                                    {/* Preview ảnh nhỏ bên cạnh */}
                                    {imageUrl && (
                                        <img
                                            src={renderImage(imageUrl)}
                                            alt="Preview"
                                            style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4, border: '1px solid #ddd' }}
                                        />
                                    )}
                                </div>
                                {/* Input ẩn để giữ giá trị gửi đi */}
                                <Form.Item name="imageUrl" noStyle>
                                    <Input type="hidden" />
                                </Form.Item>
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