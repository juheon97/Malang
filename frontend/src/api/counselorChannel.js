import axios from 'axios';

// API 기본 URL 설정
const BASE_URL = 'https://J12D110.p.ssafy.io/api';

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

// 상담방 관련 API 서비스
const counselorChannel = {
  // 상담방 생성
  createChannel: async channelData => {
    try {
      const response = await apiClient.post('/counselor-channels', channelData);
      return response.data;
    } catch (error) {
      console.error('상담방 생성 오류:', error);
      throw error;
    }
  },

  // 상담방 목록 조회
  getChannels: async (params = {}) => {
    try {
      const response = await apiClient.get('/counselor-channels', { params });
      return response.data;
    } catch (error) {
      console.error('상담방 목록 조회 오류:', error);
      throw error;
    }
  },

  // 상담사 리뷰 조회
  getCounselorReviews: async (counselorId, params = {}) => {
    try {
      const response = await apiClient.get(
        `/counselors/${counselorId}/reviews`,
        { params },
      );
      return response.data;
    } catch (error) {
      console.error('상담사 리뷰 조회 오류:', error);
      throw error;
    }
  },

  // 입장 요청 수락/거절
  approveChannelRequest: async (channelId, requestId, status) => {
    try {
      const response = await apiClient.post(
        `/counselor-channels/${channelId}/approve`,
        {
          status: status, // 'accept' 또는 'reject'
        },
        {
          params: { request_id: requestId },
        },
      );
      return response.data;
    } catch (error) {
      console.error('입장 요청 처리 오류:', error);
      throw error;
    }
  },

  // 상담방 입장
  connectToChannel: async channelId => {
    try {
      const response = await apiClient.post(
        `/counselor-channels/${channelId}/connect`,
      );
      return response.data;
    } catch (error) {
      console.error('상담방 입장 오류:', error);
      throw error;
    }
  },

  // 상담 리뷰 작성
  submitCounselingReview: async (sessionId, reviewData) => {
    try {
      const response = await apiClient.post(`/counseling-review`, reviewData, {
        params: { session_id: sessionId },
      });
      return response.data;
    } catch (error) {
      console.error('상담 리뷰 작성 오류:', error);
      throw error;
    }
  },

  // 채널 입장 요청
  requestChannelEntry: async (channelId, userData) => {
    try {
      // 실제 API 엔드포인트에 맞게 수정 필요
      const response = await apiClient.post(
        `/counselor-channels/${channelId}/request`,
        userData,
      );
      return response.data;
    } catch (error) {
      console.error('상담방 입장 요청 오류:', error);
      throw error;
    }
  },

  // 입장 요청 목록 조회
  getEntryRequests: async channelId => {
    try {
      const response = await apiClient.get(
        `/counselor-channels/${channelId}/requests`,
      );
      return response.data;
    } catch (error) {
      console.error('입장 요청 목록 조회 오류:', error);
      throw error;
    }
  },
};

export default counselorChannel;
