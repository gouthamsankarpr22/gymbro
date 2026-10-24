'use client';

import React, { useState } from 'react';
import { 
  X, 
  Dumbbell, 
  Plus, 
  Trash2, 
  Trophy, 
  Clock, 
  Zap, 
  Camera, 
  Sparkles,
  Check
} from 'lucide-react';
import { SplitType, WorkoutExercise } from '@/types';
import { formatWeight, triggerPRConfetti } from '@/lib/utils';

interface WorkoutLoggerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveWorkout: (workoutData: {
    title: string;
    split: SplitType;
    duration_minutes: number;
    notes?: string;
    photo_url?: string;
    energy_rating: number;
    exercises: WorkoutExercise[];
    postToFeed?: boolean;
    squad_id?: string;
  }) => void;
  activeSquadId?: string;
}

const COMMON_EXERCISES = [
  'Barbell Bench Press',
  'Incline Dumbbell Press',
  'Barbell Back Squat',
  'Conventional Deadlift',
  'Overhead Press (OHP)',
  'Barbell Bent Over Row',
  'Weighted Pull-ups',
  'Dumbbell Lateral Raises',
  'Romanian Deadlift (RDL)',
  'Bulgarian Split Squats',
  'Triceps Rope Pushdown',
  'Barbell Bicep Curls',
  'Leg Extension',
  'Seated Leg Curl',
];

