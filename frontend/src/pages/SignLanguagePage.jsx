// src/pages/SignLanguagePage.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SignLanguageTranslator from '../components/hand_language/SignLanguageTranslator';

function SignLanguagePage() {
  const navigate = useNavigate();
  const [isTranslating, setIsTranslating] = useState(true);
  const translatorRef = useRef(null);
  const [showGuide, setShowGuide] = useState(false);

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
        <div>
          <button
            onClick={() => setShowGuide(!showGuide)}
            className="guide-button"
            style={{
              padding: '10px 20px',
              backgroundColor: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px',
              marginRight: '10px',
            }}
          >
            {showGuide ? '설명서 닫기' : '사용 설명서'}
          </button>
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
      </div>

      {showGuide && (
        <div
          className="guide-container"
          style={{
            marginBottom: '20px',
            padding: '15px',
            backgroundColor: '#f5f5f5',
            borderRadius: '8px',
          }}
        >
          <h2>수어 번역 사용 설명서</h2>
          <p>
            카메라 앞에서 아래 이미지와 같은 수어 제스처를 취하면 한글로
            변환됩니다.
          </p>

          <div style={{ marginTop: '15px' }}>
            <h3>기본 제스처</h3>
            <ul style={{ listStyle: 'disc', marginLeft: '20px' }}>
              <li>문장 완성 후 전송: 손가락 두 개를 펴서 옆으로 움직이기</li>
              <li>초기화: 손바닥을 펴서 좌우로 흔들기</li>
              <li>공백 추가: 손가락을 모두 펴고 아래로 내리기</li>
            </ul>
          </div>

          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <h3>한글 자모음 제스처</h3>
            <img
              src="/images/sign_language_guide.jpg"
              alt="수어 자모음 가이드"
              style={{
                display: 'block',
                marginLeft: 'auto',
                marginRight: 'auto',
                maxWidth: '100%',
                height: 'auto',
              }}
            />
            <p style={{ fontSize: '14px', color: '#666', marginTop: '5px' }}>
              ※ 제스처를 3초 이상 유지하면 해당 글자가 인식됩니다.
            </p>
          </div>

          <div style={{ marginTop: '15px' }}>
            <h3>사용 팁</h3>
            <ul style={{ listStyle: 'disc', marginLeft: '20px' }}>
              <li>밝은 조명 아래에서 사용하세요.</li>
              <li>손이 카메라 프레임 안에 완전히 들어오도록 위치시키세요.</li>
              <li>제스처를 취할 때 손을 안정적으로 유지하세요.</li>
              <li>배경이 단순할수록 인식률이 높아집니다.</li>
            </ul>
          </div>
        </div>
      )}

      <div
        className="translator-wrapper"
        style={{ width: '100%', height: showGuide ? '50vh' : '70vh' }}
      >
        {isTranslating && <SignLanguageTranslator ref={translatorRef} />}
      </div>
    </div>
  );
}

export default SignLanguagePage;
