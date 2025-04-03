import axios from 'axios';
import openviduApi from './openViduApi';
// API 기본 URL 설정
// const BASE_URL = 'https://j12d110.p.ssafy.io/api';
// const BASE_URL = 'https://10c0-116-36-40-48.ngrok-free.app/api';
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

// const APPLICATION_SERVER_URL =
//   import.meta.env.REACT_APP_API_URL || 'http://localhost:5000';

const voiceChannelApi = {
  // 채널 생성 API
  createChannel: async channelData => {
    try {
      // 1. 채널 생성 요청
      const response = await apiClient.post('/channels/voice', channelData);
      console.log('2. response부름. voiceChannelApi 채널 ID :', response.data.channelId)
      return response; // 전체 response 객체를 반환
    } catch (error) {
      console.error('채널 생성 오류:', error);
      throw error; // 에러를 다시 throw하여 호출자에게 전달
    }


  // 채널 나가기 API
  },
  leaveChannel: async channelId => {
    try {
      const response = await apiClient.post(`channels/${channelId}/leave`);
      return response.data;
    } catch (error) {
      console.error('채널 나가기 오류:', error);
      throw error;
    }
  },

  listChannels: async () => {
    try {
      const response = await apiClient.get('/channels/voice');
      console.log('API 응답 데이터:', response.data); // 응답 데이터 출력
      return response.data;
    } catch (error) {
      console.error('채널 목록 오류:', error);
      throw error;
    }
  },
  // 채널 비밀번호 확인 함수
  checkChannelPassword: async (channelId, password) => {
    // 요청 데이터 확인
    console.log('API 요청 데이터:', { channelId, password });
    try {
      const response = await apiClient.post(
        `/channels/voice/${channelId}/password-check`,
        { password },
      );
      console.log('API 응답 데이터:', response.data); // 응답 데이터 출력
      return response.data.isPasswordCorrect;
    } catch (error) {
      console.error('Password check failed:', error);

      // 에러 응답에 따른 처리
      if (error.response && error.response.data) {
        const { errorCode } = error.response.data;

        switch (errorCode) {
          case 'S0001':
            throw new Error('잘못된 요청입니다.');
          case 'S0002':
            throw new Error('인증이 필요합니다.');
          case 'S0003':
            throw new Error('접근이 거부되었습니다.');
          case 'S0005':
            throw new Error('서버 내부 오류가 발생했습니다.');
          default:
            throw new Error('알 수 없는 오류가 발생했습니다.');
        }
      }

      throw error;
    }
  },
  
};

export default voiceChannelApi;
