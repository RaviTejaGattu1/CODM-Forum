import React, { useState, useEffect } from 'react';
import { Routes, Route, useParams } from 'react-router-dom';
import { supabase } from './supabase';
import Header from './components/Header';
import PostList from './components/PostList';
import PostForm from './components/PostForm';
import PostDetail from './components/PostDetail';

// Wrapper component to extract repostId from params
const RepostForm = ({ onSubmit }) => {
  const { id } = useParams();
  return <PostForm onSubmit={onSubmit} repostId={id} />;
};

const initialPosts = [
  {
    id: '1',
    title: "Best Loadout for Ranked Matches?",
    content: "I've been using the AK-47 with Red Dot Sight. What do you guys recommend?",
    image: "https://via.placeholder.com/400x200?text=CODM+Loadout",
    video: "",
    flag: "Question",
    upvotes: 10,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    comments: [
      { text: "Try the M13 with a suppressor!", userId: "user1" },
      { text: "AK-47 is solid, but check out the Kilo Bolt-Action.", userId: "user2" }
    ],
    userId: "user1",
    secretKey: "password123",
    repostId: null
  },
  {
    id: '2',
    title: "New Battle Pass Worth It?",
    content: "The new skins look awesome, but is it worth the price?",
    image: "https://via.placeholder.com/400x200?text=CODM+Battle+Pass",
    video: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    flag: "Opinion",
    upvotes: 5,
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    comments: [],
    userId: "user2",
    secretKey: "password456",
    repostId: null
  }
];

const App = () => {
  const [posts, setPosts] = useState([]);
  const [sortBy, setSortBy] = useState('newest');
  const [searchTerm, setSearchTerm] = useState('');
  const [flagFilter, setFlagFilter] = useState('');
  const [theme, setTheme] = useState('dark');
  const [showDetails, setShowDetails] = useState(false);
  const [loading, setLoading] = useState(true);

  // Function to fetch all posts from Supabase
  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from('posts')
      .select('*');
    if (error) {
      console.error("Error fetching posts:", error);
    } else {
      console.log("Fetched posts:", data);
      setPosts(data || []);
    }
  };

  // Fetch posts from Supabase and set up real-time subscription
  useEffect(() => {
    const initializePosts = async () => {
      // Fetch existing posts
      const { data: existingPosts, error } = await supabase
        .from('posts')
        .select('*');

      if (error) {
        console.error("Error fetching posts:", error);
        setLoading(false);
        return;
      }

      if (!existingPosts || existingPosts.length === 0) {
        // If no posts exist, seed the database with initialPosts
        for (const post of initialPosts) {
          await supabase.from('posts').insert(post);
        }
        // Fetch again after seeding
        await fetchPosts();
      } else {
        setPosts(existingPosts);
      }

      setLoading(false);

      // Set up real-time subscription
      const subscription = supabase
        .channel('public:posts')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, async (payload) => {
          console.log("Change detected:", payload);
          // Fetch posts to sync with Supabase (no delay needed since we use optimistic updates)
          await fetchPosts();
        })
        .subscribe((status) => {
          console.log("Subscription status:", status);
        });

      // Clean up subscription on unmount
      return () => {
        supabase.removeChannel(subscription);
      };
    };

    initializePosts();
  }, []);

  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  const handleCreateOrUpdatePost = async (post) => {
    try {
      const existingPost = posts.find(p => p.id === post.id);
      if (existingPost) {
        // Optimistically update the local state
        setPosts(posts.map(p => (p.id === post.id ? post : p)));
        // Update in Supabase
        const { error } = await supabase
          .from('posts')
          .update(post)
          .eq('id', post.id);
        if (error) {
          console.error("Error updating post:", error);
          // Rollback optimistic update on error
          await fetchPosts();
        }
      } else {
        // Optimistically add the new post to the local state
        setPosts([post, ...posts]);
        // Create new post in Supabase
        const { error } = await supabase
          .from('posts')
          .insert(post);
        if (error) {
          console.error("Error creating post:", error);
          // Rollback optimistic update on error
          await fetchPosts();
        }
      }
    } catch (error) {
      console.error("Error creating/updating post:", error);
      await fetchPosts(); // Ensure state is in sync on error
    }
  };

  const handleDeletePost = async (id) => {
    try {
      // Optimistically remove the post from local state
      setPosts(posts.filter(p => p.id !== id));
      // Delete from Supabase
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', id);
      if (error) {
        console.error("Error deleting post:", error);
        // Rollback optimistic update on error
        await fetchPosts();
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      await fetchPosts(); // Ensure state is in sync on error
    }
  };

  const sortedPosts = [...posts]
    .filter(post => post.title.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter(post => flagFilter ? post.flag === flagFilter : true)
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
      return b.upvotes - a.upvotes;
    });

  return (
    <div>
      {loading && (
        <div className="loading">
          <div className="loading-spinner"></div>
        </div>
      )}
      <Header onSearch={setSearchTerm} onThemeChange={setTheme} theme={theme} />
      <div className="sort-buttons">
        <button
          className={sortBy === 'newest' ? 'active' : ''}
          onClick={() => setSortBy('newest')}
        >
          Newest
        </button>
        <button
          className={sortBy === 'popular' ? 'active' : ''}
          onClick={() => setSortBy('popular')}
        >
          Most Popular
        </button>
        <select onChange={(e) => setFlagFilter(e.target.value)} value={flagFilter}>
          <option value="">All Flags</option>
          <option value="Question">Question</option>
          <option value="Opinion">Opinion</option>
        </select>
        <button onClick={() => setShowDetails(!showDetails)}>
          {showDetails ? 'Hide Details' : 'Show Details'}
        </button>
      </div>
      <Routes>
        <Route path="/" element={<PostList posts={sortedPosts} showDetails={showDetails} />} />
        <Route
          path="/create"
          element={<PostForm onSubmit={handleCreateOrUpdatePost} />}
        />
        <Route
          path="/create/repost/:id"
          element={<RepostForm onSubmit={handleCreateOrUpdatePost} />}
        />
        <Route
          path="/edit/:id"
          element={<PostForm editPost={posts.find(p => p.id === window.location.pathname.split('/')[2])} onSubmit={handleCreateOrUpdatePost} />}
        />
        <Route
          path="/post/:id"
          element={<PostDetail posts={posts} onUpdate={handleCreateOrUpdatePost} onDelete={handleDeletePost} />}
        />
      </Routes>
    </div>
  );
};

export default App;