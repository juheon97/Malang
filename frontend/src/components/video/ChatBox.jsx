import React, { useState, useEffect, useRef } from 'react';
import websocketService from '../../services/websocketService';

const ChatBox = ({ currentUserId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const chatContainerRef = useRef(null);
  // 전송한 메시지의 고유 id를 저장하기 위한 ref (중복 수신 방지를 위해)
  const sentMessageIdsRef = useRef(new Set());
  const user = JSON.parse(sessionStorage.getItem('user'));

  useEffect(() => {
    websocketService.connect();

    const checkConnection = setInterval(() => {
      setIsConnected(websocketService.isConnected);
    }, 500);

    const unsubscribe = websocketService.addListener('message', data => {
      if (data.event === 'message') {
        let parsed;
        try {
          parsed = JSON.parse(data.content);
        } catch (err) {
          parsed = { text: data.content };
        }

        if (parsed.id && sentMessageIdsRef.current.has(parsed.id)) {
          sentMessageIdsRef.current.delete(parsed.id);
          return;
        }

        setMessages(prevMessages => [
          ...prevMessages,
          {
            id: parsed.id || Date.now(),
            text: parsed.text || data.content,
            sender: parsed.nickname || '익명', // ✅ 수신 메시지의 닉네임 저장
            timestamp: new Date().toLocaleTimeString(),
          },
        ]);
      }
    });

    return () => {
      clearInterval(checkConnection);
      unsubscribe();
      websocketService.disconnect();
    };
  }, []);

  // 새로운 채팅이 올라오면 채팅창 스크롤 자동으로 맨 아래로 이동
  useEffect(() => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } =
        chatContainerRef.current;
      const isAtBottom = scrollHeight - scrollTop <= clientHeight + 100;

      if (isAtBottom) {
        chatContainerRef.current.scrollTop =
          chatContainerRef.current.scrollHeight;
      }
    }
  }, [messages]); // 메시지가 업데이트될 때마다 작동

  const handleSendMessage = e => {
    e.preventDefault();
    const user = JSON.parse(sessionStorage.getItem('user'));
    const nickname = user?.username;

    // 메세지 전송 시 백으로 보내는 json
    if (newMessage.trim()) {
      const messageId = Date.now();
      const payload = JSON.stringify({
        id: messageId,
        text: newMessage,
        nickname: nickname,
      });

      const success = websocketService.sendMessage('send', payload);
      if (success) {
        setMessages(prevMessages => [
          ...prevMessages,
          {
            id: messageId,
            text: newMessage,
            sender: nickname, // ✅ 내 닉네임 저장
            timestamp: new Date().toLocaleTimeString(),
          },
        ]);
        sentMessageIdsRef.current.add(messageId);
        setNewMessage('');
      }
    }
  };

  const handleKeyDown = e => {
    if (e.key === 'Enter') {
      handleSendMessage(e);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden w-full lg:w-80 flex flex-col">
      <div className="p-3 border-b border-gray-100 flex justify-between items-center">
        <h1
          style={{ fontFamily: "'HancomMalangMalang-Regular', sans-serif" }}
          className="text-2xl font-bold text-gray-800 relative pl-3 mb-2 mt-2"
        >
          채팅
        </h1>
        <div className="flex items-center">
          <div
            className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}
          ></div>
          <span className="text-xs ml-1">
            {isConnected ? '연결됨' : '연결 안됨'}
          </span>
        </div>
      </div>

      <div
        ref={chatContainerRef}
        className="p-3 overflow-y-auto flex-1"
        style={{ minHeight: '350px', maxHeight: '350px' }}
      >
        {messages.map(message => (
          <div
            key={message.id}
            className={`mb-2 flex ${message.sender === user?.username ? 'justify-end' : 'justify-start'}`}
          >
            <div className="flex flex-col items-start max-w-[85%]">
              {/* ✅ 말풍선 위에 닉네임 표시 (내 메시지는 생략) */}
              {message.sender !== user?.username && (
                <span className="text-xs font-semibold text-gray-600 mb-1 ml-1">
                  {message.sender}
                </span>
              )}

              <div
                className={`rounded-lg px-3 py-2 text-sm 
        ${message.sender === user?.username ? 'bg-[#D1F4CB] self-end' : 'bg-[#E9EDF2] self-start'}`}
              >
                <p>{message.text}</p>
                <p className="text-xs text-gray-500 mt-1 text-right">
                  {message.timestamp}
                </p>
              </div>
            </div>
          </div>
        ))}

        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-400 text-sm">메시지가 없습니다.</p>
          </div>
        )}
      </div>

      <div className="p-3 border-t border-gray-100 mt-auto">
        <form onSubmit={handleSendMessage} className="flex items-center">
          <input
            type="text"
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="메시지를 입력해주세요"
            className="w-full border border-gray-200 rounded-full p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 bg-[#F2F2F2]"
          />
          <button
            type="submit"
            className="ml-2 bg-green-500 hover:bg-green-600 rounded-full p-2.5 text-white transition-colors"
            disabled={!isConnected}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              viewBox="0 0 16 16"
            >
              <path d="M15.964.686a.5.5 0 0 0-.65-.65L.767 5.855H.766l-.452.18a.5.5 0 0 0-.082.887l.41.26.001.002 4.995 3.178 3.178 4.995.002.002.26.41a.5.5 0 0 0 .886-.083l6-15Zm-1.833 1.89L6.637 10.07l-.215-.338a.5.5 0 0 0-.154-.154l-.338-.215 7.494-7.494 1.178-.471-.47 1.178Z" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatBox;
