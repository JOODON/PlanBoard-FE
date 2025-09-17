import React, { useState, useRef, useEffect } from 'react';
import { FaPaperPlane, FaPaperclip, FaSmile, FaRobot, FaUser, FaComments, FaTimes, FaMinus } from 'react-icons/fa';

// CSS 스타일 (TextBoard CSS와 통일)
const chatStyles = `
/* 하단 고정 채팅 컨테이너 */
.chat-container {
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 999;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.chat-toggle-btn {
    width: 56px;
    height: 56px;
    background: linear-gradient(135deg, #28a745, #20c997);
    color: white;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3);
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
}

.chat-toggle-btn::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    transition: left 0.5s;
}

.chat-toggle-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(40, 167, 69, 0.4);
}

.chat-toggle-btn:hover::before {
    left: 100%;
}

.chat-toggle-btn:active {
    transform: translateY(0);
    box-shadow: 0 2px 10px rgba(40, 167, 69, 0.3);
}

/* 채팅창 */
.chat-wrapper {
    position: absolute;
    bottom: 70px;
    right: 0;
    width: 380px;
    height: 500px;
    background: white;
    border: 1px solid #e9ecef;
    border-radius: 16px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    transform: scale(0.95) translateY(10px);
    opacity: 0;
    transition: all 0.3s ease;
    backdrop-filter: blur(4px);
}

.chat-wrapper.open {
    transform: scale(1) translateY(0);
    opacity: 1;
}

.chat-header {
    padding: 16px 20px;
    background: #f8f9fa;
    border-bottom: 1px solid #e9ecef;
    display: flex;
    align-items: center;
    justify-content: between;
    gap: 12px;
}

.chat-header-info {
    flex: 1;
}

.chat-header h4 {
    margin: 0 0 4px 0;
    font-size: 16px;
    font-weight: 600;
    color: #333;
}

.chat-header .chat-status {
    font-size: 12px;
    color: #6c757d;
    margin: 0;
}

.chat-header-actions {
    display: flex;
    gap: 8px;
}

.chat-header-btn {
    background: none;
    border: none;
    color: #6c757d;
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
}

.chat-header-btn:hover {
    background: #e9ecef;
    color: #333;
}

.chat-messages {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
    background: white;
    scrollbar-width: thin;
    scrollbar-color: #d1d5db transparent;
}

.chat-messages::-webkit-scrollbar {
    width: 6px;
}

.chat-messages::-webkit-scrollbar-track {
    background: transparent;
}

.chat-messages::-webkit-scrollbar-thumb {
    background: #d1d5db;
    border-radius: 3px;
}

.chat-message {
    display: flex;
    margin-bottom: 16px;
    align-items: flex-start;
    gap: 8px;
}

.chat-message.user {
    flex-direction: row-reverse;
}

.message-avatar {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    color: white;
    flex-shrink: 0;
}

.message-avatar.user {
    background: linear-gradient(135deg, #28a745, #20c997);
}

.message-avatar.ai {
    background: #6c757d;
}

.message-content {
    max-width: 70%;
    padding: 10px 14px;
    border-radius: 16px;
    font-size: 14px;
    line-height: 1.4;
    word-wrap: break-word;
}

.message-content.user {
    background: linear-gradient(135deg, #28a745, #20c997);
    color: white;
    border-bottom-right-radius: 6px;
}

.message-content.ai {
    background: #f8f9fa;
    color: #333;
    border: 1px solid #e9ecef;
    border-bottom-left-radius: 6px;
}

.message-time {
    font-size: 10px;
    color: #adb5bd;
    margin-top: 4px;
    text-align: right;
}

.message-time.ai {
    text-align: left;
}

.chat-input-container {
    padding: 12px 16px;
    background: white;
    border-top: 1px solid #e9ecef;
}

.chat-input-wrapper {
    display: flex;
    align-items: flex-end;
    gap: 8px;
    background: #f8f9fa;
    border: 1px solid #e9ecef;
    border-radius: 20px;
    padding: 8px 12px;
    transition: all 0.2s ease;
}

.chat-input-wrapper:focus-within {
    border-color: #28a745;
    background: white;
    box-shadow: 0 0 0 3px rgba(40, 167, 69, 0.1);
}

.chat-input {
    flex: 1;
    border: none;
    background: transparent;
    outline: none;
    padding: 6px 8px;
    font-size: 14px;
    resize: none;
    min-height: 18px;
    max-height: 80px;
    font-family: inherit;
    line-height: 1.4;
}

.chat-input::placeholder {
    color: #adb5bd;
}

.chat-input-btn {
    background: none;
    border: none;
    color: #6c757d;
    cursor: pointer;
    padding: 6px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    flex-shrink: 0;
}

.chat-input-btn:hover {
    color: #28a745;
    background: rgba(40, 167, 69, 0.1);
}

.chat-send-btn {
    background: linear-gradient(135deg, #28a745, #20c997);
    color: white;
    border: none;
    border-radius: 50%;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
    flex-shrink: 0;
}

.chat-send-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(40, 167, 69, 0.4);
}

.chat-send-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
}

.typing-indicator {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 16px;
}

.typing-dots {
    display: flex;
    gap: 3px;
    padding: 10px 14px;
    background: #f8f9fa;
    border: 1px solid #e9ecef;
    border-radius: 16px;
    border-bottom-left-radius: 6px;
}

.typing-dot {
    width: 4px;
    height: 4px;
    background: #6c757d;
    border-radius: 50%;
    animation: typing 1.4s infinite ease-in-out;
}

.typing-dot:nth-child(2) {
    animation-delay: 0.2s;
}

.typing-dot:nth-child(3) {
    animation-delay: 0.4s;
}

@keyframes typing {
    0%, 80%, 100% {
        opacity: 0.3;
        transform: scale(0.8);
    }
    40% {
        opacity: 1;
        transform: scale(1);
    }
}

.empty-chat {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: #6c757d;
    text-align: center;
    padding: 40px 20px;
}

.empty-chat-icon {
    font-size: 40px;
    margin-bottom: 16px;
    opacity: 0.5;
}

.empty-chat h4 {
    margin: 0 0 8px 0;
    font-size: 16px;
    font-weight: 600;
    color: #333;
}

.empty-chat p {
    margin: 0;
    font-size: 13px;
    line-height: 1.4;
}

.quick-actions {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
    margin-top: 8px;
}

.quick-action-btn {
    background: #f8f9fa;
    border: 1px solid #e9ecef;
    border-radius: 12px;
    padding: 4px 10px;
    font-size: 11px;
    color: #6c757d;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;
}

.quick-action-btn:hover {
    background: linear-gradient(135deg, #28a745, #20c997);
    color: white;
    border-color: transparent;
    transform: translateY(-1px);
}

/* 미니마이즈 상태 */
.chat-wrapper.minimized {
    height: 60px;
    overflow: hidden;
}

.chat-wrapper.minimized .chat-messages,
.chat-wrapper.minimized .chat-input-container {
    display: none;
}

/* 반응형 */
@media (max-width: 480px) {
    .chat-container {
        bottom: 10px;
        right: 10px;
        left: 10px;
    }
    
    .chat-wrapper {
        width: 100%;
        height: 70vh;
        right: 0;
        bottom: 70px;
    }
    
    .chat-toggle-btn {
        position: absolute;
        right: 0;
        bottom: 0;
    }
}

/* 애니메이션 */
@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.chat-wrapper {
    animation: fadeInUp 0.3s ease-out;
}
`;

