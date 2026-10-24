'use client';

import React, { useState } from 'react';
import { 
  UserProfile, 
  BroNudge 
} from '@/types';
import { 
  Radio, 
  Send, 
  Flame, 
  MapPin, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Dumbbell, 
  Sparkles,
  MessageSquarePlus,
  ShieldCheck,
  X
} from 'lucide-react';
import { formatWeight } from '@/lib/utils';

interface SquadRadarProps {
  allUsers: UserProfile[];
  currentUser: UserProfile;
  nudges: BroNudge[];
  onSendNudge: (toUserId: string, message: string) => void;
  onRespondNudge: (nudgeId: string) => void;
}

const NUDGE_PRESETS = [
  'Bro, the squat rack is calling your name! Don’t leave it hanging 🏋️',
  'Did you hit chest today? Answer truthfully, distance won’t hide you! 👊',
  'Two scoops of pre-workout are waiting for you. Get up! ⚡',
  'Your streak is on the line bro. Grab the gym bag right now! 🔥',
  'Stairs after leg day tomorrow or regret tonight? Your choice! 🍗',
];

export const SquadRadar: React.FC<SquadRadarProps> = ({
  allUsers,
  currentUser,
  nudges,
  onSendNudge,
  onRespondNudge,
}) => {
  const [selectedUserForNudge, setSelectedUserForNudge] = useState<UserProfile | null>(null);
  const [customNudgeMessage, setCustomNudgeMessage] = useState(NUDGE_PRESETS[0]);
  const [nudgeSentToast, setNudgeSentToast] = useState<string | null>(null);

  const handleSendNudgeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForNudge || !customNudgeMessage.trim()) return;

    onSendNudge(selectedUserForNudge.id, customNudgeMessage.trim());
    setNudgeSentToast(`Nudge sent to ${selectedUserForNudge.full_name}! 🚀`);
    setTimeout(() => setNudgeSentToast(null), 3000);

    setSelectedUserForNudge(null);
  };

  const getStatusBadge = (status: UserProfile['status']) => {
    switch (status) {
      case 'at_the_gym':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            AT THE GYM NOW
          </span>
        );
      case 'pumped':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-500/15 text-sky-400 border border-sky-500/30">
            <CheckCircle className="w-3 h-3" />
            WORKED OUT TODAY
          </span>
        );
      case 'resting':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <Clock className="w-3 h-3" />
            REST / RECOVERY DAY
          </span>
        );
      case 'needs_motivation':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
            <AlertCircle className="w-3 h-3" />
            NEEDS A BRO NUDGE
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {nudgeSentToast && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-xl bg-emerald-500 text-zinc-950 font-bold text-xs shadow-2xl flex items-center space-x-2 animate-bounce">
          <Sparkles className="w-4 h-4" />
          <span>{nudgeSentToast}</span>
        </div>
      )}

      {/* Radar Header */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-zinc-900 via-zinc-900 to-zinc-950 border border-zinc-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <Radio className="w-3 h-3 animate-pulse" />
                Spot Your Bro Radar
              </span>
              <span className="text-xs text-zinc-400">Live Distance Accountability</span>
            </div>
            <h1 className="text-2xl font-black text-white">
              No Bro Left Behind Across The Map
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-xl">
              See who is grinding today, who is taking a rest day, and send an instant "Bro Nudge" to partners whose streak is slipping!
            </p>
          </div>

          <div className="flex items-center space-x-3 bg-zinc-950/80 p-3 rounded-xl border border-zinc-800">
            <div className="text-right">
              <div className="text-[10px] uppercase font-bold text-zinc-500">Squad Consistency</div>
              <div className="text-sm font-black text-emerald-400">92% Weekly Hit Rate</div>
            </div>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Gym Partners Radar Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {allUsers.map((user) => {
          const isCurrentUser = user.id === currentUser.id;

          return (
            <div
              key={user.id}
              className={`p-5 rounded-2xl bg-zinc-900/90 border transition-all duration-200 shadow-lg flex flex-col justify-between ${
                isCurrentUser
                  ? 'border-emerald-500/50 shadow-emerald-500/5 ring-1 ring-emerald-500/30'
                  : 'border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <div>
                {/* Header & Status */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center space-x-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={user.avatar_url}
                      alt={user.full_name}
                      className="w-12 h-12 rounded-xl object-cover ring-1 ring-zinc-700"
                    />
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span className="text-sm font-bold text-white">
                          {user.full_name}
                        </span>
                        {isCurrentUser && (
                          <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                            You
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-zinc-500">@{user.username}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1 px-2 py-1 rounded-lg bg-orange-500/10 text-orange-400 text-xs font-bold">
                    <Flame className="w-3.5 h-3.5 fill-orange-500" />
                    <span>{user.current_streak}d</span>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="mb-3.5">{getStatusBadge(user.status)}</div>

                {/* Location & Hometown Gym */}
                <div className="space-y-1.5 text-xs text-zinc-300 bg-zinc-950/70 p-3 rounded-xl border border-zinc-800/60 mb-3.5">
                  <div className="flex items-center space-x-1.5 text-emerald-400 font-semibold">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{user.current_location}</span>
                  </div>
                  <div className="text-[11px] text-zinc-500 flex items-center justify-between">
                    <span>Hometown Gym:</span>
                    <span className="text-zinc-400 font-medium">{user.hometown_gym}</span>
                  </div>
                  <div className="text-[11px] text-zinc-500 flex items-center justify-between">
                    <span>Last Active:</span>
                    <span className="text-zinc-300 font-medium">{user.last_workout_date || 'Today'}</span>
                  </div>
                </div>

                {/* Lifts & Bio */}
                <p className="text-xs text-zinc-400 italic mb-4 line-clamp-2">
                  "{user.bio}"
                </p>
              </div>

              {/* Bottom Actions */}
              <div className="pt-3 border-t border-zinc-800/80">
                {isCurrentUser ? (
                  <div className="text-center py-1 text-xs text-emerald-400 font-bold">
                    ✓ Your Status is Broadcast to Squad
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setSelectedUserForNudge(user);
                      setCustomNudgeMessage(NUDGE_PRESETS[Math.floor(Math.random() * NUDGE_PRESETS.length)]);
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs flex items-center justify-center space-x-2 transition"
                  >
                    <MessageSquarePlus className="w-4 h-4 text-emerald-400" />
                    <span>Send Bro Nudge</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bro Nudge Modal */}
      {selectedUserForNudge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm">
          <div 
            className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400">
                  <Radio className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">
                    Nudge {selectedUserForNudge.full_name}
                  </h3>
                  <p className="text-xs text-zinc-400">Send instant accountability from afar</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUserForNudge(null)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSendNudgeSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
                  Quick Gym Banter Presets
                </label>
                <div className="space-y-1.5">
                  {NUDGE_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCustomNudgeMessage(preset)}
                      className={`w-full text-left p-2.5 rounded-xl text-xs font-medium border transition ${
                        customNudgeMessage === preset
                          ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-semibold'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Or customize your message
                </label>
                <textarea
                  value={customNudgeMessage}
                  onChange={(e) => setCustomNudgeMessage(e.target.value)}
                  rows={2}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setSelectedUserForNudge(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-xs flex items-center space-x-1.5 shadow-lg shadow-emerald-500/20"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Nudge Now</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
