// src/pages/SignLanguagePage.jsx
import React from 'react';
import SignLanguageTranslator from '../components/hand_language/SignLanguageTranslator';

function SignLanguagePage() {
  return (
    <div className="sign-language-page">
      <h1>수어 번역</h1>
      <div
        className="translator-wrapper"
        style={{ width: '100%', height: '70vh' }}
      >
        <SignLanguageTranslator />
      </div>
    </div>
  );
}

export default SignLanguagePage;
