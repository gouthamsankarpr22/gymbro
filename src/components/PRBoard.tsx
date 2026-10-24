'use client';

import React, { useState } from 'react';
import { 
  PersonalRecord, 
  UserProfile, 
  PRProgressionPoint 
} from '@/types';
import { 
  Trophy, 
  Award, 
  Flame, 
  Plus, 
  TrendingUp, 
  Calendar, 
  User, 
  ChevronRight, 
  Sparkles,
  Zap,
  Target
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend 
} from 'recharts';
import { formatWeight, calculateOneRepMax, triggerPRConfetti } from '@/lib/utils';
import { SEED_PR_PROGRESSION } from '@/lib/seed-data';

interface PRBoardProps {
  prs: PersonalRecord[];
  allUsers: UserProfile[];
  currentUser: UserProfile;
  onOpenAddPR: () => void;
}

export const PRBoard: React.FC<PRBoardProps> = ({
  prs,
  allUsers,
  currentUser,
  onOpenAddPR,
}) => {
  const [selectedLift, setSelectedLift] = useState<string>('All');

  const filteredPrs = prs.filter((p) => {
    if (selectedLift === 'All') return true;
    return p.exercise_name.toLowerCase().includes(selectedLift.toLowerCase());
  });

  // Calculate Big 3 Leaderboard
  const sortedByBigThree = [...allUsers].sort(
    (a, b) => (b.big_three_total_kg || 0) - (a.big_three_total_kg || 0)
  );

  return (
    <div className="space-y-6">
      {/* Top Iron Wall Header */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-zinc-900 to-zinc-950 border border-amber-500/30 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                The Iron Wall
              </span>
              <span className="text-xs text-zinc-400">Brotherhood Hall of Fame</span>
            </div>
            <h1 className="text-2xl font-black text-white">Personal Records & Milestones</h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-xl">
              Track your gym crew’s strength progression. When one bro gets stronger, the whole squad levels up!
            </p>
          </div>
          <button
            onClick={() => {
              triggerPRConfetti();
              onOpenAddPR();
            }}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-amber-500/25 transition-all hover:scale-105 active:scale-95 whitespace-nowrap"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            Record New PR
          </button>
        </div>
      </div>

      {/* Big 3 Squad Leaderboard Podium */}
      <div className="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 shadow-md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Award className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Big 3 Squad Leaderboard (S/B/D Total)
            </h2>
          </div>
          <span className="text-xs text-zinc-400">Ranked by combined total</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {sortedByBigThree.map((user, index) => {
            const isFirst = index === 0;
            const isCurrentUser = user.id === currentUser.id;

            return (
              <div
                key={user.id}
                className={`p-3.5 rounded-xl border relative transition-all ${
                  isFirst
                    ? 'bg-gradient-to-b from-amber-500/10 to-zinc-950 border-amber-500/40 shadow-lg shadow-amber-500/5'
                    : 'bg-zinc-950 border-zinc-800'
                } ${isCurrentUser ? 'ring-1 ring-emerald-500/60' : ''}`}
              >
                {/* Rank Badge */}
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                      isFirst
                        ? 'bg-amber-400 text-zinc-950'
                        : index === 1
                        ? 'bg-zinc-300 text-zinc-950'
                        : index === 2
                        ? 'bg-amber-700 text-zinc-100'
                        : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    #{index + 1}
                  </span>
                  {isCurrentUser && (
                    <span className="text-[10px] uppercase font-extrabold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                      You
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-2.5 mb-2.5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={user.avatar_url}
                    alt={user.full_name}
                    className="w-8 h-8 rounded-lg object-cover ring-1 ring-zinc-700"
                  />
                  <div className="truncate">
                    <div className="text-xs font-bold text-white truncate">{user.full_name}</div>
                    <div className="text-[10px] text-zinc-500 truncate">@{user.username}</div>
                  </div>
                </div>

                <div className="pt-2 border-t border-zinc-800/80">
                  <div className="text-[10px] text-zinc-400 uppercase font-semibold">Total S/B/D</div>
                  <div className="text-base font-black text-amber-300">
                    {formatWeight(user.big_three_total_kg || 400)}
                  </div>
                  <div className="text-[10px] text-zinc-500 mt-0.5 truncate">
                    Fav: {user.favorite_lift}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Strength Progression Chart (Recharts) */}
      <div className="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 shadow-md space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Squad Top Lift Progression (6 Months)
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Comparative top strength metrics (kg) logged by brotherhood members
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> Alex
            </span>
            <span className="flex items-center gap-1.5 text-amber-400">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Marcus
            </span>
            <span className="flex items-center gap-1.5 text-sky-400">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400" /> Jordan
            </span>
            <span className="flex items-center gap-1.5 text-purple-400">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-400" /> Leo
            </span>
          </div>
        </div>

        {/* Recharts Container */}
        <div className="h-64 w-full pt-3">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={SEED_PR_PROGRESSION} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="date" stroke="#71717a" fontSize={11} tickLine={false} />
              <YAxis stroke="#71717a" fontSize={11} tickLine={false} unit="kg" domain={['dataMin - 10', 'dataMax + 10']} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#090d16',
                  borderColor: '#27272a',
                  borderRadius: '12px',
                  fontSize: '12px',
                  color: '#f4f4f5',
                }}
              />
              <Line type="monotone" dataKey="Alex" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="Marcus" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="Jordan" stroke="#38bdf8" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="Leo" stroke="#a855f7" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Lifts Filter Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
        {['All', 'Bench Press', 'Squat', 'Deadlift', 'Overhead Press'].map((lift) => (
          <button
            key={lift}
            onClick={() => setSelectedLift(lift)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              selectedLift === lift
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
            }`}
          >
            {lift}
          </button>
        ))}
      </div>

      {/* PR Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredPrs.map((pr) => {
          const user = pr.user || currentUser;
          const diff = pr.previous_weight_kg ? Math.round((pr.weight_kg - pr.previous_weight_kg) * 10) / 10 : null;

          return (
            <div
              key={pr.id}
              className="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800/90 hover:border-amber-500/40 transition shadow-lg space-y-3.5 relative overflow-hidden"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={user.avatar_url}
                    alt={user.full_name}
                    className="w-10 h-10 rounded-xl object-cover ring-1 ring-zinc-700"
                  />
                  <div>
                    <div className="text-xs font-bold text-white">{user.full_name}</div>
                    <div className="text-[10px] text-zinc-500">{user.current_location}</div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                    <Trophy className="w-3 h-3" />
                    PR
                  </span>
                </div>
              </div>

              {/* Lift Metric */}
              <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase font-bold text-zinc-400">
                    {pr.exercise_name}
                  </div>
                  <div className="text-xl font-black text-white mt-0.5">
                    {formatWeight(pr.weight_kg)}
                  </div>
                  <div className="text-[11px] text-zinc-400 font-medium">
                    {pr.reps} {pr.reps === 1 ? 'Rep' : 'Reps'}
                    {diff && diff > 0 && (
                      <span className="text-emerald-400 font-bold ml-1.5">
                        (+{diff} kg improvement)
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right pl-3 border-l border-zinc-800">
                  <div className="text-[10px] uppercase font-bold text-zinc-400">Est. 1RM</div>
                  <div className="text-base font-black text-amber-300">
                    {formatWeight(pr.one_rep_max_est, false)}
                  </div>
                </div>
              </div>

              {/* Shoutout Note */}
              {pr.shoutout_note && (
                <p className="text-xs text-zinc-300 italic bg-zinc-950/60 p-2.5 rounded-lg border border-zinc-800/60">
                  "{pr.shoutout_note}"
                </p>
              )}

              {/* Proof Photo if available */}
              {pr.proof_media_url && (
                <div className="rounded-xl overflow-hidden border border-zinc-800 max-h-48 bg-zinc-950">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={pr.proof_media_url}
                    alt={pr.exercise_name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
