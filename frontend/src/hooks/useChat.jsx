// useChat.js
import { useState, useRef, useEffect, useCallback } from 'react';

const useChat = currentUserId => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const chatContainerRef = useRef(null);

  // 채팅 입력 엔터키 핸들러
  const handleKeyDown = e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const form = e.target.closest('form');
      if (form) {
        form.dispatchEvent(
          new Event('submit', { cancelable: true, bubbles: true }),
        );
      }
    }
  };

  // 새 메시지가 추가될 때마다 스크롤을 아래로 이동
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // 외부에서 메시지를 추가할 수 있는 함수 (useCallback으로 메모이제이션)
  const addMessage = useCallback((content, sender, senderId) => {
    const newMsg = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // 고유 ID 생성
      text: content,
      sender: sender,
      senderId: senderId,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMsg]);
  }, []);

  return {
    messages,
    newMessage,
    setNewMessage,
    handleKeyDown,
    chatContainerRef,
    addMessage,
  };
};

export default useChat;
