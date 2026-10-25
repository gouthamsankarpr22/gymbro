'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { BroFeed } from '@/components/BroFeed';
import { PRBoard } from '@/components/PRBoard';
import { SquadRadar } from '@/components/SquadRadar';
import { LockerRoomMemes } from '@/components/LockerRoomMemes';
import { ProfileView } from '@/components/ProfileView';
import { WorkoutLoggerModal } from '@/components/WorkoutLoggerModal';
import { AddPRModal } from '@/components/AddPRModal';
import { SupabaseConfigModal } from '@/components/SupabaseConfigModal';

// Mobile App Shell Components
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { PWAInstallPrompt } from '@/components/PWAInstallPrompt';
import { registerServiceWorker } from '@/lib/mobile-utils';

// Guilds & Guild Wars Components
import { GuildsHall } from '@/components/GuildsHall';
import { GuildDetailView } from '@/components/GuildDetailView';
import { GuildWarDashboard } from '@/components/GuildWarDashboard';

// Authentication Screen
import { AuthScreen } from '@/components/AuthScreen';

import { gymBroStore } from '@/lib/storage';
import { 
  SEED_USERS, 
  SEED_SQUADS, 
  SEED_POSTS, 
  SEED_PRS, 
  SEED_NUDGES 
} from '@/lib/seed-data';
import { 
  UserProfile, 
  Squad, 
  FeedPost, 
  PersonalRecord, 
  BroNudge, 
  ReactionType,
  SplitType,
  WorkoutExercise,
  Guild,
  GuildWar,
  GuildInvitation,
  GuildWarCategory
} from '@/types';
import { 
  Radio, 
  Users, 
  MapPin, 
  ChevronRight,
  Swords,
  Trophy,
  Dumbbell
} from 'lucide-react';
import { formatWeight, triggerPRConfetti } from '@/lib/utils';

