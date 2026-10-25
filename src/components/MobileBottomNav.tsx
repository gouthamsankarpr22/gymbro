'use client';

import React, { useState } from 'react';
import { 
  Home, 
  Shield, 
  Plus, 
  Trophy, 
  MoreHorizontal, 
  Radio, 
  Smile, 
  User, 
  X,
  Bell,
  Sparkles,
  ChevronRight,
  LogOut
} from 'lucide-react';
import { UserProfile, BroNudge } from '@/types';
import { triggerHaptic } from '@/lib/mobile-utils';

interface MobileBottomNavProps {
  activeTab: 'feed' | 'prs' | 'guilds' | 'radar' | 'memes' | 'profile';
  setActiveTab: (tab: 'feed' | 'prs' | 'guilds' | 'radar' | 'memes' | 'profile') => void;
  onOpenLogWorkout: () => void;
  hasActiveWar?: boolean;
  pendingNudgesCount: number;
  currentUser: UserProfile;
  onLogout?: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenLogWorkout,
  hasActiveWar = true,
  pendingNudgesCount,
  currentUser,
  onLogout,
}) => {
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  const handleTabClick = (tab: 'feed' | 'prs' | 'guilds' | 'radar' | 'memes' | 'profile') => {
    triggerHaptic('light');
    setActiveTab(tab);
    setIsMoreMenuOpen(false);
  };

  const handleOpenFab = () => {
    triggerHaptic('medium');
    onOpenLogWorkout();
  };

  const isMoreTabActive = activeTab === 'radar' || activeTab === 'memes' || activeTab === 'profile';

  return (
    <>
      {/* Mobile More Drawer / Action Sheet */}
      {isMoreMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-fade-in"
            onClick={() => setIsMoreMenuOpen(false)}
          />

          {/* Drawer Sheet */}
          <div className="relative bg-zinc-900 border-t border-zinc-800 rounded-t-3xl p-5 pb-8 space-y-4 shadow-2xl animate-slide-up">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center space-x-2.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={currentUser.avatar_url} 
                  alt={currentUser.full_name} 
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-emerald-500/50"
                />
                <div>
                  <div className="text-sm font-bold text-white">{currentUser.full_name}</div>
                  <div className="text-[10px] text-zinc-400">@{currentUser.username} • GymBro Hub</div>
                </div>
              </div>
              <button 
                onClick={() => setIsMoreMenuOpen(false)}
                className="p-1.5 rounded-full bg-zinc-800 text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {/* Squad Radar */}
              <button
                onClick={() => handleTabClick('radar')}
                className={`p-3.5 rounded-2xl flex flex-col items-center justify-center text-center space-y-1.5 transition ${
                  activeTab === 'radar'
                    ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-400'
                    : 'bg-zinc-950 border border-zinc-800 text-zinc-300 hover:border-zinc-700'
                }`}
              >
                <div className="relative">
                  <Radio className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                </div>
                <span className="text-xs font-bold">Spot Bro</span>
                <span className="text-[10px] text-zinc-500">Live Radar</span>
              </button>

              {/* Locker Room Memes */}
              <button
                onClick={() => handleTabClick('memes')}
                className={`p-3.5 rounded-2xl flex flex-col items-center justify-center text-center space-y-1.5 transition ${
                  activeTab === 'memes'
                    ? 'bg-amber-500/15 border border-amber-500/40 text-amber-300'
                    : 'bg-zinc-950 border border-zinc-800 text-zinc-300 hover:border-zinc-700'
                }`}
              >
                <Smile className="w-5 h-5 text-amber-400" />
                <span className="text-xs font-bold">Locker Room</span>
                <span className="text-[10px] text-zinc-500">Gym Memes</span>
              </button>

              {/* My Stats & Profile */}
              <button
                onClick={() => handleTabClick('profile')}
                className={`p-3.5 rounded-2xl flex flex-col items-center justify-center text-center space-y-1.5 transition ${
                  activeTab === 'profile'
                    ? 'bg-sky-500/15 border border-sky-500/40 text-sky-400'
                    : 'bg-zinc-950 border border-zinc-800 text-zinc-300 hover:border-zinc-700'
                }`}
              >
                <User className="w-5 h-5 text-sky-400" />
                <span className="text-xs font-bold">My Stats</span>
                <span className="text-[10px] text-zinc-500">Lifting Log</span>
              </button>
            </div>

            {onLogout && (
              <button
                onClick={() => {
                  triggerHaptic('light');
                  setIsMoreMenuOpen(false);
                  onLogout();
                }}
                className="w-full py-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 font-bold text-xs flex items-center justify-center gap-2 hover:bg-rose-500/20 transition active:scale-95 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out of GymBro</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Fixed Bottom Navigation Shell */}
      <nav 
        aria-label="Mobile Navigation"
        className="fixed bottom-0 inset-x-0 z-40 lg:hidden bg-zinc-950/95 backdrop-blur-xl border-t border-zinc-800/90 pb-[max(env(safe-area-inset-bottom),10px)] pt-1.5 px-3 shadow-[0_-8px_25px_rgba(0,0,0,0.6)]"
      >
        <div className="max-w-md mx-auto grid grid-cols-5 items-center">
          {/* Tab 1: Feed (The Chalkboard) */}
          <button
            onClick={() => handleTabClick('feed')}
            className={`flex flex-col items-center justify-center py-1 transition relative ${
              activeTab === 'feed' ? 'text-emerald-400' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px] font-bold mt-1 tracking-tight">Chalkboard</span>
            {activeTab === 'feed' && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-0.5 shadow-sm shadow-emerald-400" />
            )}
          </button>

          {/* Tab 2: Guilds & Wars */}
          <button
            onClick={() => handleTabClick('guilds')}
            className={`flex flex-col items-center justify-center py-1 transition relative ${
              activeTab === 'guilds' ? 'text-emerald-400' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <div className="relative">
              <Shield className="w-5 h-5" />
              {hasActiveWar && (
                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
                </span>
              )}
            </div>
            <span className="text-[10px] font-bold mt-1 tracking-tight">Guilds</span>
            {activeTab === 'guilds' && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-0.5 shadow-sm shadow-emerald-400" />
            )}
          </button>

          {/* Central Elevated Floating Action Button: Log Workout */}
          <div className="flex flex-col items-center justify-center relative -top-3">
            <button
              onClick={handleOpenFab}
              title="Log Workout Session"
              aria-label="Log Workout"
              className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-emerald-400 text-zinc-950 flex items-center justify-center shadow-lg shadow-emerald-500/40 ring-4 ring-zinc-950 active:scale-90 transition-transform cursor-pointer"
            >
              <Plus className="w-7 h-7 stroke-[2.75]" />
            </button>
            <span className="text-[9px] font-extrabold text-emerald-400 uppercase tracking-widest mt-1">
              Log
            </span>
          </div>

          {/* Tab 4: Iron Wall (PRs) */}
          <button
            onClick={() => handleTabClick('prs')}
            className={`flex flex-col items-center justify-center py-1 transition relative ${
              activeTab === 'prs' ? 'text-amber-400' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Trophy className="w-5 h-5" />
            <span className="text-[10px] font-bold mt-1 tracking-tight">Iron Wall</span>
            {activeTab === 'prs' && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-0.5 shadow-sm shadow-amber-400" />
            )}
          </button>

          {/* Tab 5: More / Bro Hub */}
          <button
            onClick={() => {
              triggerHaptic('light');
              setIsMoreMenuOpen(!isMoreMenuOpen);
            }}
            className={`flex flex-col items-center justify-center py-1 transition relative ${
              isMoreTabActive ? 'text-emerald-400' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <div className="relative">
              <MoreHorizontal className="w-5 h-5" />
              {pendingNudgesCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white font-extrabold text-[9px] w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-zinc-950">
                  {pendingNudgesCount}
                </span>
              )}
            </div>
            <span className="text-[10px] font-bold mt-1 tracking-tight">
              {activeTab === 'radar' ? 'Radar' : activeTab === 'memes' ? 'Memes' : activeTab === 'profile' ? 'Profile' : 'More'}
            </span>
            {isMoreTabActive && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-0.5 shadow-sm shadow-emerald-400" />
            )}
          </button>
        </div>
      </nav>
    </>
  );
};
