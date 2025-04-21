import React from 'react';
import { Link } from 'react-router-dom';

const PostItem = ({ post, showDetails }) => {
  const creationTimestamp = new Date(post.createdAt).toLocaleString();
  const timeDiff = (new Date() - new Date(post.createdAt)) / (1000 * 60 * 60);
  const timeAgo = timeDiff < 24 ? `${Math.floor(timeDiff)} hours ago` : `${Math.floor(timeDiff / 24)} days ago`;

  return (
    <div className="post-item">
      <h3><Link to={`/post/${post.id}`}>{post.title}</Link></h3>
      <p>Posted on {creationTimestamp} ({timeAgo}) by User-{post.userId.slice(0, 4)}</p>
      {post.flag && <span className="flag">{post.flag}</span>}
      {post.repostId && (
        <p>Repost of: <Link to={`/post/${post.repostId}`}>Original Post (ID: {post.repostId})</Link></p>
      )}
      <p>{post.upvotes} upvotes | {post.comments.length} comments</p>
      {showDetails && (
        <>
          {post.content && <p>{post.content}</p>}
          {post.image && <img src={post.image} alt="Post" />}
          {post.video && (
            <iframe
              src={post.video}
              title="Video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          )}
        </>
      )}
    </div>
  );
};

export default PostItem;