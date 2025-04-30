import React, { useState } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import PostList from './components/PostList';
import CreatePost from './components/CreatePost';
import PostDetail from './components/PostDetail';
import EditPost from './components/EditPost';

function App() {
  const [posts, setPosts] = useState([]);

  // 게시글 추가
  const addPost = (post) => setPosts(prev => [...prev, post]);
  // 게시글 수정
  const updatePost = (id, updated) => setPosts(prev => 
    prev.map(p => p.id === id ? { ...p, ...updated } : p)
  );
  // 댓글 추가
  const addComment = (postId, comment) => setPosts(prev => 
    prev.map(p => p.id === postId ? { ...p, comments: [...p.comments, comment] } : p)
  );
  // 댓글 수정
  const updateComment = (postId, commentId, updated) => setPosts(prev => 
    prev.map(p => p.id === postId ? {
      ...p,
      comments: p.comments.map(c => c.id === commentId ? { ...c, ...updated } : c)
    } : p)
  );

  return (
    <div>
      <nav style={{ padding: '1rem', borderBottom: '1px solid #ddd' }}>
        <Link to="/">게시판 목록</Link>
      </nav>
      <Routes>
        <Route path="/" element={<PostList posts={posts} />} />
        <Route path="/create" element={<CreatePost addPost={addPost} />} />
        <Route
          path="/post/:id"
          element={
            <PostDetail
              posts={posts}
              addComment={addComment}
              updateComment={updateComment}
            />
          }
        />
        <Route
          path="/edit/:id"
          element={<EditPost posts={posts} updatePost={updatePost} />}
        />
      </Routes>
    </div>
  );
}

export default App
