// components/chat/ChatBox.jsx
import React, { useRef, useEffect } from 'react';

const ChatBox = ({ 
    messages, 
    newMessage, 
    setNewMessage, 
    handleSendMessage, 
    handleKeyDown, 
    chatContainerRef, 
    currentUserId 
  }) => {
    return (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden w-full lg:w-80 flex flex-col">
        <div className="p-3 border-b border-gray-100">
          <h1 
            style={{fontFamily: "'HancomMalangMalang-Regular', sans-serif"}} 
            className="text-2xl font-bold text-gray-800 relative pl-3 mb-2 mt-2">
            채팅
          </h1>
        </div>
        
        {/* 메시지 목록 - flex-1을 추가하여 남은 공간을 채우도록 함 */}
        <div 
          ref={chatContainerRef}
          className="p-3 overflow-y-auto flex-1"
          style={{ 
            minHeight: "350px",
            maxHeight: "350px" 
          }}
        >
          {messages.map((message) => (
            <div 
              key={message.id} 
              className={`mb-2 flex ${message.sender === currentUserId ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${message.sender === currentUserId ? 'bg-[#D1F4CB] text-gray-800' : 'bg-[#E9EDF2] text-gray-800'}`}
              >
                <p>{message.text}</p>
                <p className="text-xs text-gray-500 mt-1">{message.timestamp}</p>
              </div>
            </div>
          ))}
        </div>
        
        {/* 메시지 입력 */}
        <div className="p-3 border-t border-gray-100 mt-auto">
          <form onSubmit={handleSendMessage}>
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="메시지를 입력해주세요"
              className="w-full border border-gray-200 rounded-full p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 bg-[#F2F2F2]"
            />
          </form>
        </div>
      </div>
    );
  };
  
  export default ChatBox;
