// hooks/useEntryRequests.js
import { useState, useEffect } from 'react';
import { mockEntryRequests } from '../api/entryRequests';

export default function useEntryRequests() {
  const [entryRequests, setEntryRequests] = useState([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setEntryRequests(mockEntryRequests);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleAcceptRequest = requestId => {
    setEntryRequests(prev => prev.filter(req => req.id !== requestId));
    console.log(`입장 요청 수락: ${requestId}`);
  };

  const handleRejectRequest = requestId => {
    setEntryRequests(prev => prev.filter(req => req.id !== requestId));
    console.log(`입장 요청 거절: ${requestId}`);
  };

  return {
    entryRequests,
    handleAcceptRequest,
    handleRejectRequest,
  };
}
