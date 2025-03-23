// src/pages/LoginPage.js
import React, { useState } from 'react';
import useAuthStore from '../store/authStore';
import { 
    Typography, 
    Box, 
    Button, 
    TextField, 
    Dialog, 
    DialogContent, 
    DialogTitle, 
    IconButton,
    Container,
    Paper
  } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/LoginPage.css';

const LoginPage = ({ open, onClose, isModal = false }) => {
  const navigate = useNavigate();
  const login = useAuthStore(state => state.login);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    
    if (!username.trim() || !password.trim()) {
      setError('아이디와 비밀번호를 모두 입력해주세요.');
      return;
    }
    
    if (username === 'counselor' && password === 'password') {
      login(username);
      if (isModal && onClose) {
        onClose();
      }
      navigate('/');
    } else {
      setError('아이디 또는 비밀번호가 일치하지 않습니다.');
    }
  };

  // 모달 형태로 사용될 때의 렌더링
  if (isModal) {
    return (
      <Dialog 
        open={open} 
        onClose={onClose}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          style: {
            borderRadius: '4px',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
            overflow: 'visible'
          }
        }}
      >
        <Box className="login-container">
          <Box className="login-header">
            <div className="login-header-line"></div>
            <IconButton 
              aria-label="close" 
              onClick={onClose}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
                color: (theme) => theme.palette.grey[500],
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
          
          <DialogTitle className="login-title">
            Log in
          </DialogTitle>
          
          <DialogContent>
            <Box component="form" onSubmit={handleLogin} className="login-form">
              {/* 폼 내용 */}
              {/* ... */}
            </Box>
          </DialogContent>
        </Box>
      </Dialog>
    );
  }

  // 독립적인 페이지로 사용될 때의 렌더링
  return (
    <div className="login-page">
      <Header />
      
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Paper elevation={0} className="login-page-container">
          <Box className="login-header">
            <div className="login-header-line"></div>
          </Box>
          
          <Typography variant="h4" component="h1" className="login-title" sx={{ pt: 4, pb: 2, px: 4 }}>
            Log in
          </Typography>
          
          <Box component="form" onSubmit={handleLogin} className="login-form" sx={{ px: 4, pb: 4 }}>
            <TextField
              fullWidth
              label="Id"
              variant="standard"
              margin="normal"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              sx={{ mb: 4 }}
            />
            
            <TextField
              fullWidth
              label="Password"
              type="password"
              variant="standard"
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{ mb: 4 }}
            />
            
            {error && (
              <Typography color="error" variant="body2" className="error-message" sx={{ mb: 2 }}>
                {error}
              </Typography>
            )}
            
            <Box className="login-actions">
              <Button 
                variant="text" 
                color="primary"
                sx={{ textTransform: 'none' }}
              >
                Forgot Password
              </Button>
              
              <Button 
                variant="contained" 
                color="primary"
                type="submit"
                className="login-button"
              >
                Log in
              </Button>
            </Box>
          </Box>
        </Paper>
      </Container>
      
      <Footer />
    </div>
  );
};

export default LoginPage;
