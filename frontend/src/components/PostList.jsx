import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchBar from './SearchBar';
import PostItem from './PostItem';

function PostList({ posts }) {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const filtered = posts.filter(p => p.title.includes(searchTerm));

  return (
    <div style={{ padding: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        <button onClick={() => navigate('/create')}>게시글 작성</button>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #ddd', padding: '0.5rem' }}>번호</th>
            <th style={{ border: '1px solid #ddd', padding: '0.5rem' }}>제목</th>
            <th style={{ border: '1px solid #ddd', padding: '0.5rem' }}>작성자</th>
            <th style={{ border: '1px solid #ddd', padding: '0.5rem' }}>작성일</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(post => (
            <PostItem key={post.id} post={post} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default PostList