'use client';

import React, { useState } from 'react';
import { 
  UserProfile, 
  Workout 
} from '@/types';
import { 
  Flame, 
  Dumbbell, 
  Trophy, 
  MapPin, 
  Calendar, 
  Edit3, 
  Activity, 
  CheckCircle,
  TrendingUp,
  Award
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Cell, 
  PieChart, 
  Pie 
} from 'recharts';
import { formatWeight } from '@/lib/utils';

interface ProfileViewProps {
  user: UserProfile;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
}

const SPLIT_DISTRIBUTION = [
  { name: 'Push', count: 18, color: '#f97316' },
  { name: 'Pull', count: 15, color: '#38bdf8' },
  { name: 'Legs', count: 14, color: '#10b981' },
  { name: 'Upper', count: 8, color: '#a855f7' },
  { name: 'Arms', count: 6, color: '#ec4899' },
];

const WEEKLY_CONSISTENCY = [
  { day: 'Mon', volume: 14200, hit: true },
  { day: 'Tue', volume: 12500, hit: true },
  { day: 'Wed', volume: 0, hit: false },
  { day: 'Thu', volume: 16800, hit: true },
  { day: 'Fri', volume: 11000, hit: true },
  { day: 'Sat', volume: 18500, hit: true },
  { day: 'Sun', volume: 0, hit: false },
];

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  onUpdateProfile,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [bio, setBio] = useState(user.bio || '');
  const [currentLocation, setCurrentLocation] = useState(user.current_location);
  const [favoriteLift, setFavoriteLift] = useState(user.favorite_lift);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      bio,
      current_location: currentLocation,
      favorite_lift: favoriteLift,
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Profile Banner Card */}
      <div className="p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={user.avatar_url}
              alt={user.full_name}
              className="w-20 h-20 rounded-2xl object-cover ring-2 ring-emerald-500/50 shadow-xl"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-white">{user.full_name}</h1>
                <span className="text-xs text-zinc-500">@{user.username}</span>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold mt-1">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                <span>{user.current_location}</span>
              </div>

              <p className="text-xs text-zinc-300 mt-2 max-w-lg leading-relaxed">
                {user.bio}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs flex items-center gap-2 transition self-start md:self-center"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{isEditing ? 'Cancel Edit' : 'Edit Profile'}</span>
          </button>
        </div>

        {/* Inline Profile Editor */}
        {isEditing && (
          <form onSubmit={handleSaveProfile} className="mt-6 pt-5 border-t border-zinc-800 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase text-zinc-400 mb-1">
                  Current Campus / City & Distance
                </label>
                <input
                  type="text"
                  value={currentLocation}
                  onChange={(e) => setCurrentLocation(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase text-zinc-400 mb-1">
                  Favorite Lift
                </label>
                <input
                  type="text"
                  value={favoriteLift}
                  onChange={(e) => setFavoriteLift(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase text-zinc-400 mb-1">
                Bio & Cues
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={2}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-xs text-white resize-none"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs"
              >
                Save Changes
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-2">
            <span className="uppercase font-bold tracking-wider">Consistency Streak</span>
            <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
          </div>
          <div className="text-2xl font-black text-white">{user.current_streak} Days</div>
          <div className="text-[11px] text-emerald-400 mt-1 font-semibold">Active brotherhood streak</div>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-2">
            <span className="uppercase font-bold tracking-wider">Total Workouts</span>
            <Dumbbell className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white">{user.total_workouts}</div>
          <div className="text-[11px] text-zinc-500 mt-1">Sessions recorded</div>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-2">
            <span className="uppercase font-bold tracking-wider">Big 3 Total</span>
            <Trophy className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400">
            {formatWeight(user.big_three_total_kg || 480)}
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">S/B/D Combined</div>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-2">
            <span className="uppercase font-bold tracking-wider">Hometown Base</span>
            <Award className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-sm font-black text-white truncate">{user.hometown_gym}</div>
          <div className="text-[11px] text-zinc-400 mt-1">Where the bond started</div>
        </div>
      </div>

      {/* Visual Analytics with Recharts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Weekly Consistency Bar Chart */}
        <div className="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 shadow-md">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-bold text-white">This Week's Volume (Kg)</h2>
            </div>
            <span className="text-xs text-zinc-400">5 of 7 days hit</span>
          </div>

          <div className="h-56 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={WEEKLY_CONSISTENCY} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <XAxis dataKey="day" stroke="#71717a" fontSize={11} tickLine={false} />
                <YAxis stroke="#71717a" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#090d16',
                    borderColor: '#27272a',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="volume" radius={[6, 6, 0, 0]}>
                  {WEEKLY_CONSISTENCY.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.hit ? '#10b981' : '#27272a'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Workout Split Distribution */}
        <div className="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 shadow-md">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-sky-400" />
              <h2 className="text-sm font-bold text-white">Workout Split Breakdown</h2>
            </div>
            <span className="text-xs text-zinc-400">Past 60 sessions</span>
          </div>

          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={SPLIT_DISTRIBUTION}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="count"
                >
                  {SPLIT_DISTRIBUTION.map((entry, index) => (
                    <Cell key={`slice-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#090d16',
                    borderColor: '#27272a',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-center gap-4 text-xs font-semibold text-zinc-400 mt-1">
            {SPLIT_DISTRIBUTION.map((s) => (
              <span key={s.name} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                {s.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
