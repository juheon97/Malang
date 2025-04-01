import React, { useState, useRef, useEffect } from 'react';
import voiceChangeApi from '../api/voiceChangeApi';

const VoiceChange = () => {
  const [transcribedText, setTranscribedText] = useState('안녕하세요, 만나서 반갑습니다.');
  const [isRecording, setIsRecording] = useState(false);
  const [isAccessibleMode, setIsAccessibleMode] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [improvedAudioUrl, setImprovedAudioUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000, // 16kHz 샘플링 레이트 (STT에 적합)
          channelCount: 1,   // 모노 채널
          echoCancellation: true,
          noiseSuppression: true,
        } 
      });
      
      // WAV 형식으로 녹음 (대부분의 브라우저에서 지원)
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm', // 대부분의 브라우저에서 지원하는 형식
      });
      
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.addEventListener('dataavailable', (event) => {
        audioChunksRef.current.push(event.data);
      });
      
      mediaRecorderRef.current.addEventListener('stop', async () => {
        // 녹음된 오디오를 WAV 형식으로 변환
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        
        setIsLoading(true);
        try {
          // API를 통해 WAV 파일을 텍스트로 변환
          const result = await voiceChangeApi.convertSpeechToText(audioBlob);
          
          console.log('STT 응답:', result); // 응답 로깅
          
          // 응답이 빈 객체가 아니고 텍스트가 있는 경우
          if (result && Object.keys(result).length > 0) {
            setTranscribedText(result);
          } else {
            console.warn('STT 응답이 비어있습니다:', result);
            setTranscribedText('음성을 인식하지 못했습니다. 다시 시도해주세요.');
          }
        } catch (error) {
          console.error('음성 변환 처리 오류:', error);
          setTranscribedText('음성 변환 중 오류가 발생했습니다. 다시 시도해주세요.');
        } finally {
          setIsLoading(false);
        }
      });
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('녹음 시작 오류:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // 스트림 트랙 중지
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const regenerateWithVoice = () => {
    // 텍스트를 음성으로 변환하는 로직
    const utterance = new SpeechSynthesisUtterance(transcribedText);
    utterance.lang = 'ko-KR';
    window.speechSynthesis.speak(utterance);
  };

  const playAudio = () => {
    // 녹음된 오디오 재생
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play();
    }
  };

  // 컴포넌트 언마운트 시 리소스 정리
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      if (improvedAudioUrl) {
        URL.revokeObjectURL(improvedAudioUrl);
      }
    };
  }, [audioUrl, improvedAudioUrl]);

  const pageStyle = {
    backgroundImage: `
        radial-gradient(circle at 5% -2%, rgba(121, 231, 183, 0.2) 0%, rgba(255, 255, 255, 0) 4%),
        radial-gradient(circle at 0% 4%, rgba(233, 230, 47, 0.16) 0%, rgba(255, 255, 255, 0) 5%),
        radial-gradient(circle at 80% 3%, rgba(8, 151, 110, 0.1) 0%, rgba(255, 255, 255, 0) 25%),
        radial-gradient(circle at 6% 95%, rgba(249, 200, 255, 0.52) 0%, rgba(255, 255, 255, 0) 20%)
      `,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  };

  return (
    <div className="bg-gradient-to-b from-[#EAF2EE] to-[#C6E1D8] rounded-lg p-6 max-w-4xl mt-12 mx-auto font-sans">
      <div className="flex items-center mb-6 relative z-10">
        <div
          className="w-1 h-8 bg-gradient-to-b from-green-400 to-green-600 mr-3 rounded-full shadow-md"
          aria-hidden={isAccessibleMode ? 'true' : undefined}
        ></div>
        <h1
          style={{ fontFamily: "'HancomMalangMalang-Regular', sans-serif" }}
          className="text-2xl font-bold text-green-600 relative"
          tabIndex={isAccessibleMode ? '0' : undefined}
        >
          음성 정확도 높이기
        </h1>
      </div>

      <div className="flex gap-6 ">
        <div
          className="flex-grow bg-white rounded-lg p-6 flex flex-col items-center justify-center"
          style={pageStyle}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-20 h-20 text-[#55BCA4] mb-4"
          >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M9 2m0 3a3 3 0 0 1 3 -3h0a3 3 0 0 1 3 3v5a3 3 0 0 1 -3 3h0a3 3 0 0 1 -3 -3z" />
            <path d="M5 10a7 7 0 0 0 14 0" />
            <path d="M8 21l8 0" />
            <path d="M12 17l0 4" />
          </svg>
          <p className="text-[#878282] font-base mb-6">
            마이크를 누른 후 말해주세요.
          </p>
          <button
            className={`px-6 py-2 rounded-full transition duration-300 ${
              isRecording
                ? 'bg-red-600 text-white'
                : 'bg-[#55BCA4] text-white hover:bg-[#55BCA6]'
            }`}
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isLoading}
          >
            {isRecording ? '녹음 중지' : '녹음 시작'}
          </button>
        </div>

        <div className="flex-shrink-0 w-2/5 space-y-4 rounded-xl p-6 shadow-lg bg-[#EEEEEE]">
          <div className="w-full bg-[#98D5B0] text-white py-3 rounded-xl font-semibold shadow-lg text-lg flex justify-center items-center">
            변환된 텍스트
          </div>
          <div className="bg-[#F8F8F8] rounded-lg p-4 min-h-[100px] shadow-lg text-[#878282] font-semibold">
            {isLoading ? (
              <div className="flex justify-center items-center h-full">
                <p>변환 중...</p>
              </div>
            ) : (
              <p>{transcribedText}</p>
            )}
          </div>
          <div
            className="w-full bg-[#98D5B0] text-white py-3 rounded-xl font-semibold shadow-lg text-lg flex justify-center items-center cursor-pointer"
            onClick={regenerateWithVoice}
          >
            음성으로 재생하기
          </div>
          <div className="bg-white rounded-lg p-4 flex justify-center shadow-lg">
            <button
              className="w-13 h-13 bg-[#55BCA4] rounded-full flex items-center justify-center m-3"
              onClick={playAudio}
              disabled={!audioUrl || isLoading}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 26 26"
                className="w-10 h-10"
              >
                <circle cx="13" cy="13" r="13" fill="#55BCA4" />
                <path d="M10,7 L19,13 L10,19 Z" fill="white" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceChange;
