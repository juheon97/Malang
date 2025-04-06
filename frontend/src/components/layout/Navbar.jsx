import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import MalangLogo from '../../assets/image/Malang_logo.svg';

const Navbar = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  // 상담사 여부 확인
  const isCounselor = currentUser?.role === 'ROLE_COUNSELOR';

  // 폰트 및 이미지 로딩 완료 상태 확인
  useEffect(() => {
    // 폰트 로딩 확인
    document.fonts.ready.then(() => {
      setFontsLoaded(true);
    });

    // 스크롤바 문제를 방지하기 위한 CSS 추가
    document.body.style.overflowY = 'scroll'; // 항상 스크롤바 공간 확보

    return () => {
      // 컴포넌트 언마운트 시 원래대로 복원 (선택적)
      // document.body.style.overflowY = '';
    };
  }, []);

  // 외부 클릭 감지를 위한 이벤트 핸들러
  useEffect(() => {
    const handleClickOutside = event => {
      // 드롭다운이 열려 있고, 클릭이 드롭다운 외부에서 발생했고, 버튼 클릭이 아닌 경우
      if (
        isOpen &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    // 이벤트 리스너 등록
    document.addEventListener('mousedown', handleClickOutside);

    // 클린업 함수
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // 로그아웃 처리
  const handleLogout = () => {
    logout(); // AuthContext의 로그아웃 함수 사용
    navigate('/');
  };

  // 폰트 로딩 전 스타일
  const navbarStyle = {
    visibility: fontsLoaded ? 'visible' : 'hidden',
    height: '64px', // h-16과 동일
    width: '100%',
    position: 'sticky', // 페이지 스크롤에도 고정
    top: 0,
    left: 0,
    zIndex: 50,
  };

  // 로고 이미지에 대한 고정 크기 스타일
  const logoStyle = {
    height: '26px', // h-6.5과 유사
    width: 'auto',
    marginRight: '10px', // mr-2.5
    marginTop: '2px', // mt-0.5
    position: 'relative',
    top: '2px',
  };

  // 브랜드 텍스트에 대한 스타일
  const brandTextStyle = {
    fontFamily: "'HancomMalangMalang-Regular', sans-serif",
    fontSize: '1.875rem', // text-3xl
    fontWeight: 'bold',
    color: 'black',
    visibility: fontsLoaded ? 'visible' : 'hidden',
  };

  const renderUserUI = () => {
    if (!currentUser) return null;

    // 상담사인 경우: my 버튼과 Log out 버튼 표시
    if (isCounselor) {
      return (
        <>
          <Link
            to="/mypage"
            className="bg-[#00a173] text-white py-2 px-6 rounded-full hover:bg-[#00795c] transition-colors"
          >
            my
          </Link>
          <button
            onClick={handleLogout}
            className="bg-[#00a173] text-white py-2 px-6 rounded-full hover:bg-[#00795c] transition-colors"
          >
            Log out
          </button>
        </>
      );
    } else {
      // 일반 사용자인 경우: 닉네임과 Log out 버튼 표시
      return (
        <>
          <span className="text-gray-800">
            {currentUser.username || currentUser.nickname || '사용자'}님
            반갑습니다
          </span>
          <button
            onClick={handleLogout}
            className="bg-[#00a173] text-white py-2 px-6 rounded-full hover:bg-[#00795c] transition-colors"
          >
            Log out
          </button>
        </>
      );
    }
  };

  return (
    <nav className="bg-[#f5fdf5] shadow-sm" style={navbarStyle}>
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <div style={{ width: logoStyle.width, height: logoStyle.height }}>
                <img
                  src={MalangLogo}
                  alt="말랑 로고"
                  style={logoStyle}
                  onLoad={() => {
                    // 이미지 로드 완료 처리
                  }}
                />
              </div>
              <span style={brandTextStyle}>말랑</span>
            </Link>
          </div>

          {/* 주요 네비게이션 메뉴 - 컴퓨터 화면 */}
          <div className="hidden md:flex items-center space-x-6">
            {/* 상담사인 경우: 방 생성과 상담채널 메뉴 표시 */}
            {isCounselor ? (
              <>
                <Link
                  to="/counsel-channel-room"
                  className="text-gray-800 hover:text-[#00a173]"
                >
                  방 생성
                </Link>
                <Link
                  to="/counsel-channel"
                  className="text-gray-800 hover:text-[#00a173]"
                >
                  상담채널
                </Link>
              </>
            ) : (
              /* 상담사가 아닌 경우에만 음성변환, 음성채널, 커뮤니티 메뉴 표시 */
              <>
               <Link
                  to="/self-diagnosis"
                  className="text-gray-800 hover:text-[#00a173]"
                >
                  자가진단
                </Link>
                <Link
                  to="/voice-change"
                  className="text-gray-800 hover:text-[#00a173]"
                >
                  음성변환
                </Link>
                <Link
                  to="/voice-channel"
                  className="text-gray-800 hover:text-[#00a173]"
                >
                  음성채널
                </Link>
                <Link
                  to="/counsel-channel"
                  className="text-gray-800 hover:text-[#00a173]"
                >
                  상담채널
                </Link>
                <div className="relative">
                  <button
                    ref={buttonRef}
                    className="flex items-center text-gray-800 hover:text-[#00a173]"
                    onClick={() => setIsOpen(!isOpen)}
                  >
                    커뮤니티
                    <svg
                      className="w-4 h-4 ml-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      ></path>
                    </svg>
                  </button>

                  {isOpen && (
                    <div
                      ref={dropdownRef}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10"
                    >
                      <Link
                        to="/community"
                        className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                        onClick={() => setIsOpen(false)}
                      >
                        커뮤니티 홈
                      </Link>
                      <Link
                        to="/community/write"
                        className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                        onClick={() => setIsOpen(false)}
                      >
                        글쓰기
                      </Link>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* 로그인/로그아웃 영역 - 로그인 상태에 따른 UI만 표시 */}
            <div className="flex items-center space-x-4">{renderUserUI()}</div>
          </div>

          {/* 모바일 버튼 */}
          <div className="md:hidden flex items-center">
            <button
              className="text-gray-800 hover:text-[#00a173] focus:outline-none"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {menuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* 모바일 메뉴 */}
      {menuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white shadow-lg">
            {/* 상담사인 경우: 방 생성과 상담채널 메뉴 표시 */}
            {isCounselor ? (
              <>
                <Link
                  to="/counsel-channel-room"
                  className="block px-3 py-2 text-gray-800 hover:bg-gray-100 rounded-md"
                >
                  방 생성
                </Link>
                <Link
                  to="/counsel-channel"
                  className="block px-3 py-2 text-gray-800 hover:bg-gray-100 rounded-md"
                >
                  상담채널
                </Link>
              </>
            ) : (
              /* 상담사가 아닌 경우에만 음성변환, 음성채널, 커뮤니티 메뉴 표시 */
              <>
                <Link
                  to="/voice-change"
                  className="block px-3 py-2 text-gray-800 hover:bg-gray-100 rounded-md"
                >
                  음성변환
                </Link>
                <Link
                  to="/voice-channel"
                  className="block px-3 py-2 text-gray-800 hover:bg-gray-100 rounded-md"
                >
                  음성채널
                </Link>
                <Link
                  to="/counsel-channel"
                  className="block px-3 py-2 text-gray-800 hover:bg-gray-100 rounded-md"
                >
                  상담채널
                </Link>
                <Link
                  to="/community"
                  className="block px-3 py-2 text-gray-800 hover:bg-gray-100 rounded-md"
                >
                  커뮤니티 홈
                </Link>
                <Link
                  to="/community/write"
                  className="block px-3 py-2 text-gray-800 hover:bg-gray-100 rounded-md"
                >
                  글쓰기
                </Link>
              </>
            )}

            {/* 로그인/마이페이지 관련 버튼 */}
            {currentUser ? (
              <div className="space-y-2 pt-2">
                {isCounselor ? (
                  <Link
                    to="/mypage"
                    className="block w-full px-3 py-2 text-center bg-[#00a173] text-white rounded-md"
                  >
                    my
                  </Link>
                ) : (
                  <span className="block px-3 py-2 text-gray-800">
                    {currentUser.username || currentUser.nickname || '사용자'}님
                    반갑습니다
                  </span>
                )}
                <button
                  onClick={handleLogout}
                  className="block w-full px-3 py-2 text-center bg-[#00a173] text-white rounded-md"
                >
                  Log out
                </button>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
