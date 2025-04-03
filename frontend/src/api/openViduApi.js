// src/api/openViduApi.js
import axios from 'axios';

// const BASE_URL = import.meta.env.VITE_API_URL; //  https://j12d110.p.ssafy.io:8443/openvidu

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
      console.log('요청 헤더:', config.headers); // 디버깅용
    } else {
      console.log('토큰이 없습니다!');
    }
    return config;
  },
  error => Promise.reject(error),
);

const openviduApi = {

  // 세션 생성 (Path variable 사용)
  createSession: async (channelId) => {
    console.log('OpenVidu 세션 생성 요청 - channelId:', channelId); // ✅ 로그 추가
    if (!channelId) {
        console.error('❌ channelId가 undefined입니다!');
        throw new Error('channelId가 없습니다.');
    }
    try {
      const response = await apiClient.post(`/openvidu/session/${channelId}`);
      console.log('방생성 후 createsession 하고 난 뒤', response.data)
      return response.data.sessionId;
     
                    
    } catch (error) {
      console.error('방 생성 후 creatssition 안 됨 세션 생성 오류:', error.response?.data || error.message);
      throw error;
    }
  },


  // 토큰 발급 (엔드포인트 경로 수정)
  getToken: async (sessionId) => {
    try {
      const response = await apiClient.post('/openvidu/session/token', { sessionId });
      console.log('토큰 코너', response.data)
      return response.data.token; // {"token": "wss_YnJ3cHZ..."}
    } catch (error) {
      console.error('토큰 발급 오류:', error.response?.data || error.message);
      throw error;
    }
  }
};
     
export default openviduApi;
