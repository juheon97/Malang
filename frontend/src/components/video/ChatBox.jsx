import React, { useState, useEffect, useRef } from 'react';
import websocketService from '../../services/websocketService';

const ChatBox = ({ currentUserId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const chatContainerRef = useRef(null);
  // 전송한 메시지의 고유 id를 저장하기 위한 ref (중복 수신 방지를 위해)
  const sentMessageIdsRef = useRef(new Set());

  useEffect(() => {
    websocketService.connect();

    const checkConnection = setInterval(() => {
      setIsConnected(websocketService.isConnected);
    }, 500);

    // 메시지 수신 리스너 등록
    const unsubscribe = websocketService.addListener('message', data => {
      if (data.event === 'message') {
        let parsed;
        try {
          // 수신된 content를 JSON 파싱 시도
          parsed = JSON.parse(data.content);
        } catch (err) {
          // 파싱 실패 시 plain text로 처리 (타 사용자의 메시지일 가능성이 있음)
          parsed = { text: data.content };
        }

        // 만약 수신된 메시지가 id를 포함하고 있고, 해당 id가 이미 로컬에서 기록되어 있다면
        // 이는 본인이 전송한 메시지의 에코이므로 추가하지 않음
        if (parsed.id && sentMessageIdsRef.current.has(parsed.id)) {
          // 기록된 id는 제거해서 메모리 누수를 방지
          sentMessageIdsRef.current.delete(parsed.id);
          return;
        }

        // 본인이 보낸 메시지가 아니라면 왼쪽 말풍선(회색)으로 추가
        setMessages(prevMessages => [
          ...prevMessages,
          {
            id: Date.now(), // 수신 메시지는 임의 id 생성 (혹은 parsed.id 사용 가능)
            text: parsed.text || data.content,
            sender: data.sender || 'server',
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

  const handleSendMessage = e => {
    e.preventDefault();
    if (newMessage.trim()) {
      const messageId = Date.now(); // 고유 id 생성
      // 메시지 payload에 id와 text를 포함하여 JSON 문자열로 변환
      const payload = JSON.stringify({ id: messageId, text: newMessage });
      const success = websocketService.sendMessage('send', payload);
      if (success) {
        // 사용자가 보낸 메시지는 즉시 오른쪽(녹색) 말풍선에 추가
        setMessages(prevMessages => [
          ...prevMessages,
          {
            id: messageId,
            text: newMessage,
            sender: currentUserId,
            timestamp: new Date().toLocaleTimeString(),
          },
        ]);
        // 전송한 메시지의 id를 기록하여, 서버 에코 메시지와 중복 표시되지 않도록 함
        sentMessageIdsRef.current.add(messageId);
        setNewMessage('');
      } else {
        console.error('메시지 전송 실패');
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
            className={`mb-2 flex ${message.sender === currentUserId ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                message.sender === currentUserId
                  ? 'bg-[#D1F4CB] text-gray-800'
                  : 'bg-[#E9EDF2] text-gray-800'
              }`}
            >
              <p>{message.text}</p>
              <p className="text-xs text-gray-500 mt-1">{message.timestamp}</p>
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
