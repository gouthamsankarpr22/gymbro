'use client';

import React, { useState } from 'react';
import { 
  Dumbbell, 
  Flame, 
  Bell, 
  PlusCircle, 
  Database, 
  Users, 
  ChevronDown, 
  Check, 
  MapPin, 
  Sparkles,
  Award,
  Shield,
  LogOut
} from 'lucide-react';
import { UserProfile, Squad, BroNudge } from '@/types';
import { isSupabaseConfigured } from '@/lib/supabase/client';

interface NavbarProps {
  currentUser: UserProfile;
  allUsers: UserProfile[];
  squads: Squad[];
  activeSquadId: string;
  onSelectSquad: (id: string) => void;
  onSwitchUser: (userId: string) => void;
  onOpenLogWorkout: () => void;
  onOpenSupabaseModal: () => void;
  nudges: BroNudge[];
  onRespondNudge: (nudgeId: string) => void;
  activeTab: 'feed' | 'prs' | 'guilds' | 'radar' | 'memes' | 'profile';
  setActiveTab: (tab: 'feed' | 'prs' | 'guilds' | 'radar' | 'memes' | 'profile') => void;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  allUsers,
  squads,
  activeSquadId,
  onSelectSquad,
  onSwitchUser,
  onOpenLogWorkout,
  onOpenSupabaseModal,
  nudges,
  onRespondNudge,
  activeTab,
  setActiveTab,
  onLogout,
}) => {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showSquadDropdown, setShowSquadDropdown] = useState(false);
  const [showNudgeDropdown, setShowNudgeDropdown] = useState(false);

  // Filter pending nudges directed to current user
  const userNudges = nudges.filter(
    (n) => n.to_user_id === currentUser.id && n.status === 'pending'
  );

  const activeSquad = squads.find((s) => s.id === activeSquadId);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-zinc-950/85 backdrop-blur-md pt-[env(safe-area-inset-top,0px)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setActiveTab('feed')}
              className="flex items-center space-x-2.5 text-left group transition-all"
            >
              <div className="relative p-2 rounded-xl bg-gradient-to-tr from-emerald-600 to-lime-500 shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                <Dumbbell className="w-5 h-5 text-zinc-950 stroke-[2.5]" />
              </div>
              <div>
                <span className="text-xl font-black tracking-tight text-white flex items-center gap-1.5">
                  GymBro
                  <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    Squad
                  </span>
                </span>
                <span className="text-[11px] block font-medium text-zinc-400">
                  Stay Connected • Lift Together
                </span>
              </div>
            </button>

            {/* Squad Selector Dropdown */}
            <div className="relative hidden md:block ml-4">
              <button
                onClick={() => setShowSquadDropdown(!showSquadDropdown)}
                className="flex items-center space-x-2 text-xs font-semibold px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 transition"
              >
                <Users className="w-3.5 h-3.5 text-emerald-400" />
                <span className="max-w-[140px] truncate">
                  {activeSquadId === 'all' ? 'All Squads' : activeSquad?.name || 'My Squad'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
              </button>

              {showSquadDropdown && (
                <div 
                  className="absolute left-0 mt-2 w-64 rounded-xl bg-zinc-900 border border-zinc-800 shadow-2xl py-2 z-50"
                  onClick={() => setShowSquadDropdown(false)}
                >
                  <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                    Switch Squad Circle
                  </div>
                  <button
                    onClick={() => onSelectSquad('all')}
                    className={`w-full text-left px-3 py-2 text-xs font-medium flex items-center justify-between hover:bg-zinc-800/80 transition ${
                      activeSquadId === 'all' ? 'text-emerald-400 font-bold bg-zinc-800/50' : 'text-zinc-300'
                    }`}
                  >
                    <span>All Squads</span>
                    {activeSquadId === 'all' && <Check className="w-3.5 h-3.5" />}
                  </button>
                  {squads.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => onSelectSquad(s.id)}
                      className={`w-full text-left px-3 py-2 text-xs font-medium flex items-center justify-between hover:bg-zinc-800/80 transition ${
                        activeSquadId === s.id ? 'text-emerald-400 font-bold bg-zinc-800/50' : 'text-zinc-300'
                      }`}
                    >
                      <div className="truncate">
                        <div className="truncate">{s.name}</div>
                        <div className="text-[10px] text-zinc-500">{s.member_count} gym partners</div>
                      </div>
                      {activeSquadId === s.id && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center space-x-1">
            <button
              onClick={() => setActiveTab('feed')}
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition ${
                activeTab === 'feed'
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              The Chalkboard
            </button>
            <button
              onClick={() => setActiveTab('guilds')}
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-1.5 ${
                activeTab === 'guilds'
                  ? 'bg-zinc-800 text-white shadow-sm ring-1 ring-emerald-500/30'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <Shield className="w-4 h-4 text-emerald-400" />
              Guilds & Wars
            </button>
            <button
              onClick={() => setActiveTab('prs')}
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-1.5 ${
                activeTab === 'prs'
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <Award className="w-4 h-4 text-amber-400" />
              The Iron Wall
            </button>
            <button
              onClick={() => setActiveTab('radar')}
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-1.5 ${
                activeTab === 'radar'
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Spot Your Bro
            </button>
            <button
              onClick={() => setActiveTab('memes')}
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition ${
                activeTab === 'memes'
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              Locker Room
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition ${
                activeTab === 'profile'
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              My Stats
            </button>
          </nav>

          {/* Right Action Bar */}
          <div className="flex items-center space-x-2.5">
            {/* Supabase Status Pill */}
            <button
              onClick={onOpenSupabaseModal}
              title="Database & Auth Configuration"
              className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border bg-zinc-900/90 border-zinc-800 text-zinc-300 hover:border-zinc-700 transition"
            >
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">
                {isSupabaseConfigured ? 'Supabase Live' : 'Demo Mode'}
              </span>
              <span className={`w-2 h-2 rounded-full ${isSupabaseConfigured ? 'bg-emerald-400' : 'bg-amber-400'}`} />
            </button>

            {/* Streak Counter */}
            <div className="hidden sm:flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold">
              <Flame className="w-4 h-4 fill-orange-500 text-orange-500" />
              <span>{currentUser.current_streak}d Streak</span>
            </div>

            {/* Bro Nudge Notification Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowNudgeDropdown(!showNudgeDropdown)}
                className="relative p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 transition"
                title="Bro Nudges & Spot Alerts"
              >
                <Bell className="w-4 h-4" />
                {userNudges.length > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-zinc-950">
                    {userNudges.length}
                  </span>
                )}
              </button>

              {showNudgeDropdown && (
                <div 
                  className="absolute right-0 mt-2 w-80 rounded-xl bg-zinc-900 border border-zinc-800 shadow-2xl p-3 z-50"
                  onClick={() => setShowNudgeDropdown(false)}
                >
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-800 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      Bro Nudges
                    </span>
                    <span className="text-[10px] text-zinc-500">
                      {userNudges.length} pending
                    </span>
                  </div>

                  {userNudges.length === 0 ? (
                    <div className="py-4 text-center text-xs text-zinc-500">
                      No active nudges. Your gym partners know you are grinding! 💪
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {userNudges.map((nudge) => (
                        <div
                          key={nudge.id}
                          className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800/80 text-xs"
                        >
                          <div className="flex items-center space-x-2 mb-1.5">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={nudge.from_user.avatar_url}
                              alt={nudge.from_user.full_name}
                              className="w-5 h-5 rounded-full object-cover"
                            />
                            <span className="font-semibold text-white">
                              {nudge.from_user.full_name}
                            </span>
                            <span className="text-[10px] text-zinc-500">
                              {nudge.created_at}
                            </span>
                          </div>
                          <p className="text-zinc-300 italic mb-2">
                            "{nudge.message}"
                          </p>
                          <button
                            onClick={() => onRespondNudge(nudge.id)}
                            className="w-full py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-bold text-[11px] transition"
                          >
                            👊 Tell Bro: "Hit the Gym Today!"
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Log Workout Button */}
            <button
              onClick={onOpenLogWorkout}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-extrabold text-xs shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95"
            >
              <PlusCircle className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden sm:inline">Log Workout</span>
            </button>

            {/* User Switcher (Persona Dropdown) */}
            <div className="relative">
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center space-x-2 p-1 pl-1.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={currentUser.avatar_url}
                  alt={currentUser.full_name}
                  className="w-7 h-7 rounded-lg object-cover ring-1 ring-emerald-500/50"
                />
                <div className="hidden xl:block text-left pr-1">
                  <div className="text-xs font-bold text-white leading-tight">
                    {currentUser.full_name.split(' ')[0]}
                  </div>
                  <div className="text-[10px] text-zinc-400 leading-none">
                    @{currentUser.username}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
              </button>

              {showUserDropdown && (
                <div 
                  className="absolute right-0 mt-2 w-72 rounded-xl bg-zinc-900 border border-zinc-800 shadow-2xl py-2 z-50"
                  onClick={() => setShowUserDropdown(false)}
                >
                  <div className="px-3.5 py-2 border-b border-zinc-800 mb-1">
                    <div className="text-xs font-bold text-white">{currentUser.full_name}</div>
                    <div className="text-[11px] text-zinc-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-emerald-400" />
                      {currentUser.current_location}
                    </div>
                  </div>

                  <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                    Switch Gym Bro Persona
                  </div>

                  {allUsers.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => onSwitchUser(u.id)}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-zinc-800/80 transition ${
                        u.id === currentUser.id ? 'bg-zinc-800/50 text-emerald-400 font-bold' : 'text-zinc-300'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={u.avatar_url}
                          alt={u.full_name}
                          className="w-6 h-6 rounded-md object-cover"
                        />
                        <div>
                          <div>{u.full_name}</div>
                          <div className="text-[10px] text-zinc-500">@{u.username}</div>
                        </div>
                      </div>
                      {u.id === currentUser.id && <Check className="w-4 h-4 text-emerald-400" />}
                    </button>
                  ))}

                  {onLogout && (
                    <div className="pt-1.5 mt-1.5 border-t border-zinc-800 px-1">
                      <button
                        onClick={() => {
                          setShowUserDropdown(false);
                          onLogout();
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 flex items-center gap-2 transition cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Log Out of GymBro</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
