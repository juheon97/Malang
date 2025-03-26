import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { currentUser, isLoading } = useAuth();
  const location = useLocation();

  // 인증 상태 로딩 중이면 로딩 표시
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        로딩 중...
      </div>
    );
  }

  // 인증되지 않은 사용자는 로그인 페이지로 리다이렉트
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // 역할 제한이 있고 사용자의 역할이 허용되지 않으면 접근 거부
  if (
    allowedRoles &&
    Array.isArray(allowedRoles) &&
    allowedRoles.length > 0 &&
    currentUser.role &&
    !allowedRoles.includes(currentUser.role)
  ) {
    // 권한 없음 페이지로 리다이렉트
    return <Navigate to="/" replace />;
  }

  // 인증 및 권한 확인을 통과하면 자식 컴포넌트 렌더링
  return children;
};

export default ProtectedRoute;
