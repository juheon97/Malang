import React, { useState, useRef } from 'react';

const VoiceChange = () => {
  const [transcribedText, setTranscribedText] =
    useState('안녕하세요, 만나서 반갑습니다.');
  const [isRecording, setIsRecording] = useState(false);
  const [isAccessibleMode, setIsAccessibleMode] = useState(false);

  const startRecording = () => {
    setIsRecording(true);
    // 실제 녹음 로직 구현
  };

  const stopRecording = () => {
    setIsRecording(false);
    // 녹음 중지 로직 구현
  };

  const regenerateWithVoice = () => {
    // 음성으로 재생성 로직 구현
  };

  const playAudio = () => {
    // 오디오 재생 로직 구현
  };

  const pageStyle = {
    backgroundImage: `
        radial-gradient(circle at 5% -2%, rgba(121, 231, 183, 0.2) 0%, rgba(255, 255, 255, 0) 4%),
        radial-gradient(circle at 0% 4%, rgba(233, 230, 47, 0.16) 0%, rgba(255, 255, 255, 0) 5%),
        radial-gradient(circle at 80% 3%, rgba(8, 151, 110, 0.1) 0%, rgba(255, 255, 255, 0) 25%),
        radial-gradient(circle at 6% 95%, rgba(249, 200, 255, 0.52) 0%, rgba(255, 255, 255, 0) 20%)
      `,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  };

  return (
    <div className="bg-gradient-to-b from-[#EAF2EE] to-[#C6E1D8] rounded-lg p-6 max-w-4xl mt-12 mx-auto font-sans">
      <div className="flex items-center mb-6 relative z-10">
        <div
          className="w-1 h-8 bg-gradient-to-b from-green-400 to-green-600 mr-3 rounded-full shadow-md"
          aria-hidden={isAccessibleMode ? 'true' : undefined}
        ></div>
        <h1
          style={{ fontFamily: "'HancomMalangMalang-Regular', sans-serif" }}
          className="text-2xl font-bold text-green-600 relative"
          tabIndex={isAccessibleMode ? '0' : undefined}
        >
          음성 정확도 높이기
        </h1>
      </div>

      <div className="flex gap-6 ">
        <div
          className="flex-grow bg-white rounded-lg p-6 flex flex-col items-center justify-center"
          style={pageStyle}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            className="w-20 h-20 text-[#55BCA4] mb-4"
          >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M9 2m0 3a3 3 0 0 1 3 -3h0a3 3 0 0 1 3 3v5a3 3 0 0 1 -3 3h0a3 3 0 0 1 -3 -3z" />
            <path d="M5 10a7 7 0 0 0 14 0" />
            <path d="M8 21l8 0" />
            <path d="M12 17l0 4" />
          </svg>
          <p className="text-[#878282] font-base mb-6">
            마이크를 누른 후 말해주세요.
          </p>
          <button
            className={`px-6 py-2 rounded-full transition duration-300 ${
              isRecording
                ? 'bg-red-600 text-white'
                : 'bg-[#55BCA4] text-white hover:bg-[#55BCA6]'
            }`}
            onClick={isRecording ? stopRecording : startRecording}
          >
            {isRecording ? '녹음 중지' : '녹음 시작'}
          </button>
        </div>

        <div className="flex-shrink-0 w-2/5 space-y-4 rounded-xl p-6 shadow-lg bg-[#EEEEEE]">
          <div className="w-full bg-[#98D5B0] text-white py-3 rounded-xl font-semibold shadow-lg text-lg flex justify-center items-center">
            변환된 텍스트
          </div>
          <div className="bg-[#F8F8F8] rounded-lg p-4 min-h-[100px] shadow-lg text-[#878282] font-semibold">
            <p>{transcribedText}</p>
          </div>
          <div
            className="w-full bg-[#98D5B0] text-white py-3 rounded-xl font-semibold shadow-lg  text-lg flex justify-center items-center"
            onClick={regenerateWithVoice}
          >
            음성으로 재생하기
          </div>
          <div className="bg-white rounded-lg p-4 flex justify-center shadow-lg">
            <button
              className="w-13 h-13 bg-[#55BCA4] rounded-full flex items-center justify-center m-3"
              onClick={playAudio}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 26 26"
                className="w-10 h-10"
              >
                <circle cx="13" cy="13" r="13" fill="#55BCA4" />
                <path d="M10,7 L19,13 L10,19 Z" fill="white" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default VoiceChange;
