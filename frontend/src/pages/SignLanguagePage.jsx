// src/pages/SignLanguagePage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SignLanguageTranslator from '../components/hand_language/SignLanguageTranslator';

function SignLanguagePage() {
  const navigate = useNavigate();
  const [isTranslating, setIsTranslating] = useState(true);

  const handleStopTranslation = () => {
    setIsTranslating(false);
    // 메인 페이지로 이동
    navigate('/');
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
        {isTranslating && <SignLanguageTranslator />}
      </div>
    </div>
  );
}

export default SignLanguagePage;
