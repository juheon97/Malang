import React, { useState, useEffect, useMemo } from 'react';
import { MagnifyingGlassIcon as SearchIcon } from '@heroicons/react/24/outline';
import ChannelList from '../../components/voicechannel/ChannelList';
import voiceChannelApi from '../../api/voiceChannelApi';
import { useNavigate } from 'react-router-dom';

const VoiceChannel = () => {
  const navigate = useNavigate();
  const [channels, setChannels] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [expandedChannel, setExpandedChannel] = useState(null);
  const [isAccessibleMode, setIsAccessibleMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // 채널 목록 가져오기
  useEffect(() => {
    const fetchChannels = async () => {
      setIsLoading(true);
      try {
        const data = await voiceChannelApi.listChannels();
        console.log('채널 목록:', data); // API에서 가져온 채널 데이터를 콘솔에 출력
        setChannels(data);
        setError(null);
      } catch (error) {
        console.error('채널 목록 조회 실패:', error);
        setError('채널 목록을 불러오는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchChannels();
  }, []);

  // 검색어에 따라 필터링된 채널 목록 계산
  const filteredChannels = useMemo(() => {
    console.log('검색어:', searchInput); // 검색어를 콘솔에 출력
    console.log('전체 채널 목록:', channels); // 필터링 전 채널 목록을 출력
    if (searchInput.trim() === '') {
      return channels;
    } else {
      return channels.filter(channel =>
        channel.channelName.toLowerCase().includes(searchInput.toLowerCase()),
      );
    }
  }, [searchInput, channels]);

  // 채널 참여 버튼 클릭 시
  const handleJoinChannel = channel => {
    console.log('채널 참여:', channel); // 참여하려는 채널 정보를 콘솔에 출력
    navigate(`/voice-channel-video/${channel.channelId}`);
  };

  // 채널 확장/축소 토글
  const toggleChannelExpand = channelId => {
    console.log('확장된 채널 ID:', channelId); // 확장된 채널 ID를 출력
    setExpandedChannel(expandedChannel === channelId ? null : channelId);
  };

  // 접근성 모드 토글
  const toggleAccessibleMode = () => {
    console.log('접근성 모드 변경:', !isAccessibleMode); // 접근성 모드 상태를 출력
    setIsAccessibleMode(!isAccessibleMode);
    setExpandedChannel(null); // 모드 변경 시 확장된 채널 초기화
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="w-full bg-transparent py-12">
        <main className="max-w-6xl mx-auto px-6 relative">
          {/* 방 생성 버튼 */}
          <div className="absolute top-0 right-6">
            <button
              className="bg-gradient-to-r from-[#5CCA88] to-[#3FB06C] hover:from-[#6AD3A6] hover:to-[#078263] text-white px-6 py-2 rounded-lg shadow-md transition duration-200"
              onClick={() => navigate('/voice-channel-room')}
            >
              방 생성
            </button>
          </div>

          {/* 제목 */}
          <header className="text-center mb-10">
            <h1 className="text-4xl font-bold text-[#00a173]">음성채널</h1>
          </header>
          <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-4 sm:mb-0">
                  음성 채널 목록
                </h1>
                <div className="flex space-x-4 w-full sm:w-auto">
                  <div className="relative flex-grow sm:flex-grow-0">
                    <input
                      type="text"
                      placeholder="채널 검색..."
                      value={searchInput}
                      onChange={e => setSearchInput(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <SearchIcon className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                  <button
                    onClick={toggleAccessibleMode}
                    className="px-4 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50"
                  >
                    {isAccessibleMode ? '일반 모드' : '접근성 모드'}
                  </button>
                </div>
              </div>

              {isLoading ? (
                <div className="text-center py-10">
                  <p className="text-gray-500">채널 목록을 불러오는 중...</p>
                </div>
              ) : error ? (
                <div
                  className="text-center py-10 bg-white rounded-xl shadow-md"
                  role="alert"
                >
                  <p className="text-red-500">{error}</p>
                </div>
              ) : (
                <ChannelList
                  channels={filteredChannels}
                  isAccessibleMode={isAccessibleMode}
                  onJoinChannel={handleJoinChannel}
                  onToggleExpand={toggleChannelExpand}
                  expandedChannel={expandedChannel}
                />
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default VoiceChannel;
