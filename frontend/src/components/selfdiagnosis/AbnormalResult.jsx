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

  const abnormalProbability = typeof data === 'string' 
    ? extractProbability(data, '뇌 질환')
    : 0;
  
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
    
      <div className="p-6">
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        </div>
        
        <h3 className="text-xl font-bold text-center text-red-600 mb-4">뇌 신경 및 뇌졸중 의심</h3>
        
        {/* <div className="bg-[#F8F8F8] rounded-lg p-4 mb-4 border border-gray-200">
          <div className="flex justify-between items-center">
            <span className="font-medium">뇌 질환 가능성:</span>
            <span className="text-yellow-600 font-bold">{abnormalProbability.toFixed(6)}%</span>
          </div>
          <p className="mt-2 text-gray-600">전체 결과: {data}</p>
        </div>
         */}

        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                이 결과는 참고용으로만 사용하시고, 정확한 진단을 위해 반드시 전문의와 상담하세요.
              </p>
            </div>
          </div>
        </div>
        
        {/* 상담 유도 섹션 추가 */}
        <div className="mt-8 bg-blue-50 p-6 rounded-lg border border-blue-200">
          <h4 className="text-lg font-semibold text-blue-800 mb-3">전문 상담이 필요하신가요?</h4>
          <p className="text-gray-700 mb-4">
            자가진단 결과 뇌신경 또는 뇌졸중 관련 징후가 감지되었습니다. 
            정확한 진단과 적절한 조치를 위해 전문 상담사와의 상담을 권장드립니다.
          </p>
          <div className="flex justify-center">
            <Link 
              to="/login-counsel" // 상담 페이지로 이동하는 링크
              className="inline-flex items-center px-6 py-3 bg-[#55BCA4] text-white font-medium rounded-lg shadow-sm hover:bg-[#4AA090] transition-colors duration-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              상담 시작하기
            </Link>
          </div>
        </div>
        
       
      </div>
    </div>
  );
};

export default AbnormalResult;