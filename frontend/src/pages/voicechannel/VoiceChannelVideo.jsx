import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import VideoLayout from '../../components/video/VideoLayout';
import ChatBox from '../../components/video/ChatBox';
import VideoControls from '../../components/video/VideoControls';
import useOpenVidu from '../../hooks/useOpenvidu';
import useChat from '../../hooks/useChat';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import SockJS from 'sockjs-client/dist/sockjs.min.js';
import { Client } from '@stomp/stompjs';

function VoiceChannelVideo() {
  const { channelId } = useParams();
  const { currentUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isVoiceTranslationOn, setIsVoiceTranslationOn] = useState(false);
  const [isSignLanguageOn, setIsSignLanguageOn] = useState(false);
  const [channelInfo, setChannelInfo] = useState(null);
  const [connectionError, setConnectionError] = useState('');
  const stompClientRef = useRef(null);

  const hasJoined = useRef(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', {
        state: { from: `/voice-channel-video/${channelId}` },
      });
    }
  }, [isAuthenticated, navigate, channelId]);

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

  // 웹소켓 연결 및 채널 입장 알림
  useEffect(() => {
    const connectWebSocket = () => {
      const API_URL = import.meta.env.VITE_API_URL;
      const token = sessionStorage.getItem('token');

      if (!token || !isAuthenticated || !channelId) return;

      // global 객체 문제 해결을 위한 polyfill
      if (typeof window !== 'undefined' && !window.global) {
        window.global = window;
      }

      const stompClient = new Client({
        webSocketFactory: () => new SockJS(`${API_URL}/ws`),
        connectHeaders: {
          Authorization: `Bearer ${token}`,
        },
        onConnect: () => {
          console.log('웹소켓 연결 성공');

          // 채널 구독
          stompClient.subscribe(`/sub/${channelId}`, message => {
            console.log('메시지 수신:', JSON.parse(message.body));
            // 수신한 메시지 처리 로직
          });

          // 입장 메시지 전송
          stompClient.publish({
            destination: `/pub/${channelId}`,
            body: JSON.stringify({
              event: 'join',
              user_id: parseInt(currentUser?.id, 10),
              channel: parseInt(channelId, 10),
            }),
            headers: { 'content-type': 'application/json' },
          });

          console.log('채팅방 입장 알림 전송 완료');
        },
        onStompError: frame => {
          console.error('웹소켓 에러:', frame);
          setConnectionError('웹소켓 연결에 실패했습니다. 다시 시도해주세요.');
        },
      });

      // 연결 시작
      stompClient.activate();
      stompClientRef.current = stompClient;
    };

    if (isAuthenticated && channelId && !hasJoined.current) {
      hasJoined.current = true;
      connectWebSocket(); // 웹소켓 연결
      joinSession(); // OpenVidu 세션 연결
    }

    return () => {
      if (hasJoined.current) {
        // 웹소켓 연결 해제
        if (stompClientRef.current && stompClientRef.current.connected) {
          stompClientRef.current.deactivate();
        }
        leaveSession(); // OpenVidu 세션 연결 해제
      }
    };
  }, [channelId, isAuthenticated, currentUser?.id, joinSession, leaveSession]);

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

  const handleLeaveChannel = async () => {
    try {
      if (stompClientRef.current && stompClientRef.current.connected) {
        // API 명세서에 맞게 leave 이벤트 전송
        stompClientRef.current.publish({
          destination: `/pub/${channelId}`,
          body: JSON.stringify({
            event: 'leave',
            user_id: parseInt(currentUser?.id, 10),
            channel: parseInt(channelId, 10),
          }),
          headers: { 'content-type': 'application/json' },
        });

        // 웹소켓 연결 해제
        stompClientRef.current.deactivate();
      }

      // OpenVidu 세션 종료
      leaveSession();

      // 서버에 채널 퇴장 API 요청
      if (isAuthenticated) {
        const token = sessionStorage.getItem('token');
        const API_URL = import.meta.env.VITE_API_URL;
        await axios.post(
          `${API_URL}/channels/${channelId}/leave`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          },
        );
      }

      // 채널 목록 페이지로 이동
      navigate('/voice-channel');
    } catch (error) {
      console.error('채널 퇴장 실패:', error);
      // 오류가 발생해도 페이지 이동
      navigate('/voice-channel');
    }
  };

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

      <div className="flex flex-1 overflow-hidden p-4 gap-4">
        <ChatBox
          messages={messages}
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          handleSendMessage={handleSendMessage}
          handleKeyDown={handleKeyDown}
          chatContainerRef={chatContainerRef}
          currentUserId={currentUser?.id || 'guest'}
          channelId={channelId}
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
  );
}

export default VoiceChannelVideo;
