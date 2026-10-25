import { 
  UserProfile, 
  Squad, 
  FeedPost, 
  PersonalRecord, 
  Workout, 
  BroNudge, 
  ReactionType,
  PostComment,
  Guild,
  GuildMember,
  GuildInvitation,
  GuildWar,
  GuildWarCategory,
  GuildWarStatus,
  GuildWarParticipant,
  GuildWarContribution,
  GuildWarResult,
  Friendship
} from '@/types';
import { 
  SEED_USERS, 
  SEED_SQUADS, 
  SEED_POSTS, 
  SEED_PRS, 
  SEED_NUDGES 
} from './seed-data';
import {
  SEED_GUILDS,
  SEED_GUILD_MEMBERS,
  SEED_GUILD_INVITATIONS,
  SEED_GUILD_WARS,
  SEED_WAR_PARTICIPANTS,
  SEED_WAR_CONTRIBUTIONS,
  SEED_FRIENDSHIPS
} from './seed-guilds';
import { isSupabaseConfigured, getSupabase } from './supabase/client';
import { calculateOneRepMax } from './utils';
import { 
  evaluateWorkoutContribution, 
  evaluatePRContribution, 
  calculateGuildWarScores, 
  finalizeGuildWar, 
  DEFAULT_SCORING_POLICIES 
} from './scoring-engine';

const STORAGE_KEYS = {
  CURRENT_USER: 'gymbro_current_user',
  USERS: 'gymbro_users',
  POSTS: 'gymbro_posts',
  PRS: 'gymbro_prs',
  SQUADS: 'gymbro_squads',
  NUDGES: 'gymbro_nudges',
  // Guilds & Wars keys
  GUILDS: 'gymbro_guilds',
  GUILD_MEMBERS: 'gymbro_guild_members',
  GUILD_INVITATIONS: 'gymbro_guild_invitations',
  GUILD_WARS: 'gymbro_guild_wars',
  WAR_PARTICIPANTS: 'gymbro_war_participants',
  WAR_CONTRIBUTIONS: 'gymbro_war_contributions',
  FRIENDSHIPS: 'gymbro_friendships',
  AUTH_SESSION: 'gymbro_auth_session',
};

// Client-safe storage helper
class GymBroStore {
  private isClient = typeof window !== 'undefined';

