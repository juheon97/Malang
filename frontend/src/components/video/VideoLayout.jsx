// components/video/VideoLayout.jsx
import React from 'react';
import OpenViduVideoComponent from './OpenViduVideoComponent';

// 참가자 비디오 렌더링 함수
const ParticipantVideo = ({ participant, renderParticipantInfo }) => (
  <div
    key={participant.id}
    className="relative bg-gray-100 rounded-lg overflow-hidden aspect-video"
  >
    {participant.stream && (
      <OpenViduVideoComponent
        streamManager={participant.stream}
        isSelf={participant.isSelf}
      />
    )}
    {renderParticipantInfo && renderParticipantInfo(participant)}
  </div>
);

// 비디오 레이아웃 컴포넌트
const VideoLayout = ({ participants = [], renderParticipantInfo }) => {
  // 참가자 배열이 없거나 비어있는 경우 메시지 표시
  if (!participants || participants.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg p-4">
        <p className="text-gray-500">
          참가자가 없습니다. 회의에 참여하는 사람들이 여기에 표시됩니다.
        </p>
      </div>
    );
  }

  const count = participants.length;

  // 참가자가 한 명인 경우 (자기 자신만)
  if (count === 1) {
    const participant = participants[0];
    return (
      <div className="w-full aspect-video bg-gray-100 rounded-lg overflow-hidden relative">
        {participant.stream && (
          <OpenViduVideoComponent
            streamManager={participant.stream}
            isSelf={participant.isSelf}
          />
        )}
        {renderParticipantInfo ? (
          renderParticipantInfo(participant)
        ) : (
          <div className="absolute bottom-2 right-2 bg-gray-700 bg-opacity-70 text-white px-2 py-1 rounded text-xs">
            {participant.name}
          </div>
        )}
      </div>
    );
  }

  // 참가자가 3명인 경우 특별한 레이아웃
  if (count === 3) {
    return (
      <>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          {participants.slice(0, 2).map(participant => (
            <ParticipantVideo
              key={participant.id}
              participant={participant}
              renderParticipantInfo={renderParticipantInfo}
            />
          ))}
        </div>
        <div className="mx-auto relative bg-gray-100 rounded-lg overflow-hidden aspect-video sm:w-1/2">
          <ParticipantVideo
            participant={participants[2]}
            renderParticipantInfo={renderParticipantInfo}
          />
        </div>
      </>
    );
  }

  // 참가자가 2명 또는 4명 이상인 경우 그리드 레이아웃
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {participants
        ? participants.map(participant => (
            <ParticipantVideo
              key={participant.id}
              participant={participant}
              renderParticipantInfo={renderParticipantInfo}
            />
          ))
        : null}
    </div>
  );
};

export default VideoLayout;

// // components/video/VideoLayout.jsx
// import React from 'react';
// import OpenViduVideoComponent from './OpenViduVideoComponent';

// // 참가자 비디오 렌더링 함수
// const ParticipantVideo = ({ participant, renderParticipantInfo }) => (
//   <div
//     key={participant.id}
//     className="relative bg-gray-100 rounded-lg overflow-hidden aspect-video"
//   >
//     {participant.stream && (
//       <OpenViduVideoComponent
//         streamManager={participant.stream}
//         isSelf={participant.isSelf}
//       />
//     )}
//     {renderParticipantInfo && renderParticipantInfo(participant)}
//   </div>
// );

// // 비디오 레이아웃 컴포넌트
// const VideoLayout = ({ participants, renderParticipantInfo }) => {
//   const count = participants.length;

//   // 참가자가 한 명인 경우 (자기 자신만)
//   if (count === 1) {
//     const participant = participants[0];
//     return (
//       <div className="w-full aspect-video bg-gray-100 rounded-lg overflow-hidden relative">
//         {participant.stream && (
//           <OpenViduVideoComponent
//             streamManager={participant.stream}
//             isSelf={participant.isSelf}
//           />
//         )}
//         <div className="absolute bottom-2 right-2 bg-gray-700 bg-opacity-70 text-white px-2 py-1 rounded text-xs">
//           {participant.name}
//         </div>
//       </div>
//     );
//   }

//   // 참가자가 3명인 경우 특별한 레이아웃
//   if (count === 3) {
//     return (
//       <>
//         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
//           {participants.slice(0, 2).map(participant => (
//             <ParticipantVideo
//               key={participant.id}
//               participant={participant}
//               renderParticipantInfo={renderParticipantInfo}
//             />
//           ))}
//         </div>
//         <div className="mx-auto relative bg-gray-100 rounded-lg overflow-hidden aspect-video sm:w-1/2">
//           <ParticipantVideo
//             participant={participants[2]}
//             renderParticipantInfo={renderParticipantInfo}
//           />
//         </div>
//       </>
//     );
//   }

//   // 참가자가 2명 또는 4명 이상인 경우 그리드 레이아웃
//   return (
//     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//       {participants.map(participant => (
//         <ParticipantVideo
//           key={participant.id}
//           participant={participant}
//           renderParticipantInfo={renderParticipantInfo}
//         />
//       ))}
//     </div>
//   );
// };

// export default VideoLayout;
