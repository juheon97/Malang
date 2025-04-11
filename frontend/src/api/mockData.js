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
        date: '25.03.17',
      },
    ],
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
    comments: [],
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
    comments: [],
  },
];

const userLikes = new Map();

// 목 API 서비스
export const mockPostAPI = {
  getAllPosts: (page = 1, size = 10, category = null, sort = 'latest') => {
    // 카테고리 필터링
    let filteredPosts = category
      ? posts.filter(post => post.category === category)
      : posts;

    // 정렬
    if (sort === 'latest') {
      // 최신순 정렬 (날짜 기준)
      filteredPosts = [...filteredPosts].sort((a, b) => {
        return (
          new Date(b.date.split('.').reverse().join('-')) -
          new Date(a.date.split('.').reverse().join('-'))
        );
      });
    } else if (sort === 'popular') {
      // 인기순 정렬 (좋아요 기준)
      filteredPosts = [...filteredPosts].sort((a, b) => b.likes - a.likes);
    }

    // 페이지네이션
    const startIndex = (page - 1) * size;
    const endIndex = startIndex + size;
    const paginatedPosts = filteredPosts.slice(startIndex, endIndex);

    // API 명세서 형식에 맞게 응답 구성
    return Promise.resolve({
      data: {
        status: 'success',
        data: {
          total_count: filteredPosts.length,
          current_page: page,
          total_pages: Math.ceil(filteredPosts.length / size),
          article: paginatedPosts.map(post => ({
            article_id: post.id,
            category: post.category,
            title: post.title,
            created_at: post.date,
            likes: post.likes,
          })),
        },
      },
    });
  },

  getPostsByCategory: (category, page = 1, size = 10, sort = 'latest') => {
    // getAllPosts 함수를 재사용하여 카테고리별 게시글 조회
    return mockPostAPI.getAllPosts(page, size, category, sort);
  },

  // 다른 메서드들은 그대로 유지...
  // 게시글 상세 조회 (API 명세서에 맞게 수정)
  getPostById: articleId => {
    const post = posts.find(p => p.id === parseInt(articleId));

    if (post) {
      // 현재 사용자 ID (실제로는 인증 시스템에서 가져와야 함)
      const currentUserId = 1;

      // 사용자의 좋아요 상태 확인
      const userLikeKey = `user_${currentUserId}_post_${post.id}`;
      const isLiked = userLikes.get(userLikeKey) || false;

      // API 명세서 형식에 맞게 응답 구성
      return Promise.resolve({
        data: {
          status: 'success',
          data: {
            article: {
              article_id: post.id,
              category: post.category,
              title: post.title,
              content: post.content,
              created_at: post.date,
              like_count: post.likes,
              is_liked: isLiked,
            },
            comments: post.comments.map(comment => ({
              comment_id: comment.id,
              content: comment.content,
              user_nickname: comment.authorName,
              created_at: new Date(comment.date).toISOString(),
            })),
          },
        },
      });
    }

    // 게시글을 찾을 수 없는 경우 에러 응답
    return Promise.reject({
      response: {
        data: {
          errorCode: 'S0004',
          message: '요청하신 리소스를 찾을 수 없습니다.',
          timestamp: new Date().toISOString(),
        },
      },
    });
  },

  // 게시글 작성 (API 명세서에 맞게 수정)
  createPost: postData => {
    // 현재 날짜 생성
    const now = new Date();
    const formattedDate = now
      .toLocaleDateString('ko-KR', {
        year: '2-digit',
        month: '2-digit',
        day: '2-digit',
      })
      .replace(/\. /g, '.')
      .replace(/\.$/, '');

    // 새 게시글 생성
    const newPost = {
      id: posts.length + 1,
      title: postData.title,
      content: postData.content,
      category: postData.category,
      date: formattedDate,
      authorId: postData.authorId,
      authorName: postData.authorName || '익명의 리뷰어',
      likes: 0,
      comments: [],
    };

    // 게시글 목록에 추가
    posts = [newPost, ...posts];

    // API 명세서 형식에 맞게 응답 구성
    return Promise.resolve({
      data: {
        status: 'success',
        data: {
          article_id: newPost.id,
          created_at: now.toISOString(),
        },
      },
    });
  },

  // 게시글 수정 (API 명세서에 맞게 수정)
  updatePost: (articleId, postData) => {
    const index = posts.findIndex(p => p.id === parseInt(articleId));

    if (index !== -1) {
      // 현재 사용자 ID (실제로는 인증 시스템에서 가져와야 함)
      const currentUserId = postData.authorId || 1;

      // 작성자 ID와 현재 사용자 ID가 다르면 권한 오류 반환
      if (posts[index].authorId !== currentUserId) {
        return Promise.reject({
          response: {
            data: {
              errorCode: 'S0003',
              message: '접근이 거부되었습니다.',
              timestamp: new Date().toISOString(),
              details: {
                reason: '본인이 작성한 글만 수정할 수 있습니다.',
              },
            },
          },
        });
      }

      // 이미지 처리 (실제로는 S3 등과 연동)
      const processImages = images => {
        if (!images) return [];

        let processedImages = [];
        images.forEach(img => {
          if (img.action === 'keep' || img.action === 'add') {
            processedImages.push(img.file_key);
          }
        });

        return processedImages;
      };

      // 게시글 업데이트
      posts[index] = {
        ...posts[index],
        title: postData.title,
        content: postData.content,
        category: postData.category,
        fileUrls: processImages(postData.images),
      };

      // API 명세서 형식에 맞게 응답 구성
      return Promise.resolve({
        data: {
          status: 'success',
          data: {
            article_id: posts[index].id,
            updated_at: new Date().toISOString(),
          },
        },
      });
    }

    // 게시글을 찾을 수 없는 경우 에러 응답
    return Promise.reject({
      response: {
        data: {
          errorCode: 'S0004',
          message: '요청하신 리소스를 찾을 수 없습니다.',
          timestamp: new Date().toISOString(),
        },
      },
    });
  },

  // 게시글 삭제 (API 명세서에 맞게 수정)
  deletePost: articleId => {
    const index = posts.findIndex(p => p.id === parseInt(articleId));

    if (index !== -1) {
      // 현재 사용자 ID (실제로는 인증 시스템에서 가져와야 함)
      const currentUserId = 1;

      // 작성자 ID와 현재 사용자 ID가 다르면 권한 오류 반환
      if (posts[index].authorId !== currentUserId) {
        return Promise.reject({
          response: {
            data: {
              errorCode: 'S0003',
              message: '접근이 거부되었습니다.',
              timestamp: new Date().toISOString(),
              details: {
                reason: '본인이 작성한 글만 삭제할 수 있습니다.',
              },
            },
          },
        });
      }

      const deletedPostId = posts[index].id;

      // 게시글 삭제
      posts = posts.filter(p => p.id !== parseInt(articleId));

      // API 명세서 형식에 맞게 응답 구성
      return Promise.resolve({
        data: {
          status: 'success',
          message: '게시글이 성공적으로 삭제되었습니다.',
          data: {
            article_id: deletedPostId,
          },
        },
      });
    }

    // 게시글을 찾을 수 없는 경우 에러 응답
    return Promise.reject({
      response: {
        data: {
          errorCode: 'S0004',
          message: '요청하신 리소스를 찾을 수 없습니다.',
          timestamp: new Date().toISOString(),
        },
      },
    });
  },

  updateLikes: (postId, likes) => {
    const index = posts.findIndex(p => p.id === parseInt(postId));
    if (index !== -1) {
      posts[index].likes = likes;
      return Promise.resolve({ data: posts[index] });
    }
    return Promise.reject({ message: '게시글을 찾을 수 없습니다.' });
  },

  createPostWithFile: formData => {
    // FormData에서 필요한 데이터 추출
    const title = formData.get('title');
    const content = formData.get('content');
    const category = formData.get('category');
    const date = formData.get('date');
    const authorId = parseInt(formData.get('authorId'));
    const authorName = formData.get('authorName');
    const likes = parseInt(formData.get('likes') || '0');
    const file = formData.get('file');

    // 파일 정보가 있으면 파일 URL 생성 (실제로는 파일을 저장하지 않음)
    let fileUrls = null;
    if (file instanceof File) {
      // 실제 환경에서는 파일을 서버에 저장하고 URL을 반환하지만,
      // 목 환경에서는 임시 URL 생성
      fileUrls = URL.createObjectURL(file);
    }

    // 새 게시글 생성
    const newPost = {
      id: posts.length + 1,
      title,
      content,
      category,
      date,
      authorId,
      authorName,
      likes,
      fileUrls, // 파일 URL 추가
      comments: [],
    };

    // 게시글 목록에 추가
    posts = [newPost, ...posts];

    return Promise.resolve({ data: newPost });
  },
};

