'use client';

import React, { useState } from 'react';
import { 
  GuildWar, 
  GuildWarContribution, 
  GuildWarParticipant, 
  UserProfile 
} from '@/types';
import { 
  Swords, 
  Trophy, 
  Activity, 
  Clock, 
  CheckCircle, 
  ShieldCheck, 
  Users, 
  Sparkles, 
  ArrowLeft,
  Info,
  Calendar,
  Flame,
  Zap
} from 'lucide-react';
import { triggerPRConfetti } from '@/lib/utils';

interface GuildWarDashboardProps {
  war: GuildWar;
  contributions: GuildWarContribution[];
  participants: GuildWarParticipant[];
  currentUser: UserProfile;
  onBack: () => void;
  onFinalizeWar: (warId: string) => void;
}

export const GuildWarDashboard: React.FC<GuildWarDashboardProps> = ({
  war,
  contributions,
  participants,
  currentUser,
  onBack,
  onFinalizeWar,
}) => {
  const challenger = war.challenger_guild;
  const opponent = war.opponent_guild;

  const isConsistency = war.category === 'consistency';
  const isCompleted = war.status === 'completed';

  const challengerParticipants = participants.filter(p => p.guild_id === war.challenger_guild_id && p.is_eligible);
  const opponentParticipants = participants.filter(p => p.guild_id === war.opponent_guild_id && p.is_eligible);

  const challengerContribs = contributions.filter(c => c.guild_id === war.challenger_guild_id);
  const opponentContribs = contributions.filter(c => c.guild_id === war.opponent_guild_id);

  // Determine current leader
  const isChallengerLeading = war.challenger_normalized_score > war.opponent_normalized_score;
  const isOpponentLeading = war.opponent_normalized_score > war.challenger_normalized_score;
  const isTied = war.challenger_normalized_score === war.opponent_normalized_score;

  const handleManualFinalize = () => {
    triggerPRConfetti();
    onFinalizeWar(war.id);
  };

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <button
          onClick={onBack}
          className="inline-flex items-center space-x-1.5 text-xs font-bold text-zinc-400 hover:text-white transition bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-xl"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Guilds</span>
        </button>
      </div>

      {/* Hero VS Matchup Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 border border-zinc-800 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          {/* Header Badges */}
          <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${
                  isConsistency
                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                    : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                }`}
              >
                {isConsistency ? <Activity className="w-3.5 h-3.5" /> : <Trophy className="w-3.5 h-3.5" />}
                {isConsistency ? 'Workout Consistency War' : 'Strength & PR War'}
              </span>

              <span className="text-xs text-zinc-400 font-semibold flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-zinc-500" />
                {war.duration_days}-Day Competition
              </span>
            </div>

            <div>
              {isCompleted ? (
                <span className="px-3 py-1 rounded-full text-xs font-black bg-purple-500/20 text-purple-300 border border-purple-500/40">
                  FINALIZED RESULTS 🏆
                </span>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    WAR IN PROGRESS
                  </span>
                  <button
                    onClick={handleManualFinalize}
                    className="px-3 py-1 rounded-full text-xs font-bold bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition"
                    title="Authoritative server finalization"
                  >
                    Finalize War
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* VS presentation */}
          <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-center text-center">
            {/* Challenger */}
            <div className="md:col-span-5 p-5 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 flex flex-col items-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={challenger?.emblem_url}
                alt={challenger?.name}
                className="w-16 h-16 rounded-2xl object-cover ring-2 ring-emerald-500/40 mb-2 shadow-lg"
              />
              <h2 className="text-lg font-black text-white">{challenger?.name}</h2>
              <div className="text-xs text-zinc-400 mb-3">
                Captain: {challenger?.captain?.full_name || 'Captain'} • {challengerParticipants.length} Eligible Lifters
              </div>

              {/* Normalized Score Highlight */}
              <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 w-full text-center">
                <div className="text-[10px] uppercase font-bold text-zinc-400">Normalized Score</div>
                <div className="text-3xl font-black text-emerald-400">
                  {war.challenger_normalized_score.toFixed(2)}
                </div>
                <div className="text-[11px] text-zinc-500 mt-0.5">
                  {war.challenger_raw_score} total pts ÷ {Math.max(1, challengerParticipants.length)} members
                </div>
              </div>
            </div>

            {/* VS Icon */}
            <div className="md:col-span-1 flex flex-col items-center justify-center my-2 md:my-0">
              <div className="p-3 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 shadow-xl shadow-amber-500/10">
                <Swords className="w-6 h-6 stroke-[2.5]" />
              </div>
              <span className="text-xs font-black text-zinc-500 mt-1 uppercase tracking-widest">VS</span>
            </div>

            {/* Opponent */}
            <div className="md:col-span-5 p-5 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 flex flex-col items-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={opponent?.emblem_url}
                alt={opponent?.name}
                className="w-16 h-16 rounded-2xl object-cover ring-2 ring-sky-500/40 mb-2 shadow-lg"
              />
              <h2 className="text-lg font-black text-white">{opponent?.name}</h2>
              <div className="text-xs text-zinc-400 mb-3">
                Captain: {opponent?.captain?.full_name || 'Captain'} • {opponentParticipants.length} Eligible Lifters
              </div>

              {/* Normalized Score Highlight */}
              <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 w-full text-center">
                <div className="text-[10px] uppercase font-bold text-zinc-400">Normalized Score</div>
                <div className="text-3xl font-black text-sky-400">
                  {war.opponent_normalized_score.toFixed(2)}
                </div>
                <div className="text-[11px] text-zinc-500 mt-0.5">
                  {war.opponent_raw_score} total pts ÷ {Math.max(1, opponentParticipants.length)} members
                </div>
              </div>
            </div>
          </div>

          {/* Current Leader Banner */}
          <div className="mt-5 p-3 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-between flex-wrap gap-2 text-xs">
            <div className="flex items-center space-x-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span className="font-bold text-zinc-300">
                {isCompleted ? 'Final Winner:' : 'Currently In The Lead:'}
              </span>
              <span className="font-black text-white text-sm">
                {isCompleted 
                  ? (war.winner_guild_id === war.challenger_guild_id ? challenger?.name : opponent?.name)
                  : (isChallengerLeading ? challenger?.name : isOpponentLeading ? opponent?.name : 'Dead Heat Tie!')
                }
              </span>
            </div>
            <div className="text-[11px] text-zinc-500 font-mono">
              Policy: {war.scoring_policy?.version || 'v1.0'} • Frozen Roster: {challengerParticipants.length} vs {opponentParticipants.length}
            </div>
          </div>
        </div>
      </div>

      {/* Fair Scoring & Normalization Formula Explanation Card */}
      <div className="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 shadow-md space-y-3">
        <div className="flex items-center space-x-2 text-white font-bold text-sm">
          <Info className="w-4 h-4 text-emerald-400" />
          <span>Fair Scoring & Flexible Team Size Formula</span>
        </div>
        <p className="text-xs text-zinc-400 leading-relaxed">
          {war.scoring_policy?.formula_description}
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
          <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80">
            <div className="text-[10px] uppercase font-bold text-zinc-500">Base Award</div>
            <div className="text-sm font-black text-white mt-0.5">
              {isConsistency ? '10 pts / workout' : '5 pts / new PR'}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80">
            <div className="text-[10px] uppercase font-bold text-zinc-500">Eligibility Window</div>
            <div className="text-sm font-black text-white mt-0.5">
              Frozen Roster at Start
            </div>
          </div>
          <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80">
            <div className="text-[10px] uppercase font-bold text-zinc-500">Weekly Goal Bonus</div>
            <div className="text-sm font-black text-white mt-0.5">
              {isConsistency ? '+20 pts on 4th workout' : '1 PR per lift'}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80">
            <div className="text-[10px] uppercase font-bold text-zinc-500">Fairness Metric</div>
            <div className="text-sm font-black text-emerald-400 mt-0.5">
              Avg Points per Lifter
            </div>
          </div>
        </div>
      </div>

      {/* Member Contributions Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Challenger Roster Contributions */}
        <div className="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 shadow-md">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-3">
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                {challenger?.name} Roster ({challengerParticipants.length})
              </h3>
            </div>
            <span className="text-xs text-zinc-400 font-bold">
              {war.challenger_raw_score} Raw Pts
            </span>
          </div>

          <div className="space-y-2.5">
            {challengerParticipants.map(participant => {
              const userContribs = challengerContribs.filter(c => c.user_id === participant.user_id);
              const points = userContribs.reduce((acc, c) => acc + c.awarded_points, 0);
              const hasWeeklyBonus = userContribs.some(c => c.contribution_type === 'weekly_bonus');

              return (
                <div
                  key={participant.id}
                  className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center space-x-2.5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={participant.user?.avatar_url}
                      alt={participant.user?.full_name}
                      className="w-8 h-8 rounded-lg object-cover ring-1 ring-zinc-700"
                    />
                    <div>
                      <div className="font-bold text-white">
                        {participant.user?.full_name}
                      </div>
                      <div className="text-[10px] text-zinc-500">
                        {userContribs.length} qualifying {isConsistency ? 'sessions' : 'PRs'} logged
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {hasWeeklyBonus && (
                      <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-black text-[9px]">
                        +20 WEEKLY BONUS
                      </span>
                    )}
                    <span className="font-black text-emerald-400 text-sm">
                      {points} pts
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Opponent Roster Contributions */}
        <div className="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 shadow-md">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-3">
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-sky-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                {opponent?.name} Roster ({opponentParticipants.length})
              </h3>
            </div>
            <span className="text-xs text-zinc-400 font-bold">
              {war.opponent_raw_score} Raw Pts
            </span>
          </div>

          <div className="space-y-2.5">
            {opponentParticipants.map(participant => {
              const userContribs = opponentContribs.filter(c => c.user_id === participant.user_id);
              const points = userContribs.reduce((acc, c) => acc + c.awarded_points, 0);
              const hasWeeklyBonus = userContribs.some(c => c.contribution_type === 'weekly_bonus');

              return (
                <div
                  key={participant.id}
                  className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center space-x-2.5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={participant.user?.avatar_url}
                      alt={participant.user?.full_name}
                      className="w-8 h-8 rounded-lg object-cover ring-1 ring-zinc-700"
                    />
                    <div>
                      <div className="font-bold text-white">
                        {participant.user?.full_name}
                      </div>
                      <div className="text-[10px] text-zinc-500">
                        {userContribs.length} qualifying {isConsistency ? 'sessions' : 'PRs'} logged
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {hasWeeklyBonus && (
                      <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-black text-[9px]">
                        +20 WEEKLY BONUS
                      </span>
                    )}
                    <span className="font-black text-sky-400 text-sm">
                      {points} pts
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Real-Time Immutable Contribution Activity Feed */}
      <div className="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 shadow-md space-y-3">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400" />
          Verified War Contribution Logs
        </h3>

        {contributions.length === 0 ? (
          <div className="p-6 text-center text-xs text-zinc-500">
            No qualifying contributions logged yet. Head to "Log Workout" or "Record PR" to score for your team!
          </div>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {contributions.map(c => {
              const isChallenger = c.guild_id === war.challenger_guild_id;

              return (
                <div
                  key={c.id}
                  className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800/60 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center space-x-2.5">
                    <span className={`w-2 h-2 rounded-full ${isChallenger ? 'bg-emerald-400' : 'bg-sky-400'}`} />
                    <span className="font-bold text-white">{c.user?.full_name || 'Lifter'}</span>
                    <span className="text-zinc-500">({isChallenger ? challenger?.name : opponent?.name})</span>
                    <span className="text-zinc-400 font-medium">
                      {c.contribution_type === 'weekly_bonus' 
                        ? 'Completed 4-workout weekly goal (+20 bonus)' 
                        : c.contribution_type === 'workout'
                        ? `Completed ${c.metadata?.duration_minutes || 60}m ${c.metadata?.split || 'Grind'}`
                        : `Smashed PR: ${c.metadata?.exercise_name || 'Lift'}`
                      }
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] text-zinc-500 font-mono">
                      {new Date(c.recorded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="font-bold text-amber-400">
                      +{c.awarded_points} pts
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
