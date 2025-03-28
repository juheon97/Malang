import React, { useEffect } from 'react';
import Navbar from './Navbar';

const Layout = ({ children }) => {
  useEffect(() => {
    // 전역적으로 스크롤바를 항상 표시하도록 설정
    const originalStyle = window.getComputedStyle(document.body).overflowY;
    document.body.style.overflowY = 'scroll';

    // 스크롤바 너비 계산 및 적용
    const scrollBarWidth =
      window.innerWidth - document.documentElement.clientWidth;
    document.documentElement.style.setProperty(
      '--scrollbar-width',
      `${scrollBarWidth}px`,
    );

    return () => {
      // 컴포넌트 언마운트 시 원래대로 복원
      document.body.style.overflowY = originalStyle;
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 w-full px-4 mx-auto sm:px-6 md:px-8 lg:px-10 max-w-7xl">
        {children}
      </main>
    </div>
  );
};

export default Layout;
