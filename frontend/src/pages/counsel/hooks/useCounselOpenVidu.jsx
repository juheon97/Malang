import { useState, useEffect, useRef } from 'react';
import { OpenVidu } from 'openvidu-browser';
import counselOpenViduApi from '../../../api/counselOpenViduApi';
import counselWebSocketService from '../../../services/counselwebsocketService';

const useCounselOpenVidu = (counselorCode, userName) => {
  const [participants, setParticipants] = useState([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [session, setSession] = useState(null);
  const [publisher, setPublisher] = useState(null);
  const [subscribers, setSubscribers] = useState([]);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const OV = useRef(null);
  const initialized = useRef(false);

  // 웹소켓 연결 확인 및 대기 함수 추가
  const ensureWebSocketConnection = async () => {
    if (counselWebSocketService.isConnected) {
      console.log('웹소켓이 이미 연결되어 있습니다.');
      return true;
    }

    console.log('웹소켓 연결 대기 시작...');
    
    // 웹소켓 연결 시도
    try {
      // 기본 웹소켓 콜백 핸들러
      const handleWebSocketMessage = message => {
        console.log('[웹소켓] 메시지 수신:', message);
      };
      
      // 웹소켓 연결 - 연결이 비동기적으로 처리되므로 대기 필요
      counselWebSocketService.connect(counselorCode, handleWebSocketMessage);
      
      // 웹소켓 연결 대기 (최대 5초)
      let attempt = 0;
      const maxAttempts = 10; // 500ms 간격으로 10번 = 5초
      
      while (attempt < maxAttempts) {
        if (counselWebSocketService.isConnected) {
          console.log('웹소켓 연결 성공');
          return true;
        }
        
        await new Promise(resolve => setTimeout(resolve, 500));
        attempt++;
      }
      
      console.warn('웹소켓 연결 대기 시간 초과');
      return false;
    } catch (error) {
      console.error('웹소켓 연결 에러:', error);
      return false;
    }
  };

  // 페이지 이탈/새로고침 시 세션 정리
  useEffect(() => {
    const handleBeforeUnload = () => {
      console.log("페이지 이탈 감지: 세션 정리");
      leaveSession();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      // 컴포넌트 언마운트 시 세션 정리
      leaveSession();
    };
  }, []);

  useEffect(() => {
    if (session) {
      // Clean up any existing listeners to prevent duplicates
      session.off('connectionCreated');
      session.off('streamCreated');
      session.off('connectionDestroyed');
      session.off('streamDestroyed');
      
      // Set up event listeners
      session.on('connectionCreated', (event) => {
        console.log('연결 생성 상세 정보:', {
          연결ID: event.connection.connectionId,
          로컬여부: event.connection.connectionId === session.connection?.connectionId,
          연결데이터: event.connection.data});
        try {
          const connectionData = JSON.parse(event.connection.data || '{}');
          const userData = connectionData.clientData ? JSON.parse(connectionData.clientData) : {};
          
          const newParticipant = {
            id: event.connection.connectionId,
            stream: null,
            // 자신의 connectionId와 일치하는 경우에만 isSelf를 true로 설정
            isSelf: event.connection.connectionId === session.connection?.connectionId,
            name: userData.userName || 'Unknown'
          };
          
          setParticipants(prev => {
            // 로그 추가
            console.log('이전 참가자 목록:', prev.map(p => ({id: p.id, isSelf: p.isSelf})));
            
            // Check if participant already exists to avoid duplicates
            const exists = prev.some(p => p.id === newParticipant.id);
            
            // 이미 존재하지만 isSelf 속성이 다른 경우 업데이트
            if (exists) {
              return prev.map(p => 
                p.id === newParticipant.id 
                  ? { ...p, isSelf: p.isSelf || newParticipant.isSelf, name: p.name || newParticipant.name }
                  : p
              );
            } else {
              // 새 참가자 추가
              return [...prev, newParticipant];
            }
          });
        } catch (error) {
          console.error('Error handling connectionCreated:', error);
        }
      });

      session.on('streamCreated', (event) => {
        console.log('===== 스트림 생성 상세 정보 =====');
        console.log('스트림 ID:', event.stream.streamId);
        console.log('연결 ID:', event.stream.connection.connectionId);
        console.log('연결 데이터:', event.stream.connection.data);
        console.log('현재 세션 ID:', session.sessionId);
        console.log('현재 연결된 참가자 목록:', participants.map(p => p.id));
        
        const newStream = event.stream;
        const subscriber = session.subscribe(newStream, undefined);
        
        console.log('Subscribing to', newStream.connection.connectionId);
        
        // 구독자 배열에 추가
        setSubscribers(prev => {
          // 중복 구독 방지
          const exists = prev.some(sub => 
            sub.stream.connection.connectionId === newStream.connection.connectionId
          );
          return exists ? prev : [...prev, subscriber];
        });
        
        // 참가자 목록 업데이트
        setParticipants(prev => {
          try {
            // 연결 데이터 파싱
            const connectionData = JSON.parse(newStream.connection.data || '{}');
            const userData = connectionData.clientData ? JSON.parse(connectionData.clientData) : {};
            
            // 현재 참가자가 목록에 존재하는지 확인
            const existingIndex = prev.findIndex(p => p.id === newStream.connection.connectionId);
            
            if (existingIndex >= 0) {
              // 존재하면 업데이트
              const updated = [...prev];
              updated[existingIndex] = {
                ...updated[existingIndex],
                stream: subscriber,
                name: updated[existingIndex].name || userData.userName || 'Unknown'
              };
              return updated;
            } else {
              // 존재하지 않으면 새로 추가
              return [...prev, {
                id: newStream.connection.connectionId,
                stream: subscriber,
                // 연결 ID가 세션의 연결 ID와 일치하는 경우에만 true
                isSelf: newStream.connection.connectionId === session.connection?.connectionId,
                name: userData.userName || 'Unknown'
              }];
            }
          } catch (error) {
            console.error('Error handling streamCreated:', error);
            return prev;
          }
        });
      });

      session.on('connectionDestroyed', (event) => {
        console.log('===== 연결 종료 상세 정보 =====');
        console.log('Connection destroyed:', event.connection.connectionId);
        console.log('Connection data:', event.connection.data);
        console.log('현재 세션 ID:', session.sessionId);
        
        setParticipants(prev => {
          console.log('연결 종료 전 참가자 목록:', prev.map(p => ({id: p.id, name: p.name})));
          const updated = prev.filter(p => p.id !== event.connection.connectionId);
          console.log('연결 종료 후 참가자 목록:', updated.map(p => ({id: p.id, name: p.name})));
          return updated;
        });
        
        setSubscribers(prev => prev.filter(sub => 
          sub.stream.connection.connectionId !== event.connection.connectionId
        ));
      });

      session.on('streamDestroyed', (event) => {
        console.log('===== 스트림 종료 상세 정보 =====');
        console.log('Stream destroyed:', event.stream.connection.connectionId);
        console.log('Stream ID:', event.stream.streamId);
        console.log('현재 세션 ID:', session.sessionId);
        
        setParticipants(prev => {
          console.log('스트림 종료 전 참가자 목록:', prev.map(p => ({id: p.id, hasStream: !!p.stream})));
          const updated = prev.map(participant => 
            participant.id === event.stream.connection.connectionId 
              ? { ...participant, stream: null }
              : participant
          );
          console.log('스트림 종료 후 참가자 목록:', updated.map(p => ({id: p.id, hasStream: !!p.stream})));
          return updated;
        });
        
        setSubscribers(prev => 
          prev.filter(sub => sub.stream.connection.connectionId !== event.stream.connection.connectionId)
        );
      });
    }

    return () => {
      if (session) {
        session.off('connectionCreated');
        session.off('streamCreated');
        session.off('connectionDestroyed');
        session.off('streamDestroyed');
      }
    };
  }, [session, participants]);


  /* 방 처음 만드는 사람이 방 만들기 버튼을 클릭했을 때 */
  const createAndJoinSession = async (counselorCode) => {
    console.log(`[연결 시도] 세션 생성/참여 시작, counselorCode:`, counselorCode);
    if (!counselorCode) throw new Error('counselorCode가 필요합니다');
    if (initialized.current || isConnecting) return false;
    const stringCounselorCode = String(counselorCode);

    // 기존 세션 정보 정리
    sessionStorage.removeItem('openviduSessionId');

    initialized.current = true;
    setIsConnecting(true);
    setError(null);
    // 방장이 처음 생성할 때만 참가자 목록 초기화
    setParticipants([]);

    try {
      // 1. 웹소켓 연결 확인 - 먼저 처리
      const wsConnected = await ensureWebSocketConnection();
      if (!wsConnected) {
        console.warn('웹소켓 연결 실패, OpenVidu 세션 생성 계속 진행');
      }

      // 잠시 대기 후 계속 (웹소켓 연결 완료 대기)
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 2. OpenVidu 인스턴스 생성
      OV.current = new OpenVidu();
      const mySession = OV.current.initSession();
      setSession(mySession);

      // 3. 미디어 장치 접근 확인
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        console.log('미디어 장치 접근 권한 획득 성공');
      } catch (mediaError) {
        console.error('미디어 장치 접근 실패:', mediaError);
        throw new Error('카메라 또는 마이크 접근 권한이 필요합니다');
      }
      
      // 4. 세션 생성 및 토큰 발급 - 실패 시 재시도 로직 추가
      let sessionId;
      let token;
      let retries = 3;
      
      while (retries > 0) {
        try {
          // 세션 생성
          sessionId = await counselOpenViduApi.createSession(counselorCode);
          console.log('세션 생성 성공:', sessionId);
          
          // 토큰 발급
          token = await counselOpenViduApi.getToken(stringCounselorCode);
          console.log('토큰 발급 성공:', token);
          
          // 성공하면 루프 종료
          break;
        } catch (apiError) {
          console.warn(`API 호출 실패 (남은 시도: ${retries-1}):`, apiError);
          retries--;
          
          if (retries > 0) {
            // 잠시 대기 후 재시도
            await new Promise(resolve => setTimeout(resolve, 1000));
          } else {
            throw apiError; // 모든 시도 실패 시 에러 발생
          }
        }
      }

      // 5. 사용자 정보 설정
      const currentUser = JSON.parse(sessionStorage.getItem('user')) || {};
      const userName = currentUser.username || currentUser.nickname || '사용자';
      
      // 6. 세션 연결
      await mySession.connect(token, { 
        clientData: JSON.stringify({ userName, isHost: true })
      });
      console.log('세션 연결 성공');

      // 7. 게시자 설정 및 게시
      const publisher = OV.current.initPublisher(undefined, {
        audioSource: undefined,
        videoSource: undefined,
        publishAudio: audioEnabled,
        publishVideo: videoEnabled,
        resolution: '640x480',
        frameRate: 30,
        insertMode: 'APPEND',
        mirror: false
      });

      await mySession.publish(publisher);
      setPublisher(publisher);
      console.log('스트림 게시 성공');

      // 8. 자기 자신을 참여자에 넣기
      setParticipants([{
        id: mySession.connection.connectionId,
        stream: publisher,
        isSelf: true,
        name: userName || '방장'
      }]);

      sessionStorage.setItem('openviduSessionId', counselorCode);
      setIsConnected(true);
      return true;
    } catch (error) {
      console.error('세션 연결 실패:', error);
      setError(error.message || '세션 연결 중 오류 발생');
      
      // 오류 발생 시 리소스 정리
      if (session) {
        try {
          session.disconnect();
        } catch (cleanupError) {
          console.warn('세션 정리 중 오류:', cleanupError);
        }
      }
      
      return false;
    } finally {
      setIsConnecting(false);
      initialized.current = false;
    }
  };

  /* 다른 사람이 방 목록에서 방 들어갈 때 */
  const joinExistingSession = async () => {
    console.log(`[연결 시도] 세션 참여 시작, counselorCode:`, counselorCode);
    if (isConnected || initialized.current) return false;
    initialized.current = true;
    setIsConnecting(true);
    setError(null);
    // 참가자 목록은 초기화하지 않고 현재 참가자만 추가
    
    try {
      // 1. 웹소켓 연결 확인 - 먼저 처리
      const wsConnected = await ensureWebSocketConnection();
      if (!wsConnected) {
        console.warn('웹소켓 연결 실패, OpenVidu 세션 참여 계속 진행');
      }

      // 잠시 대기 후 계속 (웹소켓 연결 완료 대기)
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 2. OpenVidu 인스턴스 생성
      OV.current = new OpenVidu();
      const mySession = OV.current.initSession();
      setSession(mySession);

      // 3. 토큰 발급
      const token = await counselOpenViduApi.getToken(counselorCode);
      console.log('참여 토큰 발급 성공:', token);

      // 4. 사용자 정보 설정
      const currentUser = JSON.parse(sessionStorage.getItem('user')) || {};
      const userName = currentUser.username || currentUser.nickname || '참가자';
     
      // 5. 세션 연결
      await mySession.connect(token, { 
        clientData: JSON.stringify({ userName, isHost: false })
      });
      console.log('세션 참여 연결 성공');

      // 6. 게시자 설정 및 게시
      const publisher = OV.current.initPublisher(undefined, {
        audioSource: undefined,
        videoSource: undefined,
        publishAudio: audioEnabled,
        publishVideo: videoEnabled,
        resolution: '640x480',
        frameRate: 30,
        insertMode: 'APPEND',
        mirror: false
      });

      await mySession.publish(publisher);
      setPublisher(publisher);
      console.log('스트림 게시 성공');

      // 7. 자기 자신을 참가자에 추가
      setParticipants(prev => {
        // 자신이 이미 있는지 확인
        const selfExists = prev.some(p => p.id === mySession.connection.connectionId);
        
        if (selfExists) {
          // 자신이 이미 있으면 업데이트
          return prev.map(p => 
            p.id === mySession.connection.connectionId 
              ? { ...p, stream: publisher, isSelf: true, name: userName || '참가자' }
              : p
          );
        } else {
          // 자신이 없으면 추가
          return [...prev, {
            id: mySession.connection.connectionId,
            stream: publisher,
            isSelf: true,
            name: userName || '참가자'
          }];
        }
      });

      setIsConnected(true);
      sessionStorage.setItem('openviduSessionId', counselorCode);
      return true;
    } catch (error) {
      console.error('세션 참여 실패:', error);
      setError(error.message || '세션 참여 중 오류 발생');
      return false;
    } finally {
      setIsConnecting(false);
      initialized.current = false;
    }
  };


  const leaveSession = () => {
    if (!session) return;
    
    try {
      console.log('===== 세션 종료 프로세스 시작 =====', {
        sessionId: session.counselorCode,
        participantCount: participants.length
      });
  
      // 디버깅용 참가자 정보 로깅
      const participantDetails = participants.map(p => ({
        id: p.id, 
        name: p.name, 
        isSelf: p.isSelf
      }));
      console.log('현재 참가자 목록:', participantDetails);
  
      // 1. 구독 해제
      if (Array.isArray(subscribers) && subscribers.length > 0) {
        for (const sub of subscribers) {
          try {
            if (sub && sub.stream && sub.stream.connection && session) {
              console.log(`구독 해제:`, sub.stream.connection.connectionId);
              session.unsubscribe(sub);
            }
          } catch (subError) {
            console.warn(`구독 해제 중 오류:`, subError);
          }
        }
      }
  
      // 2. 게시 해제
      if (publisher && session) {
        try {
          console.log('게시 해제:', session.connection?.connectionId);
          session.unpublish(publisher);
        } catch (publishError) {
          console.warn('게시 해제 중 오류:', publishError);
        }
      }
  
      // 3. 세션 완전 종료
      if (session) {
        try {
          // OpenVidu 세션 연결 해제
          session.disconnect();
          console.log('세션 연결 해제 완료');
        } catch (disconnectError) {
          console.warn('세션 연결 해제 중 오류:', disconnectError);
        }
      }
      
      // 4. 세션 ID 제거
      sessionStorage.removeItem('openviduSessionId');
      
      // 5. 상태 초기화
      setSession(null);
      setParticipants([]);
      setSubscribers([]);
      setPublisher(null);
      setIsConnected(false);
      
      console.log('===== 세션 종료 프로세스 완료 =====');
    } catch (overallError) {
      console.error('전체 세션 종료 프로세스 중 오류:', overallError);
    } 
    
    // 항상 초기화
    OV.current = null;
    initialized.current = false;
  };

  const toggleAudio = (value = null) => {
    if (publisher) {
      const newValue = value !== null ? value : !audioEnabled;
      publisher.publishAudio(newValue);
      setAudioEnabled(newValue);
    }
  };

  const toggleVideo = (value = null) => {
    if (publisher) {
      const newValue = value !== null ? value : !videoEnabled;
      publisher.publishVideo(newValue);
      setVideoEnabled(newValue);
    }
  };

  // 중복 연결 확인 함수
  const checkForDuplicateConnections = () => {
    if (!session) return;
    
    console.log('===== 중복 연결 확인 =====');
    const connectionIds = participants.map(p => p.id);
    const uniqueIds = [...new Set(connectionIds)];
    
    if (connectionIds.length !== uniqueIds.length) {
      console.warn('중복된 연결이 감지되었습니다!');
      console.log('모든 연결:', connectionIds);
      console.log('고유 연결:', uniqueIds);
      
      // 중복을 제거한 참가자 목록으로 업데이트
      setParticipants(prev => {
        return uniqueIds.map(id => {
          const participant = prev.find(p => p.id === id);
          return participant;
        });
      });
    } else {
      console.log('중복 연결 없음. 현재 연결:', connectionIds);
    }
  };

  // 정기적으로 중복 연결 확인
  useEffect(() => {
    const interval = setInterval(() => {
      if (isConnected) {
        checkForDuplicateConnections();
      }
    }, 10000); // 10초마다 확인
    
    return () => clearInterval(interval);
  }, [isConnected, participants]);

  const renderParticipantInfo = (participant) => {
    return (
      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 z-10 flex justify-between items-center">
        <span className="text-sm">{participant.name || 'Unknown'}</span>
        {participant.isSelf && <span className="text-xs bg-blue-500 px-2 py-1 rounded">Me</span>}
      </div>
    );
  };

  return {
    participants,
    setParticipants,
    session,
    publisher,
    subscribers,
    audioEnabled,
    videoEnabled,
    isConnected,
    isConnecting,
    error,
    createAndJoinSession,
    joinExistingSession,
    leaveSession,
    toggleAudio,
    toggleVideo,
    renderParticipantInfo,
    checkForDuplicateConnections
  };
};

export default useCounselOpenVidu;