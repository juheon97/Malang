// src/api/mockData.js
// 목 데이터
let posts = [
    {
      id: 1,
      title: '시작장애에 어떻게 여기서 글을 쓰지?',
      content: '시작장애가 있는데 어떻게 글을 쓰나요?',
      category: '시작장애',
      date: '25.03.14',
      authorId: 1,
      authorName: '익명의 리뷰어',
      likes: 56,
      comments: [
        {
          id: 1,
          postId: 1,
          content: '우와 글쓰기~~~~!',
          authorId: 2,
          authorName: '다른 사용자',
          date: '25.03.14'
        }
      ]
    },
    {
      id: 2,
      title: '인정? 이게 맞나요?',
      content: '인정하시나요?',
      category: '인정?',
      date: '25.03.14',
      authorId: 2,
      authorName: '다른 사용자',
      likes: 100,
      comments: []
    }
  ];
  
  // 목 서비스
  export const mockPostAPI = {
    getAllPosts: () => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ data: posts });
        }, 500);
      });
    },
    
    getPostById: (postId) => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const post = posts.find(p => p.id === parseInt(postId));
          if (post) {
            resolve({ data: post });
          } else {
            reject({ message: '게시글을 찾을 수 없습니다.' });
          }
        }, 500);
      });
    },
    
    createPost: (postData) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          const newPost = {
            ...postData,
            id: posts.length + 1,
            date: new Date().toLocaleDateString('ko-KR', {
              year: '2-digit',
              month: '2-digit',
              day: '2-digit'
            }).replace(/\. /g, '.').replace(/\.$/, ''),
            comments: []
          };
          posts = [newPost, ...posts];
          resolve({ data: newPost });
        }, 500);
      });
    },
    
    updatePost: (postId, postData) => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const index = posts.findIndex(p => p.id === parseInt(postId));
          if (index !== -1) {
            posts[index] = { ...posts[index], ...postData };
            resolve({ data: posts[index] });
          } else {
            reject({ message: '게시글을 찾을 수 없습니다.' });
          }
        }, 500);
      });
    },
    
    deletePost: (postId) => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const index = posts.findIndex(p => p.id === parseInt(postId));
          if (index !== -1) {
            posts = posts.filter(p => p.id !== parseInt(postId));
            resolve({ data: { success: true } });
          } else {
            reject({ message: '게시글을 찾을 수 없습니다.' });
          }
        }, 500);
      });
    }
  };
  
  export const mockCommentAPI = {
    getCommentsByPostId: (postId) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          const post = posts.find(p => p.id === parseInt(postId));
          if (post) {
            resolve({ data: post.comments });
          } else {
            resolve({ data: [] });
          }
        }, 500);
      });
    },
    
    createComment: (postId, commentData) => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const postIndex = posts.findIndex(p => p.id === parseInt(postId));
          if (postIndex !== -1) {
            const newComment = {
              ...commentData,
              id: Date.now(),
              postId: parseInt(postId),
              date: new Date().toLocaleDateString('ko-KR', {
                year: '2-digit',
                month: '2-digit',
                day: '2-digit'
              }).replace(/\. /g, '.').replace(/\.$/, '')
            };
            posts[postIndex].comments.push(newComment);
            resolve({ data: newComment });
          } else {
            reject({ message: '게시글을 찾을 수 없습니다.' });
          }
        }, 500);
      });
    },
    
    updateComment: (commentId, commentData) => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          let found = false;
          for (let i = 0; i < posts.length; i++) {
            const commentIndex = posts[i].comments.findIndex(c => c.id === parseInt(commentId));
            if (commentIndex !== -1) {
              posts[i].comments[commentIndex] = { 
                ...posts[i].comments[commentIndex], 
                ...commentData 
              };
              resolve({ data: posts[i].comments[commentIndex] });
              found = true;
              break;
            }
          }
          if (!found) {
            reject({ message: '댓글을 찾을 수 없습니다.' });
          }
        }, 500);
      });
    },
    
    deleteComment: (commentId) => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          let found = false;
          for (let i = 0; i < posts.length; i++) {
            const commentIndex = posts[i].comments.findIndex(c => c.id === parseInt(commentId));
            if (commentIndex !== -1) {
              posts[i].comments = posts[i].comments.filter(c => c.id !== parseInt(commentId));
              resolve({ data: { success: true } });
              found = true;
              break;
            }
          }
          if (!found) {
            reject({ message: '댓글을 찾을 수 없습니다.' });
          }
        }, 500);
      });
    }
  };
  