'use client';

import React, { useState } from 'react';
import { 
  FeedPost, 
  UserProfile, 
  ReactionType 
} from '@/types';
import { 
  Smile, 
  Plus, 
  Flame, 
  Image as ImageIcon, 
  Sparkles, 
  MessageSquare, 
  X, 
  Upload,
  Send
} from 'lucide-react';
import { SEED_MEME_TEMPLATES } from '@/lib/seed-data';

interface LockerRoomMemesProps {
  posts: FeedPost[];
  currentUser: UserProfile;
  onPostMeme: (content: string, mediaUrl: string) => void;
  onToggleReaction: (postId: string, reaction: ReactionType) => void;
  onAddComment: (postId: string, content: string) => void;
}

export const LockerRoomMemes: React.FC<LockerRoomMemesProps> = ({
  posts,
  currentUser,
  onPostMeme,
  onToggleReaction,
  onAddComment,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(SEED_MEME_TEMPLATES[0]);
  const [caption, setCaption] = useState('When the pre-workout hits before you even step foot outside the car');
  const [customImageUrl, setCustomImageUrl] = useState('');

  const memePosts = posts.filter((p) => p.type === 'meme');

  const handleCreateMemeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const media = customImageUrl.trim() || selectedTemplate.url;
    onPostMeme(caption.trim(), media);
    setIsModalOpen(false);
    setCaption('');
    setCustomImageUrl('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-sky-950/40 via-zinc-900 to-zinc-950 border border-sky-500/30 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-500/20 text-sky-400 border border-sky-500/40">
                <Smile className="w-3.5 h-3.5" />
                The Locker Room
              </span>
              <span className="text-xs text-zinc-400">Gym Memes & Squad Banter</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white">Laughter Between Heavy Sets</h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-xl leading-relaxed">
              From skipped leg day roasts to pre-workout jitter memes, keep the energy high and the group chat laughing!
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 sm:px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-zinc-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-sky-500/25 transition-all hover:scale-105 active:scale-95 whitespace-nowrap self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            Drop Gym Meme
          </button>
        </div>
      </div>

      {/* Meme Gallery Grid */}
      {memePosts.length === 0 ? (
        <div className="p-6 sm:p-8 rounded-2xl bg-zinc-900/50 border border-zinc-800 text-center space-y-3">
          <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center mx-auto text-sky-400">
            <Smile className="w-6 h-6" />
          </div>
          <div>
            <div className="text-sm font-bold text-white">No Memes Dropped Yet</div>
            <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
              Be the first bro to drop a gym meme, post-workout roast, or pre-workout shaker joke!
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/40 text-sky-300 font-bold text-xs inline-flex items-center gap-1.5 transition active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Drop First Meme</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        {memePosts.map((post) => (
          <div
            key={post.id}
            className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 shadow-lg space-y-3.5 flex flex-col justify-between"
          >
            <div>
              {/* Author */}
              <div className="flex items-center space-x-3 mb-2.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={post.user.avatar_url}
                  alt={post.user.full_name}
                  className="w-8 h-8 rounded-lg object-cover ring-1 ring-zinc-700"
                />
                <div>
                  <div className="text-xs font-bold text-white">{post.user.full_name}</div>
                  <div className="text-[10px] text-zinc-500">{post.created_at}</div>
                </div>
              </div>

              {/* Caption */}
              <p className="text-sm font-semibold text-zinc-100 mb-3 leading-snug">
                {post.content}
              </p>

              {/* Meme Image */}
              {post.media_url && (
                <div className="rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950 max-h-80">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={post.media_url}
                    alt="Meme"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>

            {/* Reactions */}
            <div className="pt-2 border-t border-zinc-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onToggleReaction(post.id, 'skull')}
                  className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                    post.user_reactions.includes('skull')
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : 'bg-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  <span>💀</span>
                  <span>{post.reactions.skull || 0}</span>
                </button>
                <button
                  onClick={() => onToggleReaction(post.id, 'hype')}
                  className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                    post.user_reactions.includes('hype')
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  <span>⚡</span>
                  <span>{post.reactions.hype || 0}</span>
                </button>
              </div>

              <div className="text-xs text-zinc-500">
                {post.comments_count || 0} Comments
              </div>
            </div>
          </div>
        ))}
      </div>
    )}

      {/* Create Meme Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm">
          <div 
            className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-sky-500/15 text-sky-400">
                  <Smile className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">Drop Gym Meme</h3>
                  <p className="text-xs text-zinc-400">Share some locker room laughs with the squad</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateMemeSubmit} className="mt-4 space-y-4">
              {/* Preset Templates */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
                  Choose Template
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {SEED_MEME_TEMPLATES.map((tmpl) => (
                    <button
                      key={tmpl.id}
                      type="button"
                      onClick={() => {
                        setSelectedTemplate(tmpl);
                        setCustomImageUrl('');
                      }}
                      className={`p-2 rounded-xl border text-left flex items-center space-x-2 transition ${
                        selectedTemplate.id === tmpl.id && !customImageUrl
                          ? 'bg-sky-500/15 border-sky-500/40 ring-1 ring-sky-500/30'
                          : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={tmpl.url}
                        alt={tmpl.title}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                      <div className="truncate">
                        <div className="text-xs font-bold text-white truncate">{tmpl.title}</div>
                        <div className="text-[10px] text-sky-400 font-medium">{tmpl.tag}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Image URL */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5 flex items-center justify-between">
                  <span>Or Paste Image / GIF URL</span>
                </label>
                <input
                  type="url"
                  value={customImageUrl}
                  onChange={(e) => setCustomImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              {/* Caption */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Meme Caption / Banter
                </label>
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="When the pre-workout kicks in..."
                  rows={2}
                  required
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-sky-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-zinc-950 font-black text-xs flex items-center space-x-1.5 shadow-lg shadow-sky-500/20"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Post to Locker Room</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