// 채팅 메시지 컴포넌트
const ChatMessage = ({ message, isUser, timestamp }) => {
    return (
        <div className={`chat-message ${isUser ? 'user' : 'ai'}`}>
            <div className={`message-avatar ${isUser ? 'user' : 'ai'}`}>
                {isUser ? <FaUser /> : <FaRobot />}
            </div>
            <div>
                <div className={`message-content ${isUser ? 'user' : 'ai'}`}>
                    {message}
                </div>
                <div className={`message-time ${isUser ? 'user' : 'ai'}`}>
                    {timestamp}
                </div>
            </div>
        </div>
    );
};

// 타이핑 인디케이터 컴포넌트
const TypingIndicator = () => {
    return (
        <div className="typing-indicator">
            <div className="message-avatar ai">
                <FaRobot />
            </div>
            <div className="typing-dots">
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
            </div>
        </div>
    );
};

// 채팅 입력 컴포넌트
const ChatInput = ({ onSendMessage, disabled }) => {
    const [message, setMessage] = useState('');
    const textareaRef = useRef(null);

    const handleSend = () => {
        if (message.trim() && !disabled) {
            onSendMessage(message.trim());
            setMessage('');
            if (textareaRef.current) {
                textareaRef.current.style.height = '18px';
            }
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleInputChange = (e) => {
        setMessage(e.target.value);
        // Auto-resize textarea
        if (textareaRef.current) {
            textareaRef.current.style.height = '18px';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    };

    return (
        <div className="chat-input-container">
            {/* 빠른 액션 버튼들 */}
            <div className="quick-actions">
                <button
                    className="quick-action-btn"
                    onClick={() => setMessage('메모 작성을 도와주세요')}
                >
                    📝 메모 작성
                </button>
                <button
                    className="quick-action-btn"
                    onClick={() => setMessage('아이디어 정리해주세요')}
                >
                    💡 아이디어 정리
                </button>
                <button
                    className="quick-action-btn"
                    onClick={() => setMessage('요약해주세요')}
                >
                    📄 요약
                </button>
            </div>

            <div className="chat-input-wrapper">
                <button className="chat-input-btn" type="button">
                    <FaPaperclip />
                </button>

                <textarea
                    ref={textareaRef}
                    className="chat-input"
                    value={message}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                    placeholder="메시지를 입력하세요..."
                    rows={1}
                    disabled={disabled}
                />

                <button className="chat-input-btn" type="button">
                    <FaSmile />
                </button>

                <button
                    className="chat-send-btn"
                    onClick={handleSend}
                    disabled={!message.trim() || disabled}
                    type="button"
                >
                    <FaPaperPlane />
                </button>
            </div>
        </div>
    );
};

// 메인 채팅 컴포넌트
export const FloatingChatUI = ({ project }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [messages, setMessages] = useState([]);
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const handleSendMessage = async (message) => {
        const timestamp = new Date().toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit'
        });

        // 사용자 메시지 추가
        const userMessage = {
            id: Date.now(),
            text: message,
            isUser: true,
            timestamp
        };

        setMessages(prev => [...prev, userMessage]);
        setIsTyping(true);

        // AI 응답 시뮬레이션 (실제로는 API 호출)
        setTimeout(() => {
            const aiResponse = {
                id: Date.now() + 1,
                text: `"${message}"에 대한 응답입니다. ${project ? `현재 "${project.name}" 프로젝트에서` : ''} 어떻게 도와드릴까요?`,
                isUser: false,
                timestamp: new Date().toLocaleTimeString('ko-KR', {
                    hour: '2-digit',
                    minute: '2-digit'
                })
            };

            setMessages(prev => [...prev, aiResponse]);
            setIsTyping(false);
        }, 1000 + Math.random() * 2000);
    };

    const toggleChat = () => {
        setIsOpen(!isOpen);
        setIsMinimized(false);
    };

    const minimizeChat = () => {
        setIsMinimized(!isMinimized);
    };

    const closeChat = () => {
        setIsOpen(false);
        setIsMinimized(false);
    };

    return (
        <div className="chat-container">
            <style>{chatStyles}</style>

            {/* 채팅창 */}
            {isOpen && (
                <div className={`chat-wrapper open ${isMinimized ? 'minimized' : ''}`}>
                    {/* 채팅 헤더 */}
                    <div className="chat-header">
                        <FaRobot style={{ color: '#28a745', fontSize: '16px' }} />
                        <div className="chat-header-info">
                            <h4>AI 어시스턴트</h4>
                            <p className="chat-status">
                                {project ? `"${project.name}" 프로젝트` : '메모 작성을 도와드릴게요'}
                            </p>
                        </div>
                        <div className="chat-header-actions">
                            <button
                                className="chat-header-btn"
                                onClick={minimizeChat}
                                title={isMinimized ? '확장' : '최소화'}
                            >
                                <FaMinus />
                            </button>
                            <button
                                className="chat-header-btn"
                                onClick={closeChat}
                                title="닫기"
                            >
                                <FaTimes />
                            </button>
                        </div>
                    </div>

                    {!isMinimized && (
                        <>
                            {/* 메시지 영역 */}
                            <div className="chat-messages">
                                {messages.length === 0 ? (
                                    <div className="empty-chat">
                                        <div className="empty-chat-icon">💬</div>
                                        <h4>AI와 대화를 시작해보세요</h4>
                                        <p>메모 작성, 아이디어 정리, 내용 요약 등<br />다양한 작업을 도와드릴게요!</p>
                                    </div>
                                ) : (
                                    <>
                                        {messages.map((msg) => (
                                            <ChatMessage
                                                key={msg.id}
                                                message={msg.text}
                                                isUser={msg.isUser}
                                                timestamp={msg.timestamp}
                                            />
                                        ))}
                                        {isTyping && <TypingIndicator />}
                                        <div ref={messagesEndRef} />
                                    </>
                                )}
                            </div>

                            {/* 입력 영역 */}
                            <ChatInput
                                onSendMessage={handleSendMessage}
                                disabled={isTyping}
                            />
                        </>
                    )}
                </div>
            )}

            {/* 토글 버튼 */}
            <button
                className="chat-toggle-btn"
                onClick={toggleChat}
                title={isOpen ? '채팅 닫기' : '채팅 열기'}
            >
                {isOpen ? <FaTimes /> : <FaComments />}
            </button>
        </div>
    );
};
