import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import VideoLayout from '../../components/video/VideoLayout';
import ChatBox from '../../components/video/ChatBox';
import VideoControls from '../../components/video/VideoControls';
import useOpenVidu from '../../hooks/useOpenvidu';
import useParticipantControls from '../../hooks/useParticipantControls';
import useChat from '../../hooks/useChat';
import axios from 'axios';

function CounselChannelVideo() {
  // URL에서 채널 ID 가져오기
  const { channelId } = useParams();

  // 상태 관리
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [currentUserId] = useState('user1');
  const [isHost] = useState(true);
  const [isVoiceTranslationOn, setIsVoiceTranslationOn] = useState(false);
  const [isSignLanguageOn, setIsSignLanguageOn] = useState(false);
  const [roomInfo, setRoomInfo] = useState({
    name: '상담방',
    maxParticipants: 4,
    description: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // 초기화 여부 추적
  const hasJoined = useRef(false);

  // 방 정보 가져오기
  useEffect(() => {
    const fetchChannelInfo = async () => {
      try {
        setIsLoading(true);
        // 세션 스토리지에서 먼저 확인
        const storedChannelInfo = sessionStorage.getItem('currentChannel');

        if (storedChannelInfo) {
          const channelData = JSON.parse(storedChannelInfo);
          setRoomInfo({
            name: channelData.channelName || '상담방',
            maxParticipants: channelData.maxPlayer || 4,
            description: channelData.description || '',
          });
          setIsLoading(false);
          return;
        }

        // 세션 스토리지에 없으면 API 호출
        if (channelId) {
          const token = sessionStorage.getItem('token');
          const response = await axios.get(
            `${import.meta.env.VITE_API_URL}/channels/counseling/${channelId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          );

          if (response.data) {
            setRoomInfo({
              name: response.data.channelName || '상담방',
              maxParticipants: response.data.maxPlayer || 4,
              description: response.data.description || '',
            });
          }
        }
      } catch (error) {
        console.error('방 정보 가져오기 실패:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChannelInfo();
  }, [channelId]);

  // 커스텀 훅 사용
  const {
    participants,
    connectionError,
    joinSession,
    leaveSession,
    toggleAudio,
    toggleVideo,
  } = useOpenVidu(
    channelId || 'session1',
    'randomNickname',
    isMicOn,
    isCameraOn,
  );

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
    if (!hasJoined.current && !isLoading) {
      hasJoined.current = true;
      joinSession();
    }

    return () => {
      leaveSession();
    };
  }, [isLoading]);

  // 참가자 제어 초기화
  useEffect(() => {
    if (participants && participants.length > 0) {
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
            {roomInfo.description && (
              <p className="text-gray-500 text-sm">{roomInfo.description}</p>
            )}
          </div>
        </div>
        <div className="text-sm text-gray-500">
          최대 인원: {roomInfo.maxParticipants}명
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

      {/* 로딩 표시 */}
      {isLoading && (
        <div className="flex justify-center items-center h-32 mx-4 my-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
          <span className="ml-2 text-gray-600">방 정보를 불러오는 중...</span>
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

        {/* ChatBox 컴포넌트 사용 */}
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

      {/* VideoControls 컴포넌트 사용 */}
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
  );
}

export default CounselChannelVideo;
