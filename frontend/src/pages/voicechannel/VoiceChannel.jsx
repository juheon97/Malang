import React, { useState, useMemo } from 'react';

const VoiceChannel = () => {
  const [searchInput, setSearchInput] = useState('');
  
  // 채널 데이터를 useMemo로 메모이제이션
  const channels = useMemo(() => [
    { id: 1, title: '백종원의 요리교실', participants: 5 },
    { id: 2, title: '피그마로 수다떨어요', isLocked: true },
    { id: 3, title: '스탠리', participants: 3 },
    { id: 4, title: '프로그래밍 스터디', participants: 7 }
  ], []);
  
  // 검색 필터링을 useMemo로 처리
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

  // 스타일 객체를 사용하여 배경 이미지 설정
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
        <div className="max-w-6xl mx-auto px-6">
          {/* 제목 */}
          <div className="text-center mb-10">
            <h1 style={{fontFamily: "'HancomMalangMalang-Regular', sans-serif"}} className="text-4xl font-bold text-[#00a173]">음성채널</h1>
          </div>
          
          {/* 검색창 & 방생성 버튼 */}
          <div className="flex justify-between items-center mb-12 bg-white p-6 rounded-2xl shadow-md">
            <div className="w-2/3 relative">
              <form onSubmit={handleSearch}>
                <input
                  type="text"
                  placeholder="방을 검색하세요..."
                  className="w-full py-3 px-5 rounded-full border border-gray-200 focus:outline-none focus:border-[#4DC0B5] focus:ring-2 focus:ring-[#4DC0B5] focus:ring-opacity-20"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
                <button 
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-[#4DC0B5] hover:bg-[#3DA99F] text-white px-4 py-2 rounded-full shadow-md transition duration-200"
                >
                  검색
                </button>
              </form>
            </div>
            <button className="bg-gradient-to-r from-[#79E7B7] to-[#08976E] hover:from-[#6AD3A6] hover:to-[#078263] text-white px-6 py-3 rounded-full shadow-md transition duration-200">
              방 생성
            </button>
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
                
                <button className="bg-gradient-to-r from-[#79E7B7] to-[#08976E] hover:from-[#6AD3A6] hover:to-[#078263] text-white px-4 py-1.5 rounded-full text-sm shadow-sm transition duration-200">
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
    </div>
  );
};

export default VoiceChannel;