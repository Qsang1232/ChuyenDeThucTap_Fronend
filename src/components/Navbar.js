import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
// --- SỬA DÒNG NÀY: Thêm Modal vào import ---
import { Dropdown, Avatar, Space, Button, Modal } from 'antd';
import {
    UserOutlined,
    LogoutOutlined,
    AppstoreOutlined,
    DownOutlined,
    HistoryOutlined
} from '@ant-design/icons';

const Navbar = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('currentUser'));

    const handleLogout = () => {
        // Bây giờ Modal đã được import nên đoạn này sẽ chạy ngon lành
        Modal.confirm({
            title: 'Xác nhận',
            content: 'Bạn có chắc chắn muốn đăng xuất?',
            onOk: () => {
                localStorage.removeItem('token');
                localStorage.removeItem('currentUser');
                navigate('/login');
            }
        });
    };

    // Menu xổ xuống cho User
    const items = [
        {
            key: '1',
            label: <Link to="/profile">Hồ sơ & Lịch sử</Link>,
            icon: <HistoryOutlined />,
        },
        user?.role === 'ADMIN' && {
            key: '2',
            label: <Link to="/admin">Trang Quản Trị</Link>,
            icon: <AppstoreOutlined />,
        },
        {
            type: 'divider',
        },
        {
            key: '3',
            label: 'Đăng xuất',
            icon: <LogoutOutlined />,
            danger: true,
            onClick: () => {
                if (window.confirm("Đăng xuất ngay?")) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('currentUser');
                    navigate('/login');
                }
            }
        },
    ].filter(Boolean); // Lọc bỏ giá trị false nếu không phải admin

    return (
        <nav style={{
            background: 'linear-gradient(135deg, #00b09b 0%, #96c93d 100%)', // Gradient hiện đại hơn
            padding: '0 50px',
            height: '70px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            position: 'sticky', top: 0, zIndex: 1000
        }}>
            {/* LOGO */}
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
                <div style={{ background: '#fff', borderRadius: '50%', padding: '8px' }}>
                    <span style={{ fontSize: '24px' }}>🏸</span>
                </div>
                <span style={{
                    color: '#fff',
                    fontSize: '1.5rem',
                    fontWeight: '800',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                    BadmintonPro
                </span>
            </Link>

            {/* MENU CENTER */}
            <div style={{ display: 'flex', gap: '40px' }}>
                {['Trang chủ', 'Đặt sân', 'Tin tức', 'Liên hệ'].map((item, index) => (
                    <Link key={index} to="/" style={{
                        color: 'rgba(255,255,255,0.9)',
                        textDecoration: 'none',
                        fontSize: '16px',
                        fontWeight: '500',
                        transition: 'all 0.3s'
                    }} className="hover:text-white hover:scale-105">
                        {item}
                    </Link>
                ))}
            </div>

            {/* USER AREA */}
            <div>
                {user ? (
                    <Dropdown menu={{ items }} trigger={['click']} placement="bottomRight">
                        <Space style={{ cursor: 'pointer', background: 'rgba(255,255,255,0.2)', padding: '5px 15px', borderRadius: '30px' }}>
                            <Avatar style={{ backgroundColor: '#fde3cf', color: '#f56a00' }} icon={<UserOutlined />} />
                            <span style={{ color: '#fff', fontWeight: '600' }}>{user.name}</span>
                            <DownOutlined style={{ color: '#fff', fontSize: '12px' }} />
                        </Space>
                    </Dropdown>
                ) : (
                    <Space>
                        <Link to="/login">
                            <Button type="text" style={{ color: '#fff', fontWeight: 'bold' }}>Đăng nhập</Button>
                        </Link>
                        <Link to="/register">
                            <Button shape="round" style={{ background: '#fff', color: '#27ae60', border: 'none', fontWeight: 'bold' }}>
                                Đăng ký ngay
                            </Button>
                        </Link>
                    </Space>
                )}
            </div>
        </nav>
    );
};

export default Navbar;