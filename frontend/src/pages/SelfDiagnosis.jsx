// components/selfdiagnosis/SelfDiagnosis.js
import React, { useState, useRef, useEffect } from 'react';
import SelfApi from '../api/SelfApi';
import '../styles/fonts.css';
import toWav from 'audiobuffer-to-wav';
import NormalResult from '../components/selfdiagnosis/NormalResult';
import AbnormalResult from '../components/selfdiagnosis/AbnormalResult'; // 경로는 실제 파일 위치에 맞게 조정

const SelfDiagnosis = () => {
  const [transcribedText, setTranscribedText] = useState('여기에 자가 진단 결과가 표시됩니다.');
  const [isRecording, setIsRecording] = useState(false);
  const [isAccessibleMode, setIsAccessibleMode] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [improvedAudioUrl, setImprovedAudioUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [buttonTimer, setButtonTimer] = useState(0);
  const [resultData, setResultData] = useState(null); // 분석 결과 데이터 저장
  const [serviceStatus, setServiceStatus] = useState({
    isAvailable: false,
    message: "서비스 상태 확인 중...",
    checking: true
  });
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  
  const isAbnormalResult = (data) => {
    if (!data || typeof data !== 'string') return false;
    
    console.log("확인할 데이터:", data); // 디버깅용
    
    // 정규식 개선: 소수점 이하 자릿수가 다양한 형식을 처리
    const match = data.match(/뇌 질환:\s*([\d.]+)%/);
    if (!match) return false;
    
    const abnormalProbability = parseFloat(match[1]);
    console.log("뇌 질환 확률:", abnormalProbability); // 디버깅용
    
    // 99% 이상일 때 비정상으로 판단
    return abnormalProbability >= 95;
  };

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
  
  // 타이머 관련 useEffect
  useEffect(() => {
    if (isButtonDisabled && buttonTimer > 0) {
      timerRef.current = setTimeout(() => {
        setButtonTimer((prev) => prev - 1);
      }, 1000);
    } else if (buttonTimer === 0 && isButtonDisabled) {
      setIsButtonDisabled(false);
    }
    
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isButtonDisabled, buttonTimer]);
  
  // WebM을 WAV로 변환하는 함수
  const convertToWav = async (webmBlob) => {
    const audioContext = new (window.AudioContext || window.AudioContext)();
    const arrayBuffer = await webmBlob.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    const wavBuffer = toWav(audioBuffer);
    const wavBlob = new Blob([wavBuffer], { type: 'audio/wav' });
    return wavBlob;
  };
  
  const startRecording = async () => {
    if (!serviceStatus.isAvailable) {
      alert("현재 AI 자가 진단 서비스를 이용할 수 없습니다. 잠시 후 다시 시도해주세요.");
      return;
    }
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        } 
      });
      
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm',
      });
      
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.addEventListener('dataavailable', (event) => {
        audioChunksRef.current.push(event.data);
      });
      
      mediaRecorderRef.current.addEventListener('stop', async () => {
        const webmBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      
        try {
          const url = URL.createObjectURL(webmBlob);
          setAudioUrl(url);
          console.log('녹음된 파일 타입:', webmBlob.type);
          setIsLoading(true);
          setResultData(null); // 결과 초기화
      
          try {
            const wavBlob = await convertToWav(webmBlob);
            console.log('변환된 WAV 파일 타입:', wavBlob.type);
            
            const wavUrl = URL.createObjectURL(wavBlob);
            setAudioUrl(wavUrl);
            
            const result = await SelfApi.convertSpeechToText(wavBlob);
            console.log('STT 응답:', result);
      
            if (result && typeof result === 'string') {
              setTranscribedText(result);
              setResultData(result); // 결과 데이터 저장
            } else if (result && result.data) {
              // API 응답이 {data: "정상: 0.1%, 뇌 질환: 99.9%"} 형태인 경우
              setTranscribedText(result.data);
              setResultData(result.data);
            } else {
              console.warn('STT 응답이 비어있습니다:', result);
              setTranscribedText('음성을 인식하지 못했습니다. 다시 시도해주세요.');
              setResultData(null);
            }
          } catch (error) {
            console.error('음성 변환 처리 오류:', error);
            setTranscribedText('주위 환경이 너무 시끄럽습니다. 조용한 환경에서 다시 시도해주세요.');
            setResultData(null);
          } finally {
            setIsLoading(false);
          }
        } catch (error) {
          console.error('오디오 처리 오류:', error);
          setIsLoading(false);
          setTranscribedText('오디오 처리 중 오류가 발생했습니다. 다시 시도해주세요.');
          setResultData(null);
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
      
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      
      setIsButtonDisabled(true);
      setButtonTimer(10);
    }
  };

  const regenerateWithVoice = () => {
    const textToSpeak = typeof transcribedText === 'object' 
      ? JSON.stringify(transcribedText) 
      : transcribedText;
    
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = 'ko-KR';
    window.speechSynthesis.speak(utterance);
  };

  const playAudio = () => {
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

  // 결과 표시 컴포넌트 선택
  const renderResultComponent = () => {
    if (isLoading) {
      return (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="border-b border-gray-200">
            <div className="px-6 py-4">
              <h2 className="text-xl font-semibold text-gray-800">분석 결과</h2>
            </div>
          </div>
          <div className="p-6">
            <div className="flex justify-center items-center min-h-[150px]">
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mb-4"></div>
                <p>음성 분석 중...</p>
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    // renderResultComponent 함수 내부
if (resultData) {
  const abnormal = isAbnormalResult(resultData);
  console.log("결과가 비정상인가?", abnormal);
  
  if (abnormal) {
    return (
      <AbnormalResult 
        data={resultData}
        audioUrl={audioUrl}
        playAudio={playAudio}
        regenerateWithVoice={regenerateWithVoice}
      />
    );
  } else {
    return (
      <NormalResult 
        data={resultData}
        audioUrl={audioUrl}
        playAudio={playAudio}
        regenerateWithVoice={regenerateWithVoice}
      />
    );
  }
}
    
    // 기본 안내 화면
    return (
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="border-b border-gray-200">
          <div className="px-6 py-4">
            <h2 className="text-xl font-semibold text-gray-800">분석 결과</h2>
          </div>
        </div>
        <div className="p-6">
          <div className="bg-[#F8F8F8] rounded-lg p-4 min-h-[150px] border border-gray-200">
            <p className="text-gray-700 text-center">
              녹음 버튼을 눌러 말하면 AI가 음성을 분석하여 결과를 표시합니다.
            </p>
          </div>
        </div>
      </div>
    );
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
  
          {/* 오른쪽 메인 콘텐츠 - 결과 컴포넌트 */}
          <div className="md:col-span-2">
            {renderResultComponent()}
            
            {/* 추가 정보 섹션 */}
            <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">자가 진단 도움말</h2>
              <ul className="list-disc pl-5 text-gray-700 space-y-2">
                <li>조용한 환경에서 녹음하면 더 정확한 결과를 얻을 수 있습니다.</li>
                <li>마이크와 적당한 거리를 유지하고 명확하게 발음해 주세요.</li>
                <li>녹음 후 텍스트 변환에는 몇 초가 소요될 수 있습니다.</li>
                <li>이 자가진단은 전문의의 진단을 대체할 수 없으며, 참고용으로만 사용하세요.</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}  

export default SelfDiagnosis;