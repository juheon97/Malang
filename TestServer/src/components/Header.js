// components/Header.js
import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const Header = () => {
  const navigate = useNavigate();
  const isLoggedIn = useAuthStore(state => state.isLoggedIn);
  const username = useAuthStore(state => state.username);
  const logout = useAuthStore(state => state.logout);
  
  // useEffect(() => {
  //   // 로그인 상태 확인
  //   const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
  //   const storedUsername = localStorage.getItem('username');
    
  //   setIsLoggedIn(loggedIn);
  //   if (storedUsername) {
  //     setUsername(storedUsername);
  //   }
  // }, []);
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  return (
    <AppBar position="static" color="transparent" elevation={0}>
      <Toolbar>
        <Typography variant="h6" component={Link} to="/" style={{ textDecoration: 'none', color: '#00a884', flexGrow: 1 }}>
          말랑
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button color="inherit" component={Link} to="/discord">소통업</Button>
          <Button color="inherit" component={Link} to="/수어방">수어방</Button>
          <Button color="inherit" component={Link} to="/상담방">상담방</Button>
          <Button color="inherit" component={Link} to="/커뮤니티">커뮤니티</Button>
          
          {isLoggedIn ? (
            <>
              <Button 
                variant="contained" 
                color="primary" 
                sx={{ borderRadius: '20px', bgcolor: '#4caf50' }}
              >
                my
              </Button>
              <Button 
                variant="contained" 
                color="primary"
                onClick={handleLogout}
                sx={{ borderRadius: '20px', bgcolor: '#4caf50' }}
              >
                Log out
              </Button>
            </>
          ) : (
            <>
              <Button color="inherit" component={Link} to="/login">로그인</Button>
              <Button color="inherit" component={Link} to="/register">회원가입</Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
