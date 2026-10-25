import { describe, it, expect, beforeEach } from 'vitest';
import { gymBroStore } from '../storage';
import { SEED_USERS } from '../seed-data';

describe('GymBro Full System Integration Tests', () => {
  beforeEach(() => {
    // Reset localStorage mock for clean test run
    gymBroStore.init();
  });

  describe('1. Authentication & Multi-Lifter Management', () => {
    it('registers a new lifter with minimal details', () => {
      const res = gymBroStore.register({
        full_name: 'David Goggins',
        email: 'david@stayhard.com',
        phone: '+1 555-0199',
        age: 35,
        password: 'cant_hurt_me',
      });

      expect(res.success).toBe(true);
      expect(res.user).toBeDefined();
      expect(res.user?.full_name).toBe('David Goggins');
      expect(res.user?.email).toBe('david@stayhard.com');
      expect(res.user?.age).toBe(35);
      expect(gymBroStore.isLoggedIn()).toBe(true);
    });

    it('rejects registration with invalid age under 13', () => {
      const res = gymBroStore.register({
        full_name: 'Kid Lifter',
        email: 'kid@gymbro.app',
        phone: '+1 555-0100',
        age: 11,
        password: 'secretpassword',
      });

      expect(res.success).toBe(false);
      expect(res.error).toContain('13');
    });

    it('rejects duplicate email registration', () => {
      const res = gymBroStore.register({
        full_name: 'Alex Imposter',
        email: 'alex@gymbro.app', // Alex Rivera seed email
        phone: '+1 555-9999',
        age: 24,
        password: 'password123',
      });

      expect(res.success).toBe(false);
      expect(res.error).toContain('already exists');
    });

    it('logs in existing user by email, phone, and username', () => {
      // By email
      const loginEmail = gymBroStore.login('alex@gymbro.app', 'gymbro123');
      expect(loginEmail.success).toBe(true);
      expect(loginEmail.user?.username).toBe('alex_lifts');

      // By phone (clean digits)
      const loginPhone = gymBroStore.login('555-0101', 'gymbro123');
      expect(loginPhone.success).toBe(true);

      // By username
      const loginUsername = gymBroStore.login('alex_lifts', 'gymbro123');
      expect(loginUsername.success).toBe(true);
    });

    it('logs out and clears session', () => {
      gymBroStore.login('alex@gymbro.app', 'gymbro123');
      expect(gymBroStore.isLoggedIn()).toBe(true);

      gymBroStore.logout();
      expect(gymBroStore.isLoggedIn()).toBe(false);
    });
  });

  describe('2. Workout Tracking & Automatic PR Detection', () => {
    it('logs a workout, calculates volume, and updates streaks', () => {
      const initialUser = gymBroStore.getCurrentUser();
      const initialStreak = initialUser.current_streak || 0;
      const initialTotal = initialUser.total_workouts || 0;

      const workout = gymBroStore.logWorkout({
        title: 'Heavy Push Day',
        split: 'Push',
        duration_minutes: 75,
        energy_rating: 9,
        exercises: [
          { id: 'ex-1', exercise_name: 'Flat Barbell Bench', sets: 4, reps: 8, weight_kg: 100 },
          { id: 'ex-2', exercise_name: 'Overhead Press', sets: 3, reps: 10, weight_kg: 60 },
        ],
        notes: 'Felt light weight baby!',
        postToFeed: true,
      });

      expect(workout.total_volume_kg).toBe(4 * 8 * 100 + 3 * 10 * 60); // 3200 + 1800 = 5000 kg
      expect(workout.split).toBe('Push');

      const updatedUser = gymBroStore.getCurrentUser();
      expect(updatedUser.total_workouts).toBe(initialTotal + 1);
      expect(updatedUser.current_streak).toBe(initialStreak + 1);
    });

    it('automatically records PR when exercise is flagged as PR in workout', () => {
      const prsBefore = gymBroStore.getPersonalRecords('Incline Dumbbell Press').length;

      gymBroStore.logWorkout({
        title: 'Chest Day PR Attempt',
        split: 'Push',
        duration_minutes: 60,
        energy_rating: 10,
        exercises: [
          { id: 'pr-ex', exercise_name: 'Incline Dumbbell Press', sets: 1, reps: 5, weight_kg: 44, is_pr: true },
        ],
      });

      const prsAfter = gymBroStore.getPersonalRecords('Incline Dumbbell Press');
      expect(prsAfter.length).toBeGreaterThan(prsBefore);
      expect(prsAfter[0].weight_kg).toBe(44);
    });
  });

  describe('3. Guilds & Guild Wars System', () => {
    it('creates a new guild with captain membership', () => {
      const currentUser = gymBroStore.getCurrentUser();
      const res = gymBroStore.createGuild({
        name: 'Thunder Iron Battalion',
        description: 'Heavy compound lifts only.',
        emblem_url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=100',
      });

      expect(res.success).toBe(true);
      expect(res.guild?.name).toBe('Thunder Iron Battalion');
      expect(res.guild?.captain_id).toBe(currentUser.id);

      const members = gymBroStore.getGuildMembers(res.guild!.id);
      expect(members.some((m) => m.user_id === currentUser.id && m.role === 'captain')).toBe(true);
    });

    it('sends guild invitation to an accepted friend and processes acceptance', () => {
      const currentUser = gymBroStore.getCurrentUser();
      const friends = gymBroStore.getAcceptedFriends(currentUser.id);
      expect(friends.length).toBeGreaterThan(0);

      const targetFriend = friends[0];
      const guilds = gymBroStore.getGuilds();
      const myGuild = guilds[0];

      const inviteRes = gymBroStore.sendGuildInvitation(myGuild.id, targetFriend.id);
      expect(inviteRes.success).toBe(true);

      const userInvites = gymBroStore.getUserGuildInvitations(targetFriend.id);
      expect(userInvites.length).toBeGreaterThan(0);
      const invite = userInvites[0];

      // Switch to targetFriend to accept their invitation
      gymBroStore.switchUser(targetFriend.id);
      const respondRes = gymBroStore.respondGuildInvitation(invite.id, true);
      expect(respondRes.success).toBe(true);

      const members = gymBroStore.getGuildMembers(myGuild.id);
      expect(members.some((m) => m.user_id === targetFriend.id)).toBe(true);

      // Switch back to original user
      gymBroStore.switchUser(currentUser.id);
    });

    it('creates a war challenge, accepts it, and scores contributions fairly', () => {
      const guilds = gymBroStore.getGuilds();
      expect(guilds.length).toBeGreaterThanOrEqual(2);

      const challenger = guilds[0];
      const opponent = guilds[1];

      // Ensure challenger captain is current user
      gymBroStore.switchUser(challenger.captain_id);

      const challengeRes = gymBroStore.createGuildWarChallenge({
        challengerGuildId: challenger.id,
        opponentGuildId: opponent.id,
        category: 'consistency',
        durationDays: 7,
      });

      expect(challengeRes.success).toBe(true);
      expect(challengeRes.war?.status).toBe('pending');

      // Opponent captain accepts war challenge
      gymBroStore.switchUser(opponent.captain_id);
      const acceptRes = gymBroStore.respondGuildWarChallenge(challengeRes.war!.id, true);
      expect(acceptRes.success).toBe(true);

      const activeWar = gymBroStore.getGuildWarById(challengeRes.war!.id);
      expect(activeWar?.status).toBe('active');
      expect(activeWar?.challenger_normalized_score).toBeDefined();
      expect(activeWar?.opponent_normalized_score).toBeDefined();

      // Finalize war
      const finalRes = gymBroStore.finalizeWar(challengeRes.war!.id);
      expect(finalRes.success).toBe(true);
      expect(finalRes.resultWar?.status).toBe('completed');
    });
  });
});
