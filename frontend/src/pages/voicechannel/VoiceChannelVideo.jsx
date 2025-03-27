import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import VideoLayout from '../../components/video/VideoLayout';
import ChatBox from '../../components/video/ChatBox';
import VideoControls from '../../components/video/VideoControls';
import useOpenVidu from '../../hooks/useOpenVidu';
import useChat from '../../hooks/useChat';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

function VoiceChannelVideo() {
  const { channelId } = useParams(); // URL에서 channelId 추출
  const { currentUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // 상태 관리
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isVoiceTranslationOn, setIsVoiceTranslationOn] = useState(false);
  const [isSignLanguageOn, setIsSignLanguageOn] = useState(false);
  const [channelInfo, setChannelInfo] = useState(null);
  const [connectionError, setConnectionError] = useState('');

  // 초기화 여부 추적
  const hasJoined = useRef(false);

  // 인증 확인
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', {
        state: { from: `/voice-channel-video/${channelId}` },
      });
    }
  }, [isAuthenticated, navigate, channelId]);

  // 채널 정보 가져오기
  useEffect(() => {
    const fetchChannelInfo = async () => {
      try {
        const token = sessionStorage.getItem('token');
        if (!token) {
          throw new Error('인증 토큰이 없습니다.');
        }

        const response = await axios.get(`/api/channels/${channelId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.data && response.data.data) {
          setChannelInfo(response.data.data);
          return response.data.data;
        } else {
          throw new Error('채널 정보가 올바르지 않습니다.');
        }
      } catch (error) {
        console.error('채널 정보 가져오기 실패:', error);
        setConnectionError('채널 정보를 가져오는데 실패했습니다.');
        return null;
      }
    };
    if (isAuthenticated && channelId) {
      fetchChannelInfo();
    }
  }, [channelId, isAuthenticated]);

  // 커스텀 훅 사용
  const { participants, joinSession, leaveSession, toggleAudio, toggleVideo } =
    useOpenVidu(
      channelId,
      currentUser?.username || 'Guest',
      isMicOn,
      isCameraOn,
    );

  const {
    messages,
    newMessage,
    setNewMessage,
    handleSendMessage,
    handleKeyDown,
    chatContainerRef,
  } = useChat(currentUser?.id || 'guest');

  // 세션 참여
  useEffect(() => {
    if (isAuthenticated && channelId && !hasJoined.current) {
      hasJoined.current = true;
      joinSession();
    }

    return () => {
      if (hasJoined.current) {
        leaveSession();
      }
    };
  }, [channelId, isAuthenticated]);

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

  const handleLeaveChannel = async () => {
    try {
      leaveSession();

      // 채널 퇴장 API 호출
      if (isAuthenticated) {
        const token = sessionStorage.getItem('token');
        await axios.post(
          `/api/channels/${channelId}/leave`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          },
        );
      }

      navigate('/voice-channel');
    } catch (error) {
      console.error('채널 퇴장 실패:', error);
    }
  };

  // 인증 로딩 중이거나 인증되지 않은 경우 로딩 표시
  if (!isAuthenticated) {
    return (
      <div className="flex justify-center items-center h-screen">
        인증이 필요합니다...
      </div>
    );
  }

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
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
              />
            </svg>
          </div>
          <div>
            <h1 className="font-bold text-gray-800">
              {channelInfo?.channel_name || '음성 채널'}
            </h1>
            <p className="text-sm text-gray-500">
              참여자: {participants.length}/{channelInfo?.max_player || 4}
            </p>
          </div>
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
            {connectionError}
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

        {/* ChatBox 컴포넌트 사용 */}
        <ChatBox
          messages={messages}
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          handleSendMessage={handleSendMessage}
          handleKeyDown={handleKeyDown}
          chatContainerRef={chatContainerRef}
          currentUserId={currentUser?.id || 'guest'}
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

export default VoiceChannelVideo;
