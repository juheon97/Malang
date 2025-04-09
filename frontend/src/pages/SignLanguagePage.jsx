// src/pages/SignLanguagePage.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SignLanguageTranslator from '../components/hand_language/SignLanguageTranslator';

function SignLanguagePage() {
  const navigate = useNavigate();
  const [isTranslating, setIsTranslating] = useState(true);
  const translatorRef = useRef(null);

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

  return (
    <div className="sign-language-page">
      <div
        className="header-container"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
        }}
      >
        <h1>수어 번역</h1>
        <button
          onClick={handleStopTranslation}
          className="stop-button"
          style={{
            padding: '10px 20px',
            backgroundColor: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px',
          }}
        >
          번역 중지
        </button>
      </div>

      <div
        className="translator-wrapper"
        style={{ width: '100%', height: '70vh' }}
      >
        {isTranslating && <SignLanguageTranslator ref={translatorRef} />}
      </div>
    </div>
  );
}

export default SignLanguagePage;