  private getItem<T>(key: string, fallback: T): T {
    if (!this.isClient) return fallback;
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : fallback;
    } catch {
      return fallback;
    }
  }

  private setItem<T>(key: string, value: T): void {
    if (!this.isClient) return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }

  public init() {
    if (!this.isClient) return;
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      this.setItem(STORAGE_KEYS.USERS, SEED_USERS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.CURRENT_USER)) {
      this.setItem(STORAGE_KEYS.CURRENT_USER, SEED_USERS[0]);
    }
    if (!localStorage.getItem(STORAGE_KEYS.POSTS)) {
      this.setItem(STORAGE_KEYS.POSTS, SEED_POSTS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.PRS)) {
      this.setItem(STORAGE_KEYS.PRS, SEED_PRS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.SQUADS)) {
      this.setItem(STORAGE_KEYS.SQUADS, SEED_SQUADS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.NUDGES)) {
      this.setItem(STORAGE_KEYS.NUDGES, SEED_NUDGES);
    }
    // Initialize Guilds & Wars
    if (!localStorage.getItem(STORAGE_KEYS.GUILDS)) {
      this.setItem(STORAGE_KEYS.GUILDS, SEED_GUILDS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.GUILD_MEMBERS)) {
      this.setItem(STORAGE_KEYS.GUILD_MEMBERS, SEED_GUILD_MEMBERS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.GUILD_INVITATIONS)) {
      this.setItem(STORAGE_KEYS.GUILD_INVITATIONS, SEED_GUILD_INVITATIONS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.GUILD_WARS)) {
      this.setItem(STORAGE_KEYS.GUILD_WARS, SEED_GUILD_WARS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.WAR_PARTICIPANTS)) {
      this.setItem(STORAGE_KEYS.WAR_PARTICIPANTS, SEED_WAR_PARTICIPANTS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.WAR_CONTRIBUTIONS)) {
      this.setItem(STORAGE_KEYS.WAR_CONTRIBUTIONS, SEED_WAR_CONTRIBUTIONS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.FRIENDSHIPS)) {
      this.setItem(STORAGE_KEYS.FRIENDSHIPS, SEED_FRIENDSHIPS);
    }
  }

  // --- Authentication & Session ---
  public isLoggedIn(): boolean {
    return this.getItem<boolean>(STORAGE_KEYS.AUTH_SESSION, false);
  }

  public login(identifier: string, password: string): { success: boolean; user?: UserProfile; error?: string } {
    const trimmed = identifier.trim().toLowerCase();
    const users = this.getAllUsers();
    const cleanDigits = identifier.replace(/\D/g, '');

    const user = users.find(u => 
      (u.email && u.email.toLowerCase() === trimmed) ||
      (u.phone && cleanDigits.length >= 7 && u.phone.replace(/\D/g, '').endsWith(cleanDigits)) ||
      (u.username && u.username.toLowerCase() === trimmed)
    );

    if (!user) {
      return { success: false, error: 'No GymBro account found with this email, phone, or username' };
    }

    const expectedPassword = user.password || 'gymbro123';
    if (password !== expectedPassword) {
      return { success: false, error: 'Incorrect password. Please try again.' };
    }

    this.setCurrentUser(user);
    this.setItem(STORAGE_KEYS.AUTH_SESSION, true);
    return { success: true, user };
  }

  public register(data: { full_name: string; email: string; phone: string; age: number; password: string }): { success: boolean; user?: UserProfile; error?: string } {
    const fullName = data.full_name.trim();
    const email = data.email.trim().toLowerCase();
    const phone = data.phone.trim();
    const age = Number(data.age);
    const password = data.password;

    if (!fullName || fullName.length < 2) {
      return { success: false, error: 'Please enter your full name (at least 2 characters)' };
    }
    if (!email || !email.includes('@') || !email.includes('.')) {
      return { success: false, error: 'Please enter a valid email address' };
    }
    const cleanPhoneDigits = phone.replace(/\D/g, '');
    if (!phone || cleanPhoneDigits.length < 7) {
      return { success: false, error: 'Please enter a valid phone number (at least 7 digits)' };
    }
    if (!age || age < 13 || age > 120) {
      return { success: false, error: 'Please enter a valid age (must be at least 13)' };
    }
    if (!password || password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long' };
    }

    const users = this.getAllUsers();
    if (users.some(u => u.email && u.email.toLowerCase() === email)) {
      return { success: false, error: 'An account with this email already exists. Please log in.' };
    }
    if (users.some(u => u.phone && u.phone.replace(/\D/g, '').endsWith(cleanPhoneDigits))) {
      return { success: false, error: 'An account with this phone number already exists. Please log in.' };
    }

    const username = fullName.toLowerCase().replace(/[^a-z0-9]/g, '_') + '_' + Math.floor(100 + Math.random() * 900);
    const newUser: UserProfile = {
      id: `user-${Date.now()}`,
      username,
      full_name: fullName,
      avatar_url: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80`,
      email,
      phone,
      age,
      password,
      bio: `Lifting heavy and grinding daily with the GymBro squad 🏋️‍♂️`,
      hometown_gym: 'Metro Iron Club',
      current_location: 'Hometown Gym',
      current_streak: 1,
      total_workouts: 0,
      favorite_lift: 'Barbell Bench Press',
      big_three_total_kg: 0,
      status: 'pumped',
    };

    this.setItem(STORAGE_KEYS.USERS, [newUser, ...users]);
    this.setCurrentUser(newUser);
    this.setItem(STORAGE_KEYS.AUTH_SESSION, true);

    // Auto-befriend initial seed users so new user immediately has GymBro friends to invite to Guilds
    const friendships = this.getItem<Friendship[]>(STORAGE_KEYS.FRIENDSHIPS, SEED_FRIENDSHIPS);
    const newFriendships: Friendship[] = SEED_USERS.map((su, idx) => ({
      id: `friend-${Date.now()}-${idx}`,
      user_id: newUser.id,
      friend_id: su.id,
      status: 'accepted' as const,
      created_at: new Date().toISOString(),
    }));
    this.setItem(STORAGE_KEYS.FRIENDSHIPS, [...newFriendships, ...friendships]);

    return { success: true, user: newUser };
  }

  public logout(): void {
    this.setItem(STORAGE_KEYS.AUTH_SESSION, false);
  }

  // --- Users ---
  public getCurrentUser(): UserProfile {
    return this.getItem<UserProfile>(STORAGE_KEYS.CURRENT_USER, SEED_USERS[0]);
  }

  public setCurrentUser(user: UserProfile): void {
    this.setItem(STORAGE_KEYS.CURRENT_USER, user);
  }

  public switchUser(userId: string): UserProfile {
    const users = this.getAllUsers();
    const user = users.find((u) => u.id === userId) || users[0];
    this.setCurrentUser(user);
    return user;
  }

  public getAllUsers(): UserProfile[] {
    return this.getItem<UserProfile[]>(STORAGE_KEYS.USERS, SEED_USERS);
  }

  public updateUserProfile(updated: Partial<UserProfile>): UserProfile {
    const current = this.getCurrentUser();
    const newProfile = { ...current, ...updated };
    this.setCurrentUser(newProfile);

    const users = this.getAllUsers().map((u) => (u.id === current.id ? newProfile : u));
    this.setItem(STORAGE_KEYS.USERS, users);
    return newProfile;
  }

  // --- Friendships ---
  public getFriends(userId: string): UserProfile[] {
    const friendships = this.getItem<Friendship[]>(STORAGE_KEYS.FRIENDSHIPS, SEED_FRIENDSHIPS);
    const users = this.getAllUsers();
    const acceptedFriendsIds = friendships
      .filter(f => f.status === 'accepted' && (f.user_id === userId || f.friend_id === userId))
      .map(f => f.user_id === userId ? f.friend_id : f.user_id);
    
    return users.filter(u => acceptedFriendsIds.includes(u.id));
  }

  public getAcceptedFriends(userId: string): UserProfile[] {
    return this.getFriends(userId);
  }

  public isFriend(userId: string, targetId: string): boolean {
    if (userId === targetId) return true;
    const friendships = this.getItem<Friendship[]>(STORAGE_KEYS.FRIENDSHIPS, SEED_FRIENDSHIPS);
    return friendships.some(
      f => f.status === 'accepted' && 
      ((f.user_id === userId && f.friend_id === targetId) || (f.user_id === targetId && f.friend_id === userId))
    );
  }

  // --- Squads ---
  public getSquads(): Squad[] {
    return this.getItem<Squad[]>(STORAGE_KEYS.SQUADS, SEED_SQUADS);
  }

  // --- Feed Posts ---
  public getFeedPosts(squadId?: string): FeedPost[] {
    const posts = this.getItem<FeedPost[]>(STORAGE_KEYS.POSTS, SEED_POSTS);
    if (squadId && squadId !== 'all') {
      return posts.filter((p) => p.squad_id === squadId);
    }
    return posts;
  }

  public createFeedPost(data: {
    content: string;
    type: FeedPost['type'];
    media_url?: string;
    workout?: Workout;
    pr?: PersonalRecord;
    squad_id?: string;
  }): FeedPost {
    const user = this.getCurrentUser();
    const squads = this.getSquads();
    const squad = squads.find((s) => s.id === data.squad_id) || squads[0];

    const newPost: FeedPost = {
      id: `post-${Date.now()}`,
      user_id: user.id,
      user,
      squad_id: squad?.id,
      squad_name: squad?.name,
      type: data.type,
      content: data.content,
      media_url: data.media_url,
      workout: data.workout,
      pr: data.pr,
      reactions: { fist_bump: 0, fire: 0, heavy: 0, hype: 0, skull: 0 },
      user_reactions: [],
      comments_count: 0,
      comments: [],
      created_at: 'Just now',
    };

    const currentPosts = this.getFeedPosts();
    const updated = [newPost, ...currentPosts];
    this.setItem(STORAGE_KEYS.POSTS, updated);

    return newPost;
  }

  public toggleReaction(postId: string, reactionType: ReactionType): FeedPost[] {
    const posts = this.getFeedPosts();
    const updated = posts.map((post) => {
      if (post.id !== postId) return post;
      const hasReacted = post.user_reactions.includes(reactionType);
      const newReactions = { ...post.reactions };
      let newUserReactions = [...post.user_reactions];

      if (hasReacted) {
        newReactions[reactionType] = Math.max(0, (newReactions[reactionType] || 1) - 1);
        newUserReactions = newUserReactions.filter((r) => r !== reactionType);
      } else {
        newReactions[reactionType] = (newReactions[reactionType] || 0) + 1;
        newUserReactions.push(reactionType);
      }

      return { ...post, reactions: newReactions, user_reactions: newUserReactions };
    });

    this.setItem(STORAGE_KEYS.POSTS, updated);
    return updated;
  }

  public addComment(postId: string, content: string): PostComment {
    const user = this.getCurrentUser();
    const newComment: PostComment = {
      id: `comm-${Date.now()}`,
      post_id: postId,
      user_id: user.id,
      user,
      content,
      created_at: 'Just now',
    };

    const posts = this.getFeedPosts();
    const updated = posts.map((post) => {
      if (post.id !== postId) return post;
      const comments = post.comments ? [...post.comments, newComment] : [newComment];
      return { ...post, comments, comments_count: (post.comments_count || 0) + 1 };
    });

    this.setItem(STORAGE_KEYS.POSTS, updated);
    return newComment;
  }

  // --- Workouts & Automatic Guild War Consistency Scoring ---
  public logWorkout(workoutData: {
    title: string;
    split: Workout['split'];
    duration_minutes: number;
    notes?: string;
    photo_url?: string;
    energy_rating: number;
    exercises: Workout['exercises'];
    postToFeed?: boolean;
    squad_id?: string;
  }): Workout {
    const user = this.getCurrentUser();

    const totalVolume = workoutData.exercises.reduce((acc, ex) => {
      return acc + ex.sets * ex.reps * ex.weight_kg;
    }, 0);

    const workout: Workout = {
      id: `workout-${Date.now()}`,
      user_id: user.id,
      user,
      title: workoutData.title,
      split: workoutData.split,
      duration_minutes: workoutData.duration_minutes,
      notes: workoutData.notes,
      photo_url: workoutData.photo_url,
      total_volume_kg: Math.round(totalVolume),
      energy_rating: workoutData.energy_rating,
      exercises: workoutData.exercises,
      completed_at: 'Just now',
      created_at: new Date().toISOString(),
    };

    // Update user streak & workout count
    this.updateUserProfile({
      total_workouts: (user.total_workouts || 0) + 1,
      current_streak: (user.current_streak || 0) + 1,
      last_workout_date: 'Today',
      status: 'pumped',
    });

    // Check for any PRs in the exercises
    workoutData.exercises.forEach((ex) => {
      if (ex.is_pr) {
        this.addPersonalRecord({
          exercise_name: ex.exercise_name,
          weight_kg: ex.weight_kg,
          reps: ex.reps,
          proof_media_url: workoutData.photo_url,
          shoutout_note: `Hit during ${workoutData.title} (${workoutData.split} day)!`,
        });
      }
    });

    // Automatically check any active Consistency War for user's guilds
    this.processWorkoutForActiveGuildWars(workout);

    // Automatically post to feed if enabled
    if (workoutData.postToFeed !== false) {
      this.createFeedPost({
        content: `Crushed a ${workoutData.split} workout! ${workoutData.notes || 'No rest days in brotherhood.'}`,
        type: 'workout',
        media_url: workoutData.photo_url,
        workout,
        squad_id: workoutData.squad_id,
      });
    }

    return workout;
  }

  // --- Personal Records & Automatic Guild War Strength Scoring ---
  public getPersonalRecords(exerciseName?: string): PersonalRecord[] {
    const prs = this.getItem<PersonalRecord[]>(STORAGE_KEYS.PRS, SEED_PRS);
    if (exerciseName && exerciseName !== 'All') {
      return prs.filter((p) => p.exercise_name.toLowerCase().includes(exerciseName.toLowerCase()));
    }
    return prs;
  }

  public addPersonalRecord(data: {
    exercise_name: string;
    weight_kg: number;
    reps: number;
    proof_media_url?: string;
    shoutout_note?: string;
  }): PersonalRecord {
    const user = this.getCurrentUser();
    const existing = this.getPersonalRecords().filter(
      (p) => p.user_id === user.id && p.exercise_name.toLowerCase() === data.exercise_name.toLowerCase()
    );
    const prevWeight = existing.length > 0 ? Math.max(...existing.map((e) => e.weight_kg)) : undefined;

    const newPr: PersonalRecord = {
      id: `pr-${Date.now()}`,
      user_id: user.id,
      user,
      exercise_name: data.exercise_name,
      weight_kg: data.weight_kg,
      reps: data.reps,
      one_rep_max_est: calculateOneRepMax(data.weight_kg, data.reps),
      previous_weight_kg: prevWeight,
      achieved_at: new Date().toISOString(),
      proof_media_url: data.proof_media_url,
      shoutout_note: data.shoutout_note,
    };

    const currentPrs = this.getPersonalRecords();
    this.setItem(STORAGE_KEYS.PRS, [newPr, ...currentPrs]);

    // Process PR for active Strength Guild Wars
    this.processPRForActiveGuildWars(newPr);

    // Create an automatic PR announcement post in the feed
    this.createFeedPost({
      content: `🔥 BRO PR ALERT! Hit ${data.weight_kg} kg (${Math.round(data.weight_kg * 2.20462)} lbs) on ${data.exercise_name} for ${data.reps} rep${data.reps > 1 ? 's' : ''}! ${data.shoutout_note || ''}`,
      type: 'pr',
      media_url: data.proof_media_url,
      pr: newPr,
    });

    return newPr;
  }

  // ==============================================================================
  // GUILDS SYSTEM MANAGEMENT
  // ==============================================================================

  public getGuilds(): Guild[] {
    const guilds = this.getItem<Guild[]>(STORAGE_KEYS.GUILDS, SEED_GUILDS);
    const members = this.getItem<GuildMember[]>(STORAGE_KEYS.GUILD_MEMBERS, SEED_GUILD_MEMBERS);
    const users = this.getAllUsers();

    return guilds.map(g => {
      const gMembers = members.filter(m => m.guild_id === g.id && m.status === 'active');
      const captain = users.find(u => u.id === g.captain_id);
      return {
        ...g,
        member_count: gMembers.length,
        captain,
      };
    });
  }

  public getGuildById(guildId: string): Guild | undefined {
    return this.getGuilds().find(g => g.id === guildId);
  }

  public getUserGuilds(userId: string): Guild[] {
    const members = this.getItem<GuildMember[]>(STORAGE_KEYS.GUILD_MEMBERS, SEED_GUILD_MEMBERS);
    const userGuildIds = members
      .filter(m => m.user_id === userId && m.status === 'active')
      .map(m => m.guild_id);
    
    return this.getGuilds().filter(g => userGuildIds.includes(g.id));
  }

  public createGuild(data: { name: string; description: string; emblem_url: string }): { success: boolean; guild?: Guild; error?: string } {
    const user = this.getCurrentUser();
    const guilds = this.getGuilds();

    // Validation: name cannot be empty or already taken
    const trimmedName = data.name.trim();
    if (!trimmedName || trimmedName.length < 3) {
      return { success: false, error: 'Guild name must be at least 3 characters long' };
    }

    if (guilds.some(g => g.name.toLowerCase() === trimmedName.toLowerCase())) {
      return { success: false, error: 'A Guild with this name already exists' };
    }

    const slug = trimmedName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const newGuild: Guild = {
      id: `guild-${Date.now()}`,
      name: trimmedName,
      slug,
      description: data.description.trim() || 'A brotherhood guild dedicated to heavy lifting and mutual accountability.',
      emblem_url: data.emblem_url.trim() || 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=300&auto=format&fit=crop&q=80',
      captain_id: user.id,
      captain: user,
      invite_code: `GUILD-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      member_count: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      stats: {
        total_wars: 0,
        consistency_wins: 0,
        strength_wins: 0,
        total_points: 0,
        current_war_streak: 0,
        achievements: ['Guild Founded'],
      },
    };

    const newMember: GuildMember = {
      id: `gm-${Date.now()}`,
      guild_id: newGuild.id,
      user_id: user.id,
      user,
      role: 'captain',
      status: 'active',
      joined_at: new Date().toISOString(),
    };

    this.setItem(STORAGE_KEYS.GUILDS, [newGuild, ...guilds]);
    this.setItem(STORAGE_KEYS.GUILD_MEMBERS, [...this.getItem<GuildMember[]>(STORAGE_KEYS.GUILD_MEMBERS, SEED_GUILD_MEMBERS), newMember]);

    return { success: true, guild: newGuild };
  }

  public updateGuild(guildId: string, updates: { name?: string; description?: string; emblem_url?: string }): { success: boolean; error?: string } {
    const user = this.getCurrentUser();
    const guild = this.getGuildById(guildId);
    if (!guild) return { success: false, error: 'Guild not found' };
    if (guild.captain_id !== user.id) return { success: false, error: 'Only the captain can modify Guild settings' };

    const guilds = this.getGuilds().map(g => {
      if (g.id !== guildId) return g;
      return {
        ...g,
        name: updates.name ? updates.name.trim() : g.name,
        description: updates.description !== undefined ? updates.description.trim() : g.description,
        emblem_url: updates.emblem_url || g.emblem_url,
        updated_at: new Date().toISOString(),
      };
    });

    this.setItem(STORAGE_KEYS.GUILDS, guilds);
    return { success: true };
  }

  public getGuildMembers(guildId: string): GuildMember[] {
    const members = this.getItem<GuildMember[]>(STORAGE_KEYS.GUILD_MEMBERS, SEED_GUILD_MEMBERS);
    const users = this.getAllUsers();
    return members
      .filter(m => m.guild_id === guildId && m.status === 'active')
      .map(m => ({ ...m, user: users.find(u => u.id === m.user_id) }));
  }

  public leaveGuild(guildId: string, userId: string): { success: boolean; error?: string } {
    const guild = this.getGuildById(guildId);
    if (!guild) return { success: false, error: 'Guild not found' };

    const members = this.getGuildMembers(guildId);
    if (guild.captain_id === userId) {
      if (members.length > 1) {
        return { success: false, error: 'Captains must transfer captaincy to another member before leaving the Guild.' };
      }
    }

    const allMembers = this.getItem<GuildMember[]>(STORAGE_KEYS.GUILD_MEMBERS, SEED_GUILD_MEMBERS);
    const updated = allMembers.filter(m => !(m.guild_id === guildId && m.user_id === userId));
    this.setItem(STORAGE_KEYS.GUILD_MEMBERS, updated);

    // If last member left, remove guild
    if (members.length <= 1) {
      const remainingGuilds = this.getGuilds().filter(g => g.id !== guildId);
      this.setItem(STORAGE_KEYS.GUILDS, remainingGuilds);
    }

    return { success: true };
  }

  public transferCaptaincy(guildId: string, currentCaptainId: string, newCaptainId: string): { success: boolean; error?: string } {
    const guild = this.getGuildById(guildId);
    if (!guild) return { success: false, error: 'Guild not found' };
    if (guild.captain_id !== currentCaptainId) return { success: false, error: 'Only the current captain can transfer captaincy' };

    // Update guild
    const guilds = this.getGuilds().map(g => (g.id === guildId ? { ...g, captain_id: newCaptainId } : g));
    this.setItem(STORAGE_KEYS.GUILDS, guilds);

    // Update members roles
    const allMembers = this.getItem<GuildMember[]>(STORAGE_KEYS.GUILD_MEMBERS, SEED_GUILD_MEMBERS);
    const updatedMembers = allMembers.map(m => {
      if (m.guild_id !== guildId) return m;
      if (m.user_id === newCaptainId) return { ...m, role: 'captain' as const };
      if (m.user_id === currentCaptainId) return { ...m, role: 'member' as const };
      return m;
    });
    this.setItem(STORAGE_KEYS.GUILD_MEMBERS, updatedMembers);

    return { success: true };
  }

  // --- Guild Invitations (Friends Only) ---
  public sendGuildInvitation(guildId: string, inviteeUserId: string): { success: boolean; error?: string } {
    const inviter = this.getCurrentUser();
    const guild = this.getGuildById(guildId);
    if (!guild) return { success: false, error: 'Guild not found' };

    // Requirement: only captain can invite
    if (guild.captain_id !== inviter.id) {
      return { success: false, error: 'Only the Guild captain can invite new members.' };
    }

    // Requirement: Must be an accepted GymBro friend!
    if (!this.isFriend(inviter.id, inviteeUserId)) {
      return { success: false, error: 'Guild membership is private: you can only invite accepted GymBro friends.' };
    }

    // Check if user is already a member
    const existingMembers = this.getGuildMembers(guildId);
    if (existingMembers.some(m => m.user_id === inviteeUserId)) {
      return { success: false, error: 'User is already an active member of this Guild.' };
    }

    // Check if already invited
    const invites = this.getItem<GuildInvitation[]>(STORAGE_KEYS.GUILD_INVITATIONS, SEED_GUILD_INVITATIONS);
    if (invites.some(i => i.guild_id === guildId && i.invitee_user_id === inviteeUserId && i.status === 'pending')) {
      return { success: false, error: 'An invitation has already been sent to this friend.' };
    }

    const newInvite: GuildInvitation = {
      id: `inv-${Date.now()}`,
      guild_id: guildId,
      inviter_user_id: inviter.id,
      invitee_user_id: inviteeUserId,
      status: 'pending',
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    };

    this.setItem(STORAGE_KEYS.GUILD_INVITATIONS, [newInvite, ...invites]);
    return { success: true };
  }

  public getUserGuildInvitations(userId: string): GuildInvitation[] {
    const invites = this.getItem<GuildInvitation[]>(STORAGE_KEYS.GUILD_INVITATIONS, SEED_GUILD_INVITATIONS);
    const guilds = this.getGuilds();
    const users = this.getAllUsers();

    return invites
      .filter(i => i.invitee_user_id === userId && i.status === 'pending')
      .map(i => ({
        ...i,
        guild: guilds.find(g => g.id === i.guild_id),
        inviter: users.find(u => u.id === i.inviter_user_id),
        invitee: users.find(u => u.id === i.invitee_user_id),
      }));
  }

  public respondGuildInvitation(invitationId: string, accept: boolean): { success: boolean; error?: string } {
    const user = this.getCurrentUser();
    const invites = this.getItem<GuildInvitation[]>(STORAGE_KEYS.GUILD_INVITATIONS, SEED_GUILD_INVITATIONS);
    const invite = invites.find(i => i.id === invitationId);

    if (!invite) return { success: false, error: 'Invitation not found' };
    if (invite.invitee_user_id !== user.id) return { success: false, error: 'Unauthorized to respond to this invitation' };

    // Update invite status
    const updatedInvites = invites.map(i => {
      if (i.id !== invitationId) return i;
      return {
        ...i,
        status: (accept ? 'accepted' : 'rejected') as 'accepted' | 'rejected',
        responded_at: new Date().toISOString(),
      };
    });
    this.setItem(STORAGE_KEYS.GUILD_INVITATIONS, updatedInvites);

    if (accept) {
      // Add member record
      const members = this.getItem<GuildMember[]>(STORAGE_KEYS.GUILD_MEMBERS, SEED_GUILD_MEMBERS);
      const newMember: GuildMember = {
        id: `gm-${Date.now()}`,
        guild_id: invite.guild_id,
        user_id: user.id,
        role: 'member',
        status: 'active',
        joined_at: new Date().toISOString(),
      };
      this.setItem(STORAGE_KEYS.GUILD_MEMBERS, [...members, newMember]);
    }

    return { success: true };
  }

  // ==============================================================================
  // GUILD WARS ENGINE & STORAGE
  // ==============================================================================

  public getGuildWars(category?: GuildWarCategory, status?: GuildWarStatus): GuildWar[] {
    const wars = this.getItem<GuildWar[]>(STORAGE_KEYS.GUILD_WARS, SEED_GUILD_WARS);
    const guilds = this.getGuilds();

    let filtered = wars.map(w => ({
      ...w,
      challenger_guild: guilds.find(g => g.id === w.challenger_guild_id),
      opponent_guild: guilds.find(g => g.id === w.opponent_guild_id),
    }));

    if (category) {
      filtered = filtered.filter(w => w.category === category);
    }
    if (status) {
      filtered = filtered.filter(w => w.status === status);
    }

    return filtered;
  }

  public getGuildWarById(warId: string): GuildWar | undefined {
    return this.getGuildWars().find(w => w.id === warId);
  }

  public getWarParticipants(warId: string): GuildWarParticipant[] {
    const participants = this.getItem<GuildWarParticipant[]>(STORAGE_KEYS.WAR_PARTICIPANTS, SEED_WAR_PARTICIPANTS);
    const users = this.getAllUsers();
    return participants
      .filter(p => p.guild_war_id === warId)
      .map(p => ({ ...p, user: users.find(u => u.id === p.user_id) }));
  }

  public getWarContributions(warId: string): GuildWarContribution[] {
    const contributions = this.getItem<GuildWarContribution[]>(STORAGE_KEYS.WAR_CONTRIBUTIONS, SEED_WAR_CONTRIBUTIONS);
    const users = this.getAllUsers();
    return contributions
      .filter(c => c.guild_war_id === warId)
      .map(c => ({ ...c, user: users.find(u => u.id === c.user_id) }));
  }

  public createGuildWarChallenge(data: {
    challengerGuildId: string;
    opponentGuildId: string;
    category: GuildWarCategory;
    durationDays: 7 | 30;
  }): { success: boolean; war?: GuildWar; error?: string } {
    const user = this.getCurrentUser();
    const challenger = this.getGuildById(data.challengerGuildId);
    const opponent = this.getGuildById(data.opponentGuildId);

    if (!challenger || !opponent) return { success: false, error: 'One or both Guilds not found' };
    if (challenger.captain_id !== user.id) return { success: false, error: 'Only the captain can challenge another Guild' };
    if (challenger.id === opponent.id) return { success: false, error: 'A Guild cannot challenge itself' };

    // Check duplicate active/pending challenge between same guilds
    const existingWars = this.getGuildWars();
    const hasActiveWar = existingWars.some(
      w => (w.status === 'pending' || w.status === 'active') &&
      ((w.challenger_guild_id === challenger.id && w.opponent_guild_id === opponent.id) ||
       (w.challenger_guild_id === opponent.id && w.opponent_guild_id === challenger.id))
    );
    if (hasActiveWar) {
      return { success: false, error: 'There is already a pending or active Guild War between these two teams.' };
    }

    const now = new Date();
    const endsAt = new Date(now.getTime() + data.durationDays * 24 * 60 * 60 * 1000);

    const newWar: GuildWar = {
      id: `war-${Date.now()}`,
      challenger_guild_id: challenger.id,
      challenger_guild: challenger,
      opponent_guild_id: opponent.id,
      opponent_guild: opponent,
      category: data.category,
      status: 'pending',
      duration_days: data.durationDays,
      starts_at: now.toISOString(),
      ends_at: endsAt.toISOString(),
      scoring_policy_version: 'v1.0',
      scoring_policy: DEFAULT_SCORING_POLICIES[data.category],
      created_by: user.id,
      challenger_raw_score: 0,
      challenger_normalized_score: 0,
      opponent_raw_score: 0,
      opponent_normalized_score: 0,
    };

    const wars = this.getItem<GuildWar[]>(STORAGE_KEYS.GUILD_WARS, SEED_GUILD_WARS);
    this.setItem(STORAGE_KEYS.GUILD_WARS, [newWar, ...wars]);

    return { success: true, war: newWar };
  }

  public respondGuildWarChallenge(warId: string, accept: boolean): { success: boolean; error?: string } {
    const user = this.getCurrentUser();
    const wars = this.getItem<GuildWar[]>(STORAGE_KEYS.GUILD_WARS, SEED_GUILD_WARS);
    const war = wars.find(w => w.id === warId);

    if (!war) return { success: false, error: 'War challenge not found' };
    const opponentGuild = this.getGuildById(war.opponent_guild_id);
    if (!opponentGuild || opponentGuild.captain_id !== user.id) {
      return { success: false, error: 'Only the opponent Guild captain can accept or reject this challenge' };
    }

    if (!accept) {
      const updated = wars.map(w => w.id === warId ? { ...w, status: 'cancelled' as const } : w);
      this.setItem(STORAGE_KEYS.GUILD_WARS, updated);
      return { success: true };
    }

    // ACCEPT: Freeze the eligible roster for both guilds!
    const challengerMembers = this.getGuildMembers(war.challenger_guild_id);
    const opponentMembers = this.getGuildMembers(war.opponent_guild_id);

    const frozenParticipants: GuildWarParticipant[] = [
      ...challengerMembers.map(m => ({
        id: `wp-${war.id}-${m.user_id}`,
        guild_war_id: war.id,
        guild_id: war.challenger_guild_id,
        user_id: m.user_id,
        is_eligible: true,
        contribution_points: 0,
        qualifying_count: 0,
        weekly_bonus_earned: false,
      })),
      ...opponentMembers.map(m => ({
        id: `wp-${war.id}-${m.user_id}`,
        guild_war_id: war.id,
        guild_id: war.opponent_guild_id,
        user_id: m.user_id,
        is_eligible: true,
        contribution_points: 0,
        qualifying_count: 0,
        weekly_bonus_earned: false,
      })),
    ];

    const currentParticipants = this.getItem<GuildWarParticipant[]>(STORAGE_KEYS.WAR_PARTICIPANTS, SEED_WAR_PARTICIPANTS);
    this.setItem(STORAGE_KEYS.WAR_PARTICIPANTS, [...currentParticipants, ...frozenParticipants]);

    const now = new Date();
    const endsAt = new Date(now.getTime() + war.duration_days * 24 * 60 * 60 * 1000);

    const updatedWars = wars.map(w => {
      if (w.id !== warId) return w;
      return {
        ...w,
        status: 'active' as const,
        accepted_at: now.toISOString(),
        roster_frozen_at: now.toISOString(),
        starts_at: now.toISOString(),
        ends_at: endsAt.toISOString(),
      };
    });

    this.setItem(STORAGE_KEYS.GUILD_WARS, updatedWars);
    return { success: true };
  }

  // Authoritative server-style finalization
  public finalizeWar(warId: string): { success: boolean; resultWar?: GuildWar; error?: string } {
    const war = this.getGuildWarById(warId);
    if (!war) return { success: false, error: 'War not found' };

    const contributions = this.getWarContributions(warId);
    const participants = this.getWarParticipants(warId);

    const { updatedWar, results } = finalizeGuildWar(war, contributions, participants);

    // Persist finalized war
    const allWars = this.getItem<GuildWar[]>(STORAGE_KEYS.GUILD_WARS, SEED_GUILD_WARS);
    const updatedWars = allWars.map(w => w.id === warId ? updatedWar : w);
    this.setItem(STORAGE_KEYS.GUILD_WARS, updatedWars);

    // Update Guild stats (wins, total points)
    const guilds = this.getGuilds().map(g => {
      if (g.id === updatedWar.winner_guild_id) {
        return {
          ...g,
          stats: {
            ...g.stats,
            total_wars: g.stats.total_wars + 1,
            consistency_wins: updatedWar.category === 'consistency' ? g.stats.consistency_wins + 1 : g.stats.consistency_wins,
            strength_wins: updatedWar.category === 'strength' ? g.stats.strength_wins + 1 : g.stats.strength_wins,
            current_war_streak: g.stats.current_war_streak + 1,
          }
        };
      } else if (g.id === updatedWar.challenger_guild_id || g.id === updatedWar.opponent_guild_id) {
        return {
          ...g,
          stats: {
            ...g.stats,
            total_wars: g.stats.total_wars + 1,
            current_war_streak: 0,
          }
        };
      }
      return g;
    });
    this.setItem(STORAGE_KEYS.GUILDS, guilds);

    return { success: true, resultWar: updatedWar };
  }

  // Auto-evaluation hooks
  private processWorkoutForActiveGuildWars(workout: Workout) {
    const userGuilds = this.getUserGuilds(workout.user_id);
    if (userGuilds.length === 0) return;

    const activeWars = this.getGuildWars('consistency', 'active');
    const contributions = this.getItem<GuildWarContribution[]>(STORAGE_KEYS.WAR_CONTRIBUTIONS, SEED_WAR_CONTRIBUTIONS);
    const participants = this.getItem<GuildWarParticipant[]>(STORAGE_KEYS.WAR_PARTICIPANTS, SEED_WAR_PARTICIPANTS);
    const wars = this.getItem<GuildWar[]>(STORAGE_KEYS.GUILD_WARS, SEED_GUILD_WARS);

    let contributionsAdded = false;
    const newContributions: GuildWarContribution[] = [...contributions];

    userGuilds.forEach(guild => {
      const war = activeWars.find(w => w.challenger_guild_id === guild.id || w.opponent_guild_id === guild.id);
      if (!war) return;

      const userParticipant = participants.find(p => p.guild_war_id === war.id && p.guild_id === guild.id && p.user_id === workout.user_id);
      const isEligible = !!userParticipant?.is_eligible;

      const userWarContribs = newContributions.filter(c => c.guild_war_id === war.id && c.user_id === workout.user_id);
      const evaluation = evaluateWorkoutContribution(workout, war, userWarContribs, isEligible);

      if (evaluation.qualifies) {
        const newContrib: GuildWarContribution = {
          id: `gwc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          guild_war_id: war.id,
          guild_id: guild.id,
          user_id: workout.user_id,
          contribution_type: evaluation.isWeeklyBonus ? 'weekly_bonus' : 'workout',
          source_id: workout.id,
          awarded_points: evaluation.awardedPoints,
          scoring_policy_version: war.scoring_policy_version,
          recorded_at: new Date().toISOString(),
          idempotency_key: evaluation.idempotencyKey,
          metadata: { split: workout.split, duration_minutes: workout.duration_minutes },
        };
        newContributions.push(newContrib);
        contributionsAdded = true;
      }
    });

    if (contributionsAdded) {
      this.setItem(STORAGE_KEYS.WAR_CONTRIBUTIONS, newContributions);

      // Recompute and update scores for affected active wars
      const updatedWars = wars.map(war => {
        if (war.status !== 'active') return war;
        const warParticipants = participants.filter(p => p.guild_war_id === war.id);
        const warContribs = newContributions.filter(c => c.guild_war_id === war.id);
        const scores = calculateGuildWarScores(war, warContribs, warParticipants);
        return {
          ...war,
          challenger_raw_score: scores.challengerRaw,
          challenger_normalized_score: scores.challengerNormalized,
          opponent_raw_score: scores.opponentRaw,
          opponent_normalized_score: scores.opponentNormalized,
        };
      });
      this.setItem(STORAGE_KEYS.GUILD_WARS, updatedWars);
    }
  }

  private processPRForActiveGuildWars(pr: PersonalRecord) {
    const userGuilds = this.getUserGuilds(pr.user_id);
    if (userGuilds.length === 0) return;

    const activeWars = this.getGuildWars('strength', 'active');
    const contributions = this.getItem<GuildWarContribution[]>(STORAGE_KEYS.WAR_CONTRIBUTIONS, SEED_WAR_CONTRIBUTIONS);
    const participants = this.getItem<GuildWarParticipant[]>(STORAGE_KEYS.WAR_PARTICIPANTS, SEED_WAR_PARTICIPANTS);
    const wars = this.getItem<GuildWar[]>(STORAGE_KEYS.GUILD_WARS, SEED_GUILD_WARS);

    let contributionsAdded = false;
    const newContributions: GuildWarContribution[] = [...contributions];

    userGuilds.forEach(guild => {
      const war = activeWars.find(w => w.challenger_guild_id === guild.id || w.opponent_guild_id === guild.id);
      if (!war) return;

      const userParticipant = participants.find(p => p.guild_war_id === war.id && p.guild_id === guild.id && p.user_id === pr.user_id);
      const isEligible = !!userParticipant?.is_eligible;

      const userWarContribs = newContributions.filter(c => c.guild_war_id === war.id && c.user_id === pr.user_id);
      const evaluation = evaluatePRContribution(pr, war, userWarContribs, isEligible);

      if (evaluation.qualifies) {
        const newContrib: GuildWarContribution = {
          id: `gwc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          guild_war_id: war.id,
          guild_id: guild.id,
          user_id: pr.user_id,
          contribution_type: 'pr',
          source_id: pr.id,
          awarded_points: evaluation.awardedPoints,
          scoring_policy_version: war.scoring_policy_version,
          recorded_at: new Date().toISOString(),
          idempotency_key: evaluation.idempotencyKey,
          metadata: { exercise_name: pr.exercise_name, weight_kg: pr.weight_kg },
        };
        newContributions.push(newContrib);
        contributionsAdded = true;
      }
    });

    if (contributionsAdded) {
      this.setItem(STORAGE_KEYS.WAR_CONTRIBUTIONS, newContributions);

      // Recompute and update scores for affected active wars
      const updatedWars = wars.map(war => {
        if (war.status !== 'active') return war;
        const warParticipants = participants.filter(p => p.guild_war_id === war.id);
        const warContribs = newContributions.filter(c => c.guild_war_id === war.id);
        const scores = calculateGuildWarScores(war, warContribs, warParticipants);
        return {
          ...war,
          challenger_raw_score: scores.challengerRaw,
          challenger_normalized_score: scores.challengerNormalized,
          opponent_raw_score: scores.opponentRaw,
          opponent_normalized_score: scores.opponentNormalized,
        };
      });
      this.setItem(STORAGE_KEYS.GUILD_WARS, updatedWars);
    }
  }

  // --- Bro Nudges ---
  public getNudges(): BroNudge[] {
    return this.getItem<BroNudge[]>(STORAGE_KEYS.NUDGES, SEED_NUDGES);
  }

  public sendNudge(toUserId: string, message: string): BroNudge {
    const user = this.getCurrentUser();
    const newNudge: BroNudge = {
      id: `nudge-${Date.now()}`,
      from_user_id: user.id,
      from_user: user,
      to_user_id: toUserId,
      message,
      status: 'pending',
      created_at: 'Just now',
    };

    const nudges = [newNudge, ...this.getNudges()];
    this.setItem(STORAGE_KEYS.NUDGES, nudges);
    return newNudge;
  }

  public updateNudgeStatus(nudgeId: string, status: BroNudge['status']): void {
    const nudges = this.getNudges().map((n) => (n.id === nudgeId ? { ...n, status } : n));
    this.setItem(STORAGE_KEYS.NUDGES, nudges);
  }

  public resetToDefaults(): void {
    if (!this.isClient) return;
    localStorage.removeItem(STORAGE_KEYS.USERS);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    localStorage.removeItem(STORAGE_KEYS.POSTS);
    localStorage.removeItem(STORAGE_KEYS.PRS);
    localStorage.removeItem(STORAGE_KEYS.SQUADS);
    localStorage.removeItem(STORAGE_KEYS.NUDGES);
    localStorage.removeItem(STORAGE_KEYS.GUILDS);
    localStorage.removeItem(STORAGE_KEYS.GUILD_MEMBERS);
    localStorage.removeItem(STORAGE_KEYS.GUILD_INVITATIONS);
    localStorage.removeItem(STORAGE_KEYS.GUILD_WARS);
    localStorage.removeItem(STORAGE_KEYS.WAR_PARTICIPANTS);
    localStorage.removeItem(STORAGE_KEYS.WAR_CONTRIBUTIONS);
    localStorage.removeItem(STORAGE_KEYS.FRIENDSHIPS);
    this.init();
  }
}

export const gymBroStore = new GymBroStore();
