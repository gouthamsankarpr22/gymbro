import { 
  Guild, 
  GuildMember, 
  GuildInvitation, 
  GuildWar, 
  GuildWarParticipant, 
  GuildWarContribution, 
  GuildWarResult,
  Friendship 
} from '@/types';
import { SEED_USERS } from './seed-data';
import { DEFAULT_SCORING_POLICIES } from './scoring-engine';

export const SEED_FRIENDSHIPS: Friendship[] = [
  { id: 'f-1', user_id: 'user-1', friend_id: 'user-2', status: 'accepted', created_at: '2026-01-10T00:00:00Z' },
  { id: 'f-2', user_id: 'user-1', friend_id: 'user-3', status: 'accepted', created_at: '2026-01-10T00:00:00Z' },
  { id: 'f-3', user_id: 'user-1', friend_id: 'user-4', status: 'accepted', created_at: '2026-01-10T00:00:00Z' },
  { id: 'f-4', user_id: 'user-1', friend_id: 'user-5', status: 'accepted', created_at: '2026-01-10T00:00:00Z' },
  { id: 'f-5', user_id: 'user-2', friend_id: 'user-3', status: 'accepted', created_at: '2026-01-10T00:00:00Z' },
  { id: 'f-6', user_id: 'user-2', friend_id: 'user-4', status: 'accepted', created_at: '2026-01-10T00:00:00Z' },
  { id: 'f-7', user_id: 'user-3', friend_id: 'user-4', status: 'accepted', created_at: '2026-01-10T00:00:00Z' },
  { id: 'f-8', user_id: 'user-4', friend_id: 'user-5', status: 'accepted', created_at: '2026-01-10T00:00:00Z' },
];

export const SEED_GUILDS: Guild[] = [
  {
    id: 'guild-1',
    name: 'Iron Wolves',
    slug: 'iron-wolves',
    description: 'Relentless college and hometown lifters grinding through every season. We push through plateaus together.',
    emblem_url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=300&auto=format&fit=crop&q=80',
    captain_id: 'user-1', // Alex Rivera
    captain: SEED_USERS[0],
    invite_code: 'WOLF-IRON-77',
    member_count: 3,
    created_at: '2026-08-01T10:00:00Z',
    updated_at: '2026-08-01T10:00:00Z',
    stats: {
      total_wars: 5,
      consistency_wins: 3,
      strength_wins: 1,
      total_points: 430,
      current_war_streak: 2,
      achievements: ['Alpha Pack', '100% Weekly Consistency', 'Iron Brotherhood'],
    },
  },
  {
    id: 'guild-2',
    name: 'Kerala Titans',
    slug: 'kerala-titans',
    description: 'High volume, heavy squats, and zero skipped leg days. The iron standard from south to southwest.',
    emblem_url: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=300&auto=format&fit=crop&q=80',
    captain_id: 'user-2', // Marcus Chen
    captain: SEED_USERS[1],
    invite_code: 'TITAN-KL-99',
    member_count: 2,
    created_at: '2026-08-05T12:00:00Z',
    updated_at: '2026-08-05T12:00:00Z',
    stats: {
      total_wars: 4,
      consistency_wins: 2,
      strength_wins: 2,
      total_points: 390,
      current_war_streak: 1,
      achievements: ['Titan Quad Overlord', 'PR Breaker', 'Unbroken Line'],
    },
  },
  {
    id: 'guild-3',
    name: 'Beast Mode Syndicate',
    slug: 'beast-mode-syndicate',
    description: '5:30 AM dawn lifters in Manhattan. Heavy deadlifts before the financial markets open.',
    emblem_url: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=300&auto=format&fit=crop&q=80',
    captain_id: 'user-4', // Jordan Brooks
    captain: SEED_USERS[3],
    invite_code: 'BEAST-NYC-01',
    member_count: 2,
    created_at: '2026-08-12T08:00:00Z',
    updated_at: '2026-08-12T08:00:00Z',
    stats: {
      total_wars: 3,
      consistency_wins: 1,
      strength_wins: 1,
      total_points: 280,
      current_war_streak: 0,
      achievements: ['Dawn Raiders', '500+ Deadlift Club'],
    },
  },
  {
    id: 'guild-4',
    name: 'The Last Rep',
    slug: 'the-last-rep',
    description: 'Hometown Metro Gym heavy pause bench veterans. We never stop on 9 reps when 10 was programmed.',
    emblem_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=300&auto=format&fit=crop&q=80',
    captain_id: 'user-3', // Leo Vance
    captain: SEED_USERS[2],
    invite_code: 'LAST-REP-OG',
    member_count: 2,
    created_at: '2026-08-15T14:00:00Z',
    updated_at: '2026-08-15T14:00:00Z',
    stats: {
      total_wars: 3,
      consistency_wins: 1,
      strength_wins: 1,
      total_points: 260,
      current_war_streak: 1,
      achievements: ['Pause Masters', 'Zero Bounce Approved'],
    },
  },
];

