import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const PostForm = ({ editPost, onSubmit, repostId }) => {
  const [title, setTitle] = useState(editPost ? editPost.title : '');
  const [content, setContent] = useState(editPost ? editPost.content : '');
  const [image, setImage] = useState(editPost ? editPost.image : '');
  const [video, setVideo] = useState(editPost ? editPost.video : '');
  const [flag, setFlag] = useState(editPost ? editPost.flag : 'Question');
  const [secretKey, setSecretKey] = useState(editPost ? '' : ''); // Secret key for new posts or editing
  const navigate = useNavigate();
  const { id } = useParams();

  // Determine the repost ID from props or URL params
  const effectiveRepostId = repostId || id;

  const getUserId = () => {
    let userId = localStorage.getItem('userId');
    if (!userId) {
      userId = Math.random().toString(36).substr(2, 9);
      localStorage.setItem('userId', userId);
    }
    return userId;
  };

  const userId = getUserId();

  const getYouTubeEmbedUrl = (url) => {
    if (!url) return null;
    const videoIdMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    if (videoIdMatch && videoIdMatch[1]) {
      return `https://www.youtube.com/embed/${videoIdMatch[1]}`;
    }
    return null;
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title) return alert('Title is required!');
    
    const embedVideoUrl = getYouTubeEmbedUrl(video);
    if (video && !embedVideoUrl) {
      alert('Invalid YouTube URL. Please use a valid YouTube video link.');
      return;
    }

    // For editing, verify the secret key
    if (editPost) {
      if (secretKey !== editPost.secretKey) {
        alert('Incorrect secret key! You cannot edit this post.');
        return;
      }
    } else {
      // For new posts, require a secret key
      if (!secretKey) {
        alert('Please provide a secret key for this post.');
        return;
      }
    }

    // Ensure repostId is set correctly for reposts
    if (effectiveRepostId && !editPost) {
      if (!effectiveRepostId) {
        alert('Repost ID is missing. Cannot create repost.');
        return;
      }
      console.log("Creating repost with repostId:", effectiveRepostId);
    }

    const postId = editPost ? editPost.id : Date.now().toString();
    const newPost = {
      id: postId,
      title,
      content,
      image,
      video: embedVideoUrl || video,
      flag,
      upvotes: editPost ? editPost.upvotes : 0,
      createdAt: editPost ? editPost.createdAt : new Date().toISOString(),
      comments: editPost ? editPost.comments : [],
      userId,
      secretKey: editPost ? editPost.secretKey : secretKey,
      repostId: effectiveRepostId && !editPost ? effectiveRepostId : null // Set repostId only for new reposts
    };
    
    console.log("New post data:", newPost);
    await onSubmit(newPost);
    navigate(editPost ? '/' : `/post/${postId}`, { replace: false }); // Ensure navigation doesn't cause a full refresh
  };

  return (
    <div className="post-form">
      <h2>{editPost ? 'Edit Post' : effectiveRepostId ? 'Repost' : 'Create New Post'}</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          placeholder="Content (Optional)"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <input
          type="text"
          placeholder="YouTube URL (e.g., https://www.youtube.com/watch?v=video_id)"
          value={video}
          onChange={(e) => setVideo(e.target.value)}
        />
        <input
          type="text"
          placeholder="Image URL (Optional)"
          value={image.startsWith('data:') ? '' : image}
          onChange={(e) => setImage(e.target.value)}
        />
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
        />
        <select value={flag} onChange={(e) => setFlag(e.target.value)}>
          <option value="Question">Question</option>
          <option value="Opinion">Opinion</option>
        </select>
        <input
          type="password"
          placeholder={editPost ? "Enter secret key to edit" : "Set a secret key for this post"}
          value={secretKey}
          onChange={(e) => setSecretKey(e.target.value)}
          required
        />
        <button type="submit">{editPost ? 'Update Post' : 'Create Post'}</button>
      </form>
    </div>
  );
};

export default PostForm;