export const WorkoutLoggerModal: React.FC<WorkoutLoggerModalProps> = ({
  isOpen,
  onClose,
  onSaveWorkout,
  activeSquadId,
}) => {
  const [split, setSplit] = useState<SplitType>('Push');
  const [title, setTitle] = useState('Heavy Chest & Triceps Pump');
  const [duration, setDuration] = useState(65);
  const [energy, setEnergy] = useState(8);
  const [notes, setNotes] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [postToFeed, setPostToFeed] = useState(true);

  const [exercises, setExercises] = useState<WorkoutExercise[]>([
    {
      id: 'ex-1',
      exercise_name: 'Barbell Bench Press',
      sets: 4,
      reps: 8,
      weight_kg: 100,
      is_pr: false,
    },
    {
      id: 'ex-2',
      exercise_name: 'Incline Dumbbell Press',
      sets: 3,
      reps: 10,
      weight_kg: 36,
      is_pr: false,
    },
    {
      id: 'ex-3',
      exercise_name: 'Dumbbell Lateral Raises',
      sets: 4,
      reps: 15,
      weight_kg: 14,
      is_pr: false,
    },
  ]);

  if (!isOpen) return null;

  const handleAddExercise = () => {
    const newEx: WorkoutExercise = {
      id: `ex-${Date.now()}`,
      exercise_name: COMMON_EXERCISES[Math.floor(Math.random() * COMMON_EXERCISES.length)],
      sets: 3,
      reps: 10,
      weight_kg: 60,
      is_pr: false,
    };
    setExercises([...exercises, newEx]);
  };

  const handleRemoveExercise = (id: string) => {
    if (exercises.length <= 1) return;
    setExercises(exercises.filter((e) => e.id !== id));
  };

  const handleExerciseChange = (id: string, field: keyof WorkoutExercise, value: any) => {
    setExercises(
      exercises.map((e) => (e.id === id ? { ...e, [field]: value } : e))
    );
  };

  const totalVolume = exercises.reduce((acc, e) => acc + e.sets * e.reps * e.weight_kg, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || exercises.length === 0) return;

    const hasPr = exercises.some((e) => e.is_pr);
    if (hasPr) {
      triggerPRConfetti();
    }

    onSaveWorkout({
      title: title.trim(),
      split,
      duration_minutes: Number(duration),
      energy_rating: Number(energy),
      notes: notes.trim(),
      photo_url: photoUrl.trim() || undefined,
      exercises,
      postToFeed,
      squad_id: activeSquadId === 'all' ? undefined : activeSquadId,
    });

    onClose();
  };

  const SPLITS: SplitType[] = ['Push', 'Pull', 'Legs', 'Upper', 'Lower', 'Arms', 'Full Body', 'Cardio'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm overflow-y-auto">
      <div 
        className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl p-6 relative my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
              <Dumbbell className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Log Today's Grind</h2>
              <p className="text-xs text-zinc-400">Record your lifts and keep the brotherhood updated</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          {/* Workout Split Picker */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
              Workout Split
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
              {SPLITS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    setSplit(s);
                    setTitle(`${s} Power & Hypertrophy`);
                  }}
                  className={`py-2 px-1 text-center rounded-xl text-xs font-bold transition ${
                    split === s
                      ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20'
                      : 'bg-zinc-950 border border-zinc-800 text-zinc-300 hover:border-zinc-700'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Title & Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                Session Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Push Day - Chest & Triceps"
                required
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                Duration (min)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="10"
                  max="240"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
                <Clock className="w-4 h-4 text-zinc-500 absolute right-3 top-2.5 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Energy Rating & Total Volume Preview */}
          <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800/80 flex items-center justify-between flex-wrap gap-3">
            <div className="flex-1 min-w-[200px]">
              <div className="flex items-center justify-between text-xs font-bold mb-1">
                <span className="text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  Pump & Energy Level
                </span>
                <span className="text-amber-400">{energy} / 10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={energy}
                onChange={(e) => setEnergy(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>
            <div className="text-right pl-4 border-l border-zinc-800">
              <div className="text-[10px] uppercase font-bold text-zinc-400">Total Volume</div>
              <div className="text-sm font-black text-emerald-400">
                {totalVolume.toLocaleString()} kg ({Math.round(totalVolume * 2.20462).toLocaleString()} lbs)
              </div>
            </div>
          </div>

          {/* Dynamic Exercises List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Exercises & Sets
              </label>
              <button
                type="button"
                onClick={handleAddExercise}
                className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Exercise
              </button>
            </div>

            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
              {exercises.map((ex, index) => (
                <div
                  key={ex.id}
                  className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex flex-col sm:flex-row sm:items-center gap-2.5 text-xs"
                >
                  <div className="flex-1">
                    <input
                      type="text"
                      list="common-lifts"
                      value={ex.exercise_name}
                      onChange={(e) => handleExerciseChange(ex.id, 'exercise_name', e.target.value)}
                      placeholder="Exercise name"
                      className="w-full bg-zinc-900 border border-zinc-700/80 rounded-lg px-2.5 py-1.5 text-white font-medium focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1">
                      <span className="text-[10px] text-zinc-500 uppercase">Sets</span>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={ex.sets}
                        onChange={(e) => handleExerciseChange(ex.id, 'sets', Number(e.target.value))}
                        className="w-12 bg-zinc-900 border border-zinc-700/80 rounded-lg px-2 py-1 text-center text-white"
                      />
                    </div>

                    <div className="flex items-center space-x-1">
                      <span className="text-[10px] text-zinc-500 uppercase">Reps</span>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={ex.reps}
                        onChange={(e) => handleExerciseChange(ex.id, 'reps', Number(e.target.value))}
                        className="w-12 bg-zinc-900 border border-zinc-700/80 rounded-lg px-2 py-1 text-center text-white"
                      />
                    </div>

                    <div className="flex items-center space-x-1">
                      <span className="text-[10px] text-zinc-500 uppercase">Kg</span>
                      <input
                        type="number"
                        min="1"
                        step="0.5"
                        value={ex.weight_kg}
                        onChange={(e) => handleExerciseChange(ex.id, 'weight_kg', Number(e.target.value))}
                        className="w-16 bg-zinc-900 border border-zinc-700/80 rounded-lg px-2 py-1 text-center text-white font-bold"
                      />
                    </div>

                    {/* PR Checkbox */}
                    <button
                      type="button"
                      onClick={() => handleExerciseChange(ex.id, 'is_pr', !ex.is_pr)}
                      className={`px-2 py-1 rounded-lg border flex items-center gap-1 transition ${
                        ex.is_pr
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 font-bold'
                          : 'bg-zinc-900 border-zinc-700/60 text-zinc-400 hover:text-white'
                      }`}
                      title="Mark as new Personal Record"
                    >
                      <Trophy className="w-3 h-3 text-amber-400" />
                      <span className="text-[10px]">PR?</span>
                    </button>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => handleRemoveExercise(ex.id)}
                      disabled={exercises.length <= 1}
                      className="p-1 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-zinc-800 disabled:opacity-30 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <datalist id="common-lifts">
              {COMMON_EXERCISES.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>

          {/* Notes & Photo Attachment */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                Session Banter & Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="How did the session feel? Mention your spotter, playlist, or post-workout meal..."
                rows={2}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-sky-400" />
                  Pump Photo URL (or leave empty)
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setPhotoUrl(
                      'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80'
                    )
                  }
                  className="text-[10px] text-sky-400 hover:underline"
                >
                  Use sample gym photo
                </button>
              </label>
              <input
                type="url"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                placeholder="https://..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Post to Feed Checkbox */}
          <div className="flex items-center space-x-2 pt-2">
            <input
              type="checkbox"
              id="post-feed"
              checked={postToFeed}
              onChange={(e) => setPostToFeed(e.target.checked)}
              className="rounded accent-emerald-500 w-4 h-4 cursor-pointer"
            />
            <label htmlFor="post-feed" className="text-xs font-semibold text-zinc-300 cursor-pointer">
              Broadcast workout to squad feed (keep bros motivated)
            </label>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-400 hover:text-white bg-zinc-800/80 hover:bg-zinc-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-xs flex items-center space-x-2 shadow-lg shadow-emerald-500/25 transition hover:scale-105 active:scale-95"
            >
              <Sparkles className="w-4 h-4 stroke-[2.5]" />
              <span>Complete & Save Workout</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
