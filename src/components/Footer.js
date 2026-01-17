import React from 'react';

const Footer = () => {
    return (
        <footer style={{ background: '#333', color: '#fff', padding: '30px 0', marginTop: 'auto' }}>
            <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                <div>
                    <h3>🏸 BadmintonPro</h3>
                    <p>Đặt sân cầu lông nhanh chóng, tiện lợi.</p>
                </div>
                <div>
                    <h4>Liên hệ</h4>
                    <p>Hotline: 0909.123.456</p>
                    <p>Email: support@badmintonpro.com</p>
                </div>
                <div>
                    <h4>Theo dõi</h4>
                    <p>Facebook | Instagram | Zalo</p>
                </div>
            </div>
            <div style={{ textAlign: 'center', marginTop: '20px', borderTop: '1px solid #555', paddingTop: '10px' }}>
                &copy; 2024 BadmintonPro. All rights reserved.
            </div>
        </footer>
    );
};

export default Footer;