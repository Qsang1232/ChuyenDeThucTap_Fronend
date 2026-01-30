import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import courtApi from '../api/courtApi';
import BookingModal from '../components/BookingModal';
import './CourtDetail.css';

// --- THÊM: Định nghĩa URL Backend ---
const BACKEND_URL = "http://localhost:8080";

const CourtDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [court, setCourt] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    const services = [
        "Wifi miễn phí", "Bãi giữ xe", "Canteen", "Cho thuê vợt", "Phòng thay đồ", "Ghế chờ"
    ];

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const response = await courtApi.getById(id);
                setCourt(response.data || response);
            } catch (error) {
                console.error("Lỗi:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [id]);

    if (loading) return <div style={{ textAlign: 'center', marginTop: '50px' }}>⏳ Đang tải thông tin sân...</div>;
    if (!court) return <div style={{ textAlign: 'center', marginTop: '50px' }}>❌ Không tìm thấy sân!</div>;

    // --- LOGIC ẢNH MỚI (Hỗ trợ mảng ảnh) ---
    const getFullUrl = (url) => {
        if (!url) return null;
        if (url.startsWith('http')) return url;
        return `${BACKEND_URL}${url.startsWith('/') ? url : '/' + url}`;
    };

    // Lấy danh sách ảnh: ưu tiên mảng imageUrls, fallback về imageUrl cũ
    let images = (court.imageUrls || []).map(getFullUrl).filter(Boolean);
    if (images.length === 0 && court.imageUrl) {
        const single = getFullUrl(court.imageUrl);
        if (single) images.push(single);
    }
    // Nếu không có ảnh thì dùng ảnh placeholder

    const mainImage = images.length > 0 ? images[0] : "https://cdn.shopvnb.com/uploads/images/tin_tuc/bo-cau-long-1.webp";

    return (
        <div className="court-detail-container">
            {/* 1. GALLERY ẢNH */}
            <div className="gallery-grid">
                <div className="main-image">
                    <img
                        className="display-img"
                        src={mainImage}
                        alt={court.name}
                        onError={(e) => { e.target.onerror = null; e.target.src = "https://cdn.shopvnb.com/uploads/images/tin_tuc/bo-cau-long-1.webp" }}
                    />
                </div>
                {/* List ảnh nhỏ (Gallery) */}
                {images.length > 1 && (
                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px', overflowX: 'auto' }}>
                        {images.map((img, idx) => (
                            <img
                                key={idx}
                                src={img}
                                alt="thumbnail"
                                style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: '4px', cursor: 'pointer', border: '1px solid #ddd' }}
                                onClick={(e) => {
                                    // Đổi ảnh chính khi click vào ảnh nhỏ
                                    const main = document.querySelector('.display-img');
                                    if (main) main.src = e.target.src;
                                }}
                            />
                        ))}
                    </div>
                )}

            </div>

            <div className="detail-body">
                {/* 2. CỘT TRÁI: THÔNG TIN CHI TIẾT */}
                <div className="left-content">
                    <div className="court-header-info">
                        <h1 className="court-title-detail">{court.name}</h1>
                        <div className="address-row">
                            <span>📍</span> {court.address}
                        </div>
                        <div className="rating-row">
                            <span style={{ color: '#f1c40f' }}>⭐⭐⭐⭐⭐</span>
                            <span>(4.8/5 từ 120 đánh giá)</span>
                        </div>
                    </div>

                    <div className="section-box">
                        <h3 className="section-title">Giới thiệu sân</h3>
                        <p className="description-text">
                            {court.description || "Sân cầu lông tiêu chuẩn thi đấu, mặt thảm PVC chống trơn trượt, hệ thống đèn chiếu sáng LED không chói mắt. Không gian thoáng đãng, trần cao, phù hợp cho cả tập luyện và thi đấu phong trào."}
                        </p>
                    </div>

                    <div className="section-box">
                        <h3 className="section-title">Tiện ích & Dịch vụ</h3>
                        <div className="services-grid">
                            {services.map((item, index) => (
                                <div key={index} className="service-item">
                                    <span>✅</span> {item}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="section-box">
                        <h3 className="section-title">Vị trí bản đồ</h3>
                        <div style={{ height: '300px', width: '100%', borderRadius: '8px', overflow: 'hidden', border: '1px solid #ddd' }}>
                            <iframe
                                title="Bản đồ sân cầu lông"
                                width="100%"
                                height="100%"
                                frameBorder="0"
                                style={{ border: 0 }}
                                src={`https://maps.google.com/maps?q=${encodeURIComponent(court.address || "Sân cầu lông Hà Nội")}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                                allowFullScreen
                                loading="lazy"
                            ></iframe>
                        </div>
                        <div style={{ marginTop: '10px', textAlign: 'right' }}>
                            <a
                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(court.address)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: '#007bff', textDecoration: 'none', fontWeight: 'bold' }}
                            >
                                ↗️ Xem trên Google Maps lớn
                            </a>
                        </div>
                    </div>
                </div>

                {/* 3. CỘT PHẢI: BOOKING BOX */}
                <div className="right-sidebar">
                    <div className="booking-box-header">
                        <div className="price-highlight">
                            {court.pricePerHour ? Number(court.pricePerHour).toLocaleString() : 0}
                            <span className="price-unit"> đ/giờ</span>
                        </div>
                    </div>

                    <ul className="info-list">
                        <li>
                            <span>⏰ Giờ mở cửa:</span>
                            <span>{court.openingTime || "05:00"} - {court.closingTime || "22:00"}</span>
                        </li>
                        <li>
                            <span>📅 Trạng thái:</span>
                            <span style={{ color: 'green', fontWeight: 'bold' }}>Đang mở cửa</span>
                        </li>
                        <li>
                            <span>📞 Liên hệ:</span>
                            <span>0909.123.456</span>
                        </li>
                    </ul>

                    <button className="btn-book-big" onClick={() => setShowModal(true)}>
                        ĐẶT LỊCH NGAY
                    </button>

                    <button
                        onClick={() => navigate('/')}
                        style={{ width: '100%', marginTop: '10px', padding: '10px', background: 'white', border: '1px solid #ddd', borderRadius: '8px', cursor: 'pointer' }}
                    >
                        Quay lại
                    </button>
                </div>
            </div>

            {showModal && (
                <BookingModal
                    court={court}
                    onClose={() => setShowModal(false)}
                />
            )}
        </div>
    );
};

export default CourtDetail;

