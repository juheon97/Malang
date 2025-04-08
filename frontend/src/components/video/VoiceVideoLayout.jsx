// components/video/VideoLayout.jsx
import React, { useEffect } from 'react';
import VoiceOpenViduVideoComponent from './VoiceOpenViduVideoComponent';
import SignLanguageVideoComponent from './SignLanguageVideoComponent';

// 참가자 비디오 렌더링 함수
const ParticipantVideo = ({
  participant,
  renderParticipantInfo,
  isSignLanguageOn,
  onTranslationResult,
}) => (
  <div
    key={participant.id}
    className="relative bg-gray-100 rounded-lg overflow-hidden aspect-video"
  >
    {participant.stream ? (
      participant.isSelf && isSignLanguageOn ? (
        // 자신의 비디오이고 수어 번역이 활성화된 경우
        <SignLanguageVideoComponent
          streamManager={participant.stream}
          isSelf={participant.isSelf}
          onTranslationResult={onTranslationResult}
        />
      ) : (
        // 다른 사람의 비디오이거나 수어 번역이 비활성화된 경우
        <VoiceOpenViduVideoComponent
          streamManager={participant.stream}
          isSelf={participant.isSelf}
        />
      )
    ) : (
      <div className="w-full h-full flex items-center justify-center">
        <p className="text-gray-500">비디오 스트림 연결 중...</p>
      </div>
    )}
    {participant.name && renderParticipantInfo ? (
      renderParticipantInfo(participant)
    ) : (
      <div className="absolute bottom-2 right-2 bg-gray-700 bg-opacity-70 text-white px-2 py-1 rounded text-xs">
        {participant.name || 'Unknown'}
        {participant.isSelf && (
          <span className="ml-1 bg-blue-500 px-1 py-0.5 rounded text-xs">
            Me
          </span>
        )}
      </div>
    )}
  </div>
);

// 비디오 레이아웃 컴포넌트
const VoiceVideoLayout = ({
  participants = [],
  renderParticipantInfo,
  isSignLanguageOn = false,
  onTranslationResult,
}) => {
  // 유효한 참가자만 필터링 (중복 및 null 제거)
  // 중요: 1) 자기 자신을 먼저 표시하고, 2) isSelf가 false인 참가자를 그 다음에 표시
  const validParticipants = participants
    ? participants
        .filter(p => p && p.id) // null이나 id가 없는 참가자 제거
        .filter(
          (p, index, self) =>
            // 중복 제거 (같은 id를 가진 첫 번째 항목만 유지)
            self.findIndex(t => t.id === p.id) === index,
        )
        .sort((a, b) => {
          // 자기 자신(isSelf=true)이 먼저 오도록 정렬
          if (a.isSelf && !b.isSelf) return -1;
          if (!a.isSelf && b.isSelf) return 1;
          return 0;
        })
    : [];

  // 디버깅을 위한 로그
  useEffect(() => {
    console.log(
      'Participants 구조:',
      validParticipants.map(p => ({
        id: p.id,
        stream: !!p.stream,
        isSelf: p.isSelf,
        name: p.name,
      })),
    );
  }, [validParticipants]);

  // 참가자 배열이 없거나 비어있는 경우 메시지 표시
  if (!validParticipants || validParticipants.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg p-4">
        <p className="text-gray-500">
          참가자가 없습니다. 회의에 참여하는 사람들이 여기에 표시됩니다.
        </p>
      </div>
    );
  }

  const count = validParticipants.length;

  // 참가자가 한 명인 경우 (자기 자신만)
  // 참가자가 한 명인 경우 (자기 자신만)
  if (count === 1) {
    const participant = validParticipants[0];
    return (
      <div className="w-full aspect-video bg-gray-100 rounded-lg overflow-hidden relative">
        {participant.stream ? (
          participant.isSelf && isSignLanguageOn ? (
            <SignLanguageVideoComponent
              streamManager={participant.stream}
              isSelf={participant.isSelf}
              onTranslationResult={onTranslationResult}
            />
          ) : (
            <VoiceOpenViduVideoComponent
              streamManager={participant.stream}
              isSelf={participant.isSelf}
            />
          )
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <p className="text-gray-500">비디오 스트림 연결 중...</p>
          </div>
        )}
        {renderParticipantInfo ? (
          renderParticipantInfo(participant)
        ) : (
          <div className="absolute bottom-2 right-2 bg-gray-700 bg-opacity-70 text-white px-2 py-1 rounded text-xs">
            {participant.name || 'Unknown'}
            {participant.isSelf && (
              <span className="ml-1 bg-blue-500 px-1 py-0.5 rounded text-xs">
                Me
              </span>
            )}
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
          {validParticipants.slice(0, 2).map(participant => (
            <ParticipantVideo
              key={participant.id}
              participant={participant}
              renderParticipantInfo={renderParticipantInfo}
              isSignLanguageOn={isSignLanguageOn}
              onTranslationResult={onTranslationResult}
            />
          ))}
        </div>
        <div className="mx-auto relative bg-gray-100 rounded-lg overflow-hidden aspect-video sm:w-1/2">
          <ParticipantVideo
            participant={validParticipants[2]}
            renderParticipantInfo={renderParticipantInfo}
            isSignLanguageOn={isSignLanguageOn}
            onTranslationResult={onTranslationResult}
          />
        </div>
      </>
    );
  }

  // 참가자가 2명 또는 4명 이상인 경우 그리드 레이아웃
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {validParticipants.map(participant => (
        <ParticipantVideo
          key={participant.id}
          participant={participant}
          renderParticipantInfo={renderParticipantInfo}
          isSignLanguageOn={isSignLanguageOn}
          onTranslationResult={onTranslationResult}
        />
      ))}
    </div>
  );
};

export default VoiceVideoLayout;
