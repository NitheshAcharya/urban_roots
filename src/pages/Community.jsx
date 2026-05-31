import { useState, useEffect } from 'react';
import { ThumbsUp, ThumbsDown, MessageSquare, Share2, MoreVertical, Send, X, AlertCircle } from 'lucide-react';
import { supabase } from '../utils/supabase';
import { useAuth } from '../context/AuthContext';
import './Community.css';

const mockPosts = [
  {
    id: 1,
    author: 'Priya Sharma',
    avatar: '👩🏽‍🌾',
    city: 'Bengaluru',
    time: '2 hours ago',
    type: 'tip',
    content: 'Pro tip for Bengaluru monsoons: Elevate your wicking reservoirs and pots with bricks to prevent waterlogging. My hydroponic lettuce and basil columns survived last year\'s heavy rains because of this drainage lift! 🌧️🪴',
    likes: 42,
    dislikes: 0,
    comments: [
      { id: 1, author: 'Rohan M', avatar: '🧑🏽', text: 'Great tip! I lost my basil to root rot last year 😢', time: '1h ago', likes: 5 },
      { id: 2, author: 'Lakshmi N', avatar: '👩🏽', text: 'I use gravel drainage too, works wonders on wicking beds!', time: '45m ago', likes: 2 }
    ],
    isLiked: false,
    isDisliked: false,
    tags: ['MonsoonCare', 'WickingBeds', 'Tip']
  },
  {
    id: 2,
    author: 'Karthik Reddy',
    avatar: '👨🏽‍🔬',
    city: 'Mysuru',
    time: '5 hours ago',
    type: 'question',
    content: 'Can anyone help identify this disease on my vertical tower tomatoes? Stems are starting to develop dark brown rings, and lower leaves are yellowing. I am running EC 2.0 and pH 6.2. Is this early blight? 🍅',
    likes: 18,
    dislikes: 1,
    comments: [
      { id: 1, author: 'Dr. Ananya', avatar: '👩🏽‍🔬', text: 'Yes, that looks like early blight. Prune lower leaves immediately and flush the nutrient water reservoir.', time: '4h ago', likes: 9 },
    ],
    isLiked: false,
    isDisliked: false,
    tags: ['HydroBlight', 'HelpNeeded', 'Question']
  },
  {
    id: 3,
    author: 'Meera Joshi',
    avatar: '👩🏽',
    city: 'Hubballi',
    time: 'Yesterday',
    type: 'showcase',
    content: 'Incredible success with my vertical strawberry tower! Stacking 28 crowns in less than 1 square meter on my balcony. Running simple drip loops. Water consumption is down by 90% compared to my backyard rows. 🌱🍓✨',
    likes: 127,
    dislikes: 0,
    comments: [
      { id: 1, author: 'Vikram J', avatar: '🧑🏽', text: 'Stunning tower! Did you build the wicking setup yourself?', time: '20h ago', likes: 14 },
      { id: 2, author: 'Meera Joshi', avatar: '👩🏽', text: 'Yes, simple PVC pipes with wicking sponges. Highly recommend!', time: '18h ago', likes: 8 }
    ],
    isLiked: true,
    isDisliked: false,
    tags: ['VerticalStrawberries', 'SpaceSaving', 'Showcase']
  }
];

const postTypes = ['All Posts', 'Tips', 'Questions', 'Showcases'];

const Community = () => {
  const { user, profile, isAuthenticated } = useAuth();
  const [posts, setPosts] = useState([]);
  const [userLikesMap, setUserLikesMap] = useState({});
  const [activeFilter, setActiveFilter] = useState('All Posts');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostType, setNewPostType] = useState('tip');
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [expandedComments, setExpandedComments] = useState({});
  const [newComment, setNewComment] = useState({});

  const formatTimeAgo = (dateStr) => {
    const date = new Date(dateStr);
    const seconds = Math.floor((new Date() - date) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('community_posts')
        .select('*, community_comments(*)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      
      const formatted = (data || []).map(p => {
        const postComments = (p.community_comments || []).map(c => ({
          id: c.id,
          author: c.author_name,
          avatar: c.author_avatar || '🌱',
          text: c.content,
          time: formatTimeAgo(c.created_at),
          likes: 0
        })).sort((a, b) => new Date(a.time) - new Date(b.time));

        return {
          id: p.id,
          author: p.author_name,
          avatar: p.author_avatar || '🌱',
          city: p.author_city || 'Bengaluru',
          time: formatTimeAgo(p.created_at),
          type: p.post_type,
          content: p.content,
          likes: p.likes || 0,
          dislikes: p.dislikes || 0,
          comments: postComments,
          tags: p.tags || [],
          userId: p.user_id,
          isLiked: userLikesMap[p.id] === 'like',
          isDisliked: userLikesMap[p.id] === 'dislike'
        };
      });
      
      setPosts(formatted);
    } catch (err) {
      console.error('Error fetching posts:', err.message);
    }
  };

  const fetchUserLikes = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('post_likes')
        .select('post_id, is_dislike')
        .eq('user_id', user.id);
      if (error) throw error;
      
      const likesMap = (data || []).reduce((acc, curr) => {
        acc[curr.post_id] = curr.is_dislike ? 'dislike' : 'like';
        return acc;
      }, {});
      
      setUserLikesMap(likesMap);
    } catch (err) {
      console.warn('Could not load user likes:', err.message);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [userLikesMap]);

  useEffect(() => {
    if (user) {
      fetchUserLikes();
    } else {
      setUserLikesMap({});
    }
  }, [user]);

  useEffect(() => {
    const postsChannel = supabase
      .channel('community-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'community_posts' }, () => {
        fetchPosts();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'community_comments' }, () => {
        fetchPosts();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'post_likes' }, () => {
        fetchPosts();
        fetchUserLikes();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(postsChannel);
    };
  }, [user]);

  const filteredPosts = posts.filter(post => {
    if (activeFilter === 'All Posts') return true;
    if (activeFilter === 'Tips') return post.type === 'tip';
    if (activeFilter === 'Questions') return post.type === 'question';
    if (activeFilter === 'Showcases') return post.type === 'showcase';
    return true;
  });

  const handleLike = async (postId) => {
    if (!isAuthenticated) return;
    const currentStatus = userLikesMap[postId];
    try {
      if (currentStatus === 'like') {
        await supabase.from('post_likes').delete().eq('user_id', user.id).eq('post_id', postId);
      } else {
        await supabase.from('post_likes').upsert({
          user_id: user.id,
          post_id: postId,
          is_dislike: false
        }, { onConflict: 'user_id,post_id' });
      }

      const { data: post } = await supabase.from('community_posts').select('likes, dislikes').eq('id', postId).single();
      if (post) {
        let nextLikes = post.likes;
        let nextDislikes = post.dislikes;
        if (currentStatus === 'like') {
          nextLikes = Math.max(0, nextLikes - 1);
        } else {
          nextLikes += 1;
          if (currentStatus === 'dislike') {
            nextDislikes = Math.max(0, nextDislikes - 1);
          }
        }
        await supabase.from('community_posts').update({ likes: nextLikes, dislikes: nextDislikes }).eq('id', postId);
      }
      fetchUserLikes();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDislike = async (postId) => {
    if (!isAuthenticated) return;
    const currentStatus = userLikesMap[postId];
    try {
      if (currentStatus === 'dislike') {
        await supabase.from('post_likes').delete().eq('user_id', user.id).eq('post_id', postId);
      } else {
        await supabase.from('post_likes').upsert({
          user_id: user.id,
          post_id: postId,
          is_dislike: true
        }, { onConflict: 'user_id,post_id' });
      }

      const { data: post } = await supabase.from('community_posts').select('likes, dislikes').eq('id', postId).single();
      if (post) {
        let nextLikes = post.likes;
        let nextDislikes = post.dislikes;
        if (currentStatus === 'dislike') {
          nextDislikes = Math.max(0, nextDislikes - 1);
        } else {
          nextDislikes += 1;
          if (currentStatus === 'like') {
            nextLikes = Math.max(0, nextLikes - 1);
          }
        }
        await supabase.from('community_posts').update({ likes: nextLikes, dislikes: nextDislikes }).eq('id', postId);
      }
      fetchUserLikes();
    } catch (err) {
      console.error(err);
    }
  };

  const handleNewPost = async (e) => {
    e.preventDefault();
    if (!newPostContent.trim() || !user) return;

    try {
      const { error } = await supabase
        .from('community_posts')
        .insert([{
          user_id: user.id,
          author_name: profile?.full_name || 'Anonymous Gardener',
          author_city: profile?.city || 'Bengaluru',
          author_avatar: profile?.avatar_url || '🌱',
          post_type: newPostType,
          content: newPostContent,
          tags: [newPostType === 'question' ? 'Question' : newPostType === 'showcase' ? 'Showcase' : 'Tip', 'UrbanGrow']
        }]);

      if (error) throw error;
      setNewPostContent('');
      setIsComposerOpen(false);
      fetchPosts();
    } catch (err) {
      console.error('Error creating post:', err.message);
    }
  };

  const toggleComments = (postId) => {
    setExpandedComments(prev => ({ ...prev, [postId]: !prev[postId] }));
  };

  const handleAddComment = async (postId) => {
    const text = newComment[postId];
    if (!text?.trim() || !user) return;

    try {
      const { error } = await supabase
        .from('community_comments')
        .insert([{
          post_id: postId,
          user_id: user.id,
          author_name: profile?.full_name || 'Gardener',
          author_avatar: profile?.avatar_url || '🌱',
          content: text
        }]);

      if (error) throw error;
      setNewComment(prev => ({ ...prev, [postId]: '' }));
      fetchPosts();
    } catch (err) {
      console.error('Error adding comment:', err.message);
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'tip': return '💡 Tip';
      case 'question': return '❓ Question';
      case 'showcase': return '📸 Showcase';
      default: return type;
    }
  };

  return (
    <div className="community-youtube page-transition">
      <section className="community-hero-yt">
        <h1 className="community-title-yt">UrbanRoots Community</h1>
        <p className="community-subtitle-yt">Join the local conversations about wicking systems, vertical layouts, and urban organic growing.</p>
      </section>

      {/* Post Composer - YouTube Style */}
      <section className="composer-yt-container">
        {!isComposerOpen ? (
          <div className="composer-yt-collapsed glass-card" onClick={() => setIsComposerOpen(true)}>
            <div className="composer-avatar-yt">🌱</div>
            <div className="composer-placeholder-yt">Share an update, ask a question, or post a photo of your tower...</div>
          </div>
        ) : (
          <form className="glass-card composer-yt-card page-transition" onSubmit={handleNewPost}>
            <div className="composer-header-yt">
              <span className="composer-avatar-yt">🌱</span>
              <div className="composer-meta-yt">
                <strong>{profile?.full_name || 'Gardener'}</strong>
                <span>Posting to Community Feed</span>
              </div>
            </div>
            
            <textarea
              className="composer-textarea-yt"
              placeholder={
                newPostType === 'question'
                  ? 'Ask the community for help with wicking, nutrients, or systems...'
                  : newPostType === 'showcase'
                  ? 'Show off your harvest yields or vertical setup...'
                  : 'Share a wicking bed tip or water-saving hack...'
              }
              rows="4"
              value={newPostContent}
              onChange={e => setNewPostContent(e.target.value)}
              autoFocus
            />

            <div className="composer-footer-yt">
              <div className="post-type-selector-yt">
                {['tip', 'question', 'showcase'].map(type => (
                  <button
                    key={type}
                    type="button"
                    className={`type-pill-yt ${newPostType === type ? 'active' : ''}`}
                    onClick={() => setNewPostType(type)}
                  >
                    {getTypeLabel(type)}
                  </button>
                ))}
              </div>

              <div className="composer-actions-yt">
                <button type="button" className="composer-cancel-yt" onClick={() => setIsComposerOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="composer-submit-yt btn-primary" disabled={!newPostContent.trim()}>
                  Post
                </button>
              </div>
            </div>
          </form>
        )}
      </section>

      {/* Category Pills Filter */}
      <section className="community-filter-row-yt hide-scrollbar">
        {postTypes.map(type => (
          <button
            key={type}
            className={`filter-pill-yt ${activeFilter === type ? 'active' : ''}`}
            onClick={() => setActiveFilter(type)}
          >
            {type}
          </button>
        ))}
      </section>

      {/* Feed Stream */}
      <section className="community-feed-yt">
        {filteredPosts.length > 0 ? (
          filteredPosts.map(post => (
            <article key={post.id} className="glass-card post-card-yt">
              
              {/* Card Header */}
              <div className="post-header-yt">
                <div className="post-avatar-yt">{post.avatar}</div>
                <div className="post-meta-block-yt">
                  <h4 className="post-author-yt">{post.author}</h4>
                  <span className="post-meta-sub-yt">{post.city} · {post.time}</span>
                </div>
                
                <button className="post-options-btn-yt">
                  <MoreVertical size={16} />
                </button>
              </div>

              {/* Card Content */}
              <div className="post-content-yt">
                <p>{post.content}</p>
                
                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                  <div className="post-tags-yt">
                    {post.tags.map(tag => (
                      <span key={tag} className="tag-link-yt">#{tag}</span>
                    ))}
                  </div>
                )}
              </div>

              {/* YouTube Style Action Toolbar */}
              <div className="post-toolbar-yt">
                <div className="toolbar-likes-block">
                  <button 
                    className={`toolbar-btn-yt like-btn ${post.isLiked ? 'active' : ''}`} 
                    onClick={() => handleLike(post.id)}
                    title="Like post"
                  >
                    <ThumbsUp size={16} fill={post.isLiked ? 'var(--color-primary)' : 'none'} />
                    <span>{post.likes}</span>
                  </button>
                  
                  <div className="toolbar-divider-yt"></div>
                  
                  <button 
                    className={`toolbar-btn-yt dislike-btn ${post.isDisliked ? 'active' : ''}`} 
                    onClick={() => handleDislike(post.id)}
                    title="Dislike post"
                  >
                    <ThumbsDown size={16} fill={post.isDisliked ? 'var(--color-accent-red)' : 'none'} />
                  </button>
                </div>

                <button className="toolbar-btn-yt comment-btn" onClick={() => toggleComments(post.id)}>
                  <MessageSquare size={16} />
                  <span>{post.comments.length}</span>
                </button>

                <button className="toolbar-btn-yt share-btn" title="Share Post">
                  <Share2 size={16} />
                </button>
              </div>

              {/* YT Comments Drawer */}
              {expandedComments[post.id] && (
                <div className="comments-drawer-yt page-transition">
                  <div className="comments-header-yt">
                    <span>Comments ({post.comments.length})</span>
                  </div>

                  {/* Add comment row */}
                  <div className="comment-composer-yt">
                    <span className="user-avatar-mini-yt">🌱</span>
                    <div className="comment-composer-input-block">
                      <input
                        type="text"
                        placeholder="Add a public comment..."
                        value={newComment[post.id] || ''}
                        onChange={e => setNewComment(prev => ({ ...prev, [post.id]: e.target.value }))}
                        onKeyDown={e => { if (e.key === 'Enter') handleAddComment(post.id); }}
                      />
                      {newComment[post.id]?.trim() && (
                        <div className="comment-composer-actions-yt">
                          <button className="comment-cancel" onClick={() => setNewComment(prev => ({ ...prev, [post.id]: '' }))}>Cancel</button>
                          <button className="comment-submit" onClick={() => handleAddComment(post.id)}>Comment</button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* List of comments */}
                  {post.comments.length > 0 ? (
                    <div className="comments-list-yt">
                      {post.comments.map(comment => (
                        <div key={comment.id} className="comment-item-yt">
                          <span className="comment-avatar-yt">{comment.avatar}</span>
                          <div className="comment-body-yt">
                            <div className="comment-author-row-yt">
                              <strong>{comment.author}</strong>
                              <span className="comment-time-yt">{comment.time}</span>
                            </div>
                            <p>{comment.text}</p>
                            
                            {/* Comment like/dislike */}
                            <div className="comment-actions-yt">
                              <button className="comment-action-btn-yt">
                                <ThumbsUp size={12} />
                                {comment.likes > 0 && <span>{comment.likes}</span>}
                              </button>
                              <button className="comment-action-btn-yt">
                                <ThumbsDown size={12} />
                              </button>
                              <button className="comment-action-btn-yt reply">Reply</button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="no-comments-yt">No comments yet. Share your thoughts!</p>
                  )}
                </div>
              )}

            </article>
          ))
        ) : (
          <p className="no-posts-yt">No community updates at the moment.</p>
        )}
      </section>
    </div>
  );
};

export default Community;
