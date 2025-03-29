import React, { useState, useEffect, useRef } from 'react';
import websocketService from '../../services/websocketService';

const ChatBox = ({ currentUserId, channelId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const chatContainerRef = useRef(null);

  const user = JSON.parse(sessionStorage.getItem('user'));
  const userId = user?.id;
  const nickname = user?.username;

  // 📌 channelId를 int로 변환
  const intChannelId = parseInt(channelId, 10);

  useEffect(() => {
    if (isNaN(intChannelId)) {
      console.error('channelId가 숫자가 아닙니다:', channelId);
      return;
    }

    websocketService.connect(intChannelId);

    const checkConnection = setInterval(() => {
      setIsConnected(websocketService.isConnected);
    }, 500);

    const subscriptionDestination = `/sub/${intChannelId}/`;
    const subscription = websocketService.subscribe(
      subscriptionDestination,
      message => {
        try {
          const data = JSON.parse(message.body);
          if (data.event === 'message') {
            setMessages(prevMessages => [
              ...prevMessages,
              {
                id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                senderId: userId,
                text: data.content,
                sender: nickname || '익명',
              },
            ]);
          }
        } catch (err) {
          console.error('메시지 파싱 오류:', err);
        }
      },
    );

    return () => {
      clearInterval(checkConnection);
      if (subscription) {
        if (typeof subscription === 'function') {
          subscription();
        } else if (typeof subscription.unsubscribe === 'function') {
          subscription.unsubscribe();
        }
      }
      websocketService.disconnect();
    };
  }, [intChannelId, userId, nickname]);

  const handleSendMessage = e => {
    e.preventDefault();

    if (newMessage.trim()) {
      const payload = JSON.stringify({
        content: newMessage,
        event: 'send',
      });

      const destination = `/pub/${intChannelId}/chat`;

      const success = websocketService.sendMessage(destination, payload);

      if (success) {
        setMessages(prevMessages => [
          ...prevMessages,
          {
            id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            senderId: userId,
            text: newMessage,
            sender: nickname || '익명',
          },
        ]);
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
        <h1 className="text-2xl font-bold text-gray-800 relative pl-3 mb-2 mt-2">
          채팅
        </h1>
        <div className="flex items-center">
          <div
            className={`w-3 h-3 rounded-full ${
              isConnected ? 'bg-green-500' : 'bg-red-500'
            }`}
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
            className={`mb-2 flex ${
              message.senderId === userId ? 'justify-end' : 'justify-start'
            }`}
          >
            <div className="flex flex-col items-start max-w-[85%]">
              {message.sender !== nickname && (
                <span className="text-xs font-semibold text-gray-600 mb-1 ml-1">
                  {message.sender}
                </span>
              )}
              <div
                className={`rounded-lg px-3 py-2 text-sm ${
                  message.senderId === userId
                    ? 'bg-[#D1F4CB] self-end'
                    : 'bg-[#E9EDF2] self-start'
                }`}
              >
                <p>{message.text}</p>
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
