import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';

const PostDetail = ({ posts, onUpdate, onDelete }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const post = posts.find(p => p.id === id); // Rely on props.posts directly
  const [comment, setComment] = useState('');
  const [secretKey, setSecretKey] = useState(''); // For deleting the post
  const [orientedImage, setOrientedImage] = useState(post ? post.image : '');
  const [referencedPost, setReferencedPost] = useState(null);

  const getUserId = () => {
    let userId = localStorage.getItem('userId');
    if (!userId) {
      userId = Math.random().toString(36).substr(2, 9);
      localStorage.setItem('userId', userId);
    }
    return userId;
  };
  
  const userId = getUserId();

  // Update orientedImage when post changes
  useEffect(() => {
    if (post && post.image && post.image.startsWith('data:')) {
      const img = new Image();
      img.src = post.image;
      img.onload = () => {
        window.EXIF.getData(img, function() {
          const orientation = window.EXIF.getTag(this, 'Orientation');
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          let width = img.width;
          let height = img.height;

          if (orientation > 4) {
            canvas.width = height;
            canvas.height = width;
          } else {
            canvas.width = width;
            canvas.height = height;
          }

          switch (orientation) {
            case 2:
              ctx.transform(-1, 0, 0, 1, width, 0);
              break;
            case 3:
              ctx.transform(-1, 0, 0, -1, width, height);
              break;
            case 4:
              ctx.transform(1, 0, 0, -1, 0, height);
              break;
            case 5:
              ctx.transform(0, 1, 1, 0, 0, 0);
              break;
            case 6:
              ctx.transform(0, 1, -1, 0, height, 0);
              break;
            case 7:
              ctx.transform(0, -1, -1, 0, height, width);
              break;
            case 8:
              ctx.transform(0, -1, 1, 0, 0, width);
              break;
            default:
              break;
          }

          if (orientation > 4) {
            ctx.drawImage(img, 0, 0, height, width);
          } else {
            ctx.drawImage(img, 0, 0, width, height);
          }
          setOrientedImage(canvas.toDataURL('image/jpeg'));
        });
      };
    } else {
      setOrientedImage(post ? post.image : '');
    }
  }, [post]);

  // Fetch the post and referenced post if necessary
  useEffect(() => {
    if (!post) {
      // Fetch post directly from Supabase if not found in props.posts
      const fetchPost = async () => {
        const { data, error } = await supabase
          .from('posts')
          .select('*')
          .eq('id', id)
          .single();
        if (error) {
          console.error("Error fetching post:", error);
        } else if (data) {
          // Add the fetched post to the parent state using onUpdate
          onUpdate(data);
        }
      };
      fetchPost();
    }

    // Fetch the referenced post if repostId exists
    if (post && post.repostId) {
      console.log("Fetching referenced post for repostId:", post.repostId);
      const foundReferencedPost = posts.find(p => p.id === post.repostId);
      if (foundReferencedPost) {
        console.log("Referenced post found in posts:", foundReferencedPost);
        setReferencedPost(foundReferencedPost);
      } else {
        // Fetch from Supabase if not found in props.posts
        const fetchReferencedPost = async () => {
          const { data, error } = await supabase
            .from('posts')
            .select('*')
            .eq('id', post.repostId)
            .single();
          if (error) {
            console.error("Error fetching referenced post:", error);
            setReferencedPost(null); // Ensure referencedPost is null if fetch fails
          } else if (data) {
            console.log("Referenced post fetched from Supabase:", data);
            setReferencedPost(data);
            // Add the referenced post to the parent state using onUpdate
            onUpdate(data);
          }
        };
        fetchReferencedPost();
      }
    } else {
      setReferencedPost(null); // Reset if there's no repostId
    }
  }, [post, posts, id, onUpdate]);

  if (!post) {
    return <div>Post not found</div>;
  }

  const handleUpvote = async () => {
    const updatedPost = { ...post, upvotes: post.upvotes + 1 };
    await onUpdate(updatedPost); // Update in Supabase (optimistic update handled in App.js)
  };

  const handleDelete = () => {
    if (post.userId !== userId) {
      alert('You can only delete your own posts!');
      return;
    }
    if (secretKey !== post.secretKey) {
      alert('Incorrect secret key! You cannot delete this post.');
      return;
    }
    onDelete(post.id);
    navigate('/', { replace: false }); // Ensure client-side navigation
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!comment) return;
    const updatedPost = { ...post, comments: [...post.comments, { text: comment, userId }] };
    await onUpdate(updatedPost); // Update in Supabase (optimistic update handled in App.js)
    setComment('');
  };

  const handleDeleteComment = async (index) => {
    const commentToDelete = post.comments[index];
    if (commentToDelete.userId !== userId) {
      alert('You can only delete your own comments!');
      return;
    }
    const updatedComments = post.comments.filter((_, i) => i !== index);
    const updatedPost = { ...post, comments: updatedComments };
    await onUpdate(updatedPost); // Update in Supabase (optimistic update handled in App.js)
  };

  const handleRepost = () => {
    navigate(`/create/repost/${post.id}`, { replace: false });
  };

  const creationTimestamp = new Date(post.createdAt).toLocaleString();
  const timeDiff = (new Date() - new Date(post.createdAt)) / (1000 * 60 * 60);
  const timeAgo = timeDiff < 24 ? `${Math.floor(timeDiff)} hours ago` : `${Math.floor(timeDiff / 24)} days ago`;

  return (
    <div className="post-detail">
      <h2>{post.title}</h2>
      <p>Posted on {creationTimestamp} ({timeAgo}) by User-{post.userId.slice(0, 4)}</p>
      {post.flag && <span className="flag">{post.flag}</span>}
      {post.content && <p>{post.content}</p>}
      {orientedImage && (
        <div className="media-container">
          <img src={orientedImage} alt="Post" />
        </div>
      )}
      {post.video && (
        <div className="media-container">
          <iframe
            src={post.video}
            title="Video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      )}
      {post.repostId && referencedPost && (
        <div className="referenced-post">
          <p>Repost of: <Link to={`/post/${referencedPost.id}`}>{referencedPost.title}</Link></p>
        </div>
      )}
      {post.repostId && !referencedPost && (
        <div className="referenced-post">
          <p>Repost of: <Link to={`/post/${post.repostId}`}>Original Post (ID: {post.repostId})</Link> (may not exist)</p>
        </div>
      )}
      <p>{post.upvotes} upvotes</p>
      <button onClick={handleUpvote}>Upvote</button>
      <button onClick={handleRepost}>Repost</button>
      {post.userId === userId && (
        <>
          <Link to={`/edit/${post.id}`}><button>Edit</button></Link>
          <input
            type="password"
            placeholder="Enter secret key to delete"
            value={secretKey}
            onChange={(e) => setSecretKey(e.target.value)}
          />
          <button onClick={handleDelete}>Delete</button>
        </>
      )}
      <h3>Comments</h3>
      {post.comments.map((c, index) => (
        <div key={index} className="comment">
          <p>{c.text} by User-{c.userId.slice(0, 4)}</p>
          {c.userId === userId && (
            <button onClick={() => handleDeleteComment(index)}>Delete Comment</button>
          )}
        </div>
      ))}
      <form onSubmit={handleCommentSubmit}>
        <input
          type="text"
          placeholder="Leave a comment..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <button type="submit">Add Comment</button>
      </form>
    </div>
  );
};

export default PostDetail;