import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authApi from '../api/authApi';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // 컴포넌트 마운트 시 로컬 스토리지에서 사용자 정보 불러오기
  useEffect(() => {
    const loadUserFromStorage = () => {
      try {
        const storedUser = sessionStorage.getItem('user');
        const token = sessionStorage.getItem('token');

        if (storedUser && token) {
          setCurrentUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('사용자 정보 로드 오류:', error);
        // 오류 발생 시 세션 스토리지 데이터 제거
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('refreshToken');
      } finally {
        setIsLoading(false);
      }
    };

    loadUserFromStorage();

    // 다른 탭에서 로그인/로그아웃 시 동기화
    const handleStorageChange = e => {
      if (e.key === 'user' || e.key === 'token') {
        loadUserFromStorage();
      }
    };

    // authApi에서 발생시키는 로그아웃 이벤트 처리
    const handleLogout = () => {
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('refreshToken');
      setCurrentUser(null);
      navigate('/login', { replace: true });
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('auth:logout', handleLogout);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth:logout', handleLogout);
    };
  }, [navigate]);

  const login = async (email, password) => {
    try {
      setError(null);
      const response = await authApi.login(email, password);

      console.log('전체 로그인 응답:', response.data);
      console.log('Login response:', response.data);

      // 응답에서 필요한 데이터 추출
      const { accessToken, refreshToken, token, userId, nickname } =
        response.data;

      // JWT 토큰에서 role 정보 추출
      let role = undefined;
      try {
        const tokenPayload = JSON.parse(atob(accessToken.split('.')[1]));
        role = tokenPayload.auth; // "ROLE_USER" 또는 "ROLE_COUNSELOR" 등
      } catch (e) {
        console.error('토큰 파싱 오류:', e);
      }

      // accessToken이나 token 중 하나를 사용
      const authToken = accessToken || token;

      if (!authToken) {
        throw new Error('토큰이 제공되지 않았습니다.');
      }

      // 토큰 저장
      sessionStorage.setItem('token', authToken);

      // refreshToken 저장
      if (refreshToken) {
        sessionStorage.setItem('refreshToken', refreshToken);
      }

      // 사용자 정보 구성 - 응답 구조에 맞게 수정
      const userInfo = {
        id: userId,
        username: nickname,
        role: role, // JWT에서 추출한 역할 정보
      };

      sessionStorage.setItem('user', JSON.stringify(userInfo));
      setCurrentUser(userInfo);

      return userInfo;
    } catch (error) {
      console.error('로그인 오류:', error);
      setError(error.response?.data?.message || '로그인에 실패했습니다.');
      throw error;
    }
  };

  // 로그아웃 함수
  const logout = () => {
    // 현재 사용자가 상담사인 경우 활성 상태에서 제거
    if (currentUser && currentUser.role === 'ROLE_COUNSELOR') {
      try {
        const activeUsers = JSON.parse(
          sessionStorage.getItem('loggedInUsers') || '[]',
        );
        const updatedActiveUsers = activeUsers.filter(
          id => id !== currentUser.id,
        );
        sessionStorage.setItem(
          'loggedInUsers',
          JSON.stringify(updatedActiveUsers),
        );
      } catch (err) {
        console.error('활성 상태 업데이트 실패:', err);
      }
    }

    sessionStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('refreshToken');
    setCurrentUser(null);
    navigate('/home');
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        login,
        logout,
        isLoading,
        isAuthenticated: !!currentUser,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;
