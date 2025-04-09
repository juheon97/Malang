import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { validateEmail } from '../../utils/authUtils';

// 이미지 import
import redCircle from '../../assets/image/login/login_red_circle.svg';
import greenCircle from '../../assets/image/login/login_green_circle.svg';
import yellowCircle from '../../assets/image/login/login_yellow_circle.svg';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, error: authError } = useAuth(); // AuthContext에서 login 함수와 error 상태 가져오기

  // 폼 상태
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // navbar 높이를 저장할 상태
  const [navbarHeight, setNavbarHeight] = useState(0);

  // 컴포넌트 마운트 시 navbar 높이를 측정하고 저장된 이메일 불러오기
  useEffect(() => {
    const navbar = document.querySelector('nav');
    if (navbar) {
      setNavbarHeight(navbar.offsetHeight);
    }

    // 이미 로그인한 사용자는 홈으로 리다이렉트
    const token = sessionStorage.getItem('token');
    if (token) {
      navigate('/');
      return;
    }

    // 저장된 이메일이 있으면 불러오기
    const savedEmail = sessionStorage.getItem('rememberedEmail');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }

    // 이전 페이지에서 전달된 메시지가 있으면 표시
    const state = location.state;
    if (state && state.message) {
      setError(state.message);
    }
  }, [navigate, location]);

  // AuthContext의 에러 상태가 변경되면 반영
  useEffect(() => {
    if (authError) {
      setError(authError);
    }
  }, [authError]);

  const validateForm = () => {
    const errors = {};
    let isValid = true;

    // 이메일 검사
    if (!email.trim()) {
      errors.email = '이메일을 입력해주세요.';
      isValid = false;
    } else if (!validateEmail(email)) {
      errors.email = '유효한 이메일 형식이 아닙니다.';
      isValid = false;
    }

    // 비밀번호 검사
    if (!password.trim()) {
      errors.password = '비밀번호를 입력해주세요.';
      isValid = false;
    }

    setFieldErrors(errors);
    return isValid;
  };

  const handleLogin = async e => {
    e.preventDefault(); // 폼 제출의 기본 동작 방지 (페이지 새로고침 방지)
    setError('');
    setFieldErrors({});

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // 이메일 기억하기 처리
      if (rememberMe) {
        sessionStorage.setItem('rememberedEmail', email);
      } else {
        sessionStorage.removeItem('rememberedEmail');
      }

      // AuthContext의 login 함수 사용
      await login(email, password);

      // 수정된 부분: 항상 메인 화면으로 리다이렉트
      navigate('/', { replace: true });
    } catch (error) {
      console.error('로그인 실패:', error);

      // 서버 에러 메시지 처리
      if (error.response && error.response.data) {
        if (error.response.data.fieldErrors) {
          setFieldErrors(error.response.data.fieldErrors);
        } else {
          setError(error.response.data.message || '로그인에 실패했습니다.');
        }
      } else if (error.message) {
        setError(error.message);
      } else {
        setError(
          '로그인 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = () => {
    navigate('/forgot-password');
  };

  return (
    <>
      {/* 배경 이미지들 */}
      <div
        className="absolute inset-0 w-full h-full overflow-hidden"
        style={{ top: navbarHeight }} // navbar 높이만큼 아래로 이동
      >
        {/* 좌상단 빨간 원 */}
        <div className="absolute -top-64 -left-64 w-[600px] h-[600px]">
          <img src={redCircle} alt="Red Circle" className="w-full h-full" />
        </div>

        {/* 우상단 초록 원 */}
        <div className="absolute -top-64 -right-64 w-[700px] h-[600px]">
          <img src={greenCircle} alt="Green Circle" className="w-full h-full" />
        </div>

        {/* 우하단 노란 원 */}
        <div className="absolute -bottom-64 -right-64 w-[900px] h-[800px]">
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

          <form className="w-full" onSubmit={handleLogin} noValidate>
            {/* 에러 메시지 표시 */}
            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                {error}
              </div>
            )}

            <div className="mb-6">
              <input
                type="email"
                className={`w-full py-4 px-0 border-0 border-b ${
                  fieldErrors.email ? 'border-red-500' : 'border-gray-400'
                } text-base outline-none transition-colors duration-300 bg-transparent focus:border-mallang-green placeholder-gray-400`}
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
              {fieldErrors.email && (
                <span className="text-red-500 text-sm mt-1">
                  {fieldErrors.email}
                </span>
              )}
            </div>

            <div className="mb-6">
              <input
                type="password"
                className={`w-full py-4 px-0 border-0 border-b ${
                  fieldErrors.password ? 'border-red-500' : 'border-gray-400'
                } text-base outline-none transition-colors duration-300 bg-transparent focus:border-mallang-green placeholder-gray-400`}
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              {fieldErrors.password && (
                <span className="text-red-500 text-sm mt-1">
                  {fieldErrors.password}
                </span>
              )}
            </div>

            {/* 이메일 기억하기 체크박스 */}
            <div className="flex items-center mb-6">
              <input
                type="checkbox"
                id="remember-me"
                className="mr-2 h-4 w-4 text-mallang-green"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
              />
              <label
                htmlFor="remember-me"
                className="text-gray-600 cursor-pointer"
              >
                이메일 기억하기
              </label>
            </div>

            <div className="flex justify-between items-center mt-10 pb-5">
              <div className="flex space-x-4">
                <button
                  type="button"
                  className="bg-transparent border-0 text-gray-500 cursor-pointer text-base transition-colors duration-300 hover:text-mallang-green"
                  onClick={handleForgotPassword}
                >
                  비밀번호 찾기
                </button>

                <button
                  type="button"
                  className="bg-transparent border-0 text-gray-500 cursor-pointer text-base transition-colors duration-300 hover:text-mallang-green"
                  onClick={() => navigate('/signup')}
                >
                  회원가입
                </button>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`bg-mallang-green text-white border-0 rounded-full py-3 px-10 text-lg font-medium cursor-pointer transition-colors duration-300 ${
                  isSubmitting
                    ? 'opacity-70 cursor-not-allowed'
                    : 'hover:bg-green-800'
                }`}
              >
                {isSubmitting ? '처리 중...' : '로그인'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default Login;
