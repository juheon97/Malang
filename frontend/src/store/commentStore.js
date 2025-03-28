import { create } from 'zustand';
import { CommentService } from '../api';

const useCommentStore = create(set => ({
  // 상태
  comments: [],
  loading: false,
  error: null,

  // 액션
  fetchComments: async postId => {
    set({ loading: true });
    try {
      const response = await CommentService.getCommentsByPostId(postId);

      // 각 댓글에 replies 배열이 없으면 빈 배열 추가
      const commentsWithReplies = response.data.map(comment => ({
        ...comment,
        replies: comment.replies || [],
      }));

      set({
        comments: commentsWithReplies,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error('댓글 로딩 오류:', error);
      set({
        error: '댓글을 불러오는 중 오류가 발생했습니다.',
        loading: false,
      });
    }
  },

  addComment: async (postId, commentData) => {
    set({ loading: true });
    try {
      const response = await CommentService.createComment(postId, commentData);
      set(state => ({
        comments: [...state.comments, response.data],
        loading: false,
        error: null,
      }));
    } catch (error) {
      console.error('댓글 작성 오류:', error);
      set({
        error: '댓글 작성 중 오류가 발생했습니다.',
        loading: false,
      });
      throw error;
    }
  },

  updateComment: async (commentId, commentData) => {
    set({ loading: true });
    try {
      const response = await CommentService.updateComment(
        commentId,
        commentData,
      );
      set(state => ({
        comments: state.comments.map(comment =>
          comment.id === parseInt(commentId)
            ? { ...comment, ...commentData }
            : comment,
        ),
        loading: false,
        error: null,
      }));
    } catch (error) {
      console.error('댓글 수정 오류:', error);
      set({
        error: '댓글 수정 중 오류가 발생했습니다.',
        loading: false,
      });
      throw error;
    }
  },

  deleteComment: async commentId => {
    set({ loading: true });
    try {
      await CommentService.deleteComment(commentId);
      set(state => ({
        comments: state.comments.filter(
          comment => comment.id !== parseInt(commentId),
        ),
        loading: false,
        error: null,
      }));
    } catch (error) {
      console.error('댓글 삭제 오류:', error);
      set({
        error: '댓글 삭제 중 오류가 발생했습니다.',
        loading: false,
      });
      throw error;
    }
  },

  addReply: async (commentId, replyData) => {
    set({ loading: true });
    try {
      // 백엔드 연동 시 주석 해제
      // const response = await CommentService.addReply(commentId, replyData);

      // 임시 구현 (백엔드 연동 전)
      const newReply = {
        ...replyData,
        id: Date.now() + Math.random().toString(36).substr(2, 9),
      };

      // 함수형 업데이트로 최신 상태 참조 보장
      set(state => {
        // 기존 댓글 찾기
        const targetComment = state.comments.find(
          comment => comment.id === parseInt(commentId),
        );

        // 댓글이 없으면 상태 변경 없음
        if (!targetComment) return state;

        // 댓글에 replies 배열이 없으면 새로 생성
        const updatedReplies = targetComment.replies
          ? [...targetComment.replies, newReply]
          : [newReply];

        // 업데이트된 댓글 목록 생성
        const updatedComments = state.comments.map(comment =>
          comment.id === parseInt(commentId)
            ? { ...comment, replies: updatedReplies }
            : comment,
        );

        return {
          comments: updatedComments,
          loading: false,
          error: null,
        };
      });

      // 성공 시 newReply 반환 (필요한 경우)
      return newReply;
    } catch (error) {
      console.error('답글 작성 오류:', error);
      set({
        error: '답글 작성 중 오류가 발생했습니다.',
        loading: false,
      });
      throw error;
    }
  },

  updateReply: async (commentId, replyId, replyData) => {
    set({ loading: true });
    try {
      // 실제 API 호출 (백엔드 연동 시)
      // const response = await CommentService.updateReply(commentId, replyId, replyData);

      set(state => ({
        comments: state.comments.map(comment =>
          comment.id === parseInt(commentId)
            ? {
                ...comment,
                replies: comment.replies.map(reply =>
                  reply.id === replyId ? { ...reply, ...replyData } : reply,
                ),
              }
            : comment,
        ),
        loading: false,
        error: null,
      }));
    } catch (error) {
      console.error('답글 수정 오류:', error);
      set({
        error: '답글 수정 중 오류가 발생했습니다.',
        loading: false,
      });
      throw error;
    }
  },

  deleteReply: async (commentId, replyId) => {
    set({ loading: true });
    try {
      // 실제 API 호출 (백엔드 연동 시)
      // await CommentService.deleteReply(commentId, replyId);

      set(state => ({
        comments: state.comments.map(comment =>
          comment.id === parseInt(commentId)
            ? {
                ...comment,
                replies: comment.replies.filter(reply => reply.id !== replyId),
              }
            : comment,
        ),
        loading: false,
        error: null,
      }));
    } catch (error) {
      console.error('답글 삭제 오류:', error);
      set({
        error: '답글 삭제 중 오류가 발생했습니다.',
        loading: false,
      });
      throw error;
    }
  },

  resetComments: () => set({ comments: [] }),
}));

export default useCommentStore;
