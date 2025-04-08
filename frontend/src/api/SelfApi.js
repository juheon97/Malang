import axios from 'axios';

// 새 URL 설정
const BASE_URL = import.meta.env.VITE_API_URL_AI;
// const BASE_URL_SSAFY = import.meta.env.VITE_API_URL
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

const SelfApi = {
  // 음성 AI 서비스 상태 확인
  checkServiceHealth: async () => {
    try {
      const response = await apiClient.get('/health');
      console.log('서비스 상태 응답:', response.data); // 응답 로깅 추가
      return response.data;
    } catch (error) {
      console.error('서비스 상태 확인 오류:', error);
      throw error; // 에러를 그대로 던져서 호출하는 쪽에서 처리하도록 함
    }
  },

  // WAV 오디오 파일을 텍스트로 변환
  convertSpeechToText: async (audioBlob) => {
    try {
      // Date.now()를 사용하여 밀리초 단위의 타임스탬프로 고유한 파일명 생성
      const uniqueFilename = `record-${Date.now()}.wav`;
      
      // File 객체 생성
      const file = new File([audioBlob], uniqueFilename, { type: "audio/wav" });
      
      console.log('전송하는 파일명:', uniqueFilename);
      console.log('전송하는 파일 크기:', file.size, 'bytes');
      
      const formData = new FormData();
      formData.append('file', file); // KEY값은 'file'로 설정
      
      console.log('POST 요청 전송 중...');
      
      const response = await apiClient.post('/classification', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });
      
      // 응답 로깅 추가
      console.log('API 응답 상태:', response.status);
      console.log('API 응답 헤더:', response.headers);
      console.log('API 응답 데이터:', response.data);
      
      // 응답 데이터 구조 자세히 분석
      if (response.data) {
        if (typeof response.data === 'object') {
          console.log('응답 데이터 객체 키:', Object.keys(response.data));
        } else {
          console.log('응답 데이터 타입:', typeof response.data);
        }
      }
      
      return response.data;
    } catch (error) {
      console.error('음성 변환 오류:', error.message);
      // 오류 응답도 상세히 로깅
      if (error.response) {
        console.error('오류 응답 상태:', error.response.status);
        console.error('오류 응답 데이터:', error.response.data);
      } else if (error.request) {
        console.error('요청은 전송되었으나 응답이 없음:', error.request);
      }
      throw error;
    }
  }
};

export default SelfApi;