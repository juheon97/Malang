//src/pages/counselchannel/CounselChannelVideo.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import VideoLayout from '../../components/video/VideoLayout';
import ChatBox from '../../components/video/ChatBox';
import VideoControls from '../../pages/counsel/components/VideoControls';
import useCounselOpenVidu from '../../pages/counsel/hooks/useCounselOpenVidu';
import useChat from '../../hooks/useChat';
import axios from 'axios';
import counselorChannel from '../../api/counselorChannel';
import counselWebSocketService from '../../services/counselwebsocketService';
import SessionStartModal from '../../components/modal/SessionStartModal';
import VoiceComponent from '../../components/voice/VoiceComponent';
import NotificationModal from '../../components/modal/NotificationModal';

function CounselChannelVideo() {
  // URL에서 파라미터 가져오기 (counselor_code)
  const { counselorCode } = useParams();
  console.log('URL 파라미터 (counselor_code):', counselorCode);

  // 상태 관리
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [currentUserId] = useState('user1');
  const [isVoiceTranslationOn, setIsVoiceTranslationOn] = useState(false);
  const [isSignLanguageOn, setIsSignLanguageOn] = useState(false);
  const [isSessionStarted, setIsSessionStarted] = useState(false); // 상담 세션 시작 여부
  const [isChatEnabled, setIsChatEnabled] = useState(false); // 채팅 활성화 상태
  const [showStartModal, setShowStartModal] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const [roomInfo, setRoomInfo] = useState({
    name: '상담방',
    maxParticipants: 4,
    description: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // 상담 요청 알림 관련 상태 추가
  const [showRequestAlert, setShowRequestAlert] = useState(false);
  const [requestUserInfo, setRequestUserInfo] = useState(null);
  const [isPageMoveActive, setIsPageMoveActive] = useState(false);

  // 모달 관련 상태 추가
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [notificationModalContent, setNotificationModalContent] = useState({
    title: '',
    message: '',
    type: 'info',
    buttonText: '확인',
  });
  const [notificationRedirectPath, setNotificationRedirectPath] =
    useState(null);

  // 초기화 여부 추적
  const hasJoined = useRef(false);

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

  // 모달 닫기 함수
  const handleNotificationClose = () => {
    setIsNotificationModalOpen(false);

    // 리다이렉트 경로가 있으면 이동
    if (notificationRedirectPath) {
      navigate(notificationRedirectPath);
      setNotificationRedirectPath(null);
    }
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
    connectionError, // error를 connectionError로 매핑
    createAndJoinSession,
    joinExistingSession,
    leaveSession,
    toggleAudio,
    toggleVideo,
    isConnected,
    isConnecting,
  } = useCounselOpenVidu(counselorCode);

  const handleSendChatMessage = event => {
    event.preventDefault(); // 폼 제출 시 페이지 새로고침 방지
    const messageText = newMessage; // useChat 훅의 상태값 사용
    if (!messageText.trim() || !isChatEnabled) return;
    try {
      const userObj = JSON.parse(sessionStorage.getItem('user') || '{}');
      const userId = userObj.id;
      const userName = userObj.name || userObj.username || '사용자';

      // 사용자 역할을 ROLE_COUNSELOR 또는 ROLE_USER로 보정, 아니라면 null
      const storedRole = sessionStorage.getItem('userRole') || userObj.role;
      let userRole = null;
      if (storedRole === 'ROLE_COUNSELOR' || storedRole === 'counselor') {
        userRole = 'ROLE_COUNSELOR';
      } else if (storedRole === 'ROLE_USER' || storedRole === 'user') {
        userRole = 'ROLE_USER';
      } else {
        userRole = null;
      }

      const success = counselWebSocketService.sendChatMessage(
        counselorCode,
        userId,
        userName,
        messageText,
        userRole,
      );

      if (success) {
        // 사용자 전송 메시지 출력
        addMessage(messageText, userName, userId);
        setNewMessage('');
      } else {
        console.error('[채팅] 메시지 전송 실패');
        addMessage('[채팅] 메시지 전송 실패', '시스템', 'system');
      }
    } catch (error) {
      console.error('[채팅] 메시지 전송 중 오류:', error);
      addMessage(
        '[채팅] 메시지 전송 중 오류: ' + error.message,
        '시스템',
        'system',
      );
    }
  };

  const {
    messages,
    newMessage,
    setNewMessage,
    handleKeyDown,
    chatContainerRef,
    addMessage,
  } = useChat(currentUserId);

  // 요청 수락 처리 (업데이트됨)
  const handleAcceptRequest = () => {
    if (requestUserInfo) {
      console.log(
        `[웹소켓] 입장 요청 수락: 사용자 ${requestUserInfo.userId}, 채널 ${counselorCode}`,
      );

      // 웹소켓으로 수락 메시지 전송
      const success = counselWebSocketService.sendAcceptRequest(
        counselorCode,
        requestUserInfo.userId,
      );

      if (success) {
        console.log('[웹소켓] 수락 메시지가 성공적으로 전송되었습니다.');
      } else {
        console.error('[웹소켓] 수락 메시지 전송 실패');
        alert('요청 수락 처리 중 오류가 발생했습니다. 다시 시도해주세요.');
      }

      setShowRequestAlert(false);
    }
  };

  // 요청 거절 처리 (업데이트됨)
  const handleDeclineRequest = () => {
    if (requestUserInfo) {
      console.log(
        `[웹소켓] 입장 요청 거절: 사용자 ${requestUserInfo.userId}, 채널 ${counselorCode}`,
      );

      // 웹소켓으로 거절 메시지 전송
      const success = counselWebSocketService.sendDeclineRequest(
        counselorCode,
        requestUserInfo.userId,
      );

      if (success) {
        console.log('[웹소켓] 거절 메시지가 성공적으로 전송되었습니다.');
      } else {
        console.error('[웹소켓] 거절 메시지 전송 실패');
        alert('요청 거절 처리 중 오류가 발생했습니다. 다시 시도해주세요.');
      }

      setShowRequestAlert(false);
    }
  };

  useEffect(() => {
    if (!hasJoined.current && !isLoading) {
      console.log('OpenVidu 세션 참여, counselor_code:', counselorCode);

      // 상담사 나가기 처리 함수
      const handleCounselorLeft = message => {
        console.log('[웹소켓] 상담사 나가기 응답 수신:', message);

        // 현재 사용자 역할 확인
        const userRole = sessionStorage.getItem('userRole');
        const user = JSON.parse(sessionStorage.getItem('user') || '{}');
        const isCounselor =
          userRole === 'ROLE_COUNSELOR' ||
          userRole === 'counselor' ||
          user.role === 'ROLE_COUNSELOR' ||
          user.role === 'counselor';

        console.log(
          '[웹소켓] 현재 사용자 역할:',
          userRole,
          '상담사 여부:',
          isCounselor,
        );
        console.log('[웹소켓] 상담사 나가기 후 처리 시작');

        // 일반 사용자인 경우
        if (
          userRole === 'ROLE_USER' ||
          (!isCounselor && userRole !== 'ROLE_COUNSELOR')
        ) {
          console.log(
            '[웹소켓] 일반 사용자로 확인됨, 알림 표시 및 리다이렉트 처리 시작',
          );

          // alert 대신 모달 사용
          setNotificationModalContent({
            title: '상담이 종료되었습니다',
            message: '상담사가 상담을 종료했습니다.',
            type: 'info',
            buttonText: '확인',
          });
          setNotificationRedirectPath('/counsel-channel');
          setIsNotificationModalOpen(true);

          // 웹소켓 연결 종료
          if (counselWebSocketService.isConnected) {
            console.log('[웹소켓] 웹소켓 연결 종료');
            counselWebSocketService.stompClient.deactivate();
          }

          // navigate는 모달 닫을 때 실행됨
        } else {
          console.log('[웹소켓] 상담사로 확인됨, 리다이렉트하지 않음');
        }
      };

      const handleAccessCallback = message => {
        console.log('[웹소켓] 메시지 수신:', message);

        // 이벤트 값을 추출하고 소문자로 변환하여 비교
        const event = message.event ? message.event.trim().toLowerCase() : '';

        // record_sent 이벤트 처리 - 채팅 메시지 표시
        if (event === 'record_sent') {
          console.log('[웹소켓] 채팅 메시지 수신:', message);

          // 현재 로그인한 사용자 정보 가져오기
          const currentUser = JSON.parse(
            sessionStorage.getItem('user') || '{}',
          );
          const currentUserId = currentUser.id;

          // 메시지 발신자 ID와 현재 사용자 ID 비교
          const messageUserId = message.user;

          // 자신이 보낸 메시지가 아닌 경우에만 채팅창에 추가
          if (currentUserId != messageUserId) {
            // 느슨한 비교(!=)를 사용하여 문자열/숫자 형변환 문제 방지
            // 메시지 내용, 발신자 이름, 발신자 ID를 추출하여 채팅창에 표시
            const content = message.content;
            const nickname = message.nickname || '익명';
            const userId = message.user;

            // 메시지를 채팅창에 추가
            addMessage(content, nickname, userId);
          } else {
            console.log(
              '[웹소켓] 자신이 보낸 메시지이므로 채팅창에 추가하지 않음:',
              message,
            );
          }
          return;
        }

        // con_leaved 이벤트 처리
        if (event === 'con_leaved') {
          handleCounselorLeft(message);
          return;
        }

        if (event === 'started') {
          console.log('[웹소켓] 상담 시작 메시지 수신:', message);
          addMessage('상담이 시작되었습니다.', '시스템', 'system');

          // 채팅 활성화 상태 전환
          setIsChatEnabled(true);
          counselWebSocketService.setChatEnabled(true);
          console.log('[웹소켓] 채팅 활성화 상태 설정:', true);

          setShowStartModal(true);
          return;
        }

        if (event === 'end' || event === 'ended') {
          console.log('[웹소켓] 상담 종료 메시지 수신:', message);
          addMessage('상담이 종료되었습니다.', '시스템', 'system');
          setIsSessionStarted(false);
          setIsChatEnabled(false);
          counselWebSocketService.setChatEnabled(false);
          setShowEndModal(true);
          console.log('[웹소켓] 채팅 비활성화 상태:', false);

          return;
        }

        // page_move 이벤트가 들어오면 상담 시작 버튼을 활성화시킵니다.
        if (event === 'page_move') {
          console.log('[웹소켓] page_move 이벤트 감지, 상담 시작 버튼 활성화');
          setIsPageMoveActive(true);
          return;
        }

        // user_leaved 이벤트 처리
        if (event === 'user_leaved') {
          console.log('[웹소켓] user_leaved 이벤트 발견!');
          const userRole = sessionStorage.getItem('userRole');
          const isCounselor =
            userRole === 'ROLE_COUNSELOR' || userRole === 'counselor';
          console.log(
            '[웹소켓] 현재 사용자 역할:',
            userRole,
            ', 상담사 여부:',
            isCounselor,
          );
          if (isCounselor) {
            console.log('[웹소켓] 상담사의 user_leaved 처리 시작');
            setIsPageMoveActive(false);
            if (isSessionStarted) {
              console.log('[웹소켓] 상담 세션 종료 처리 시작');
              setIsSessionStarted(false);
              const channelInfo = JSON.parse(
                sessionStorage.getItem('currentChannel') || '{}',
              );
              channelInfo.status = 'INACTIVE';
              channelInfo.isActive = false;
              sessionStorage.setItem(
                'currentChannel',
                JSON.stringify(channelInfo),
              );
              console.log('[웹소켓] 채널 정보 업데이트 완료:', channelInfo);
            }

            // alert 대신 모달 사용
            setNotificationModalContent({
              title: '알림',
              message: '상담자가 상담방을 떠났습니다.',
              type: 'info',
              buttonText: '확인',
            });
            setIsNotificationModalOpen(true);
            return;
          }
        } else if (event === 'join_con') {
          if (message.role === 'ROLE_USER') {
            console.log(
              '유저 입장 REQUEST (/pub/' + counselorCode + '/access):',
              {
                event: message.event,
                name: message.name,
                birth: message.birth,
                user: message.user,
                channel: message.channel,
                role: message.role,
              },
            );
            const userRole = sessionStorage.getItem('userRole');
            const user = JSON.parse(sessionStorage.getItem('user') || '{}');
            const isCounselor =
              userRole === 'ROLE_COUNSELOR' ||
              userRole === 'counselor' ||
              user.role === 'ROLE_COUNSELOR' ||
              user.role === 'counselor';
            console.log(
              '현재 사용자 역할:',
              userRole,
              '상담사 여부:',
              isCounselor,
            );
            if (isCounselor) {
              setRequestUserInfo({
                name: message.name,
                birth: message.birth,
                userId: message.user,
                channelId: message.channel,
              });
              setShowRequestAlert(true);
            }
          } else if (message.role === 'ROLE_COUNSELOR') {
            console.log('상담사 RESPONSE:', {
              event: message.event,
              name: message.name,
              birth: message.birth,
              user: message.user,
              channel: message.channel,
              role: message.role,
            });
          }
        } else if (event === 'accepted') {
          console.log('[웹소켓] 상담사 수락 메시지 수신:', message);
          alert('입장 요청이 수락되었습니다.');
        } else if (event === 'declined') {
          console.log('[웹소켓] 상담사 거절 메시지 수신:', message);
          alert('입장 요청이 거절되었습니다. 상담 목록으로 돌아갑니다.');
          navigate('/counsel-channel');
        }

        if (event === 'cancel_con') {
          console.log(
            `[웹소켓] ${message.name || '사용자'}가 입장 요청을 취소했습니다.`,
          );
          if (showRequestAlert && requestUserInfo?.userId === message.user) {
            setShowRequestAlert(false);
          }
        } else if (event === 'accept_con') {
          console.log('[웹소켓] 상담사가 입장 요청을 수락했습니다.');
          alert('상담사가 입장 요청을 수락했습니다.');
        } else if (event === 'decline_con') {
          console.log('[웹소켓] 상담사가 입장 요청을 거절했습니다.');
          alert('상담사가 입장 요청을 거절했습니다. 상담 목록으로 돌아갑니다.');
          navigate('/counsel-channel');
        }
      };

      // 우선 웹소켓 연결 수행
      counselWebSocketService.connect(counselorCode, handleAccessCallback);

      // OpenVidu 연결은 웹소켓 연결이 완료된 후에 지연 실행
      const connectTimeout = setTimeout(async () => {
        try {
          // 역할 확인
          const userRole = sessionStorage.getItem('userRole');
          const user = JSON.parse(sessionStorage.getItem('user') || '{}');
          const isCounselor =
            userRole === 'ROLE_COUNSELOR' ||
            userRole === 'counselor' ||
            user.role === 'ROLE_COUNSELOR' ||
            user.role === 'counselor';

          console.log(
            '[세션 참여] 사용자 역할:',
            userRole,
            '상담사 여부:',
            isCounselor,
          );

          // 이전에 연결된 세션 정리
          try {
            leaveSession();
            await new Promise(resolve => setTimeout(resolve, 500)); // 세션 정리가 완료될 시간 확보
          } catch (e) {
            console.log('이전 세션 정리 중 오류:', e);
          }

          // 연결 플래그 설정
          hasJoined.current = true;

          // 역할에 따라 다른 함수 호출
          if (isCounselor) {
            console.log('[세션 참여] 상담사로 세션 생성 및 참여');
            await createAndJoinSession(counselorCode);
          } else {
            console.log('[세션 참여] 일반 사용자로 기존 세션에 참여');
            await joinExistingSession();
          }
        } catch (error) {
          console.error('[OpenVidu] 세션 참여 중 오류:', error);
          hasJoined.current = false;
        }
      }, 2000); // 웹소켓 연결이 완료될 충분한 시간 부여

      return () => {
        clearTimeout(connectTimeout);
        console.log('세션 종료 시작');
        leaveSession();
      };
    }
  }, [
    isLoading,
    leaveSession,
    counselorCode,
    navigate,
    addMessage,
    setIsSessionStarted,
    setIsPageMoveActive,
    isSessionStarted,
    showRequestAlert,
    requestUserInfo,
    setShowRequestAlert,
    setRequestUserInfo,
    createAndJoinSession,
    joinExistingSession,
  ]);

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
  const handleStartSession = () => {
    // 사용자 정보에서 userId 추출 (예: sessionStorage에 저장된 user 객체)
    const userObj = JSON.parse(sessionStorage.getItem('user') || '{}');
    const userId = userObj.id;
    console.log('상담 세션 시작 요청 (웹소켓):', counselorCode, userId);

    // 웹소켓을 통해 상담 시작 요청 메시지 전송
    const success = counselWebSocketService.sendStartRequest(
      counselorCode,
      userId,
    );
    if (success) {
      setIsSessionStarted(true);
      // 채팅 활성화 상태 직접 설정
      setIsChatEnabled(true);
      counselWebSocketService.setChatEnabled(true);
      console.log('채팅 활성화 상태:', true);
    } else {
      console.error('상담 세션 시작 요청 실패');
      alert('상담 세션을 시작하는데 실패했습니다.');
    }
  };

  // 상담 세션 종료 처리 함수 수정
  const handleEndSession = async () => {
    try {
      console.log('상담 세션 종료 요청:', counselorCode);

      // 사용자 정보에서 userId 추출
      const userObj = JSON.parse(sessionStorage.getItem('user') || '{}');
      const userId = userObj.id;

      // 웹소켓을 통해 상담 종료 요청 메시지 전송 (백엔드 명세에 따라 전송)
      const success = counselWebSocketService.sendEndRequest(
        counselorCode,
        userId,
      );

      if (success) {
        console.log('상담 종료 요청이 성공적으로 전송되었습니다.');

        // HTTP API 호출 대신 웹소켓만 사용하여 처리
        // 웹소켓 응답에 따라 상태 업데이트
        setIsSessionStarted(false);

        // 현재 채널 정보 업데이트 (세션 스토리지)
        const channelInfo = JSON.parse(
          sessionStorage.getItem('currentChannel') || '{}',
        );
        channelInfo.status = 'INACTIVE';
        channelInfo.isActive = false;
        sessionStorage.setItem('currentChannel', JSON.stringify(channelInfo));
      } else {
        console.error('상담 종료 요청 전송 실패');
        alert('상담 세션을 종료하는데 실패했습니다.');
      }
    } catch (error) {
      console.error('상담 세션 종료 처리 중 오류:', error);
      alert('상담 세션을 종료하는데 실패했습니다.');
    }
  };

  // 방 나가기 처리 함수
  const handleLeaveChannel = async () => {
    try {
      console.log('방 나가기 처리 시작');

      // 현재 사용자 역할 확인
      const userRole = sessionStorage.getItem('userRole');
      const userObj = JSON.parse(sessionStorage.getItem('user') || '{}');
      const userId = userObj.id;

      // OpenVidu 세션 종료 - 모든 경우에 공통으로 처리
      leaveSession();
      console.log('OpenVidu 세션 종료됨');

      // 상담사인 경우
      if (userRole === 'ROLE_COUNSELOR' || userRole === 'counselor') {
        console.log('상담사로서 방 나가기 처리');

        // API 요청 추가: /counselor/profile/0으로 PUT 요청
        const API_BASE_URL = import.meta.env.VITE_API_URL;
        const token = sessionStorage.getItem('token');

        try {
          // PUT 요청 보내기
          await axios.put(
            `${API_BASE_URL}/counselor/profile/0`,
            {}, // 빈 객체 전송 (필요하다면 여기에 데이터 추가)
            {
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
            },
          );
          console.log('/counselor/profile/0 PUT 요청 성공');
        } catch (apiError) {
          console.error('/counselor/profile/0 PUT 요청 실패:', apiError);
        }

        // 기존 웹소켓 코드 유지
        const success = counselWebSocketService.sendCounselorLeaveRequest(
          counselorCode,
          userId,
        );

        if (success) {
          console.log('상담사 나가기 요청이 성공적으로 전송되었습니다.');

          // 웹소켓 연결 종료
          if (counselWebSocketService.isConnected) {
            counselWebSocketService.stompClient.deactivate();
          }

          // 리스트 페이지로 이동
          navigate('/counsel-channel');
        } else {
          console.error('상담사 나가기 요청 전송 실패');
          alert('상담방 나가기에 실패했습니다.');
        }
      } else {
        // 일반 사용자 처리
        console.log('일반 사용자로서 방 나가기 처리');

        // 웹소켓으로 사용자 나가기 이벤트 전송
        const success = counselWebSocketService.sendUserLeaveRequest(
          counselorCode,
          userId,
        );

        if (success) {
          console.log('사용자 나가기 요청이 성공적으로 전송되었습니다.');

          // 웹소켓 연결 종료
          if (counselWebSocketService.isConnected) {
            counselWebSocketService.stompClient.deactivate();
          }

          // 리스트 페이지로 이동
          navigate('/counsel-channel');
        } else {
          console.error('사용자 나가기 요청 전송 실패');
          // 실패해도 리스트 페이지로 이동
          navigate('/counsel-channel');
        }
      }
    } catch (error) {
      console.error('방 나가기 오류:', error);
      // 오류가 발생해도 리스트 페이지로 이동
      navigate('/counsel-channel');
    }
  };

  const handleTranslationResult = text => {
    console.log('수화 번역 결과:', text);

    if (text && text.trim() && counselWebSocketService.isConnected) {
      // 웹소켓으로 메시지 전송
      const userObj = JSON.parse(sessionStorage.getItem('user') || '{}');
      const userId = userObj.id;
      const userName = userObj.name || userObj.username || '사용자';

      const success = counselWebSocketService.sendChatMessage(
        counselorCode,
        userId,
        userName,
        `[수화 번역] ${text}`,
        userObj.role,
      );

      if (success) {
        addMessage(`[수화 번역] ${text}`, userName, userId);
      }
    }
  };

  const handleVoiceTranscriptionResult = text => {
    console.log('음성 번역 결과:', text);

    if (text && text.trim() && counselWebSocketService.isConnected) {
      // 웹소켓으로 메시지 전송
      const userObj = JSON.parse(sessionStorage.getItem('user') || '{}');
      const userId = userObj.id;
      const userName = userObj.name || userObj.username || '사용자';

      const success = counselWebSocketService.sendChatMessage(
        counselorCode,
        userId,
        userName,
        `[음성 번역] ${text}`,
        userObj.role,
      );

      if (success) {
        addMessage(`[음성 번역] ${text}`, userName, userId);
      }
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

      {/* 상담 코드 표시 */}
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
            onClick={() => {
              const userRole = sessionStorage.getItem('userRole');
              const user = JSON.parse(sessionStorage.getItem('user') || '{}');
              const isCounselor =
                userRole === 'ROLE_COUNSELOR' ||
                userRole === 'counselor' ||
                user.role === 'ROLE_COUNSELOR' ||
                user.role === 'counselor';
              if (isCounselor) {
                createAndJoinSession(counselorCode);
              } else {
                joinExistingSession();
              }
            }}
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
        <div className="flex-1 bg-white rounded-lg shadow-sm overflow-hidden">
          {isVoiceTranslationOn && (
            <div className="absolute bottom-24 right-4 z-10 w-64">
              <VoiceComponent
                onTranscriptionResult={handleVoiceTranscriptionResult}
              />
            </div>
          )}
          <VideoLayout
            participants={participants}
            renderParticipantInfo={participant => (
              <div className="absolute bottom-2 left-2 bg-black bg-opacity-30 text-white px-2 py-1 rounded text-xs">
                {participant.name}
                {participant.isSelf && ' (나)'}
              </div>
            )}
            isSignLanguageOn={isSignLanguageOn}
            onTranslationResult={handleTranslationResult}
          />
        </div>
        <ChatBox
          messages={messages}
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          handleSendMessage={handleSendChatMessage}
          handleKeyDown={handleKeyDown}
          chatContainerRef={chatContainerRef}
          currentUserId={currentUserId}
          isConnected={isChatEnabled}
        />
      </div>

      {/* 하단 컨트롤러 */}
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
        isSessionStarted={isSessionStarted}
        isPageMoveActive={isPageMoveActive}
      />

      {/* ✅ 상담 시작 모달 */}
      {showStartModal && (
        <SessionStartModal
          isOpen={showStartModal}
          onConfirm={() => setShowStartModal(false)}
          title="상담이 시작되었습니다."
        />
      )}
      {showEndModal && (
        <SessionStartModal
          isOpen={showEndModal}
          onConfirm={() => setShowEndModal(false)}
          title="상담이 종료되었습니다."
        />
      )}

      {/* 상담 요청 알림 모달 */}
      {showRequestAlert && requestUserInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
            <h3 className="text-lg font-bold mb-2 text-gray-800">상담 요청</h3>
            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <div className="flex items-start">
                <svg
                  className="h-6 w-6 text-blue-500 mr-2 mt-0.5"
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
                <div>
                  <p className="text-sm text-blue-800 font-medium">
                    <span className="font-bold">{requestUserInfo.name}</span>{' '}
                    님이 상담을 요청했습니다.
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    생년월일: {requestUserInfo.birth}
                  </p>
                </div>
              </div>
            </div>
            <p className="mb-4 text-sm text-gray-600">
              상담 요청을 수락하시겠습니까?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleDeclineRequest}
                className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors text-gray-700"
              >
                거절
              </button>
              <button
                onClick={handleAcceptRequest}
                className="px-4 py-2 bg-gradient-to-r from-[#5CCA88] to-[#3FB06C] text-white rounded-md hover:from-[#6AD3A6] hover:to-[#078263] transition-colors"
              >
                수락
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 알림 모달 */}
      <NotificationModal
        isOpen={isNotificationModalOpen}
        onClose={handleNotificationClose}
        title={notificationModalContent.title}
        message={notificationModalContent.message}
        type={notificationModalContent.type}
        buttonText={notificationModalContent.buttonText}
      />
    </div>
  );
}

export default CounselChannelVideo;
