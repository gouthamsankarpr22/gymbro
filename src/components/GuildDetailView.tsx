'use client';

import React, { useState } from 'react';
import { 
  Guild, 
  GuildMember, 
  GuildWar, 
  UserProfile, 
  Friendship 
} from '@/types';
import { 
  ArrowLeft, 
  Shield, 
  Users, 
  Swords, 
  Trophy, 
  History, 
  Activity, 
  UserPlus, 
  LogOut, 
  Edit3, 
  Check, 
  Sparkles,
  Flame,
  Award,
  Crown
} from 'lucide-react';
import { InviteFriendModal } from './InviteFriendModal';
import { CreateWarChallengeModal } from './CreateWarChallengeModal';

interface GuildDetailViewProps {
  guild: Guild;
  members: GuildMember[];
  wars: GuildWar[];
  allGuilds: Guild[];
  friends: UserProfile[];
  currentUser: UserProfile;
  onBack: () => void;
  onSelectWar: (warId: string) => void;
  onLeaveGuild: (guildId: string) => void;
  onSendInvite: (guildId: string, friendId: string) => { success: boolean; error?: string };
  onIssueChallenge: (data: any) => { success: boolean; error?: string };
  onTransferCaptaincy: (guildId: string, newCaptainId: string) => void;
  onUpdateGuild: (guildId: string, updates: any) => void;
}

