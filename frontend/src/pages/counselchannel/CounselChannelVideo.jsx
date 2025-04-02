import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import VideoLayout from '../../components/video/VideoLayout';
import ChatBox from '../../components/video/ChatBox';
// import VideoControls from '../../components/video/VideoControls';
import VideoControls from '../counsel/components/VideoControls';
import useOpenVidu from '../../hooks/useOpenvidu';
import useParticipantControls from '../../hooks/useParticipantControls';
import useChat from '../../hooks/useChat';
import axios from 'axios';
import counselorChannel from '../../api/counselorChannel';

function CounselChannelVideo() {
  const { counselorCode } = useParams();
  console.log('URL 파라미터 (counselor_code):', counselorCode);

  // 상태 관리
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [currentUserId] = useState('user1');
  const [isHost, setIsHost] = useState(false);
  const [isVoiceTranslationOn, setIsVoiceTranslationOn] = useState(false);
  const [isSignLanguageOn, setIsSignLanguageOn] = useState(false);
  const [isSessionStarted, setIsSessionStarted] = useState(false); // 상담 세션 시작 여부
  const [roomInfo, setRoomInfo] = useState({
    name: '상담방',
    maxParticipants: 1,
    description: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // 초기화 여부 추적
  const hasJoined = useRef(false);

  // 상담사 권한 확인 함수
  const checkIsCounselor = () => {
    // 세션 스토리지에서 정보 가져오기
    const userObj = JSON.parse(sessionStorage.getItem('user') || '{}');
    const userRole = sessionStorage.getItem('userRole');
    const token = sessionStorage.getItem('token');

    // 디버깅 출력
    console.log('사용자 정보:', userObj);
    console.log('사용자 역할:', userRole);

    // 사용자 정보의 role이 ROLE_COUNSELOR이거나 userRole이 COUNSELOR인 경우
    const isCounselor =
      (userObj && userObj.role === 'ROLE_COUNSELOR') ||
      userRole === 'COUNSELOR' ||
      userRole === 'ROLE_COUNSELOR';

    console.log('상담사 여부:', isCounselor);

    return isCounselor;
  };

  // roomInfo 상태가 변경될 때마다 로그 출력
  useEffect(() => {
    console.log('현재 roomInfo 상태:', roomInfo);
  }, [roomInfo]);

  // 방 정보 가져오기
  useEffect(() => {
    const fetchChannelInfo = async () => {
      try {
        setIsLoading(true);

        // 상담사 권한 확인
        const isCounselor = checkIsCounselor();
        setIsHost(isCounselor);

        console.log('isHost 설정됨:', isCounselor);

        // 세션 스토리지에서 먼저 확인
        const storedChannelInfo = sessionStorage.getItem('currentChannel');

        if (storedChannelInfo) {
          const channelData = JSON.parse(storedChannelInfo);
          console.log('세션 스토리지에서 가져온 채널 데이터:', channelData);

          // 저장된 counselorCode와 URL 파라미터가 다르면 업데이트
          if (channelData.counselorCode?.toString() !== counselorCode) {
            console.log(
              '저장된 counselorCode와 URL 파라미터 불일치, 업데이트함',
            );
            channelData.counselorCode = counselorCode;
            channelData.channelId = counselorCode;
            sessionStorage.setItem(
              'currentChannel',
              JSON.stringify(channelData),
            );
          }

          const roomInfoData = {
            name: channelData.channelName || '상담방',
            maxParticipants: channelData.maxPlayer || 1,
            description: channelData.description || '',
          };

          console.log('roomInfo로 설정할 데이터:', roomInfoData);
          setRoomInfo(roomInfoData);

          // 채널 상태 확인 및 세션 시작 여부 설정
          if (channelData.status === 'ACTIVE' || channelData.isActive) {
            setIsSessionStarted(true);
          }

          setIsLoading(false);
          return;
        }

        // 세션 스토리지에 없으면 API 호출
        const token = sessionStorage.getItem('token');
        try {
          // 상대 경로 사용하도록 수정
          console.log('API 호출 시작: /channels/counseling/' + counselorCode);
          const response = await axios.get(
            `/channels/counseling/${counselorCode}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          );

          console.log('API 응답 전체:', response);

          if (response.data) {
            console.log('API에서 가져온 원본 데이터:', response.data);

            // counselorCode와 channelId 설정
            response.data.counselorCode = counselorCode;
            response.data.channelId = counselorCode;

            // 세션 스토리지에 저장
            sessionStorage.setItem(
              'currentChannel',
              JSON.stringify(response.data),
            );
            console.log('세션 스토리지에 저장된 데이터:', response.data);

            // 방 정보 상태 업데이트
            const roomInfoData = {
              name: response.data.channelName || '상담방',
              maxParticipants: response.data.maxPlayer || 1,
              description: response.data.description || '',
            };
            console.log('roomInfo로 설정할 데이터:', roomInfoData);
            setRoomInfo(roomInfoData);

            // 채널 상태 확인 및 세션 시작 여부 설정
            if (response.data.status === 'ACTIVE' || response.data.isActive) {
              setIsSessionStarted(true);
            }
          }
        } catch (error) {
          console.error('API로 채널 정보 가져오기 실패:', error);
          console.error('오류 세부 정보:', {
            response: error.response,
            message: error.message,
          });

          // API 호출 실패 시 기본 정보 설정 및 저장
          const defaultChannelInfo = {
            counselorCode: counselorCode,
            channelId: counselorCode,
            channelName: '상담방',
            maxPlayer: 1,
            description: '',
            status: 'INACTIVE',
            isActive: false,
          };

          console.log('API 실패로 기본값 사용:', defaultChannelInfo);

          sessionStorage.setItem(
            'currentChannel',
            JSON.stringify(defaultChannelInfo),
          );

          // 기본 방 정보로 상태 업데이트
          setRoomInfo({
            name: defaultChannelInfo.channelName,
            maxParticipants: defaultChannelInfo.maxPlayer,
            description: defaultChannelInfo.description,
          });
        }
      } catch (error) {
        console.error('방 정보 가져오기 실패:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChannelInfo();
  }, [counselorCode]);

  // 커스텀 훅 사용
  const {
    participants,
    connectionError,
    joinSession,
    leaveSession,
    toggleAudio,
    toggleVideo,
  } = useOpenVidu(
    counselorCode, // counselor_code를 OpenVidu 세션 이름으로 사용
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
      console.log('OpenVidu 세션 참여, counselor_code:', counselorCode);
      hasJoined.current = true;
      joinSession();
    }

    return () => {
      leaveSession();
    };
  }, [isLoading, joinSession, leaveSession]);

  // 참가자 제어 초기화
  useEffect(() => {
    if (participants && participants.length > 0) {
      initParticipantControls(participants);
    }
  }, [participants, initParticipantControls]);

  // isHost 값이 변경될 때마다 콘솔에 출력
  useEffect(() => {
    console.log('현재 isHost 값:', isHost);
  }, [isHost]);

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

  // 상담 세션 시작 처리
  const handleStartSession = async () => {
    try {
      // 채널 상태 업데이트 API 호출 (counselor_code 사용)
      await counselorChannel.updateChannelStatus(counselorCode, true);

      // 상태 업데이트
      setIsSessionStarted(true);

      // 알림 표시
      alert('상담이 시작되었습니다.');
    } catch (error) {
      console.error('상담 세션 시작 실패:', error);
      alert('상담 세션을 시작하는데 실패했습니다.');
    }
  };

  // 상담 세션 종료 처리 함수 수정
  const handleEndSession = async () => {
    try {
      // 채널 상태 업데이트 API 호출 (counselor_code 사용)
      await counselorChannel.updateChannelStatus(counselorCode, false);

      // 상태 업데이트
      setIsSessionStarted(false);

      // 알림 표시
      alert('상담이 종료되었습니다.');
    } catch (error) {
      console.error('상담 세션 종료 실패:', error);
      alert('상담 세션을 종료하는데 실패했습니다.');
    }
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

  // 방 나가기 처리 함수
  const handleLeaveChannel = async () => {
    try {
      // OpenVidu 세션 종료
      leaveSession();

      // 상담사인 경우 방 종료 API 호출
      if (isHost) {
        // counselor_code 사용
        await counselorChannel.leaveCounselorChannel(counselorCode);
        console.log('상담방 종료 완료 (상담사)');
      } else {
        // 일반 사용자인 경우
        await counselorChannel.leaveChannel(counselorCode);
        console.log('상담방 나가기 완료 (내담자)');
      }

      // 리스트 페이지로 이동
      navigate('/counsel-channel');
    } catch (error) {
      console.error('방 나가기 오류:', error);
      // 오류가 발생해도 리스트 페이지로 이동
      navigate('/counsel-channel');
    }
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
      </div>

      {/* 상담 상태 표시 */}
      {isSessionStarted && (
        <div className="mx-4 mt-2 p-2 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between text-sm">
          <div className="flex items-center text-green-600">
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
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            상담이 진행 중입니다
          </div>
        </div>
      )}

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
        leaveSession={leaveSession}
        isVoiceTranslationOn={isVoiceTranslationOn}
        isSignLanguageOn={isSignLanguageOn}
        toggleVoiceTranslation={toggleVoiceTranslation}
        toggleSignLanguage={toggleSignLanguage}
        onLeaveChannel={handleLeaveChannel}
        onStartSession={handleStartSession}
        onEndSession={handleEndSession}
        isHost={isHost}
        isSessionStarted={isSessionStarted}
      />
    </div>
  );
}

export default CounselChannelVideo;
