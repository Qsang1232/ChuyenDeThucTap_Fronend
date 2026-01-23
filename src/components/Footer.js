import React from 'react';
import {
    FacebookFilled,
    InstagramFilled,
    YoutubeFilled,
    MailOutlined,
    PhoneOutlined,
    EnvironmentOutlined
} from '@ant-design/icons';
import { Typography, Row, Col, Divider } from 'antd';

const { Title, Text, Link } = Typography;

const Footer = () => {
    return (
        <footer style={{ background: '#001529', color: '#fff', paddingTop: '60px', paddingBottom: '20px', marginTop: 'auto' }}>
            <div className="container mx-auto px-6">
                <Row gutter={[40, 20]}>
                    {/* Cột 1: Thông tin chung */}
                    <Col xs={24} md={8}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                            <span style={{ fontSize: '30px' }}>🏸</span>
                            <Title level={3} style={{ color: '#fff', margin: 0 }}>BadmintonPro</Title>
                        </div>
                        <Text style={{ color: 'rgba(255,255,255,0.65)', lineHeight: '1.8' }}>
                            Nền tảng đặt sân cầu lông số 1 Việt Nam. Kết nối đam mê, nâng tầm sức khỏe.
                            Đặt sân nhanh chóng, thanh toán tiện lợi chỉ với vài cú click.
                        </Text>
                    </Col>

                    {/* Cột 2: Liên kết nhanh */}
                    <Col xs={24} sm={12} md={5}>
                        <Title level={5} style={{ color: '#fff', marginBottom: '20px' }}>VỀ CHÚNG TÔI</Title>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <Link href="#" style={{ color: 'rgba(255,255,255,0.65)' }}>Giới thiệu</Link>
                            <Link href="#" style={{ color: 'rgba(255,255,255,0.65)' }}>Quy chế hoạt động</Link>
                            <Link href="#" style={{ color: 'rgba(255,255,255,0.65)' }}>Chính sách bảo mật</Link>
                            <Link href="#" style={{ color: 'rgba(255,255,255,0.65)' }}>Điều khoản dịch vụ</Link>
                        </div>
                    </Col>

                    {/* Cột 3: Hỗ trợ */}
                    <Col xs={24} sm={12} md={5}>
                        <Title level={5} style={{ color: '#fff', marginBottom: '20px' }}>HỖ TRỢ KHÁCH HÀNG</Title>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <Link href="#" style={{ color: 'rgba(255,255,255,0.65)' }}>Hướng dẫn đặt sân</Link>
                            <Link href="#" style={{ color: 'rgba(255,255,255,0.65)' }}>Chính sách đổi trả</Link>
                            <Link href="#" style={{ color: 'rgba(255,255,255,0.65)' }}>Câu hỏi thường gặp</Link>
                            <Link href="#" style={{ color: 'rgba(255,255,255,0.65)' }}>Liên hệ hợp tác</Link>
                        </div>
                    </Col>

                    {/* Cột 4: Liên hệ */}
                    <Col xs={24} md={6}>
                        <Title level={5} style={{ color: '#fff', marginBottom: '20px' }}>LIÊN HỆ</Title>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <Text style={{ color: 'rgba(255,255,255,0.8)' }}>
                                <EnvironmentOutlined style={{ marginRight: '10px', color: '#27ae60' }} />
                                123 Nguyễn Văn Cừ, Q.5, TP.HCM
                            </Text>
                            <Text style={{ color: 'rgba(255,255,255,0.8)' }}>
                                <PhoneOutlined style={{ marginRight: '10px', color: '#27ae60' }} />
                                0909.123.456
                            </Text>
                            <Text style={{ color: 'rgba(255,255,255,0.8)' }}>
                                <MailOutlined style={{ marginRight: '10px', color: '#27ae60' }} />
                                support@badmintonpro.com
                            </Text>
                            <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
                                <FacebookFilled style={{ fontSize: '24px', color: '#1890ff', cursor: 'pointer' }} />
                                <InstagramFilled style={{ fontSize: '24px', color: '#eb2f96', cursor: 'pointer' }} />
                                <YoutubeFilled style={{ fontSize: '24px', color: '#ff0000', cursor: 'pointer' }} />
                            </div>
                        </div>
                    </Col>
                </Row>

                <Divider style={{ borderColor: 'rgba(255,255,255,0.1)' }} />

                <div style={{ textAlign: 'center' }}>
                    <Text style={{ color: 'rgba(255,255,255,0.45)' }}>
                        Copyright © 2024 BadmintonPro. All rights reserved. Designed by You.
                    </Text>
                </div>
            </div>
        </footer>
    );
};

export default Footer;