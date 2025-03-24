// hooks/useOpenVidu.js
import { useState, useEffect, useRef } from 'react';
import { OpenVidu } from 'openvidu-browser';
import axios from 'axios';

export default function useOpenVidu(
  sessionId,
  userName,
  audioEnabled = true,
  videoEnabled = true,
) {
  // 상태 관리
  const [session, setSession] = useState(null);
  const [publisher, setPublisher] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [connectionError, setConnectionError] = useState('');

  // 초기화 상태 추적
  const initialized = useRef(false);
  const subscribedStreams = useRef(new Set());

  // 서버 URL
  const APPLICATION_SERVER_URL = 'http://localhost:5000/';

  // 세션 참여
  const joinSession = async () => {
    if (initialized.current) return;

    try {
      initialized.current = true;
      console.log(`세션 참여: ${sessionId}`);

      // 1. OpenVidu 객체 생성
      const ov = new OpenVidu();

      // 2. 먼저 미디어 장치 접근 권한 요청
      try {
        await navigator.mediaDevices.getUserMedia({
          audio: audioEnabled,
          video: videoEnabled,
        });
      } catch (mediaError) {
        console.error('미디어 장치 접근 오류:', mediaError);
        let errorMessage = '화상 연결 중 오류가 발생했습니다.';

        if (mediaError.name === 'NotAllowedError') {
          errorMessage =
            '카메라와 마이크 접근 권한이 필요합니다. 브라우저 설정에서 권한을 허용해주세요.';
        } else if (mediaError.name === 'NotFoundError') {
          errorMessage =
            '카메라 또는 마이크를 찾을 수 없습니다. 장치가 연결되어 있는지 확인해주세요.';
        } else if (mediaError.name === 'NotReadableError') {
          errorMessage =
            '카메라 또는 마이크에 접근할 수 없습니다. 다른 프로그램이 사용 중인지 확인해주세요.';
        }

        setConnectionError(errorMessage);
        initialized.current = false;
        return; // 미디어 접근 실패 시 세션 연결 중단
      }

      // 3. 세션 초기화
      const mySession = ov.initSession();
      setSession(mySession);

      // 4. 이벤트 리스너 설정
      mySession.on('streamCreated', event => {
        const streamId = event.stream.streamId;
        const connectionId = event.stream.connection.connectionId;

        // 내 스트림이거나 이미 구독한 스트림이면 무시
        if (
          connectionId === mySession.connection.connectionId ||
          subscribedStreams.current.has(streamId)
        )
          return;

        // 스트림 구독
        const subscriber = mySession.subscribe(event.stream, undefined);
        subscribedStreams.current.add(streamId);

        // // 참가자 목록에 추가
        setParticipants(prev => {
          if (prev.some(p => p.id === connectionId)) return prev;

          return [
            ...prev,
            {
              id: connectionId,
              name: JSON.parse(event.stream.connection.data).clientData,
              stream: subscriber,
              isSelf: false,
              canSpeak: true,
            },
          ];
        });
      });

      mySession.on('streamDestroyed', event => {
        const streamId = event.stream.streamId;
        const connectionId = event.stream.connection.connectionId;

        // 구독 목록에서 제거
        subscribedStreams.current.delete(streamId);

        // 참가자 목록에서 제거
        setParticipants(prev => prev.filter(p => p.id !== connectionId));
      });

      // 웹소켓 연결 관련 이벤트 추가
      mySession.on('reconnecting', () => {
        console.log('세션 재연결 시도 중...');
      });

      mySession.on('reconnected', () => {
        console.log('세션 재연결 성공');
      });

      // 5. 토큰 획득 및 세션 연결
      const token = await getToken(sessionId);
      await mySession.connect(token, { clientData: userName });

      // 6. 자신의 카메라 스트림 발행 (오류 처리 개선)
      try {
        const publisher = await ov.initPublisherAsync(undefined, {
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

        // 7. 자신을 참가자 목록에 추가
        setParticipants(prev => {
          if (prev.some(p => p.id === mySession.connection.connectionId))
            return prev;

          return [
            ...prev,
            {
              id: mySession.connection.connectionId,
              name: userName,
              stream: publisher,
              isSelf: true,
              canSpeak: true,
            },
          ];
        });
      } catch (publishError) {
        console.error('스트림 발행 오류:', publishError);

        // 발행 실패 시 대체 방법 시도
        if (publishError.name === 'DEVICE_ACCESS_DENIED') {
          // 권한 거부 시 다시 시도하거나 오디오/비디오 없이 연결
          try {
            const fallbackPublisher = await ov.initPublisherAsync(undefined, {
              audioSource: false,
              videoSource: false,
              publishAudio: false,
              publishVideo: false,
            });

            await mySession.publish(fallbackPublisher);
            setPublisher(fallbackPublisher);
            setConnectionError(
              '카메라/마이크 없이 연결되었습니다. 권한을 허용하려면 페이지를 새로고침하세요.',
            );

            // 오디오/비디오 없이 자신을 참가자 목록에 추가
            setParticipants(prev => {
              if (prev.some(p => p.id === mySession.connection.connectionId))
                return prev;

              return [
                ...prev,
                {
                  id: mySession.connection.connectionId,
                  name: userName,
                  stream: fallbackPublisher,
                  isSelf: true,
                  canSpeak: false,
                },
              ];
            });
          } catch (fallbackError) {
            console.error('대체 발행 오류:', fallbackError);
            mySession.disconnect();
            setConnectionError(
              '화상 연결에 실패했습니다. 브라우저 설정에서 카메라/마이크 권한을 확인해주세요.',
            );
            initialized.current = false;
          }
        } else {
          // 기타 오류 처리
          mySession.disconnect();
          setConnectionError(
            `화상 연결 중 오류가 발생했습니다: ${publishError.message}`,
          );
          initialized.current = false;
        }
      }
    } catch (error) {
      console.error('세션 연결 오류:', error);
      let errorMessage = '화상 연결 중 오류가 발생했습니다.';

      if (error.name === 'OpenViduError') {
        switch (error.code) {
          case 401:
            errorMessage = '인증에 실패했습니다.';
            break;
          case 404:
            errorMessage = '세션을 찾을 수 없습니다.';
            break;
          case 500:
            errorMessage = '서버 오류가 발생했습니다.';
            break;
        }
      }

      setConnectionError(errorMessage);
      initialized.current = false;
    }
  };

  // 세션 종료
  const leaveSession = () => {
    if (!session) return;

    try {
      // 모든 구독 해제
      participants.forEach(p => {
        if (!p.isSelf && p.stream) {
          try {
            session.unsubscribe(p.stream);
          } catch (e) {}
        }
      });

      // 발행 중지
      if (publisher) {
        try {
          session.unpublish(publisher);
        } catch (e) {}
      }

      // 세션 연결 해제
      session.disconnect();

      // 상태 초기화
      setSession(null);
      setPublisher(null);
      setParticipants([]);
      subscribedStreams.current.clear();
      initialized.current = false;
    } catch (error) {
      console.error('세션 종료 오류:', error);
    }
  };

  // 오디오/비디오 제어
  const toggleAudio = enabled => {
    if (publisher) publisher.publishAudio(enabled);
  };

  const toggleVideo = enabled => {
    if (publisher) publisher.publishVideo(enabled);
  };

  // 토큰 획득
  const getToken = async sessionId => {
    try {
      const sessionData = await createSession(sessionId);
      return await createToken(sessionData);
    } catch (error) {
      console.error('토큰 획득 오류:', error);
      throw error;
    }
  };

  // 세션 생성
  const createSession = async sessionId => {
    try {
      const response = await axios.post(
        `${APPLICATION_SERVER_URL}api/sessions`,
        { customSessionId: sessionId },
        { headers: { 'Content-Type': 'application/json' } },
      );
      return response.data;
    } catch (error) {
      if (error.response?.status === 409) return sessionId;
      throw error;
    }
  };

  // 토큰 생성
  const createToken = async sessionId => {
    const response = await axios.post(
      `${APPLICATION_SERVER_URL}api/sessions/${sessionId}/connections`,
      {},
      { headers: { 'Content-Type': 'application/json' } },
    );
    return response.data;
  };

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (initialized.current) leaveSession();
    };
  }, []);

  return {
    session,
    participants,
    connectionError,
    joinSession,
    leaveSession,
    toggleAudio,
    toggleVideo,
  };
}
