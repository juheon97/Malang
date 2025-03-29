import axios from 'axios';

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
      const response = await apiClient.post('/channels/voice', channelData);
      return response; // 전체 response 객체를 반환
    } catch (error) {
      console.error('채널 생성 오류:', error);
      throw error; // 에러를 다시 throw하여 호출자에게 전달
    }

    // if (!token) throw new Error('인증 토큰이 없습니다.');

    // return axios.post(`${VITE_API_URL}/create/talkChannel`, channelData, {
    //   headers: {
    //     Authorization: `Bearer ${token}`,
    //     'Content-Type': 'application/json',
    //   },
    // });
  },
  // 채널 나가기 API
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
};

export default voiceChannelApi;
