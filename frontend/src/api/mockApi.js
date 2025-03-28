import axios from 'axios';

// 모의 API를 위한 인스턴스 생성
const mockApi = axios.create();

// 요청 인터셉터
mockApi.interceptors.request.use(
  config => {
    console.log('모의 API 요청:', config.url, config.method, config.data);
    return config;
  },
  error => {
    return Promise.reject(error);
  },
);

// 응답 인터셉터
mockApi.interceptors.response.use(
  response => {
    // 실제 응답이 있으면 그대로 반환
    return response;
  },
  error => {
    // 404 에러인 경우 모의 응답 생성
    if (error.response && error.response.status === 404) {
      const url = error.config.url;
      const method = error.config.method;
      const requestData = error.config.data
        ? JSON.parse(error.config.data)
        : {};

      // 모의 응답 생성
      let mockResponse = null;

      // 채널 생성 API
      if (url.includes('/api/create/talkChannel') && method === 'post') {
        mockResponse = {
          status: 'success',
          data: {
            channel_id: `mock-channel-${Date.now()}`,
            user_id: '1',
            channel_name: requestData.channel_name,
            channel_description: requestData.channel_description,
            password: !!requestData.password,
            max_player: requestData.max_player,
            category: 1,
            created_at: new Date().toISOString(),
            sessionId: `mock-session-${Date.now()}`, // OpenVidu 세션 ID 추가
            token: `mock-openvidu-token-${Date.now()}`, // OpenVidu 연결 토큰 추가
          },
        };
      } // mockApi.js 파일의 응답 인터셉터 내부에 추가
      else if (url.match(/\/api\/channels\/.*/) && method === 'get') {
        const channelId = url.split('/channels/')[1];
        mockResponse = {
          status: 'success',
          data: {
            channel_id: channelId,
            channel_name: '모의 채널',
            channel_description: '이것은 모의 채널입니다',
            password: false,
            max_player: 4,
            current_players: 1,
            members: [
              {
                user_id: '1',
                nickname: '사용자1',
                joined_at: new Date().toISOString(),
              },
            ],
            is_owner: true,
            created_at: new Date().toISOString(),
          },
        };
      }

      // OpenVidu 세션 생성 API
      else if (url.includes('/openvidu/api/sessions') && method === 'post') {
        mockResponse = {
          id: requestData.sessionId,
          sessionId: requestData.customSessionId || requestData.sessionId,
          createdAt: new Date().toISOString(),
        };
      }

      // OpenVidu 토큰 생성 API
      else if (
        url.match(/\/api\/openvidu\/sessions\/.*\/connections/) &&
        method === 'post'
      ) {
        const sessionId = url.split('/sessions/')[1].split('/connections')[0];
        mockResponse = {
          id: `mock-connection-${Date.now()}`,
          connectionId: `mock-connection-${Date.now()}`,
          sessionId:
            requestData.customSessionId ||
            requestData.sessionId ||
            `mock-session-${Date.now()}`,
          token: `mock-openvidu-token-${Date.now()}`,
          role: requestData.role || 'PUBLISHER',
          data: requestData.data,
          createdAt: new Date().toISOString(),
        };
      }

      // 모의 응답이 생성되었으면 반환
      if (mockResponse) {
        console.log('모의 API 응답:', mockResponse);
        return Promise.resolve({
          data: mockResponse,
          status: 200,
          statusText: 'OK',
          headers: {},
          config: error.config,
        });
      }
    }

    // 그 외의 경우 에러 그대로 반환
    return Promise.reject(error);
  },
);

// // OpenVidu 세션 생성 API
// if (url.includes('/api/openvidu/sessions') && method === 'post') {
//   mockResponse = {
//     id: requestData.sessionId || `mock-session-${Date.now()}`,
//     sessionId:
//       requestData.customSessionId ||
//       requestData.sessionId ||
//       `mock-session-${Date.now()}`,
//     createdAt: new Date().toISOString(),
//   };
// }

export default mockApi;
