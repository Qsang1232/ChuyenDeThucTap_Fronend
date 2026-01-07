import React, { useState } from 'react';
import bookingApi from '../api/bookingApi';

const BookingModal = ({ court, onClose }) => {
    const [bookingData, setBookingData] = useState({
        date: '',
        startTime: '',
        endTime: ''
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setBookingData({ ...bookingData, [e.target.name]: e.target.value });
    };

    const handleBooking = async (e) => {
        e.preventDefault();

        // Kiểm tra đăng nhập
        const user = JSON.parse(localStorage.getItem('currentUser'));
        if (!user) {
            alert("Vui lòng đăng nhập để đặt sân!");
            return;
        }

        setLoading(true);
        try {
            // Format dữ liệu gửi lên Backend: "2023-12-25T14:00:00"
            const startDateTime = `${bookingData.date}T${bookingData.startTime}:00`;
            const endDateTime = `${bookingData.date}T${bookingData.endTime}:00`;

            await bookingApi.create({
                courtId: court.id,
                startTime: startDateTime,
                endTime: endDateTime
            });

            alert("✅ Đặt sân thành công! Vui lòng kiểm tra lịch sử.");
            onClose();
        } catch (error) {
            console.error(error);
            alert("❌ Đặt sân thất bại: " + (error.response?.data?.message || "Lỗi hệ thống"));
        } finally {
            setLoading(false);
        }
    };

    if (!court) return null;

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999
        }} onClick={onClose}>
            <div style={{ background: '#fff', padding: '30px', borderRadius: '10px', width: '400px', maxWidth: '90%' }} onClick={(e) => e.stopPropagation()}>
                <h2 style={{ marginTop: 0, color: '#2ecc71', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                    Đặt sân: {court.name}
                </h2>

                <form onSubmit={handleBooking} style={{ marginTop: '20px' }}>
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Ngày chơi:</label>
                        <input type="date" name="date" required onChange={handleChange} style={{ width: '100%', padding: '8px' }} />
                    </div>

                    <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Giờ bắt đầu:</label>
                            <input type="time" name="startTime" required onChange={handleChange} style={{ width: '100%', padding: '8px' }} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Giờ kết thúc:</label>
                            <input type="time" name="endTime" required onChange={handleChange} style={{ width: '100%', padding: '8px' }} />
                        </div>
                    </div>

                    <p style={{ fontSize: '0.9rem', color: '#7f8c8d' }}>
                        💰 Giá sân: <b>{Number(court.pricePerHour).toLocaleString()} đ/h</b>
                    </p>

                    <div style={{ marginTop: '25px', display: 'flex', gap: '10px' }}>
                        <button type="button" onClick={onClose} style={{ flex: 1, padding: '10px', border: '1px solid #ddd', background: 'white', cursor: 'pointer', borderRadius: '5px' }}>Hủy</button>
                        <button type="submit" disabled={loading} style={{ flex: 1, padding: '10px', border: 'none', background: '#2ecc71', color: 'white', fontWeight: 'bold', cursor: 'pointer', borderRadius: '5px' }}>
                            {loading ? "Đang xử lý..." : "XÁC NHẬN ĐẶT"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BookingModal;