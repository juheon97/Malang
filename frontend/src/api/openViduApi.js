// src>api>openViduApi.js
import axios from 'axios';

// API 기본 URL 설정
// const BASE_URL = 'https://J12D110.p.ssafy.io/api';
//const BASE_URL = 'https://10c0-116-36-40-48.ngrok-free.app/api';
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
  createSession: async (channelId) => {
    try {
      //const response = await apiClient.post('channels/counsel', {});
      const response = await apiClient.post('openvidu/session', {
        customSessionId: channelId
      });
        return response.data.sessionId;
    } catch (error) {
      console.error('세션 생성 오류:', error);
      throw error;
    }
  },

  // 토큰 발급 API
  getToken: async (sessionId) => {
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

// // api/openviduApi.js
// import axios from 'axios';

// // 요청 보낼 곳... 백엔드 주소소
// const APPLICATION_SERVER_URL =
//   import.meta.env.REACT_APP_API_URL || 'http://localhost:5000';

// const openviduApi = {
//   // 세션 생성 API
//   // 세션 만들어달라고 백엔드에 요청하는 코드
//   createSession: async () => {
//     const token = sessionStorage.getItem('token');
//     if (!token) throw new Error('인증 토큰이 없습니다.');

//     const response = await axios.post(
//       `${APPLICATION_SERVER_URL}/api/create/talkChannel`,
//       // 이것도 백엔드 주소로 바꿔야 할 것 같다. => ok
//       {},
//       {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           'Content-Type': 'application/json',
//         },
//         // 헤더에 이것(토큰값)만 넣어서 요청하면 되는건가? 세션 만들어 달라?
//       },
//     );

//     return response.data.sessionId;
//     // 세션 아이디가 돌아오게 되는 건가? 응답받는 data 안에 sessionId로 들어오는건가? 이걸 openvidu랑 backend랑 맞추는 게 낫나?
//   },

//   // 토큰 발급 API
//   // 토큰을 만들어달라고 백엔드에 요청하는 코드
//   getToken: async sessionId => {
//     const token = sessionStorage.getItem('token');
//     if (!token) throw new Error('인증 토큰이 없습니다.');

//     const response = await axios.post(
//       `${APPLICATION_SERVER_URL}/api/openvidu/token`,
//       // 이것도 우리 백엔드 주소로.. 넣어야 할 듯?
//       { sessionId }, // 세션아이디를 넣어서 보내는 건가?
//       {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           'Content-Type': 'application/json',
//         },
//       },
//     );

//     return response.data.token;
//     // 여기서 받는 토큰은 openvidu 접속할 수 있는 토큰인가?
//   },
// };

// export default openviduApi;
