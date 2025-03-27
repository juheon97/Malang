// hooks/useOpenVidu.js
import { useState, useEffect, useRef } from 'react';
import { OpenVidu } from 'openvidu-browser';
import axios from 'axios';
//import mockApi from '../api/mockApi';

export default function useOpenVidu(
  channelId,
  userName,
  audioEnabled = true,
  videoEnabled = true,
) {
  // 상태 관리
  const [session, setSession] = useState(null);
  const [publisher, setPublisher] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [connectionError, setConnectionError] = useState('');
  const [channelInfo, setChannelInfo] = useState(null);

  // 초기화 상태 추적
  const initialized = useRef(false);
  const subscribedStreams = useRef(new Set());

  // 서버 URL
  const APPLICATION_SERVER_URL = 'http://localhost:5000/';

  // 채널 정보 가져오기
  const fetchChannelInfo = async () => {
    try {
      const token = sessionStorage.getItem('token');
      if (!token) {
        throw new Error('인증 토큰이 없습니다.');
      }

      const response = await axios.get(`/api/channels/${channelId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      setChannelInfo(response.data.data);
      return response.data.data;
    } catch (error) {
      console.error('채널 정보 가져오기 실패:', error);
      setConnectionError('채널 정보를 가져오는데 실패했습니다.');
      throw error;
    }
  };

  // 세션 참여
  const joinSession = async () => {
    if (initialized.current) return;

    try {
      initialized.current = true;
      console.log(`세션 참여: ${channelId}`);

      // 1. 채널 정보 가져오기
      await fetchChannelInfo();
      console.log('채널 정보:', channelId);
      // 2. OpenVidu 객체 생성
      const ov = new OpenVidu();

      // 3. 먼저 미디어 장치 접근 권한 요청
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

      // 4. 세션 초기화
      const mySession = ov.initSession();
      setSession(mySession);

      // 5. 이벤트 리스너 설정
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

        // 참가자 목록에 추가
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

      // 6. sessionStorage에서 토큰 가져오기
      const token = sessionStorage.getItem('openviduToken');

      if (!token) {
        // 토큰이 없으면 서버에서 새로 발급
        const newToken = await getToken(channelId);
        await mySession.connect(newToken, { clientData: userName });
      } else {
        // 저장된 토큰 사용
        await mySession.connect(token, { clientData: userName });
      }

      // 7. 자신의 카메라 스트림 발행 (오류 처리 개선)
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

        // 8. 자신을 참가자 목록에 추가
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
  const leaveSession = async () => {
    if (!session) return;

    try {
      // 1. 채널 퇴장 API 호출
      const token = sessionStorage.getItem('token');
      if (token) {
        try {
          await axios.post(
            `/api/channels/${channelId}/leave`,
            {},
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            },
          );
        } catch (error) {
          console.error('채널 퇴장 API 호출 실패:', error);
        }
      }

      // 2. 모든 구독 해제
      participants.forEach(p => {
        if (!p.isSelf && p.stream) {
          try {
            session.unsubscribe(p.stream);
          } catch (e) {}
        }
      });

      // 3. 발행 중지
      if (publisher) {
        try {
          session.unpublish(publisher);
        } catch (e) {}
      }

      // 4. 세션 연결 해제
      session.disconnect();

      // 5. 상태 초기화
      setSession(null);
      setPublisher(null);
      setParticipants([]);
      setChannelInfo(null);
      subscribedStreams.current.clear();
      initialized.current = false;

      // 6. sessionStorage에서 세션 정보 제거
      sessionStorage.removeItem('openviduSessionId');
      sessionStorage.removeItem('openviduToken');
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
      // 1. 실제 환경에서는 서버에서 토큰을 발급받음
      const token = sessionStorage.getItem('token');
      if (!token) {
        throw new Error('인증 토큰이 없습니다.');
      }

      // 2. 모의 API를 사용하여 OpenVidu 토큰 발급
      const response = await axios.post(
        `/openvidu/api/sessions/${sessionId}/connection`,
        {
          role: 'PUBLISHER',
          data: JSON.stringify({
            clientData: userName,
          }),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      // 3. 발급받은 토큰을 sessionStorage에 저장
      const openviduToken = response.data.token;
      sessionStorage.setItem('openviduToken', openviduToken);

      return openviduToken;
    } catch (error) {
      console.error('토큰 획득 오류:', error);
      throw error;
    }
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
    channelInfo,
    joinSession,
    leaveSession,
    toggleAudio,
    toggleVideo,
  };
}
