import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import courtApi from "../api/courtApi";

const Home = () => {
  const [courts, setCourts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ keyword: "", priceRange: "all" });

  useEffect(() => {
    const fetchCourts = async () => {
      try {
        const response = await courtApi.getAll();
        // Xử lý response tùy theo backend trả về mảng hay object
        const data = Array.isArray(response) ? response : (response.data || []);
        setCourts(data);
      } catch (error) {
        console.error("Lỗi tải sân:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourts();
  }, []);

  const filteredCourts = useMemo(() => {
    return courts.filter((court) => {
      const matchName = court.name.toLowerCase().includes(filters.keyword.toLowerCase());
      let matchPrice = true;
      const price = court.pricePerHour || 0;
      if (filters.priceRange === "low") matchPrice = price < 80000;
      if (filters.priceRange === "mid") matchPrice = price >= 80000 && price <= 100000;
      if (filters.priceRange === "high") matchPrice = price > 100000;
      return matchName && matchPrice;
    });
  }, [filters, courts]);

  const handleFilterChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });

  return (
    <>
      <div style={{ background: '#2ecc71', color: 'white', padding: '60px 0', textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '2.5rem', margin: 0 }}>🏸 ĐẶT SÂN CẦU LÔNG DỄ DÀNG</h1>
        <p>Tìm sân, đặt lịch và thanh toán online chỉ trong 30 giây</p>
      </div>

      <div className="container" id="search" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        <div style={{ background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', display: 'flex', gap: '20px', marginBottom: '40px' }}>
          <input
            name="keyword"
            placeholder="Tìm tên sân..."
            value={filters.keyword}
            onChange={handleFilterChange}
            style={{ flex: 1, padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }}
          />
          <select name="priceRange" onChange={handleFilterChange} style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }}>
            <option value="all">Mọi mức giá</option>
            <option value="low">Dưới 80k</option>
            <option value="mid">80k - 100k</option>
            <option value="high">Trên 100k</option>
          </select>
        </div>

        <h2 style={{ color: '#2c3e50', borderLeft: '5px solid #2ecc71', paddingLeft: '15px' }}>
          {loading ? "Đang tải..." : "Danh sách sân nổi bật"}
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '30px', paddingBottom: '50px' }}>
          {filteredCourts.map((court) => (
            <div key={court.id} style={{ background: 'white', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', transition: '0.3s' }}>
              <Link to={`/court/${court.id}`}>
                <img
                  src={court.imageUrl || "https://cdn.shopvnb.com/uploads/images/tin_tuc/bo-cau-long-1.webp"}
                  alt={court.name}
                  style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                  onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/400x200?text=San+Cau+Long" }}
                />
              </Link>
              <div style={{ padding: '15px' }}>
                <h3 style={{ margin: '0 0 10px', fontSize: '1.1rem' }}>{court.name}</h3>
                <p style={{ color: '#7f8c8d', fontSize: '0.9rem' }}>📍 {court.address}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px' }}>
                  <span style={{ color: '#e74c3c', fontWeight: 'bold', fontSize: '1.1rem' }}>
                    {Number(court.pricePerHour).toLocaleString()} đ/h
                  </span>
                  <Link to={`/court/${court.id}`} style={{ background: '#2ecc71', color: 'white', padding: '8px 15px', borderRadius: '5px', textDecoration: 'none', fontSize: '0.9rem' }}>
                    Đặt Sân
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Home;