export const GuildDetailView: React.FC<GuildDetailViewProps> = ({
  guild,
  members,
  wars,
  allGuilds,
  friends,
  currentUser,
  onBack,
  onSelectWar,
  onLeaveGuild,
  onSendInvite,
  onIssueChallenge,
  onTransferCaptaincy,
  onUpdateGuild,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'guild_wars' | 'leaderboards' | 'history'>('overview');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isChallengeModalOpen, setIsChallengeModalOpen] = useState(false);
  const [isEditingGuild, setIsEditingGuild] = useState(false);

  const [editName, setEditName] = useState(guild.name);
  const [editDesc, setEditDesc] = useState(guild.description);

  const isCaptain = guild.captain_id === currentUser.id;
  const isMember = members.some(m => m.user_id === currentUser.id);

  const guildWars = wars.filter(w => w.challenger_guild_id === guild.id || w.opponent_guild_id === guild.id);
  const activeWars = guildWars.filter(w => w.status === 'active' || w.status === 'pending');
  const completedWars = guildWars.filter(w => w.status === 'completed');

  const handleSaveGuildEdit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateGuild(guild.id, { name: editName, description: editDesc });
    setIsEditingGuild(false);
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
          <span>Back to Guilds Hall</span>
        </button>
      </div>

      {/* Guild Hero Header */}
      <div className="p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={guild.emblem_url}
              alt={guild.name}
              className="w-20 h-20 rounded-2xl object-cover ring-2 ring-emerald-500/50 shadow-xl"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-white">{guild.name}</h1>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                  {guild.member_count} Members
                </span>
                {isCaptain && (
                  <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                    <Crown className="w-3 h-3 text-amber-400" /> Captain
                  </span>
                )}
              </div>

              <p className="text-xs text-zinc-300 mt-1 max-w-xl leading-relaxed">
                {guild.description}
              </p>

              <div className="flex items-center gap-4 text-xs text-zinc-400 font-semibold mt-2.5">
                <span>Captain: <span className="text-white">{guild.captain?.full_name || 'Captain'}</span></span>
                <span>•</span>
                <span className="flex items-center gap-1 text-orange-400">
                  <Flame className="w-3.5 h-3.5 fill-orange-500" /> {guild.stats.current_war_streak} War Streak
                </span>
                <span>•</span>
                <span className="font-mono text-[11px] text-zinc-500">Code: {guild.invite_code}</span>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-2 self-start md:self-center">
            {isCaptain && (
              <>
                <button
                  onClick={() => setIsChallengeModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20 transition hover:scale-105 active:scale-95"
                >
                  <Swords className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Declare War</span>
                </button>
                <button
                  onClick={() => setIsInviteModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs flex items-center gap-1.5 transition"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Invite Friend</span>
                </button>
                <button
                  onClick={() => setIsEditingGuild(!isEditingGuild)}
                  className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white transition"
                  title="Edit Guild Info"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </>
            )}

            {isMember && !isCaptain && (
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to leave this Guild?')) {
                    onLeaveGuild(guild.id);
                  }
                }}
                className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-rose-500/20 hover:text-rose-400 text-zinc-400 font-bold text-xs flex items-center gap-1.5 transition"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Leave Guild</span>
              </button>
            )}
          </div>
        </div>

        {/* Inline Edit Form (Captain Only) */}
        {isEditingGuild && (
          <form onSubmit={handleSaveGuildEdit} className="mt-5 pt-4 border-t border-zinc-800 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">Guild Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">Motto / Description</label>
                <input
                  type="text"
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-white"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsEditingGuild(false)}
                className="px-3 py-1 rounded-lg text-xs font-bold text-zinc-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs"
              >
                Save Info
              </button>
            </div>
          </form>
        )}
      </div>

      {/* 5 Tab Navigation as Requested */}
      <div className="flex space-x-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-zinc-800">
        {[
          { id: 'overview', label: 'Overview', icon: Shield },
          { id: 'members', label: `Members (${members.length})`, icon: Users },
          { id: 'guild_wars', label: `Guild Wars (${activeWars.length} Active)`, icon: Swords },
          { id: 'leaderboards', label: 'Leaderboard', icon: Trophy },
          { id: 'history', label: 'War History', icon: History },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700/80'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
              <div className="text-[10px] uppercase font-bold text-zinc-500">Total Wars Fought</div>
              <div className="text-2xl font-black text-white mt-0.5">{guild.stats.total_wars}</div>
              <div className="text-[11px] text-zinc-400 mt-1">
                {guild.stats.consistency_wins + guild.stats.strength_wins} Victories Earned
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
              <div className="text-[10px] uppercase font-bold text-zinc-500">Consistency Record</div>
              <div className="text-2xl font-black text-emerald-400 mt-0.5">{guild.stats.consistency_wins} Wins</div>
              <div className="text-[11px] text-zinc-400 mt-1">Weekly volume battles</div>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
              <div className="text-[10px] uppercase font-bold text-zinc-500">Strength Record</div>
              <div className="text-2xl font-black text-amber-400 mt-0.5">{guild.stats.strength_wins} Wins</div>
              <div className="text-[11px] text-zinc-400 mt-1">PR milestone battles</div>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
              <div className="text-[10px] uppercase font-bold text-zinc-500">War Win Streak</div>
              <div className="text-2xl font-black text-orange-400 mt-0.5">{guild.stats.current_war_streak} Consecutive</div>
              <div className="text-[11px] text-zinc-400 mt-1">Unbroken squad run</div>
            </div>
          </div>

          {/* Active War Teaser Banner if any */}
          {activeWars.length > 0 && (
            <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-950/30 via-zinc-900 to-zinc-950 border border-amber-500/30 flex items-center justify-between flex-wrap gap-4">
              <div>
                <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  CURRENT ACTIVE WAR
                </span>
                <h3 className="text-base font-black text-white mt-1">
                  {guild.name} vs {activeWars[0].challenger_guild_id === guild.id ? activeWars[0].opponent_guild?.name : activeWars[0].challenger_guild?.name}
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Category: {activeWars[0].category === 'consistency' ? 'Workout Consistency' : 'Strength & PR'} • Ends {new Date(activeWars[0].ends_at).toLocaleDateString()}
                </p>
              </div>

              <button
                onClick={() => onSelectWar(activeWars[0].id)}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20 transition"
              >
                <span>Enter War Arena</span>
                <Swords className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            </div>
          )}

          {/* Permanent Achievements Badge Wall */}
          <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              Permanent Guild Achievements
            </h3>
            <div className="flex flex-wrap gap-2">
              {guild.stats.achievements.map((ach, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-bold text-zinc-200 flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  {ach}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MEMBERS */}
      {activeTab === 'members' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase text-zinc-400 tracking-wider">
              Active Brotherhood Roster ({members.length})
            </h3>
            {isCaptain && (
              <button
                onClick={() => setIsInviteModalOpen(true)}
                className="text-xs font-bold text-emerald-400 hover:underline flex items-center gap-1"
              >
                <UserPlus className="w-3.5 h-3.5" />
                Invite Friend
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {members.map(member => {
              const user = member.user;
              const isMemberCaptain = member.role === 'captain';

              return (
                <div
                  key={member.id}
                  className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center space-x-3 truncate">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={user?.avatar_url}
                      alt={user?.full_name}
                      className="w-10 h-10 rounded-xl object-cover ring-1 ring-zinc-700"
                    />
                    <div className="truncate">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-white truncate">{user?.full_name}</span>
                        {isMemberCaptain && (
                          <span className="text-[9px] uppercase font-black px-1.5 rounded bg-amber-500/20 text-amber-300">
                            Captain
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-zinc-400 truncate">
                        @{user?.username} • {user?.current_location}
                      </div>
                    </div>
                  </div>

                  {/* Transfer captaincy (if current user is captain and target is member) */}
                  {isCaptain && !isMemberCaptain && (
                    <button
                      onClick={() => {
                        if (confirm(`Transfer captaincy of ${guild.name} to ${user?.full_name}?`)) {
                          onTransferCaptaincy(guild.id, member.user_id);
                        }
                      }}
                      className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-[10px] whitespace-nowrap transition"
                      title="Make Captain"
                    >
                      Make Captain
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: GUILD WARS */}
      {activeTab === 'guild_wars' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase text-zinc-400 tracking-wider">
              Competitions & Matchups ({guildWars.length})
            </h3>
            {isCaptain && (
              <button
                onClick={() => setIsChallengeModalOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs flex items-center gap-1 transition"
              >
                <Swords className="w-3.5 h-3.5" />
                Declare War
              </button>
            )}
          </div>

          {guildWars.length === 0 ? (
            <div className="p-8 rounded-2xl bg-zinc-900 border border-zinc-800 text-center">
              <Swords className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
              <div className="text-sm font-bold text-white">No Guild Wars on Record</div>
              <p className="text-xs text-zinc-400 mt-1">Issue a 7-day challenge to test your squad against another Guild!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {guildWars.map(war => {
                const opponentGuild = war.challenger_guild_id === guild.id ? war.opponent_guild : war.challenger_guild;
                const isChallenger = war.challenger_guild_id === guild.id;
                const myNormalized = isChallenger ? war.challenger_normalized_score : war.opponent_normalized_score;
                const oppNormalized = isChallenger ? war.opponent_normalized_score : war.challenger_normalized_score;

                return (
                  <div
                    key={war.id}
                    className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-zinc-700 transition"
                  >
                    <div className="flex items-center space-x-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={opponentGuild?.emblem_url}
                        alt={opponentGuild?.name}
                        className="w-12 h-12 rounded-xl object-cover ring-1 ring-zinc-700"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-black text-white">vs {opponentGuild?.name}</span>
                          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                            {war.category}
                          </span>
                          <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                            war.status === 'completed' 
                              ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' 
                              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          }`}>
                            {war.status}
                          </span>
                        </div>
                        <div className="text-xs text-zinc-400 mt-1">
                          Score: <span className="text-emerald-400 font-bold">{myNormalized.toFixed(1)}</span> vs <span className="text-sky-400 font-bold">{oppNormalized.toFixed(1)}</span> normalized
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => onSelectWar(war.id)}
                      className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition whitespace-nowrap"
                    >
                      <span>War Dashboard</span>
                      <Swords className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: LEADERBOARDS */}
      {activeTab === 'leaderboards' && (
        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
          <h3 className="text-xs font-bold uppercase text-zinc-400 tracking-wider">
            Internal Squad Points Contributed
          </h3>
          <div className="space-y-2">
            {members.map((member, index) => (
              <div
                key={member.id}
                className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between text-xs"
              >
                <div className="flex items-center space-x-3">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center font-black text-[10px] ${
                    index === 0 ? 'bg-amber-400 text-zinc-950' : 'bg-zinc-800 text-zinc-400'
                  }`}>
                    #{index + 1}
                  </span>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={member.user?.avatar_url}
                    alt={member.user?.full_name}
                    className="w-7 h-7 rounded-lg object-cover ring-1 ring-zinc-700"
                  />
                  <span className="font-bold text-white">{member.user?.full_name}</span>
                </div>
                <div className="text-right font-black text-emerald-400">
                  {/* Random contribution points display for internal leaderboard */}
                  {(members.length - index) * 35} pts
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: HISTORY */}
      {activeTab === 'history' && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase text-zinc-400 tracking-wider">
            Completed War Archive
          </h3>

          {completedWars.length === 0 ? (
            <div className="p-8 rounded-2xl bg-zinc-900 border border-zinc-800 text-center text-xs text-zinc-500">
              No completed competitions yet. Finish an active war to enshrine it here!
            </div>
          ) : (
            completedWars.map(war => {
              const isWon = war.winner_guild_id === guild.id;
              const opponentGuild = war.challenger_guild_id === guild.id ? war.opponent_guild : war.challenger_guild;

              return (
                <div
                  key={war.id}
                  className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                        isWon ? 'bg-amber-500/20 text-amber-300' : 'bg-zinc-800 text-zinc-400'
                      }`}>
                        {isWon ? 'VICTORY 🏆' : 'RUNNER UP'}
                      </span>
                      <span className="font-bold text-white">vs {opponentGuild?.name}</span>
                      <span className="text-zinc-500">• {war.category}</span>
                    </div>
                    <div className="text-[11px] text-zinc-400 mt-1">
                      Final Normalized: {war.challenger_normalized_score} - {war.opponent_normalized_score} • Completed {war.completed_at ? new Date(war.completed_at).toLocaleDateString() : 'Recently'}
                    </div>
                  </div>

                  <button
                    onClick={() => onSelectWar(war.id)}
                    className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs transition"
                  >
                    View Result
                  </button>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Modals */}
      <InviteFriendModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        guild={guild}
        friends={friends}
        currentMemberUserIds={members.map(m => m.user_id)}
        onSendInvite={onSendInvite}
      />

      <CreateWarChallengeModal
        isOpen={isChallengeModalOpen}
        onClose={() => setIsChallengeModalOpen(false)}
        myGuild={guild}
        availableOpponents={allGuilds}
        onIssueChallenge={onIssueChallenge}
      />
    </div>
  );
};
