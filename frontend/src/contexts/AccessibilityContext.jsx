import React, { createContext, useState, useContext, useEffect } from 'react';

// 접근성 모드 관리를 위한 컨텍스트 생성
const AccessibilityContext = createContext();

export const AccessibilityProvider = ({ children }) => {
  const [isAccessibleMode, setIsAccessibleMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 컴포넌트 마운트 시 세션 스토리지에서 사용자 설정 불러오기
  useEffect(() => {
    const loadAccessibilitySettings = () => {
      try {
        const userSettings = JSON.parse(
          sessionStorage.getItem('userSettings') || '{}',
        );
        if (userSettings.isVisuallyImpaired) {
          setIsAccessibleMode(true);
        }
      } catch (error) {
        console.error('접근성 설정 로드 오류:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAccessibilitySettings();

    // 다른 탭에서 설정 변경 시 동기화
    const handleStorageChange = e => {
      if (e.key === 'userSettings') {
        loadAccessibilitySettings();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // 접근성 모드 토글 함수
  const toggleAccessibleMode = () => {
    const newMode = !isAccessibleMode;
    setIsAccessibleMode(newMode);

    // 세션 스토리지 업데이트
    sessionStorage.setItem(
      'userSettings',
      JSON.stringify({ isVisuallyImpaired: newMode }),
    );
  };

  // 접근성 모드 직접 설정 함수
  const setAccessibleMode = value => {
    setIsAccessibleMode(value);

    // 세션 스토리지 업데이트
    sessionStorage.setItem(
      'userSettings',
      JSON.stringify({ isVisuallyImpaired: value }),
    );
  };

  return (
    <AccessibilityContext.Provider
      value={{
        isAccessibleMode,
        toggleAccessibleMode,
        setAccessibleMode,
        isLoading,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
};

// 커스텀 훅 생성
export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error(
      'useAccessibility must be used within an AccessibilityProvider',
    );
  }
  return context;
};

export default AccessibilityContext;