export default function Home() {
  const [currentUser, setCurrentUser] = useState<UserProfile>(SEED_USERS[0]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>(SEED_USERS);
  const [squads, setSquads] = useState<Squad[]>(SEED_SQUADS);
  const [activeSquadId, setActiveSquadId] = useState<string>('all');
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [showDemoPosts, setShowDemoPosts] = useState<boolean>(false);
  const [prs, setPrs] = useState<PersonalRecord[]>(SEED_PRS);
  const [nudges, setNudges] = useState<BroNudge[]>(SEED_NUDGES);

  // Guilds state
  const [guilds, setGuilds] = useState<Guild[]>([]);
  const [guildWars, setGuildWars] = useState<GuildWar[]>([]);
  const [invitations, setInvitations] = useState<GuildInvitation[]>([]);
  const [selectedGuildId, setSelectedGuildId] = useState<string | null>(null);
  const [selectedWarId, setSelectedWarId] = useState<string | null>(null);

  // Modals & Navigation state
  const [activeTab, setActiveTab] = useState<'feed' | 'prs' | 'guilds' | 'radar' | 'memes' | 'profile'>('feed');
  const [isLogWorkoutOpen, setIsLogWorkoutOpen] = useState(false);
  const [isAddPROpen, setIsAddPROpen] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);

  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isClientReady, setIsClientReady] = useState<boolean>(false);

  // Initialize store, service worker, and sync persisted data on client
  useEffect(() => {
    gymBroStore.init();
    setIsAuthenticated(gymBroStore.isLoggedIn());
    setIsClientReady(true);
    refreshAllData();
    registerServiceWorker();

    // Check for PWA shortcuts or deep links in URL
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const action = params.get('action');
      const tab = params.get('tab');
      if (action === 'log') {
        setIsLogWorkoutOpen(true);
      }
      if (tab && ['feed', 'prs', 'guilds', 'radar', 'memes', 'profile'].includes(tab)) {
        setActiveTab(tab as 'feed' | 'prs' | 'guilds' | 'radar' | 'memes' | 'profile');
      }
    }
  }, []);

  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    refreshAllData();
  };

  const handleLogin = (identifier: string, pass: string) => {
    return gymBroStore.login(identifier, pass);
  };

  const handleRegister = (data: { full_name: string; email: string; phone: string; age: number; password: string }) => {
    return gymBroStore.register(data);
  };

  const handleLogout = () => {
    gymBroStore.logout();
    setIsAuthenticated(false);
  };

  const refreshAllData = () => {
    const user = gymBroStore.getCurrentUser();
    setCurrentUser(user);
    setAllUsers(gymBroStore.getAllUsers());
    setSquads(gymBroStore.getSquads());
    setPosts(gymBroStore.getFeedPosts(activeSquadId, showDemoPosts));
    setPrs(gymBroStore.getPersonalRecords());
    setNudges(gymBroStore.getNudges());
    setGuilds(gymBroStore.getGuilds());
    setGuildWars(gymBroStore.getGuildWars());
    setInvitations(gymBroStore.getUserGuildInvitations(user.id));
  };

  const handleToggleDemoPosts = (show: boolean) => {
    setShowDemoPosts(show);
    setPosts(gymBroStore.getFeedPosts(activeSquadId, show));
  };

  const handleSwitchUser = (userId: string) => {
    const user = gymBroStore.switchUser(userId);
    setCurrentUser(user);
    refreshAllData();
  };

  const handleSelectSquad = (id: string) => {
    setActiveSquadId(id);
    setPosts(gymBroStore.getFeedPosts(id, showDemoPosts));
  };

  const handleToggleReaction = (postId: string, reaction: ReactionType) => {
    const updated = gymBroStore.toggleReaction(postId, reaction);
    setPosts(updated);
  };

  const handleAddComment = (postId: string, content: string) => {
    gymBroStore.addComment(postId, content);
    setPosts(gymBroStore.getFeedPosts(activeSquadId, showDemoPosts));
  };

  const handleSaveWorkout = (workoutData: {
    title: string;
    split: SplitType;
    duration_minutes: number;
    notes?: string;
    photo_url?: string;
    energy_rating: number;
    exercises: WorkoutExercise[];
    postToFeed?: boolean;
    squad_id?: string;
  }) => {
    gymBroStore.logWorkout(workoutData);
    refreshAllData();
  };

  const handleSavePR = (prData: {
    exercise_name: string;
    weight_kg: number;
    reps: number;
    proof_media_url?: string;
    shoutout_note?: string;
  }) => {
    gymBroStore.addPersonalRecord(prData);
    refreshAllData();
  };

  const handleSendNudge = (toUserId: string, message: string) => {
    gymBroStore.sendNudge(toUserId, message);
    setNudges(gymBroStore.getNudges());
  };

  const handleRespondNudge = (nudgeId: string) => {
    gymBroStore.updateNudgeStatus(nudgeId, 'hit_gym');
    setNudges(gymBroStore.getNudges());
    triggerPRConfetti();
  };

  const handlePostMeme = (content: string, mediaUrl: string) => {
    gymBroStore.createFeedPost({
      content,
      type: 'meme',
      media_url: mediaUrl,
      squad_id: activeSquadId === 'all' ? undefined : activeSquadId,
    });
    setPosts(gymBroStore.getFeedPosts(activeSquadId));
  };

  const handleQuickPost = (content: string) => {
    gymBroStore.createFeedPost({
      content,
      type: 'announcement',
      squad_id: activeSquadId === 'all' ? undefined : activeSquadId,
    });
    setPosts(gymBroStore.getFeedPosts(activeSquadId));
  };

  const handleUpdateProfile = (updated: Partial<UserProfile>) => {
    const updatedProfile = gymBroStore.updateUserProfile(updated);
    setCurrentUser(updatedProfile);
    refreshAllData();
  };

  const handleResetData = () => {
    gymBroStore.resetToDefaults();
    refreshAllData();
  };

  // Guild Actions
  const handleSelectGuild = (guildId: string) => {
    setSelectedGuildId(guildId);
    setSelectedWarId(null);
  };

  const handleSelectWar = (warId: string) => {
    setSelectedWarId(warId);
  };

  const handleCreateGuild = (data: {
    name: string;
    description: string;
    emblem_url: string;
  }): { success: boolean; error?: string } => {
    const result = gymBroStore.createGuild(data);
    refreshAllData();
    if (result.success && result.guild) {
      setSelectedGuildId(result.guild.id);
    }
    return result;
  };

  const handleLeaveGuild = (guildId: string) => {
    gymBroStore.leaveGuild(guildId, currentUser.id);
    setSelectedGuildId(null);
    refreshAllData();
  };

  const handleTransferCaptaincy = (guildId: string, newCaptainId: string) => {
    gymBroStore.transferCaptaincy(guildId, currentUser.id, newCaptainId);
    refreshAllData();
  };

  const handleUpdateGuild = (guildId: string, updates: { name?: string; description?: string; emblem_url?: string }) => {
    gymBroStore.updateGuild(guildId, updates);
    refreshAllData();
  };

  const handleSendGuildInvite = (guildId: string, friendId: string): { success: boolean; error?: string } => {
    const result = gymBroStore.sendGuildInvitation(guildId, friendId);
    refreshAllData();
    return result;
  };

  const handleRespondGuildInvite = (invitationId: string, accept: boolean) => {
    gymBroStore.respondGuildInvitation(invitationId, accept);
    refreshAllData();
  };

  const handleCreateWarChallenge = (data: {
    challengerGuildId: string;
    opponentGuildId: string;
    category: GuildWarCategory;
    durationDays: 7 | 30;
  }): { success: boolean; error?: string } => {
    const result = gymBroStore.createGuildWarChallenge(data);
    refreshAllData();
    if (result.success && result.war) {
      setSelectedWarId(result.war.id);
    }
    return result;
  };

  const handleAcceptWarChallenge = (warId: string) => {
    gymBroStore.respondGuildWarChallenge(warId, true);
    refreshAllData();
  };

  const handleFinalizeWar = (warId: string) => {
    gymBroStore.finalizeWar(warId);
    refreshAllData();
  };

  const activeSquad = squads.find((s) => s.id === activeSquadId) || squads[0];

  // Helper lookups for Guild subviews
  const currentSelectedGuild = selectedGuildId ? guilds.find((g) => g.id === selectedGuildId) : null;
  const currentSelectedWar = selectedWarId ? guildWars.find((w) => w.id === selectedWarId) : null;

  // Widescreen view when drilling into a war dashboard or guild detail
  const isGuildSubView = activeTab === 'guilds' && (selectedWarId !== null || selectedGuildId !== null);

  // My Guilds filter
  const myGuilds = guilds.filter((g) =>
    gymBroStore.getGuildMembers(g.id).some((m) => m.user_id === currentUser.id)
  );

  if (!isClientReady) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-white p-4">
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mb-4 animate-pulse shadow-lg shadow-emerald-500/20">
          <Dumbbell className="w-7 h-7" />
        </div>
        <div className="text-sm font-black tracking-wider uppercase text-zinc-300">
          Loading GymBro...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <AuthScreen
        onLoginSuccess={handleLoginSuccess}
        allUsers={allUsers}
        onLogin={handleLogin}
        onRegister={handleRegister}
      />
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col selection:bg-emerald-500 selection:text-zinc-950">
      {/* Sticky Header */}
      <Navbar
        currentUser={currentUser}
        allUsers={allUsers}
        squads={squads}
        activeSquadId={activeSquadId}
        onSelectSquad={handleSelectSquad}
        onSwitchUser={handleSwitchUser}
        onOpenLogWorkout={() => setIsLogWorkoutOpen(true)}
        onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
        nudges={nudges}
        onRespondNudge={handleRespondNudge}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
      />

      {/* Main App Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 pb-[calc(env(safe-area-inset-bottom,0px)+7.5rem)] lg:pb-8">
        {isGuildSubView ? (
          /* Full-width view for Guild Detail & War Dashboard */
          <div className="w-full">
            {selectedWarId && currentSelectedWar ? (
              <GuildWarDashboard
                war={currentSelectedWar}
                contributions={gymBroStore.getWarContributions(currentSelectedWar.id)}
                participants={gymBroStore.getWarParticipants(currentSelectedWar.id)}
                currentUser={currentUser}
                onBack={() => setSelectedWarId(null)}
                onFinalizeWar={handleFinalizeWar}
              />
            ) : selectedGuildId && currentSelectedGuild ? (
              <GuildDetailView
                guild={currentSelectedGuild}
                members={gymBroStore.getGuildMembers(currentSelectedGuild.id)}
                wars={guildWars}
                allGuilds={guilds}
                friends={gymBroStore.getAcceptedFriends(currentUser.id)}
                currentUser={currentUser}
                onBack={() => setSelectedGuildId(null)}
                onSelectWar={handleSelectWar}
                onLeaveGuild={handleLeaveGuild}
                onSendInvite={handleSendGuildInvite}
                onIssueChallenge={handleCreateWarChallenge}
                onTransferCaptaincy={handleTransferCaptaincy}
                onUpdateGuild={handleUpdateGuild}
              />
            ) : null}
          </div>
        ) : (
          /* Standard 2-column layout with Brotherhood Sidebar */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Main Content Area (Tabs) */}
            <div className="lg:col-span-8">
              {activeTab === 'feed' && (
                <BroFeed
                  posts={posts}
                  currentUser={currentUser}
                  onToggleReaction={handleToggleReaction}
                  onAddComment={handleAddComment}
                  onOpenLogWorkout={() => setIsLogWorkoutOpen(true)}
                  onOpenMemeModal={() => setActiveTab('memes')}
                  onOpenPRModal={() => setIsAddPROpen(true)}
                  onCreateQuickPost={handleQuickPost}
                  showDemoPosts={showDemoPosts}
                  onToggleDemoPosts={handleToggleDemoPosts}
                />
              )}

              {activeTab === 'guilds' && (
                <GuildsHall
                  myGuilds={myGuilds}
                  allGuilds={guilds}
                  wars={guildWars}
                  invitations={invitations}
                  currentUser={currentUser}
                  onSelectGuild={handleSelectGuild}
                  onSelectWar={handleSelectWar}
                  onCreateGuild={handleCreateGuild}
                  onRespondInvite={handleRespondGuildInvite}
                  onAcceptWarChallenge={handleAcceptWarChallenge}
                />
              )}

              {activeTab === 'prs' && (
                <PRBoard
                  prs={prs}
                  allUsers={allUsers}
                  currentUser={currentUser}
                  onOpenAddPR={() => setIsAddPROpen(true)}
                />
              )}

              {activeTab === 'radar' && (
                <SquadRadar
                  allUsers={allUsers}
                  currentUser={currentUser}
                  nudges={nudges}
                  onSendNudge={handleSendNudge}
                  onRespondNudge={handleRespondNudge}
                />
              )}

              {activeTab === 'memes' && (
                <LockerRoomMemes
                  posts={posts}
                  currentUser={currentUser}
                  onPostMeme={handlePostMeme}
                  onToggleReaction={handleToggleReaction}
                  onAddComment={handleAddComment}
                />
              )}

              {activeTab === 'profile' && (
                <ProfileView
                  user={currentUser}
                  onUpdateProfile={handleUpdateProfile}
                  onLogout={handleLogout}
                />
              )}
            </div>

            {/* Right Sidebar: Brotherhood Quick Hub */}
            <aside className="lg:col-span-4 space-y-6">
              {/* Active Guild War Highlight Card */}
              {(() => {
                const userActiveWar = guildWars.find(
                  (w) =>
                    w.status === 'active' &&
                    (w.challenger_guild?.captain_id === currentUser.id ||
                      w.opponent_guild?.captain_id === currentUser.id ||
                      gymBroStore.getWarParticipants(w.id).some((p) => p.user_id === currentUser.id))
                ) || guildWars.find((w) => w.status === 'active');

                if (!userActiveWar) return null;

                const cNorm = userActiveWar.challenger_normalized_score || 0;
                const oNorm = userActiveWar.opponent_normalized_score || 0;

                return (
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-zinc-900 to-zinc-950 border border-emerald-500/40 shadow-lg relative overflow-hidden group">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                        <Swords className="w-3.5 h-3.5" />
                        Live Guild War Matchup
                      </span>
                      <button
                        onClick={() => {
                          setActiveTab('guilds');
                          handleSelectWar(userActiveWar.id);
                        }}
                        className="text-xs font-bold text-emerald-400 hover:underline flex items-center gap-0.5"
                      >
                        Enter Arena <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between py-2 border-y border-zinc-800/80 mb-3">
                      <div className="flex items-center space-x-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={userActiveWar.challenger_guild?.emblem_url}
                          alt={userActiveWar.challenger_guild?.name || 'Challenger'}
                          className="w-7 h-7 rounded-lg object-cover ring-1 ring-zinc-700"
                        />
                        <div>
                          <div className="text-xs font-bold text-white truncate max-w-[90px]">
                            {userActiveWar.challenger_guild?.name}
                          </div>
                          <div className="text-[11px] font-extrabold text-emerald-400">
                            {cNorm.toFixed(1)} pts
                          </div>
                        </div>
                      </div>

                      <div className="text-[10px] font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                        VS
                      </div>

                      <div className="flex items-center space-x-2 text-right">
                        <div>
                          <div className="text-xs font-bold text-white truncate max-w-[90px]">
                            {userActiveWar.opponent_guild?.name}
                          </div>
                          <div className="text-[11px] font-extrabold text-emerald-400">
                            {oNorm.toFixed(1)} pts
                          </div>
                        </div>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={userActiveWar.opponent_guild?.emblem_url}
                          alt={userActiveWar.opponent_guild?.name || 'Opponent'}
                          className="w-7 h-7 rounded-lg object-cover ring-1 ring-zinc-700"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-zinc-400">
                      <span>{userActiveWar.category === 'consistency' ? '🏃 Consistency War' : '💥 Strength & PR War'}</span>
                      <span className="text-emerald-400 font-semibold">Active Round</span>
                    </div>
                  </div>
                );
              })()}

              {/* Squad Radar Snapshot */}
              <div className="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 shadow-md">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-3.5">
                  <div className="flex items-center space-x-2">
                    <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                    <span className="text-xs font-bold uppercase tracking-wider text-white">
                      Squad Live Radar
                    </span>
                  </div>
                  <button
                    onClick={() => setActiveTab('radar')}
                    className="text-xs font-bold text-emerald-400 hover:underline flex items-center gap-0.5"
                  >
                    View All <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-3">
                  {allUsers.slice(0, 4).map((user) => {
                    const isCurrentUser = user.id === currentUser.id;

                    return (
                      <div
                        key={user.id}
                        className="flex items-center justify-between text-xs p-2 rounded-xl bg-zinc-950/60 border border-zinc-800/60 hover:border-zinc-700 transition"
                      >
                        <div className="flex items-center space-x-2.5 truncate pr-2">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={user.avatar_url}
                            alt={user.full_name}
                            className="w-7 h-7 rounded-lg object-cover ring-1 ring-zinc-700"
                          />
                          <div className="truncate">
                            <div className="font-bold text-white truncate flex items-center gap-1">
                              {user.full_name.split(' ')[0]}
                              {isCurrentUser && (
                                <span className="text-[9px] uppercase px-1 rounded bg-emerald-500/20 text-emerald-400 font-extrabold">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-zinc-500 truncate flex items-center gap-1">
                              <MapPin className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
                              {user.current_location.split('(')[0]}
                            </div>
                          </div>
                        </div>

                        <div className="shrink-0 text-right">
                          {user.status === 'at_the_gym' && (
                            <span className="text-[10px] font-extrabold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                              At Gym 🏋️
                            </span>
                          )}
                          {user.status === 'pumped' && (
                            <span className="text-[10px] font-bold text-sky-400 bg-sky-500/10 px-1.5 py-0.5 rounded">
                              Hit Today ✓
                            </span>
                          )}
                          {user.status === 'resting' && (
                            <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">
                              Resting 💤
                            </span>
                          )}
                          {user.status === 'needs_motivation' && (
                            <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded">
                              Needs Nudge ⚠️
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Top Squad PR Highlight */}
              <div className="p-5 rounded-2xl bg-gradient-to-b from-amber-500/10 via-zinc-900 to-zinc-950 border border-amber-500/30 shadow-md">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <Trophy className="w-3.5 h-3.5" />
                    Iron Wall Highlight
                  </span>
                  <button
                    onClick={() => setActiveTab('prs')}
                    className="text-xs font-bold text-amber-400 hover:underline"
                  >
                    Leaderboard
                  </button>
                </div>

                {prs[0] && (
                  <div className="space-y-2">
                    <div className="text-base font-black text-white">
                      {prs[0].exercise_name}: {formatWeight(prs[0].weight_kg)}
                    </div>
                    <div className="text-xs text-zinc-300">
                      Smashed by <span className="text-amber-400 font-bold">{prs[0].user?.full_name || 'Alex'}</span>
                    </div>
                    {prs[0].shoutout_note && (
                      <p className="text-[11px] text-zinc-400 italic bg-zinc-950/70 p-2 rounded-lg border border-zinc-800">
                        "{prs[0].shoutout_note}"
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Active Squad Details & Invite Card */}
              <div className="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 shadow-md">
                <div className="flex items-center space-x-2.5 mb-2.5">
                  <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">{activeSquad.name}</div>
                    <div className="text-[10px] text-zinc-400">{activeSquad.member_count} connected gym partners</div>
                  </div>
                </div>

                <p className="text-xs text-zinc-400 mb-3.5 leading-relaxed">
                  {activeSquad.description}
                </p>

                <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-zinc-500">Squad Invite Code</div>
                    <div className="text-xs font-black text-emerald-400 font-mono tracking-widest">
                      {activeSquad.invite_code}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(activeSquad.invite_code);
                      alert(`Invite code ${activeSquad.invite_code} copied! Send to your gym partner.`);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs transition"
                  >
                    Copy Code
                  </button>
                </div>
              </div>

              {/* Accountability Quote */}
              <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800/80 text-center space-y-1.5">
                <div className="text-sm">🏋️‍♂️ 💬</div>
                <p className="text-xs text-zinc-300 font-medium italic">
                  "We may not share the same barbell rack today, but the standard we set together never drops."
                </p>
                <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pt-1">
                  — GymBro Brotherhood
                </div>
              </div>
            </aside>
          </div>
        )}
      </main>

      {/* Modals */}
      <WorkoutLoggerModal
        isOpen={isLogWorkoutOpen}
        onClose={() => setIsLogWorkoutOpen(false)}
        onSaveWorkout={handleSaveWorkout}
        activeSquadId={activeSquadId}
      />

      <AddPRModal
        isOpen={isAddPROpen}
        onClose={() => setIsAddPROpen(false)}
        onSavePR={handleSavePR}
      />

      <SupabaseConfigModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
        onResetData={handleResetData}
      />

      {/* PWA Home Screen Installation Prompt */}
      <PWAInstallPrompt />

      {/* Native Mobile Bottom Navigation Bar */}
      <MobileBottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenLogWorkout={() => setIsLogWorkoutOpen(true)}
        hasActiveWar={guildWars.some((w) => w.status === 'active')}
        pendingNudgesCount={nudges.filter((n) => n.to_user_id === currentUser.id && n.status === 'pending').length}
        currentUser={currentUser}
        onLogout={handleLogout}
      />
    </div>
  );
}
