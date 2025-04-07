import React, { useState, useEffect } from 'react';
import axios from 'axios';
import counselorHistoryApi from '../../../api/counselorHistoryApi';

const CounselingHistoryList = () => {
  const [counselingHistory, setCounselingHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedRowId, setExpandedRowId] = useState(null);
  const [counselorId, setCounselorId] = useState(null);
  
  // 상담사 정보 직접 가져오기
  useEffect(() => {
    const fetchCounselorProfile = async () => {
      try {
        setLoading(true);
        
        // API URL 가져오기
        const API_URL = import.meta.env.VITE_API_URL;
        
        // 토큰 가져오기
        const token = sessionStorage.getItem('token');
        if (!token) {
          console.error('인증 토큰이 없습니다.');
          setError('로그인이 필요합니다.');
          setLoading(false);
          return;
        }
        
        console.log('상담사 프로필 API 호출 시작');
        const response = await axios.get(`${API_URL}/counselor/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Cache-Control': 'no-cache'
          }
        });
        
        console.log('상담사 프로필 응답:', response.data);
        
        if (response.data && response.data.counselorId) {
          console.log('상담사 ID 발견:', response.data.counselorId);
          setCounselorId(response.data.counselorId);
        } else {
          // counselorId 대신 userId 확인
          if (response.data && response.data.userId) {
            const id = response.data.userId;
            console.log('userId로 대체:', id);
            // 임시 해결책 - 특정 사용자 ID를 상담사 ID로 매핑
            // 예: userId 18 -> counselorId 1008
            if (id === 18) {
              setCounselorId(1008);
            } else {
              setCounselorId(id); // 없으면 userId를 그대로 사용
            }
          } else {
            console.error('상담사 ID를 찾을 수 없습니다.');
            setError('상담사 정보를 찾을 수 없습니다.');
          }
        }
      } catch (err) {
        console.error('상담사 정보 가져오기 실패:', err);
        console.log('오류 상세:', err.response?.data);
        setError('상담사 정보를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCounselorProfile();
  }, []);
  
  // counselorId가 설정되면 상담 기록 조회
  useEffect(() => {
    const fetchCounselingHistory = async () => {
      if (!counselorId) {
        console.log('상담사 ID가 없어 API 호출 중단');
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        console.log('상담 기록 API 호출 시작, counselorId:', counselorId);
        const response = await counselorHistoryApi.getCounselorHistory(counselorId);
        console.log('상담 기록 API 응답 데이터:', response);
        
        setCounselingHistory(response || []);
      } catch (err) {
        console.error('상담 기록 조회 오류:', err);
        console.log('에러 상세 정보:', err.response?.data);
        setError('상담 기록을 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchCounselingHistory();
  }, [counselorId]);

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit'
    });
  };

  const toggleRow = (index) => {
    setExpandedRowId(expandedRowId === index ? null : index);
  };

  // 상담 주제에 따른 아이콘과 색상 지정
  const getTopicInfo = (topic) => {
    if (!topic) return { icon: "📝", color: "bg-gray-100" };
    
    topic = topic.toLowerCase();
    if (topic.includes('수면')) {
      return { icon: "💤", color: "bg-indigo-50" };
    } else if (topic.includes('관계')) {
      return { icon: "👥", color: "bg-blue-50" };
    } else if (topic.includes('정신건강')) {
      return { icon: "🧠", color: "bg-green-50" };
    } else if (topic.includes('청각') || topic.includes('귀')) {
      return { icon: "👂", color: "bg-yellow-50" };
    } else if (topic.includes('정서') || topic.includes('스트레스')) {
      return { icon: "😊", color: "bg-purple-50" };
    } else {
      return { icon: "📝", color: "bg-gray-100" };
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#00a173]"></div>
        <p className="ml-3 text-gray-600">데이터를 불러오는 중입니다...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4 rounded-md">
        <div className="flex items-center">
          <svg className="h-6 w-6 text-red-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  if (!counselorId) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4 rounded-md">
        <div className="flex items-center">
          <svg className="h-6 w-6 text-yellow-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-yellow-700">상담사 정보를 찾을 수 없습니다. 상담사로 로그인했는지 확인해주세요.</p>
        </div>
      </div>
    );
  }

  if (counselingHistory.length === 0) {
    return (
      <div className="text-center py-10">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 className="mt-2 text-lg font-medium text-gray-900">상담 기록이 없습니다</h3>
        <p className="mt-1 text-sm text-gray-500">아직 진행한 상담이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">상담 기록 내역</h2>
        <span className="text-sm text-gray-500">총 {counselingHistory.length}개의 상담 기록</span>
      </div>
      
      <div className="space-y-4">
        {counselingHistory.map((record, index) => {
          const { icon, color } = getTopicInfo(record.summary_topic);
          const isExpanded = expandedRowId === index;
          
          return (
            <div 
              key={index} 
              className={`border rounded-lg overflow-hidden transition-all duration-200 ${isExpanded ? 'shadow-md' : 'shadow-sm'}`}
            >
              <div 
                className={`flex items-center p-4 cursor-pointer ${color} hover:bg-opacity-80 transition-colors`}
                onClick={() => toggleRow(index)}
              >
                <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm text-lg">
                  {icon}
                </div>
                
                <div className="ml-4 flex-grow">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-medium text-gray-900">{record.summary_topic || '미분류'}</h3>
                  </div>
                  <p className="text-sm text-gray-600 mt-1 truncate">{record.symptoms || '증상 정보 없음'}</p>
                </div>
                
                <div className="ml-4 flex-shrink-0">
                  <div className="flex items-center space-x-6">
                    <div className="text-right">
                      <span className="text-xs text-gray-500 block">다음 일정</span>
                      <span className="text-sm font-medium text-gray-700">{formatDate(record.next_schedule)}</span>
                    </div>
                    
                    <svg 
                      className={`w-5 h-5 text-gray-400 transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
              
              {isExpanded && (
                <div className="p-4 bg-white border-t">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <h4 className="font-medium text-gray-700 mb-2 text-sm">치료 방법</h4>
                      <p className="text-sm text-gray-600">
                        {record.treatment || '치료 방법 정보 없음'}
                      </p>
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <h4 className="font-medium text-gray-700 mb-2 text-sm">증상 상세</h4>
                      <p className="text-sm text-gray-600">
                        {record.symptoms || '증상 정보 없음'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-[#f5fdf5] p-4 rounded-lg border border-[#e0f5e9]">
                    <h4 className="font-medium text-[#00a173] mb-2 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                      상담사 노트
                    </h4>
                    <p className="text-sm text-gray-700 whitespace-pre-line">
                      {record.counselor_note || '상담 노트가 없습니다.'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CounselingHistoryList;