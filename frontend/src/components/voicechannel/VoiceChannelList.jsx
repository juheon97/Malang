import React from 'react';
import AccessibleVoiceChannelItem from './AccessibleVoiceChannelItem';
import RegularChannelItem from './RegularChannelItem';

const VoiceChannelList = ({
  channels,
  expandedChannel,
  onToggleExpand,
  onJoinChannel,
  isAccessibleMode,
}) => {
  return (
    <section
      aria-label={isAccessibleMode ? '음성 채널 목록' : undefined}
      className="mb-6"
    >
      {isAccessibleMode && (
        <h2 className="sr-only">
          음성 채널 목록 - {channels.length}개의 채널이 있습니다.
        </h2>
      )}

      {isAccessibleMode ? (
        // 시각장애인 모드용 채널 목록 - 아코디언 스타일
        <div className="space-y-3">
          {channels.map(channel => (
            <AccessibleVoiceChannelItem
              key={channel.channelId}
              channel={channel}
              isExpanded={expandedChannel === channel.channelId}
              onToggleExpand={onToggleExpand}
              onJoinChannel={onJoinChannel}
            />
          ))}
        </div>
      ) : (
        // 일반 모드용 채널 목록
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {channels.map(channel => (
            <RegularChannelItem
              key={channel.channelId}
              channel={channel}
              onJoinChannel={onJoinChannel}
            />
          ))}

          {channels.length === 0 && (
            <div className="col-span-2 text-center py-10 bg-white rounded-xl shadow-md">
              <p className="text-gray-500">검색 결과가 없습니다.</p>
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default VoiceChannelList;
