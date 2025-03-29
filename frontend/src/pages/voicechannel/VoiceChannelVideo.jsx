// VoiceChannelVideo.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import VideoLayout from '../../components/video/VideoLayout';
import ChatBox from '../../components/video/ChatBox';
import VideoControls from '../../components/video/VideoControls';
import useOpenVidu from '../../hooks/useOpenvidu';
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
  const [channels, setChannels] = useState([]); // 채널 목록 상태

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

  // 채널 목록 가져오기 함수
  const fetchChannels = async () => {
    try {
      const token = sessionStorage.getItem('token');
      if (!token) {
        throw new Error('인증 토큰이 없습니다.');
      }

      const response = await axios.get('/api/channels', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.data && response.data.data) {
        setChannels(response.data.data);
      } else {
        throw new Error('채널 목록을 가져오는 데 실패했습니다.');
      }
    } catch (error) {
      console.error('채널 목록 가져오기 실패:', error);
      setConnectionError('채널 목록을 가져오는데 실패했습니다.');
    }
  };

  // 채널 나가기 및 목록 새로고침
  const handleLeaveChannel = () => {
    try {
      leaveSession();

      // 채널 목록 페이지로 이동
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
              {channelInfo?.channelName || '음성 채널'}
            </h1>
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
