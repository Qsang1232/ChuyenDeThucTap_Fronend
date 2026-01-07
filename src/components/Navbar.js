import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserOutlined, LogoutOutlined, AppstoreOutlined } from '@ant-design/icons'; // Thêm icon cho đẹp

const Navbar = () => {
    const navigate = useNavigate();
    // Lấy thông tin user từ localStorage (an toàn hơn khi parse)
    const user = JSON.parse(localStorage.getItem('currentUser'));

    const handleLogout = () => {
        if (window.confirm("Bạn muốn đăng xuất?")) {
            localStorage.removeItem('token');
            localStorage.removeItem('currentUser');
            navigate('/login');
        }
    };

    return (
        <nav style={{
            background: 'linear-gradient(90deg, #2ecc71 0%, #27ae60 100%)',
            color: '#fff',
            padding: '12px 40px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            position: 'sticky', top: 0, zIndex: 1000
        }}>
            {/* LOGO */}
            <div className="logo">
                <Link to="/" style={{ color: '#fff', textDecoration: 'none', fontSize: '1.6rem', fontWeight: '800', letterSpacing: '1px' }}>
                    🏸 BadmintonPro
                </Link>
            </div>

            {/* MENU BÊN PHẢI */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
                <Link to="/" style={{ color: '#fff', textDecoration: 'none', fontWeight: '500', fontSize: '1rem', transition: '0.3s' }}>
                    Trang chủ
                </Link>
                <a href="/#search" style={{ color: '#fff', textDecoration: 'none', fontWeight: '500', fontSize: '1rem', transition: '0.3s' }}>
                    Tìm sân
                </a>

                {user ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', background: 'rgba(255,255,255,0.15)', padding: '5px 15px', borderRadius: '30px' }}>
                        {/* NÚT ADMIN (Chỉ hiện khi là Admin) */}
                        {user.role === 'ADMIN' && (
                            <Link
                                to="/admin"
                                style={{
                                    background: '#f1c40f',
                                    color: '#2c3e50',
                                    padding: '6px 12px',
                                    borderRadius: '20px',
                                    textDecoration: 'none',
                                    fontWeight: 'bold',
                                    fontSize: '0.85rem',
                                    display: 'flex', alignItems: 'center', gap: '5px',
                                    boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                                }}
                            >
                                <AppstoreOutlined /> QUẢN TRỊ
                            </Link>
                        )}

                        {/* TÊN USER & PROFILE */}
                        <Link to="/profile" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <UserOutlined /> Hi, {user.name}
                        </Link>

                        <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.5)' }}></div>

                        {/* NÚT ĐĂNG XUẤT */}
                        <button
                            onClick={handleLogout}
                            style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                            title="Đăng xuất"
                        >
                            <LogoutOutlined style={{ fontSize: '1.2rem' }} />
                        </button>
                    </div>
                ) : (
                    <Link to="/login" style={{
                        background: '#fff', color: '#27ae60', padding: '8px 25px',
                        borderRadius: '25px', fontWeight: 'bold', textDecoration: 'none',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                    }}>
                        Đăng nhập
                    </Link>
                )}
            </div>
        </nav>
    );
};

export default Navbar;