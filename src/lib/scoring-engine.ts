import { 
  GuildWar, 
  GuildWarCategory, 
  GuildWarContribution, 
  GuildWarParticipant, 
  GuildWarResult, 
  ScoringPolicy, 
  Workout, 
  PersonalRecord 
} from '@/types';

export const DEFAULT_SCORING_POLICIES: Record<GuildWarCategory, ScoringPolicy> = {
  consistency: {
    version: 'v1.0',
    category: 'consistency',
    base_points: 10,
    daily_cap: 1, // Max 1 scored workout per member per day
    min_duration_minutes: 30, // Minimum 30 mins to qualify
    weekly_bonus_points: 20, // 20 bonus points for hitting 4+ workouts in a week
    weekly_goal_workouts: 4,
    min_pr_improvement_kg: 0,
    min_participation_rate: 0.5, // 50% participation threshold
    formula_description: 'Normalized = Total Points ÷ Eligible Roster. Qualifying workout (≥30m) = 10 pts (max 1/day). Weekly 4-workout bonus = 20 pts.',
  },
  strength: {
    version: 'v1.0',
    category: 'strength',
    base_points: 5,
    daily_cap: 999,
    min_duration_minutes: 0,
    weekly_bonus_points: 0,
    weekly_goal_workouts: 0,
    min_pr_improvement_kg: 1.0, // Minimum 1.0 kg increment
    min_participation_rate: 0.5,
    formula_description: 'Normalized = Total Points ÷ Eligible Roster. Valid new PR = 5 pts. One PR award per distinct exercise per member during competition.',
  },
};

/**
 * Checks if a workout session qualifies for points in a Workout Consistency War
 */
export function evaluateWorkoutContribution(
  workout: Workout,
  war: GuildWar,
  userContributionsInWar: GuildWarContribution[],
  isUserEligible: boolean
): {
  qualifies: boolean;
  awardedPoints: number;
  reason?: string;
  isWeeklyBonus: boolean;
  idempotencyKey: string;
} {
  const policy = war.scoring_policy || DEFAULT_SCORING_POLICIES.consistency;
  const idempotencyKey = `war_${war.id}_workout_${workout.id}`;

  if (!isUserEligible) {
    return { qualifies: false, awardedPoints: 0, reason: 'Member not in frozen competition roster', isWeeklyBonus: false, idempotencyKey };
  }

  // Check if war is active
  const now = new Date(workout.created_at || new Date()).getTime();
  const warStart = new Date(war.starts_at).getTime();
  const warEnd = new Date(war.ends_at).getTime();

  if (now < warStart || now > warEnd) {
    return { qualifies: false, awardedPoints: 0, reason: 'Workout completed outside active war window', isWeeklyBonus: false, idempotencyKey };
  }

  // Check minimum duration
  if (workout.duration_minutes < policy.min_duration_minutes) {
    return { 
      qualifies: false, 
      awardedPoints: 0, 
      reason: `Duration (${workout.duration_minutes}m) below minimum ${policy.min_duration_minutes}m required`, 
      isWeeklyBonus: false, 
      idempotencyKey 
    };
  }

  // Check for duplicate submission
  const alreadyAwarded = userContributionsInWar.some(c => c.source_id === workout.id || c.idempotency_key === idempotencyKey);
  if (alreadyAwarded) {
    return { qualifies: false, awardedPoints: 0, reason: 'Workout already scored in this war', isWeeklyBonus: false, idempotencyKey };
  }

  // Check daily scoring cap (1 workout per calendar day)
  const rawDate = workout.created_at || workout.completed_at;
  const parsedDate = rawDate && !isNaN(Date.parse(rawDate)) ? new Date(rawDate) : new Date();
  const workoutDateStr = parsedDate.toISOString().split('T')[0];
  const sameDayContribution = userContributionsInWar.some(c => {
    if (c.contribution_type !== 'workout') return false;
    const cDate = new Date(c.recorded_at).toISOString().split('T')[0];
    return cDate === workoutDateStr;
  });

  if (sameDayContribution) {
    return { 
      qualifies: false, 
      awardedPoints: 0, 
      reason: 'Daily scoring cap reached (1 qualifying workout per day)', 
      isWeeklyBonus: false, 
      idempotencyKey 
    };
  }

  let totalPoints = policy.base_points;
  let isWeeklyBonus = false;

  // Check weekly bonus: count workouts in the last 7 days including this one
  const workoutContributionsCount = userContributionsInWar.filter(c => c.contribution_type === 'workout').length + 1;
  const alreadyEarnedWeeklyBonus = userContributionsInWar.some(c => c.contribution_type === 'weekly_bonus');

  if (!alreadyEarnedWeeklyBonus && workoutContributionsCount >= policy.weekly_goal_workouts) {
    totalPoints += policy.weekly_bonus_points;
    isWeeklyBonus = true;
  }

  return {
    qualifies: true,
    awardedPoints: totalPoints,
    isWeeklyBonus,
    idempotencyKey,
  };
}

