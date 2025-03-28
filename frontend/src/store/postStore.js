// src/store/postStore.js
import { create } from 'zustand';
import { PostService } from '../api';

const usePostStore = create((set, get) => ({
  // 상태
  posts: [],
  totalCount: 0,
  currentPage: 1,
  totalPages: 1,
  loading: false,
  error: null,
  category: null,
  sort: 'latest',
  currentPost: null,

  // 액션
  fetchPosts: async (page = 1, size = 10, category = null, sort = 'latest') => {
    set({ loading: true });
    try {
      let response;
      if (category) {
        response = await PostService.getPostsByCategory(
          category,
          page,
          size,
          sort,
        );
      } else {
        response = await PostService.getAllPosts(page, size, category, sort);
      }

      // API 응답 구조에 맞게 상태 업데이트
      const { data } = response.data;

      set({
        posts: data.article.map(article => ({
          id: article.article_id,
          category: article.category,
          title: article.title,
          date: article.created_at,
          likes: article.likes,
        })),
        totalCount: data.total_count,
        currentPage: data.current_page,
        totalPages: data.total_pages,
        category,
        sort,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error('게시글 목록 로딩 오류:', error);
      set({
        error: '게시글을 불러오는 중 오류가 발생했습니다.',
        loading: false,
      });
    }
  },

  // 정렬 방식 변경
  setSortOrder: sort => {
    set({ sort });
    get().fetchPosts(get().currentPage, 10, get().category, sort);
  },

  // 카테고리 변경
  setCategory: category => {
    set({ category });
    get().fetchPosts(1, 10, category, get().sort);
  },

  // 기존 메서드들 유지...
  fetchPostById: async articleId => {
    set({ loading: true });
    try {
      const response = await PostService.getPostById(articleId);

      // API 응답 구조에 맞게 처리
      const { status, data } = response.data;

      if (status === 'success') {
        const { article, comments } = data;

        // 게시글 데이터 매핑
        const postData = {
          id: article.article_id,
          title: article.title,
          content: article.content,
          category: article.category,
          date: article.created_at,
          likes: article.like_count,
          isLiked: article.is_liked,
          // 다른 필요한 필드들...
        };

        // 댓글 데이터 매핑
        const commentsData = comments.map(comment => ({
          id: comment.comment_id,
          content: comment.content,
          authorName: comment.user_nickname,
          date: new Date(comment.created_at)
            .toLocaleDateString('ko-KR', {
              year: '2-digit',
              month: '2-digit',
              day: '2-digit',
            })
            .replace(/\. /g, '.')
            .replace(/\.$/, ''),
          // 다른 필요한 필드들...
        }));

        set({
          currentPost: postData,
          comments: commentsData,
          loading: false,
          error: null,
        });

        return { post: postData, comments: commentsData };
      }
    } catch (error) {
      console.error('게시글 상세 조회 실패:', error);

      // 에러 처리
      let errorMessage = '게시글을 불러오는 중 오류가 발생했습니다.';

      // API 에러 응답 처리
      if (error.response && error.response.data) {
        const { message } = error.response.data;
        if (message) {
          errorMessage = message;
        }
      }

      set({
        error: errorMessage,
        loading: false,
      });

      throw error;
    }
  },

  createPost: async postData => {
    set({ loading: true });
    try {
      const response = await PostService.createPost(postData);

      // API 응답 구조에 맞게 처리
      const { status, data } = response.data;

      if (status === 'success') {
        // 게시글 목록에 새 게시글 추가 (임시 데이터로, 실제로는 목록을 다시 불러오는 것이 좋음)
        const newPost = {
          id: data.article_id,
          title: postData.title,
          content: postData.content,
          category: postData.category,
          date: new Date()
            .toLocaleDateString('ko-KR', {
              year: '2-digit',
              month: '2-digit',
              day: '2-digit',
            })
            .replace(/\. /g, '.')
            .replace(/\.$/, ''),
          authorId: postData.authorId,
          authorName: postData.authorName,
          likes: 0,
        };

        set(state => ({
          posts: [newPost, ...state.posts],
          loading: false,
          error: null,
        }));

        return response.data;
      }
    } catch (error) {
      console.error('게시글 작성 실패:', error);

      // 에러 처리
      let errorMessage = '게시글 작성 중 오류가 발생했습니다.';
      let errorDetails = {};

      // API 에러 응답 처리
      if (error.response && error.response.data) {
        const { errorCode, message, details } = error.response.data;

        if (message) {
          errorMessage = message;
        }

        if (details) {
          errorDetails = details;
        }
      }

      set({
        error: errorMessage,
        errorDetails: errorDetails,
        loading: false,
      });

      throw error;
    }
  },

  // 게시글 수정 (API 명세서에 맞게 수정)
  updatePost: async (articleId, postData) => {
    set({ loading: true });
    try {
      const response = await PostService.updatePost(articleId, postData);

      // API 응답 구조에 맞게 처리
      const { status, data } = response.data;

      if (status === 'success') {
        // 현재 게시글 업데이트
        const currentPost = get().currentPost;
        if (currentPost && currentPost.id === parseInt(articleId)) {
          set({
            currentPost: {
              ...currentPost,
              title: postData.title,
              content: postData.content,
              category: postData.category,
            },
          });
        }

        // 게시글 목록에서도 업데이트
        set(state => ({
          posts: state.posts.map(post =>
            post.id === parseInt(articleId)
              ? {
                  ...post,
                  title: postData.title,
                  content: postData.content,
                  category: postData.category,
                }
              : post,
          ),
          loading: false,
          error: null,
        }));

        return response.data;
      }
    } catch (error) {
      console.error('게시글 수정 실패:', error);

      // 에러 처리
      let errorMessage = '게시글 수정 중 오류가 발생했습니다.';
      let errorDetails = {};

      // API 에러 응답 처리
      if (error.response && error.response.data) {
        const { message, details } = error.response.data;

        if (message) {
          errorMessage = message;
        }

        if (details) {
          errorDetails = details;
        }
      }

      set({
        error: errorMessage,
        errorDetails: errorDetails,
        loading: false,
      });

      throw error;
    }
  },

  // 게시글 삭제 (API 명세서에 맞게 수정)
  deletePost: async articleId => {
    set({ loading: true });
    try {
      const response = await PostService.deletePost(articleId);

      // API 응답 구조에 맞게 처리
      const { status, message } = response.data;

      if (status === 'success') {
        // 게시글 목록에서 삭제
        set(state => ({
          posts: state.posts.filter(post => post.id !== parseInt(articleId)),
          loading: false,
          error: null,
        }));

        return response.data;
      }
    } catch (error) {
      console.error('게시글 삭제 실패:', error);

      // 에러 처리
      let errorMessage = '게시글 삭제 중 오류가 발생했습니다.';
      let errorDetails = {};

      // API 에러 응답 처리
      if (error.response && error.response.data) {
        const { message, details } = error.response.data;

        if (message) {
          errorMessage = message;
        }

        if (details) {
          errorDetails = details;
        }
      }

      set({
        error: errorMessage,
        errorDetails: errorDetails,
        loading: false,
      });

      throw error;
    }
  },

  updateLikes: async (id, likes) => {
    try {
      await PostService.updateLikes(id, likes);
      set(state => ({
        posts: state.posts.map(post =>
          post.id === parseInt(id) ? { ...post, likes } : post,
        ),
        currentPost:
          state.currentPost?.id === parseInt(id)
            ? { ...state.currentPost, likes }
            : state.currentPost,
      }));
    } catch (error) {
      console.error('좋아요 업데이트 오류:', error);
      throw error;
    }
  },

  // 이미지 관련 메서드
  removeImage: index => {
    set(state => {
      if (!state.currentPost) return state;

      let updatedPost = { ...state.currentPost };

      if (Array.isArray(updatedPost.fileUrls)) {
        // 배열인 경우 해당 인덱스 제거
        const newFileUrls = [...updatedPost.fileUrls];
        newFileUrls.splice(index, 1);
        updatedPost.fileUrls = newFileUrls.length > 0 ? newFileUrls : null;
      } else {
        // 단일 이미지인 경우 전체 제거
        updatedPost.fileUrl = null;
        updatedPost.fileUrls = null;
      }

      return { currentPost: updatedPost };
    });
  },

  resetCurrentPost: () => set({ currentPost: null }),
}));

export default usePostStore;
