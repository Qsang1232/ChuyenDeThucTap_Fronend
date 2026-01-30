import React, { useState, useRef, useEffect } from 'react';
import { Button, Card, Input, List, Avatar, Spin, Typography } from 'antd';
import { RobotOutlined, SendOutlined, CloseOutlined, MessageOutlined } from '@ant-design/icons';
import aiApi from '../api/aiApi'; // Đảm bảo bạn đã tạo file này (xem bên dưới)

const { Text } = Typography;

const Chatbox = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { text: "Xin chào! Mình là trợ lý AI. Bạn cần tìm sân cầu lông ở đâu?", sender: 'bot' }
    ]);
    const [inputValue, setInputValue] = useState("");
    const [loading, setLoading] = useState(false);

    // Tự động cuộn xuống cuối khi có tin nhắn mới
    const messagesEndRef = useRef(null);
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };
    useEffect(scrollToBottom, [messages, isOpen]);

    // Xử lý gửi tin nhắn
    const handleSend = async () => {
        if (!inputValue.trim()) return;

        const userQuestion = inputValue;

        setMessages(prev => [...prev, { text: userQuestion, sender: 'user' }]);
        setInputValue("");
        setLoading(true);

        try {
            const res = await aiApi.chat(userQuestion);

            // ✅ res chính là ApiResponse
            let answer = "Xin lỗi, mình chưa hiểu ý bạn.";

            if (res && res.success && res.data) {
                answer = res.data; // ✅ ĐÚNG Ở ĐÂY
            }

            setMessages(prev => [...prev, { text: answer, sender: 'bot' }]);

        } catch (error) {
            console.error("Lỗi Chat AI:", error);
            setMessages(prev => [
                ...prev,
                { text: "Hệ thống đang bận, thử lại sau nhé!", sender: 'bot' }
            ]);
        } finally {
            setLoading(false);
        }
    };


    return (
        <div style={{ position: 'fixed', bottom: 30, right: 30, zIndex: 9999 }}>

            {/* CỬA SỔ CHAT */}
            {isOpen && (
                <Card
                    title={
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <RobotOutlined style={{ color: '#1890ff', fontSize: 20 }} />
                            <span>Trợ lý ảo AI</span>
                        </div>
                    }
                    extra={<Button type="text" icon={<CloseOutlined />} onClick={() => setIsOpen(false)} />}
                    style={{
                        width: 350,
                        height: 500,
                        marginBottom: 15,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        display: 'flex',
                        flexDirection: 'column',
                        borderRadius: '12px'
                    }}
                    bodyStyle={{ flex: 1, overflow: 'hidden', padding: 0, display: 'flex', flexDirection: 'column' }}
                >
                    {/* KHUNG TIN NHẮN */}
                    <div style={{ flex: 1, overflowY: 'auto', padding: '15px', background: '#f0f2f5' }}>
                        <List
                            itemLayout="horizontal"
                            dataSource={messages}
                            renderItem={(msg) => (
                                <div style={{
                                    display: 'flex',
                                    justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                                    marginBottom: 10
                                }}>
                                    {msg.sender === 'bot' && <Avatar icon={<RobotOutlined />} style={{ backgroundColor: '#1890ff', marginRight: 8 }} />}

                                    <div style={{
                                        maxWidth: '75%',
                                        padding: '10px 14px',
                                        borderRadius: '12px',
                                        borderTopLeftRadius: msg.sender === 'bot' ? '2px' : '12px',
                                        borderTopRightRadius: msg.sender === 'user' ? '2px' : '12px',
                                        background: msg.sender === 'user' ? '#1890ff' : '#fff',
                                        color: msg.sender === 'user' ? '#fff' : '#000',
                                        boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                                        whiteSpace: 'pre-wrap',
                                        fontSize: '14px'
                                    }}>
                                        <Text style={{ color: 'inherit' }}>{msg.text}</Text>
                                    </div>
                                </div>
                            )}
                        />
                        {loading && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#999', marginLeft: 40, marginBottom: 10 }}>
                                <Spin size="small" /> Đang soạn tin...
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* KHUNG NHẬP LIỆU */}
                    <div style={{ padding: '10px', background: '#fff', borderTop: '1px solid #f0f0f0', display: 'flex', gap: 8 }}>
                        <Input
                            placeholder="Hỏi giá sân, địa chỉ..."
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onPressEnter={handleSend}
                            disabled={loading}
                            style={{ borderRadius: '20px' }}
                        />
                        <Button type="primary" shape="circle" icon={<SendOutlined />} onClick={handleSend} loading={loading} />
                    </div>
                </Card>
            )}

            {/* NÚT TRÒN MỞ CHAT */}
            {!isOpen && (
                <Button
                    type="primary"
                    shape="circle"
                    icon={<MessageOutlined style={{ fontSize: 28 }} />}
                    size="large"
                    style={{ width: 60, height: 60, boxShadow: '0 4px 12px rgba(24, 144, 255, 0.4)' }}
                    onClick={() => setIsOpen(true)}
                />
            )}
        </div>
    );
};

export default Chatbox;
