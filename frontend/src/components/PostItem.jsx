import React from 'react';
import { Link } from 'react-router-dom';

function PostItem({ post }) {
  return (
    <tr>
      <td style={{ border: '1px solid #ddd', padding: '0.5rem' }}>{post.id}</td>
      <td style={{ border: '1px solid #ddd', padding: '0.5rem' }}>
        <Link to={`/post/${post.id}`}>{post.title}</Link>
      </td>
      <td style={{ border: '1px solid #ddd', padding: '0.5rem' }}>{post.author}</td>
      <td style={{ border: '1px solid #ddd', padding: '0.5rem' }}>
        {new Date(post.date).toLocaleString('ko-KR')}
      </td>
    </tr>
  );
}

export default PostItem