/**
 * Checks if a Personal Record qualifies for points in a Strength & PR War
 */
export function evaluatePRContribution(
  pr: PersonalRecord,
  war: GuildWar,
  userContributionsInWar: GuildWarContribution[],
  isUserEligible: boolean
): {
  qualifies: boolean;
  awardedPoints: number;
  reason?: string;
  idempotencyKey: string;
} {
  const policy = war.scoring_policy || DEFAULT_SCORING_POLICIES.strength;
  const idempotencyKey = `war_${war.id}_pr_${pr.id}`;

  if (!isUserEligible) {
    return { qualifies: false, awardedPoints: 0, reason: 'Member not in frozen competition roster', idempotencyKey };
  }

  // Check if war is active
  const now = new Date(pr.achieved_at || new Date()).getTime();
  const warStart = new Date(war.starts_at).getTime();
  const warEnd = new Date(war.ends_at).getTime();

  if (now < warStart || now > warEnd) {
    return { qualifies: false, awardedPoints: 0, reason: 'PR achieved outside active war window', idempotencyKey };
  }

  // Check if already scored
  const alreadyAwarded = userContributionsInWar.some(c => c.source_id === pr.id || c.idempotency_key === idempotencyKey);
  if (alreadyAwarded) {
    return { qualifies: false, awardedPoints: 0, reason: 'PR already scored in this war', idempotencyKey };
  }

  // Progression policy: check if user already claimed a PR for this exact exercise in this war
  const exerciseNormalized = pr.exercise_name.trim().toLowerCase();
  const alreadyClaimedExercise = userContributionsInWar.some(c => {
    return c.metadata?.exercise_name?.trim().toLowerCase() === exerciseNormalized;
  });

  if (alreadyClaimedExercise) {
    return { 
      qualifies: false, 
      awardedPoints: 0, 
      reason: `PR points for ${pr.exercise_name} already claimed in this war (max 1 per exercise per member)`, 
      idempotencyKey 
    };
  }

  // Check positive progression
  if (pr.previous_weight_kg && (pr.weight_kg - pr.previous_weight_kg) < policy.min_pr_improvement_kg) {
    return {
      qualifies: false,
      awardedPoints: 0,
      reason: `Improvement must be at least ${policy.min_pr_improvement_kg} kg over previous best`,
      idempotencyKey
    };
  }

  return {
    qualifies: true,
    awardedPoints: policy.base_points,
    idempotencyKey,
  };
}

/**
 * Calculates raw and normalized scores for both competing Guilds
 */
