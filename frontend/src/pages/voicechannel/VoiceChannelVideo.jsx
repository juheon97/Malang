import React, { useState, useEffect, useRef } from 'react';
import EntryRequestList from '../../components/common/EntryRequestList'; // EntryRequestList 컴포넌트 임포트
import { mockEntryRequests } from '../../api/entryRequests'; // 테스트 데이터 임포트
import VideoLayout from '../../components/video/VideoLayout'; 

function VoiceChannelVideo() {
  const [participants, setParticipants] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [currentUserId, setCurrentUserId] = useState('user1');
  const [entryRequests, setEntryRequests] = useState([]); // 입장 요청 상태 추가
  const localVideoRef = useRef(null);
  const chatContainerRef = useRef(null);

  // 테스트용 입장 요청 추가
  useEffect(() => {
    const timer = setTimeout(() => {
      setEntryRequests(mockEntryRequests);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  // 입장 요청 수락 처리
  const handleAcceptRequest = (requestId) => {
    // 요청 목록에서 해당 요청 찾기
    const request = entryRequests.find(req => req.id === requestId);
    if (request) {
      // 참가자 목록에 추가
      const newParticipant = {
        id: request.id,
        name: request.name,
        stream: null,
        isSelf: false
      };
      setParticipants(prev => [...prev, newParticipant]);
      
      // 요청 목록에서 제거
      setEntryRequests(prev => prev.filter(req => req.id !== requestId));
      
      console.log(`입장 요청 수락: ${requestId}`);
    }
  };

  // 입장 요청 거절 처리
  const handleRejectRequest = (requestId) => {
    setEntryRequests(prev => prev.filter(req => req.id !== requestId));
    console.log(`입장 요청 거절: ${requestId}`);
  };


  // 가상의 참가자 데이터 초기화
  useEffect(() => {
    const mockParticipants = [
      { id: 'user1', name: '나', stream: null, isSelf: true },
      { id: 'user2', name: '참가자 1', stream: null, isSelf: false },
      { id: 'user3', name: '참가자 2', stream: null, isSelf: false },
      { id: 'user4', name: '참가자 3', stream: null, isSelf: false },
    ];
    
    setParticipants(mockParticipants);
    
    // 실제 구현에서는 여기서 미디어 스트림을 가져와 연결
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      })
      .catch(err => {
        console.error('미디어 장치 접근 오류:', err);
      });
  }, []);

  // 채팅 스크롤 자동 이동
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() === '') return;
    
    const message = {
      id: Date.now(),
      text: newMessage,
      sender: currentUserId,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages([...messages, message]);
    setNewMessage('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const toggleMic = () => {
    setIsMicOn(!isMicOn);
  };

  const toggleCamera = () => {
    setIsCameraOn(!isCameraOn);
  };

  

  return (
    <div className="w-full bg-gradient-to-b from-[#EAF2EE] to-[#C6E1D8] rounded-xl pt-8 pb-4 px-4 ">
         {/* Entry Request List */}
      {entryRequests.length > 0 && (
        <EntryRequestList
          entryRequests={entryRequests}
          onAccept={handleAcceptRequest}
          onReject={handleRejectRequest}
        />
      )}
      <div className="w-full max-w-6xl mx-auto">
        {/* 메인 컨테이너 - 비디오와 채팅 영역 */}
<div className="flex flex-col lg:flex-row gap-4 mb-4 h-full">
  {/* 비디오 영역 */}
  <div className="bg-white rounded-xl shadow-lg overflow-hidden lg:flex-1">
    <div className="p-4 bg-[#F8F9FA]">
    <VideoLayout 
                participants={participants} 
                localVideoRef={localVideoRef} 
                renderParticipantInfo={renderParticipantInfo} 
              />
    </div>
  </div>

  {/* 채팅 영역 */}
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
</div>
        {/* 컨트롤 영역 */}
<div className="bg-white rounded-xl shadow-lg overflow-hidden">
  <div className="p-4 flex items-center justify-between">
    <div className="flex space-x-4">
      <button 
        onClick={toggleMic}
        className={`w-12 h-12 flex items-center justify-center rounded-full ${
          isMicOn ? 'bg-[#E8F5E9]' : 'bg-red-100'
        } hover:opacity-80`}
      >
        {isMicOn ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        ) : (
          <div className="relative">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
            {/* 취소선 */}
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-red-500 transform -rotate-45"></div>
           
          </div>
        )}
      </button>
      <button 
        onClick={toggleCamera}
        className={`w-12 h-12 flex items-center justify-center rounded-full ${
          isCameraOn ? 'bg-[#E8F5E9]' : 'bg-red-100'
        } hover:opacity-80`}
      >
        {isCameraOn ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        ) : (
          <div className="relative">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            {/* 취소선 */}
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-red-500 transform -rotate-45"></div>
           
          </div>
        )}
      </button>
    </div>
    
    {/* 나가기 버튼 */}
    <button 
      onClick={() => window.location.href = '/voice-channel'}
      className="w-12 h-12 flex items-center justify-center rounded-full bg-red-100 hover:bg-red-200"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
      </svg>
    </button>
  </div>
</div>

      </div>
    </div>
  );
}

export default VoiceChannelVideo;
