import React, { useState, useEffect, useRef } from 'react';
import EntryRequestList from '../../components/common/EntryRequestList'; // EntryRequestList 컴포넌트 임포트
import { mockEntryRequests } from '../../api/entryRequests'; // 테스트 데이터 임포트
import VideoLayout from '../../components/video/VideoLayout'; 
import ChatBox from '../../components/video/ChatBox';
import VideoControls from '../../components/video/VideoControls';


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

  const renderParticipantInfo = (participant) => {
    return (
      <div className="absolute bottom-2 right-2 bg-gray-700 bg-opacity-70 text-white px-2 py-1 rounded text-xs">
        {participant.name}
        {participant.isSelf && " (나)"}
      </div>
    );
  };

  const handleLeaveChannel = () => {
    window.location.href = '/voice-channel';
  };
  
  const [isVoiceTranslationOn, setIsVoiceTranslationOn] = useState(false);
const [isSignLanguageOn, setIsSignLanguageOn] = useState(false);

const toggleVoiceTranslation = () => {
  setIsVoiceTranslationOn(!isVoiceTranslationOn);
};

const toggleSignLanguage = () => {
  setIsSignLanguageOn(!isSignLanguageOn);
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
  <ChatBox
            messages={messages}
            newMessage={newMessage}
            setNewMessage={setNewMessage}
            handleSendMessage={handleSendMessage}
            handleKeyDown={handleKeyDown}
            chatContainerRef={chatContainerRef}
            currentUserId={currentUserId}
          />
        </div>
        {/* 컨트롤 영역 */}
        <VideoControls 
  isMicOn={isMicOn}
  isCameraOn={isCameraOn}
  toggleMic={toggleMic}
  toggleCamera={toggleCamera}
  isVoiceTranslationOn={isVoiceTranslationOn}
  isSignLanguageOn={isSignLanguageOn}
  toggleVoiceTranslation={toggleVoiceTranslation}
  toggleSignLanguage={toggleSignLanguage}
/>
      </div>
    </div>
  );
}


export default VoiceChannelVideo;