export function calculateGuildWarScores(
  war: GuildWar,
  contributions: GuildWarContribution[],
  participants: GuildWarParticipant[]
): {
  challengerRaw: number;
  challengerNormalized: number;
  challengerEligibleCount: number;
  challengerActiveCount: number;
  challengerParticipationRate: number;
  opponentRaw: number;
  opponentNormalized: number;
  opponentEligibleCount: number;
  opponentActiveCount: number;
  opponentParticipationRate: number;
  currentLeaderGuildId: string | null;
} {
  // Challenger roster & contributions
  const challengerParticipants = participants.filter(
    p => p.guild_id === war.challenger_guild_id && p.is_eligible
  );
  const challengerEligibleCount = Math.max(1, challengerParticipants.length);
  const challengerEligibleUserIds = new Set(challengerParticipants.map(p => p.user_id));

  const challengerContributions = contributions.filter(
    c => c.guild_id === war.challenger_guild_id && challengerEligibleUserIds.has(c.user_id)
  );

  const challengerRaw = challengerContributions.reduce((acc, c) => acc + c.awarded_points, 0);
  const challengerActiveContributors = new Set(challengerContributions.map(c => c.user_id)).size;
  const challengerParticipationRate = Math.round((challengerActiveContributors / challengerEligibleCount) * 100) / 100;
  const challengerNormalized = Math.round((challengerRaw / challengerEligibleCount) * 100) / 100;

  // Opponent roster & contributions
  const opponentParticipants = participants.filter(
    p => p.guild_id === war.opponent_guild_id && p.is_eligible
  );
  const opponentEligibleCount = Math.max(1, opponentParticipants.length);
  const opponentEligibleUserIds = new Set(opponentParticipants.map(p => p.user_id));

  const opponentContributions = contributions.filter(
    c => c.guild_id === war.opponent_guild_id && opponentEligibleUserIds.has(c.user_id)
  );

  const opponentRaw = opponentContributions.reduce((acc, c) => acc + c.awarded_points, 0);
  const opponentActiveContributors = new Set(opponentContributions.map(c => c.user_id)).size;
  const opponentParticipationRate = Math.round((opponentActiveContributors / opponentEligibleCount) * 100) / 100;
  const opponentNormalized = Math.round((opponentRaw / opponentEligibleCount) * 100) / 100;

  // Determine leader with deterministic tie-breaking:
  // 1. Higher Normalized Score
  // 2. Higher Member Participation Rate
  // 3. Higher Raw Points
  let currentLeaderGuildId: string | null = null;
  if (challengerNormalized > opponentNormalized) {
    currentLeaderGuildId = war.challenger_guild_id;
  } else if (opponentNormalized > challengerNormalized) {
    currentLeaderGuildId = war.opponent_guild_id;
  } else {
    // Tie-break 1: participation rate
    if (challengerParticipationRate > opponentParticipationRate) {
      currentLeaderGuildId = war.challenger_guild_id;
    } else if (opponentParticipationRate > challengerParticipationRate) {
      currentLeaderGuildId = war.opponent_guild_id;
    } else {
      // Tie-break 2: raw points
      if (challengerRaw > opponentRaw) {
        currentLeaderGuildId = war.challenger_guild_id;
      } else if (opponentRaw > challengerRaw) {
        currentLeaderGuildId = war.opponent_guild_id;
      } else {
        currentLeaderGuildId = null; // Perfect draw
      }
    }
  }

  return {
    challengerRaw,
    challengerNormalized,
    challengerEligibleCount,
    challengerActiveCount: challengerActiveContributors,
    challengerParticipationRate,
    opponentRaw,
    opponentNormalized,
    opponentEligibleCount,
    opponentActiveCount: opponentActiveContributors,
    opponentParticipationRate,
    currentLeaderGuildId,
  };
}

/**
 * Authoritative finalization of a Guild War
 */
export function finalizeGuildWar(
  war: GuildWar,
  contributions: GuildWarContribution[],
  participants: GuildWarParticipant[]
): {
  updatedWar: GuildWar;
  results: GuildWarResult[];
} {
  const scores = calculateGuildWarScores(war, contributions, participants);
  const winnerGuildId = scores.currentLeaderGuildId || war.challenger_guild_id;
  const finalizedAt = new Date().toISOString();

  const challengerResult: GuildWarResult = {
    id: `result_${war.id}_${war.challenger_guild_id}`,
    guild_war_id: war.id,
    guild_id: war.challenger_guild_id,
    raw_score: scores.challengerRaw,
    normalized_score: scores.challengerNormalized,
    eligible_members_count: scores.challengerEligibleCount,
    participating_members_count: scores.challengerActiveCount,
    participation_rate: scores.challengerParticipationRate,
    final_rank: winnerGuildId === war.challenger_guild_id ? 1 : 2,
    is_winner: winnerGuildId === war.challenger_guild_id,
    finalized_at: finalizedAt,
  };

  const opponentResult: GuildWarResult = {
    id: `result_${war.id}_${war.opponent_guild_id}`,
    guild_war_id: war.id,
    guild_id: war.opponent_guild_id,
    raw_score: scores.opponentRaw,
    normalized_score: scores.opponentNormalized,
    eligible_members_count: scores.opponentEligibleCount,
    participating_members_count: scores.opponentActiveCount,
    participation_rate: scores.opponentParticipationRate,
    final_rank: winnerGuildId === war.opponent_guild_id ? 1 : 2,
    is_winner: winnerGuildId === war.opponent_guild_id,
    finalized_at: finalizedAt,
  };

  const updatedWar: GuildWar = {
    ...war,
    status: 'completed',
    completed_at: finalizedAt,
    challenger_raw_score: scores.challengerRaw,
    challenger_normalized_score: scores.challengerNormalized,
    opponent_raw_score: scores.opponentRaw,
    opponent_normalized_score: scores.opponentNormalized,
    winner_guild_id: winnerGuildId,
    results: [challengerResult, opponentResult],
  };

  return { updatedWar, results: [challengerResult, opponentResult] };
}
