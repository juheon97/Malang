import React, { useState, useEffect, useRef } from 'react';
import { mockEntryRequests } from '../../api/entryRequests';
import EntryRequestList from '../../components/common/EntryRequestList';
import VideoLayout from '../../components/video/VideoLayout'; 
import ChatBox from '../../components/video/ChatBox';
import VideoControls from '../../components/video/VideoControls';


function CounselChannelVideo() {
  const [entryRequests, setEntryRequests] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [currentUserId, setCurrentUserId] = useState('user1');
  const [isHost, setIsHost] = useState(true); // 현재 사용자가 방장인지 여부
  const [showControls, setShowControls] = useState(false);
  const [participantControls, setParticipantControls] = useState({});
  const localVideoRef = useRef(null);
  const chatContainerRef = useRef(null);

  // 테스트용 입장 요청 추가
  useEffect(() => {
    const timer = setTimeout(() => {
      setEntryRequests(mockEntryRequests);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  // 가상의 참가자 데이터 초기화
  useEffect(() => {
    const mockParticipants = [
      { id: 'user1', name: '나', stream: null, isSelf: true, canSpeak: true },
      { id: 'user2', name: '참가자 1', stream: null, isSelf: false, canSpeak: false },
      { id: 'user3', name: '참가자 2', stream: null, isSelf: false, canSpeak: false },
    ];
    
    setParticipants(mockParticipants);
    
    // 초기 참가자 컨트롤 상태 설정
    const initialControls = {};
    mockParticipants.forEach(p => {
      if (!p.isSelf) {
        initialControls[p.id] = { showControls: false, canSpeak: p.canSpeak };
      }
    });
    setParticipantControls(initialControls);
  }, []);

  // 미디어 스트림 연결을 위한 별도의 useEffect - 수정된 부분
  useEffect(() => {
    let stream = null;
    
    const getMedia = async () => {
      try {
        // 브라우저가 getUserMedia를 지원하는지 확인
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          console.error('브라우저가 getUserMedia를 지원하지 않습니다.');
          return;
        }
        
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: true 
        });
        
        // ref가 설정된 후에만 srcObject 설정
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error('미디어 장치 접근 오류:', err);
      }
    };
    
    getMedia();
    
    // 컴포넌트 언마운트 시 스트림 정리
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleAcceptRequest = (requestId) => {
    setEntryRequests((prev) => prev.filter((req) => req.id !== requestId));
    console.log(`입장 요청 수락: ${requestId}`);
  };

  const handleRejectRequest = (requestId) => {
    setEntryRequests((prev) => prev.filter((req) => req.id !== requestId));
    console.log(`입장 요청 거절: ${requestId}`);
  };
  
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

  // 참가자의 발언권 토글
  const toggleParticipantSpeaking = (participantId) => {
    if (!isHost) return; // 방장만 발언권 제어 가능
    
    setParticipants(prev => 
      prev.map(p => 
        p.id === participantId 
          ? { ...p, canSpeak: !p.canSpeak } 
          : p
      )
    );
    
    setParticipantControls(prev => ({
      ...prev,
      [participantId]: {
        ...prev[participantId],
        canSpeak: !prev[participantId].canSpeak
      }
    }));
  };

  // 참가자별 컨트롤 메뉴 토글
  const toggleParticipantControls = (participantId) => {
    setParticipantControls(prev => ({
      ...prev,
      [participantId]: {
        ...prev[participantId],
        showControls: !prev[participantId].showControls
      }
    }));
  };

  // 참가자 정보 및 컨트롤 렌더링
  const renderParticipantInfo = (participant) => {
    return (
      <>
        <div className="absolute bottom-2 right-2 bg-gray-700 bg-opacity-70 text-white px-2 py-1 rounded text-xs flex items-center">
          {participant.name}
          {!participant.canSpeak && (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
            </svg>
          )}
        </div>
        
        {/* 방장만 다른 참가자 컨트롤 가능 */}
        {isHost && !participant.isSelf && (
          <div className="absolute top-2 right-2">
            <button 
              onClick={() => toggleParticipantControls(participant.id)}
              className="bg-gray-700 bg-opacity-70 text-white p-1 rounded-full"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
              </svg>
            </button>
            
            {/* 참가자 컨트롤 메뉴 */}
            {participantControls[participant.id]?.showControls && (
              <div className="absolute top-10 right-0 bg-white shadow-lg rounded-md p-2 z-10 w-40">
                <button 
                  onClick={() => toggleParticipantSpeaking(participant.id)}
                  className="w-full text-left px-2 py-1 text-sm hover:bg-gray-100 rounded flex items-center"
                >
                  {participantControls[participant.id]?.canSpeak ? (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                      </svg>
                      발언권 제거
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                      </svg>
                      발언권 부여
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </>
    );
  };

  const handleLeaveChannel = () => {
    window.location.href = '/counsel-channel';
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
    <div className="w-full bg-gradient-to-b from-[#EAF2EE] to-[#C6E1D8] rounded-xl pt-8 pb-4 px-4">
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
export default CounselChannelVideo;
