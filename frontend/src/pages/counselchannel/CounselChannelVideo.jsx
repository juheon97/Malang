import React, { useState, useEffect, useRef } from 'react';

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
    // 3초 후 테스트 요청 추가
    const timer = setTimeout(() => {
      setEntryRequests([
        { id: 'req1', name: '박다빈', birthdate: '2000.10.10' }
      ]);
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

  const handleAcceptRequest = (requestId) => {
    // 실제 구현에서는 여기서 사용자 입장 처리 로직 추가
    setEntryRequests(prev => prev.filter(req => req.id !== requestId));
  };
  
  const handleRejectRequest = (requestId) => {
    // 실제 구현에서는 여기서 거절 처리 로직 추가
    setEntryRequests(prev => prev.filter(req => req.id !== requestId));
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

  // 참가자 수에 따른 비디오 레이아웃 결정
  const getVideoLayout = () => {
    const count = participants.length;
    
    if (count === 1) {
      return (
        <div className="w-full aspect-video bg-gray-100 rounded-lg overflow-hidden">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-2 right-2 bg-gray-700 bg-opacity-70 text-white px-2 py-1 rounded text-xs">
            나
          </div>
        </div>
      );
    } else if (count === 2) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {participants.map((participant, index) => (
            <div 
              key={participant.id} 
              className="relative bg-gray-100 rounded-lg overflow-hidden aspect-video"
            >
              <video
                ref={participant.isSelf ? localVideoRef : null}
                autoPlay
                muted={participant.isSelf}
                className="w-full h-full object-cover"
              />
              {renderParticipantInfo(participant)}
            </div>
          ))}
        </div>
      );
    } else if (count === 3) {
      return (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            {participants.slice(0, 2).map((participant) => (
              <div 
                key={participant.id} 
                className="relative bg-gray-100 rounded-lg overflow-hidden aspect-video"
              >
                <video
                  ref={participant.isSelf ? localVideoRef : null}
                  autoPlay
                  muted={participant.isSelf}
                  className="w-full h-full object-cover"
                />
                {renderParticipantInfo(participant)}
              </div>
            ))}
          </div>
          <div className="mx-auto relative bg-gray-100 rounded-lg overflow-hidden aspect-video sm:w-1/2">
            <video
              ref={participants[2].isSelf ? localVideoRef : null}
              autoPlay
              muted={participants[2].isSelf}
              className="w-full h-full object-cover"
            />
            {renderParticipantInfo(participants[2])}
          </div>
        </>
      );
    } else {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {participants.map((participant) => (
            <div 
              key={participant.id} 
              className="relative bg-gray-100 rounded-lg overflow-hidden aspect-video"
            >
              <video
                ref={participant.isSelf ? localVideoRef : null}
                autoPlay
                muted={participant.isSelf}
                className="w-full h-full object-cover"
              />
              {renderParticipantInfo(participant)}
            </div>
          ))}
        </div>
      );
    }
  };

  return (
    <div className="w-full bg-gradient-to-b from-[#EAF2EE] to-[#C6E1D8] rounded-xl pt-8 pb-4 px-4">
      {entryRequests.length > 0 && (
        <div className="fixed top-20 right-4 z-50">
          {entryRequests.map(request => (
            <div 
              key={request.id} 
              className="bg-white rounded-lg shadow-lg p-4 mb-2 w-72"
            >
              <p className="text-sm mb-3">
                {request.name}({request.birthdate})님께서 입장을 요청하셨습니다.
              </p>
              <div className="flex justify-end space-x-2">
                <button 
                  onClick={() => handleAcceptRequest(request.id)}
                  className="px-3 py-1 bg-[#E8F5E9] text-green-600 rounded-full text-sm hover:bg-[#C8E6C9]"
                >
                  수락
                </button>
                <button 
                  onClick={() => handleRejectRequest(request.id)}
                  className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-sm hover:bg-red-200"
                >
                  거절
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="w-full max-w-6xl mx-auto">
        {/* 메인 컨테이너 - 비디오와 채팅 영역 */}
        <div className="flex flex-col lg:flex-row gap-4 mb-4 h-full">
          {/* 비디오 영역 */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden lg:flex-1">
            <div className="p-4 bg-[#F8F9FA]">
              {getVideoLayout()}
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
      onClick={() => window.location.href = '/counsel-channel'}
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
export default CounselChannelVideo;