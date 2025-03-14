// src/pages/HomePage.js
import React, { useState } from 'react';  
import { Container, Grid, Typography, Box, Button } from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import Header from '../components/Header';
import Footer from '../components/Footer';
import LoginPage from './LoginPage';
import VideoCallSection from '../components/VideoCallSection';
import useOpenViduStore from '../store/openViduStore';
import '../styles/HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const isLoggedIn = useAuthStore(state => state.isLoggedIn);
  
  // OpenVidu 훅 사용
  const openVidu = useOpenViduStore();

  // 로그인 모달 열기/닫기
  const handleOpenLoginModal = () => {
    setShowLoginModal(true);
  };
  
  const handleCloseLoginModal = () => {
    setShowLoginModal(false);
  };

  return (
    <div className="home-page aristo-style">
      <Header />
      
      {/* 화상 통화 섹션 */}
      {openVidu.showVideoCall ? (
        <VideoCallSection 
          session={openVidu.session}
          mainStreamManager={openVidu.mainStreamManager}
          publisher={openVidu.publisher}
          subscribers={openVidu.subscribers}
          leaveSession={openVidu.leaveSession}
          isRecording={openVidu.isRecording}
          toggleSpeechRecognition={openVidu.toggleSpeechRecognition}
          originalSpeech={openVidu.originalSpeech}
          convertedSpeech={openVidu.convertedSpeech}
          speakText={openVidu.speakText}
        />
      ) : (
        <>
          {/* 메인 홈페이지 섹션 */}
          <Box className="mallang-hero-section">
            <Container maxWidth="xl">
              <Grid container spacing={0}>
                <Grid item xs={12} md={6} className="mallang-logo-container">
                  <Box className="mallang-logo">
                    <Typography variant="h1" component="h1">
                      <span className="mallang-text">말랑</span>
                    </Typography>
                  </Box>
                  <Typography variant="h3" component="h2" className="mallang-subtitle">
                    누구든 쉽게 소통할 수 있는
                  </Typography>
                  <Typography variant="body1" className="mallang-features">
                    음성 인식 / 음성 변역 / 음성 출력 / 음성 STT<br />
                    수어 인식 / 수어 영상 지원 / 수어 모델 실행 / 수어 TTS<br />
                    통화 기능 / 실시간 화면 출력 / 실시간 채팅 / 번역된 텍스트 출력
                  </Typography>
                  <Box className="mallang-buttons">
                    {!isLoggedIn ? (
                      <>
                        <Button 
                          variant="contained" 
                          className="mallang-button"
                          component={Link}
                          to="/register"
                        >
                          회원가입
                        </Button>
                        <Button 
                          variant="contained" 
                          className="mallang-button"
                          component={Link}
                          to="/login"
                        >
                          로그인
                        </Button>
                      </>
                    ) : null}
                    <Button 
                      variant="contained" 
                      className="mallang-button"
                      onClick={() => openVidu.joinSession('게스트')}
                    >
                      바로 사용
                    </Button>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6} className="mallang-image-container">
                  <Box className="mallang-chat-bubbles">
                    {/* 이미지의 채팅 버블 이미지 */}
                  </Box>
                </Grid>
              </Grid>
            </Container>
          </Box>
        </>
      )}
      
      {/* 로그인 모달 */}
      <LoginPage 
        open={showLoginModal} 
        onClose={handleCloseLoginModal}
        isModal={true}  // 모달 형태로 사용
      />
      
      <Footer />
    </div>
  );
};

export default HomePage;
