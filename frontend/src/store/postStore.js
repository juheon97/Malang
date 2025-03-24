import { create } from 'zustand';
import { PostService } from '../api';

const usePostStore = create((set, get) => ({
  // 상태
  posts: [],
  currentPost: null,
  loading: false,
  error: null,
  
  // 액션
  fetchPosts: async (page = 1) => {
    set({ loading: true });
    try {
      const response = await PostService.getAllPosts(page);
      set({ 
        posts: response.data.posts || response.data,
        loading: false,
        error: null
      });
    } catch (error) {
      console.error('게시글 목록 로딩 오류:', error);
      set({ 
        error: '게시글을 불러오는 중 오류가 발생했습니다.',
        loading: false
      });
    }
  },
  
  fetchPostById: async (id) => {
    set({ loading: true });
    try {
      const response = await PostService.getPostById(id);
      set({ 
        currentPost: response.data,
        loading: false,
        error: null
      });
      return response.data;
    } catch (error) {
      console.error('게시글 상세 로딩 오류:', error);
      set({ 
        error: '게시글을 불러오는 중 오류가 발생했습니다.',
        loading: false
      });
    }
  },
  
  createPost: async (postData) => {
    set({ loading: true });
    try {
      const response = await PostService.createPost(postData);
      set(state => ({ 
        posts: [response.data, ...state.posts],
        loading: false,
        error: null
      }));
      return response.data;
    } catch (error) {
      console.error('게시글 작성 오류:', error);
      set({ 
        error: '게시글 작성 중 오류가 발생했습니다.',
        loading: false
      });
      throw error;
    }
  },
  
  updatePost: async (id, postData) => {
    set({ loading: true });
    try {
      const response = await PostService.updatePost(id, postData);
      set(state => ({
        posts: state.posts.map(post => 
          post.id === parseInt(id) ? { ...post, ...postData } : post
        ),
        currentPost: { ...state.currentPost, ...postData },
        loading: false,
        error: null
      }));
      return response.data;
    } catch (error) {
      console.error('게시글 수정 오류:', error);
      set({ 
        error: '게시글 수정 중 오류가 발생했습니다.',
        loading: false
      });
      throw error;
    }
  },
  
  deletePost: async (id) => {
    set({ loading: true });
    try {
      await PostService.deletePost(id);
      set(state => ({
        posts: state.posts.filter(post => post.id !== parseInt(id)),
        loading: false,
        error: null
      }));
    } catch (error) {
      console.error('게시글 삭제 오류:', error);
      set({ 
        error: '게시글 삭제 중 오류가 발생했습니다.',
        loading: false
      });
      throw error;
    }
  },
  
  updateLikes: async (id, likes) => {
    try {
      await PostService.updateLikes(id, likes);
      set(state => ({
        posts: state.posts.map(post => 
          post.id === parseInt(id) ? { ...post, likes } : post
        ),
        currentPost: state.currentPost?.id === parseInt(id) 
          ? { ...state.currentPost, likes } 
          : state.currentPost,
      }));
    } catch (error) {
      console.error('좋아요 업데이트 오류:', error);
      throw error;
    }
  },
  
  // 이미지 관련 메서드
  removeImage: (index) => {
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
