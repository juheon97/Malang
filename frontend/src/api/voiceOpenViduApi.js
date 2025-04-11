import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL;
const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터 설정 - 토큰 추가
apiClient.interceptors.request.use(
  config => {
    // localStorage와 sessionStorage 모두 확인
    const token =
      localStorage.getItem('accessToken') || sessionStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
      console.log('요청 헤더:', config.headers); 
    } else {
      console.log('토큰이 없습니다!');
    }
    return config;
  },
  error => Promise.reject(error),
);

const voiceOpenViduApi = {
  // 세션 종료 (클로저 내부에서 참조할 수 있도록 선언)
  closeSession: async (sessionId) => {
    if (!sessionId) {
      console.error('❌ sessionId가 undefined입니다!');
      throw new Error('sessionId가 없습니다.');
    }
  },

  // 세션 생성 (Path variable 사용)
  createSession: async (channelId) => {
    
    console.log('OpenVidu 세션 생성 요청 - channelId:', channelId);
    if (!channelId) {
      console.error('❌ channelId가 undefined입니다!');
      throw new Error('channelId가 없습니다.');
    }
    
    try {
      // 기존 세션 확인 및 정리 시도
      try {
        await voiceOpenViduApi.closeSession(String(channelId));
        console.log(`기존 세션 ${channelId} 정리 완료`);
      } catch (e) {
        // 오류가 발생해도 무시하고 계속 진행 (세션이 없었을 수도 있음)
        console.log(`세션 ${channelId} 확인 중: ${e.message}`);
      }
      
      // 새 세션 생성
      const response = await apiClient.post(`/openvidu/session/${channelId}`);
      console.log('방생성 후 createsession 하고 난 뒤', response.data);
      return response.data.sessionId;
    } catch (error) {
      console.error('방 생성 후 createsession 안 됨 세션 생성 오류:', error.response?.data || error.message);
      throw error;
    }
  },

  // 토큰 발급
  getToken: async (sessionId) => {
    if (!sessionId) {
      console.error('❌ sessionId가 undefined입니다!');
      throw new Error('sessionId가 없습니다.');
    }
    
    try {
      const response = await apiClient.post('/openvidu/session/token', { sessionId });
      console.log('토큰 코너', response.data);
      return response.data.token;
    } catch (error) {
      console.error('토큰 발급 오류:', error.response?.data || error.message);
      throw error;
    }
  },
  
  // 세션 상태 확인 (새 기능 추가)
  getSessionStatus: async (sessionId) => {
    if (!sessionId) {
      console.error('❌ sessionId가 undefined입니다!');
      throw new Error('sessionId가 없습니다.');
    }
    
    try {
      const response = await apiClient.get(`/openvidu/session/${sessionId}/status`);
      console.log('세션 상태:', response.data);
      return response.data;
    } catch (error) {
      console.error('세션 상태 확인 오류:', error.response?.data || error.message);
      throw error;
    }
  },
  
  // 세션 연결 강제 종료 (새 기능 추가)
  forceDisconnect: async (sessionId, connectionId) => {
    if (!sessionId || !connectionId) {
      console.error('❌ sessionId 또는 connectionId가 undefined입니다!');
      throw new Error('sessionId와 connectionId가 필요합니다.');
    }
    
    try {
      const response = await apiClient.delete(`/openvidu/session/${sessionId}/connection/${connectionId}`);
      console.log('연결 강제 종료 성공:', response.data);
      return response.data;
    } catch (error) {
      console.error('연결 강제 종료 오류:', error.response?.data || error.message);
      throw error;
    }
  }
};
     
export default voiceOpenViduApi;