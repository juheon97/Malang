// src/api/index.js
import { postAPI, commentAPI } from './communityApi';
import { mockPostAPI, mockCommentAPI } from './mockData';

// 강제로 목 API 사용 설정
const USE_MOCK_API = true; // import.meta.env.VITE_USE_MOCK_API === 'true' 대신

// 사용할 API 서비스 내보내기
export const PostService = USE_MOCK_API ? mockPostAPI : postAPI;
export const CommentService = USE_MOCK_API ? mockCommentAPI : commentAPI;
