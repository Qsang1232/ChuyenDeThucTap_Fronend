import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer'; // Nhớ tạo file này
import Home from './pages/Home';
import Login from './pages/Login';
import CourtDetail from './pages/CourtDetail';
import UserProfile from './pages/UserProfile';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
// import BookingPage from './pages/BookingPage'; // Tạm ẩn nếu chưa dùng

function App() {
  return (
    <BrowserRouter>
      {/* Wrapper Flexbox để Footer luôn ở dưới cùng */}
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

        <Navbar />

        {/* Phần nội dung chính (Co giãn để đẩy Footer xuống) */}
        <div style={{ flex: 1, background: '#f8f9fa' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/court/:id" element={<CourtDetail />} />

            {/* Route Booking (Nếu cần trang riêng) */}
            {/* <Route path="/booking" element={<BookingPage />} /> */}

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
      </div>
    </BrowserRouter>
  );
}

export default App;