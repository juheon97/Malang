// CounselChannelVideo.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import VideoLayout from '../../components/video/VideoLayout';
import useOpenVidu from '../../hooks/useOpenvidu';
import useParticipantControls from '../../hooks/useParticipantControls';
import useChat from '../../hooks/useChat';

function CounselChannelVideo() {
  // 상태 관리
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [currentUserId] = useState('user1');
  const [isHost] = useState(true);
  const [isVoiceTranslationOn, setIsVoiceTranslationOn] = useState(false);
  const [isSignLanguageOn, setIsSignLanguageOn] = useState(false);
  const [roomInfo] = useState({
    name: '마음 건강 상담실',
    maxParticipants: 4,
  });
  const navigate = useNavigate();

  // 초기화 여부 추적
  const hasJoined = useRef(false);
  const chatInputRef = useRef(null);

  // 커스텀 훅 사용
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
      <div className="absolute bottom-2 left-2 bg-black bg-opacity-30 text-white px-2 py-1 rounded text-xs">
        {participant.name}
        {participant.isSelf && ' (나)'}
      </div>
    </>
  );

  const handleLeaveChannel = () => {
    leaveSession();
    navigate('/counsel-channel');
  };

  return (
    <div
      className="flex flex-col h-full bg-[#f5fdf5]"
      style={{ minHeight: 'calc(100vh - 75px)' }}
    >
      {/* 방 정보 헤더 */}
      <div className="flex items-center justify-between p-4 rounded-lg bg-white m-4 mb-0 shadow-sm">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-[#00a173] flex items-center justify-center text-white mr-3">
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
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <div>
            <h1 className="font-bold text-gray-800">{roomInfo.name}</h1>
            <div className="flex items-center text-sm text-gray-500">
              <span>0/4 참여중</span>
              <span className="mx-2">•</span>
              <span>00:00:00</span>
            </div>
          </div>
        </div>
        <div className="flex space-x-2">
          <button className="bg-white border border-gray-200 text-gray-700 px-3 py-1.5 rounded-full text-sm hover:bg-gray-50 flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1.5 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            정보
          </button>
          <button
            onClick={handleLeaveChannel}
            className="bg-red-50 border border-red-200 text-red-500 px-3 py-1.5 rounded-full text-sm hover:bg-red-100 flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            나가기
          </button>
        </div>
      </div>

      {/* 에러 메시지 */}
      {connectionError && (
        <div className="mx-4 mt-2 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between text-sm">
          <div className="flex items-center text-red-600">
            <svg
              className="h-5 w-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            화상 연결 중 오류가 발생했습니다.
          </div>
          <button
            onClick={joinSession}
            className="bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700"
          >
            재연결
          </button>
        </div>
      )}

      {/* 메인 컨텐츠 - 영상과 채팅 */}
      <div className="flex flex-1 overflow-hidden p-4 gap-4">
        {/* 영상 영역 */}
        <div className="flex-1 bg-white rounded-lg shadow-sm overflow-hidden">
          <VideoLayout
            participants={participants}
            renderParticipantInfo={renderParticipantInfo}
          />
        </div>

        {/* 채팅 영역 */}
        <div className="w-80 flex flex-col bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="py-3 px-4 border-b border-gray-100">
            <h2 className="font-medium text-gray-800">채팅</h2>
          </div>

          {/* 채팅 메시지 영역 */}
          <div
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-4"
            style={{ height: 'calc(100% - 130px)' }}
          >
            {messages.length > 0 ? (
              messages.map((msg, index) => (
                <div
                  key={index}
                  className={`mb-3 max-w-[85%] ${
                    msg.userId === currentUserId ? 'ml-auto' : 'mr-auto'
                  }`}
                >
                  <p className="text-xs text-gray-500 mb-1">
                    {msg.userId === currentUserId ? '나' : msg.userName}
                  </p>
                  <div
                    className={`p-2 rounded-lg text-sm ${
                      msg.userId === currentUserId
                        ? 'bg-[#E0F5E9] text-gray-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 text-sm p-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-10 w-10 mb-2 text-gray-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                <p className="text-center">
                  대화가 시작되지 않았습니다.
                  <br />
                  메시지를 입력해주세요.
                </p>
              </div>
            )}
          </div>

          {/* 채팅 입력 영역 */}
          <div className="p-4 border-t border-gray-100">
            <div className="relative">
              <input
                type="text"
                ref={chatInputRef}
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="메시지를 입력해주세요"
                className="w-full rounded-full bg-gray-100 border-0 px-4 py-2 text-sm focus:ring-1 focus:ring-[#00a173] focus:bg-white"
              />
              <button
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                className={`absolute right-2 top-1/2 transform -translate-y-1/2 rounded-full p-1 ${
                  newMessage.trim()
                    ? 'text-[#00a173] hover:bg-[#E0F5E9]'
                    : 'text-gray-300'
                }`}
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
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 컨트롤 바 */}
      <div className="flex justify-between items-center p-4 bg-white mx-4 mb-4 rounded-lg shadow-sm">
        <div className="flex space-x-2">
          <button
            onClick={toggleMic}
            className={`w-10 h-10 rounded-full flex items-center justify-center ${
              isMicOn ? 'bg-gray-100 text-gray-700' : 'bg-red-100 text-red-500'
            }`}
          >
            {isMicOn ? (
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
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                />
              </svg>
            ) : (
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
          </button>
          <button
            onClick={toggleCamera}
            className={`w-10 h-10 rounded-full flex items-center justify-center ${
              isCameraOn
                ? 'bg-gray-100 text-gray-700'
                : 'bg-red-100 text-red-500'
            }`}
          >
            {isCameraOn ? (
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
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            ) : (
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
                  d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                />
              </svg>
            )}
          </button>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <span className="text-sm mr-2">음성 변역</span>
            <button
              onClick={toggleVoiceTranslation}
              className={`px-4 py-1 text-sm rounded-full ${
                isVoiceTranslationOn
                  ? 'bg-[#00a173] text-white'
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              시작
            </button>
          </div>

          <div className="flex items-center">
            <span className="text-sm mr-2">수화 번역</span>
            <button
              onClick={toggleSignLanguage}
              className={`px-4 py-1 text-sm rounded-full ${
                isSignLanguageOn
                  ? 'bg-[#00a173] text-white'
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              시작
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CounselChannelVideo;
