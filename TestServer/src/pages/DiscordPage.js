import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Grid, 
  Typography, 
  TextField, 
  Button, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Avatar, 
  Divider,
  IconButton,
  Paper,
  Badge,
  Tooltip,
  Menu,
  MenuItem
} from '@mui/material';
import TagIcon from '@mui/icons-material/Tag';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import SettingsIcon from '@mui/icons-material/Settings';
import MicIcon from '@mui/icons-material/Mic';
import SendIcon from '@mui/icons-material/Send';
import AddIcon from '@mui/icons-material/Add';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import VideocamIcon from '@mui/icons-material/Videocam';
import TranslateIcon from '@mui/icons-material/Translate';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import LogoutIcon from '@mui/icons-material/Logout';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import '../styles/DiscordPage.css';

// 가상의 채팅 메시지 데이터
const sampleMessages = [
  { id: 1, user: '김민수', content: '안녕하세요! 오늘 상담 시작하겠습니다.', time: '12:30', avatar: 'https://mui.com/static/images/avatar/1.jpg', isUser: false },
  { id: 2, user: '이지은', content: '네, 안녕하세요. 반갑습니다.', time: '12:32', avatar: 'https://mui.com/static/images/avatar/2.jpg', isUser: true, originalVoice: '네, 안녕하세요. 만납씁니다.' },
  { id: 3, user: '김민수', content: '오늘은 어떤 이야기를 나누고 싶으신가요?', time: '12:35', avatar: 'https://mui.com/static/images/avatar/1.jpg', isUser: false },
  { id: 4, user: '이지은', content: '요즘 의사소통에 어려움을 겪고 있어요.', time: '12:37', avatar: 'https://mui.com/static/images/avatar/2.jpg', isUser: true, originalVoice: '요즘 의사소통에 어려움을 겪고 이써요.' },
];

// 가상의 서버 목록
const servers = [
  { id: 1, name: '메인 서버', icon: '🏠' },
  { id: 2, name: '음성 상담', icon: '🎤' },
  { id: 3, name: '수어 연습', icon: '👋' },
  { id: 4, name: '커뮤니티', icon: '👥' },
];

// 가상의 채널 목록
const channels = [
  { id: 1, name: '일반 채팅', type: 'text' },
  { id: 2, name: '음성 변환 연습', type: 'text' },
  { id: 3, name: '수어 인식 연습', type: 'text' },
  { id: 4, name: '1:1 음성 상담', type: 'voice' },
  { id: 5, name: '그룹 화상 상담', type: 'voice' },
];

// 가상의 온라인 사용자 목록
const onlineUsers = [
  { id: 1, name: '김민수', status: 'online', role: '상담사', avatar: 'https://mui.com/static/images/avatar/1.jpg' },
  { id: 2, name: '이지은', status: 'online', role: '사용자', avatar: 'https://mui.com/static/images/avatar/2.jpg' },
  { id: 3, name: '박준호', status: 'idle', role: '사용자', avatar: 'https://mui.com/static/images/avatar/3.jpg' },
  { id: 4, name: '최유진', status: 'online', role: '사용자', avatar: 'https://mui.com/static/images/avatar/4.jpg' },
  { id: 5, name: '정민우', status: 'dnd', role: '상담사', avatar: 'https://mui.com/static/images/avatar/5.jpg' },
];

