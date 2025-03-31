import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import {
  LockClosedIcon,
  UserGroupIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

const ChannelItem = ({
  channel,
  isAccessibleMode,
  onJoinChannel,
  onToggleExpand,
  isExpanded,
}) => {
  // 날짜 포맷팅 함수
  const formatDate = dateString => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true, locale: ko });
    } catch (error) {
      console.error('날짜 포맷팅 오류:', error);
      return dateString;
    }
  };

  if (isAccessibleMode) {
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
          <div>
            <h3 className="font-semibold text-lg">
              {channel.channelName}
              {channel.hasPassword && (
                <LockClosedIcon
                  className="w-4 h-4 inline-block ml-2 text-gray-500"
                  aria-label="비밀번호가 필요한 채널"
                />
              )}
            </h3>
            <p className="text-sm text-gray-500">
              개설자: {channel.creatorNickname}
            </p>
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <UserGroupIcon className="w-4 h-4 mr-1" />
            <span>0/{channel.maxPlayer}</span>
          </div>
        </div>
        {isExpanded && (
          <div
            id={`channel-details-${channel.channelId}`}
            className="p-4 border-t border-gray-200"
          >
            <p className="mb-2">{channel.description || '설명이 없습니다.'}</p>
            <div className="flex items-center text-sm text-gray-500 mb-3">
              <ClockIcon className="w-4 h-4 mr-1" />
              <span>생성 시간: {formatDate(channel.createdAt)}</span>
            </div>
            <button
              onClick={() => onJoinChannel(channel)}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition duration-200"
              aria-label={`${channel.channelName} 채널 참여하기`}
            >
              참여하기
            </button>
          </div>
        )}
      </div>
    );
  } else {
    return (
      <div className="bg-white rounded-xl shadow-md p-5 flex justify-between items-center hover:shadow-lg transition duration-200 border border-gray-100">
        <div>
          <h3 className="font-semibold text-lg flex items-center">
            {channel.channelName}
            {channel.hasPassword && (
              <LockClosedIcon
                className="w-4 h-4 ml-2 text-gray-500"
                aria-label="비밀번호가 필요한 채널"
              />
            )}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {channel.description || '설명이 없습니다.'}
          </p>
          <div className="flex items-center mt-2 space-x-4 text-sm text-gray-500">
            <div className="flex items-center">
              <UserGroupIcon className="w-4 h-4 mr-1" />
              <span>0/{channel.maxPlayer}</span>
            </div>
            <div className="flex items-center">
              <ClockIcon className="w-4 h-4 mr-1" />
              <span>{formatDate(channel.createdAt)}</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            개설자: {channel.creatorNickname}
          </p>
        </div>
        <button
          onClick={() => onJoinChannel(channel)}
          className="ml-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition duration-200 whitespace-nowrap"
        >
          참여하기
        </button>
      </div>
    );
  }
};

export default ChannelItem;
