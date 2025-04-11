import React from 'react';

const RegularChannelItem = ({ channel, onJoinChannel }) => {
  const hanndleJoinClick = () => {
    onJoinChannel(channel);
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-5 flex justify-between items-center hover:shadow-lg transition duration-200 border border-gray-100">
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
        <h3 className="text-lg font-bold">{channel.channelName}</h3>
        <p className="text-sm text-gray-500 "> 　최대 {channel.maxPlayer}명</p>
      </div>

      <button
        className="bg-gradient-to-r from-[#5CCA88] to-[#3FB06C] hover:from-[#6AD3A6] hover:to-[#078263] text-white px-4 py-1.5 rounded-lg text-sm shadow-sm transition duration-200"
        onClick={hanndleJoinClick}
      >
        입장
      </button>
    </div>
  );
};

export default RegularChannelItem;
