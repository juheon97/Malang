// src/components/login/Login.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// 이미지 import
import redCircle from '../../assets/image/login/login_red_circle.svg';
import greenCircle from '../../assets/image/login/login_green_circle.svg';
import yellowCircle from '../../assets/image/login/login_yellow_circle.svg';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // navbar 높이를 저장할 상태
  const [navbarHeight, setNavbarHeight] = useState(0);

  // 컴포넌트 마운트 시 navbar 높이를 측정
  useEffect(() => {
    const navbar = document.querySelector('nav');
    if (navbar) {
      setNavbarHeight(navbar.offsetHeight);
    }
  }, []);

  const handleLogin = e => {
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
    <>
      {/* 
        배경 이미지들 - absolute로 변경하고 Navbar 아래에 배치.
        이미지는 viewport 전체가 아닌 main 컨텐츠 영역만 커버하도록 설정
      */}
      <div
        className="absolute inset-0 w-full h-full overflow-hidden"
        style={{ top: navbarHeight }} // navbar 높이만큼 아래로 이동
      >
        {/* 좌상단 빨간 원 */}
        <div className="absolute -top-64 -left-64 w-[700px] h-[700px]">
          <img src={redCircle} alt="Red Circle" className="w-full h-full" />
        </div>

        {/* 우상단 초록 원 */}
        <div className="absolute -top-64 -right-64 w-[700px] h-[700px]">
          <img src={greenCircle} alt="Green Circle" className="w-full h-full" />
        </div>

        {/* 우하단 노란 원 */}
        <div className="absolute -bottom-64 -right-64 w-[700px] h-[700px]">
          <img
            src={yellowCircle}
            alt="Yellow Circle"
            className="w-full h-full"
          />
        </div>
      </div>

      {/* 로그인 콘텐츠 */}
      <div className="w-full min-h-screen flex justify-center items-start pt-32 relative">
        {/* 로그인 카드 */}
        <div className="w-full max-w-lg py-14 px-10 bg-white border-t-4 border-mallang-green shadow-lg relative z-1">
          <h1 className="text-4xl font-bold text-mallang-green mb-10 text-left">
            Log in
          </h1>

          <form className="w-full" onSubmit={handleLogin}>
            <div className="mb-6">
              <input
                type="text"
                className="w-full py-4 px-0 border-0 border-b border-gray-400 text-base outline-none transition-colors duration-300 bg-transparent focus:border-mallang-green placeholder-gray-400"
                placeholder="Id"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="mb-6">
              <input
                type="password"
                className="w-full py-4 px-0 border-0 border-b border-gray-400 text-base outline-none transition-colors duration-300 bg-transparent focus:border-mallang-green placeholder-gray-400"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="flex justify-between items-center mt-10 pb-5">
              <button
                type="button"
                className="bg-transparent border-0 text-gray-500 cursor-pointer text-base transition-colors duration-300 hover:text-mallang-green"
                onClick={handleForgotPassword}
              >
                Forgot Password
              </button>

              <button
                type="submit"
                className="bg-mallang-green text-white border-0 rounded-full py-3 px-10 text-lg font-medium cursor-pointer transition-colors duration-300 hover:bg-green-800"
              >
                Log in
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default Login;
