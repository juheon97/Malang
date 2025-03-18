// src/components/home/Login.jsx - 클래스명 변경
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/Login.css';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    // 여기에 로그인 로직을 구현하세요
    console.log('로그인 시도:', email, password);
    // 로그인 성공 시 홈으로 이동
    // navigate('/');
  };

  const handleForgotPassword = () => {
    // 비밀번호 찾기 기능 구현
    console.log('비밀번호 찾기');
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">Log in</h1>
        
        <form className="login-form" onSubmit={handleLogin}>
          <div className="login-form-group">
            <input 
              type="text" 
              className="login-form-input" 
              placeholder="Id"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="login-form-group">
            <input 
              type="password" 
              className="login-form-input" 
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <div className="login-form-actions">
            <button 
              type="button" 
              className="forgot-password-btn"
              onClick={handleForgotPassword}
            >
              Forgot Password
            </button>
            
            <button 
              type="submit" 
              className="login-page-submit-btn"
            >
              Log in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;