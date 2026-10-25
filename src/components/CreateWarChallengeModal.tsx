'use client';

import React, { useState } from 'react';
import { X, Swords, Trophy, Activity, AlertCircle, Info } from 'lucide-react';
import { Guild, GuildWarCategory } from '@/types';
import { DEFAULT_SCORING_POLICIES } from '@/lib/scoring-engine';

interface CreateWarChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  myGuild: Guild;
  availableOpponents: Guild[];
  onIssueChallenge: (data: {
    challengerGuildId: string;
    opponentGuildId: string;
    category: GuildWarCategory;
    durationDays: 7 | 30;
  }) => { success: boolean; error?: string };
}

export const CreateWarChallengeModal: React.FC<CreateWarChallengeModalProps> = ({
  isOpen,
  onClose,
  myGuild,
  availableOpponents,
  onIssueChallenge,
}) => {
  const [selectedOpponentId, setSelectedOpponentId] = useState(
    availableOpponents.find(g => g.id !== myGuild.id)?.id || ''
  );
  const [category, setCategory] = useState<GuildWarCategory>('consistency');
  const [durationDays, setDurationDays] = useState<7 | 30>(7);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const validOpponents = availableOpponents.filter(g => g.id !== myGuild.id);
  const policy = DEFAULT_SCORING_POLICIES[category];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedOpponentId) {
      setError('Please select an opponent Guild to challenge');
      return;
    }

    const result = onIssueChallenge({
      challengerGuildId: myGuild.id,
      opponentGuildId: selectedOpponentId,
      category,
      durationDays,
    });

    if (result.success) {
      onClose();
    } else {
      setError(result.error || 'Failed to issue challenge');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm">
      <div 
        className="w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
              <Swords className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Declare Guild War</h2>
              <p className="text-xs text-zinc-400">Challenge another squad in consistency or raw strength</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Opponent Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
              Select Opponent Guild
            </label>
            {validOpponents.length === 0 ? (
              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-400">
                No opponent Guilds found. Found another Guild to challenge!
              </div>
            ) : (
              <div className="space-y-2">
                {validOpponents.map((opp) => (
                  <button
                    key={opp.id}
                    type="button"
                    onClick={() => setSelectedOpponentId(opp.id)}
                    className={`w-full text-left p-3 rounded-xl border flex items-center justify-between transition ${
                      selectedOpponentId === opp.id
                        ? 'bg-amber-500/15 border-amber-500/40 ring-1 ring-amber-500/30'
                        : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={opp.emblem_url}
                        alt={opp.name}
                        className="w-10 h-10 rounded-lg object-cover ring-1 ring-zinc-700"
                      />
                      <div>
                        <div className="text-xs font-bold text-white">{opp.name}</div>
                        <div className="text-[10px] text-zinc-400">
                          Captain: {opp.captain?.full_name || 'Brother'} • {opp.member_count} members
                        </div>
                      </div>
                    </div>
                    <div className="text-right text-[11px] text-amber-400 font-bold">
                      {opp.stats.total_wars} Wars ({opp.stats.consistency_wins + opp.stats.strength_wins} Wins)
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Competition Category */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
              War Category
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setCategory('consistency')}
                className={`p-3 rounded-xl border text-left transition ${
                  category === 'consistency'
                    ? 'bg-emerald-500/15 border-emerald-500/50 ring-1 ring-emerald-500/30'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-white">Workout Consistency</span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-snug">
                  10 pts per session (≥30m, max 1/day) + 20 bonus pts for completing weekly 4-workout goal.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setCategory('strength')}
                className={`p-3 rounded-xl border text-left transition ${
                  category === 'strength'
                    ? 'bg-amber-500/15 border-amber-500/50 ring-1 ring-amber-500/30'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-white">Strength & PRs</span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-snug">
                  5 pts per verified new PR (≥1.0 kg increment, max 1 award per exercise per member).
                </p>
              </button>
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
              Competition Duration
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDurationDays(7)}
                className={`py-2 px-3 rounded-xl text-xs font-bold border text-center transition ${
                  durationDays === 7
                    ? 'bg-zinc-800 text-white border-zinc-600'
                    : 'bg-zinc-950 text-zinc-400 border-zinc-800'
                }`}
              >
                7-Day Blitz War
              </button>
              <button
                type="button"
                onClick={() => setDurationDays(30)}
                className={`py-2 px-3 rounded-xl text-xs font-bold border text-center transition ${
                  durationDays === 30
                    ? 'bg-zinc-800 text-white border-zinc-600'
                    : 'bg-zinc-950 text-zinc-400 border-zinc-800'
                }`}
              >
                30-Day Endurance War
              </button>
            </div>
          </div>

          {/* Normalization & Fair Scoring Explainer */}
          <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 text-[11px] text-zinc-400 space-y-1">
            <span className="font-bold text-amber-400 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5" />
              Transparent Fair Normalization:
            </span>
            <p>
              Teams with different member counts compete on equal ground. When accepted by the opponent captain, the eligible roster is frozen, and scores are normalized: <span className="text-white font-mono">Normalized Score = Total Points ÷ Eligible Roster</span>.
            </p>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-400 hover:text-white bg-zinc-800/80 hover:bg-zinc-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={validOpponents.length === 0}
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-zinc-950 font-black text-xs flex items-center space-x-1.5 shadow-lg shadow-amber-500/20 transition hover:scale-105 active:scale-95"
            >
              <Swords className="w-4 h-4 stroke-[2.5]" />
              <span>Issue Official Challenge</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
