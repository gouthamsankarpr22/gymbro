import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import confetti from 'canvas-confetti';
import { SplitType } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatWeight(kg: number, showLbs = true): string {
  const lbs = Math.round(kg * 2.20462);
  if (!showLbs) return `${kg} kg`;
  return `${kg} kg (${lbs} lbs)`;
}

export function kgToLbs(kg: number): number {
  return Math.round(kg * 2.20462);
}

export function lbsToKg(lbs: number): number {
  return Math.round((lbs / 2.20462) * 10) / 10;
}

export function calculateOneRepMax(weightKg: number, reps: number): number {
  if (reps <= 1) return weightKg;
  // Epley formula: w * (1 + r / 30)
  return Math.round(weightKg * (1 + reps / 30) * 10) / 10;
}

export function triggerPRConfetti() {
  if (typeof window === 'undefined') return;
  try {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#22c55e', '#eab308', '#f97316', '#38bdf8', '#a855f7'],
    });
  } catch (e) {
    console.error('Confetti error', e);
  }
}

export function getSplitBadgeColor(split: SplitType): { bg: string; text: string; border: string } {
  switch (split) {
    case 'Push':
      return { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/30' };
    case 'Pull':
      return { bg: 'bg-sky-500/10', text: 'text-sky-400', border: 'border-sky-500/30' };
    case 'Legs':
      return { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' };
    case 'Upper':
      return { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30' };
    case 'Lower':
      return { bg: 'bg-lime-500/10', text: 'text-lime-400', border: 'border-lime-500/30' };
    case 'Arms':
      return { bg: 'bg-pink-500/10', text: 'text-pink-400', border: 'border-pink-500/30' };
    case 'Full Body':
      return { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' };
    case 'Cardio':
      return { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/30' };
    default:
      return { bg: 'bg-zinc-800', text: 'text-zinc-300', border: 'border-zinc-700' };
  }
}
