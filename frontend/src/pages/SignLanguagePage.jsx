// src/pages/SignLanguagePage.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SignLanguageTranslator from '../components/hand_language/SignLanguageTranslator';

function SignLanguagePage() {
  const navigate = useNavigate();
  const [isTranslating, setIsTranslating] = useState(true);
  const translatorRef = useRef(null);
  const [showGuide, setShowGuide] = useState(false);
  // 완성된 문장들을 저장할 상태 추가
  const [translationHistory, setTranslationHistory] = useState([]);

  // 컴포넌트가 언마운트될 때 카메라 리소스 해제
  useEffect(() => {
    return () => {
      // 페이지를 떠날 때 카메라 리소스 해제
      stopCameraAndMicrophone();
    };
  }, []);

  const stopCameraAndMicrophone = () => {
    // 모든 미디어 장치 트랙 중지
    navigator.mediaDevices
      .getUserMedia({ audio: true, video: true })
      .then(stream => {
        stream.getTracks().forEach(track => track.stop());
      })
      .catch(err => console.error('미디어 장치 해제 중 오류:', err));

    // 모든 활성 미디어 스트림 중지
    const allTracks = [];
    document.querySelectorAll('video').forEach(video => {
      if (video.srcObject) {
        video.srcObject.getTracks().forEach(track => {
          allTracks.push(track);
          track.stop();
        });
        video.srcObject = null;
      }
    });

    console.log(`${allTracks.length}개의 미디어 트랙이 중지되었습니다.`);
  };

  const handleStopTranslation = () => {
    // 번역 중지 버튼 클릭 시 카메라 리소스 해제
    stopCameraAndMicrophone();
    setIsTranslating(false);

    // 약간의 지연 후 페이지 이동 (리소스 해제 시간 확보)
    setTimeout(() => {
      navigate('/');
    }, 100);
  };

  // 번역 결과 처리 함수 추가
  const handleTranslationResult = text => {
    if (text && text.trim()) {
      // 현재 시간 추가
      const now = new Date();
      const timeString = now.toLocaleTimeString();

      setTranslationHistory(prev => [...prev, { text, timestamp: timeString }]);
    }
  };

  // 히스토리 지우기 함수
  const clearHistory = () => {
    setTranslationHistory([]);
  };

  return (
    <div className="sign-language-page bg-gray-50 min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="header-container flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-indigo-700">수어 번역</h1>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowGuide(!showGuide)}
              className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg transition-colors duration-300 flex items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              {showGuide ? '설명서 닫기' : '사용 설명서'}
            </button>
            <button
              onClick={handleStopTranslation}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors duration-300 flex items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z"
                  clipRule="evenodd"
                />
              </svg>
              번역 중지
            </button>
          </div>
        </div>

        {showGuide && (
          <div className="guide-container bg-white rounded-xl shadow-md p-6 mb-6 animate-fadeIn">
            <h2 className="text-2xl font-bold text-indigo-600 mb-4">
              수어 번역 사용 설명서
            </h2>
            <p className="text-gray-700 mb-4">
              카메라 앞에서 아래 이미지와 같은 수어 제스처를 취하면 한글로
              변환됩니다.
            </p>

            <div className="mb-6">
              <h3 className="text-xl font-semibold text-indigo-500 mb-2">
                기본 제스처
              </h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>문장 완성 후 전송: 전방으로 주먹을 쥐고 CAM에 보여주기</li>
                <li>초기화: 손바닥을 CAM에 보여주기</li>
              </ul>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold text-indigo-500 mb-2 text-center">
                한글 자모음 제스처
              </h3>
              <div className="flex justify-center">
                <img
                  src="/images/sign_language_guide.jpg"
                  alt="수어 자모음 가이드"
                  className="max-w-full h-auto rounded-lg shadow-md"
                />
              </div>
              <p className="text-sm text-gray-500 mt-2 text-center">
                ※ 제스처를 3초 이상 유지하면 해당 글자가 인식됩니다.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-indigo-500 mb-2">
                사용 팁
              </h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>밝은 조명 아래에서 사용하세요.</li>
                <li>손이 카메라 프레임 안에 완전히 들어오도록 위치시키세요.</li>
                <li>제스처를 취할 때 손을 안정적으로 유지하세요.</li>
                <li>배경이 단순할수록 인식률이 높아집니다.</li>
              </ul>
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6">
          <div
            className={`translator-wrapper ${showGuide ? 'lg:w-3/5' : 'lg:w-2/3'} bg-white rounded-xl shadow-md overflow-hidden`}
          >
            {isTranslating && (
              <div className="relative h-[50vh] lg:h-[70vh]">
                <SignLanguageTranslator
                  ref={translatorRef}
                  onTranslationResult={handleTranslationResult}
                />
              </div>
            )}
          </div>

          {/* 번역 히스토리 섹션 추가 */}
          <div
            className={`translation-history ${showGuide ? 'lg:w-2/5' : 'lg:w-1/3'} bg-white rounded-xl shadow-md p-4 h-[50vh] lg:h-[70vh] flex flex-col`}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-indigo-600">
                번역 히스토리
              </h2>
              <button
                onClick={clearHistory}
                className="text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 rounded transition-colors duration-300"
              >
                기록 지우기
              </button>
            </div>

            <div className="flex-grow overflow-y-auto">
              {translationHistory.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12 mb-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                  <p>번역 내용이 여기에 표시됩니다.</p>
                  <p className="text-sm mt-2">
                    수어 제스처 후 'next' 제스처를 취하세요.
                  </p>
                </div>
              ) : (
                <ul className="space-y-3">
                  {translationHistory.map((item, index) => (
                    <li
                      key={index}
                      className="bg-indigo-50 p-3 rounded-lg border-l-4 border-indigo-500 animate-fadeIn"
                    >
                      <div className="text-gray-800">{item.text}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {item.timestamp}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignLanguagePage;
