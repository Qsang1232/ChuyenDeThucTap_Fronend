
import React, { useEffect, useState, useMemo } from "react";
import {
    Layout, Menu, Card, Table, Button, Modal,
    Form, Input, InputNumber, TimePicker,

    Upload, message, Space, Popconfirm, Tag, Select, Tabs,
    Statistic, Row, Col, Typography
} from "antd";
import {

    AppstoreOutlined, CalendarOutlined, LineChartOutlined,
    PlusOutlined, EditOutlined, DeleteOutlined,
    CheckCircleOutlined, CloseCircleOutlined, UploadOutlined
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import courtApi from "../api/courtApi";
import bookingApi from "../api/bookingApi";
import axiosClient from "../api/axiosClient";

const { Sider, Content } = Layout;
const { Title } = Typography;

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [selectedKey, setSelectedKey] = useState("1");

    // Data States
    const [courts, setCourts] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [categories, setCategories] = useState([]); // Cần load danh mục để tạo sân
    const [loading, setLoading] = useState(false);

    // Modal States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCourt, setEditingCourt] = useState(null);
    const [fileList, setFileList] = useState([]);

    const [form] = Form.useForm();

    // ================== REVENUE CALCULATION ==================
    const revenueStats = useMemo(() => {
        if (!bookings || bookings.length === 0) {
            return {
                totalRevenue: 0,
                confirmedBookings: [],
            };
        }

        const confirmedBookings = bookings.filter(b => b.status === 'CONFIRMED');

        // Tính tổng doanh thu (có fallback nếu totalPrice bị thiếu)
        const totalRevenue = confirmedBookings.reduce((sum, b) => {
            let amount = Number(b.totalPrice) || 0;
            // Fallback: Tự tính lại nếu thiếu totalPrice nhưng có thông tin sân
            if (amount === 0 && b.courtId && b.startTime && b.endTime && courts.length > 0) {
                const court = courts.find(c => c.id === b.courtId);
                if (court) {
                    const start = dayjs(b.startTime);
                    const end = dayjs(b.endTime);
                    const hours = end.diff(start, 'hour', true);
                    amount = hours * court.pricePerHour;
                }
            }
            return sum + amount;
        }, 0);

        return {
            totalRevenue,
            confirmedBookings,
        };
    }, [bookings, courts]);

    useEffect(() => {
        // --- PERMISSION CHECK ---
        const user = JSON.parse(localStorage.getItem('currentUser'));
        if (!user || user.role !== 'ADMIN') {
            message.error('Bạn không có quyền truy cập trang này!');
            navigate('/');
            return;
        }

        fetchData();

    }, [navigate]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // 1. Load Categories (Bắt buộc để tạo sân)
            try {
                const catRes = await axiosClient.get('/categories');
                setCategories(catRes.data || []);
            } catch (e) { console.error("Lỗi load category", e); }

            // 2. Load Courts
            try {
                const courtRes = await courtApi.getAll();
                setCourts(Array.isArray(courtRes.data) ? courtRes.data : []);
            } catch (err) { console.error("Lỗi tải sân:", err); }

            // 3. Load Bookings (Admin only)
            try {
                const bookingRes = await bookingApi.getAll(); // Gọi API /api/bookings/all
                // Sắp xếp đơn mới nhất lên đầu
                const list = Array.isArray(bookingRes.data) ? bookingRes.data : [];
                setBookings(list.sort((a, b) => b.id - a.id));
            } catch (err) { console.warn("Lỗi tải booking:", err); }

        } finally {
            setLoading(false);
        }
    };

    // ================== UPLOAD ẢNH (SỬA LOGIC) ==================
    // Backend FileUploadController chỉ nhận 1 file/request -> Phải loop
    const uploadImages = async (files) => {
        const urls = [];
        const backendUrl = 'http://localhost:8080';

        for (const file of files) {

            // TRƯỜNG HỢP 1: File mới, cần upload lên server
            if (file.originFileObj) {
                const formData = new FormData();
                formData.append("file", file.originFileObj); // Key phải là "file" khớp với @RequestParam

                try {
                    const res = await axiosClient.post('/upload', formData, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    });

                    // Backend trả về url tương đối, ví dụ: /uploads/image.png
                    if (res && res.url) {
                        urls.push(res.url);
                    }
                } catch (err) {
                    message.error(`Lỗi upload ảnh ${file.name}`);
                    throw new Error(`Upload failed for ${file.name}`);
                }
            }
            // TRƯỜNG HỢP 2: File cũ, đã có trên server
            else if (file.url) {
                // Chuyển đổi url tuyệt đối về tương đối để lưu DB
                let relativeUrl = file.url;
                if (relativeUrl.startsWith(backendUrl)) {
                    relativeUrl = relativeUrl.substring(backendUrl.length);
                }
                urls.push(relativeUrl);
            }
        }
        return urls;
    };

    // ================== SAVE COURT ==================
    const handleSaveCourt = async (values) => {
        try {
            // 1. Upload ảnh trước
            const imageUrls = await uploadImages(fileList);

            // 2. Chuẩn bị Payload khớp với CourtRequest DTO
            const payload = {
                name: values.name,
                address: values.address,
                pricePerHour: values.pricePerHour,
                description: values.description || "",
                // Backend DTO dùng openingHours/closingHours, định dạng HH:mm
                openingHours: values.openingTime?.format("HH:mm"),
                closingHours: values.closingTime?.format("HH:mm"),
                categoryId: values.categoryId, // Bắt buộc
                imageUrls: imageUrls
            };

            if (editingCourt) {
                await courtApi.update(editingCourt.id, payload);
                message.success("Cập nhật sân thành công!");
            } else {
                await courtApi.create(payload);
                message.success("Tạo sân mới thành công!");
            }

            setIsModalOpen(false);
            setFileList([]);
            fetchData(); // Reload data
        } catch (err) {
            console.error(err);
            message.error("Lỗi khi lưu sân! Vui lòng kiểm tra lại.");
        }
    };

    // ================== BOOKING ACTIONS ==================
    const handleApproveBooking = async (id) => {
        try {
            await axiosClient.put(`/bookings/${id}/confirm`);
            message.success("Đã duyệt đơn!");
            fetchData();
        } catch (error) {
            message.error("Lỗi duyệt đơn");
        }
    };

    const handleCancelBooking = async (id) => {
        try {
            await axiosClient.post(`/bookings/${id}/cancel`);
            message.success("Đã hủy đơn!");
            fetchData();
        } catch (error) {
            message.error("Lỗi hủy đơn");
        }
    };

    // ================== COLUMNS ==================
    const courtColumns = [
        { title: "ID", dataIndex: "id", width: 50 },
        {
            title: "Ảnh",
            dataIndex: "imageUrls",
            render: (urls) => (
                <img
                    src={urls && urls.length > 0
                        ? (urls[0].startsWith('http') ? urls[0] : `http://localhost:8080${urls[0]}`)
                        : "https://via.placeholder.com/50"}
                    alt="san"
                    style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 4 }}
                />
            )
        },
        { title: "Tên sân", dataIndex: "name", width: 200 },
        {
            title: "Giá / giờ",
            dataIndex: "pricePerHour",
            render: v => <span style={{ color: 'red', fontWeight: 'bold' }}>{Number(v).toLocaleString()} đ</span>
        },
        {
            title: "Hành động",
            render: (_, r) => (
                <Space>
                    <Button
                        icon={<EditOutlined />}
                        onClick={() => {
                            setEditingCourt(r);
                            // Setup ảnh để hiển thị trong Upload component
                            const images = (r.imageUrls || []).map((url, index) => ({
                                uid: index,
                                name: `image-${index}`,
                                status: 'done',
                                url: url.startsWith('http') ? url : `http://localhost:8080${url}`
                            }));
                            setFileList(images);

                            form.setFieldsValue({
                                ...r,
                                categoryId: r.category?.id, // Map category object sang ID
                                openingTime: r.openingTime ? dayjs(r.openingTime, "HH:mm:ss") : null,
                                closingTime: r.closingTime ? dayjs(r.closingTime, "HH:mm:ss") : null
                            });
                            setIsModalOpen(true);
                        }}
                    />
                    <Popconfirm title="Xóa sân này?" onConfirm={() => courtApi.delete(r.id).then(fetchData)}>
                        <Button danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                </Space>
            )
        }
    ];

    const bookingColumns = [
        { title: "ID", dataIndex: "id", width: 60 },
        { title: "Khách hàng", dataIndex: "username" },
        { title: "Sân", dataIndex: "courtName" },
        {
            title: "Ngày chơi",
            dataIndex: "startTime",
            render: (t) => dayjs(t).format("DD/MM/YYYY")
        },
        {
            title: "Giờ",
            render: (_, r) => `${dayjs(r.startTime).format("HH:mm")} - ${dayjs(r.endTime).format("HH:mm")}`
        },
        {
            title: "Tổng tiền",
            dataIndex: "totalPrice",
            render: v => `${Number(v).toLocaleString()} đ`
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            render: (status) => {
                let color = 'default';
                if (status === 'CONFIRMED') color = 'green';
                if (status === 'WAITING') color = 'gold'; // Chờ duyệt
                if (status === 'PENDING') color = 'orange';
                if (status === 'CANCELLED') color = 'red';
                return <Tag color={color}>{status}</Tag>;
            }
        },
        {
            title: "Xử lý",
            render: (_, r) => (
                <Space>
                    {/* Chỉ hiện nút Duyệt nếu đang chờ duyệt (WAITING) */}
                    {r.status === 'WAITING' && (
                        <Button type="primary" size="small" icon={<CheckCircleOutlined />} onClick={() => handleApproveBooking(r.id)}>
                            Duyệt
                        </Button>
                    )}

                    {/* Cho phép hủy nếu chưa hoàn thành/hủy */}
                    {['PENDING', 'WAITING', 'CONFIRMED'].includes(r.status) && (
                        <Popconfirm title="Hủy đơn này?" onConfirm={() => handleCancelBooking(r.id)}>
                            <Button danger size="small" icon={<CloseCircleOutlined />} />
                        </Popconfirm>
                    )}
                </Space>
            )
        }
    ];

    const revenueBookingColumns = [
        { title: "ID Đơn", dataIndex: "id", width: 80 },
        { title: "Khách hàng", dataIndex: "username" },
        { title: "Sân", dataIndex: "courtName" },
        {
            title: "Ngày hoàn thành",
            dataIndex: "startTime",
            render: (t) => dayjs(t).format("DD/MM/YYYY")
        },
        {
            title: "Doanh thu",
            dataIndex: "totalPrice",
            align: 'right',
            render: v => <span style={{ color: 'green', fontWeight: 'bold' }}>{Number(v).toLocaleString()} đ</span>,
            sorter: (a, b) => a.totalPrice - b.totalPrice,
        },
    ];

    // ================== RENDER ==================
    return (
        <Layout style={{ minHeight: "100vh" }}>
            <Sider theme="light" collapsible>
                <div style={{ height: 32, margin: 16, background: 'rgba(0, 0, 0, 0.2)', borderRadius: 6 }} />
                <Menu
                    selectedKeys={[selectedKey]}
                    onClick={e => setSelectedKey(e.key)}
                    mode="inline"
                    items={[
                        { key: "1", icon: <AppstoreOutlined />, label: "Quản lý Sân" },

                        { key: "2", icon: <CalendarOutlined />, label: "Quản lý Đặt sân" },
                        { key: "3", icon: <LineChartOutlined />, label: "Thống kê Doanh thu" }
                    ]}
                />
            </Sider>

            <Layout>
                <Content style={{ padding: 24, background: '#f0f2f5' }}>
                    {selectedKey === "1" ? (
                        <Card
                            title="Danh sách sân cầu lông"
                            extra={
                                <Button type="primary" icon={<PlusOutlined />} onClick={() => {
                                    setEditingCourt(null);
                                    setFileList([]);
                                    form.resetFields();
                                    setIsModalOpen(true);
                                }}>
                                    Thêm sân mới
                                </Button>
                            }
                        >
                            <Table
                                columns={courtColumns}
                                dataSource={courts}
                                rowKey="id"
                                loading={loading}
                                pagination={{ pageSize: 5 }}
                            />
                        </Card>

                    ) : selectedKey === "2" ? (
                        <Card title="Quản lý Đặt sân (Booking)">
                            <Table
                                columns={bookingColumns}
                                dataSource={bookings}
                                rowKey="id"
                                loading={loading}
                                pagination={{ pageSize: 10 }}
                            />
                        </Card>
                    ) : (
                        <Card title="Thống kê Doanh thu">
                            <Row gutter={16} style={{ marginBottom: 24 }}>
                                <Col span={12}>
                                    <Card>
                                        <Statistic
                                            title="Tổng Doanh Thu (Từ các đơn đã duyệt)"
                                            value={revenueStats.totalRevenue}
                                            precision={0}
                                            valueStyle={{ color: '#3f8600', fontSize: 28 }}
                                            suffix="đ"
                                        />
                                    </Card>
                                </Col>
                                <Col span={12}>
                                    <Card>
                                        <Statistic
                                            title="Tổng Số Lượng Đơn Thành Công"
                                            value={revenueStats.confirmedBookings.length}
                                            valueStyle={{ color: '#1890ff', fontSize: 28 }}
                                            suffix="đơn"
                                        />
                                    </Card>
                                </Col>
                            </Row>

                            <Title level={4} style={{ marginTop: 20 }}>Chi tiết các đơn hàng đã hoàn thành</Title>
                            <Table
                                columns={revenueBookingColumns}
                                dataSource={revenueStats.confirmedBookings}
                                rowKey="id"
                                pagination={{ pageSize: 10 }}
                            />
                        </Card>
                    )}
                </Content>
            </Layout>

            {/* ================== MODAL FORM ================== */}
            <Modal
                open={isModalOpen}
                title={editingCourt ? "Cập nhật thông tin sân" : "Thêm sân mới"}
                footer={null}
                onCancel={() => setIsModalOpen(false)}
                width={700}
            >
                <Form layout="vertical" form={form} onFinish={handleSaveCourt}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <Form.Item name="name" label="Tên sân" rules={[{ required: true, message: 'Nhập tên sân' }]}>
                            <Input placeholder="Ví dụ: Sân số 1" />
                        </Form.Item>

                        <Form.Item name="categoryId" label="Khu vực / Loại sân" rules={[{ required: true, message: 'Chọn khu vực' }]}>
                            <Select placeholder="Chọn khu vực">
                                {categories.map(cat => (
                                    <Select.Option key={cat.id} value={cat.id}>{cat.name}</Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </div>

                    <Form.Item name="address" label="Địa chỉ chi tiết" rules={[{ required: true }]}>
                        <Input placeholder="Số nhà, đường, phường..." />
                    </Form.Item>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                        <Form.Item name="pricePerHour" label="Giá / giờ (VNĐ)" rules={[{ required: true }]}>
                            <InputNumber style={{ width: "100%" }} formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
                        </Form.Item>

                        <Form.Item name="openingTime" label="Giờ mở cửa" rules={[{ required: true }]}>
                            <TimePicker format="HH:mm" style={{ width: "100%" }} />
                        </Form.Item>

                        <Form.Item name="closingTime" label="Giờ đóng cửa" rules={[{ required: true }]}>
                            <TimePicker format="HH:mm" style={{ width: "100%" }} />
                        </Form.Item>
                    </div>

                    <Form.Item name="description" label="Mô tả sân">
                        <Input.TextArea rows={3} />
                    </Form.Item>

                    <Form.Item label="Hình ảnh sân (Tối đa 5 ảnh)">
                        <Upload
                            listType="picture-card"
                            fileList={fileList}
                            onPreview={(file) => window.open(file.url || file.thumbUrl, '_blank')}
                            onChange={({ fileList: newFileList }) => setFileList(newFileList)}
                            beforeUpload={() => false} // Chặn auto upload, để xử lý khi bấm Save
                            maxCount={5}
                            multiple
                        >
                            {fileList.length < 5 && <div><PlusOutlined /><div style={{ marginTop: 8 }}>Upload</div></div>}
                        </Upload>
                    </Form.Item>

                    <div style={{ textAlign: 'right', marginTop: 20 }}>
                        <Button onClick={() => setIsModalOpen(false)} style={{ marginRight: 8 }}>Hủy</Button>
                        <Button type="primary" htmlType="submit" loading={loading}>
                            {editingCourt ? "Cập nhật" : "Lưu sân"}
                        </Button>
                    </div>
                </Form>
            </Modal>
        </Layout>
    );
};

export default AdminDashboard;
