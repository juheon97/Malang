// src>api>openViduApi.js
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL;
// axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터 설정 - 토큰 추가
apiClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error),
);

const openviduApi = {
  // 세션 생성 API
  createSession: async channelId => {
    try {
      const response = await apiClient.post(
        'openvidu/session',
        {
          customSessionId: channelId,
        },
        {
          headers: {
            Authorization: `Basic ${btoa('OPENVIDUAPP:lsw')}`,
            'Content-Type': 'application/json',
          },
        },
      );
      return response.data.sessionId;
    } catch (error) {
      console.error('세션 생성 오류:', error);
      throw error;
    }
  },

  // 토큰 발급 API
  getToken: async sessionId => {
    try {
      const response = await apiClient.post(
        'openvidu/token',
        { sessionId },
        {
          headers: {
            'Content-Type': 'application/json',
            // 💡 아래 라인 추가 (URL 인코딩 방지)
            'Accept-Encoding': null, // 명시적으로 null 설정
          },
        },
      );
      return response.data.token;
    } catch (error) {
      console.error('토큰 발급 오류:', error);
      throw error;
    }
  },
};

export default openviduApi;