export const SEED_GUILD_MEMBERS: GuildMember[] = [
  // Iron Wolves
  { id: 'gm-1', guild_id: 'guild-1', user_id: 'user-1', role: 'captain', status: 'active', joined_at: '2026-08-01T10:00:00Z' },
  { id: 'gm-2', guild_id: 'guild-1', user_id: 'user-3', role: 'member', status: 'active', joined_at: '2026-08-02T11:00:00Z' },
  { id: 'gm-3', guild_id: 'guild-1', user_id: 'user-5', role: 'member', status: 'active', joined_at: '2026-08-03T14:00:00Z' },
  // Kerala Titans
  { id: 'gm-4', guild_id: 'guild-2', user_id: 'user-2', role: 'captain', status: 'active', joined_at: '2026-08-05T12:00:00Z' },
  { id: 'gm-5', guild_id: 'guild-2', user_id: 'user-4', role: 'member', status: 'active', joined_at: '2026-08-06T15:00:00Z' },
  // Beast Mode
  { id: 'gm-6', guild_id: 'guild-3', user_id: 'user-4', role: 'captain', status: 'active', joined_at: '2026-08-12T08:00:00Z' },
  { id: 'gm-7', guild_id: 'guild-3', user_id: 'user-1', role: 'member', status: 'active', joined_at: '2026-08-13T09:00:00Z' },
  // The Last Rep
  { id: 'gm-8', guild_id: 'guild-4', user_id: 'user-3', role: 'captain', status: 'active', joined_at: '2026-08-15T14:00:00Z' },
  { id: 'gm-9', guild_id: 'guild-4', user_id: 'user-2', role: 'member', status: 'active', joined_at: '2026-08-16T16:00:00Z' },
];

export const SEED_GUILD_INVITATIONS: GuildInvitation[] = [
  {
    id: 'inv-1',
    guild_id: 'guild-2', // Kerala Titans inviting Alex
    guild: SEED_GUILDS[1],
    inviter_user_id: 'user-2',
    inviter: SEED_USERS[1],
    invitee_user_id: 'user-1',
    invitee: SEED_USERS[0],
    status: 'pending',
    created_at: '2026-10-22T10:00:00Z',
    expires_at: '2026-10-29T10:00:00Z',
  },
];

