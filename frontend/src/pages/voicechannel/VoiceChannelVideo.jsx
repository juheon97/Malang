import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import ChatBox from '../../components/video/ChatBox';
import VideoControls from '../../components/video/VideoControls';
import useOpenVidu from '../../hooks/useOpenvidu';
import useChat from '../../hooks/useChat';
import { useAuth } from '../../contexts/AuthContext';
import websocketService from '../../services/websocketService';
import VideoLayout from '../../components/video/VideoLayout';

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
  const [isWebSocketConnected, setIsWebSocketConnected] = useState(false);
  const hasJoined = useRef(false);
  const {state} = useLocation();
  const creatorNickname = state?.sessionConfig?.creatorNickname;
const isCreator = currentUser?.username === creatorNickname;
  // Destructure with all the available properties returned by useOpenVidu
  const {  
    createAndJoinSession, 
    joinExistingSession,  
    leaveSession, 
    toggleAudio, 
    toggleVideo, 
    error, 
    isConnecting, 
    isConnected: isOpenViduConnected,  
    participants, 
    renderParticipantInfo
  } = useOpenVidu(
    channelId,
    currentUser?.username || 'Guest'
  );

  const { messages, newMessage, setNewMessage, handleKeyDown, addMessage } =
    useChat(currentUser?.id || 'guest');

  // Update connectionError from OpenVidu's error
  useEffect(() => {
    if (error) {
      setConnectionError(error);
    }
  }, [error]);

  // WebSocket handlers
  const handleChatMessage = message => {
    try {
      const data = JSON.parse(message.body);
      console.log('📩 채팅 메시지 수신:', data);
      if (data.event === 'message') {
        // 본인 메시지는 echo로 추가되지 않도록 필터링
        if (Number(data.userId) === Number(currentUser?.id)) return;
        addMessage(
          data.content,
          data.nickname || 'Unknown',
          data.userId || null,
        );
      }
    } catch (e) {
      console.error('❗ 메시지 파싱 오류:', e);
    }
  };

  const handleChannelEvent = message => {
    try {
      const data = JSON.parse(message.body);
      console.log('📩 채널 이벤트 수신:', data);
      if (data.event === 'message') {
        // 본인 메시지인 경우 추가하지 않음
        if (Number(data.userId) === Number(currentUser?.id)) return;
        addMessage(
          data.content,
          data.nickname || 'Unknown',
          data.userId || null,
        );
      }
    } catch (e) {
      console.error('❗ 채널 이벤트 파싱 오류:', e);
    }
  };

  useEffect(() => {
    const connectWebSocket = () => {
      const token = sessionStorage.getItem('token');
      if (!token || !isAuthenticated || !channelId) return;

      websocketService.connect(
        channelId,
        handleChatMessage,
        handleChannelEvent,
      );

      const checkConnection = setInterval(() => {
        if (websocketService.isConnected) {
          setIsWebSocketConnected(true);
          clearInterval(checkConnection);
          websocketService.sendJoinEvent(channelId, currentUser?.id);
          console.log('📢 채팅방 입장 알림 전송 완료');
        }
      }, 500);
    };

    if (!hasJoined.current && isAuthenticated && channelId) {
      hasJoined.current = true;
      connectWebSocket();
      if (isCreator){
        console.log('video.jsx에서 방장모드로 고고')
        createAndJoinSession(channelId)
        
      }else{
        console.log('video.jsx에서 참여자모드로')
        joinExistingSession();
      }

      // Initialize video session
      // const isHost = sessionStorage.getItem('isChannelHost') === 'true';
      // console.log('세션 시작:', isHost ? '방장' : '참여자', 'mode');
      
      // if (isHost) {
      //   createAndJoinSession(channelId).then(success => {
      //     if (!success) {
      //       setConnectionError('비디오 세션 생성에 실패했습니다.');
      //     }
      //   });
      // } else {
      //   joinExistingSession().then(success => {
      //     if (!success) {
      //       setConnectionError('비디오 세션 참여에 실패했습니다.');
      //     }
      //   });
      // }
    }

    // if (isAuthenticated && channelId && !window.__SESSION_INITIALIZED__) {
    //   window.__SESSION_INITIALIZED__ = true;
      
    //   if (isCreator) {
    //     console.log('방장 모드로 세션 생성');
    //     createAndJoinSession(channelId);
    //   } else {
    //     console.log('참가자 모드로 세션 참여');
    //     joinExistingSession();
    //   }
    // }

    return () => {
      if (hasJoined.current) {
        websocketService.sendLeaveEvent(channelId, currentUser?.id);
        websocketService.disconnect();
        setIsWebSocketConnected(false);
        leaveSession();
        hasJoined.current = false;
      }
    };
  }, [isAuthenticated, channelId, isCreator]);

  const handleSendMessage = e => {
    e.preventDefault();
    if (newMessage.trim() === '' || !websocketService.isConnected) return;

    const messagePayload = {
      event: 'send',
      content: newMessage,
      userId: currentUser?.id,
      nickname: currentUser?.username
    };

    console.log('📤 백엔드로 전송될 메시지:', messagePayload);

    websocketService.sendChatMessage(channelId, messagePayload);

    addMessage(
      newMessage,
      currentUser?.username || 'Me',
      currentUser?.id || 'guest',
    );
    setNewMessage('');
  };

  const toggleMic = () => {
    setIsMicOn(!isMicOn);
    toggleAudio();
  };

  const toggleCamera = () => {
    setIsCameraOn(!isCameraOn);
    toggleVideo();
  };

  const toggleVoiceTranslation = () => {
    setIsVoiceTranslationOn(!isVoiceTranslationOn);
  };

  const toggleSignLanguage = () => {
    setIsSignLanguageOn(!isSignLanguageOn);
  };

  // For debugging
  useEffect(() => {
    console.log('Current participants:', participants);
  }, [participants]);

  // 채널 정보 로딩
  useEffect(() => {
    // 채널 정보 조회 로직
    const fetchChannelInfo = async () => {
      try {
        setChannelInfo({
          channelName: state?.sessionConfig?.channelName || `음성 채널 ${channelId}`
        });
      } catch (error) {
        console.error('채널 정보 조회 실패:', error);
      }
    };
    
    if (channelId) {
      fetchChannelInfo();
    }
  }, [channelId, state]);

  return (
    <div
      className="flex flex-col h-full bg-[#f5fdf5]"
      style={{ minHeight: 'calc(100vh - 75px)' }}
    >
      <div className="flex items-center justify-between p-4 rounded-lg bg-white m-4 mb-0 shadow-sm">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-[#00a173] flex items-center justify-center text-white mr-3" />
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
            {connectionError}
          </div>
          <button
            onClick={() => {
              // 방장 여부에 따라 적절한 함수 호출
              const isHost = sessionStorage.getItem('isChannelHost') === 'true';
              console.log(sessionStorage.data)
              setConnectionError('');
              if (isHost) {
                createAndJoinSession(channelId);
              } else {
                joinExistingSession();
              }
            }}
            className="bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700"
          >
            {isConnecting ? '연결 중...' : '재연결'}
          </button>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden p-4 gap-4">
        {/* 메인 컨텐츠 - 영상과 채팅 */}
        {/* 영상 영역 */}
        <div className="flex-1 bg-white rounded-lg shadow-sm overflow-hidden">
          <VideoLayout
            participants={participants}
            renderParticipantInfo={renderParticipantInfo}
          />
        </div>

        <ChatBox
          currentUserId={currentUser?.id}
          channelId={channelId}
          messages={messages}
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          handleSendMessage={handleSendMessage}
          handleKeyDown={handleKeyDown}
          chatContainerRef={null}
          isConnected={isWebSocketConnected}
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
        onLeaveChannel={() => {
          websocketService.sendLeaveEvent(channelId, currentUser?.id);
          websocketService.disconnect();
          setIsWebSocketConnected(false);
          leaveSession();
          navigate('/voice-channel');
        }}
        isConnecting={isConnecting}
        isConnected={isOpenViduConnected}
      />
    </div>
  );
}

export default VoiceChannelVideo;