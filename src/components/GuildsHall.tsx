'use client';

import React, { useState } from 'react';
import { 
  Guild, 
  GuildWar, 
  GuildInvitation, 
  UserProfile 
} from '@/types';
import { 
  Shield, 
  Plus, 
  Swords, 
  Trophy, 
  Users, 
  Mail, 
  Check, 
  X, 
  Flame, 
  Crown, 
  Sparkles,
  Activity,
  ArrowRight
} from 'lucide-react';
import { CreateGuildModal } from './CreateGuildModal';

interface GuildsHallProps {
  myGuilds: Guild[];
  allGuilds: Guild[];
  wars: GuildWar[];
  invitations: GuildInvitation[];
  currentUser: UserProfile;
  onSelectGuild: (guildId: string) => void;
  onSelectWar: (warId: string) => void;
  onCreateGuild: (data: { name: string; description: string; emblem_url: string }) => { success: boolean; error?: string };
  onRespondInvite: (invitationId: string, accept: boolean) => void;
  onAcceptWarChallenge: (warId: string) => void;
}

export const GuildsHall: React.FC<GuildsHallProps> = ({
  myGuilds,
  allGuilds,
  wars,
  invitations,
  currentUser,
  onSelectGuild,
  onSelectWar,
  onCreateGuild,
  onRespondInvite,
  onAcceptWarChallenge,
}) => {
  const [activeTab, setActiveTab] = useState<'my_guilds' | 'all_guilds' | 'guild_wars' | 'invitations'>('my_guilds');
  const [warCategoryFilter, setWarCategoryFilter] = useState<'all' | 'consistency' | 'strength'>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const pendingInvites = invitations.filter(i => i.status === 'pending');
  const activeWars = wars.filter(w => w.status === 'active' || w.status === 'pending');
  const filteredWars = activeWars.filter(w => {
    if (warCategoryFilter === 'all') return true;
    return w.category === warCategoryFilter;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 border border-zinc-800 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <Shield className="w-3.5 h-3.5" />
                Guild Hall
              </span>
              <span className="text-xs text-zinc-400">Competitive Team Brotherhood</span>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white">
              Unite Your Crew. Wage Guild Wars.
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-2xl leading-relaxed">
              Form private teams from your accepted GymBro friends. Compete in 7-day or 30-day Workout Consistency or Strength & PR wars with fair roster normalization!
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/25 transition hover:scale-105 active:scale-95 whitespace-nowrap"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Found a Guild</span>
            </button>
            {pendingInvites.length > 0 && (
              <button
                onClick={() => setActiveTab('invitations')}
                className="px-3.5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs flex items-center gap-2 border border-zinc-700 transition"
              >
                <Mail className="w-4 h-4 text-emerald-400" />
                <span>{pendingInvites.length} Invites</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="flex space-x-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-zinc-800">
        <button
          onClick={() => setActiveTab('my_guilds')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === 'my_guilds'
              ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Shield className="w-3.5 h-3.5 text-emerald-400" />
          <span>My Guilds ({myGuilds.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('guild_wars')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === 'guild_wars'
              ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Swords className="w-3.5 h-3.5 text-amber-400" />
          <span>Live Guild Wars ({activeWars.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('all_guilds')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === 'all_guilds'
              ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Users className="w-3.5 h-3.5 text-sky-400" />
          <span>All Brotherhood Guilds ({allGuilds.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('invitations')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 relative ${
            activeTab === 'invitations'
              ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Mail className="w-3.5 h-3.5 text-purple-400" />
          <span>Invitations</span>
          {pendingInvites.length > 0 && (
            <span className="w-4 h-4 rounded-full bg-emerald-500 text-[10px] font-black text-zinc-950 flex items-center justify-center">
              {pendingInvites.length}
            </span>
          )}
        </button>
      </div>

      {/* TAB: MY GUILDS */}
      {activeTab === 'my_guilds' && (
        <div className="space-y-4">
          {myGuilds.length === 0 ? (
            <div className="p-8 rounded-2xl bg-zinc-900 border border-zinc-800 text-center space-y-3">
              <Shield className="w-10 h-10 text-zinc-600 mx-auto" />
              <div>
                <h3 className="text-base font-bold text-white">You Haven't Joined a Guild Yet</h3>
                <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
                  Found your own squad with friends or accept an invitation from an accepted GymBro!
                </p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs"
              >
                Found a Guild
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myGuilds.map((guild) => {
                const isCaptain = guild.captain_id === currentUser.id;
                const guildActiveWars = wars.filter(
                  w => (w.status === 'active' || w.status === 'pending') &&
                  (w.challenger_guild_id === guild.id || w.opponent_guild_id === guild.id)
                );

                return (
                  <div
                    key={guild.id}
                    className="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 hover:border-zinc-700 transition shadow-lg flex flex-col justify-between"
                  >
                    <div>
                      {/* Emblem and Name */}
                      <div className="flex items-start space-x-3 mb-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={guild.emblem_url}
                          alt={guild.name}
                          className="w-14 h-14 rounded-2xl object-cover ring-1 ring-zinc-700 shadow-md shrink-0"
                        />
                        <div className="truncate">
                          <div className="flex items-center gap-1.5">
                            <h3 className="text-base font-black text-white truncate">{guild.name}</h3>
                          </div>
                          <div className="text-xs text-zinc-400 mt-0.5 truncate">
                            {guild.member_count} Members • {isCaptain ? 'You are Captain' : `Captain: ${guild.captain?.full_name?.split(' ')[0] || 'Bro'}`}
                          </div>
                          {isCaptain && (
                            <span className="inline-flex items-center gap-1 text-[9px] font-black text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded mt-1">
                              <Crown className="w-2.5 h-2.5" /> Captain
                            </span>
                          )}
                        </div>
                      </div>

                      <p className="text-xs text-zinc-300 line-clamp-2 italic mb-4">
                        "{guild.description}"
                      </p>

                      {/* Stats Overview */}
                      <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-center mb-4">
                        <div>
                          <div className="text-[9px] uppercase font-bold text-zinc-500">Wars Won</div>
                          <div className="text-xs font-black text-white">
                            {guild.stats.consistency_wins + guild.stats.strength_wins}
                          </div>
                        </div>
                        <div>
                          <div className="text-[9px] uppercase font-bold text-zinc-500">Streak</div>
                          <div className="text-xs font-black text-orange-400 flex items-center justify-center gap-0.5">
                            <Flame className="w-3 h-3 fill-orange-500" />
                            {guild.stats.current_war_streak}
                          </div>
                        </div>
                        <div>
                          <div className="text-[9px] uppercase font-bold text-zinc-500">Active War</div>
                          <div className="text-xs font-black text-emerald-400">
                            {guildActiveWars.length > 0 ? 'Active 🔥' : 'None'}
                          </div>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => onSelectGuild(guild.id)}
                      className="w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition"
                    >
                      <span>Enter Guild</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB: GUILD WARS */}
      {activeTab === 'guild_wars' && (
        <div className="space-y-4">
          {/* Category Filter */}
          <div className="flex items-center space-x-2">
            {[
              { id: 'all', label: 'All Categories' },
              { id: 'consistency', label: 'Workout Consistency 🏋️' },
              { id: 'strength', label: 'Strength & PRs 🏆' },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setWarCategoryFilter(f.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  warCategoryFilter === f.id
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {filteredWars.length === 0 ? (
            <div className="p-8 rounded-2xl bg-zinc-900 border border-zinc-800 text-center">
              <Swords className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
              <div className="text-sm font-bold text-white">No Active Guild Wars in this Category</div>
              <p className="text-xs text-zinc-400 mt-1">Captains can challenge any opposing Guild from their Guild page!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredWars.map(war => {
                const challenger = war.challenger_guild;
                const opponent = war.opponent_guild;
                const isPending = war.status === 'pending';
                const isOpponentCaptain = opponent?.captain_id === currentUser.id;

                return (
                  <div
                    key={war.id}
                    className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition shadow-lg space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        war.category === 'consistency'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                      }`}>
                        {war.category === 'consistency' ? 'Consistency War' : 'Strength & PR War'}
                      </span>

                      <span className="text-[11px] text-zinc-400 font-semibold">
                        {isPending ? 'Pending Acceptance' : `${war.duration_days}-Day Active War`}
                      </span>
                    </div>

                    {/* VS Grid */}
                    <div className="grid grid-cols-5 items-center text-center">
                      <div className="col-span-2 flex flex-col items-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={challenger?.emblem_url}
                          alt={challenger?.name}
                          className="w-12 h-12 rounded-xl object-cover ring-1 ring-zinc-700 mb-1"
                        />
                        <div className="text-xs font-bold text-white truncate max-w-[120px]">{challenger?.name}</div>
                        <div className="text-xs font-black text-emerald-400 mt-0.5">
                          {war.challenger_normalized_score.toFixed(1)} norm
                        </div>
                      </div>

                      <div className="col-span-1 flex justify-center">
                        <Swords className="w-5 h-5 text-amber-400 stroke-[2.5]" />
                      </div>

                      <div className="col-span-2 flex flex-col items-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={opponent?.emblem_url}
                          alt={opponent?.name}
                          className="w-12 h-12 rounded-xl object-cover ring-1 ring-zinc-700 mb-1"
                        />
                        <div className="text-xs font-bold text-white truncate max-w-[120px]">{opponent?.name}</div>
                        <div className="text-xs font-black text-sky-400 mt-0.5">
                          {war.opponent_normalized_score.toFixed(1)} norm
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between">
                      {isPending && isOpponentCaptain ? (
                        <div className="w-full flex items-center justify-between gap-2">
                          <span className="text-[11px] text-amber-400 font-bold">Challenge Received!</span>
                          <button
                            onClick={() => onAcceptWarChallenge(war.id)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs"
                          >
                            Accept Challenge
                          </button>
                        </div>
                      ) : (
                        <>
                          <span className="text-[11px] text-zinc-500 font-mono">
                            Frozen: {challenger?.name} vs {opponent?.name}
                          </span>
                          <button
                            onClick={() => onSelectWar(war.id)}
                            className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs transition"
                          >
                            View War Arena
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB: ALL GUILDS */}
      {activeTab === 'all_guilds' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {allGuilds.map((g) => (
            <div
              key={g.id}
              className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center space-x-3 mb-2.5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={g.emblem_url}
                    alt={g.name}
                    className="w-12 h-12 rounded-xl object-cover ring-1 ring-zinc-700"
                  />
                  <div>
                    <h3 className="text-sm font-bold text-white">{g.name}</h3>
                    <div className="text-[10px] text-zinc-400">{g.member_count} Members</div>
                  </div>
                </div>
                <p className="text-xs text-zinc-400 line-clamp-2 mb-3">
                  {g.description}
                </p>
              </div>

              <button
                onClick={() => onSelectGuild(g.id)}
                className="w-full py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs transition"
              >
                Inspect Guild
              </button>
            </div>
          ))}
        </div>
      )}

      {/* TAB: INVITATIONS */}
      {activeTab === 'invitations' && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase text-zinc-400 tracking-wider">
            Pending Guild Invitations from Accepted Friends
          </h3>

          {pendingInvites.length === 0 ? (
            <div className="p-8 rounded-2xl bg-zinc-900 border border-zinc-800 text-center text-xs text-zinc-500">
              No pending invitations right now.
            </div>
          ) : (
            <div className="space-y-3">
              {pendingInvites.map((invite) => (
                <div
                  key={invite.id}
                  className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center space-x-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={invite.guild?.emblem_url}
                      alt={invite.guild?.name}
                      className="w-12 h-12 rounded-xl object-cover ring-1 ring-zinc-700"
                    />
                    <div>
                      <div className="text-sm font-bold text-white">{invite.guild?.name}</div>
                      <div className="text-xs text-zinc-400">
                        Invited by <span className="text-white font-semibold">{invite.inviter?.full_name}</span> (Accepted Friend)
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onRespondInvite(invite.id, false)}
                      className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition"
                      title="Decline"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onRespondInvite(invite.id, true)}
                      className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs flex items-center gap-1.5 transition"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Accept & Join</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      <CreateGuildModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateGuild={onCreateGuild}
      />
    </div>
  );
};