export const SEED_GUILD_WARS: GuildWar[] = [
  // 1. ACTIVE WORKOUT CONSISTENCY WAR: Iron Wolves vs Kerala Titans
  {
    id: 'war-101',
    challenger_guild_id: 'guild-1', // Iron Wolves (3 members: Alex, Leo, Sam)
    challenger_guild: SEED_GUILDS[0],
    opponent_guild_id: 'guild-2', // Kerala Titans (2 members: Marcus, Jordan)
    opponent_guild: SEED_GUILDS[1],
    category: 'consistency',
    status: 'active',
    duration_days: 7,
    starts_at: '2026-10-20T00:00:00Z',
    ends_at: '2026-10-27T23:59:59Z',
    scoring_policy_version: 'v1.0',
    scoring_policy: DEFAULT_SCORING_POLICIES.consistency,
    created_by: 'user-1',
    accepted_at: '2026-10-20T00:00:00Z',
    roster_frozen_at: '2026-10-20T00:00:00Z',
    challenger_raw_score: 90, // 30 (Alex) + 30 (Leo) + 30 (Sam with bonus)
    challenger_normalized_score: 30.00, // 90 / 3
    opponent_raw_score: 70, // 40 (Marcus) + 30 (Jordan)
    opponent_normalized_score: 35.00, // 70 / 2 (Kerala Titans leading on normalized average!)
    winner_guild_id: undefined,
  },
  // 2. ACTIVE STRENGTH & PR WAR: Iron Wolves vs Beast Mode Syndicate
  {
    id: 'war-102',
    challenger_guild_id: 'guild-1',
    challenger_guild: SEED_GUILDS[0],
    opponent_guild_id: 'guild-3',
    opponent_guild: SEED_GUILDS[2],
    category: 'strength',
    status: 'active',
    duration_days: 7,
    starts_at: '2026-10-22T00:00:00Z',
    ends_at: '2026-10-29T23:59:59Z',
    scoring_policy_version: 'v1.0',
    scoring_policy: DEFAULT_SCORING_POLICIES.strength,
    created_by: 'user-1',
    accepted_at: '2026-10-22T00:00:00Z',
    roster_frozen_at: '2026-10-22T00:00:00Z',
    challenger_raw_score: 15, // 3 valid PRs (15 pts / 3 members = 5.00 norm)
    challenger_normalized_score: 5.00,
    opponent_raw_score: 10, // 2 valid PRs (10 pts / 2 members = 5.00 norm)
    opponent_normalized_score: 5.00,
    winner_guild_id: undefined,
  },
  // 3. COMPLETED WAR: Kerala Titans vs The Last Rep (Consistency War - Hall of Fame)
  {
    id: 'war-100',
    challenger_guild_id: 'guild-2',
    challenger_guild: SEED_GUILDS[1],
    opponent_guild_id: 'guild-4',
    opponent_guild: SEED_GUILDS[3],
    category: 'consistency',
    status: 'completed',
    duration_days: 7,
    starts_at: '2026-10-10T00:00:00Z',
    ends_at: '2026-10-17T23:59:59Z',
    scoring_policy_version: 'v1.0',
    scoring_policy: DEFAULT_SCORING_POLICIES.consistency,
    created_by: 'user-2',
    accepted_at: '2026-10-10T00:00:00Z',
    completed_at: '2026-10-17T23:59:59Z',
    roster_frozen_at: '2026-10-10T00:00:00Z',
    challenger_raw_score: 110,
    challenger_normalized_score: 55.00, // 110 / 2
    opponent_raw_score: 90,
    opponent_normalized_score: 45.00, // 90 / 2
    winner_guild_id: 'guild-2', // Kerala Titans won
    results: [
      {
        id: 'res-1',
        guild_war_id: 'war-100',
        guild_id: 'guild-2',
        raw_score: 110,
        normalized_score: 55.00,
        eligible_members_count: 2,
        participating_members_count: 2,
        participation_rate: 1.0,
        final_rank: 1,
        is_winner: true,
        finalized_at: '2026-10-17T23:59:59Z',
      },
      {
        id: 'res-2',
        guild_war_id: 'war-100',
        guild_id: 'guild-4',
        raw_score: 90,
        normalized_score: 45.00,
        eligible_members_count: 2,
        participating_members_count: 2,
        participation_rate: 1.0,
        final_rank: 2,
        is_winner: false,
        finalized_at: '2026-10-17T23:59:59Z',
      },
    ],
  },
];

