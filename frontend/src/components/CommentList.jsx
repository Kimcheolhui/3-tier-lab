import React from 'react';
import CommentItem from './CommentItem';

function CommentList({ comments, post, updateComment }) {
  return (
    <div style={{ marginTop: '1rem' }}>
      <h3>댓글</h3>
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          postId={post.id}
          updateComment={updateComment}
        />
      ))}
    </div>
  );
}

export default CommentList