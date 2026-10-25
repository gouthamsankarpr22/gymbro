import { describe, it, expect } from 'vitest';
import { 
  evaluateWorkoutContribution, 
  evaluatePRContribution, 
  calculateGuildWarScores, 
  finalizeGuildWar,
  DEFAULT_SCORING_POLICIES 
} from '../scoring-engine';
import { GuildWar, Workout, PersonalRecord, GuildWarContribution, GuildWarParticipant } from '@/types';

describe('Guild Wars Scoring Engine & Normalization', () => {
  const baseConsistencyWar: GuildWar = {
    id: 'test-war-1',
    challenger_guild_id: 'guild-a', // 3 members
    opponent_guild_id: 'guild-b',   // 2 members
    category: 'consistency',
    status: 'active',
    duration_days: 7,
    starts_at: '2026-10-20T00:00:00Z',
    ends_at: '2026-10-27T23:59:59Z',
    scoring_policy_version: 'v1.0',
    scoring_policy: DEFAULT_SCORING_POLICIES.consistency,
    created_by: 'user-1',
    challenger_raw_score: 0,
    challenger_normalized_score: 0,
    opponent_raw_score: 0,
    opponent_normalized_score: 0,
  };

  const sampleWorkout: Workout = {
    id: 'w-1',
    user_id: 'user-1',
    title: 'Push Day Power',
    split: 'Push',
    duration_minutes: 50,
    total_volume_kg: 10000,
    energy_rating: 8,
    exercises: [],
    completed_at: '2026-10-21T10:00:00Z',
    created_at: '2026-10-21T10:00:00Z',
  };

  it('1. awards 10 points for a valid qualifying workout session', () => {
    const result = evaluateWorkoutContribution(sampleWorkout, baseConsistencyWar, [], true);
    expect(result.qualifies).toBe(true);
    expect(result.awardedPoints).toBe(10);
    expect(result.idempotencyKey).toBe('war_test-war-1_workout_w-1');
  });

  it('2. rejects workouts shorter than minimum duration (e.g. 20 min < 30 min required)', () => {
    const shortWorkout = { ...sampleWorkout, duration_minutes: 20 };
    const result = evaluateWorkoutContribution(shortWorkout, baseConsistencyWar, [], true);
    expect(result.qualifies).toBe(false);
    expect(result.reason).toContain('below minimum');
  });

  it('3. enforces daily scoring cap (max 1 qualifying workout per calendar day)', () => {
    const existingContribution: GuildWarContribution = {
      id: 'c-1',
      guild_war_id: 'test-war-1',
      guild_id: 'guild-a',
      user_id: 'user-1',
      contribution_type: 'workout',
      source_id: 'w-0',
      awarded_points: 10,
      scoring_policy_version: 'v1.0',
      recorded_at: '2026-10-21T08:00:00Z', // Same day!
      idempotency_key: 'war_test-war-1_workout_w-0',
    };

    const result = evaluateWorkoutContribution(sampleWorkout, baseConsistencyWar, [existingContribution], true);
    expect(result.qualifies).toBe(false);
    expect(result.reason).toContain('Daily scoring cap reached');
  });

  it('4. prevents duplicate points for the same workout (idempotency)', () => {
    const existingContribution: GuildWarContribution = {
      id: 'c-1',
      guild_war_id: 'test-war-1',
      guild_id: 'guild-a',
      user_id: 'user-1',
      contribution_type: 'workout',
      source_id: 'w-1', // Same workout id!
      awarded_points: 10,
      scoring_policy_version: 'v1.0',
      recorded_at: '2026-10-21T10:00:00Z',
      idempotency_key: 'war_test-war-1_workout_w-1',
    };

    const result = evaluateWorkoutContribution(sampleWorkout, baseConsistencyWar, [existingContribution], true);
    expect(result.qualifies).toBe(false);
    expect(result.reason).toContain('already scored');
  });

  it('5. awards weekly consistency bonus (+20 pts) upon completing 4th workout in competition', () => {
    // User already completed 3 workouts on 3 different days
    const pastContributions: GuildWarContribution[] = [
      { id: 'c-1', guild_war_id: 'test-war-1', guild_id: 'guild-a', user_id: 'user-1', contribution_type: 'workout', source_id: 'w-prev-1', awarded_points: 10, scoring_policy_version: 'v1.0', recorded_at: '2026-10-21T10:00:00Z', idempotency_key: 'k1' },
      { id: 'c-2', guild_war_id: 'test-war-1', guild_id: 'guild-a', user_id: 'user-1', contribution_type: 'workout', source_id: 'w-prev-2', awarded_points: 10, scoring_policy_version: 'v1.0', recorded_at: '2026-10-22T10:00:00Z', idempotency_key: 'k2' },
      { id: 'c-3', guild_war_id: 'test-war-1', guild_id: 'guild-a', user_id: 'user-1', contribution_type: 'workout', source_id: 'w-prev-3', awarded_points: 10, scoring_policy_version: 'v1.0', recorded_at: '2026-10-23T10:00:00Z', idempotency_key: 'k3' },
    ];

    const fourthWorkout = { ...sampleWorkout, id: 'w-4', completed_at: '2026-10-24T10:00:00Z', created_at: '2026-10-24T10:00:00Z' };
    const result = evaluateWorkoutContribution(fourthWorkout, baseConsistencyWar, pastContributions, true);
    expect(result.qualifies).toBe(true);
    // 10 base + 20 weekly bonus = 30 points!
    expect(result.awardedPoints).toBe(30);
    expect(result.isWeeklyBonus).toBe(true);
  });

  it('6. rejects contribution if member is not part of the frozen competition roster', () => {
    const result = evaluateWorkoutContribution(sampleWorkout, baseConsistencyWar, [], false);
    expect(result.qualifies).toBe(false);
    expect(result.reason).toContain('not in frozen competition roster');
  });

  it('7. evaluates Strength & PR war: awards 5 pts for new PR and prevents duplicate PRs on same exercise', () => {
    const strengthWar: GuildWar = {
      ...baseConsistencyWar,
      id: 'test-war-strength',
      category: 'strength',
      scoring_policy: DEFAULT_SCORING_POLICIES.strength,
    };

    const validPR: PersonalRecord = {
      id: 'pr-1',
      user_id: 'user-1',
      exercise_name: 'Bench Press',
      weight_kg: 140,
      previous_weight_kg: 135,
      reps: 1,
      one_rep_max_est: 140,
      achieved_at: '2026-10-22T18:00:00Z',
    };

    // First PR on Bench Press qualifies
    const result1 = evaluatePRContribution(validPR, strengthWar, [], true);
    expect(result1.qualifies).toBe(true);
    expect(result1.awardedPoints).toBe(5);

    // Second PR on Bench Press in same war is rejected per policy (1 award per exercise per war)
    const existingPRContribution: GuildWarContribution = {
      id: 'gwc-pr-1',
      guild_war_id: 'test-war-strength',
      guild_id: 'guild-a',
      user_id: 'user-1',
      contribution_type: 'pr',
      source_id: 'pr-1',
      awarded_points: 5,
      scoring_policy_version: 'v1.0',
      recorded_at: '2026-10-22T18:00:00Z',
      idempotency_key: 'war_test-war-strength_pr_pr-1',
      metadata: { exercise_name: 'Bench Press' },
    };

    const secondBenchPR: PersonalRecord = {
      ...validPR,
      id: 'pr-2',
      weight_kg: 142.5,
      previous_weight_kg: 140,
      achieved_at: '2026-10-23T18:00:00Z',
    };

    const result2 = evaluatePRContribution(secondBenchPR, strengthWar, [existingPRContribution], true);
    expect(result2.qualifies).toBe(false);
    expect(result2.reason).toContain('already claimed in this war');
  });

  it('8. calculates normalized scores fairly for guilds with different member counts', () => {
    // Guild A has 3 members. Total points: 90 => Normalized = 90 / 3 = 30.00
    // Guild B has 2 members. Total points: 70 => Normalized = 70 / 2 = 35.00
    // Even though Guild A has more raw points (90 vs 70), Guild B leads on average member effort (35.00 vs 30.00)!

    const participants: GuildWarParticipant[] = [
      // Guild A (3 members)
      { id: 'p1', guild_war_id: 'test-war-1', guild_id: 'guild-a', user_id: 'user-1', is_eligible: true, contribution_points: 30, qualifying_count: 3, weekly_bonus_earned: false },
      { id: 'p2', guild_war_id: 'test-war-1', guild_id: 'guild-a', user_id: 'user-2', is_eligible: true, contribution_points: 30, qualifying_count: 3, weekly_bonus_earned: false },
      { id: 'p3', guild_war_id: 'test-war-1', guild_id: 'guild-a', user_id: 'user-3', is_eligible: true, contribution_points: 30, qualifying_count: 3, weekly_bonus_earned: false },
      // Guild B (2 members)
      { id: 'p4', guild_war_id: 'test-war-1', guild_id: 'guild-b', user_id: 'user-4', is_eligible: true, contribution_points: 40, qualifying_count: 4, weekly_bonus_earned: false },
      { id: 'p5', guild_war_id: 'test-war-1', guild_id: 'guild-b', user_id: 'user-5', is_eligible: true, contribution_points: 30, qualifying_count: 3, weekly_bonus_earned: false },
    ];

    const contributions: GuildWarContribution[] = [
      { id: 'c1', guild_war_id: 'test-war-1', guild_id: 'guild-a', user_id: 'user-1', contribution_type: 'workout', source_id: 's1', awarded_points: 30, scoring_policy_version: 'v1.0', recorded_at: '2026-10-21', idempotency_key: 'k1' },
      { id: 'c2', guild_war_id: 'test-war-1', guild_id: 'guild-a', user_id: 'user-2', contribution_type: 'workout', source_id: 's2', awarded_points: 30, scoring_policy_version: 'v1.0', recorded_at: '2026-10-21', idempotency_key: 'k2' },
      { id: 'c3', guild_war_id: 'test-war-1', guild_id: 'guild-a', user_id: 'user-3', contribution_type: 'workout', source_id: 's3', awarded_points: 30, scoring_policy_version: 'v1.0', recorded_at: '2026-10-21', idempotency_key: 'k3' },

      { id: 'c4', guild_war_id: 'test-war-1', guild_id: 'guild-b', user_id: 'user-4', contribution_type: 'workout', source_id: 's4', awarded_points: 40, scoring_policy_version: 'v1.0', recorded_at: '2026-10-21', idempotency_key: 'k4' },
      { id: 'c5', guild_war_id: 'test-war-1', guild_id: 'guild-b', user_id: 'user-5', contribution_type: 'workout', source_id: 's5', awarded_points: 30, scoring_policy_version: 'v1.0', recorded_at: '2026-10-21', idempotency_key: 'k5' },
    ];

    const scores = calculateGuildWarScores(baseConsistencyWar, contributions, participants);

    expect(scores.challengerRaw).toBe(90);
    expect(scores.challengerNormalized).toBe(30.00);
    expect(scores.challengerEligibleCount).toBe(3);

    expect(scores.opponentRaw).toBe(70);
    expect(scores.opponentNormalized).toBe(35.00);
    expect(scores.opponentEligibleCount).toBe(2);

    // Guild B leads!
    expect(scores.currentLeaderGuildId).toBe('guild-b');
  });

  it('9. applies deterministic tie-breaking (participation rate then raw points)', () => {
    // Both guilds have normalized score 20.00
    // Challenger has 2 of 2 participating (100% participation)
    // Opponent has 1 of 2 participating (50% participation)
    const participants: GuildWarParticipant[] = [
      { id: 'p1', guild_war_id: 'test-war-1', guild_id: 'guild-a', user_id: 'user-1', is_eligible: true, contribution_points: 20, qualifying_count: 2, weekly_bonus_earned: false },
      { id: 'p2', guild_war_id: 'test-war-1', guild_id: 'guild-a', user_id: 'user-2', is_eligible: true, contribution_points: 20, qualifying_count: 2, weekly_bonus_earned: false },
      { id: 'p3', guild_war_id: 'test-war-1', guild_id: 'guild-b', user_id: 'user-3', is_eligible: true, contribution_points: 40, qualifying_count: 4, weekly_bonus_earned: false },
      { id: 'p4', guild_war_id: 'test-war-1', guild_id: 'guild-b', user_id: 'user-4', is_eligible: true, contribution_points: 0, qualifying_count: 0, weekly_bonus_earned: false },
    ];

    const contributions: GuildWarContribution[] = [
      { id: 'c1', guild_war_id: 'test-war-1', guild_id: 'guild-a', user_id: 'user-1', contribution_type: 'workout', source_id: 's1', awarded_points: 20, scoring_policy_version: 'v1.0', recorded_at: '2026-10-21', idempotency_key: 'k1' },
      { id: 'c2', guild_war_id: 'test-war-1', guild_id: 'guild-a', user_id: 'user-2', contribution_type: 'workout', source_id: 's2', awarded_points: 20, scoring_policy_version: 'v1.0', recorded_at: '2026-10-21', idempotency_key: 'k2' },
      { id: 'c3', guild_war_id: 'test-war-1', guild_id: 'guild-b', user_id: 'user-3', contribution_type: 'workout', source_id: 's3', awarded_points: 40, scoring_policy_version: 'v1.0', recorded_at: '2026-10-21', idempotency_key: 'k3' },
    ];

    const scores = calculateGuildWarScores(baseConsistencyWar, contributions, participants);
    expect(scores.challengerNormalized).toBe(20.00);
    expect(scores.opponentNormalized).toBe(20.00);

    expect(scores.challengerParticipationRate).toBe(1.0);
    expect(scores.opponentParticipationRate).toBe(0.5);

    // Guild A wins on tie-break via higher participation rate
    expect(scores.currentLeaderGuildId).toBe('guild-a');
  });

  it('10. finalization generates immutable results and preserves scores', () => {
    const participants: GuildWarParticipant[] = [
      { id: 'p1', guild_war_id: 'test-war-1', guild_id: 'guild-a', user_id: 'user-1', is_eligible: true, contribution_points: 20, qualifying_count: 2, weekly_bonus_earned: false },
      { id: 'p2', guild_war_id: 'test-war-1', guild_id: 'guild-b', user_id: 'user-2', is_eligible: true, contribution_points: 10, qualifying_count: 1, weekly_bonus_earned: false },
    ];

    const contributions: GuildWarContribution[] = [
      { id: 'c1', guild_war_id: 'test-war-1', guild_id: 'guild-a', user_id: 'user-1', contribution_type: 'workout', source_id: 's1', awarded_points: 20, scoring_policy_version: 'v1.0', recorded_at: '2026-10-21', idempotency_key: 'k1' },
      { id: 'c2', guild_war_id: 'test-war-1', guild_id: 'guild-b', user_id: 'user-2', contribution_type: 'workout', source_id: 's2', awarded_points: 10, scoring_policy_version: 'v1.0', recorded_at: '2026-10-21', idempotency_key: 'k2' },
    ];

    const finalized = finalizeGuildWar(baseConsistencyWar, contributions, participants);

    expect(finalized.updatedWar.status).toBe('completed');
    expect(finalized.updatedWar.completed_at).toBeDefined();
    expect(finalized.updatedWar.winner_guild_id).toBe('guild-a');
    expect(finalized.results).toHaveLength(2);

    const winnerResult = finalized.results.find(r => r.is_winner);
    expect(winnerResult?.guild_id).toBe('guild-a');
    expect(winnerResult?.final_rank).toBe(1);
  });
});
