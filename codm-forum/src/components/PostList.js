import React from 'react';
import PostItem from './PostItem';

const PostList = ({ posts, showDetails }) => {
  return (
    <div className="post-list">
      {posts.length === 0 ? (
        <div>Loading posts...</div> // Show loading message instead of "no posts found"
      ) : (
        posts.map(post => (
          <PostItem key={post.id} post={post} showDetails={showDetails} />
        ))
      )}
    </div>
  );
};

export default PostList;