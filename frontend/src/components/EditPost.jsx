import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function EditPost({ posts, updatePost }) {
  const { id } = useParams();
  const post = posts.find(p => p.id === parseInt(id, 10));
  const [title, setTitle] = useState(post?.title || '');
  const [content, setContent] = useState(post?.content || '');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleUpdate = e => {
    e.preventDefault();
    if (password !== post.password) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }
    updatePost(post.id, { title, content });
    navigate(`/post/${post.id}`);
  };

  if (!post) return <div>게시글이 존재하지 않습니다.</div>;

  return (
    <form onSubmit={handleUpdate} style={{ padding: '1rem' }}>
      <div>
        <input value={title} onChange={e => setTitle(e.target.value)} required />
      </div>
      <div>
        <textarea value={content} onChange={e => setContent(e.target.value)} required />
      </div>
      <div>
        <input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
      </div>
      <button type="submit">수정</button>
    </form>
  );
}

export default EditPost