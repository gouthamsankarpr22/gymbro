import { 
  UserProfile, 
  Squad, 
  FeedPost, 
  PersonalRecord, 
  Workout, 
  BroNudge, 
  ReactionType,
  PostComment
} from '@/types';
import { 
  SEED_USERS, 
  SEED_SQUADS, 
  SEED_POSTS, 
  SEED_PRS, 
  SEED_NUDGES 
} from './seed-data';
import { isSupabaseConfigured, getSupabase } from './supabase/client';
import { calculateOneRepMax } from './utils';

const STORAGE_KEYS = {
  CURRENT_USER: 'gymbro_current_user',
  USERS: 'gymbro_users',
  POSTS: 'gymbro_posts',
  PRS: 'gymbro_prs',
  SQUADS: 'gymbro_squads',
  NUDGES: 'gymbro_nudges',
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

  // --- Squads ---
  public getSquads(): Squad[] {
    return this.getItem<Squad[]>(STORAGE_KEYS.SQUADS, SEED_SQUADS);
  }

  public createSquad(name: string, description: string): Squad {
    const current = this.getCurrentUser();
    const newSquad: Squad = {
      id: `squad-${Date.now()}`,
      name,
      description,
      member_count: 1,
      created_by: current.id,
      invite_code: `BRO-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      avatar_url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=200&auto=format&fit=crop&q=80',
    };
    const squads = [newSquad, ...this.getSquads()];
    this.setItem(STORAGE_KEYS.SQUADS, squads);
    return newSquad;
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
      reactions: {
        fist_bump: 0,
        fire: 0,
        heavy: 0,
        hype: 0,
        skull: 0,
      },
      user_reactions: [],
      comments_count: 0,
      comments: [],
      created_at: 'Just now',
    };

    const currentPosts = this.getFeedPosts();
    const updated = [newPost, ...currentPosts];
    this.setItem(STORAGE_KEYS.POSTS, updated);

    // If Supabase is connected, sync asynchronously in background
    if (isSupabaseConfigured) {
      const sb = getSupabase();
      if (sb) {
        sb.from('feed_posts').insert({
          user_id: user.id,
          squad_id: squad?.id,
          type: data.type,
          content: data.content,
          media_url: data.media_url,
        }).then(({ error }) => {
          if (error) console.error('Supabase feed post sync error:', error);
        });
      }
    }

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

      return {
        ...post,
        reactions: newReactions,
        user_reactions: newUserReactions,
      };
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
      return {
        ...post,
        comments,
        comments_count: (post.comments_count || 0) + 1,
      };
    });

    this.setItem(STORAGE_KEYS.POSTS, updated);
    return newComment;
  }

  // --- Workouts ---
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

    // Calculate total volume (sets * reps * weight)
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

  // --- Personal Records (PR Board) ---
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

    // Create an automatic PR announcement post in the feed
    this.createFeedPost({
      content: `🔥 BRO PR ALERT! Hit ${data.weight_kg} kg (${Math.round(data.weight_kg * 2.20462)} lbs) on ${data.exercise_name} for ${data.reps} rep${data.reps > 1 ? 's' : ''}! ${data.shoutout_note || ''}`,
      type: 'pr',
      media_url: data.proof_media_url,
      pr: newPr,
    });

    return newPr;
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
    this.init();
  }
}

export const gymBroStore = new GymBroStore();
