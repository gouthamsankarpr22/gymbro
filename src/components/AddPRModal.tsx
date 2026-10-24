'use client';

import React, { useState } from 'react';
import { X, Trophy, Sparkles, Scale, MessageSquare, Image as ImageIcon } from 'lucide-react';
import { formatWeight, calculateOneRepMax, triggerPRConfetti } from '@/lib/utils';

interface AddPRModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSavePR: (prData: {
    exercise_name: string;
    weight_kg: number;
    reps: number;
    proof_media_url?: string;
    shoutout_note?: string;
  }) => void;
}

export const AddPRModal: React.FC<AddPRModalProps> = ({
  isOpen,
  onClose,
  onSavePR,
}) => {
  const [exerciseName, setExerciseName] = useState('Bench Press');
  const [weightKg, setWeightKg] = useState(142.5);
  const [reps, setReps] = useState(1);
  const [shoutout, setShoutout] = useState('Felt rock solid off the chest! Distance will not stop the gains.');
  const [proofUrl, setProofUrl] = useState('');

  if (!isOpen) return null;

  const estimated1RM = calculateOneRepMax(weightKg, reps);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!exerciseName.trim() || weightKg <= 0 || reps <= 0) return;

    triggerPRConfetti();

    onSavePR({
      exercise_name: exerciseName.trim(),
      weight_kg: Number(weightKg),
      reps: Number(reps),
      proof_media_url: proofUrl.trim() || undefined,
      shoutout_note: shoutout.trim() || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm">
      <div 
        className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
              <Trophy className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Record New PR</h2>
              <p className="text-xs text-zinc-400">Cement your lift on the brotherhood Iron Wall</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
              Exercise Name
            </label>
            <input
              type="text"
              value={exerciseName}
              onChange={(e) => setExerciseName(e.target.value)}
              placeholder="e.g. Incline Bench, Back Squat, Deadlift"
              required
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                Weight (KG)
              </label>
              <input
                type="number"
                step="0.5"
                min="1"
                value={weightKg}
                onChange={(e) => setWeightKg(Number(e.target.value))}
                required
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-white font-bold focus:outline-none focus:border-amber-500"
              />
              <span className="text-[10px] text-zinc-500 mt-1 block">
                ≈ {Math.round(weightKg * 2.20462)} lbs
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                Reps Performed
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={reps}
                onChange={(e) => setReps(Number(e.target.value))}
                required
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-white font-bold focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* 1RM Live Calculation Banner */}
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-between">
            <div className="flex items-center space-x-2 text-amber-300">
              <Scale className="w-4 h-4" />
              <span className="text-xs font-bold">Estimated 1-Rep Max</span>
            </div>
            <div className="text-sm font-black text-amber-400">
              {formatWeight(estimated1RM)}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5" />
              Shoutout to Spotter / Note
            </label>
            <textarea
              value={shoutout}
              onChange={(e) => setShoutout(e.target.value)}
              placeholder="Give a shoutout to your gym bros who helped you get here..."
              rows={2}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5" />
                Proof Photo URL (Optional)
              </span>
              <button
                type="button"
                onClick={() =>
                  setProofUrl(
                    'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80'
                  )
                }
                className="text-[10px] text-amber-400 hover:underline"
              >
                Use sample photo
              </button>
            </label>
            <input
              type="url"
              value={proofUrl}
              onChange={(e) => setProofUrl(e.target.value)}
              placeholder="https://..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
            />
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
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-xs flex items-center space-x-1.5 shadow-lg shadow-amber-500/25 transition hover:scale-105 active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>Announce to Brotherhood</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
