// src/layouts/AdminLayout.jsx
import React, { useState } from 'react';
import { Layout, Menu, Avatar, Dropdown, Space } from 'antd';
import { 
  DashboardOutlined, 
  CalendarOutlined, 
  AppstoreOutlined, 
  UserOutlined, 
  LogoutOutlined,
  DownOutlined
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

const { Header, Sider, Content } = Layout;

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Menu bên trái
  const items = [
    { key: '/admin', icon: <DashboardOutlined />, label: 'Thống kê' },
    { key: '/admin/bookings', icon: <CalendarOutlined />, label: 'Quản lý Đặt sân' },
    { key: '/admin/courts', icon: <AppstoreOutlined />, label: 'Quản lý Sân' },
    { key: '/admin/users', icon: <UserOutlined />, label: 'Khách hàng' },
  ];

  // --- SỬA ĐOẠN NÀY ---
  // Thay vì tạo component <Menu>, ta chỉ tạo mảng dữ liệu (items)
  const userMenuItems = [
    { key: '1', label: 'Hồ sơ cá nhân' },
    { 
      key: '2', 
      label: 'Đăng xuất', 
      icon: <LogoutOutlined />, 
      danger: true, 
      onClick: () => navigate('/login') 
    }
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
        <div style={{ height: 32, margin: 16, background: 'rgba(255, 255, 255, 0.2)', color: 'white', textAlign: 'center', lineHeight: '32px', fontWeight: 'bold' }}>
          BADMINTON ADMIN
        </div>
        <Menu 
          theme="dark" 
          mode="inline" 
          defaultSelectedKeys={[location.pathname]} 
          items={items} 
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout>
        <Header style={{ padding: '0 24px', background: '#fff', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
          
          {/* --- SỬA ĐOẠN NÀY --- */}
          {/* Dùng prop 'menu' thay vì 'overlay' cho Ant Design v5 */}
          <Dropdown menu={{ items: userMenuItems }}>
            {/* Dropdown yêu cầu thẻ con nhận sự kiện, bọc trong thẻ a hoặc div để chắc chắn không lỗi */}
            <a onClick={(e) => e.preventDefault()} style={{ cursor: 'pointer' }}>
              <Space>
                <Avatar style={{ backgroundColor: '#87d068' }} icon={<UserOutlined />} />
                <span style={{ color: 'black' }}>Admin</span>
                <DownOutlined style={{ color: 'black' }} />
              </Space>
            </a>
          </Dropdown>

        </Header>
        <Content style={{ margin: '16px' }}>
          <div style={{ padding: 24, minHeight: 360, background: '#fff', borderRadius: '8px' }}>
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;