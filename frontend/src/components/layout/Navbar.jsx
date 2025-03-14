import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  
  return (
    <nav className="bg-[#f5fdf5] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-semibold text-[#00a173]">말랑</span>
            </Link>
          </div>
          
          {/* 컴퓨터터 메뉴 */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/sotongdam" className="text-gray-800 hover:text-[#00a173]">소통담</Link>
            <Link to="/sudabang" className="text-gray-800 hover:text-[#00a173]">수다방</Link>
            <Link to="/singdam" className="text-gray-800 hover:text-[#00a173]">싱담방</Link>
            
            <div className="relative">
              <button 
                className="flex items-center text-gray-800 hover:text-[#00a173]"
                onClick={() => setIsOpen(!isOpen)}
              >
                커뮤니티
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>
              
              {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                  <Link to="/community" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">
                    커뮤니티 홈
                  </Link>
                  <Link to="/community/write" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">
                    글쓰기
                  </Link>
                </div>
              )}
            </div>
          </div>
          
          {/* 모바일 버튼 */}
          <div className="md:hidden flex items-center">
            <button
              className="text-gray-800 hover:text-[#00a173] focus:outline-none"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* 모바일 */}
      {menuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link 
              to="/voice-change" 
              className="block px-3 py-2 text-gray-800 hover:text-[#00a173]"
              onClick={() => setMenuOpen(false)}
            >
              음성변환
            </Link>
            <Link 
              to="/voice-channel" 
              className="block px-3 py-2 text-gray-800 hover:text-[#00a173]"
              onClick={() => setMenuOpen(false)}
            >
              음성채널
            </Link>
            <Link 
              to="/counsel-channel" 
              className="block px-3 py-2 text-gray-800 hover:text-[#00a173]"
              onClick={() => setMenuOpen(false)}
            >
              상담채널
            </Link>
            <div>
              <button 
                className="flex w-full px-3 py-2 text-gray-800 hover:text-[#00a173]"
                onClick={() => setIsOpen(!isOpen)}
              >
                커뮤니티
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>
              
              {isOpen && (
                <div className="pl-4 py-2">
                  <Link 
                    to="/community" 
                    className="block px-3 py-2 text-gray-800 hover:text-[#00a173]"
                    onClick={() => setMenuOpen(false)}
                  >
                    커뮤니티 홈
                  </Link>
                  <Link 
                    to="/community/write" 
                    className="block px-3 py-2 text-gray-800 hover:text-[#00a173]"
                    onClick={() => setMenuOpen(false)}
                  >
                    글쓰기
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;