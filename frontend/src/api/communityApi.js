// src/api/communityApi.js
import axios from 'axios';

// API 기본 URL (실제 백엔드 서버 주소로 변경 필요)
const API_URL = 'https://j12d110.p.ssafy.io/api';

// axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 게시글 관련 API
export const postAPI = {
  // 모든 게시글 조회
  getAllPosts: (page = 1) => apiClient.get(`/posts?page=${page}`),

  // 특정 게시글 조회
  getPostById: postId => apiClient.get(`/posts/${postId}`),

  // 게시글 작성
  createPost: postData => apiClient.post('/posts', postData),

  // 게시글 수정
  updatePost: (postId, postData) => apiClient.put(`/posts/${postId}`, postData),

  // 게시글 삭제
  deletePost: postId => apiClient.delete(`/posts/${postId}`),

  // 게시글 좋아요 업데이트
  updateLikes: (postId, likes) =>
    apiClient.patch(`/posts/${postId}`, { likes }),

  createPostWithFile: async formData => {
    try {
      const response = await axios.post('/api/posts/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response;
    } catch (error) {
      console.error('파일 업로드 오류:', error);
      throw error;
    }
  },
};

// 댓글 관련 API
export const commentAPI = {
  // 게시글의 모든 댓글 조회
  getCommentsByPostId: postId => apiClient.get(`/posts/${postId}/comments`),

  // 댓글 작성
  createComment: (postId, commentData) =>
    apiClient.post(`/posts/${postId}/comments`, commentData),

  // 댓글 수정
  updateComment: (commentId, commentData) =>
    apiClient.put(`/comments/${commentId}`, commentData),

  // 댓글 삭제
  deleteComment: commentId => apiClient.delete(`/comments/${commentId}`),
};
