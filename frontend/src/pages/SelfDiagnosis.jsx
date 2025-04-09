// components/selfdiagnosis/SelfDiagnosis.js
import React, { useState, useRef, useEffect } from 'react';
import SelfApi from '../api/SelfApi';
import '../styles/fonts.css';
import toWav from 'audiobuffer-to-wav';
import NormalResult from '../components/selfdiagnosis/NormalResult';
import AbnormalResult from '../components/selfdiagnosis/AbnormalResult'; // 경로는 실제 파일 위치에 맞게 조정

const SelfDiagnosis = () => {
  const speechSynthesisRef = useRef(null);
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
  const [isPlaying, setIsPlaying] = useState(false); // 예시 음성 재생 상태
  const [showExamplePanel, setShowExamplePanel] = useState(true); // 예시 패널 표시 상태
  
  // 최소 녹음 시간 관련 상태 추가
  const [recordingTimer, setRecordingTimer] = useState(0);
  const [minRecordingTime, setMinRecordingTime] = useState(6); // 최소 녹음 시간 6초
  const [isMinRecordingTimeElapsed, setIsMinRecordingTimeElapsed] = useState(false);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const recordingTimerRef = useRef(null);
  const exampleAudioRef = useRef(null);
  
  // 페이지 로드/언로드 관련 타임스탬프 저장용 상수
  const TIMER_STORAGE_KEY = 'selfDiagnosis_buttonTimer';
  const TIMER_START_KEY = 'selfDiagnosis_timerStartTime';
  const RESULT_DATA_KEY = 'selfDiagnosis_resultData';
  const AUDIO_URL_KEY = 'selfDiagnosis_audioBlob';
  const SHOW_EXAMPLE_KEY = 'selfDiagnosis_showExample';
  const TRANSCRIBED_TEXT_KEY = 'selfDiagnosis_transcribedText';
  
  // 예시 문장
  const sampleSentence = '나무 아래 메뚜기가 있습니다';
  
  // 컴포넌트 마운트 시 저장된 상태 복원
  useEffect(() => {
    // 서비스 상태 확인
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
    
   // 저장된 타이머 상태 복원 - 수정된 부분
  const storedTimerValue = localStorage.getItem(TIMER_STORAGE_KEY);
  const storedTimerStart = localStorage.getItem(TIMER_START_KEY);
  const storedResultData = localStorage.getItem(RESULT_DATA_KEY);
  
  // 타이머 상태 확인
  if (storedTimerValue && storedTimerStart) {
    const startTime = parseInt(storedTimerStart, 10);
    const originalTimer = parseInt(storedTimerValue, 10);
    const now = Date.now();
    const elapsedSeconds = Math.floor((now - startTime) / 1000);
    
    console.log("경과 시간(초):", elapsedSeconds);
    console.log("원래 타이머 값:", originalTimer);
    
    // 타이머가 아직 남아있으면 복원하고, 아니면 버튼 활성화
    if (elapsedSeconds < originalTimer) {
      // 정확한 남은 시간 계산 (올림이 아닌 내림 사용)
      const remainingTime = Math.max(originalTimer - elapsedSeconds, 0);
      console.log("남은 시간(초):", remainingTime);
      
      setButtonTimer(remainingTime);
      setIsButtonDisabled(true);
      
      // 결과 페이지를 표시하기 위해 showExamplePanel을 false로 설정
      const storedShowExample = localStorage.getItem(SHOW_EXAMPLE_KEY);
      if (storedShowExample === 'false') {
        setShowExamplePanel(false);
      }
      
      // 결과 데이터 복원
      if (storedResultData) {
        try {
          setResultData(JSON.parse(storedResultData));
        } catch (e) {
          console.error('저장된 결과 데이터 파싱 오류:', e);
        }
      }
    } else {
      // 타이머가 끝났으면 모든 스토리지 데이터 제거
      localStorage.removeItem(TIMER_STORAGE_KEY);
      localStorage.removeItem(TIMER_START_KEY);
      localStorage.removeItem(RESULT_DATA_KEY);
      localStorage.removeItem(AUDIO_URL_KEY);
      localStorage.removeItem(TRANSCRIBED_TEXT_KEY);
      localStorage.removeItem(SHOW_EXAMPLE_KEY);
      
      // 타이머가 끝났으면 초기 화면으로 돌아가기
      setShowExamplePanel(true);
      setButtonTimer(0);
      setIsButtonDisabled(false);
      setResultData(null);
    }
  } else {
    // 타이머 정보가 없는 경우: 타이머가 끝났거나 초기 상태
    if (storedResultData) {
      // 타이머가 없고 결과가 있으면: 타이머가 끝났지만 새로고침하지 않은 상태
      // 이 경우 결과 데이터 복원 없이 초기 화면으로 설정
      localStorage.removeItem(RESULT_DATA_KEY);
      localStorage.removeItem(AUDIO_URL_KEY);
      localStorage.removeItem(TRANSCRIBED_TEXT_KEY);
      localStorage.removeItem(SHOW_EXAMPLE_KEY);
      
      setShowExamplePanel(true);
      setResultData(null);
    }
    // 그 외의 경우는 초기 상태이므로 기본값 유지
  }
    
    // 결과 데이터 복원 - 타이머가 살아있는 경우에만
    if ((storedTimerValue && storedTimerStart) || !storedTimerStart) {
      const storedResultData = localStorage.getItem(RESULT_DATA_KEY);
      if (storedResultData) {
        try {
          setResultData(JSON.parse(storedResultData));
        } catch (e) {
          console.error('저장된 결과 데이터 파싱 오류:', e);
        }
      }
    } else {
      // 타이머가 만료되었으면 결과 데이터 제거
      localStorage.removeItem(RESULT_DATA_KEY);
      setResultData(null);
    }
    
    // 음성 URL 복원 (Base64 형태로 저장되었다면) - 타이머가 살아있는 경우에만
    if ((storedTimerValue && storedTimerStart) || !storedTimerStart) {
      const storedAudioData = localStorage.getItem(AUDIO_URL_KEY);
      if (storedAudioData) {
        try {
          // Base64 문자열을 Blob으로 변환하고 URL 생성
          const byteString = atob(storedAudioData.split(',')[1]);
          const mimeString = storedAudioData.split(',')[0].split(':')[1].split(';')[0];
          const ab = new ArrayBuffer(byteString.length);
          const ia = new Uint8Array(ab);
          
          for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
          }
          
          const blob = new Blob([ab], { type: mimeString });
          const url = URL.createObjectURL(blob);
          setAudioUrl(url);
        } catch (e) {
          console.error('저장된 오디오 데이터 복원 오류:', e);
        }
      }
    } else {
      // 타이머가 만료되었으면 오디오 URL 제거
      localStorage.removeItem(AUDIO_URL_KEY);
      setAudioUrl(null);
    }
    
    // 예시 패널 표시 상태 복원 - 타이머 상태에 따라 결정
    const storedShowExample = localStorage.getItem(SHOW_EXAMPLE_KEY);
    if (storedShowExample !== null && ((storedTimerValue && storedTimerStart) || !storedTimerStart)) {
      setShowExamplePanel(storedShowExample === 'true');
    } else {
      // 타이머가 만료되었으면 초기 화면으로
      setShowExamplePanel(true);
      localStorage.setItem(SHOW_EXAMPLE_KEY, 'true');
    }
    
    // 텍스트 결과 복원 - 타이머가 살아있는 경우에만
    if ((storedTimerValue && storedTimerStart) || !storedTimerStart) {
      const storedTranscribedText = localStorage.getItem(TRANSCRIBED_TEXT_KEY);
      if (storedTranscribedText) {
        setTranscribedText(storedTranscribedText);
      }
    } else {
      // 타이머가 만료되었으면 텍스트 결과 제거
      localStorage.removeItem(TRANSCRIBED_TEXT_KEY);
      setTranscribedText('여기에 자가 진단 결과가 표시됩니다.');
    }
    
    return () => {
      clearInterval(intervalId);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const isAbnormalResult = (data) => {
    // 이전에 확인한 데이터와 같은지 확인하기 위한 참조 저장
    if (!isAbnormalResult.lastCheckedData || JSON.stringify(data) !== JSON.stringify(isAbnormalResult.lastCheckedData)) {
      isAbnormalResult.lastCheckedData = data;
      console.log("확인할 데이터:", data); // 새로운 데이터일 때만 로깅
      
      // 객체 형식으로 들어오는 경우 ('뇌 질환', '정상' 키를 가진 객체)
      if (data && typeof data === 'object' && '뇌 질환' in data && '정상' in data) {
        const abnormalProbability = data['뇌 질환'];
        const normalProbability = data['정상'];
        
        console.log("뇌 질환 확률1:", abnormalProbability); // 새로운 데이터일 때만 로깅
        console.log("정상 확률1:", normalProbability); // 새로운 데이터일 때만 로깅
        
        // 뇌 질환 99.97% 이상 '또는' 정상 1.5% 이하일 때 비정상으로 판단
        return abnormalProbability >= 99.97 || normalProbability <= 1.5;
      }
      
      // 문자열 형식으로 들어오는 경우 (이전 형식 지원)
      if (typeof data === 'string') {
        // 정규식: 뇌 질환 확률과 정상 확률 모두 추출
        const abnormalMatch = data.match(/뇌 질환:\s*([\d.]+)%/);
        const normalMatch = data.match(/정상:\s*([\d.]+)%/);
        
        // 둘 중 하나라도 매치되지 않으면 false 반환
        if (!abnormalMatch || !normalMatch) return false;
        
        const abnormalProbability = parseFloat(abnormalMatch[1]);
        const normalProbability = parseFloat(normalMatch[1]);
        
        console.log("뇌 질환 확률(문자열1):", abnormalProbability); // 새로운 데이터일 때만 로깅
        console.log("정상 확률(문자열1):", normalProbability); // 새로운 데이터일 때만 로깅
        
        // OR 조건으로 변경
        return abnormalProbability >= 99.97 || normalProbability <= 1.5;
      }
      
      return false; // 처리할 수 없는 형식
    } else {
      // 이전과 같은 데이터인 경우, 계산만 수행하고 로깅하지 않음
      if (data && typeof data === 'object' && '뇌 질환' in data && '정상' in data) {
        // 여기도 OR 조건으로 변경
        return data['뇌 질환'] >= 99.97 || data['정상'] <= 1.5;
      }
      
      if (typeof data === 'string') {
        const abnormalMatch = data.match(/뇌 질환:\s*([\d.]+)%/);
        const normalMatch = data.match(/정상:\s*([\d.]+)%/);
        
        if (!abnormalMatch || !normalMatch) return false;
        
        const abnormalProbability = parseFloat(abnormalMatch[1]);
        const normalProbability = parseFloat(normalMatch[1]);
        
        // OR 조건으로 변경
        return abnormalProbability >= 99.97 || normalProbability <= 1.5;
      }
      
      return false;
    }
  };
  
// 타이머 관련 useEffect 수정
useEffect(() => {
  if (isButtonDisabled && buttonTimer > 0) {
    // 정확하게 1초 후에 타이머 값 감소
    timerRef.current = setTimeout(() => {
      const newTimerValue = buttonTimer - 1;
      setButtonTimer(newTimerValue);
      
      // 로컬 스토리지 업데이트 - 남은 시간만 저장, 시작 시간은 그대로 유지
      if (newTimerValue > 0) {
        localStorage.setItem(TIMER_STORAGE_KEY, newTimerValue.toString());
      } else {
        // 타이머가 종료되면 타이머 관련 데이터만 제거
        localStorage.removeItem(TIMER_STORAGE_KEY);
        localStorage.removeItem(TIMER_START_KEY);
        
        // 버튼만 활성화 - 결과 데이터는 유지
        setIsButtonDisabled(false);
        // 결과 데이터와 화면 상태는 그대로 유지
      }
    }, 1000);
  } else if (buttonTimer === 0 && isButtonDisabled) {
    setIsButtonDisabled(false);
    // 타이머가 끝나면 타이머 관련 데이터만 제거
    localStorage.removeItem(TIMER_STORAGE_KEY);
    localStorage.removeItem(TIMER_START_KEY);
    // 결과 데이터와 화면 상태는 유지
  }
  
  return () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  };
}, [isButtonDisabled, buttonTimer]);

// stopRecording 함수에서 타이머 시작 부분 수정
const stopRecording = () => {
  // 최소 녹음 시간이 지나지 않았으면 녹음 중지 불가
  if (!isMinRecordingTimeElapsed) {
    return;
  }
  
  if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
    mediaRecorderRef.current.stop();
    setIsRecording(false);
    
    mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    
    // 새 타이머 설정
    setIsButtonDisabled(true);
    setButtonTimer(10);
    
    // 시작 시간은 현재 정확한 시간으로 설정
    const startTime = Date.now();
    
    // 타이머 시작 시간과 초기값을 로컬 스토리지에 저장
    localStorage.setItem(TIMER_STORAGE_KEY, '10');
    localStorage.setItem(TIMER_START_KEY, startTime.toString());
  }
};
  
  // 녹음 타이머 관련 useEffect 추가
  useEffect(() => {
    if (isRecording) {
      // 녹음 시작 시 타이머 시작
      recordingTimerRef.current = setInterval(() => {
        setRecordingTimer(prev => {
          const newTime = prev + 1;
          // 최소 녹음 시간이 지났는지 확인
          if (newTime >= minRecordingTime && !isMinRecordingTimeElapsed) {
            setIsMinRecordingTimeElapsed(true);
          }
          return newTime;
        });
      }, 1000);
    } else {
      // 녹음 중지 시 타이머 초기화
      clearInterval(recordingTimerRef.current);
      setRecordingTimer(0);
      setIsMinRecordingTimeElapsed(false);
    }
    
    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
  }, [isRecording]);
  
  // 1. 예시 음성 재생 종료 감지 함수 수정
// 2. 예시 음성 재생 종료 감지 함수를 다음과 같이 수정
useEffect(() => {
  const audioElement = exampleAudioRef.current;
  
  if (audioElement) {
    const handleEnded = () => {
      setIsPlaying(false);
    };
    
    audioElement.addEventListener('ended', handleEnded);
    
    return () => {
      audioElement.removeEventListener('ended', handleEnded);
    };
  }
  
  // speechSynthesis 이벤트 처리를 위한 간접 확인 메커니즘 추가
  if (isPlaying && !speechSynthesisRef.current) {
    // 음성 합성 진행 상태를 주기적으로 확인
    const checkSpeechStatus = setInterval(() => {
      // 음성 합성이 더 이상 말하고 있지 않으면 isPlaying 상태 업데이트
      if (!window.speechSynthesis.speaking) {
        setIsPlaying(false);
        clearInterval(checkSpeechStatus);
      }
    }, 100); // 100ms마다 확인
    
    return () => {
      clearInterval(checkSpeechStatus);
    };
  }
}, [isPlaying]);
  
  // 결과 데이터가 변경될 때마다 로컬 스토리지에 저장
  useEffect(() => {
    if (resultData) {
      localStorage.setItem(RESULT_DATA_KEY, JSON.stringify(resultData));
    } else {
      localStorage.removeItem(RESULT_DATA_KEY);
    }
  }, [resultData]);
  
  // 예시 패널 표시 상태가 변경될 때마다 로컬 스토리지에 저장
  useEffect(() => {
    localStorage.setItem(SHOW_EXAMPLE_KEY, showExamplePanel.toString());
  }, [showExamplePanel]);
  
  // 텍스트 결과가 변경될 때마다 로컬 스토리지에 저장
  useEffect(() => {
    if (transcribedText && transcribedText !== '여기에 자가 진단 결과가 표시됩니다.') {
      localStorage.setItem(TRANSCRIBED_TEXT_KEY, transcribedText);
    }
  }, [transcribedText]);
  
  // WebM을 WAV로 변환하는 함수
  const convertToWav = async (webmBlob) => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const arrayBuffer = await webmBlob.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    const wavBuffer = toWav(audioBuffer);
    const wavBlob = new Blob([wavBuffer], { type: 'audio/wav' });
    return wavBlob;
  };
  
  // 스테레오를 모노로 변환하는 함수
  const convertStereoToMono = async (stereoBlob) => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const arrayBuffer = await stereoBlob.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    
    // 스테레오 채널 정보 확인
    const numberOfChannels = audioBuffer.numberOfChannels;
    
    // 이미 모노인 경우 그대로 반환
    if (numberOfChannels === 1) {
      return stereoBlob;
    }
    
    // 스테레오를 모노로 변환
    const monoBuffer = audioContext.createBuffer(
      1, // 1개 채널 (모노)
      audioBuffer.length,
      audioBuffer.sampleRate
    );
    
    // 모든 채널의 평균값을 계산하여 모노 채널에 할당
    const monoChannel = monoBuffer.getChannelData(0);
    
    // 스테레오(또는 멀티채널)에서 모든 채널의 평균을 계산
    for (let i = 0; i < audioBuffer.length; i++) {
      let sum = 0;
      for (let channel = 0; channel < numberOfChannels; channel++) {
        sum += audioBuffer.getChannelData(channel)[i];
      }
      monoChannel[i] = sum / numberOfChannels;
    }
    
    // 모노 버퍼를 WAV로 변환
    const wavBuffer = toWav(monoBuffer);
    const monoWavBlob = new Blob([wavBuffer], { type: 'audio/wav' });
    
    return monoWavBlob;
  };
  
  // Blob을 Base64로 변환하는 함수 (로컬 스토리지에 저장하기 위함)
  const blobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };
  
  // 3. playExampleAudio 함수 - 웹 음성 API 재생 종료 이벤트 핸들러 추가
