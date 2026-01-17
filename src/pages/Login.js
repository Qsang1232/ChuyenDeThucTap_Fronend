// src/pages/Login.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import './Login.css';

const Login = () => {
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (errorMessage) setErrorMessage('');
    };

    const switchMode = (mode) => {
        setIsLogin(mode);
        setErrorMessage('');
        setFormData({ fullName: '', email: '', phone: '', password: '', confirmPassword: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMessage('');

        // --- VALIDATE FORM (CLIENT SIDE) ---
        if (!isLogin) {
            if (formData.password.length < 6) {
                setErrorMessage("⚠️ Mật khẩu phải có ít nhất 6 ký tự!");
                setLoading(false);
                return;
            }
            if (formData.password !== formData.confirmPassword) {
                setErrorMessage("⚠️ Mật khẩu xác nhận không khớp!");
                setLoading(false);
                return;
            }
            if (formData.phone.length < 9) {
                setErrorMessage("⚠️ Số điện thoại không hợp lệ!");
                setLoading(false);
                return;
            }
        }

        // --- GỌI API ---
        if (isLogin) {
            // --- XỬ LÝ ĐĂNG NHẬP ---
            try {
                // LƯU Ý QUAN TRỌNG: 
                // Nếu Server trả về lỗi 500, hãy thử đổi 'username' thành 'email' ở dòng dưới đây
                // --- ĐOẠN CODE CẦN SỬA ---
                const res = await axiosClient.post('/auth/login', {
                    username: formData.email, // <--- Sửa dòng này
                    password: formData.password
                });

                // Kiểm tra dữ liệu trả về (tùy theo cấu hình axiosClient)
                // Một số setup trả về res.data, một số trả về res trực tiếp
                const data = res.data || res;

                if (data.token) {
                    const userToSave = {
                        id: data.id,
                        name: formData.email.split('@')[0],
                        token: data.token,
                        avatar: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
                        role: data.role || "USER"
                    };
                    localStorage.setItem('currentUser', JSON.stringify(userToSave));
                    localStorage.setItem('token', data.token);

                    alert("Đăng nhập thành công!");
                    navigate('/');
                    window.location.reload();
                } else {
                    // Trường hợp API trả về 200 nhưng không có token (ví dụ: success: false)
                    setErrorMessage(data.message || "Đăng nhập không thành công!");
                }
            } catch (err) {
                console.error("Lỗi đăng nhập:", err);
                const msg = err.response?.data?.message || "Sai tài khoản hoặc mật khẩu (hoặc lỗi Server)!";
                setErrorMessage(msg);
            }
        } else {
            // --- XỬ LÝ ĐĂNG KÝ ---
            try {
                await axiosClient.post('/auth/register', {
                    username: formData.fullName,
                    email: formData.email,
                    password: formData.password,
                    phone: formData.phone,
                    address: ""
                });

                alert("Đăng ký thành công! Hãy đăng nhập ngay.");
                switchMode(true);

            } catch (err) {
                console.error("Lỗi đăng ký:", err);
                let msg = "Đăng ký thất bại!";
                if (err.response && err.response.data) {
                    const data = err.response.data;
                    // Xử lý lỗi trả về dạng object hoặc string
                    if (typeof data === 'object' && !data.message) {
                        const errorList = Object.values(data);
                        const cleanErrors = errorList.filter(e => typeof e === 'string');
                        if (cleanErrors.length > 0) msg = cleanErrors.join('\n');
                    } else if (data.message) {
                        msg = data.message;
                    }
                }
                setErrorMessage(msg);
            }
        }
        setLoading(false);
    };

    return (
        <div className="login-page">
            <div className="login-card">
                <div className="login-header">
                    <div className="logo-icon">🏸</div>
                    <h2>BadmintonPro</h2>
                    <p>{isLogin ? "Chào mừng trở lại!" : "Tạo tài khoản mới"}</p>
                </div>

                <div className="auth-tabs">
                    <button type="button" className={`tab ${isLogin ? 'active' : ''}`} onClick={() => switchMode(true)}>Đăng nhập</button>
                    <button type="button" className={`tab ${!isLogin ? 'active' : ''}`} onClick={() => switchMode(false)}>Đăng ký</button>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    {!isLogin && (
                        <>
                            <div className="input-group">
                                <input name="fullName" placeholder="Tên hiển thị (Username)" onChange={handleChange} value={formData.fullName} required />
                            </div>

                            <div className="input-group">
                                <input
                                    type="tel"
                                    name="phone"
                                    placeholder="Số điện thoại"
                                    onChange={handleChange}
                                    value={formData.phone}
                                    required
                                />
                            </div>
                        </>
                    )}

                    <div className="input-group">
                        <input name="email" type="text" placeholder="Email đăng nhập" onChange={handleChange} value={formData.email} required />
                    </div>

                    <div className="input-group">
                        <input type="password" name="password" placeholder="Mật khẩu" onChange={handleChange} value={formData.password} required />
                    </div>

                    {!isLogin && (
                        <div className="input-group">
                            <input type="password" name="confirmPassword" placeholder="Xác nhận mật khẩu" onChange={handleChange} value={formData.confirmPassword} required />
                        </div>
                    )}

                    {errorMessage && (
                        <div className="error-message">
                            <span style={{ whiteSpace: 'pre-line' }}>{errorMessage}</span>
                        </div>
                    )}

                    <button className="btn-submit" disabled={loading}>
                        {loading ? "Đang xử lý..." : (isLogin ? "Đăng Nhập" : "Đăng Ký")}
                    </button>
                </form>

                <div className="login-footer">
                    <Link to="/" className="back-link">← Quay lại trang chủ</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;