import React from 'react';
import ChannelItem from './ChannelItem';

const ChannelList = ({
  channels = [], // 기본값을 빈 배열로 설정
  isAccessibleMode,
  onJoinChannel,
  onToggleExpand,
  expandedChannel,
}) => {
  return (
    <div
      className={
        isAccessibleMode ? 'space-y-3' : 'grid grid-cols-1 md:grid-cols-2 gap-6'
      }
    >
      {/* channels가 배열인지 확인 후 map 실행 */}
      {Array.isArray(channels) &&
        channels.map(channel => (
          <ChannelItem
            key={channel.channelId}
            channel={channel}
            isAccessibleMode={isAccessibleMode}
            onJoinChannel={onJoinChannel}
            onToggleExpand={onToggleExpand}
            isExpanded={expandedChannel === channel.channelId}
          />
        ))}

      {/* 채널이 없을 때 표시 */}
      {channels.length === 0 && (
        <div
          className={
            isAccessibleMode
              ? 'text-center py-10 bg-white rounded-xl shadow-md'
              : 'col-span-2 text-center py-10 bg-white rounded-xl shadow-md'
          }
          role="alert"
          aria-live="polite"
        >
          <p className="text-gray-500">검색 결과가 없습니다.</p>
        </div>
      )}
    </div>
  );
};

export default ChannelList;