const DiscordPage = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [messages, setMessages] = useState(sampleMessages);
  const [anchorEl, setAnchorEl] = useState(null);
  const [showOriginalVoice, setShowOriginalVoice] = useState(false);
  const [activeChannel, setActiveChannel] = useState(channels[0]);
  const [isVideoCall, setIsVideoCall] = useState(false);

  useEffect(() => {
    // 메시지 목록이 업데이트될 때마다 스크롤을 아래로 이동
    const messageList = document.querySelector('.message-list');
    if (messageList) {
      messageList.scrollTop = messageList.scrollHeight;
    }
  }, [messages]);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    navigate('/');
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      const newMessage = {
        id: messages.length + 1,
        user: '김민수',
        content: message,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        avatar: 'https://mui.com/static/images/avatar/1.jpg',
        isUser: false
      };
      setMessages([...messages, newMessage]);
      setMessage('');
      
      // 사용자 응답 시뮬레이션 (실제로는 필요 없음)
      setTimeout(() => {
        const userResponse = {
          id: messages.length + 2,
          user: '이지은',
          content: '네, 알겠습니다. 감사합니다.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          avatar: 'https://mui.com/static/images/avatar/2.jpg',
          isUser: true,
          originalVoice: '네, 알겠씀니다. 감사함니다.'
        };
        setMessages(prev => [...prev, userResponse]);
      }, 2000);
    }
  };

  const handleVoiceRecognition = () => {
    setIsRecording(!isRecording);
    
    // 음성 인식 시작/중지 로직 구현
    if (!isRecording) {
      // 음성 인식 시작 코드
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.lang = 'ko-KR';
        recognition.continuous = false;
        recognition.interimResults = true;
        
        recognition.onresult = (event) => {
          const transcript = Array.from(event.results)
            .map(result => result[0])
            .map(result => result.transcript)
            .join('');
          
          // 구음 장애 발음을 정상 발음으로 변환하는 시뮬레이션
          // 실제로는 AI 모델이 필요합니다
          setMessage(transcript);
        };
        
        recognition.onend = () => {
          setIsRecording(false);
        };
        
        recognition.start();
      } else {
        alert('이 브라우저는 음성 인식을 지원하지 않습니다.');
        setIsRecording(false);
      }
    }
  };

  const handleChannelChange = (channel) => {
    setActiveChannel(channel);
    if (channel.type === 'voice') {
      setIsVideoCall(true);
    } else {
      setIsVideoCall(false);
    }
  };

  const toggleOriginalVoice = () => {
    setShowOriginalVoice(!showOriginalVoice);
  };

  const handleVideoCallEnd = () => {
    setIsVideoCall(false);
    setActiveChannel(channels[0]);
  };

  return (
    <Box className="discord-container">
      {/* 서버 목록 (왼쪽 사이드바) */}
      <Box className="server-sidebar">
        <Box className="server-logo">
          <Typography variant="h6" className="logo-text">말랑</Typography>
        </Box>
        <Divider />
        <List className="server-list">
          {servers.map(server => (
            <Tooltip title={server.name} placement="right" key={server.id}>
              <ListItem button className="server-item">
                <Avatar className="server-icon">{server.icon}</Avatar>
              </ListItem>
            </Tooltip>
          ))}
          <Tooltip title="새 서버 추가" placement="right">
            <ListItem button className="add-server-item">
              <IconButton className="add-server-button">
                <AddIcon />
              </IconButton>
            </ListItem>
          </Tooltip>
        </List>
      </Box>

      {/* 채널 목록 (두 번째 사이드바) */}
      <Box className="channel-sidebar">
        <Box className="server-header">
          <Typography variant="h6">음성 상담</Typography>
          <IconButton>
            <SettingsIcon fontSize="small" />
          </IconButton>
        </Box>
        <Divider />
        <List className="channel-list">
          <ListItem className="channel-category">
            <Typography variant="subtitle2">텍스트 채널</Typography>
          </ListItem>
          {channels.filter(channel => channel.type === 'text').map(channel => (
            <ListItem 
              button 
              key={channel.id} 
              className={`channel-item ${activeChannel.id === channel.id ? 'active' : ''}`}
              onClick={() => handleChannelChange(channel)}
            >
              <ListItemIcon className="channel-icon">
                <TagIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary={channel.name} />
            </ListItem>
          ))}
          <ListItem className="channel-category">
            <Typography variant="subtitle2">음성 채널</Typography>
          </ListItem>
          {channels.filter(channel => channel.type === 'voice').map(channel => (
            <ListItem 
              button 
              key={channel.id} 
              className={`channel-item ${activeChannel.id === channel.id ? 'active' : ''}`}
              onClick={() => handleChannelChange(channel)}
            >
              <ListItemIcon className="channel-icon">
                <VolumeUpIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary={channel.name} />
            </ListItem>
          ))}
        </List>
        <Box className="user-info">
          <Avatar className="user-avatar">상</Avatar>
          <Box className="user-details">
            <Typography variant="subtitle2">김민수</Typography>
            <Typography variant="caption" className="user-status">상담사</Typography>
          </Box>
          <IconButton size="small" onClick={handleMenuOpen}>
            <MoreVertIcon fontSize="small" />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleMenuClose}>
              <ListItemIcon>
                <SettingsIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>설정</ListItemText>
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>로그아웃</ListItemText>
            </MenuItem>
          </Menu>
        </Box>
      </Box>

      {/* 메인 채팅 영역 */}
      <Box className="chat-area">
        {isVideoCall ? (
          // 화상 통화 인터페이스
          <Box className="video-call-container">
            <Box className="video-header">
              <Typography variant="h6">{activeChannel.name}</Typography>
              <Button 
                variant="contained" 
                color="error" 
                startIcon={<VideocamIcon />}
                onClick={handleVideoCallEnd}
              >
                통화 종료
              </Button>
            </Box>
            <Box className="video-grid">
              <Box className="video-item main-video">
                <img 
                  src="https://cdn.pixabay.com/photo/2017/08/01/01/33/beanie-2562646_1280.jpg" 
                  alt="User Video" 
                  className="video-feed"
                />
                <Typography className="video-name">이지은</Typography>
              </Box>
              <Box className="video-item">
                <img 
                  src="https://cdn.pixabay.com/photo/2016/11/21/12/42/beard-1845166_1280.jpg" 
                  alt="Counselor Video" 
                  className="video-feed"
                />
                <Typography className="video-name">김민수 (상담사)</Typography>
              </Box>
            </Box>
            <Box className="video-controls">
              <Tooltip title="마이크 켜기/끄기">
                <IconButton className="video-control-button">
                  <MicIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="비디오 켜기/끄기">
                <IconButton className="video-control-button">
                  <VideocamIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="화면 공유">
                <IconButton className="video-control-button">
                  <TranslateIcon />
                </IconButton>
              </Tooltip>
            </Box>
            <Box className="transcription-panel">
              <Typography variant="h6" className="transcription-title">
                실시간 음성 변환
                <Tooltip title={showOriginalVoice ? "변환된 텍스트 보기" : "원본 음성 텍스트 보기"}>
                  <IconButton size="small" onClick={toggleOriginalVoice}>
                    <TranslateIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Typography>
              <Paper className="transcription-content">
                <Typography>
                  {showOriginalVoice 
                    ? "요즘 의사소통에 어려움을 겪고 이써요. 사람들이 제 말을 잘 알아듣지 못해서 답답함니다."
                    : "요즘 의사소통에 어려움을 겪고 있어요. 사람들이 제 말을 잘 알아듣지 못해서 답답합니다."}
                </Typography>
              </Paper>
            </Box>
          </Box>
        ) : (
          // 일반 채팅 인터페이스
          <>
            <Box className="chat-header">
              <TagIcon className="channel-icon" />
              <Typography variant="h6">{activeChannel.name}</Typography>
              <Typography variant="body2" className="channel-description">
                구음 장애인을 위한 채팅 채널입니다. 음성을 텍스트로 변환하여 소통할 수 있습니다.
              </Typography>
              <Box sx={{ flexGrow: 1 }} />
              <Tooltip title="화상 통화 시작">
                <IconButton onClick={() => handleChannelChange(channels[3])}>
                  <VideocamIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title={showOriginalVoice ? "변환된 텍스트 보기" : "원본 음성 텍스트 보기"}>
                <IconButton onClick={toggleOriginalVoice}>
                  <TranslateIcon />
                </IconButton>
              </Tooltip>
            </Box>
            <Divider />
            
            {/* 메시지 목록 */}
            <Box className="message-list">
              {messages.map(msg => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`message-item ${msg.isUser ? 'user-message' : ''}`}
                >
                  <Avatar src={msg.avatar} className="message-avatar" />
                  <Box className="message-content">
                    <Box className="message-header">
                      <Typography variant="subtitle2" className="message-user">
                        {msg.user}
                        {msg.isUser && (
                          <Typography variant="caption" className="user-role">
                            사용자
                          </Typography>
                        )}
                      </Typography>
                      <Typography variant="caption" className="message-time">{msg.time}</Typography>
                    </Box>
                    <Typography variant="body1">
                      {msg.isUser && showOriginalVoice && msg.originalVoice ? msg.originalVoice : msg.content}
                    </Typography>
                    {msg.isUser && msg.originalVoice && showOriginalVoice && (
                      <Typography variant="caption" className="translation-note">
                        (원본 음성)
                      </Typography>
                    )}
                  </Box>
                </motion.div>
              ))}
            </Box>
            
            {/* 메시지 입력 영역 */}
            <Paper className="message-input-container">
              <Tooltip title="음성 인식">
                <IconButton 
                  className={`voice-button ${isRecording ? 'recording' : ''}`}
                  onClick={handleVoiceRecognition}
                >
                  <MicIcon />
                </IconButton>
              </Tooltip>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="메시지를 입력하거나 마이크 버튼을 눌러 말하세요..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="message-input"
              />
              <Tooltip title="이모티콘">
                <IconButton className="emoji-button">
                  <EmojiEmotionsIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="전송">
                <IconButton 
                  className="send-button"
                  onClick={handleSendMessage}
                  disabled={!message.trim()}
                >
                  <SendIcon />
                </IconButton>
              </Tooltip>
            </Paper>
          </>
        )}
      </Box>

      {/* 사용자 목록 (오른쪽 사이드바) */}
      <Box className="users-sidebar">
        <List className="user-list">
          <ListItem className="user-category">
            <Typography variant="subtitle2">상담사 - {onlineUsers.filter(u => u.role === '상담사' && u.status === 'online').length}</Typography>
          </ListItem>
          {onlineUsers.filter(u => u.role === '상담사' && u.status === 'online').map(user => (
            <ListItem button key={user.id} className="user-item">
              <ListItemIcon>
                <Badge
                  overlap="circular"
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  badgeContent={
                    <Box className={`status-indicator ${user.status}`} />
                  }
                >
                  <Avatar src={user.avatar} className="user-avatar" />
                </Badge>
              </ListItemIcon>
              <ListItemText 
                primary={user.name} 
                secondary={user.role}
                primaryTypographyProps={{ variant: 'body2' }}
                secondaryTypographyProps={{ variant: 'caption' }}
              />
            </ListItem>
          ))}
          <ListItem className="user-category">
            <Typography variant="subtitle2">사용자 - {onlineUsers.filter(u => u.role === '사용자' && u.status === 'online').length}</Typography>
          </ListItem>
          {onlineUsers.filter(u => u.role === '사용자' && u.status === 'online').map(user => (
            <ListItem button key={user.id} className="user-item">
              <ListItemIcon>
                <Badge
                  overlap="circular"
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  badgeContent={
                    <Box className={`status-indicator ${user.status}`} />
                  }
                >
                  <Avatar src={user.avatar} className="user-avatar" />
                </Badge>
              </ListItemIcon>
              <ListItemText 
                primary={user.name} 
                secondary={user.role}
                primaryTypographyProps={{ variant: 'body2' }}
                secondaryTypographyProps={{ variant: 'caption' }}
              />
            </ListItem>
          ))}
          <ListItem className="user-category">
            <Typography variant="subtitle2">자리비움 - {onlineUsers.filter(u => u.status === 'idle').length}</Typography>
          </ListItem>
          {onlineUsers.filter(u => u.status === 'idle').map(user => (
            <ListItem button key={user.id} className="user-item">
              <ListItemIcon>
                <Badge
                  overlap="circular"
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  badgeContent={
                    <Box className={`status-indicator ${user.status}`} />
                  }
                >
                  <Avatar src={user.avatar} className="user-avatar" />
                </Badge>
              </ListItemIcon>
              <ListItemText 
                primary={user.name} 
                secondary={user.role}
                primaryTypographyProps={{ variant: 'body2' }}
                secondaryTypographyProps={{ variant: 'caption' }}
              />
            </ListItem>
          ))}
        </List>
      </Box>
    </Box>
  );
};

export default DiscordPage;
