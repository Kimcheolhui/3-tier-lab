import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CommentList from './CommentList';

function PostDetail({ posts, addComment, updateComment }) {
  const { id } = useParams();
  const post = posts.find(p => p.id === parseInt(id, 10));
  const navigate = useNavigate();

  const [commentAuthor, setCommentAuthor] = useState('');
  const [commentPassword, setCommentPassword] = useState('');
  const [commentContent, setCommentContent] = useState('');

  const handleComment = e => {
    e.preventDefault();
    const newComment = {
      id: Date.now(),
      author: commentAuthor,
      password: commentPassword,
      content: commentContent,
      date: new Date().toISOString()
    };
    addComment(post.id, newComment);
    setCommentAuthor('');
    setCommentPassword('');
    setCommentContent('');
  };

  if (!post) return <div>게시글이 존재하지 않습니다.</div>;

  return (
    <div style={{ padding: '1rem' }}>
      <h2>{post.title}</h2>
      <p>작성자: {post.author}</p>
      <p>작성일: {new Date(post.date).toLocaleString('ko-KR')}</p>
      <p>{post.content}</p>
      <button onClick={() => navigate(`/edit/${post.id}`)}>수정</button>

      {/* 댓글 작성 폼을 게시글과 댓글 목록 사이에 추가 */}
      <form onSubmit={handleComment} style={{ margin: '1rem 0' }}>
        <h3>댓글 작성</h3>
        <div>
          <input
            placeholder="닉네임"
            value={commentAuthor}
            onChange={e => setCommentAuthor(e.target.value)}
            required
          />
        </div>
        <div>
          <input
            type="password"
            placeholder="비밀번호"
            value={commentPassword}
            onChange={e => setCommentPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <textarea
            placeholder="댓글 내용"
            value={commentContent}
            onChange={e => setCommentContent(e.target.value)}
            required
          />
        </div>
        <button type="submit">댓글 작성</button>
      </form>

      <CommentList comments={post.comments} post={post} updateComment={updateComment} />
    </div>
  );
}

export default PostDetail