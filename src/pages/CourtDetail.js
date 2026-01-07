// src/pages/CourtDetail.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import courtApi from '../api/courtApi';
import BookingModal from '../components/BookingModal';
import './CourtDetail.css'; // Import CSS

const CourtDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [court, setCourt] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    // Dữ liệu giả về tiện ích (Vì DB hiện tại chưa có bảng này, thêm vào cho đẹp giống Mewin)
    const services = [
        "Wifi miễn phí", "Bãi giữ xe", "Canteen", "Cho thuê vợt", "Phòng thay đồ", "Ghế chờ"
    ];

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const response = await courtApi.getById(id); // Gọi API chi tiết
                // Spring Boot có thể trả về object trực tiếp hoặc bọc trong data
                setCourt(response.data || response); 
            } catch (error) {
                console.error("Lỗi:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [id]);

    if (loading) return <div style={{textAlign:'center', marginTop:'50px'}}>⏳ Đang tải thông tin sân...</div>;
    if (!court) return <div style={{textAlign:'center', marginTop:'50px'}}>❌ Không tìm thấy sân!</div>;

    // Ảnh chính (Ưu tiên ảnh DB, nếu lỗi dùng ảnh mẫu)
    const mainImage = court.imageUrl || "https://via.placeholder.com/800x400";

    return (
        <div className="court-detail-container">
            {/* 1. GALLERY ẢNH */}
            <div className="gallery-grid">
                <div className="main-image">
                    <img 
                        src={mainImage} 
                        alt={court.name} 
                        onError={(e) => {e.target.onerror=null; e.target.src="https://cdn.shopvnb.com/uploads/images/tin_tuc/bo-cau-long-1.webp"}}
                    />
                </div>
                <div className="sub-images">
                    {/* Ảnh phụ giả lập để giao diện đẹp */}
                    <img src="https://bestbongda.com/wp-content/uploads/2021/08/kich-thuoc-san-cau-long.jpg" alt="sub1" />
                    <img src="https://review.com.vn/wp-content/uploads/2022/04/san-cau-long-khanh-pham-1.jpg" alt="sub2" />
                </div>
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
                            <span style={{color: '#f1c40f'}}>⭐⭐⭐⭐⭐</span> 
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
                        <div style={{background:'#eee', height:'200px', borderRadius:'8px', display:'flex', justifyContent:'center', alignItems:'center', color:'#888'}}>
                            (Google Maps Embed Placeholder)
                        </div>
                    </div>
                </div>

                {/* 3. CỘT PHẢI: BOOKING BOX (STICKY) */}
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
                            <span style={{color:'green', fontWeight:'bold'}}>Đang mở cửa</span>
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
                        style={{width:'100%', marginTop:'10px', padding:'10px', background:'white', border:'1px solid #ddd', borderRadius:'8px', cursor:'pointer'}}
                    >
                        Quay lại
                    </button>
                </div>
            </div>

            {/* MODAL ĐẶT SÂN */}
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