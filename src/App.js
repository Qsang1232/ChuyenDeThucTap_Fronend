import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import CourtDetail from './pages/CourtDetail';
import UserProfile from './pages/UserProfile';
import AdminDashboard from './pages/AdminDashboard'; // Nếu bạn đã tạo file này
import ProtectedRoute from './components/ProtectedRoute';
import BookingPage from './pages/BookingPage';

// ... bên trong <Routes>


function App() {
  return (
    <BrowserRouter>
      <Navbar /> {/* Navbar luôn hiện */}

      <div style={{ minHeight: '80vh', background: '#f8f9fa' }}>
        <Routes>
          <Route path="/booking" element={<BookingPage />} />
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/court/:id" element={<CourtDetail />} />

          {/* Các trang cần đăng nhập */}
          <Route path="/profile" element={
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          } />

          {/* Trang Admin */}
          <Route path="/admin" element={
            <ProtectedRoute roleRequired="ADMIN">
              <AdminDashboard />
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;