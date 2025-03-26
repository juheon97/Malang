// hooks/useChat.js
import { useState, useEffect, useRef } from 'react';
import websocketService from '../services/websocketService';

export default function useChat(currentUserId, channel = 'default') {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const chatContainerRef = useRef(null);

  // 컴포넌트 마운트 시 WebSocket 연결
  useEffect(() => {
    // 웹소켓 연결
    websocketService.connect();

    // 연결 상태 확인
    const checkConnectionInterval = setInterval(() => {
      setIsConnected(websocketService.isConnected);
    }, 1000);

    // 메시지 수신 리스너
    const removeListener = websocketService.addListener('message', data => {
      setMessages(prevMessages => [
        ...prevMessages,
        {
          id: Date.now(),
          text: data.content,
          sender: data.senderId || 'unknown',
          timestamp: new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
        },
      ]);
    });

    // 컴포넌트 언마운트 시 정리
    return () => {
      clearInterval(checkConnectionInterval);
      removeListener();
    };
  }, []);

  // 채팅창 스크롤 자동 조정
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // 메시지 전송 함수
  const handleSendMessage = e => {
    e.preventDefault();
    if (newMessage.trim() === '') return;

    // 메시지 전송
    const success = websocketService.sendMessage('message', newMessage);

    if (success) {
      // 내 메시지 표시
      setMessages(prevMessages => [
        ...prevMessages,
        {
          id: Date.now(),
          text: newMessage,
          sender: currentUserId,
          timestamp: new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
        },
      ]);
      setNewMessage('');
    }
  };

  // 메시지 입력 시 엔터키 처리
  const handleKeyDown = e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  return {
    messages,
    newMessage,
    setNewMessage,
    handleSendMessage,
    handleKeyDown,
    chatContainerRef,
    isConnected,
  };
}
