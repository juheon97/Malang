// src/pages/RegisterPage.js
import React, { useState } from 'react';
import { Container, Paper, Typography, TextField, Button, Box, Tabs, Tab, Radio, RadioGroup, FormControlLabel, FormControl, FormLabel } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import '../styles/RegisterPage.css';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [userType, setUserType] = useState('일반인 사용자');
  const [name, setName] = useState('');
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [hasDisability, setHasDisability] = useState('예');
  const [specialization, setSpecialization] = useState('');

  const handleUserTypeChange = (event, newValue) => {
    setUserType(newValue);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // 회원가입 처리 로직
    console.log({
      userType,
      name,
      id,
      password,
      hasDisability: userType === '일반인 사용자' ? hasDisability : null,
      specialization: userType === '상담사' ? specialization : null
    });
    
    // 회원가입 성공 후 로그인 페이지로 이동
    navigate('/');
  };

  return (
    <Box className="register-page">
      <Container maxWidth="sm">
        <Box className="register-header">
          <Typography variant="h6" color="textSecondary">
            {userType === '일반인 사용자' ? '일반 사용자 회원가입' : '상담사 회원가입'}
          </Typography>
        </Box>
        
        <Paper elevation={0} className="register-form-container">
          <Typography variant="h4" component="h1" className="register-title">
            회원가입
          </Typography>
          
          <Tabs
            value={userType}
            onChange={handleUserTypeChange}
            variant="fullWidth"
            indicatorColor="primary"
            textColor="primary"
            className="user-type-tabs"
          >
            <Tab value="일반인 사용자" label="일반인 사용자" />
            <Tab value="상담사" label="상담사" />
          </Tabs>
          
          <Box component="form" onSubmit={handleSubmit} className="register-form">
            <TextField
              fullWidth
              label="이름"
              variant="outlined"
              margin="normal"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            
            <TextField
              fullWidth
              label="아이디"
              variant="outlined"
              margin="normal"
              value={id}
              onChange={(e) => setId(e.target.value)}
              required
            />
            
            <TextField
              fullWidth
              label="비밀번호"
              type="password"
              variant="outlined"
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            
            {userType === '일반인 사용자' ? (
              <FormControl component="fieldset" margin="normal">
                <FormLabel component="legend">장애인 여부:</FormLabel>
                <RadioGroup
                  row
                  value={hasDisability}
                  onChange={(e) => setHasDisability(e.target.value)}
                >
                  <FormControlLabel value="예" control={<Radio color="primary" />} label="예" />
                  <FormControlLabel value="아니오" control={<Radio color="primary" />} label="아니오" />
                </RadioGroup>
              </FormControl>
            ) : (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>자격증 첨부:</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    size="small"
                    disabled
                    value={specialization}
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    sx={{ ml: 1, minWidth: '80px' }}
                  >
                    파일 찾기
                  </Button>
                </Box>
              </Box>
            )}
            
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              className="register-button"
              sx={{ mt: 3 }}
            >
              회원가입
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default RegisterPage;
