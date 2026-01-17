import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import courtApi from "../api/courtApi";
import { Input, Select, Card, Tag, Button, Spin, Row, Col, Typography } from 'antd';
import { SearchOutlined, EnvironmentOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { Meta } = Card;

const Home = () => {
  const [courts, setCourts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ keyword: "", priceRange: "all" });

  useEffect(() => {
    const fetchCourts = async () => {
      try {
        const response = await courtApi.getAll();
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

  return (
    <div style={{ background: '#f0f2f5', minHeight: '100vh', paddingBottom: '50px' }}>

      {/* 1. HERO BANNER - HIỆN ĐẠI */}
      <div style={{
        backgroundImage: 'linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url("/banner.jpg")',

        backgroundSize: 'cover',
        backgroundPosition: 'center',
        height: '450px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        color: 'white',
        textAlign: 'center',
        padding: '0 20px'
      }}>
        <Title level={1} style={{ color: 'white', fontSize: '3.5rem', marginBottom: '10px', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
          ĐẶT SÂN CẦU LÔNG ONLINE
        </Title>
        <Text style={{ color: '#ecf0f1', fontSize: '1.2rem', maxWidth: '600px' }}>
          Tìm kiếm sân chơi gần bạn, đặt lịch nhanh chóng và thanh toán tiện lợi chỉ trong vài bước.
        </Text>

        {/* SEARCH BOX NỔI BẬT */}
        <div style={{
          background: 'white',
          padding: '15px',
          borderRadius: '50px',
          display: 'flex',
          gap: '10px',
          marginTop: '40px',
          width: '100%',
          maxWidth: '800px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
        }}>
          <Input
            size="large"
            prefix={<SearchOutlined style={{ color: '#bdc3c7' }} />}
            placeholder="Tìm tên sân, địa điểm..."
            bordered={false}
            value={filters.keyword}
            onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
            style={{ flex: 1 }}
          />
          <div style={{ width: '1px', background: '#eee' }}></div>
          <Select
            size="large"
            defaultValue="all"
            bordered={false}
            style={{ width: '180px' }}
            onChange={(val) => setFilters({ ...filters, priceRange: val })}
          >
            <Select.Option value="all">Mọi mức giá</Select.Option>
            <Select.Option value="low">Dưới 80k</Select.Option>
            <Select.Option value="mid">80k - 100k</Select.Option>
            <Select.Option value="high">Trên 100k</Select.Option>
          </Select>
          <Button type="primary" size="large" style={{ borderRadius: '40px', padding: '0 40px', background: '#27ae60', border: 'none', fontWeight: 'bold' }}>
            TÌM KIẾM
          </Button>
        </div>
      </div>

      {/* 2. DANH SÁCH SÂN */}
      <div className="container mx-auto px-6 mt-12">
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '30px' }}>
          <div style={{ width: '5px', height: '30px', background: '#27ae60', marginRight: '15px', borderRadius: '5px' }}></div>
          <Title level={2} style={{ margin: 0, color: '#2c3e50' }}>Sân Nổi Bật</Title>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px' }}><Spin size="large" /></div>
        ) : (
          <Row gutter={[30, 30]}>
            {filteredCourts.map((court) => (
              <Col xs={24} sm={12} md={8} lg={6} key={court.id}>
                <Link to={`/court/${court.id}`}>
                  <Card
                    hoverable
                    style={{ borderRadius: '15px', overflow: 'hidden', border: 'none', boxShadow: '0 5px 15px rgba(0,0,0,0.05)', height: '100%' }}
                    bodyStyle={{ padding: '20px' }}
                    cover={
                      <div style={{ overflow: 'hidden', height: '220px', position: 'relative' }}>
                        <img
                          alt={court.name}
                          src={court.imageUrl || "https://cdn.shopvnb.com/uploads/images/tin_tuc/bo-cau-long-1.webp"}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }}
                          className="hover:scale-110"
                          onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/400x200" }}
                        />
                        <Tag color="#27ae60" style={{ position: 'absolute', top: '15px', right: '15px', border: 'none', padding: '5px 10px', fontWeight: 'bold' }}>
                          Đang mở cửa
                        </Tag>
                      </div>
                    }
                  >
                    <Meta
                      title={<div style={{ fontSize: '1.2rem', color: '#2c3e50', marginBottom: '5px' }}>{court.name}</div>}
                      description={
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#7f8c8d', marginBottom: '10px' }}>
                            <EnvironmentOutlined />
                            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{court.address}</span>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginTop: '15px' }}>
                            <div>
                              <Text type="secondary" style={{ fontSize: '0.8rem' }}>Giá từ</Text>
                              <div style={{ color: '#e74c3c', fontSize: '1.4rem', fontWeight: '800', lineHeight: 1 }}>
                                {Number(court.pricePerHour).toLocaleString()}đ
                                <span style={{ fontSize: '0.9rem', fontWeight: 'normal', color: '#95a5a6' }}>/h</span>
                              </div>
                            </div>
                            <Button type="primary" shape="round" style={{ background: '#eefff3', color: '#27ae60', border: 'none', fontWeight: 'bold' }}>
                              Đặt ngay
                            </Button>
                          </div>
                        </div>
                      }
                    />
                  </Card>
                </Link>
              </Col>
            ))}
          </Row>
        )}
      </div>
    </div>
  );
};

export default Home;