export const mockCommentAPI = {
  getCommentsByPostId: postId => {
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
      const maxId = post.comments.length
        ? Math.max(...post.comments.map(c => c.id)) + 1
        : 1;
      const newComment = {
        ...commentData,
        id: maxId, // 기존 ID 중 최대값 + 1
        postId: parseInt(postId),
      };
      post.comments.push(newComment);
      return Promise.resolve({ data: newComment });
    }
    return Promise.reject({ message: '게시글을 찾을 수 없습니다.' });
  },

  updateComment: (commentId, commentData) => {
    for (const post of posts) {
      const commentIndex = post.comments.findIndex(
        c => c.id === parseInt(commentId),
      );
      if (commentIndex !== -1) {
        post.comments[commentIndex] = {
          ...post.comments[commentIndex],
          ...commentData,
        };
        return Promise.resolve({ data: post.comments[commentIndex] });
      }
    }
    return Promise.reject({ message: '댓글을 찾을 수 없습니다.' });
  },

  deleteComment: commentId => {
    for (const post of posts) {
      const commentIndex = post.comments.findIndex(
        c => c.id === parseInt(commentId),
      );
      if (commentIndex !== -1) {
        post.comments = post.comments.filter(c => c.id !== parseInt(commentId));
        return Promise.resolve({ data: { success: true } });
      }
    }
    return Promise.reject({ message: '댓글을 찾을 수 없습니다.' });
  },
};
