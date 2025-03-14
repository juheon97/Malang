// src/components/community/CommunityList.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const CommunityList = ({ posts }) => {
  const navigate = useNavigate();

  const handlePostClick = (postId) => {
    navigate(`/community/${postId}`);
  };

  return (
    <table className="community-table">
      <thead>
        <tr>
          <th>카테고리</th>
          <th>제목</th>
          <th>작성일</th>
          <th>좋아요</th>
        </tr>
      </thead>
      <tbody>
        {posts.map((post) => (
          <tr key={post.id} onClick={() => handlePostClick(post.id)}>
            <td>{post.category}</td>
            <td className="title-cell">{post.title}</td>
            <td>{post.date}</td>
            <td>
              <span className="like-container">
                ❤️ {post.likes}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default CommunityList;
