import React, { useState, useEffect, useRef } from 'react';
import VideoLayout from '../../components/video/VideoLayout';
import ChatBox from '../../components/video/ChatBox';
import VideoControls from '../../components/video/VideoControls';

import useOpenVidu from '../../hooks/useOpenvidu';
import useChat from '../../hooks/useChat';

function VoiceChannelVideo() {
  // 상태 관리
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [currentUserId] = useState('user1');
  const [isVoiceTranslationOn, setIsVoiceTranslationOn] = useState(false);
  const [isSignLanguageOn, setIsSignLanguageOn] = useState(false);

  // 초기화 여부 추적
  const hasJoined = useRef(false);

  const {
    participants,
    connectionError,
    joinSession,
    leaveSession,
    toggleAudio,
    toggleVideo,
  } = useOpenVidu('session1', 'randomNickname', isMicOn, isCameraOn);

  const {
    messages,
    newMessage,
    setNewMessage,
    handleSendMessage,
    handleKeyDown,
    chatContainerRef,
  } = useChat(currentUserId);

  // 세션 참여
  useEffect(() => {
    if (!hasJoined.current) {
      hasJoined.current = true;
      joinSession();
    }

    return () => {
      leaveSession();
    };
  }, []);

  // 토글 함수
  const toggleMic = () => {
    setIsMicOn(!isMicOn);
    toggleAudio(!isMicOn);
  };

  const toggleCamera = () => {
    setIsCameraOn(!isCameraOn);
    toggleVideo(!isCameraOn);
  };

  const toggleVoiceTranslation = () => {
    setIsVoiceTranslationOn(!isVoiceTranslationOn);
  };

  const toggleSignLanguage = () => {
    setIsSignLanguageOn(!isSignLanguageOn);
  };

  // 참가자 정보 렌더링 (발언권 관련 기능 제거)
  const renderParticipantInfo = participant => (
    <div className="absolute bottom-2 right-2 bg-gray-700 bg-opacity-70 text-white px-2 py-1 rounded text-xs">
      {participant.name}
      {participant.isSelf && ' (나)'}
    </div>
  );

  const handleLeaveChannel = () => {
    leaveSession();
    window.location.href = '/voice-channel';
  };

  return (
    <div className="w-full bg-gradient-to-b from-[#EAF2EE] to-[#C6E1D8] rounded-xl pt-8 pb-4 px-4">
      {connectionError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex items-center justify-between">
          <span>{connectionError}</span>
          <button
            onClick={joinSession}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-xs"
          >
            재연결
          </button>
        </div>
      )}

      <div className="w-full max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-4 mb-4 h-full">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden lg:flex-1">
            <div className="p-4 bg-[#F8F9FA]">
              <VideoLayout
                participants={participants}
                renderParticipantInfo={renderParticipantInfo}
              />
            </div>
          </div>

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

        <VideoControls
          isMicOn={isMicOn}
          isCameraOn={isCameraOn}
          toggleMic={toggleMic}
          toggleCamera={toggleCamera}
          isVoiceTranslationOn={isVoiceTranslationOn}
          isSignLanguageOn={isSignLanguageOn}
          toggleVoiceTranslation={toggleVoiceTranslation}
          toggleSignLanguage={toggleSignLanguage}
          onLeaveChannel={handleLeaveChannel}
        />
      </div>
    </div>
  );
}

export default VoiceChannelVideo;
