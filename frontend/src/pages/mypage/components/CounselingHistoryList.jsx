import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CounselingHistoryList = ({ counselorId }) => {
  const [counselingHistory, setCounselingHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [expandedRowId, setExpandedRowId] = useState(null);

  // 임시 데이터 배열
  const sampleData = [
    {
      summary_id: 1,
      user_id: 29,
      counselor_id: 1001,
      summary_topic: '수면 문제',
      symptoms: '불면기 어렵거나 자주 깨는 증후',
      treatment: '수면 위생 개선, 이완기법 훈련',
      counselor_note: '고객님께서 원하는 더 어려움을 극복 체시드로드. 수면에 대한 불안감이 심해 인지행동 테라피를 적용했습니다. 취침 전 루틴을 확립하고 카페인 섭취를 줄이는 것이 중요하다고 말씀드렸습니다. 다음 세션에서는 명상 기법 연습을 더 해볼 예정입니다.',
      next_schedule: '2025-04-15',
      created_at: '2025-04-01'
    },
    {
      summary_id: 2,
      user_id: 29,
      counselor_id: 1001,
      summary_topic: '관계 문제',
      symptoms: '갈가리에 연관된',
      treatment: '1. 문화적 휴식과 소통의 중요성 배움.',
      counselor_note: '자주 식으루 작업할때 다른사니드. 내담자가 가족관계에서 의사소통의 어려움을 호소하여 효과적인 대화 기법에 대해 논의했습니다. 특히 "I" 메시지를 사용하는 방법과 적극적 경청에 대해 중점적으로 이야기했습니다. 가족 구성원들과의 대화 빈도를 늘리고 감정을 표현하는 연습을 과제로 내드렸습니다.',
      next_schedule: '2025-04-18',
      created_at: '2025-04-02'
    },
    {
      summary_id: 3,
      user_id: 29,
      counselor_id: 1001,
      summary_topic: '정신건강 상담',
      symptoms: '반복적인 좋을 사용으로 인한 사회적 및 개인적 어려움',
      treatment: '인지 지료와강화 초점 훈련 전형',
      counselor_note: '고객의 갈등을 이해하고, 자료하게 답환을 츠소. 내담자의 불안 증상이 일상생활에 미치는 영향이 심각한 수준임을 확인했습니다. 점진적 노출 훈련을 시작했으며, 호흡 기법을 통한 불안 관리 방법도 함께 연습했습니다. 약물 치료에 대한 의사의 상담도 권유했으며, 내담자는 이를 긍정적으로 고려하겠다고 했습니다.',
      next_schedule: '2025-04-22',
      created_at: '2025-04-05'
    },
    {
      summary_id: 4,
      user_id: 29,
      counselor_id: 1001,
      summary_topic: '정서 문제 상담',
      symptoms: '지속적인 절작 클관심',
      treatment: '주기 정작 답사 및 이비안훈자 상담 관장',
      counselor_note: '고객의 정서 문제는 향상 성향에 영향을 미쳐 가. 내담자가 최근 경험한 상실감에 대해 깊이 이야기를 나눴습니다. 슬픔을 처리하는 건강한 방법과 자기 돌봄의 중요성에 대해 논의했습니다. 감정 일기를 쓰는 것을 과제로 내드렸고, 다음 세션에서 이에 대해 더 이야기할 예정입니다. 지원 그룹 참여도 권유했습니다.',
      next_schedule: '2025-04-25',
      created_at: '2025-04-08'
    }
  ];

  useEffect(() => {
    const fetchCounselingHistory = async () => {
      if (!counselorId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // 실제 API 호출 대신 임시 데이터 사용
        /*
        const response = await axios.get(`/api/counseling/summary/counselor/${counselorId}`, {
          params: { page: currentPage - 1, size: 10 }
        });
        
        setCounselingHistory(response.data.content || []);
        setTotalPages(response.data.totalPages || 1);
        */
        
        // 임시 데이터 사용
        setTimeout(() => {
          setCounselingHistory(sampleData);
          setTotalPages(1);
          setLoading(false);
        }, 500);
        
      } catch (err) {
        console.error('상담 기록을 불러오는 중 오류가 발생했습니다:', err);
        setError('상담 기록을 불러오는 중 오류가 발생했습니다.');
        setLoading(false);
      }
    };

    fetchCounselingHistory();
  }, [counselorId, currentPage]);

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit'
    });
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    setExpandedRowId(null); // 페이지 변경 시 확장된 행 초기화
  };

  const toggleRow = (summaryId) => {
    setExpandedRowId(expandedRowId === summaryId ? null : summaryId);
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
    } else if (topic.includes('정서')) {
      return { icon: "😊", color: "bg-yellow-50" };
    } else {
      return { icon: "📝", color: "bg-gray-100" };
    }
  };

  if (loading && counselingHistory.length === 0) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#00a173]"></div>
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
          const isExpanded = expandedRowId === record.summary_id;
          
          return (
            <div 
              key={record.summary_id} 
              className={`border rounded-lg overflow-hidden transition-all duration-200 ${isExpanded ? 'shadow-md' : 'shadow-sm'}`}
            >
              <div 
                className={`flex items-center p-4 cursor-pointer ${color} hover:bg-opacity-80 transition-colors`}
                onClick={() => toggleRow(record.summary_id)}
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
                      <span className="text-xs text-gray-500 block">생성 일자</span>
                      <span className="text-sm font-medium text-gray-700">{formatDate(record.created_at)}</span>
                    </div>
                    
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
      
      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <nav className="flex items-center bg-white px-4 py-2 rounded-lg shadow-sm">
            <button
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={`mx-1 px-3 py-1 rounded-md ${
                currentPage === 1 
                  ? 'text-gray-400 cursor-not-allowed' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              이전
            </button>
            
            {[...Array(totalPages).keys()].map(page => (
              <button
                key={page + 1}
                onClick={() => handlePageChange(page + 1)}
                className={`mx-1 px-3 py-1 rounded-md ${
                  currentPage === page + 1
                    ? 'bg-[#00a173] text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {page + 1}
              </button>
            ))}
            
            <button
              onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className={`mx-1 px-3 py-1 rounded-md ${
                currentPage === totalPages
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              다음
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

export default CounselingHistoryList;