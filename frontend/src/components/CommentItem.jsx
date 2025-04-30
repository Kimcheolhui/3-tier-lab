import React, { useState } from 'react';

function CommentItem({ comment, postId, updateComment }) {
  const [isEditing, setIsEditing] = useState(false);
  const [password, setPassword] = useState('');
  const [content, setContent] = useState(comment.content);

  const handleEdit = (e) => {
    e.preventDefault();
    if (password !== comment.password) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }
    updateComment(postId, comment.id, { content });
    setIsEditing(false);
    setPassword('');
  };

  return (
    <div style={{ border: '1px solid #ddd', padding: '0.5rem', margin: '0.5rem 0' }}>
      <p><strong>{comment.author}</strong> <small>{new Date(comment.date).toLocaleString('ko-KR')}</small></p>
      {!isEditing ? (
        <>
          <p>{comment.content}</p>
          <button onClick={() => setIsEditing(true)}>수정</button>
        </>
      ) : (
        <form onSubmit={handleEdit} style={{ marginTop: '0.5rem' }}>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            style={{ width: '100%', minHeight: '4rem' }}
          />
          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ display: 'block', margin: '0.5rem 0' }}
          />
          <button type="submit">수정</button>
        </form>
      )}
    </div>
  );
}

export default CommentItem