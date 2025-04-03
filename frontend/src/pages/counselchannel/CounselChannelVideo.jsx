import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import VideoLayout from '../../components/video/VideoLayout';
import ChatBox from '../../components/video/ChatBox';
import VideoControls from '../../components/video/VideoControls';
import useOpenVidu from '../../hooks/useOpenvidu';
import useParticipantControls from '../../hooks/useParticipantControls';
import useChat from '../../hooks/useChat';
import axios from 'axios';
import counselorChannel from '../../api/counselorChannel';
import counselWebSocketService from '../../services/counselwebsocketService';

function CounselChannelVideo() {
  // URL에서 파라미터 가져오기 (counselor_code)
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
    maxParticipants: 4,
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
    console.log('토큰 존재 여부:', !!token);

    // 사용자 정보의 role이 ROLE_COUNSELOR이거나 userRole이 COUNSELOR인 경우
    const isCounselor =
      (userObj && userObj.role === 'ROLE_COUNSELOR') ||
      userRole === 'COUNSELOR' ||
      userRole === 'ROLE_COUNSELOR';

    console.log('상담사 여부:', isCounselor);

    return isCounselor;
  };

  // 웹소켓 상태 확인 함수
  const logWebSocketStatus = () => {
    console.log('===== 웹소켓 연결 상태 =====');
    console.log('URL:', counselWebSocketService.socketURL);
    console.log('연결 여부:', counselWebSocketService.isConnected);
    if (counselWebSocketService.stompClient) {
      console.log('세션 ID:', counselWebSocketService.stompClient.sessionId);
    } else {
      console.log('스톰프 클라이언트가 없음');
    }
    const subscriptions = Array.from(
      counselWebSocketService.subscriptions.keys(),
    );
    console.log('구독 목록:', subscriptions.length ? subscriptions : '없음');
    console.log('===========================');
  };

  // 디버깅 정보 출력을 위한 useEffect
  useEffect(() => {
    console.log('===== CounselChannelVideo 마운트 =====');
    console.log('상담사 코드:', counselorCode);
    console.log('API URL:', import.meta.env.VITE_API_URL);
    console.log('웹소켓 URL:', `${import.meta.env.VITE_API_URL}/ws`);

    // 웹소켓 상태 로깅
    logWebSocketStatus();

    // 5초 후 웹소켓 상태 다시 확인 (비동기 연결 완료 확인)
    const checkTimeout = setTimeout(() => {
      console.log('===== 5초 후 웹소켓 상태 =====');
      logWebSocketStatus();
    }, 5000);

    return () => {
      clearTimeout(checkTimeout);
      console.log('===== CounselChannelVideo 언마운트 =====');
    };
  }, [counselorCode]);

  // 방 정보 가져오기
  useEffect(() => {
    const fetchChannelInfo = async () => {
      try {
        setIsLoading(true);
        console.log('방 정보 가져오기 시작');

        // 상담사 권한 확인
        const isCounselor = checkIsCounselor();
        setIsHost(isCounselor);
        console.log('isHost 설정됨:', isCounselor);

        // 세션 스토리지에서 먼저 확인
        const storedChannelInfo = sessionStorage.getItem('currentChannel');

        if (storedChannelInfo) {
          const channelData = JSON.parse(storedChannelInfo);
          console.log('세션 스토리지에서 가져온 채널 정보:', channelData);

          // 저장된 counselorCode와 URL 파라미터가 다르면 업데이트
          if (channelData.counselorCode?.toString() !== counselorCode) {
            console.log(
              '저장된 counselorCode와 URL 파라미터 불일치, 업데이트함',
              `저장된 코드: ${channelData.counselorCode}, URL 코드: ${counselorCode}`,
            );
            channelData.counselorCode = counselorCode;
            sessionStorage.setItem(
              'currentChannel',
              JSON.stringify(channelData),
            );
          }

          setRoomInfo({
            name: channelData.channelName || '상담방',
            maxParticipants: channelData.maxPlayer || 4,
            description: channelData.description || '',
          });

          // 채널 상태 확인 및 세션 시작 여부 설정
          if (channelData.status === 'ACTIVE' || channelData.isActive) {
            console.log('채널 상태: 활성화됨');
            setIsSessionStarted(true);
          } else {
            console.log('채널 상태: 비활성화됨');
          }

          setIsLoading(false);
          return;
        }

        // 세션 스토리지에 없으면 API 호출
        console.log('세션 스토리지에 채널 정보 없음, API 호출');
        const token = sessionStorage.getItem('token');
        const API_URL = import.meta.env.VITE_API_URL;
        console.log(
          'API 호출 URL:',
          `${API_URL}/channels/counseling/${counselorCode}`,
        );

        try {
          // 기존 엔드포인트 사용
          const response = await axios.get(
            `${API_URL}/channels/counseling/${counselorCode}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          );

          console.log('API 응답 데이터:', response.data);

          if (response.data) {
            // counselorCode 설정
            response.data.counselorCode = counselorCode;

            // 세션 스토리지에 저장
            sessionStorage.setItem(
              'currentChannel',
              JSON.stringify(response.data),
            );

            setRoomInfo({
              name: response.data.channelName || '상담방',
              maxParticipants: response.data.maxPlayer || 4,
              description: response.data.description || '',
            });

            // 채널 상태 확인 및 세션 시작 여부 설정
            if (response.data.status === 'ACTIVE' || response.data.isActive) {
              console.log('API 응답 - 채널 상태: 활성화됨');
              setIsSessionStarted(true);
            } else {
              console.log('API 응답 - 채널 상태: 비활성화됨');
            }
          }
        } catch (error) {
          console.error('API로 채널 정보 가져오기 실패:', error);
          console.log('에러 상세:', {
            status: error.response?.status,
            message: error.response?.data?.message || error.message,
          });

          // API 호출 실패 시 기본 정보 설정 및 저장
          console.log('기본 채널 정보 사용');
          const defaultChannelInfo = {
            counselorCode: counselorCode,
            channelName: '상담방',
            maxPlayer: 4,
            description: '',
            status: 'INACTIVE',
            isActive: false,
          };

          sessionStorage.setItem(
            'currentChannel',
            JSON.stringify(defaultChannelInfo),
          );
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
  } = useOpenVidu(counselorCode, 'randomNickname', isMicOn, isCameraOn);

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

  // CounselChannelVideo.jsx의 웹소켓 연결 및 입장 요청 처리 부분

  // useEffect 내부에서 웹소켓 연결 및 콜백 함수 설정
  // CounselChannelVideo.jsx의 웹소켓 연결 및 입장 요청 처리 부분

  // useEffect 내부에서 웹소켓 연결 및 콜백 함수 설정
  useEffect(() => {
    if (!hasJoined.current && !isLoading) {
      console.log('OpenVidu 세션 참여, counselor_code:', counselorCode);

      // 웹소켓 연결 확인
      console.log('세션 참여 전 웹소켓 상태:');
      logWebSocketStatus();

      // 웹소켓이 연결되어 있지 않으면 연결 시도
      if (!counselWebSocketService.isConnected) {
        console.log('웹소켓 연결이 없어 새로 연결 시도');

        // 콜백 함수 정의 - 상담사 모드에서 특별히 처리
        const handleAccessCallback = message => {
          // 모든 웹소켓 메시지 로깅
          console.log('[웹소켓] 메시지 수신:', message);

          // 입장 요청/응답 메시지 출력
          if (message.event === 'join_con') {
            if (message.role === 'USER_ROLE') {
              console.log(
                '유저 입장 REQUEST (/pub/' + counselorCode + '/access):',
                {
                  event: message.event,
                  name: message.name,
                  생년월일: message.생년월일,
                  user: message.user,
                  channel: message.channel,
                  role: message.role,
                },
              );
            } else if (message.role === 'COUNSEL_ROLE') {
              console.log('상담사 RESPONSE:', {
                event: message.event,
                name: message.name,
                생년월일: message.생년월일,
                user: message.user,
                channel: message.channel,
                role: message.role,
              });
            }
          }

          // 상담사인 경우에만 입장 요청을 처리
          if (isHost) {
            // role이 USER_ROLE인 경우 (일반 사용자의 입장 요청)
            if (message.role === 'USER_ROLE' && message.event === 'join_con') {
              console.log('===== 새로운 입장 요청 =====');
              console.log('요청자 이름:', message.name);
              console.log('요청자 생년월일:', message.생년월일);
              console.log('요청자 ID:', message.user);
              console.log('채널:', message.channel);
              console.log('역할:', message.role);
              console.log('===========================');

              // 입장 요청에 대한 알림창 표시
              const confirmJoin = window.confirm(
                `${message.name}님(${message.생년월일})이 입장을 요청했습니다. 수락하시겠습니까?`,
              );

              if (confirmJoin) {
                // 입장 요청 수락
                console.log('입장 요청 수락:', message.user);

                // 상담사 응답 메시지 송신
                counselWebSocketService.sendCounselorResponse(counselorCode, {
                  name: message.name,
                  생년월일: message.생년월일,
                  user: message.user,
                });

                // 이후 수락 메시지 전송
                counselWebSocketService.sendAcceptRequest(
                  counselorCode,
                  message.user,
                );
              } else {
                // 입장 요청 거절
                console.log('입장 요청 거절:', message.user);
                counselWebSocketService.sendDeclineRequest(
                  counselorCode,
                  message.user,
                );
              }
            }
            // 사용자가 입장 요청을 취소한 경우
            else if (message.event === 'cancel_con') {
              console.log(
                `[웹소켓] ${message.name || '사용자'}가 입장 요청을 취소했습니다.`,
              );
            }
          } else {
            // 일반 사용자인 경우
            if (message.event === 'accept_con') {
              // 상담사가 요청을 수락한 경우
              console.log('[웹소켓] 상담사가 입장 요청을 수락했습니다.');
              alert('상담사가 입장 요청을 수락했습니다.');
              // 이 부분에서 추가 처리가 필요하다면 구현
            } else if (message.event === 'decline_con') {
              // 상담사가 요청을 거절한 경우
              console.log('[웹소켓] 상담사가 입장 요청을 거절했습니다.');
              alert(
                '상담사가 입장 요청을 거절했습니다. 상담 목록으로 돌아갑니다.',
              );
              navigate('/counsel-channel');
            }
          }
        };

        counselWebSocketService.connect(counselorCode, handleAccessCallback);
      }

      hasJoined.current = true;
      joinSession();
    }

    return () => {
      console.log('세션 종료 시작');
      leaveSession();
    };
  }, [isLoading, joinSession, leaveSession, counselorCode, isHost, navigate]);

  // 참가자 제어 초기화
  useEffect(() => {
    if (participants && participants.length > 0) {
      console.log('참가자 목록:', participants);
      initParticipantControls(participants);
    }
  }, [participants, initParticipantControls]);

  // isHost 값이 변경될 때마다 콘솔에 출력
  useEffect(() => {
    console.log('현재 isHost 값:', isHost);
  }, [isHost]);

  // 토글 함수
  const toggleMic = () => {
    console.log('마이크 토글:', !isMicOn);
    setIsMicOn(!isMicOn);
    toggleAudio(!isMicOn);
  };

  const toggleCamera = () => {
    console.log('카메라 토글:', !isCameraOn);
    setIsCameraOn(!isCameraOn);
    toggleVideo(!isCameraOn);
  };

  const toggleVoiceTranslation = () => {
    console.log('음성 번역 토글:', !isVoiceTranslationOn);
    setIsVoiceTranslationOn(!isVoiceTranslationOn);
  };

  const toggleSignLanguage = () => {
    console.log('수화 토글:', !isSignLanguageOn);
    setIsSignLanguageOn(!isSignLanguageOn);
  };

  // 상담 세션 시작 처리
  const handleStartSession = async () => {
    try {
      console.log('상담 세션 시작 요청:', counselorCode);

      // 채널 상태 업데이트 API 호출 (counselor_code 사용)
      const result = await counselorChannel.updateChannelStatus(
        counselorCode,
        true,
      );
      console.log('상담 세션 시작 응답:', result);

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
      console.log('상담 세션 종료 요청:', counselorCode);

      // 채널 상태 업데이트 API 호출 (counselor_code 사용)
      const result = await counselorChannel.updateChannelStatus(
        counselorCode,
        false,
      );
      console.log('상담 세션 종료 응답:', result);

      // 상태 업데이트
      setIsSessionStarted(false);

      // 알림 표시
      alert('상담이 종료되었습니다.');
    } catch (error) {
      console.error('상담 세션 종료 실패:', error);
      alert('상담 세션을 종료하는데 실패했습니다.');
    }
  };

  // 방 나가기 처리 함수
  const handleLeaveChannel = async () => {
    try {
      console.log('방 나가기 처리 시작, 상담사 여부:', isHost);

      // 웹소켓 상태 로깅
      logWebSocketStatus();

      // OpenVidu 세션 종료
      leaveSession();
      console.log('OpenVidu 세션 종료됨');

      // 상담사인 경우 방 종료 API 호출
      if (isHost) {
        console.log('상담사 방 종료 API 호출:', counselorCode);
        // counselor_code 사용
        const result =
          await counselorChannel.leaveCounselorChannel(counselorCode);
        console.log('상담방 종료 완료 (상담사):', result);
      } else {
        // 일반 사용자인 경우
        console.log('내담자 방 나가기 API 호출:', counselorCode);
        const result = await counselorChannel.leaveChannel(counselorCode);
        console.log('상담방 나가기 완료 (내담자):', result);
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
        <div className="text-sm text-gray-500">
          최대 인원: {roomInfo.maxParticipants}명
        </div>
      </div>

      {/* 상담사 상태 표시 */}
      <div className="mx-4 mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between text-sm">
        <div className="flex items-center text-blue-600">
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
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          {isHost ? '상담사 모드' : '내담자 모드'}
        </div>
      </div>

      {/* 상담 코드 표시 (개발용, 실제 배포시 제거) */}
      <div className="mx-4 mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center justify-between text-sm">
        <div className="flex items-center text-yellow-600">
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
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          사용 중인 상담사 코드: {counselorCode}
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
            renderParticipantInfo={participant => (
              <>
                <div className="absolute bottom-2 left-2 bg-black bg-opacity-30 text-white px-2 py-1 rounded text-xs">
                  {participant.name}
                  {participant.isSelf && ' (나)'}
                </div>
              </>
            )}
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
