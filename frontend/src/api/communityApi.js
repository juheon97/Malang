// src/api/communityApi.js
import axios from 'axios';

// API 기본 URL (실제 백엔드 서버 주소로 변경 필요)
const API_URL = import.meta.env.VITE_API_URL;

// axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// 요청 인터셉터에 토큰 추가
apiClient.interceptors.request.use(
  config => {
    const token = sessionStorage.getItem('token'); // localStorage에서 sessionStorage로 변경
    console.log('Current token:', token);
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  },
);
// 게시글 관련 API
export const postAPI = {
  // 모든 게시글 조회 (API 명세서에 맞게 수정)
  getAllPosts: (page = 1, size = 10, category = null, sort = 'latest') => {
    const params = { page, size };
    let endpoint =
      sort === 'latest' ? '/community/get/latest' : '/community/get/oldest';
    if (category) {
      endpoint = `/community/get/${category}`;
    }
    return apiClient.get(endpoint, { params });
  },

  // 카테고리별 게시글 조회
  getPostsByCategory: (category, page = 1, size = 10, sort = 'latest') => {
    return apiClient.get(`/community/category/${category}`, {
      params: { page, size, sort },
    });
  },

  // 특정 게시글 조회
  getPostById: articleId => {
    return apiClient.get(`/community/article/${articleId}`);
  },

  // 게시글 작성 API 엔드포인트 수정
  createPost: postData => {
    const apiPostData = {
      community_category: postData.category,
      title: postData.title,
      content: postData.content,
      user_id: postData.authorId,
    };
    return apiClient.post('/community/create', apiPostData);
  },

  // 게시글 수정 (PUT 메서드)
  updatePost: (articleId, postData) => {
    const apiPostData = {
      community_category: postData.category,
      title: postData.title,
      content: postData.content,
      user_id: postData.authorId,
    };
    return apiClient.put(`/community/article/${articleId}`, apiPostData);
  },

  // 게시글 삭제 (DELETE 메서드)
  deletePost: articleId => {
    return apiClient.delete(`/community/article/${articleId}`);
  },

  // 게시글 좋아요 업데이트
  updateLikes: (postId, likes) =>
    apiClient.patch(`/posts/${postId}`, { likes }),

  createPostWithFile: async formData => {
    try {
      const response = await axios.post('/api/posts/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      return response;
    } catch (error) {
      console.error('파일 업로드 오류:', error);
      throw error;
    }
  },
};

export const commentAPI = {
  // 댓글 작성 API 엔드포인트 수정
  createComment: (postId, commentData) =>
    apiClient.post(`/community/article/${postId}/comments`, commentData), // Swagger 명세에 맞게 엔드포인트 변경

  // 다른 API 메서드들도 동일하게 수정
  getCommentsByPostId: postId =>
    apiClient.get(`/community/article/${postId}/comments`),

  updateComment: (commentId, commentData) =>
    apiClient.put(`/community/comments/${commentId}`, commentData),

  deleteComment: commentId =>
    apiClient.delete(`/community/comments/${commentId}`),
};
