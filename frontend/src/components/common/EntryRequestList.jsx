import React from 'react';

const EntryRequestList = ({ entryRequests, onAccept, onReject }) => {
  return (
    <div className="fixed top-20 right-4 z-50">
      {entryRequests.map((request) => (
        <div key={request.id} className="bg-white rounded-lg shadow-lg p-4 mb-2 w-72">
          <p className="text-sm mb-3">
            {request.name}({request.birthdate})님께서 입장을 요청하셨습니다.
          </p>
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => onAccept(request.id)}
              className="px-3 py-1 bg-[#E8F5E9] text-green-600 rounded-full text-sm hover:bg-[#C8E6C9]"
            >
              수락
            </button>
            <button
              onClick={() => onReject(request.id)}
              className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-sm hover:bg-red-200"
            >
              거절
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default EntryRequestList; 