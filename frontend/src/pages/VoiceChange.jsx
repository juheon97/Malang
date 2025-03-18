import React, { useState } from 'react';

const VoiceChange = () => {
    const [transcribedText, setTranscribedText] = useState('안녕하세요, 만나서 반갑습니다.');
    const [isRecording, setIsRecording] = useState(false);
  
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
  
    return (
      <div className="bg-gradient-to-b from-[#EAF2EE] to-[#C6E1D8] rounded-lg p-6 max-w-4xl mt-12 mx-auto font-sans">

        <h1
              style={{ fontFamily: "'HancomMalangMalang-Regular', sans-serif" }}
              className="text-green-600 text-2xl font-bold border-l-4 border-green-600 pl-3 mb-6"
            >
              음성 정확도 높이기
            </h1>
        <div className="flex gap-6 ">
          <div className="flex-grow bg-white rounded-lg p-6 flex flex-col items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-20 h-20 text-green-500 mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 2c-1.66 0-3 1.34-3 3v7c0 1.66 1.34 3 3 3s3-1.34 3-3V5c0-1.66-1.34-3-3-3z" />
              <path d="M5 10a7 7 0 0 0 14 0" />
              <path d="M8 21h8" />
              <path d="M12 17v4" />
            </svg>
            <p className="text-gray-600 mb-6">마이크를 누른 후 말해주세요.</p>
            <button 
              className={`px-6 py-2 rounded-full transition duration-300 ${
                isRecording ? 'bg-red-600 text-white' : 'bg-green-500 text-white hover:bg-green-600'
              }`}
              onClick={isRecording ? stopRecording : startRecording}
            >
              {isRecording ? '녹음 중지' : '녹음 시작'}
            </button>
          </div>
          
        
          <div className="flex-shrink-0 w-2/5 space-y-4">
            <button className="w-full bg-[#98D5B0] text-green-800 py-3 rounded-full font-bold">
              변환된 텍스트
            </button>
            <div className="bg-white rounded-lg p-4 min-h-[100px]">
              <p>{transcribedText}</p>
            </div>
            <button 
              className="w-full bg-[#98D5B0] text-green-800 py-3 rounded-full font-bold"
              onClick={regenerateWithVoice}
            >
              음성으로 재생하기
            </button>
            <div className="bg-white rounded-lg p-4 flex justify-center">
              <button 
                className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center"
                onClick={playAudio}
              >
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };
export default VoiceChange;