import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import courtApi from "../api/courtApi";
import categoryApi from "../api/categoryApi"; // <--- 1. Import API Category
import {
  Input,
  Select,
  Card,
  Tag,
  Button,
  Spin,
  Row,
  Col,
  Typography,
} from "antd";
import { SearchOutlined, EnvironmentOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;
const { Meta } = Card;

const BACKEND_URL = "http://localhost:8080";

const Home = () => {
  const [courts, setCourts] = useState([]);
  const [categories, setCategories] = useState([]); // <--- 2. State lưu danh sách Quận
  const [loading, setLoading] = useState(true);

  // <--- 3. Thêm filter 'area'
  const [filters, setFilters] = useState({
    keyword: "",
    priceRange: "all",
    area: "all",
  });

  // ================= FETCH DATA =================
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Gọi song song cả 2 API để tiết kiệm thời gian
        const [resCourts, resCats] = await Promise.all([
          courtApi.getAll(),
          categoryApi.getAll()
        ]);

        setCourts(Array.isArray(resCourts.data) ? resCourts.data : []);
        setCategories(Array.isArray(resCats.data) ? resCats.data : []);
      } catch (error) {
        console.error("Lỗi tải dữ liệu:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ================= FILTER LOGIC =================
  const filteredCourts = useMemo(() => {
    return courts.filter((court) => {
      // 1. Lọc theo tên
      const matchName = court.name
        ?.toLowerCase()
        .includes(filters.keyword.toLowerCase());

      // 2. Lọc theo giá
      const price = Number(court.pricePerHour) || 0;
      let matchPrice = true;
      if (filters.priceRange === "low") matchPrice = price < 80000;
      if (filters.priceRange === "mid") matchPrice = price >= 80000 && price <= 100000;
      if (filters.priceRange === "high") matchPrice = price > 100000;

      // 3. Lọc theo Khu vực (Category) <--- MỚI
      let matchArea = true;
      if (filters.area !== "all") {
        // Kiểm tra xem court.category có tồn tại và id có khớp không
        matchArea = court.category && court.category.id === filters.area;
      }

      return matchName && matchPrice && matchArea;
    });
  }, [courts, filters]);

  // ================= IMAGE HELPER =================
  const getImageUrl = (court) => {
    const url = court.imageUrls?.[0] || court.imageUrl;
    if (!url)
      return "https://cdn.shopvnb.com/uploads/images/tin_tuc/bo-cau-long-1.webp";
    if (url.startsWith("http")) return url;
    return `${BACKEND_URL}${url.startsWith('/') ? url : '/' + url}`;
  };

  // ================= UI =================
  return (
    <div style={{ background: "#f0f2f5", minHeight: "100vh" }}>
      {/* HERO BANNER */}
      <div
        style={{
          background: 'linear-gradient(rgba(0,0,0,.6), rgba(0,0,0,.6)), url("/banner.jpg")',
          backgroundSize: "cover",
          height: 450,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          color: "#fff",
        }}
      >
        <Title style={{ color: "#fff", textTransform: 'uppercase' }}>Đặt sân cầu lông online</Title>
        <Text style={{ color: "#ddd", fontSize: 16 }}>
          Tìm sân gần bạn – Đặt lịch nhanh chóng
        </Text>

        {/* SEARCH BAR CONTAINER */}
        <div
          style={{
            background: "#fff",
            padding: "10px 20px",
            borderRadius: 50,
            display: "flex",
            gap: 10,
            marginTop: 30,
            width: "90%",
            maxWidth: "900px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
            flexWrap: 'wrap', // Cho phép xuống dòng trên mobile
            justifyContent: 'center'
          }}
        >
          {/* 1. TÌM TÊN */}
          <Input
            size="large"
            prefix={<SearchOutlined style={{ color: '#1890ff' }} />}
            placeholder="Tìm tên sân..."
            variant="borderless"
            value={filters.keyword}
            onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
            style={{ flex: 2, minWidth: 200 }}
          />

          <div style={{ width: 1, background: '#eee', margin: '0 5px' }}></div>

          {/* 2. CHỌN KHU VỰC (MỚI) */}
          <Select
            size="large"
            variant="borderless"
            placeholder="Chọn khu vực"
            style={{ flex: 1, minWidth: 150 }}
            value={filters.area}
            onChange={(val) => setFilters({ ...filters, area: val })}
            suffixIcon={<EnvironmentOutlined style={{ color: '#1890ff' }} />}
          >
            <Select.Option value="all">Toàn bộ TP.HCM</Select.Option>
            {categories.map((cat) => (
              <Select.Option key={cat.id} value={cat.id}>
                {cat.name}
              </Select.Option>
            ))}
          </Select>

          <div style={{ width: 1, background: '#eee', margin: '0 5px' }}></div>

          {/* 3. CHỌN GIÁ */}
          <Select
            size="large"
            defaultValue="all"
            variant="borderless"
            style={{ flex: 1, minWidth: 140 }}
            onChange={(val) => setFilters({ ...filters, priceRange: val })}
          >
            <Select.Option value="all">Mọi mức giá</Select.Option>
            <Select.Option value="low">Dưới 80k</Select.Option>
            <Select.Option value="mid">80k - 100k</Select.Option>
            <Select.Option value="high">Trên 100k</Select.Option>
          </Select>

          {/* 4. BUTTON */}
          <Button type="primary" size="large" shape="round" icon={<SearchOutlined />}>
            Tìm kiếm
          </Button>
        </div>
      </div>

      {/* RESULT LIST */}
      <div style={{ padding: "40px 20px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ marginBottom: 20 }}>
          <Title level={4}>
            Danh Sách Sân: {filteredCourts.length} Sân
            {filters.area !== 'all' && categories.find(c => c.id === filters.area) &&
              ` tại ${categories.find(c => c.id === filters.area).name}`}
          </Title>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: 50 }}><Spin size="large" /></div>
        ) : filteredCourts.length > 0 ? (
          <Row gutter={[24, 24]}>
            {filteredCourts.map((court) => (
              <Col xs={24} sm={12} md={8} lg={6} key={court.id}>
                <Link to={`/court/${court.id}`}>
                  <Card
                    hoverable
                    style={{ borderRadius: 10, overflow: 'hidden', height: '100%' }}
                    bodyStyle={{ padding: 15 }}
                    cover={
                      <div style={{ position: 'relative', height: 200 }}>
                        <img
                          alt={court.name}
                          src={getImageUrl(court)}
                          style={{ width: '100%', height: '100%', objectFit: "cover" }}
                          onError={(e) => { e.target.onerror = null; e.target.src = "https://cdn.shopvnb.com/uploads/images/tin_tuc/bo-cau-long-1.webp" }}
                        />
                        {/* Tag khu vực trên ảnh */}
                        {court.category && (
                          <Tag color="blue" style={{ position: 'absolute', top: 10, right: 10, margin: 0 }}>
                            {court.category.name}
                          </Tag>
                        )}
                      </div>
                    }
                  >
                    <Meta
                      title={<div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{court.name}</div>}
                      description={
                        <div style={{ marginTop: 5 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#666', marginBottom: 5 }}>
                            <EnvironmentOutlined />
                            <span style={{ fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '90%' }}>
                              {court.address}
                            </span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <b style={{ color: "#ff4d4f", fontSize: 16 }}>
                              {Number(court.pricePerHour).toLocaleString()}đ/h
                            </b>
                            <Tag color="success">Mở cửa</Tag>
                          </div>
                        </div>
                      }
                    />
                  </Card>
                </Link>
              </Col>
            ))}
          </Row>
        ) : (
          <div style={{ textAlign: 'center', marginTop: 50, color: '#999' }}>
            <EnvironmentOutlined style={{ fontSize: 40, marginBottom: 10 }} />
            <p>Không tìm thấy sân nào phù hợp với bộ lọc.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;