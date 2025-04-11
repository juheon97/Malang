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

const counselOpenViduApi = {
  // 세션 종료 (클로저 내부에서 참조할 수 있도록 선언)
  closeSession: async (counselorCode) => {
    if (!counselorCode) {
      console.error('❌ counselorCode가 undefined입니다!');
      throw new Error('counselorCode가 없습니다.');
    }
    
    try {
      const response = await apiClient.delete(`/openvidu/session/${counselorCode}`);
      console.log('세션 종료 성공:', response.data);
      return response.data;
    } catch (error) {
      // 404 오류(세션이 없음)는 정상적인 상황일 수 있으므로 특별 처리
      if (error.response && error.response.status === 404) {
        console.log(`세션 ${counselorCode}는 이미 존재하지 않습니다.`);
        return { message: '세션이 이미 종료되었습니다.' };
      }
      console.error('세션 종료 오류:', error.response?.data || error.message);
      throw error;
    }
  },

  // 세션 생성 (Path variable 사용)
  createSession: async (counselorCode) => {
    console.log('OpenVidu 세션 생성 요청 - counselorCode:', counselorCode);
    if (!counselorCode) {
      console.error('❌ counselorCode가 undefined입니다!');
      throw new Error('counselorCode가 없습니다.');
    }
    
    try {
      // 기존 세션 확인 및 정리 시도
      try {
        await counselOpenViduApi.closeSession(String(counselorCode));
        console.log(`기존 세션 ${counselorCode} 정리 완료`);
      } catch (e) {
        // 오류가 발생해도 무시하고 계속 진행 (세션이 없었을 수도 있음)
        console.log(`세션 ${counselorCode} 확인 중: ${e.message}`);
      }
      
      // 새 세션 생성
      const response = await apiClient.post(`/openvidu/session/${counselorCode}`);
      console.log('상담실 세션 생성 완료:', response.data);
      return response.data.sessionId || counselorCode;
    } catch (error) {
      console.error('상담실 세션 생성 오류:', error.response?.data || error.message);
      throw error;
    }
  },

  // 토큰 발급
  getToken: async (counselorCode) => {
    if (!counselorCode) {
      console.error('❌ counselorCode가 undefined입니다!');
      throw new Error('counselorCode가 없습니다.');
    }
    
    try {
      const response = await apiClient.post('/openvidu/session/token', { sessionId: counselorCode });
      console.log('상담실 토큰 발급:', response.data);
      return response.data.token;
    } catch (error) {
      console.error('상담실 토큰 발급 오류:', error.response?.data || error.message);
      throw error;
    }
  },
  
  // 세션 상태 확인
  getSessionStatus: async (counselorCode) => {
    if (!counselorCode) {
      console.error('❌ counselorCode가 undefined입니다!');
      throw new Error('counselorCode가 없습니다.');
    }
    
    try {
      const response = await apiClient.get(`/openvidu/session/${counselorCode}/status`);
      console.log('상담실 세션 상태:', response.data);
      return response.data;
    } catch (error) {
      console.error('상담실 세션 상태 확인 오류:', error.response?.data || error.message);
      throw error;
    }
  },
  
  // 세션 연결 강제 종료
  forceDisconnect: async (counselorCode, connectionId) => {
    if (!counselorCode || !connectionId) {
      console.error('❌ counselorCode 또는 connectionId가 undefined입니다!');
      throw new Error('counselorCode와 connectionId가 필요합니다.');
    }
    
    try {
      const response = await apiClient.delete(`/openvidu/session/${counselorCode}/connection/${connectionId}`);
      console.log('상담실 연결 강제 종료 성공:', response.data);
      return response.data;
    } catch (error) {
      console.error('상담실 연결 강제 종료 오류:', error.response?.data || error.message);
      throw error;
    }
  }
};
     
export default counselOpenViduApi;