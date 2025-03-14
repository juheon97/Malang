// src/api/index.js
import { postAPI, commentAPI } from './communityApi';
import { mockPostAPI, mockCommentAPI } from './mockdata';

// Vite 환경 변수 사용 (VITE_ 접두사 필요)
const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === 'true';

// 사용할 API 서비스 내보내기
export const PostService = USE_MOCK_API ? mockPostAPI : postAPI;
export const CommentService = USE_MOCK_API ? mockCommentAPI : commentAPI;
