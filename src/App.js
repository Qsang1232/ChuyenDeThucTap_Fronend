import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import CourtDetail from './pages/CourtDetail';
import UserProfile from './pages/UserProfile';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';

// --- 1. IMPORT CHATBOX ---
import Chatbox from './components/Chatbox';

function App() {
  return (
    <BrowserRouter>
      {/* Wrapper Flexbox để Footer luôn ở dưới cùng */}
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

        <Navbar />

        {/* Phần nội dung chính */}
        <div style={{ flex: 1, background: '#f8f9fa' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/court/:id" element={<CourtDetail />} />

            {/* Các trang cần đăng nhập (User) */}
            <Route path="/profile" element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            } />

            {/* Trang Admin (Chỉ Admin mới vào được) */}
            <Route path="/admin" element={
              <ProtectedRoute roleRequired="ADMIN">
                <AdminDashboard />
              </ProtectedRoute>
            } />
          </Routes>
        </div>

        <Footer />

        {/* --- 2. ĐẶT CHATBOX Ở ĐÂY ĐỂ HIỂN THỊ MỌI LÚC --- */}
        <Chatbox />

      </div>
    </BrowserRouter>
  );
}

export default App;