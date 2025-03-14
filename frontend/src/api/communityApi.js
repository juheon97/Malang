// 커뮤니티 api 연동
import axios from 'axios';

// API 기본 URL (백엔드 서버 주소로 나중에 변경)
const BASE_URL = 'http://localhost:8080/api';

// axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터 설정 (토큰 추가 등)
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 게시글 관련 API
export const postAPI = {
  // 모든 게시글 조회
  getAllPosts: () => apiClient.get('/posts'),
  
  // 특정 게시글 조회
  getPostById: (postId) => apiClient.get(`/posts/${postId}`),
  
  // 게시글 작성
  createPost: (postData) => apiClient.post('/posts', postData),
  
  // 게시글 수정
  updatePost: (postId, postData) => apiClient.put(`/posts/${postId}`, postData),
  
  // 게시글 삭제
  deletePost: (postId) => apiClient.delete(`/posts/${postId}`),
};

// 댓글 관련 API
export const commentAPI = {
  // 게시글의 모든 댓글 조회
  getCommentsByPostId: (postId) => apiClient.get(`/posts/${postId}/comments`),
  
  // 댓글 작성
  createComment: (postId, commentData) => apiClient.post(`/posts/${postId}/comments`, commentData),
  
  // 댓글 수정
  updateComment: (commentId, commentData) => apiClient.put(`/comments/${commentId}`, commentData),
  
  // 댓글 삭제
  deleteComment: (commentId) => apiClient.delete(`/comments/${commentId}`),
};
