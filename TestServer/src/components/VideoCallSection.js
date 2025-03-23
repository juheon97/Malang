// src/components/VideoCallSection.js
import React, { useState } from 'react';
import { Container, Grid, Typography, Box, Button, Paper } from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import VideocamIcon from '@mui/icons-material/Videocam';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import StopIcon from '@mui/icons-material/Stop';

const VideoCallSection = ({ 
  session, 
  mainStreamManager, 
  publisher, 
  subscribers, 
  leaveSession, 
  isRecording, 
  toggleSpeechRecognition, 
  originalSpeech, 
  convertedSpeech, 
  speakText 
}) => {
  return (
    <Box className="video-call-section">
      <Container maxWidth="lg">
        <Box className="section-header">
          <Typography variant="h2" component="h1" className="section-main-title">
            Video Call
          </Typography>
          <Typography variant="h5" component="div" className="section-sub-title">
            ( 화상 상담 )
          </Typography>
        </Box>
        
        <Grid container spacing={4} sx={{ mt: 4 }}>
          {/* 메인 비디오 화면 */}
          <Grid item xs={12} md={8}>
            <Paper elevation={0} className="video-container main-video">
              {mainStreamManager && (
                <div className="stream-container">
                  <video 
                    autoPlay={true} 
                    ref={video => {
                      if (video && mainStreamManager.stream.getMediaStream()) {
                        video.srcObject = mainStreamManager.stream.getMediaStream();
                      }
                    }}
                  />
                  <div className="stream-info">
                    <Typography variant="body1">
                      {mainStreamManager.stream.connection.data
                        ? JSON.parse(mainStreamManager.stream.connection.data).clientData
                        : '게스트'}
                    </Typography>
                  </div>
                </div>
              )}
            </Paper>
          </Grid>
          
          {/* 음성 변환 및 구독자 화면 */}
          <Grid item xs={12} md={4}>
            <Paper elevation={0} className="speech-conversion">
              <Typography variant="h6" className="speech-title">
                음성 변환
              </Typography>
              
              <Box className="speech-controls">
                <Button
                  variant={isRecording ? "contained" : "outlined"}
                  color={isRecording ? "error" : "primary"}
                  startIcon={isRecording ? <StopIcon /> : <MicIcon />}
                  onClick={toggleSpeechRecognition}
                  className="speech-button"
                >
                  {isRecording ? '녹음 중지' : '음성 인식 시작'}
                </Button>
                
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<VolumeUpIcon />}
                  onClick={() => speakText(convertedSpeech)}
                  disabled={!convertedSpeech}
                  className="speech-button"
                >
                  TTS 재생
                </Button>
              </Box>
              
              <Box className="speech-text">
                <Typography variant="subtitle2">원본 음성:</Typography>
                <Paper elevation={0} className="speech-paper original">
                  <Typography variant="body1">{originalSpeech || '음성 인식 대기 중...'}</Typography>
                </Paper>
                
                <Typography variant="subtitle2" sx={{ mt: 2 }}>변환된 음성:</Typography>
                <Paper elevation={0} className="speech-paper converted">
                  <Typography variant="body1">{convertedSpeech || '변환된 텍스트가 여기에 표시됩니다...'}</Typography>
                </Paper>
              </Box>
            </Paper>
            
            {/* 구독자 비디오 목록 */}
            <Box className="subscribers-container" sx={{ mt: 2 }}>
              {subscribers.map((sub, i) => (
                <Paper key={i} elevation={0} className="subscriber-video">
                  <video 
                    autoPlay={true} 
                    ref={video => {
                      if (video && sub.stream.getMediaStream()) {
                        video.srcObject = sub.stream.getMediaStream();
                      }
                    }}
                  />
                  <div className="stream-info">
                    <Typography variant="body2">
                      {sub.stream.connection.data
                        ? JSON.parse(sub.stream.connection.data).clientData
                        : '참가자'}
                    </Typography>
                  </div>
                </Paper>
              ))}
            </Box>
          </Grid>
        </Grid>
        
        {/* 화상 통화 컨트롤 */}
        <Box className="video-controls" sx={{ mt: 4 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<MicIcon />}
            onClick={() => {
              if (publisher) {
                publisher.publishAudio(!publisher.stream.audioActive);
              }
            }}
            className="control-button"
          >
            {publisher && publisher.stream.audioActive ? '마이크 끄기' : '마이크 켜기'}
          </Button>
          
          <Button
            variant="contained"
            color="primary"
            startIcon={<VideocamIcon />}
            onClick={() => {
              if (publisher) {
                publisher.publishVideo(!publisher.stream.videoActive);
              }
            }}
            className="control-button"
          >
            {publisher && publisher.stream.videoActive ? '카메라 끄기' : '카메라 켜기'}
          </Button>
          
          <Button
            variant="contained"
            color="error"
            onClick={leaveSession}
            className="control-button"
          >
            통화 종료
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default VideoCallSection;
