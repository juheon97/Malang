// CounselChannelVideo.jsx
import React, { useState, useEffect, useRef } from 'react';
import EntryRequestList from '../../components/common/EntryRequestList';
import VideoLayout from '../../components/video/VideoLayout';
import ChatBox from '../../components/video/ChatBox';
import VideoControls from '../../components/video/VideoControls';

import useOpenVidu from '../../hooks/useOpenvidu';
import useParticipantControls from '../../hooks/useParticipantControls';
import useChat from '../../hooks/useChat';
import useEntryRequests from '../../hooks/useEntryRequests';

function CounselChannelVideo() {
  // 상태 관리
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [currentUserId] = useState('user1');
  const [isHost] = useState(true);
  const [isVoiceTranslationOn, setIsVoiceTranslationOn] = useState(false);
  const [isSignLanguageOn, setIsSignLanguageOn] = useState(false);

  // 초기화 여부 추적
  const hasJoined = useRef(false);

  // 커스텀 훅 사용
  const { entryRequests, handleAcceptRequest, handleRejectRequest } =
    useEntryRequests();

  const {
    participants,
    connectionError,
    joinSession,
    leaveSession,
    toggleAudio,
    toggleVideo,
  } = useOpenVidu('session1', 'randomNickname', isMicOn, isCameraOn);

  const {
    participantControls,
    toggleParticipantSpeaking,
    toggleParticipantControls,
    initParticipantControls,
  } = useParticipantControls(isHost);

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

  // 참가자 제어 초기화
  useEffect(() => {
    if (participants.length > 0) {
      initParticipantControls(participants);
    }
  }, [participants]);

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

  // 참가자 정보 렌더링
  const renderParticipantInfo = participant => (
    <>
      <div className="absolute bottom-2 right-2 bg-gray-700 bg-opacity-70 text-white px-2 py-1 rounded text-xs flex items-center">
        {participant.name}
        {participant.isSelf && ' (나)'}
        {!participant.canSpeak && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 ml-1 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
            />
          </svg>
        )}
      </div>

      {isHost && !participant.isSelf && (
        <div className="absolute top-2 right-2">
          <button
            onClick={() => toggleParticipantControls(participant.id)}
            className="bg-gray-700 bg-opacity-70 text-white p-1 rounded-full"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"
              />
            </svg>
          </button>

          {participantControls[participant.id]?.showControls && (
            <div className="absolute top-10 right-0 bg-white shadow-lg rounded-md p-2 z-10 w-40">
              <button
                onClick={() => toggleParticipantSpeaking(participant.id)}
                className="w-full text-left px-2 py-1 text-sm hover:bg-gray-100 rounded flex items-center"
              >
                {participantControls[participant.id]?.canSpeak ? (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-2 text-red-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
                      />
                    </svg>
                    발언권 제거
                  </>
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-2 text-green-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                      />
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

  const handleLeaveChannel = () => {
    leaveSession();
    window.location.href = '/counsel-channel';
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

      {entryRequests.length > 0 && (
        <EntryRequestList
          entryRequests={entryRequests}
          onAccept={handleAcceptRequest}
          onReject={handleRejectRequest}
        />
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

export default CounselChannelVideo;
