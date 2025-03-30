import React from 'react';

const AccessibleVoiceChannelItem = ({
  channel,
  isExpanded,
  onToggleExpand,
  onJoinChannel,
}) => {
  return (
    <div
      className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200"
      role="listitem"
    >
      <div
        className="p-4 flex items-center justify-between cursor-pointer"
        onClick={() => onToggleExpand(channel.channelId)}
        tabIndex="0"
        role="button"
        aria-expanded={isExpanded}
        aria-controls={`channel-details-${channel.channelId}`}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onToggleExpand(channel.channelId);
          }
        }}
      >
        <div className="flex items-center">
          {channel.hasPassword ? (
            <div className="mr-4">
              <span className="text-yellow-400 text-2xl">🔑</span>
            </div>
          ) : (
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-4">
              <span className="text-blue-500">●</span>
            </div>
          )}
          <h3 className="text-lg font-bold">
            {channel.channelName}
            {channel.hasPassword && (
              <span className="sr-only"> - 비밀번호가 필요한 채널</span>
            )}
            <span className="sr-only">
              {' '}
              - 최대 {channel.maxPlayer}명 참여 가능
            </span>
          </h3>
        </div>
        <svg
          className={`w-5 h-5 text-gray-500 transition-transform ${isExpanded ? 'transform rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
      {isExpanded && (
        <div
          id={`channel-details-${channel.channelId}`}
          className="p-4 border-t border-gray-200"
        >
          <div className="mb-4">
            <h4 className="font-semibold mb-2">채널 설명</h4>
            <p className="text-gray-700">
              {channel.description || '설명이 없습니다.'}
            </p>
          </div>
          {channel.participants && (
            <div className="mb-4">
              <span className="text-gray-600">
                현재 참여자: {channel.participants}명
              </span>
            </div>
          )}
          <div className="flex justify-end">
            <button
              className="bg-gradient-to-r from-[#5CCA88] to-[#3FB06C] hover:from-[#6AD3A6] hover:to-[#078263] text-white px-4 py-2 rounded-lg shadow-md transition duration-200"
              onClick={e => {
                e.stopPropagation();
                onJoinChannel(channel);
              }}
              aria-label={`${channel.channelName} 채널 입장하기${channel.hasPassword ? ', 비밀번호 필요' : ''}`}
            >
              {channel.hasPassword ? '비밀번호 입력 후 입장' : '입장하기'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccessibleVoiceChannelItem;
