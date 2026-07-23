import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockDb, type ArtisanPost } from '../services/mockDb';
import { useAppStore } from '../store';
import { Heart, MessageText, Send2, SearchNormal1, CloseCircle } from 'iconsax-react';

// ── Time helper ───────────────────────────────────────────────────
const timeAgo = (iso: string) => {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

// ── Comments Sheet ────────────────────────────────────────────────
const CommentsSheet: React.FC<{
  post: ArtisanPost;
  onClose: () => void;
  onAddComment: (body: string) => void;
}> = ({ post, onClose, onAddComment }) => {
  const [text, setText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 150);
  }, []);

  const submit = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onAddComment(trimmed);
    setText('');
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-[28px] shadow-2xl flex flex-col"
        style={{ maxHeight: '75vh' }}>
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-9 h-1 bg-zinc-200 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-100">
          <span className="font-bold text-sm text-zinc-900">
            {post.comments.length} Comment{post.comments.length !== 1 ? 's' : ''}
          </span>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-700 transition-colors cursor-pointer">
            <CloseCircle size={20} color="currentColor" variant="Broken" />
          </button>
        </div>

        {/* Comments list */}
        <div className="flex-1 overflow-y-auto px-5 py-3 flex flex-col gap-4">
          {post.comments.length === 0 && (
            <p className="text-xs text-zinc-400 text-center py-6">No comments yet. Be the first!</p>
          )}
          {post.comments.map(c => (
            <div key={c.id} className="flex gap-3">
              <img src={c.userAvatar} className="h-8 w-8 rounded-full object-cover shrink-0" alt={c.userName} />
              <div className="flex-1 min-w-0">
                <div className="bg-zinc-50 rounded-2xl rounded-tl-none px-3 py-2">
                  <span className="text-[11px] font-bold text-zinc-800 block">{c.userName}</span>
                  <p className="text-[12px] text-zinc-600 leading-relaxed">{c.body}</p>
                </div>
                <span className="text-[10px] text-zinc-400 mt-1 ml-3 block">{timeAgo(c.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="px-4 py-3 border-t border-zinc-100 flex items-center gap-3 pb-safe">
          <input
            ref={inputRef}
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && submit()}
            placeholder="Add a comment…"
            className="flex-1 text-sm bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-2.5 focus:outline-none focus:border-brand-400 placeholder:text-zinc-300"
          />
          <button
            onClick={submit}
            disabled={!text.trim()}
            className="h-10 w-10 flex items-center justify-center bg-brand-500 text-white rounded-full shrink-0 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-90 cursor-pointer"
          >
            <Send2 size={16} color="currentColor" variant="Bold" />
          </button>
        </div>
      </div>
    </>
  );
};

// ── Post Card ─────────────────────────────────────────────────────
const PostCard: React.FC<{
  post: ArtisanPost;
  onLike: () => void;
  onComment: () => void;
  onArtisanClick: () => void;
}> = ({ post, onLike, onComment, onArtisanClick }) => {
  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <div className="glass border-none rounded-[24px] overflow-hidden">
      {/* Author row */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-3">
        <button onClick={onArtisanClick} className="cursor-pointer active:scale-90 transition-all shrink-0">
          <img
            src={post.artisanAvatar}
            className="h-10 w-10 rounded-full object-cover ring-2 ring-white shadow-sm"
            alt={post.artisanName}
          />
        </button>
        <div className="flex-1 min-w-0" onClick={onArtisanClick}>
          <button className="text-left cursor-pointer w-full">
            <span className="text-[13px] font-extrabold text-zinc-900 block truncate">{post.artisanName}</span>
            <span className="text-[10px] text-brand-600 font-bold">{post.artisanOccupation}</span>
          </button>
        </div>
        <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-1 bg-brand-50 text-brand-600 rounded-full border border-brand-100 shrink-0">
          {post.category}
        </span>
      </div>

      {/* Image */}
      {post.imageUrl && (
        <div className="bg-zinc-100 relative" style={{ aspectRatio: '4/3' }}>
          {!imgLoaded && (
            <div className="absolute inset-0 bg-zinc-100 animate-pulse" />
          )}
          <img
            src={post.imageUrl}
            alt={post.category}
            className={`w-full h-full object-cover transition-opacity duration-300 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
            loading="lazy"
            onLoad={() => setImgLoaded(true)}
          />
        </div>
      )}

      {/* Caption */}
      <div className="px-4 pt-3 pb-2">
        <p className="text-[12px] text-zinc-700 leading-relaxed">{post.caption}</p>
        <span className="text-[10px] text-zinc-400 mt-1 block">{timeAgo(post.createdAt)}</span>
      </div>

      {/* Actions row */}
      <div className="flex items-center gap-4 px-4 pb-4 pt-1 border-t border-zinc-100 mt-1">
        <button
          onClick={onLike}
          className="flex items-center gap-1.5 cursor-pointer transition-all active:scale-90 group"
        >
          <Heart
            size={18}
            color={post.likedByMe ? '#ef4444' : 'currentColor'}
            variant={post.likedByMe ? 'Bold' : 'Broken'}
            className={post.likedByMe ? 'text-red-500' : 'text-zinc-400 group-hover:text-red-400 transition-colors'}
          />
          <span className={`text-[11px] font-semibold ${post.likedByMe ? 'text-red-500' : 'text-zinc-500'}`}>
            {post.likesCount}
          </span>
        </button>

        <button
          onClick={onComment}
          className="flex items-center gap-1.5 cursor-pointer transition-all active:scale-90 group"
        >
          <MessageText size={18} color="currentColor" variant="Broken" className="text-zinc-400 group-hover:text-brand-400 transition-colors" />
          <span className="text-[11px] font-semibold text-zinc-500">{post.comments.length}</span>
        </button>

        <button
          onClick={onArtisanClick}
          className="ml-auto text-[10px] font-extrabold text-brand-600 uppercase tracking-wider cursor-pointer hover:text-brand-700 transition-colors"
        >
          Book →
        </button>
      </div>
    </div>
  );
};

// ── Main Discover Component ───────────────────────────────────────
export const Discover: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAppStore();

  const [posts, setPosts] = useState<ArtisanPost[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [commentPost, setCommentPost] = useState<ArtisanPost | null>(null);

  useEffect(() => {
    // Clear stale seed so new schema takes effect
    const stored = localStorage.getItem('hp_artisan_posts');
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as ArtisanPost[];
        // If posts are missing new fields, purge and re-seed
        if (parsed.length > 0 && parsed[0].artisanName === undefined) {
          localStorage.removeItem('hp_artisan_posts');
        }
      } catch { localStorage.removeItem('hp_artisan_posts'); }
    }
    setPosts(mockDb.getAllPosts());
  }, []);

  const filteredPosts = posts.filter(p => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.artisanName.toLowerCase().includes(q) ||
      p.artisanOccupation.toLowerCase().includes(q) ||
      p.caption.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    );
  });

  const handleLike = (postId: string) => {
    setPosts(mockDb.likePost(postId));
  };

  const handleAddComment = (postId: string, body: string) => {
    if (!user) return;
    const updated = mockDb.addComment(postId, user.id, user.fullName, user.avatarUrl || 'https://i.pravatar.cc/150?img=3', body);
    setPosts(updated);
    // Refresh the open comment sheet post
    setCommentPost(updated.find(p => p.id === postId) || null);
  };

  // Unique artisans for stories row
  const storyArtisans = Array.from(
    new Map(posts.map(p => [p.artisanId, { id: p.artisanId, name: p.artisanName, avatar: p.artisanAvatar, occupation: p.artisanOccupation }])).values()
  );

  return (
    <div className="flex-1 flex flex-col bg-zinc-955 animate-in fade-in pb-24">

      {/* Header */}
      <div className="px-4 pt-6 pb-4 sticky top-0 z-30 bg-zinc-955/95 backdrop-blur-md">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-extrabold text-zinc-900">Discover</h1>
        </div>
        {/* Search bar */}
        <div className="flex items-center gap-2.5 px-3.5 h-10 bg-zinc-100/80 rounded-2xl focus-within:bg-white focus-within:ring-1 focus-within:ring-brand-300 transition-all">
          <SearchNormal1 size={15} color="currentColor" variant="Broken" className="text-zinc-400 shrink-0" />
          <input
            type="text"
            placeholder="Search artisans, skills, posts…"
            className="flex-1 bg-transparent text-[12px] text-zinc-700 placeholder:text-zinc-400 focus:outline-none"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-zinc-400 hover:text-zinc-600 transition-colors cursor-pointer">
              <CloseCircle size={14} color="currentColor" variant="Broken" />
            </button>
          )}
        </div>
      </div>

      {/* Stories row */}
      {!searchQuery && (
        <div className="px-4 mb-5">
          <div className="flex gap-4 overflow-x-auto no-scrollbar py-1">
            {storyArtisans.map(a => (
              <button
                key={a.id}
                onClick={() => navigate(`/artisan/${a.id}`)}
                className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer active:scale-90 transition-all"
              >
                <div className="p-0.5 rounded-full bg-gradient-to-tr from-brand-500 to-brand-300 shadow-sm">
                  <img
                    src={a.avatar}
                    className="h-12 w-12 rounded-full object-cover ring-2 ring-white"
                    alt={a.name}
                  />
                </div>
                <span className="text-[9px] font-bold text-zinc-600 w-14 text-center truncate leading-tight">
                  {a.name.split(' ')[0]}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Feed */}
      <div className="flex flex-col gap-4 px-4">
        {filteredPosts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-sm font-semibold text-zinc-400">No posts found</p>
            <p className="text-xs text-zinc-300 mt-1">Try a different search</p>
          </div>
        )}
        {filteredPosts.map(post => (
          <PostCard
            key={post.id}
            post={post}
            onLike={() => handleLike(post.id)}
            onComment={() => setCommentPost(post)}
            onArtisanClick={() => navigate(`/artisan/${post.artisanId}`)}
          />
        ))}
      </div>

      {/* Comments sheet */}
      {commentPost && (
        <CommentsSheet
          post={commentPost}
          onClose={() => setCommentPost(null)}
          onAddComment={body => handleAddComment(commentPost.id, body)}
        />
      )}
    </div>
  );
};

export default Discover;