// 3. playExampleAudio 함수 수정
const playExampleAudio = () => {
  // 이미 재생 중인 경우 중지
  if (isPlaying) {
    // 오디오 요소가 있는 경우
    if (exampleAudioRef.current) {
      exampleAudioRef.current.pause();
      exampleAudioRef.current.currentTime = 0;
    }
    
    // 웹 음성 API를 사용 중인 경우
    window.speechSynthesis.cancel();
    
    // 상태 업데이트
    setIsPlaying(false);
    
    // ref 초기화
    speechSynthesisRef.current = null;
    
    return;
  }
  
  // 재생 시작
  if (exampleAudioRef.current) {
    exampleAudioRef.current.play()
      .then(() => {
        setIsPlaying(true);
      })
      .catch(error => {
        console.error('예시 음성 재생 오류:', error);
      });
  } else {
    // 기존 음성 합성 중단
    window.speechSynthesis.cancel();
    
    // 새 음성 합성 생성
    const utterance = new SpeechSynthesisUtterance(sampleSentence);
    utterance.lang = 'ko-KR';
    utterance.rate = 0.8; // 약간 느리게 읽기
    
    // 이벤트 핸들러 등록
    utterance.onstart = () => {
      setIsPlaying(true);
      speechSynthesisRef.current = utterance; // ref에 현재 음성 객체 저장
    };
    
    utterance.onend = () => {
      setIsPlaying(false);
      speechSynthesisRef.current = null; // ref 초기화
    };
    
    utterance.onerror = () => {
      setIsPlaying(false);
      speechSynthesisRef.current = null; // ref 초기화
    };
    
    // 음성 합성 시작
    window.speechSynthesis.speak(utterance);
  }
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
          setShowExamplePanel(false); // 결과 화면으로 전환
          
          // 새로고침 대비 로컬 스토리지에 상태 저장
          localStorage.setItem(SHOW_EXAMPLE_KEY, 'false');
      
          try {
            // 1. WebM을 WAV로 변환
            const wavBlob = await convertToWav(webmBlob);
            console.log('변환된 WAV 파일 타입:', wavBlob.type);
            
            // 2. 스테레오를 모노로 변환 (이미 모노면 그대로 반환)
            const monoWavBlob = await convertStereoToMono(wavBlob);
            console.log('최종 모노 WAV 파일 생성 완료');
            
            const wavUrl = URL.createObjectURL(monoWavBlob);
            setAudioUrl(wavUrl);
            
            // 오디오 Blob을 Base64로 변환하여 로컬 스토리지에 저장
            const base64Audio = await blobToBase64(monoWavBlob);
            localStorage.setItem(AUDIO_URL_KEY, base64Audio);
            
            // 모노 WAV 파일을 서버로 전송
            const result = await SelfApi.convertSpeechToText(monoWavBlob);
            console.log('STT 응답:', result);
      
            // 응답 처리 로직 개선
            if (result) {
              if (typeof result === 'object' && '뇌 질환' in result && '정상' in result) {
                // 새로운 응답 형식: {뇌 질환: 99.77, 정상: 0.028} 처리
                const resultText = `정상: ${result['정상'].toFixed(2)}%, 뇌 질환: ${result['뇌 질환'].toFixed(2)}%`;
                setTranscribedText(resultText);
                setResultData(result); // 객체 그대로 저장
                localStorage.setItem(TRANSCRIBED_TEXT_KEY, resultText);
                localStorage.setItem(RESULT_DATA_KEY, JSON.stringify(result));
              } else if (typeof result === 'object' && result.data) {
                // {data: "정상: 0.1%, 뇌 질환: 99.9%"} 형태 처리
                setTranscribedText(result.data);
                setResultData(result.data);
                localStorage.setItem(TRANSCRIBED_TEXT_KEY, result.data);
                localStorage.setItem(RESULT_DATA_KEY, JSON.stringify(result.data));
              } else if (typeof result === 'string') {
                // 문자열 응답인 경우 (예: "정상: 1.38%, 뇌 질환: 96.68%")
                setTranscribedText(result);
                setResultData(result);
                localStorage.setItem(TRANSCRIBED_TEXT_KEY, result);
                localStorage.setItem(RESULT_DATA_KEY, JSON.stringify(result));
              } else if (typeof result === 'object') {
                // 다른 객체 형태 처리
                try {
                  const resultText = JSON.stringify(result);
                  setTranscribedText(resultText);
                  setResultData(result);
                  localStorage.setItem(TRANSCRIBED_TEXT_KEY, resultText);
                  localStorage.setItem(RESULT_DATA_KEY, JSON.stringify(result));
                } catch (e) {
                  console.error('결과를 문자열로 변환하는 데 실패했습니다:', e);
                  setTranscribedText('결과 형식을 처리할 수 없습니다.');
                  setResultData(null);
                  localStorage.removeItem(TRANSCRIBED_TEXT_KEY);
                  localStorage.removeItem(RESULT_DATA_KEY);
                }
              } else {
                console.warn('STT 응답이 예상치 못한 형식입니다:', result);
                setTranscribedText('음성 녹음에 문제가 생겼습니다. 더 조용한 환경에서 녹음을 시도해주세요.');
                setResultData(null);
                localStorage.removeItem(TRANSCRIBED_TEXT_KEY);
                localStorage.removeItem(RESULT_DATA_KEY);
              }
            } else {
              console.warn('STT 응답이 비어있습니다:', result);
              setTranscribedText('음성 녹음에 문제가 생겼습니다. 더 조용한 환경에서 녹음을 시도해주세요.');
              setResultData(null);
              localStorage.removeItem(TRANSCRIBED_TEXT_KEY);
              localStorage.removeItem(RESULT_DATA_KEY);
            }
          } catch (error) {
            console.error('음성 변환 처리 오류:', error);
            setTranscribedText('음성 녹음에 문제가 생겼습니다. 더 조용한 환경에서 녹음을 시도해주세요.');
            setResultData(null);
            localStorage.removeItem(TRANSCRIBED_TEXT_KEY);
            localStorage.removeItem(RESULT_DATA_KEY);
          } finally {
            setIsLoading(false);
          }
        } catch (error) {
          console.error('오디오 처리 오류:', error);
          setIsLoading(false);
          setTranscribedText('음성 녹음에 문제가 생겼습니다. 더 조용한 환경에서 녹음을 시도해주세요.');
          setResultData(null);
          localStorage.removeItem(TRANSCRIBED_TEXT_KEY);
          localStorage.removeItem(RESULT_DATA_KEY);
        }
      });
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('녹음 시작 오류:', error);
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
 
 // 2. resetAndTryAgain 함수 수정 - 예시 음성 재생 상태 초기화 추가
