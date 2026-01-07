// src/components/ProtectedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, roleRequired }) => {
    const token = localStorage.getItem('token');
    
    // [QUAN TRỌNG] Lấy đúng key 'currentUser'
    const user = JSON.parse(localStorage.getItem('currentUser'));

    // 1. Chưa đăng nhập -> Đá về Login
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    // 2. Nếu yêu cầu quyền Admin mà user chỉ là USER -> Đá về Home
    if (roleRequired && user?.role !== roleRequired) {
        alert("Bạn không có quyền truy cập trang này!");
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;