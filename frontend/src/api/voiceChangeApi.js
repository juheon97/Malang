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

const voiceChangeApi = {
   // 음성 AI 서비스 상태 확인
   checkServiceHealth: async () => {
    try {
      const response = await apiClient.get('/speech/health');
      return response.data;
    } catch (error) {
      console.error('서비스 상태 확인 오류:', error);
      throw error; // 에러를 그대로 던져서 호출하는 쪽에서 처리하도록 함
    }
  },
  
  // WAV 오디오 파일을 텍스트로 변환
  convertSpeechToText: async (audioBlob) => {
    try {
      const formData = new FormData();
      formData.append('file', audioBlob, 'recording.webm');
      
      const response = await apiClient.post('/speech/stt', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });
      console.log(response)
      return response.data;
    } catch (error) {
      console.error('음성 변환 오류:', error);
      throw error;
    }
  }
};
  
export default voiceChangeApi;