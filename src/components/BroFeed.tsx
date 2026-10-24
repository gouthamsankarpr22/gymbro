'use client';

import React, { useState } from 'react';
import { 
  FeedPost, 
  UserProfile, 
  ReactionType, 
  PostType 
} from '@/types';
import { 
  Dumbbell, 
  Flame, 
  Trophy, 
  Image as ImageIcon, 
  MessageSquare, 
  Share2, 
  Clock, 
  Zap, 
  Send, 
  MapPin, 
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Sparkles
} from 'lucide-react';
import { formatWeight, getSplitBadgeColor, triggerPRConfetti } from '@/lib/utils';

interface BroFeedProps {
  posts: FeedPost[];
  currentUser: UserProfile;
  onToggleReaction: (postId: string, reaction: ReactionType) => void;
  onAddComment: (postId: string, content: string) => void;
  onOpenLogWorkout: () => void;
  onOpenMemeModal: () => void;
  onOpenPRModal: () => void;
  onCreateQuickPost: (content: string) => void;
}

export const BroFeed: React.FC<BroFeedProps> = ({
  posts,
  currentUser,
  onToggleReaction,
  onAddComment,
  onOpenLogWorkout,
  onOpenMemeModal,
  onOpenPRModal,
  onCreateQuickPost,
}) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [quickPostText, setQuickPostText] = useState('');
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [expandedExercises, setExpandedExercises] = useState<Record<string, boolean>>({});

  const filteredPosts = posts.filter((p) => {
    if (filterType === 'all') return true;
    return p.type === filterType;
  });

  const handleQuickPostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickPostText.trim()) return;
    onCreateQuickPost(quickPostText.trim());
    setQuickPostText('');
  };

  const handleCommentSubmit = (postId: string) => {
    const text = commentInputs[postId]?.trim();
    if (!text) return;
    onAddComment(postId, text);
    setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
    setExpandedComments((prev) => ({ ...prev, [postId]: true }));
  };

  const toggleCommentsView = (postId: string) => {
    setExpandedComments((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

  const toggleExercisesView = (workoutId: string) => {
    setExpandedExercises((prev) => ({ ...prev, [workoutId]: !prev[workoutId] }));
  };

  const getReactionIcon = (type: ReactionType) => {
    switch (type) {
      case 'fist_bump':
        return '👊';
      case 'fire':
        return '🔥';
      case 'heavy':
        return '🏋️';
      case 'hype':
        return '⚡';
      case 'skull':
        return '💀';
    }
  };

  const getReactionLabel = (type: ReactionType) => {
    switch (type) {
      case 'fist_bump':
        return 'Fist Bump';
      case 'fire':
        return 'Fire';
      case 'heavy':
        return 'Light Weight Baby';
      case 'hype':
        return 'Hype';
      case 'skull':
        return 'Dead';
    }
  };

  return (
    <div className="space-y-6">
      {/* Brotherhood Header Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-zinc-900 via-zinc-900 to-zinc-950 border border-zinc-800/80 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <Sparkles className="w-3 h-3" />
                The Chalkboard
              </span>
              <span className="text-xs text-zinc-400">
                Live Squad Feed
              </span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white">
              Stay Connected With Your Day-One Gym Bros
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-2xl">
              Different cities, college campuses, and work schedules can’t break the iron bond. Celebrate PRs, spot each other through the screen, and hold each other accountable daily.
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={onOpenLogWorkout}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/25 transition-all hover:scale-105 active:scale-95"
            >
              <Dumbbell className="w-4 h-4 stroke-[2.5]" />
              Log Workout
            </button>
            <button
              onClick={onOpenPRModal}
              className="px-4 py-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 font-bold text-xs flex items-center gap-2 transition"
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              Hit a PR
            </button>
          </div>
        </div>
      </div>

      {/* Fast Share Composer Card */}
      <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 shadow-md">
        <div className="flex items-start space-x-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={currentUser.avatar_url}
            alt={currentUser.full_name}
            className="w-10 h-10 rounded-xl object-cover ring-1 ring-zinc-700"
          />
          <div className="flex-1">
            <form onSubmit={handleQuickPostSubmit}>
              <textarea
                value={quickPostText}
                onChange={(e) => setQuickPostText(e.target.value)}
                placeholder={`Drop some gym banter or motivation for the squad, ${currentUser.full_name.split(' ')[0]}...`}
                rows={2}
                className="w-full bg-zinc-950 rounded-xl border border-zinc-800 p-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/70 focus:ring-1 focus:ring-emerald-500 transition resize-none"
              />
              <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-zinc-800/60">
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={onOpenLogWorkout}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-300 hover:text-white bg-zinc-800/80 hover:bg-zinc-800 transition"
                  >
                    <Dumbbell className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Workout</span>
                  </button>
                  <button
                    type="button"
                    onClick={onOpenMemeModal}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-300 hover:text-white bg-zinc-800/80 hover:bg-zinc-800 transition"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-sky-400" />
                    <span>Meme</span>
                  </button>
                  <button
                    type="button"
                    onClick={onOpenPRModal}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-300 hover:text-white bg-zinc-800/80 hover:bg-zinc-800 transition"
                  >
                    <Trophy className="w-3.5 h-3.5 text-amber-400" />
                    <span>New PR</span>
                  </button>
                </div>
                <button
                  type="submit"
                  disabled={!quickPostText.trim()}
                  className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:hover:bg-emerald-500 text-zinc-950 font-bold text-xs flex items-center space-x-1.5 transition"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Post</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'all', label: 'All Updates' },
          { id: 'workout', label: 'Workouts 🏋️' },
          { id: 'pr', label: 'PR Alerts 🏆' },
          { id: 'meme', label: 'Gym Memes 😂' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterType(tab.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              filterType === tab.id
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Posts List */}
      <div className="space-y-5">
        {filteredPosts.length === 0 ? (
          <div className="p-8 rounded-2xl bg-zinc-900/50 border border-zinc-800 text-center">
            <Dumbbell className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
            <div className="text-sm font-semibold text-zinc-300">No updates found in this category</div>
            <p className="text-xs text-zinc-500 mt-1">Be the first bro to log a workout or drop a gym meme!</p>
          </div>
        ) : (
          filteredPosts.map((post) => {
            const isCommentsOpen = !!expandedComments[post.id];
            const workout = post.workout;
            const pr = post.pr;
            const splitBadge = workout ? getSplitBadgeColor(workout.split) : null;

            return (
              <article
                key={post.id}
                className="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800/90 shadow-lg hover:border-zinc-700/80 transition-all duration-200"
              >
                {/* Author Info & Distance Header */}
                <div className="flex items-center justify-between mb-3.5">
                  <div className="flex items-center space-x-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={post.user.avatar_url}
                      alt={post.user.full_name}
                      className="w-10 h-10 rounded-xl object-cover ring-1 ring-zinc-700"
                    />
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-bold text-white hover:text-emerald-400 transition cursor-pointer">
                          {post.user.full_name}
                        </span>
                        <span className="text-xs text-zinc-500 font-normal">
                          @{post.user.username}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1.5 text-[11px] text-zinc-400">
                        <MapPin className="w-3 h-3 text-emerald-400" />
                        <span className="truncate max-w-[200px] sm:max-w-sm">
                          {post.user.current_location}
                        </span>
                        <span>•</span>
                        <span className="text-zinc-500">{post.created_at}</span>
                      </div>
                    </div>
                  </div>

                  {/* Post Type Badge */}
                  <div>
                    {post.type === 'pr' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                        <Trophy className="w-3 h-3 text-amber-400" />
                        PR ALERT
                      </span>
                    )}
                    {post.type === 'workout' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        <Dumbbell className="w-3 h-3" />
                        WORKOUT RECAP
                      </span>
                    )}
                    {post.type === 'meme' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-sky-500/15 text-sky-400 border border-sky-500/30">
                        😂 MEME & BANTER
                      </span>
                    )}
                  </div>
                </div>

                {/* Post Content */}
                <p className="text-sm text-zinc-200 leading-relaxed whitespace-pre-line mb-3.5">
                  {post.content}
                </p>

                {/* Workout Details Card (If attached) */}
                {workout && (
                  <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800/80 mb-3.5 space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center space-x-2">
                        {splitBadge && (
                          <span
                            className={`px-2.5 py-0.5 rounded-md text-xs font-extrabold border ${splitBadge.bg} ${splitBadge.text} ${splitBadge.border}`}
                          >
                            {workout.split.toUpperCase()}
                          </span>
                        )}
                        <span className="text-sm font-bold text-white">
                          {workout.title}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3 text-xs text-zinc-400 font-semibold">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-zinc-500" />
                          {workout.duration_minutes}m
                        </span>
                        <span className="flex items-center gap-1 text-emerald-400">
                          <Zap className="w-3.5 h-3.5" />
                          {workout.total_volume_kg.toLocaleString()} kg volume
                        </span>
                      </div>
                    </div>

                    {/* Expandable Exercise Breakdown */}
                    {workout.exercises && workout.exercises.length > 0 && (
                      <div className="pt-2 border-t border-zinc-800/60">
                        <button
                          onClick={() => toggleExercisesView(workout.id)}
                          className="flex items-center justify-between w-full text-xs font-semibold text-zinc-400 hover:text-white transition"
                        >
                          <span>{workout.exercises.length} Exercises Performed</span>
                          <span className="flex items-center gap-1 text-[11px] text-emerald-400">
                            {expandedExercises[workout.id] ? (
                              <>Hide sets <ChevronUp className="w-3.5 h-3.5" /></>
                            ) : (
                              <>View sets <ChevronDown className="w-3.5 h-3.5" /></>
                            )}
                          </span>
                        </button>

                        {expandedExercises[workout.id] && (
                          <div className="mt-2.5 space-y-1.5">
                            {workout.exercises.map((ex, idx) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs"
                              >
                                <span className="font-medium text-zinc-200">
                                  {ex.exercise_name}
                                </span>
                                <div className="flex items-center space-x-2 text-zinc-400">
                                  <span>{ex.sets} sets × {ex.reps} reps</span>
                                  <span className="font-bold text-white">
                                    @{formatWeight(ex.weight_kg)}
                                  </span>
                                  {ex.is_pr && (
                                    <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-extrabold text-[10px]">
                                      PR!
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* PR Banner (If PR attached) */}
                {pr && (
                  <div className="p-4 rounded-xl bg-gradient-to-r from-amber-950/40 via-zinc-950 to-zinc-950 border border-amber-500/30 mb-3.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2.5">
                        <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
                          <Trophy className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-xs uppercase tracking-wider font-extrabold text-amber-400">
                            Personal Record Smashed
                          </div>
                          <div className="text-base font-black text-white">
                            {pr.exercise_name}: {formatWeight(pr.weight_kg)} for {pr.reps} rep{pr.reps > 1 ? 's' : ''}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] uppercase font-bold text-zinc-400">Est. 1RM</div>
                        <div className="text-sm font-black text-amber-300">
                          {formatWeight(pr.one_rep_max_est, false)}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Media Image / Meme (If available) */}
                {post.media_url && (
                  <div className="rounded-xl overflow-hidden border border-zinc-800 mb-3.5 bg-zinc-950">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={post.media_url}
                      alt="Workout or gym meme"
                      className="w-full max-h-96 object-cover hover:scale-[1.01] transition-transform duration-300"
                    />
                  </div>
                )}

                {/* Reactions & Interaction Bar */}
                <div className="pt-2 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center space-x-1.5">
                    {(['fist_bump', 'fire', 'heavy', 'hype', 'skull'] as ReactionType[]).map((reaction) => {
                      const count = post.reactions[reaction] || 0;
                      const hasReacted = post.user_reactions.includes(reaction);

                      return (
                        <button
                          key={reaction}
                          onClick={() => {
                            onToggleReaction(post.id, reaction);
                            if (reaction === 'fire' || reaction === 'hype') {
                              triggerPRConfetti();
                            }
                          }}
                          className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition active:scale-90 ${
                            hasReacted
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : 'bg-zinc-800/60 text-zinc-400 hover:text-white hover:bg-zinc-800'
                          }`}
                          title={getReactionLabel(reaction)}
                        >
                          <span>{getReactionIcon(reaction)}</span>
                          <span className="text-[11px] font-bold">{count}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Comment & Share buttons */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleCommentsView(post.id)}
                      className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{post.comments_count || 0} Comments</span>
                    </button>
                  </div>
                </div>

                {/* Collapsible Comments Section */}
                {isCommentsOpen && (
                  <div className="mt-3.5 pt-3.5 border-t border-zinc-800/60 space-y-3">
                    {/* Comments list */}
                    {post.comments && post.comments.length > 0 ? (
                      <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                        {post.comments.map((comm) => (
                          <div
                            key={comm.id}
                            className="flex items-start space-x-2.5 p-2 rounded-xl bg-zinc-950/70 border border-zinc-800/50"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={comm.user.avatar_url}
                              alt={comm.user.full_name}
                              className="w-6 h-6 rounded-md object-cover mt-0.5"
                            />
                            <div className="flex-1 text-xs">
                              <div className="flex items-center space-x-1.5 mb-0.5">
                                <span className="font-bold text-white">
                                  {comm.user.full_name}
                                </span>
                                <span className="text-[10px] text-zinc-500">
                                  {comm.created_at}
                                </span>
                              </div>
                              <p className="text-zinc-300 leading-snug">
                                {comm.content}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-2 text-xs text-zinc-500">
                        No banter yet. Be the first to drop some hype!
                      </div>
                    )}

                    {/* Add comment input */}
                    <div className="flex items-center space-x-2 pt-1">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={currentUser.avatar_url}
                        alt={currentUser.full_name}
                        className="w-7 h-7 rounded-lg object-cover"
                      />
                      <input
                        type="text"
                        value={commentInputs[post.id] || ''}
                        onChange={(e) =>
                          setCommentInputs((prev) => ({ ...prev, [post.id]: e.target.value }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleCommentSubmit(post.id);
                          }
                        }}
                        placeholder="Drop some spotter banter..."
                        className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                      />
                      <button
                        onClick={() => handleCommentSubmit(post.id)}
                        disabled={!commentInputs[post.id]?.trim()}
                        className="p-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-zinc-950 font-bold transition"
                        title="Submit comment"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </article>
            );
          })
        )}
      </div>
    </div>
  );
};
