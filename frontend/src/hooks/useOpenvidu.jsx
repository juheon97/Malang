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

  // 세션 참여 함수
  const joinSession = async () => {
    if (initialized.current || isConnecting) return;

    setIsConnecting(true);
    setError(null);

    try {
      initialized.current = true;

      // 미디어 장치 접근 권한 요청
      await navigator.mediaDevices.getUserMedia({ audio: true, video: true });

      // OpenVidu 객체 생성
      OV.current = new OpenVidu();
      const mySession = OV.current.initSession();
      setSession(mySession);

      // 이벤트 리스너 설정
      mySession.on('streamCreated', event => {
        const subscriber = mySession.subscribe(event.stream, undefined);
        setSubscribers(prevSubscribers => [...prevSubscribers, subscriber]);
      });

      mySession.on('streamDestroyed', event => {
        setSubscribers(prevSubscribers =>
          prevSubscribers.filter(sub => sub !== event.stream.streamManager),
        );
      });

      mySession.on('exception', exception => {
        console.warn('OpenVidu 예외 발생:', exception);
        setError(exception.message);
      });

      // 세션 ID 확인 (채널 ID 사용)
      let sessionId = channelId || sessionStorage.getItem('openviduSessionId');

      // 세션 ID가 없으면 새로 생성
      if (!sessionId) {
        sessionId = await openviduApi.createSession();
        sessionStorage.setItem('openviduSessionId', sessionId);
      }

      // 토큰 요청
      const token = await openviduApi.getToken(sessionId);
      sessionStorage.setItem('openviduToken', token);

      // 세션 연결
      await mySession.connect(token, { clientData: userName });

      // 퍼블리셔 생성
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
      setIsConnected(true);
    } catch (error) {
      console.error('OpenVidu 연결 오류:', error);
      setError(error.message);
      initialized.current = false;
    } finally {
      setIsConnecting(false);
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
      setIsConnected(false);
      initialized.current = false;
      OV.current = null;

      // 세션 정보 삭제
      sessionStorage.removeItem('openviduToken');
      sessionStorage.removeItem('openviduSessionId');
    }
  };

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
    leaveSession,
    toggleAudio,
    toggleVideo,
    error,
    isConnecting,
    isConnected,
  };
}
