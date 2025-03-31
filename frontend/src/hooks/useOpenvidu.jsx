// hooks/useOpenVidu.js
import { useState, useEffect, useRef } from 'react';
import { OpenVidu } from 'openvidu-browser';
import openviduApi from '../api/openViduApi';

export default function useOpenVidu(
  channelId,
  userName,
  audioEnabled = true,
  videoEnabled = true,
) {
  const [session, setSession] = useState(null);
  const [publisher, setPublisher] = useState(null);
  const [subscribers, setSubscribers] = useState([]);
  const [error, setError] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const initialized = useRef(false);
  const OV = useRef(null);
  
  // 참가자 정보를 관리하기 위한 상태 추가
  const [participants, setParticipants] = useState([]);

  // 세션 생성 및 참여 함수 (방장용)
  const createAndJoinSession = async () => {
    if (initialized.current || isConnecting) return;

    setIsConnecting(true);
    setError(null);

    try {
      initialized.current = true;
      console.log(`세션 생성 및 참여: ${channelId}`);

      // 미디어 장치 접근 권한 요청
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      } catch (mediaError) {
        console.warn('미디어 장치 접근 오류:', mediaError);
        // 오디오만이라도 시도
        if (mediaError.name === 'NotAllowedError' || mediaError.name === 'NotFoundError') {
          await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
          // 비디오 비활성화 상태로 설정
          videoEnabled = false;
        } else {
          throw mediaError;
        }
      }

      // OpenVidu 객체 생성
      OV.current = new OpenVidu();
      const mySession = OV.current.initSession();
      setSession(mySession);

      // 이벤트 리스너 설정
      setupEventListeners(mySession);

      // 세션 생성 요청 (방장만 수행)
      const sessionId = await openviduApi.createSession(channelId);
      
      // 토큰 요청
      const token = await openviduApi.getToken(sessionId);
 
      // 세션 연결
      await mySession.connect(token, { clientData: userName });

      // 퍼블리셔 생성 및 게시
      await setupPublisher(mySession, audioEnabled, videoEnabled);
      
      // 방장 정보 저장
      sessionStorage.setItem('isChannelHost', 'true');
      
      setIsConnected(true);
    } catch (error) {
      console.error('OpenVidu 세션 생성 오류:', error);
      setError(error.message || '세션 생성 중 오류가 발생했습니다.');
      initialized.current = false;
    } finally {
      setIsConnecting(false);
    }
  };

  // 기존 세션 참여 함수 (참여자용)
  const joinExistingSession = async () => {
    if (initialized.current || isConnecting) return;

    setIsConnecting(true);
    setError(null);

    try {
      initialized.current = true;
      console.log(`기존 세션 참여: ${channelId}`);

      // 미디어 장치 접근 권한 요청
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      } catch (mediaError) {
        console.warn('미디어 장치 접근 오류:', mediaError);
        // 오디오만이라도 시도
        if (mediaError.name === 'NotAllowedError' || mediaError.name === 'NotFoundError') {
          await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
          // 비디오 비활성화 상태로 설정
          videoEnabled = false;
        } else {
          throw mediaError;
        }
      }

      // OpenVidu 객체 생성
      OV.current = new OpenVidu();
      const mySession = OV.current.initSession();
      setSession(mySession);

      // 이벤트 리스너 설정
      setupEventListeners(mySession);

      // 세션 생성 없이 바로 토큰 요청
      const token = await openviduApi.getToken(channelId);
 
      // 세션 연결
      await mySession.connect(token, { clientData: userName });

      // 퍼블리셔 생성 및 게시
      await setupPublisher(mySession, audioEnabled, videoEnabled);
      
      // 참여자 정보 저장
      sessionStorage.setItem('isChannelHost', 'false');
      
      setIsConnected(true);
    } catch (error) {
      console.error('OpenVidu 세션 참여 오류:', error);
      setError(error.message || '세션 참여 중 오류가 발생했습니다.');
      initialized.current = false;
    } finally {
      setIsConnecting(false);
    }
  };
  
  // 이벤트 리스너 설정 함수 (코드 중복 제거)
  const setupEventListeners = (mySession) => {
    mySession.on('streamCreated', event => {
      const subscriber = mySession.subscribe(event.stream, undefined);
      setSubscribers(prevSubscribers => [...prevSubscribers, subscriber]);
      
      // 참가자 정보 추출
      const connectionData = JSON.parse(event.stream.connection.data || '{}');
      const participantName = connectionData.clientData || 'Unknown';
      
      // 참가자 목록에 추가
      setParticipants(prev => [
        ...prev,
        {
          id: event.stream.connection.connectionId,
          stream: subscriber,
          name: participantName,
          isSelf: false
        }
      ]);
    });

    mySession.on('streamDestroyed', event => {
      setSubscribers(prevSubscribers =>
        prevSubscribers.filter(sub => sub !== event.stream.streamManager),
      );
      
      // 참가자 목록에서 제거
      setParticipants(prev => 
        prev.filter(p => p.id !== event.stream.connection.connectionId)
      );
    });

    mySession.on('exception', exception => {
      console.warn('OpenVidu 예외 발생:', exception);
      setError(exception.message);
    });
  };
  
  // 퍼블리셔 설정 함수 (코드 중복 제거)
  const setupPublisher = async (mySession, audioEnabled, videoEnabled) => {
    const devices = await OV.current.getDevices();
    const videoDevices = devices.filter(
      device => device.kind === 'videoinput',
    );

    const publisher = OV.current.initPublisher(undefined, {
      audioSource: audioEnabled ? undefined : false,
      videoSource: videoEnabled ? undefined : false,
      publishAudio: audioEnabled,
      publishVideo: videoEnabled,
      resolution: '640x480',
      frameRate: 30,
      insertMode: 'APPEND',
      mirror: false,
    });

    await mySession.publish(publisher);
    setPublisher(publisher);
    
    // 자신을 참가자 목록에 추가
    setParticipants(prev => [
      ...prev,
      {
        id: mySession.connection.connectionId,
        stream: publisher,
        name: userName,
        isSelf: true
      }
    ]);
    
    return publisher;
  };

  // 기존 joinSession 함수 (하위 호환성 유지)
  const joinSession = async () => {
    // 방장 여부 확인
    const isHost = sessionStorage.getItem('isChannelHost') === 'true';
    
    if (isHost) {
      await createAndJoinSession();
    } else {
      await joinExistingSession();
    }
  };

  // 오디오 토글
  const toggleAudio = () => {
    if (publisher) {
      const newStatus = !publisher.stream.audioActive;
      publisher.publishAudio(newStatus);
      return newStatus;
    }
    return false;
  };

  // 비디오 토글
  const toggleVideo = () => {
    if (publisher) {
      const newStatus = !publisher.stream.videoActive;
      publisher.publishVideo(newStatus);
      return newStatus;
    }
    return false;
  };

  // 세션 종료
  const leaveSession = async () => {
    if (session) {
      try {
        if (publisher) {
          session.unpublish(publisher);
        }
        session.disconnect();
      } catch (error) {
        console.error('세션 종료 오류:', error);
      }

      setSession(null);
      setPublisher(null);
      setSubscribers([]);
      setParticipants([]);
      setIsConnected(false);
      initialized.current = false;
      OV.current = null;

      // 세션 정보 삭제
      sessionStorage.removeItem('openviduToken');
      sessionStorage.removeItem('openviduSessionId');
      sessionStorage.removeItem('isChannelHost');
    }
  };

  // 참가자 정보 렌더링 함수
  const renderParticipantInfo = (participant) => (
    <div className="absolute bottom-2 right-2 bg-gray-700 bg-opacity-70 text-white px-2 py-1 rounded text-xs">
      {participant.name}
    </div>
  );

  // 컴포넌트 언마운트 시 세션 정리
  useEffect(() => {
    return () => {
      leaveSession();
    };
  }, []);

  return {
    session,
    publisher,
    subscribers,
    joinSession,
    createAndJoinSession,
    joinExistingSession,
    leaveSession,
    toggleAudio,
    toggleVideo,
    error,
    isConnecting,
    isConnected,
    participants,
    renderParticipantInfo
  };
}