export const SEED_WAR_PARTICIPANTS: GuildWarParticipant[] = [
  // war-101 (Iron Wolves)
  { id: 'wp-1', guild_war_id: 'war-101', guild_id: 'guild-1', user_id: 'user-1', is_eligible: true, contribution_points: 30, qualifying_count: 3, weekly_bonus_earned: false },
  { id: 'wp-2', guild_war_id: 'war-101', guild_id: 'guild-1', user_id: 'user-3', is_eligible: true, contribution_points: 30, qualifying_count: 3, weekly_bonus_earned: false },
  { id: 'wp-3', guild_war_id: 'war-101', guild_id: 'guild-1', user_id: 'user-5', is_eligible: true, contribution_points: 30, qualifying_count: 1, weekly_bonus_earned: true },
  // war-101 (Kerala Titans)
  { id: 'wp-4', guild_war_id: 'war-101', guild_id: 'guild-2', user_id: 'user-2', is_eligible: true, contribution_points: 40, qualifying_count: 4, weekly_bonus_earned: false },
  { id: 'wp-5', guild_war_id: 'war-101', guild_id: 'guild-2', user_id: 'user-4', is_eligible: true, contribution_points: 30, qualifying_count: 3, weekly_bonus_earned: false },

  // war-102 (Iron Wolves)
  { id: 'wp-6', guild_war_id: 'war-102', guild_id: 'guild-1', user_id: 'user-1', is_eligible: true, contribution_points: 10, qualifying_count: 2, weekly_bonus_earned: false },
  { id: 'wp-7', guild_war_id: 'war-102', guild_id: 'guild-1', user_id: 'user-3', is_eligible: true, contribution_points: 5, qualifying_count: 1, weekly_bonus_earned: false },
  { id: 'wp-8', guild_war_id: 'war-102', guild_id: 'guild-1', user_id: 'user-5', is_eligible: true, contribution_points: 0, qualifying_count: 0, weekly_bonus_earned: false },
  // war-102 (Beast Mode)
  { id: 'wp-9', guild_war_id: 'war-102', guild_id: 'guild-3', user_id: 'user-4', is_eligible: true, contribution_points: 5, qualifying_count: 1, weekly_bonus_earned: false },
  { id: 'wp-10', guild_war_id: 'war-102', guild_id: 'guild-3', user_id: 'user-1', is_eligible: true, contribution_points: 5, qualifying_count: 1, weekly_bonus_earned: false },
];

export const SEED_WAR_CONTRIBUTIONS: GuildWarContribution[] = [
  // Contributions for war-101 (Consistency)
  {
    id: 'gwc-1',
    guild_war_id: 'war-101',
    guild_id: 'guild-1',
    user_id: 'user-1',
    user: SEED_USERS[0],
    contribution_type: 'workout',
    source_id: 'w-seed-1',
    awarded_points: 10,
    scoring_policy_version: 'v1.0',
    recorded_at: '2026-10-21T18:00:00Z',
    idempotency_key: 'war_war-101_workout_w-seed-1',
    metadata: { split: 'Push', duration_minutes: 60 },
  },
  {
    id: 'gwc-2',
    guild_war_id: 'war-101',
    guild_id: 'guild-1',
    user_id: 'user-1',
    user: SEED_USERS[0],
    contribution_type: 'workout',
    source_id: 'w-seed-2',
    awarded_points: 10,
    scoring_policy_version: 'v1.0',
    recorded_at: '2026-10-22T17:30:00Z',
    idempotency_key: 'war_war-101_workout_w-seed-2',
    metadata: { split: 'Pull', duration_minutes: 55 },
  },
  {
    id: 'gwc-3',
    guild_war_id: 'war-101',
    guild_id: 'guild-2',
    user_id: 'user-2',
    user: SEED_USERS[1],
    contribution_type: 'workout',
    source_id: 'w-seed-3',
    awarded_points: 10,
    scoring_policy_version: 'v1.0',
    recorded_at: '2026-10-21T07:00:00Z',
    idempotency_key: 'war_war-101_workout_w-seed-3',
    metadata: { split: 'Legs', duration_minutes: 75 },
  },
  {
    id: 'gwc-4',
    guild_war_id: 'war-101',
    guild_id: 'guild-2',
    user_id: 'user-2',
    user: SEED_USERS[1],
    contribution_type: 'workout',
    source_id: 'w-seed-4',
    awarded_points: 10,
    scoring_policy_version: 'v1.0',
    recorded_at: '2026-10-22T07:15:00Z',
    idempotency_key: 'war_war-101_workout_w-seed-4',
    metadata: { split: 'Upper', duration_minutes: 65 },
  },
];
