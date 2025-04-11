// components/hand_language/SignLanguageModal.jsx
import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import SignLanguageTranslator from './SignLanguageTranslator';

function SignLanguageModal({ show, handleClose }) {
  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>수어 인식</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <SignLanguageTranslator />
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          닫기
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default SignLanguageModal;
