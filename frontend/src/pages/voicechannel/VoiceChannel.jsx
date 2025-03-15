import React, { useState, useMemo } from 'react';

const VoiceChannel = () => {
  const [searchInput, setSearchInput] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [currentChannelId, setCurrentChannelId] = useState(null);
  
  // 채널 데이터 useMemo로 메모이제이션
  const channels = useMemo(() => [
    { id: 1, title: '백종원의 요리교실', participants: 5 },
    { id: 2, title: '피그마로 수다떨어요', isLocked: true },
    { id: 3, title: '스탠리', participants: 3 },
    { id: 4, title: '프로그래밍 스터디', participants: 7 }
  ], []);
  
  // 검색 필터링 useMemo로 처리
  const filteredChannels = useMemo(() => {
    if (searchInput.trim() === '') {
      return channels;
    } else {
      return channels.filter(channel => 
        channel.title.toLowerCase().includes(searchInput.toLowerCase())
      );
    }
  }, [searchInput, channels]);
  
  const handleSearch = (e) => {
    e.preventDefault();
    console.log("검색어:", searchInput);
  };

  // 채널 입장 처리
  const handleJoinChannel = (channelId) => {
    const channel = channels.find(c => c.id === channelId);
    
    if (channel.isLocked) {
      // 비밀번호가 필요한 채널인 경우
      setCurrentChannelId(channelId);
      setShowPasswordModal(true);
    } else {
      // 비밀번호가 필요없는 경우
      console.log(`채널 ${channelId} 입장`);
      // 여기에 실제 입장 로직 구현
    }
  };

  // 원형 그라데이션션
  const pageStyle = {
    backgroundImage: `
      radial-gradient(circle at 10% 30%, rgba(121, 231, 183, 0.2) 0%, rgba(255, 255, 255, 0) 15%),
      radial-gradient(circle at 30% 18%, rgba(233, 230, 47, 0.2) 0%, rgba(255, 255, 255, 0) 15%),
      radial-gradient(circle at 80% 80%, rgba(8, 151, 110, 0.1) 0%, rgba(255, 255, 255, 0) 25%),
      radial-gradient(circle at 10% 90%, rgba(200, 230, 255, 0.1) 0%, rgba(255, 255, 255, 0) 20%)
    `,
    backgroundSize: 'cover',
    backgroundPosition: 'center'
  };
  
  return (
    <div className="min-h-screen bg-white" style={pageStyle}>
      <div className="w-full bg-white py-"></div>
      <div className="w-full bg-transparent py-12">
        <div className="max-w-6xl mx-auto px-6 relative">
         {/* 방 생성 버튼튼 */}
          <div className="absolute top-0 right-6">
            <button className="bg-gradient-to-r from-[#5CCA88] to-[#3FB06C] hover:from-[#6AD3A6] hover:to-[#078263] text-white px-6 py-2 rounded-lg shadow-md transition duration-200">
              방 생성
            </button>
          </div>
          
          {/* 제목 */}
          <div className="text-center mb-10">
            <h1 style={{fontFamily: "'HancomMalangMalang-Regular', sans-serif"}} className="text-4xl font-bold text-[#00a173]">음성채널</h1>
          </div>
          
          {/* 검색창창 */}
          <div className="mb-12 flex justify-left">
            <div className="bg-white p-2 rounded-xl shadow-md w-full max-w-xl">
              <div className="relative">
                <form onSubmit={handleSearch}>
                  <input
                    type="text"
                    placeholder="방을 검색하세요..."
                    className="w-full py-3 px-5 rounded-lg border border-gray-200 focus:outline-none focus:border-[#4DC0B5] focus:ring-2 focus:ring-[#4DC0B5] focus:ring-opacity-20"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                  />
                  <button 
                    type="submit"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-[#5CCA88] to-[#3FB06C] hover:from-[#6AD3A6] hover:to-[#078263] text-white px-4 py-2 rounded-lg shadow-md transition duration-200"
                  >
                    검색
                  </button>
                </form>
              </div>
            </div>
          </div>
          
          {/* 채널 목록 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredChannels.map((channel) => (
              <div key={channel.id} className="bg-white rounded-xl shadow-md p-5 flex justify-between items-center hover:shadow-lg transition duration-200 border border-gray-100">
                <div className="flex items-center">
                  {channel.isLocked ? (
                    <div className="mr-4">
                      <span className="text-yellow-400 text-2xl">🔑</span>
                    </div>
                  ) : (
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                      <span className="text-blue-500">●</span>
                    </div>
                  )}
                  <h2 className="text-lg font-bold">{channel.title}</h2>
                </div>
                
                <button 
                  className="bg-gradient-to-r from-[#5CCA88] to-[#3FB06C] hover:from-[#6AD3A6] hover:to-[#078263] text-white px-4 py-1.5 rounded-lg text-sm shadow-sm transition duration-200"
                  onClick={() => handleJoinChannel(channel.id)}
                >
                  입장
                </button>
              </div>
            ))}
            
            {filteredChannels.length === 0 && (
              <div className="col-span-2 text-center py-10 bg-white rounded-xl shadow-md">
                <p className="text-gray-500">검색 결과가 없습니다.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 비밀번호 입력 모달 */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* 배경 오버레이 */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setShowPasswordModal(false)}
          ></div>
          
          <div className="relative max-w-xl w-full overflow-hidden">
            {/* 상단 초록색 바 */}
            <div className="w-full h-3 bg-green-500"></div>
            
            <div className="bg-white rounded-b-sm shadow-xl p-6 z-10">
              <h2 className="text-xl font-bold text-center mb-6">비밀번호를 입력해주세요</h2>
              
              <div className="mb-6">
                <input
                  type="password"
                  placeholder="비밀번호"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#4DC0B5] focus:border-transparent"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                />
              </div>
              
              <div className="flex justify-center">
                <button
                  className="bg-[#f2f2f2] hover:bg-gradient-to-r hover:from-[#79E7B7] hover:to-[#08976E] hover:text-white text-black font-medium px-8 py-2 rounded-lg shadow-md transition-colors"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordInput('');
                    console.log(`채널 ${currentChannelId} 비밀번호 확인`);
                  }}
                >
                  확인
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceChannel;