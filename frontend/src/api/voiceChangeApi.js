import axios from 'axios';

const voiceChangeApi = {
  // 음성 AI 서비스 상태 확인
  checkServiceHealth: async () => {
    return { status: 'ok' }; // 백엔드가 없으므로 항상 OK 반환
  },

  // 오디오 파일을 Whisper API를 사용하여 텍스트로 변환
  convertSpeechToText: async audioBlob => {
    try {
      const formData = new FormData();
      formData.append('file', audioBlob, 'recording.webm');
      formData.append('model', 'whisper-1');

      const response = await axios.post(
        'https://api.openai.com/v1/audio/transcriptions',
        formData,
        {
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_WHISPER_API_KEY}`,
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      console.log('Whisper API 응답:', response.data);
      return response.data;
    } catch (error) {
      console.error('Whisper 음성 변환 오류:', error);
      throw error;
    }
  },
};

export default voiceChangeApi;
