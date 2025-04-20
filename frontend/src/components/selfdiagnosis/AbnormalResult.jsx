// components/selfdiagnosis/AbnormalResult.js

import React from 'react';
import { Link } from 'react-router-dom'; // 라우팅을 위한 import 추가

const AbnormalResult = ({ data, audioUrl, playAudio, regenerateWithVoice }) => {
  // 문자열에서 뇌 질환 확률 추출
  const extractProbability = (str, type) => {
    const regex = new RegExp(`${type}: ([\\d.]+)%`);
    const match = str.match(regex);
    return match ? parseFloat(match[1]) : 0;
  };

  const normalProbability = typeof data === 'string' 
    ? extractProbability(data, '정상')
    : 0;

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
     
      <div className="p-6">
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        
        <h3 className="text-xl font-bold text-center text-green-600 mb-4">정상 음성으로 확인됨</h3>
{/*         
        <div className="bg-[#F8F8F8] rounded-lg p-4 mb-4 border border-gray-200">
          <div className="flex justify-between items-center">
            <span className="font-medium">정상 확률:</span>
            <span className="text-green-600 font-bold">{normalProbability.toFixed(6)}%</span>
          </div>
          <p className="mt-2 text-gray-600">전체 결과: {data}</p>
        </div> */}
        
        <p className="text-gray-600 text-center mb-6">
          진단 결과 뇌신경구음장애 징후가 발견되지 않았습니다.
        </p>
        
        {/* <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center">
            <button
              className="w-12 h-12 rounded-full flex items-center justify-center bg-[#55BCA4] hover:bg-[#4AA090]"
              onClick={regenerateWithVoice}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 26 26" className="w-10 h-10">
                <circle cx="13" cy="13" r="13" fill="#55BCA4" />
                <path d="M10,7 L19,13 L10,19 Z" fill="white" />
              </svg>
            </button>
            <span className="ml-3 text-gray-700">음성으로 재생하기</span>
          </div>
          
          {audioUrl && (
            <div className="flex items-center">
              <span className="text-gray-700 mr-3">원본 녹음 듣기</span>
              <button
                className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                onClick={playAudio}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"></path>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                  <line x1="12" y1="19" x2="12" y2="22"></line>
                </svg>
              </button>
            </div>
          )}
        </div> */}
      </div>
    </div>
  );
};

export default AbnormalResult;