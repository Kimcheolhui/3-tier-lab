import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function CreatePost({ addPost }) {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [password, setPassword] = useState('');
  const [content, setContent] = useState('');
  const navigate = useNavigate();

  const handleSubmit = e => {
    e.preventDefault();
    const newPost = {
      id: Date.now(),
      title,
      author,
      password,
      content,
      date: new Date().toISOString(),
      comments: []
    };
    addPost(newPost);
    navigate('/');
  };

  return (
    <form onSubmit={handleSubmit} style={{ padding: '1rem' }}>
      <div>
        <input
          placeholder="제목"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
        />
      </div>
      <div>
        <input
          placeholder="닉네임"
          value={author}
          onChange={e => setAuthor(e.target.value)}
          required
        />
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
      <div>
        <textarea
          placeholder="본문"
          value={content}
          onChange={e => setContent(e.target.value)}
          required
        />
      </div>
      <button type="submit">작성</button>
    </form>
  );
}

export default CreatePost