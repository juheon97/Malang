// ChatArea.js - 채팅 및 음성 인식 영역
import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, TextField, Button, Paper } from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import SendIcon from '@mui/icons-material/Send';
import MessageList from './MessageList';
import './ChatArea.css';

const ChatArea = () => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef(null);
  
  // 음성 인식 설정
  let recognition;
  
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'ko-KR';
      
      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            transcript += event.results[i][0].transcript;
          }
        }
        
        if (transcript) {
          setInputText(transcript);
        }
      };
      
      recognition.onerror = (event) => {
        console.error('음성 인식 오류:', event.error);
        setIsRecording(false);
      };
      
      recognition.onend = () => {
        setIsRecording(false);
      };
    }
    
    // 스크롤을 항상 최신 메시지로 이동
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleSendMessage = () => {
    if (inputText.trim()) {
      const newMessage = {
        id: Date.now(),
        text: inputText,
        sender: '나',
        timestamp: new Date().toLocaleTimeString(),
      };
      
      setMessages([...messages, newMessage]);
      setInputText('');
    }
  };
  
  const toggleRecording = () => {
    if (!recognition) return;
    
    if (isRecording) {
      recognition.stop();
    } else {
      recognition.start();
    }
    
    setIsRecording(!isRecording);
  };
  
  return (
    <Box className="chat-container">
      <Paper className="chat-header">
        <Typography variant="h6"># 일반</Typography>
        <Typography variant="body2">구음 장애인을 위한 채팅 채널입니다</Typography>
      </Paper>
      
      <Box className="message-container">
        <MessageList messages={messages} />
        <div ref={messagesEndRef} />
      </Box>
      
      <Box className="input-container">
        <Button 
          variant={isRecording ? "contained" : "outlined"}
          color={isRecording ? "error" : "primary"}
          onClick={toggleRecording}
          className="voice-button"
        >
          <MicIcon />
        </Button>
        
        <TextField
          fullWidth
          variant="outlined"
          placeholder="메시지를 입력하거나 마이크 버튼을 눌러 말하세요..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          className="message-input"
        />
        
        <Button 
          variant="contained" 
          color="primary"
          onClick={handleSendMessage}
          className="send-button"
        >
          <SendIcon />
        </Button>
      </Box>
    </Box>
  );
};

export default ChatArea;
