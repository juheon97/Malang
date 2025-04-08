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
      console.log('요청 헤더:', config.headers); // 디버깅용
    } else {
      console.log('토큰이 없습니다!');
    }
    return config;
  },
  error => Promise.reject(error),
);

const counselorHistoryApi = {
  // 상담 기록 조회 API
  getCounselorHistory: async (counselorId) => {
    try {
      // API 문서에 따라 경로 수정 (summary/counselor/{counselorId})
      const response = await apiClient.get(`/summary/counselor/${counselorId}`);
      return response.data;
    } catch (error) {
      console.error('상담 기록 조회 오류:', error);
      throw error; // 에러를 다시 throw하여 호출자에게 전달
    }
  },
};

export default counselorHistoryApi;