import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  TextField,
  CircularProgress,
} from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';
import { motion } from 'framer-motion';
import '../styles/VoiceCard.css';

const VoiceCard = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [text, setText] = useState('');
  const [error, setError] = useState('');

  let recognition;

  // Web Speech API 초기화
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      recognition = new SpeechRecognition();
      recognition.continuous = true; // 계속해서 음성을 인식
      recognition.interimResults = true; // 중간 결과도 반환
      recognition.lang = 'ko-KR'; // 한국어 설정

      // 음성 인식 성공 시 호출
      recognition.onresult = (event) => {
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            setText((prevText) => prevText + transcript + ' ');
          } else {
            interimTranscript += transcript;
          }
        }
        setText((prevText) => prevText + interimTranscript);
      };

      // 에러 발생 시 호출
      recognition.onerror = (event) => {
        setError('음성 인식 중 문제가 발생했습니다: ' + event.error);
        setIsRecording(false);
      };

      // 녹음 중지 시 호출
      recognition.onend = () => {
        setIsRecording(false);
      };
    } else {
      setError('이 브라우저는 음성 인식을 지원하지 않습니다.');
    }
  }, []);

  // 녹음 시작/중지 핸들러
  const handleRecording = () => {
    if (!recognition) return;

    if (isRecording) {
      recognition.stop();
    } else {
      setText(''); // 기존 텍스트 초기화
      setError(''); // 에러 초기화
      recognition.start();
    }
    setIsRecording(!isRecording);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className={`voice-card ${isRecording ? 'recording' : ''}`}>
        <CardContent>
          <Typography variant="h5" component="div" className="voice-card-title">
            AI 음성 인식
          </Typography>

          {/* 에러 메시지 */}
          {error && (
            <Typography color="error" variant="body2" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}

          {/* 애니메이션 및 버튼 */}
          <Box className="voice-animation-container">
            {isRecording && (
              <Box className="voice-waves">
                {[...Array(5)].map((_, i) => (
                  <Box
                    key={i}
                    className="voice-wave"
                    sx={{ animationDelay: `${i * 0.2}s` }}
                  />
                ))}
              </Box>
            )}

            <Box className="mic-button-container">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="contained"
                  color={isRecording ? 'secondary' : 'primary'}
                  className="mic-button"
                  onClick={handleRecording}
                  startIcon={isRecording ? <StopIcon /> : <MicIcon />}
                >
                  {isRecording ? '녹음 중지' : '음성 인식 시작'}
                </Button>
              </motion.div>
            </Box>
          </Box>

          {/* 텍스트 필드 */}
          <Box sx={{ position: 'relative', mt: 3 }}>
            <TextField
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              placeholder="음성 인식 결과가 여기에 표시됩니다..."
              value={text}
              InputProps={{
                readOnly: true,
              }}
            />
            {isRecording && (
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <CircularProgress color="secondary" />
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default VoiceCard;
