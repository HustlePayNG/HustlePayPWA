import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ArtisanPost } from '../types';
import { supabase } from '../services/supabase';
import { useAppStore } from '../store';
import { 
  Heart, MessageText, Send2, SearchNormal1, CloseCircle, 
  Verify, Bookmark, Star, ArrowRight
} from 'iconsax-react';

// ── Time helper ───────────────────────────────────────────────────
const timeAgo = (iso: string) => {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

// ── Comments Sheet (Dark Glass Style) ─────────────────────────────
const CommentsSheet: React.FC<{
  post: ArtisanPost;
  onClose: () => void;
  onAddComment: (body: string) => void;
}> = ({ post, onClose, onAddComment }) => {
  const [text, setText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Hide the bottom nav while sheet is open
    document.body.setAttribute('data-sheet-open', 'true');
    setTimeout(() => inputRef.current?.focus(), 150);
    return () => {
      document.body.removeAttribute('data-sheet-open');
    };
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
        className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm animate-in fade-in"
        onClick={onClose}
      />
      {/* Sheet */}
      <div 
        className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-zinc-100 rounded-t-[32px] shadow-2xl flex flex-col animate-in slide-in-from-bottom duration-300"
        style={{ maxHeight: '78vh' }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-zinc-200 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-100">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-sm text-zinc-900">Comments</span>
            <span className="text-[10px] bg-zinc-100 px-2 py-0.5 rounded-full text-zinc-500 font-bold">
              {post.comments.length}
            </span>
          </div>
          <button 
            onClick={onClose} 
            className="text-zinc-400 hover:text-zinc-700 transition-colors cursor-pointer p-1"
          >
            <CloseCircle size={20} color="currentColor" variant="Broken" />
          </button>
        </div>

        {/* Comments list */}
        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">
          {post.comments.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <MessageText size={32} color="currentColor" variant="Broken" className="text-zinc-300 mb-2" />
              <p className="text-xs text-zinc-500 font-medium">No comments yet.</p>
              <p className="text-[10px] text-zinc-400 mt-0.5">Start the conversation with {post.artisanName}!</p>
            </div>
          )}
          {post.comments.map(c => (
            <div key={c.id} className="flex gap-3 text-left">
              <img src={c.userAvatar} className="h-8 w-8 rounded-full object-cover shrink-0 ring-1 ring-zinc-100" alt={c.userName} />
              <div className="flex-1 min-w-0">
                <div className="bg-zinc-50 border border-zinc-100 rounded-2xl rounded-tl-none p-3">
                  <span className="text-[11px] font-extrabold text-zinc-800 block">{c.userName}</span>
                  <p className="text-xs text-zinc-600 leading-relaxed font-normal mt-0.5">{c.body}</p>
                </div>
                <span className="text-[9px] text-zinc-400 mt-1 ml-2 block font-medium">{timeAgo(c.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="px-4 py-3 border-t border-zinc-100 flex items-center gap-3 bg-white pb-6">
          <input
            ref={inputRef}
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && submit()}
            placeholder="Add a comment…"
            className="flex-1 text-xs bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3 focus:outline-none focus:border-brand-400 text-zinc-800 placeholder:text-zinc-400"
          />
          <button
            onClick={submit}
            disabled={!text.trim()}
            className="h-10 w-10 flex items-center justify-center bg-brand-500 hover:bg-brand-600 text-white rounded-2xl shrink-0 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95 cursor-pointer shadow-lg shadow-brand-500/20"
          >
            <Send2 size={16} color="currentColor" variant="Bold" />
          </button>
        </div>
      </div>
    </>
  );
};

// ── Social Post Card Component ─────────────────────────────────────
const PostCard: React.FC<{
  post: ArtisanPost;
  onLike: () => void;
  onComment: () => void;
  onArtisanClick: () => void;
}> = ({ post, onLike, onComment, onArtisanClick }) => {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showHeartAnim, setShowHeartAnim] = useState(false);

  // Double tap to like feature
  const handleDoubleTap = () => {
    if (!post.likedByMe) {
      onLike();
    }
    setShowHeartAnim(true);
    setTimeout(() => setShowHeartAnim(false), 900);
  };

  return (
    <div className="glass border border-zinc-855 rounded-[28px] overflow-hidden text-left mb-4 shadow-xl transition-all hover:border-zinc-750">
      
      {/* Author Header Row */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-850/60 bg-zinc-900/30">
        <div className="flex items-center gap-3 min-w-0 cursor-pointer" onClick={onArtisanClick}>
          <div className="relative shrink-0">
            <div className="p-0.5 rounded-full bg-gradient-to-tr from-brand-500 to-brand-300 shadow-md">
              <img
                src={post.artisanAvatar}
                className="h-10 w-10 rounded-full object-cover border border-zinc-950"
                alt={post.artisanName}
              />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-zinc-950 flex items-center justify-center text-[7px] text-white font-bold">✓</span>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1">
              <span className="text-xs font-extrabold text-white truncate">{post.artisanName}</span>
              <Verify size={12} color="#38bdf8" variant="Bold" className="shrink-0" />
            </div>
            <span className="text-[10px] text-brand-300 font-bold block truncate">{post.artisanOccupation}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[9px] font-extrabold uppercase tracking-wider px-2.5 py-1 bg-brand-500/10 text-brand-300 border border-brand-500/20 rounded-full">
            #{post.category}
          </span>
        </div>
      </div>

      {/* Media Box with Double-Tap Like */}
      {post.imageUrl && (
        <div 
          className="bg-zinc-900 relative overflow-hidden cursor-pointer select-none" 
          style={{ aspectRatio: '4/3' }}
          onDoubleClick={handleDoubleTap}
        >
          {!imgLoaded && (
            <div className="absolute inset-0 bg-zinc-900 animate-pulse flex items-center justify-center text-zinc-700 text-xs font-medium">
              Loading Showcase Media...
            </div>
          )}
          <img
            src={post.imageUrl}
            alt={post.category}
            className={`w-full h-full object-cover transition-opacity duration-300 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
            loading="lazy"
            onLoad={() => setImgLoaded(true)}
          />

          {/* Double-tap Heart Popup Animation */}
          {showHeartAnim && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none animate-in zoom-in-50 duration-200">
              <Heart size={64} color="#ef4444" variant="Bold" className="drop-shadow-2xl animate-pulse" />
            </div>
          )}
        </div>
      )}

      {/* Caption & Post Content */}
      <div className="px-4 pt-3.5 pb-2 text-left">
        <p className="text-xs text-zinc-200 leading-relaxed font-light">{post.caption}</p>
        <div className="flex items-center justify-between mt-2">
          <span className="text-[9px] text-zinc-500 font-semibold uppercase tracking-wider">{timeAgo(post.createdAt)}</span>
          <span className="text-[9px] text-emerald-400 font-bold flex items-center gap-1">
            <Star size={10} color="currentColor" variant="Broken" /> Verified Work Ticket
          </span>
        </div>
      </div>

      {/* Social Actions & Direct Booking Call-To-Action */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-850/60 bg-zinc-900/20">
        <div className="flex items-center gap-4">
          {/* Like */}
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
            <span className={`text-xs font-bold ${post.likedByMe ? 'text-red-400' : 'text-zinc-400'}`}>
              {post.likesCount}
            </span>
          </button>

          {/* Comments */}
          <button
            onClick={onComment}
            className="flex items-center gap-1.5 cursor-pointer transition-all active:scale-90 group"
          >
            <MessageText size={18} color="currentColor" variant="Broken" className="text-zinc-400 group-hover:text-brand-400 transition-colors" />
            <span className="text-xs font-bold text-zinc-400">{post.comments.length}</span>
          </button>

          {/* Bookmark */}
          <button
            onClick={() => setSaved(!saved)}
            className="cursor-pointer transition-all active:scale-90"
          >
            <Bookmark 
              size={18} 
              color={saved ? '#33658a' : 'currentColor'} 
              variant={saved ? 'Bold' : 'Broken'} 
              className={saved ? 'text-brand-400' : 'text-zinc-400 hover:text-white'} 
            />
          </button>
        </div>

        {/* Book Artisan CTA */}
        <button
          onClick={onArtisanClick}
          className="px-3.5 py-1.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-extrabold flex items-center gap-1 cursor-pointer transition-all shadow-md shadow-brand-500/20 active:scale-95"
        >
          <span>Book Artisan</span>
          <ArrowRight size={12} color="currentColor" variant="Broken" />
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
  const [selectedHashtag, setSelectedHashtag] = useState<string>('all');
  const [commentPost, setCommentPost] = useState<ArtisanPost | null>(null);

  useEffect(() => {
    supabase.from('posts').select('*').then(
      ({ data }) => { if (data) setPosts(data as any); },
      () => {}
    );
  }, []);

  const hashtags = [
    { id: 'all', label: '🔥 All Posts' },
    { id: 'Completed Work', label: '✅ Completed Jobs' },
    { id: 'Before & After', label: '✨ Before & After' },
    { id: 'On-site', label: '📍 On-Site Live' },
    { id: 'Showcase', label: '🏆 Showcase' },
    { id: 'Tip', label: '💡 Pro Tips' }
  ];

  const filteredPosts = posts.filter(p => {
    const matchesHashtag = selectedHashtag === 'all' || p.category.toLowerCase() === selectedHashtag.toLowerCase();
    if (!searchQuery) return matchesHashtag;
    
    const q = searchQuery.toLowerCase();
    const matchesSearch = (
      p.artisanName.toLowerCase().includes(q) ||
      p.artisanOccupation.toLowerCase().includes(q) ||
      p.caption.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    );
    return matchesHashtag && matchesSearch;
  });

  const handleLike = (postId: string) => {
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, likesCount: p.likesCount + 1 } : p));
  };

  const handleAddComment = (postId: string, body: string) => {
    if (!user) return;
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, commentsCount: p.commentsCount + 1 } : p));
  };

  // Unique artisans for stories row
  const storyArtisans = Array.from(
    new Map(posts.map(p => [p.artisanId, { id: p.artisanId, name: p.artisanName, avatar: p.artisanAvatar, occupation: p.artisanOccupation }])).values()
  );

  return (
    <div className="flex-1 flex flex-col bg-zinc-955 text-left animate-in fade-in pb-24">

      {/* Sticky Header */}
      <div className="px-4 pt-6 pb-3 sticky top-0 z-30 bg-zinc-955/95 backdrop-blur-md border-b border-zinc-850/60">
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-[9px] text-brand-400 font-extrabold uppercase tracking-widest block">Artisan Social Feed</span>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Discover</h1>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-zinc-400 bg-zinc-900 border border-zinc-800 px-3 py-1 rounded-full font-bold">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Live Artisan Feed</span>
          </div>
        </div>

        {/* Search bar */}
        <div className="flex items-center gap-2.5 px-3.5 h-11 bg-zinc-900 border border-zinc-850 rounded-2xl focus-within:border-brand-500 transition-all">
          <SearchNormal1 size={15} color="currentColor" variant="Broken" className="text-zinc-500 shrink-0" />
          <input
            type="text"
            placeholder="Search artisans, completed jobs, skills..."
            className="flex-1 bg-transparent text-xs text-white placeholder:text-zinc-500 focus:outline-none"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-zinc-400 hover:text-white transition-colors cursor-pointer">
              <CloseCircle size={14} color="currentColor" variant="Broken" />
            </button>
          )}
        </div>

        {/* Hashtags / Topics horizontal strip */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar mt-3 pt-1">
          {hashtags.map(h => (
            <button
              key={h.id}
              onClick={() => setSelectedHashtag(h.id)}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-extrabold transition-all border shrink-0 cursor-pointer ${
                selectedHashtag === h.id
                  ? 'bg-brand-500 text-white border-brand-500 shadow-md shadow-brand-500/20'
                  : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'
              }`}
            >
              {h.label}
            </button>
          ))}
        </div>
      </div>

      {/* Featured Artisan Stories Row */}
      {!searchQuery && (
        <div className="px-4 my-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400">Featured Artisans</span>
          </div>
          <div className="flex gap-4 overflow-x-auto no-scrollbar py-1">
            {storyArtisans.map(a => (
              <button
                key={a.id}
                onClick={() => navigate(`/artisan/${a.id}`)}
                className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer active:scale-95 transition-all group"
              >
                <div className="p-0.5 rounded-full bg-gradient-to-tr from-brand-500 via-brand-400 to-amber-400 shadow-lg shadow-brand-500/10 group-hover:scale-105 transition-transform">
                  <img
                    src={a.avatar}
                    className="h-13 w-13 rounded-full object-cover border-2 border-zinc-950"
                    alt={a.name}
                  />
                </div>
                <span className="text-[10px] font-extrabold text-zinc-300 w-14 text-center truncate leading-tight group-hover:text-white">
                  {a.name.split(' ')[0]}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Social Feed */}
      <div className="flex flex-col px-4">
        {filteredPosts.length === 0 ? (
          <div className="glass border border-zinc-900 rounded-[28px] p-12 text-center text-zinc-500 text-xs my-6">
            <p className="font-bold text-white text-sm mb-1">No Posts Found</p>
            <p className="font-light text-zinc-400">Try selecting a different category hashtag or clearing your search term.</p>
          </div>
        ) : (
          filteredPosts.map(post => (
            <PostCard
              key={post.id}
              post={post}
              onLike={() => handleLike(post.id)}
              onComment={() => setCommentPost(post)}
              onArtisanClick={() => navigate(`/artisan/${post.artisanId}`)}
            />
          ))
        )}
      </div>

      {/* Dark Glass Comments sheet */}
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

