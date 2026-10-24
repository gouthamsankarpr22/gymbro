export type SplitType = 'Push' | 'Pull' | 'Legs' | 'Upper' | 'Lower' | 'Arms' | 'Full Body' | 'Cardio';

export type PostType = 'workout' | 'pr' | 'meme' | 'nudge' | 'announcement';

export type ReactionType = 'fist_bump' | 'fire' | 'heavy' | 'hype' | 'skull';

export interface UserProfile {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string;
  bio?: string;
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
