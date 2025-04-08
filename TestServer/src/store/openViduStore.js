// src/store/openViduStore.js
import { create } from 'zustand';
import { OpenVidu } from 'openvidu-browser';
import axios from 'axios';

const OPENVIDU_SERVER_URL = 'https://j12d110.p.ssafy.io';
const OPENVIDU_SERVER_SECRET = 'lsw';

const useOpenViduStore = create((set, get) => ({
  session: undefined,
  mainStreamManager: undefined,
  publisher: undefined,
  subscribers: [],
  showVideoCall: false,
  isRecording: false,
  originalSpeech: '',
  convertedSpeech: '',
  error: '',
  
  joinSession: async (username = '게스트') => {
    try {

      const clientData = typeof username === 'string' ? username : '게스트';
      const OV = new OpenVidu();
      const mySession = OV.initSession();
      
      mySession.on('streamCreated', (event) => {
        const subscriber = mySession.subscribe(event.stream, undefined);
        set(state => ({
          subscribers: [...state.subscribers, subscriber]
        }));
      });
      
      mySession.on('streamDestroyed', (event) => {
        set(state => ({
          subscribers: state.subscribers.filter(sub => sub !== event.stream.streamManager)
        }));
      });
      
      const token = await get().getToken();
      await mySession.connect(token, { clientData });
      
      const publisher = await OV.initPublisherAsync(undefined, {
        audioSource: undefined,
        videoSource: undefined,
        publishAudio: true,
        publishVideo: true,
        resolution: '640x480',
        frameRate: 30,
        insertMode: 'APPEND',
        mirror: false
      });
      
      mySession.publish(publisher);
      
      set({
        session: mySession,
        mainStreamManager: publisher,
        publisher: publisher,
        showVideoCall: true
      });
      
    } catch (error) {
      console.error('세션 참여 중 오류 발생:', error);
      set({ error: '화상 통화 연결 중 오류가 발생했습니다.' });
    }
  },
  
  leaveSession: () => {
    const { session } = get();
    if (session) {
      session.disconnect();
    }
    
    set({
      session: undefined,
      subscribers: [],
      mainStreamManager: undefined,
      publisher: undefined,
      showVideoCall: false
    });
  },
  
  // 토큰 가져오기 함수
  getToken: async () => {
    const sessionId = 'mallang-session';
    
    try {
      const sessionResponse = await get().createSession(sessionId);
      const tokenResponse = await get().createToken(sessionResponse);
      return tokenResponse;
    } catch (error) {
      console.error('토큰 가져오기 오류:', error);
      throw error;
    }
  },
  
  createSession: async (sessionId) => {
    try {
      const response = await axios.post(
        `${OPENVIDU_SERVER_URL}/openvidu/api/sessions`,
        { customSessionId: sessionId },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${btoa('OPENVIDUAPP:' + OPENVIDU_SERVER_SECRET)}`,
          },
        }
      );
      
      return response.data.id;
    } catch (error) {
      if (error.response && error.response.status === 409) {
        // 세션이 이미 존재하면 해당 sessionId 반환
        return sessionId;
      }
      throw error;
    }
  },
  
  createToken: async (sessionId) => {
    const response = await axios.post(
      `${OPENVIDU_SERVER_URL}/openvidu/api/sessions/${sessionId}/connection`,
      {},
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${btoa(`OPENVIDUAPP:${OPENVIDU_SERVER_SECRET}`)}`,
        },
      }
    );
    
    return response.data.token;
  },
  
  // 음성 인식 관련 함수들
  toggleSpeechRecognition: () => {
    const { isRecording } = get();
    if (isRecording) {
      get().stopSpeechRecognition();
    } else {
      get().startSpeechRecognition();
    }
  },
  
  startSpeechRecognition: () => {
    // 음성 인식 시작 로직
    set({ isRecording: true });
  },
  
  stopSpeechRecognition: () => {
    // 음성 인식 중지 로직
    set({ isRecording: false });
  },
  
  speakText: (text) => {
    if (!text || !('speechSynthesis' in window)) {
        return;
      }
      
      // 기존 음성 출력 중지
      window.speechSynthesis.cancel();
      
      // 새 음성 출력 생성
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ko-KR';
      
      // 음성 출력 시작
      window.speechSynthesis.speak(utterance);
  }
}));

export default useOpenViduStore;
