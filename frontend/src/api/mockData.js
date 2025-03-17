// src/api/mockData.js
// 목 데이터
let posts = [
  {
    id: 1,
    title: '시각장애 관련 질문입니다',
    content: '시각장애인을 위한 기능은 어떻게 사용하나요?',
    category: '시각장애',
    date: '25.03.17',
    authorId: 1,
    authorName: '익명의 리뷰어',
    likes: 5,
    comments: [
      {
        id: 1,
        postId: 1,
        content: '도움이 필요하시면 연락주세요!',
        authorId: 2,
        authorName: '다른 사용자',
        date: '25.03.17'
      }
    ]
  },
  {
    id: 2,
    title: '구음장애 앱 사용법',
    content: '구음장애 앱은 어떻게 사용하나요?',
    category: '구음장애',
    date: '25.03.16',
    authorId: 2,
    authorName: '다른 사용자',
    likes: 12,
    comments: []
  },
  {
    id: 3,
    title: '청각장애인을 위한 기능은 어떻게 사용하나요?',
    content: '청각장애인을 위한 기능에 대해 알고 싶습니다.',
    category: '청각장애',
    date: '25.03.15',
    authorId: 3,
    authorName: '사용자3',
    likes: 8,
    comments: []
  }
];

// 목 API 서비스
export const mockPostAPI = {
  getAllPosts: (page = 1) => {
    const postsPerPage = 10;
    const startIndex = (page - 1) * postsPerPage;
    const endIndex = startIndex + postsPerPage;
    const paginatedPosts = posts.slice(startIndex, endIndex);
    
    return Promise.resolve({
      data: {
        posts: paginatedPosts,
        totalPages: Math.ceil(posts.length / postsPerPage),
        currentPage: page
      }
    });
  },
  
  getPostById: (postId) => {
    const post = posts.find(p => p.id === parseInt(postId));
    if (post) {
      return Promise.resolve({ data: post });
    }
    return Promise.reject({ message: '게시글을 찾을 수 없습니다.' });
  },
  
  createPost: (postData) => {
    const newPost = {
      ...postData,
      id: posts.length + 1,
      comments: []
    };
    posts = [newPost, ...posts];
    return Promise.resolve({ data: newPost });
  },
  
  updatePost: (postId, postData) => {
    const index = posts.findIndex(p => p.id === parseInt(postId));
    if (index !== -1) {
      posts[index] = { ...posts[index], ...postData };
      return Promise.resolve({ data: posts[index] });
    }
    return Promise.reject({ message: '게시글을 찾을 수 없습니다.' });
  },
  
  deletePost: (postId) => {
    const index = posts.findIndex(p => p.id === parseInt(postId));
    if (index !== -1) {
      posts = posts.filter(p => p.id !== parseInt(postId));
      return Promise.resolve({ data: { success: true } });
    }
    return Promise.reject({ message: '게시글을 찾을 수 없습니다.' });
  },
  
  updateLikes: (postId, likes) => {
    const index = posts.findIndex(p => p.id === parseInt(postId));
    if (index !== -1) {
      posts[index].likes = likes;
      return Promise.resolve({ data: posts[index] });
    }
    return Promise.reject({ message: '게시글을 찾을 수 없습니다.' });
  }
};

export const mockCommentAPI = {
  getCommentsByPostId: (postId) => {
    const post = posts.find(p => p.id === parseInt(postId));
    if (post) {
      return Promise.resolve({ data: post.comments });
    }
    return Promise.resolve({ data: [] });
  },
  
  createComment: (postId, commentData) => {
    const post = posts.find(p => p.id === parseInt(postId));
    if (post) {
      // 고유한 ID 생성 보장
      const maxId = post.comments.length ? Math.max(...post.comments.map(c => c.id)) + 1 : 1;
      const newComment = {
        ...commentData,
        id: maxId, // 기존 ID 중 최대값 + 1
        postId: parseInt(postId)
      };
      post.comments.push(newComment);
      return Promise.resolve({ data: newComment });
    }
    return Promise.reject({ message: '게시글을 찾을 수 없습니다.' });
  },
  
  updateComment: (commentId, commentData) => {
    for (const post of posts) {
      const commentIndex = post.comments.findIndex(c => c.id === parseInt(commentId));
      if (commentIndex !== -1) {
        post.comments[commentIndex] = { ...post.comments[commentIndex], ...commentData };
        return Promise.resolve({ data: post.comments[commentIndex] });
      }
    }
    return Promise.reject({ message: '댓글을 찾을 수 없습니다.' });
  },
  
  deleteComment: (commentId) => {
    for (const post of posts) {
      const commentIndex = post.comments.findIndex(c => c.id === parseInt(commentId));
      if (commentIndex !== -1) {
        post.comments = post.comments.filter(c => c.id !== parseInt(commentId));
        return Promise.resolve({ data: { success: true } });
      }
    }
    return Promise.reject({ message: '댓글을 찾을 수 없습니다.' });
  }
};
