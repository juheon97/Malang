// contexts/SignLanguageContext.jsx
import React, { createContext, useState, useContext } from 'react';
import SignLanguageModal from '../components/hand_language/SignLanguageModal';

const SignLanguageContext = createContext();

export function SignLanguageProvider({ children }) {
  const [showModal, setShowModal] = useState(false);

  const openSignLanguageModal = () => setShowModal(true);
  const closeSignLanguageModal = () => setShowModal(false);

  return (
    <SignLanguageContext.Provider value={{ openSignLanguageModal }}>
      {children}
      <SignLanguageModal
        show={showModal}
        handleClose={closeSignLanguageModal}
      />
    </SignLanguageContext.Provider>
  );
}

export function useSignLanguage() {
  return useContext(SignLanguageContext);
}
