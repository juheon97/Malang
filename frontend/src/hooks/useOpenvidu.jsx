import { useState, useEffect, useRef } from 'react';
import { OpenVidu } from 'openvidu-browser';
import openviduApi from '../api/openViduApi';

const useOpenVidu = (channelId, userName) => {
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

  const createAndJoinSession = async (channelId) => {
    console.log(`[연결 시도 #${Date.now()}] 세션 생성/참여 시작, 호출 스택:`, new Error().stack);
    if (!channelId) throw new Error('channelId가 필요합니다');
    if (initialized.current || isConnecting) return false;
    const stringChannelId = String(channelId);

    // 기존 세션 정보 정리
    sessionStorage.removeItem('openviduSessionId');

    initialized.current = true;
    setIsConnecting(true);
    setError(null);
    // 방장이 처음 생성할 때만 참가자 목록 초기화
    setParticipants([]);

    try {
      OV.current = new OpenVidu();
      const mySession = OV.current.initSession();
      setSession(mySession);

      await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      const sessionId = await openviduApi.createSession(channelId);
      const token = await openviduApi.getToken(stringChannelId);
      
      const currentUser = JSON.parse(sessionStorage.getItem('user')) || {};
      const userName = currentUser.username || currentUser.nickname || '사용자';
      await mySession.connect(token, { 
        clientData: JSON.stringify({ userName, isHost: true })
      });

      const publisher = OV.current.initPublisher(undefined, {
        audioSource: undefined,
        videoSource: undefined,
        publishAudio: audioEnabled,
        publishVideo: videoEnabled,
        resolution: '640x480'
      });

      await mySession.publish(publisher);
      setPublisher(publisher);

      // Add self as a participant
      setParticipants([{
        id: mySession.connection.connectionId,
        stream: publisher,
        isSelf: true,
        name: userName || '방장'
      }]);

      sessionStorage.setItem('openviduSessionId', sessionId);
      setIsConnected(true);
      return true;
    } catch (error) {
      console.error('세션 연결 실패:', error);
      setError(error.message);
      return false;
    } finally {
      setIsConnecting(false);
      initialized.current = false;
    }
  };

  const joinExistingSession = async () => {
    console.log(`[연결 시도 #${Date.now()}] 세션 생성/참여 시작, 호출 스택:`, new Error().stack);
    if (isConnected || initialized.current) return false;
    initialized.current = true;
    setIsConnecting(true);
    setError(null);
    // 참가자 목록은 초기화하지 않고 현재 참가자만 추가 =>
    // setParticipants([]); - 이 부분 제거

    try {
      // 기존 세션 정보 정리
      sessionStorage.removeItem('openviduSessionId');
      
      OV.current = new OpenVidu();
      const mySession = OV.current.initSession();
      setSession(mySession);

      const token = await openviduApi.getToken(channelId);

      const currentUser = JSON.parse(sessionStorage.getItem('user')) || {};
      const userName = currentUser.username || currentUser.nickname || '참가자';
     
      
      await mySession.connect(token, { 
        clientData: JSON.stringify({ userName, isHost: false })
      });

      const publisher = OV.current.initPublisher(undefined, {
        audioSource: undefined,
        videoSource: undefined,
        publishAudio: audioEnabled,
        publishVideo: videoEnabled,
        resolution: '640x480'
      });

      await mySession.publish(publisher);
      setPublisher(publisher);

      // Add self as a participant - 기존 참가자 유지하면서 자신만 추가
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
      sessionStorage.setItem('openviduSessionId', channelId);
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
    if (session) {
      try {
        console.log('===== 세션 종료 프로세스 시작 =====', {
          sessionId: session.sessionId,
          participantCount: participants.length
        });
  
        // 디버깅용 참가자 정보 로깅
        const participantDetails = participants.map(p => ({
          id: p.id, 
          name: p.name, 
          isSelf: p.isSelf
        }));
        console.log('현재 참가자 목록:', participantDetails);
  
        // 안전한 구독 해제 로직
        if (Array.isArray(subscribers) && subscribers.length > 0) {
          subscribers.forEach((sub, index) => {
            try {
              if (sub && sub.stream && sub.stream.connection) {
                console.log(`구독 해제 [${index}]:`, sub.stream.connection.connectionId);
                session.unsubscribe(sub);
              }
            } catch (subError) {
              console.error(`구독 해제 중 오류 [${index}]:`, subError);
            }
          });
        }
  
        // 안전한 게시 해제 로직
        if (publisher) {
          try {
            console.log('게시 해제:', session.connection?.connectionId);
            session.unpublish(publisher);
          } catch (publishError) {
            console.error('게시 해제 중 오류:', publishError);
          }
        }
  
        // 세션 완전 종료
        try {
          // OpenVidu 세션 연결 해제
          session.disconnect();
          
          // 상태 초기화
          setSession(null);
          setParticipants([]);
          setSubscribers([]);
          setPublisher(null);
        } catch (disconnectError) {
          console.error('세션 연결 해제 중 오류:', disconnectError);
        }
  
        console.log('===== 세션 종료 프로세스 완료 =====');
      } catch (overallError) {
        console.error('전체 세션 종료 프로세스 중 오류:', overallError);
      } 
    }
  };
  // const leaveSession = () => {
  //   if (session) {
  //     try {
  //       console.log('===== 세션 종료 시작 =====');
  //       console.log('세션 ID:', session.sessionId);
  //       console.log('현재 참가자 목록:', participants.map(p => ({id: p.id, name: p.name})));
        
  //       // 구독 해제
  //       subscribers.forEach(sub => {
  //         try {
  //           console.log('구독 해제:', sub.stream.connection.connectionId);
  //           session.unsubscribe(sub);
  //         } catch (e) {
  //           console.error('구독 해제 중 오류:', e);
  //         }
  //       });
        
  //       // 게시 해제
  //       if (publisher) {
  //         try {
  //           console.log('게시 해제:', session.connection.connectionId);
  //           session.unpublish(publisher);
  //         } catch (e) {
  //           console.error('게시 해제 중 오류:', e);
  //         }
  //       }
        
  //       // 세션 연결 해제
  //       try {
  //         console.log('세션 연결 해제');
  //         session.disconnect();
  //       } catch (e) {
  //         console.error('세션 연결 해제 중 오류:', e);
  //       }
        
  //       console.log('===== 세션 종료 완료 =====');
  //     } catch (e) {
  //       console.error('세션 종료 중 오류:', e);
  //     }
      
  //     // 상태 초기화
  //     setSession(null);
  //     setPublisher(null);
  //     setSubscribers([]);
  //     setParticipants([]);
  //     setIsConnected(false);
  //     sessionStorage.removeItem('openviduSessionId');
  //   }
  //   OV.current = null;
  //   initialized.current = false;
  // };

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

export default useOpenVidu;