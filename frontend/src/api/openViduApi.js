// src>api>communityApi.js
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL;
// axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: BASE_URL,
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
  createSession: async () => {
    try {
      const response = await apiClient.post('channels/counsel', {});
      return response.data.sessionId;
    } catch (error) {
      console.error('세션 생성 오류:', error);
      throw error;
    }
  },

  // 토큰 발급 API
  getToken: async sessionId => {
    try {
      const response = await apiClient.post('openvidu/token', { sessionId });
      return response.data.token;
    } catch (error) {
      console.error('토큰 발급 오류:', error);
      throw error;
    }
  },
};

export default openviduApi;
