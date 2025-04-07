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

const SelfApi = {
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
    // Date.now()를 사용하여 밀리초 단위의 타임스탬프로 고유한 파일명 생성
    const uniqueFilename = `record-${Date.now()}.wav`;
    
    // File 객체 생성
    const file = new File([audioBlob], uniqueFilename, { type: "audio/wav" });
    
    console.log('전송하는 파일명:', uniqueFilename);
    
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiClient.post('/speech/classification', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });
    console.log(response);
    return response.data;
  } catch (error) {
    console.error('음성 변환 오류:', error);
    throw error;
  }
}
};
  
export default SelfApi;