const resetAndTryAgain = () => {
  setShowExamplePanel(true);
  setResultData(null);
  
  // 예시 음성 재생 상태 초기화 추가
  setIsPlaying(false);
  if (exampleAudioRef.current) {
    exampleAudioRef.current.pause();
    exampleAudioRef.current.currentTime = 0;
  }
  
  // 로컬 스토리지에서 결과 데이터 삭제
  localStorage.removeItem(RESULT_DATA_KEY);
  localStorage.removeItem(AUDIO_URL_KEY);
  localStorage.setItem(SHOW_EXAMPLE_KEY, 'true');
  localStorage.removeItem(TRANSCRIBED_TEXT_KEY);
  
  // 오디오 URL 해제
  if (audioUrl) {
    URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
  }
};


// 4. 컴포넌트 언마운트 시 정리 함수 수정
useEffect(() => {
  return () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    if (improvedAudioUrl) {
      URL.revokeObjectURL(improvedAudioUrl);
    }
    // 음성 합성 중단 추가
    window.speechSynthesis.cancel();
    speechSynthesisRef.current = null;
    setIsPlaying(false);
  };
}, [audioUrl, improvedAudioUrl]);

 // 예시 문장 패널 렌더링
 const renderExamplePanel = () => {
   return (
     <div className="bg-white rounded-lg shadow-sm overflow-hidden">
       <div className="border-b border-gray-200">
         <div className="px-6 py-4">
           <h2 className="text-xl font-semibold text-gray-800">따라 읽어주세요</h2>
         </div>
       </div>
       <div className="p-6">
         <div className="bg-[#F0FFF4] border-l-4 border-green-500 p-4 rounded-r-lg mb-4">
           <p className="text-xl font-medium text-gray-800 text-center">{sampleSentence}</p>
         </div>
         <div className="bg-[#EDF2F7] rounded-lg p-3 mb-5">
           <div className="flex items-start">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
               <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
             </svg>
             <p className="text-sm text-gray-600">
               천천히 또박또박 말해주세요. 정확한 진단을 위해 조용한 환경에서 녹음해주세요.
             </p>
           </div>
         </div>
         
         <div className="flex justify-center">
           <button 
             onClick={playExampleAudio}
             className="flex items-center justify-center bg-[#55BCA4] text-white py-2 px-4 rounded-lg hover:bg-[#48A08C] transition duration-300"
           >
             {isPlaying ? (
               <>
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                   <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                 </svg>
                 예시 음성 중지
               </>
             ) : (
               <>
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                   <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                 </svg>
                 예시 음성 듣기
               </>
             )}
           </button>
           {/* 실제 예시 오디오 파일이 있을 경우 사용할 오디오 요소 */}
           <audio ref={exampleAudioRef} src="/example-sentence.mp3" preload="auto" style={{ display: 'none' }} />
         </div>
       </div>
     </div>
   );
 };

 // 결과 표시 컴포넌트 선택 함수에서 로그 한 번만 출력하도록 수정
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
 
 if (resultData) {
   // useRef를 사용하여 로그 반복 출력 방지
   const abnormal = isAbnormalResult(resultData);
   
   // 결과 변경 시에만 로그 출력 (이전에 저장된 값과 비교)
   if (resultData !== renderResultComponent.lastResultData || 
       abnormal !== renderResultComponent.lastAbnormal) {
     console.log("결과가 비정상인가?", abnormal);
     // 현재 값을 저장
     renderResultComponent.lastResultData = resultData;
     renderResultComponent.lastAbnormal = abnormal;
   }
   
   let displayData = resultData;
   
   // 객체인 경우 표시용 문자열로 변환
   if (typeof resultData === 'object' && '뇌 질환' in resultData && '정상' in resultData) {
     displayData = `정상: ${resultData['정상'].toFixed(2)}%, 뇌 질환: ${resultData['뇌 질환'].toFixed(2)}%`;
   }
   
   return (
     <div className="bg-white rounded-lg shadow-sm overflow-hidden">
       <div className="border-b border-gray-200">
         <div className="px-6 py-4 flex justify-between items-center">
           <h2 className="text-xl font-semibold text-gray-800">분석 결과</h2>
           <button 
             onClick={resetAndTryAgain}
             className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
           >
             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
             </svg>
             다시 시도하기
           </button>
         </div>
       </div>
       <div className="p-6">
         {abnormal ? (
           <AbnormalResult 
             data={displayData}
             audioUrl={audioUrl}
             playAudio={playAudio}
             regenerateWithVoice={regenerateWithVoice}
           />
         ) : (
           <NormalResult 
             data={displayData}
             audioUrl={audioUrl}
             playAudio={playAudio}
             regenerateWithVoice={regenerateWithVoice}
           />
         )}
       </div>
     </div>
   );
 }
 
 // 초기 화면 - 예시 문장 패널 또는 기본 안내 화면
 if (showExamplePanel) {
   return renderExamplePanel();
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
     <main className="max-w-6xl mx-auto p-4 mt-1 malang-font">
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
                     ? isMinRecordingTimeElapsed 
                       ? 'bg-red-600 text-white' 
                       : 'bg-gray-500 text-white cursor-not-allowed'
                     : isButtonDisabled
                       ? 'bg-gray-400 text-white cursor-not-allowed'
                       : serviceStatus.isAvailable 
                         ? 'bg-[#55BCA4] text-white hover:bg-[#55BCA6]'
                         : 'bg-gray-400 text-white cursor-not-allowed'
                 }`}
                 onClick={isRecording ? stopRecording : startRecording}
                 disabled={isLoading || isButtonDisabled || !serviceStatus.isAvailable || serviceStatus.checking || (isRecording && !isMinRecordingTimeElapsed)}
               >
                 {isRecording 
                   ? isMinRecordingTimeElapsed 
                     ? '녹음 중지' 
                     : `녹음 중 (${minRecordingTime - recordingTimer}초 후 중지 가능)`
                   : isButtonDisabled 
                     ? `${buttonTimer}초 후 재시도` 
                     : '녹음 시작'}
               </button>
               
               {/* 녹음 중인 상태를 더 명확하게 보여주는 UI 추가 */}
               {isRecording && (
                 <div className="mt-4 flex items-center justify-center">
                   <div className={`w-3 h-3 rounded-full mr-2 ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-gray-400'}`}></div>
                   <span className="text-sm">
                     {isMinRecordingTimeElapsed 
                       ? `녹음 중 (${recordingTimer}초)` 
                       : `최소 ${minRecordingTime}초 녹음 후 중지 가능`}
                   </span>
                 </div>
               )}
             </div>
           </div>
         </div>
 
         {/* 오른쪽 메인 콘텐츠 - 예시 문장 또는 결과 컴포넌트 */}
         <div className="md:col-span-2">
           {renderResultComponent()}
           
           {/* 도움말 섹션 - 결과 아래에 배치 */}
           <div className="mt-6 bg-white rounded-lg shadow-sm p-4">
             <h2 className="text-lg font-semibold text-gray-800 mb-2">자가 진단 도움말</h2>
             <ul className="list-disc pl-5 text-sm text-gray-700 space-y-0.5">
               <li>조용한 환경에서 녹음하면 더 정확한 결과를 얻을 수 있습니다.</li>
               <li>최소 6초 이상 녹음해야 분석이 가능합니다.</li>
               <li>이 자가진단은 전문의의 진단을 대체할 수 없으며, 참고용으로만 사용하세요.</li>
             </ul>
           </div>
         </div>
       </div>
     </main>
   </div>
 );
};

export default SelfDiagnosis;