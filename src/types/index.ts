export type SplitType = 'Push' | 'Pull' | 'Legs' | 'Upper' | 'Lower' | 'Arms' | 'Full Body' | 'Cardio';

export type PostType = 'workout' | 'pr' | 'meme' | 'nudge' | 'announcement';

export type ReactionType = 'fist_bump' | 'fire' | 'heavy' | 'hype' | 'skull';

export interface UserProfile {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string;
  bio?: string;
  email?: string;
  phone?: string;
  age?: number;
  password?: string;
  hometown_gym: string;
  current_location: string; // e.g. "Penn State (420 miles away)", "Working in Seattle"
  current_streak: number; // days
  total_workouts: number;
  favorite_lift: string;
  big_three_total_kg: number;
  last_workout_date?: string;
  status: 'pumped' | 'resting' | 'needs_motivation' | 'at_the_gym';
}

export interface Squad {
  id: string;
  name: string;
  description: string;
  avatar_url?: string;
  member_count: number;
  created_by: string;
  invite_code: string;
}

export interface WorkoutExercise {
  id: string;
  exercise_name: string;
  sets: number;
  reps: number;
  weight_kg: number;
  is_pr?: boolean;
}

export interface Workout {
  id: string;
  user_id: string;
  user?: UserProfile;
  title: string;
  split: SplitType;
  duration_minutes: number;
  notes?: string;
  photo_url?: string;
  total_volume_kg: number;
  energy_rating: number; // 1-10
  exercises: WorkoutExercise[];
  completed_at: string;
  created_at: string;
}

export interface PersonalRecord {
  id: string;
  user_id: string;
  user?: UserProfile;
  exercise_name: string;
  weight_kg: number;
  reps: number;
  one_rep_max_est: number;
  previous_weight_kg?: number;
  achieved_at: string;
  proof_media_url?: string;
  shoutout_note?: string;
}

export interface PostComment {
  id: string;
  post_id: string;
  user_id: string;
  user: UserProfile;
  content: string;
  created_at: string;
}

export interface PostReaction {
  id: string;
  post_id: string;
  user_id: string;
  reaction_type: ReactionType;
}

export interface FeedPost {
  id: string;
  user_id: string;
  user: UserProfile;
  squad_id?: string;
  squad_name?: string;
  type: PostType;
  content: string;
  media_url?: string;
  workout?: Workout;
  pr?: PersonalRecord;
  reactions: Record<ReactionType, number>;
  user_reactions: ReactionType[];
  comments_count: number;
  comments?: PostComment[];
  created_at: string;
  is_demo?: boolean;
}

export interface BroNudge {
  id: string;
  from_user_id: string;
  from_user: UserProfile;
  to_user_id: string;
  message: string;
  status: 'pending' | 'hit_gym' | 'dismissed';
  created_at: string;
}

export interface PRProgressionPoint {
  date: string;
  [exerciseOrUser: string]: string | number;
}

// ==============================================================================
// GUILDS & GUILD WARS SYSTEM TYPES
// ==============================================================================

export type GuildRole = 'captain' | 'member';

export type GuildWarCategory = 'consistency' | 'strength';

export type GuildWarStatus = 'pending' | 'active' | 'completed' | 'cancelled';

export interface Friendship {
  id: string;
  user_id: string;
  friend_id: string;
  friend?: UserProfile;
  status: 'accepted' | 'pending' | 'rejected';
  created_at: string;
}

export interface GuildStats {
  total_wars: number;
  consistency_wins: number;
  strength_wins: number;
  total_points: number;
  current_war_streak: number;
  achievements: string[];
}

export interface Guild {
  id: string;
  name: string;
  slug: string;
  description: string;
  emblem_url: string;
  captain_id: string;
  captain?: UserProfile;
  invite_code: string;
  member_count: number;
  created_at: string;
  updated_at: string;
  stats: GuildStats;
}

export interface GuildMember {
  id: string;
  guild_id: string;
  user_id: string;
  user?: UserProfile;
  role: GuildRole;
  status: 'active' | 'inactive';
  joined_at: string;
}

export interface GuildInvitation {
  id: string;
  guild_id: string;
  guild?: Guild;
  inviter_user_id: string;
  inviter?: UserProfile;
  invitee_user_id: string;
  invitee?: UserProfile;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  created_at: string;
  expires_at: string;
  responded_at?: string;
}

export interface ScoringPolicy {
  version: string;
  category: GuildWarCategory;
  base_points: number; // 10 pts for workout, 5 pts for PR
  daily_cap: number; // max 1 workout / 10 pts per day
  min_duration_minutes: number; // min 30 mins
  weekly_bonus_points: number; // 20 bonus pts
  weekly_goal_workouts: number; // 4 workouts in a week
  min_pr_improvement_kg: number; // 1.0 kg
  min_participation_rate: number; // 0.5 (50%)
  formula_description: string;
}

export interface GuildWarParticipant {
  id: string;
  guild_war_id: string;
  guild_id: string;
  user_id: string;
  user?: UserProfile;
  is_eligible: boolean; // Part of frozen roster at war start
  contribution_points: number;
  qualifying_count: number;
  weekly_bonus_earned: boolean;
}

export interface GuildWarContribution {
  id: string;
  guild_war_id: string;
  guild_id: string;
  user_id: string;
  user?: UserProfile;
  contribution_type: 'workout' | 'pr' | 'weekly_bonus';
  source_id: string; // workout_id or pr_id
  awarded_points: number;
  scoring_policy_version: string;
  recorded_at: string;
  idempotency_key: string;
  metadata?: {
    exercise_name?: string;
    weight_kg?: number;
    duration_minutes?: number;
    split?: SplitType;
  };
}

export interface GuildWarResult {
  id: string;
  guild_war_id: string;
  guild_id: string;
  raw_score: number;
  normalized_score: number;
  eligible_members_count: number;
  participating_members_count: number;
  participation_rate: number; // 0.0 to 1.0
  final_rank: number; // 1 = Winner, 2 = Runner-up
  is_winner: boolean;
  finalized_at: string;
}

export interface GuildWar {
  id: string;
  challenger_guild_id: string;
  challenger_guild?: Guild;
  opponent_guild_id: string;
  opponent_guild?: Guild;
  category: GuildWarCategory;
  status: GuildWarStatus;
  duration_days: number; // 7 or 30 days
  starts_at: string;
  ends_at: string;
  scoring_policy_version: string;
  scoring_policy: ScoringPolicy;
  created_by: string; // captain user id
  accepted_at?: string;
  completed_at?: string;
  roster_frozen_at?: string;
  challenger_raw_score: number;
  challenger_normalized_score: number;
  opponent_raw_score: number;
  opponent_normalized_score: number;
  winner_guild_id?: string;
  results?: GuildWarResult[];
}
