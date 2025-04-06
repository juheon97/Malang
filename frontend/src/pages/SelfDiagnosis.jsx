import React, { useState, useRef, useEffect } from 'react';
import SelfApi from '../api/SelfApi';
import '../styles/fonts.css';
import toWav from 'audiobuffer-to-wav';

const SelfDiagnosis = () => {
  const [transcribedText, setTranscribedText] = useState('여기에 자가 진단 결과가 표시됩니다.');
  const [isRecording, setIsRecording] = useState(false);
  const [isAccessibleMode, setIsAccessibleMode] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [improvedAudioUrl, setImprovedAudioUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false); // 버튼 비활성화 상태 추가
  const [buttonTimer, setButtonTimer] = useState(0); // 타이머 카운트다운 상태 추가
  const [serviceStatus, setServiceStatus] = useState({
    isAvailable: false,
    message: "서비스 상태 확인 중...",
    checking: true
  });
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null); // 타이머 참조 추가
  
  // 컴포넌트 마운트 시 서비스 상태 확인
  useEffect(() => {
    const checkServiceHealth = async () => {
      try {
        const healthData = await SelfApi.checkServiceHealth();
        setServiceStatus({
          isAvailable: healthData.status === "ok",
          message: healthData.status === "ok" 
            ? "AI 자가 진단 서비스 이용 가능" 
            : healthData.message || "AI 자가 진단 서비스 이용 불가",
          checking: false
        });
      } catch (error) {
        setServiceStatus({
          isAvailable: false,
          checking: false
        });
      }
    };

    checkServiceHealth();
    
    // 30초마다 서비스 상태 확인
    const intervalId = setInterval(checkServiceHealth, 30000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  // 타이머 관련 useEffect 추가
  useEffect(() => {
    // 버튼이 비활성화 상태이고 타이머가 0보다 크면 타이머 감소
    if (isButtonDisabled && buttonTimer > 0) {
      timerRef.current = setTimeout(() => {
        setButtonTimer((prev) => prev - 1);
      }, 1000);
    } else if (buttonTimer === 0 && isButtonDisabled) {
      // 타이머가 0이 되면 버튼 활성화
      setIsButtonDisabled(false);
    }
    
    // 컴포넌트 언마운트 시 타이머 정리
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isButtonDisabled, buttonTimer]);
  
  // WebM을 WAV로 변환하는 함수
  const convertToWav = async (webmBlob) => {
    // 오디오 컨텍스트 생성
    const audioContext = new (window.AudioContext || window.AudioContext)();
    
    // Blob을 ArrayBuffer로 변환
    const arrayBuffer = await webmBlob.arrayBuffer();
    
    // ArrayBuffer를 AudioBuffer로 디코딩
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    
    // AudioBuffer를 WAV로 변환 (audiobuffer-to-wav 라이브러리 사용)
    const wavBuffer = toWav(audioBuffer);
    
    // WAV ArrayBuffer를 Blob으로 변환
    const wavBlob = new Blob([wavBuffer], { type: 'audio/wav' });
    
    return wavBlob;
  };
  
  const startRecording = async () => {
    // 서비스가 이용 불가능한 경우 녹음 시작 불가
    if (!serviceStatus.isAvailable) {
      alert("현재 AI 자가 진단 서비스를 이용할 수 없습니다. 잠시 후 다시 시도해주세요.");
      return;
    }
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000, // 16kHz 샘플링 레이트 (STT에 적합)
          channelCount: 1,   // 모노 채널
          echoCancellation: true,
          noiseSuppression: true,
        } 
      });
      
      // WebM 형식으로 녹음 (대부분의 브라우저에서 지원)
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm', // 대부분의 브라우저에서 지원하는 형식
      });
      
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.addEventListener('dataavailable', (event) => {
        audioChunksRef.current.push(event.data);
      });
      
      mediaRecorderRef.current.addEventListener('stop', async () => {
        // webm 형식으로 녹음된 오디오
        const webmBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      
        try {
          // Blob 객체를 URL로 변환하여 재생 가능하도록 설정
          const url = URL.createObjectURL(webmBlob);
          setAudioUrl(url);
      
          console.log('녹음된 파일 타입:', webmBlob.type); // 'audio/webm' 출력
      
          setIsLoading(true);
      
          try {
            // WebM을 WAV로 변환
            const wavBlob = await convertToWav(webmBlob);
            console.log('변환된 WAV 파일 타입:', wavBlob.type); // 'audio/wav' 출력
            
            // WAV 파일을 재생할 수 있는 URL 생성
            const wavUrl = URL.createObjectURL(wavBlob);
            setAudioUrl(wavUrl); // 기존 URL 대체
            
            // API를 통해 wav 파일을 텍스트로 변환
            const result = await SelfApi.convertSpeechToText(wavBlob);
      
            console.log('STT 응답:', result);
      
            if (result && Object.keys(result).length > 0) {
              setTranscribedText(result);
            } else {
              console.warn('STT 응답이 비어있습니다:', result);
              setTranscribedText('음성을 인식하지 못했습니다. 다시 시도해주세요.');
            }
          } catch (error) {
            console.error('음성 변환 처리 오류:', error);
            setTranscribedText('주위 환경이 너무 시끄럽습니다 순화해서 적고 조용한 환경에서 다시 시도해주세요..');
          } finally {
            setIsLoading(false);
          }
        } catch (error) {
          console.error('오디오 처리 오류:', error);
          setIsLoading(false);
          setTranscribedText('오디오 처리 중 오류가 발생했습니다. 다시 시도해주세요.');
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
      
      // 버튼 비활성화 및 타이머 시작 (10초)
      setIsButtonDisabled(true);
      setButtonTimer(10);
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
    <div className="bg-[#F8F8F8] min-h-screen font-sans home-container">
      {/* 헤더 영역 */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <div className="w-1 h-8 bg-gradient-to-b from-green-400 to-green-600 mr-3 rounded-full"></div>
            <h1 className="text-2xl font-bold text-green-600" style={{ fontFamily: "'HancomMalangMalang-Regular', sans-serif" }}>
            뇌신경구음장애(뇌졸중) 자가진단
            </h1>
          </div>
          
          {/* 서비스 상태 표시 */}
          <div className="flex items-center malang-font'">
            <div className={`w-3 h-3 rounded-full mr-2 ${
              serviceStatus.checking 
                ? 'bg-yellow-400' 
                : (serviceStatus.isAvailable ? 'bg-green-500' : 'bg-red-500')
            }`}></div>
            <span className="text-sm text-gray-600">{serviceStatus.checking 
              ? '상태 확인 중...' 
              : (serviceStatus.isAvailable ? '서비스 이용 가능' : '서비스 이용 불가')
            }</span>
          </div>
        </div>
      </header>
  
      {/* 메인 콘텐츠 */}
      <main className="max-w-6xl mx-auto p-4 mt-6 malang-font">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 왼쪽 사이드바 - 녹음 기능 */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">자가진단하기</h2>
              <div className="flex flex-col items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24" height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-16 h-16 text-[#55BCA4] mb-4"
                >
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <path d="M9 2m0 3a3 3 0 0 1 3 -3h0a3 3 0 0 1 3 3v5a3 3 0 0 1 -3 3h0a3 3 0 0 1 -3 -3z" />
                  <path d="M5 10a7 7 0 0 0 14 0" />
                  <path d="M8 21l8 0" />
                  <path d="M12 17l0 4" />
                </svg>
                <p className="text-gray-600 mb-6 text-center">
                 녹음 시작 버튼을 누른 후 말해주세요.
                </p>
                {!serviceStatus.isAvailable && !serviceStatus.checking && (
                  <div className="text-red-500 text-center mb-4 p-2 bg-red-50 rounded-lg w-full">
                    <p>현재 AI 음성 인식 서비스를 <br />이용할 수 없습니다.</p>
                    <p className="text-sm mt-1">{serviceStatus.message}</p>
                  </div>
                )}
                <button
                  className={`w-full py-3 rounded-lg transition duration-300 ${
                    isRecording
                      ? 'bg-red-600 text-white'
                      : isButtonDisabled
                        ? 'bg-gray-400 text-white cursor-not-allowed'
                        : serviceStatus.isAvailable 
                          ? 'bg-[#55BCA4] text-white hover:bg-[#55BCA6]'
                          : 'bg-gray-400 text-white cursor-not-allowed'
                  }`}
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={isLoading || isButtonDisabled || !serviceStatus.isAvailable || serviceStatus.checking}
                >
                  {isRecording 
                    ? '녹음 중지' 
                    : isButtonDisabled 
                      ? `${buttonTimer}초 후 재시도` 
                      : '녹음 시작'}
                </button>
              </div>
            </div>
          </div>
  
          {/* 오른쪽 메인 콘텐츠 - 변환된 텍스트 및 재생 */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="border-b border-gray-200">
                <div className="px-6 py-4">
                  <h2 className="text-xl font-semibold text-gray-800">분석 결과</h2>
                </div>
              </div>
              <div className="p-6">
                <div className="bg-[#F8F8F8] rounded-lg p-4 min-h-[150px] border border-gray-200">
                  {isLoading ? (
                    <div className="flex justify-center items-center h-full">
                      <p>변환 중...</p>
                    </div>
                  ) : (
                    <div className="text-gray-700">
                      {typeof transcribedText === 'object' ? (
                        <div>
                          <p className="font-bold text-lg mb-2">진단 결과:</p>
                          <ul className="space-y-2">
                            {Object.entries(transcribedText).map(([key, value]) => (
                              <li key={key} className="flex justify-between border-b pb-1">
                                <span>{key}:</span> 
                                <span className="font-medium">{value}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : (
                        <p>{transcribedText}</p>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="mt-6 flex items-center justify-between">
                  <div className="flex items-center">
                    <button
                      className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        !isLoading ? 'bg-[#55BCA4] hover:bg-[#4AA090]' : 'bg-gray-400 cursor-not-allowed'
                      }`}
                      onClick={regenerateWithVoice}
                      disabled={isLoading}
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
                    <span className="ml-3 text-gray-700">음성으로 재생하기</span>
                  </div>
                  
                  {audioUrl && (
                    <div className="flex items-center">
                      <span className="text-gray-700 mr-3">원본 녹음 듣기</span>
                      <button
                        className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                        onClick={playAudio}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                          <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"></path>
                          <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                          <line x1="12" y1="19" x2="12" y2="22"></line>
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* 추가 정보 섹션 */}
            <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">자가 진단 도움말</h2>
              <ul className="list-disc pl-5 text-gray-700 space-y-2">
                <li>조용한 환경에서 녹음하면 더 정확한 결과를 얻을 수 있습니다.</li>
                <li>마이크와 적당한 거리를 유지하고 명확하게 발음해 주세요.</li>
                <li>녹음 후 텍스트 변환에는 몇 초가 소요될 수 있습니다.</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}  

export default SelfDiagnosis;