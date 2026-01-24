// src/layouts/MainLayout.js
import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar'; // Navbar được gọi ở đây

const MainLayout = () => {
    return (
        <div>
            <Navbar />
            <div className="main-content">
                <Outlet /> {/* Nội dung trang con (Home, Detail...) sẽ hiện ở đây */}
            </div>
        </div>
    );
};

export default MainLayout;