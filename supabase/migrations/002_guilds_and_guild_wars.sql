-- ==============================================================================
-- GYMBRO MIGRATION 002: GUILDS & GUILD WARS SYSTEM
-- Competitive teams of accepted gym friends, fair normalization & war scoring
-- ==============================================================================

-- 1. FRIENDSHIPS (Guild invites are strictly limited to accepted GymBro friends)
CREATE TABLE IF NOT EXISTS public.friendships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    friend_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    status TEXT DEFAULT 'accepted' CHECK (status IN ('accepted', 'pending', 'rejected')) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_friendship UNIQUE (user_id, friend_id),
    CONSTRAINT cannot_friend_self CHECK (user_id <> friend_id)
);

-- 2. GUILDS
CREATE TABLE IF NOT EXISTS public.guilds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    emblem_url TEXT NOT NULL,
    captain_id UUID REFERENCES public.profiles(id) ON DELETE RESTRICT NOT NULL,
    invite_code TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. GUILD MEMBERS
CREATE TABLE IF NOT EXISTS public.guild_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guild_id UUID REFERENCES public.guilds(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    role TEXT DEFAULT 'member' CHECK (role IN ('captain', 'member')) NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')) NOT NULL,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_guild_member UNIQUE (guild_id, user_id)
);

-- 4. GUILD INVITATIONS
CREATE TABLE IF NOT EXISTS public.guild_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guild_id UUID REFERENCES public.guilds(id) ON DELETE CASCADE NOT NULL,
    inviter_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    invitee_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'expired')) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    responded_at TIMESTAMPTZ,
    CONSTRAINT cannot_invite_self CHECK (inviter_user_id <> invitee_user_id)
);

-- 5. GUILD WARS
CREATE TABLE IF NOT EXISTS public.guild_wars (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challenger_guild_id UUID REFERENCES public.guilds(id) ON DELETE CASCADE NOT NULL,
    opponent_guild_id UUID REFERENCES public.guilds(id) ON DELETE CASCADE NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('consistency', 'strength')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'cancelled')),
    duration_days INT NOT NULL DEFAULT 7 CHECK (duration_days IN (7, 30)),
    starts_at TIMESTAMPTZ NOT NULL,
    ends_at TIMESTAMPTZ NOT NULL,
    scoring_policy_version TEXT NOT NULL DEFAULT 'v1.0',
    scoring_policy_snapshot JSONB NOT NULL,
    created_by UUID REFERENCES public.profiles(id) NOT NULL,
    accepted_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    roster_frozen_at TIMESTAMPTZ,
    challenger_raw_score NUMERIC(10, 2) DEFAULT 0,
    challenger_normalized_score NUMERIC(10, 2) DEFAULT 0,
    opponent_raw_score NUMERIC(10, 2) DEFAULT 0,
    opponent_normalized_score NUMERIC(10, 2) DEFAULT 0,
    winner_guild_id UUID REFERENCES public.guilds(id) ON DELETE SET NULL,
    CONSTRAINT distinct_guilds CHECK (challenger_guild_id <> opponent_guild_id)
);

-- 6. GUILD WAR PARTICIPANTS (Frozen roster snapshot at war start)
CREATE TABLE IF NOT EXISTS public.guild_war_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guild_war_id UUID REFERENCES public.guild_wars(id) ON DELETE CASCADE NOT NULL,
    guild_id UUID REFERENCES public.guilds(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    is_eligible BOOLEAN DEFAULT TRUE NOT NULL,
    contribution_points NUMERIC(10, 2) DEFAULT 0 NOT NULL,
    qualifying_count INT DEFAULT 0 NOT NULL,
    weekly_bonus_earned BOOLEAN DEFAULT FALSE NOT NULL,
    CONSTRAINT unique_war_participant UNIQUE (guild_war_id, guild_id, user_id)
);

-- 7. GUILD WAR CONTRIBUTIONS (Immutable verified point logs with idempotency)
CREATE TABLE IF NOT EXISTS public.guild_war_contributions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guild_war_id UUID REFERENCES public.guild_wars(id) ON DELETE CASCADE NOT NULL,
    guild_id UUID REFERENCES public.guilds(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    contribution_type TEXT NOT NULL CHECK (contribution_type IN ('workout', 'pr', 'weekly_bonus')),
    source_id TEXT NOT NULL,
    awarded_points NUMERIC(6, 2) NOT NULL,
    scoring_policy_version TEXT NOT NULL DEFAULT 'v1.0',
    recorded_at TIMESTAMPTZ DEFAULT NOW(),
    idempotency_key TEXT UNIQUE NOT NULL,
    metadata JSONB
);

-- 8. GUILD WAR RESULTS (Immutable historical completion archives)
CREATE TABLE IF NOT EXISTS public.guild_war_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guild_war_id UUID REFERENCES public.guild_wars(id) ON DELETE CASCADE NOT NULL,
    guild_id UUID REFERENCES public.guilds(id) ON DELETE CASCADE NOT NULL,
    raw_score NUMERIC(10, 2) NOT NULL,
    normalized_score NUMERIC(10, 2) NOT NULL,
    eligible_members_count INT NOT NULL,
    participating_members_count INT NOT NULL,
    participation_rate NUMERIC(5, 4) NOT NULL,
    final_rank INT NOT NULL,
    is_winner BOOLEAN NOT NULL,
    finalized_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_war_guild_result UNIQUE (guild_war_id, guild_id)
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guilds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guild_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guild_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guild_wars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guild_war_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guild_war_contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guild_war_results ENABLE ROW LEVEL SECURITY;

-- Friendships policies
CREATE POLICY "Users can view own friendships"
ON public.friendships FOR SELECT
USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can manage own friendships"
ON public.friendships FOR ALL
USING (auth.uid() = user_id);

-- Guilds policies
CREATE POLICY "Guilds are viewable by members or accepted friends"
ON public.guilds FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can create guilds"
ON public.guilds FOR INSERT
WITH CHECK (auth.uid() = captain_id);

CREATE POLICY "Captains can update own guild"
ON public.guilds FOR UPDATE
USING (auth.uid() = captain_id);

-- Guild Members policies
CREATE POLICY "Guild members viewable by guild members"
ON public.guild_members FOR SELECT
USING (true);

CREATE POLICY "Captains and users can manage memberships"
ON public.guild_members FOR ALL
USING (
    auth.uid() = user_id 
    OR EXISTS (
        SELECT 1 FROM public.guilds 
        WHERE guilds.id = guild_members.guild_id AND guilds.captain_id = auth.uid()
    )
);

-- Guild Invitations policies
CREATE POLICY "Invitations viewable by sender or recipient"
ON public.guild_invitations FOR SELECT
USING (auth.uid() = inviter_user_id OR auth.uid() = invitee_user_id);

CREATE POLICY "Captains can create invitations"
ON public.guild_invitations FOR INSERT
WITH CHECK (auth.uid() = inviter_user_id);

CREATE POLICY "Invitees can respond to invitations"
ON public.guild_invitations FOR UPDATE
USING (auth.uid() = invitee_user_id);

-- Guild Wars policies
CREATE POLICY "Guild wars viewable by participating guild members"
ON public.guild_wars FOR SELECT
USING (true);

CREATE POLICY "Captains can create guild wars"
ON public.guild_wars FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.guilds 
        WHERE guilds.id = challenger_guild_id AND guilds.captain_id = auth.uid()
    )
);

CREATE POLICY "Opponent captains can accept or update guild wars"
ON public.guild_wars FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.guilds 
        WHERE (guilds.id = challenger_guild_id OR guilds.id = opponent_guild_id) 
        AND guilds.captain_id = auth.uid()
    )
);

-- War Participants & Contributions & Results
CREATE POLICY "Participants viewable by all"
ON public.guild_war_participants FOR SELECT USING (true);

CREATE POLICY "Contributions viewable by all"
ON public.guild_war_contributions FOR SELECT USING (true);

CREATE POLICY "Results viewable by all"
ON public.guild_war_results FOR SELECT USING (true);

-- ==============================================================================
-- HELPER FUNCTIONS FOR SCORING & FINALIZATION
-- ==============================================================================

-- Freeze roster when war transitions from pending to active
CREATE OR REPLACE FUNCTION public.freeze_guild_war_roster(war_id UUID)
RETURNS VOID AS $$
DECLARE
    war RECORD;
BEGIN
    SELECT * INTO war FROM public.guild_wars WHERE id = war_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Guild War not found';
    END IF;

    -- Snapshot challenger members
    INSERT INTO public.guild_war_participants (guild_war_id, guild_id, user_id, is_eligible)
    SELECT war.id, war.challenger_guild_id, gm.user_id, TRUE
    FROM public.guild_members gm
    WHERE gm.guild_id = war.challenger_guild_id AND gm.status = 'active'
    ON CONFLICT (guild_war_id, guild_id, user_id) DO NOTHING;

    -- Snapshot opponent members
    INSERT INTO public.guild_war_participants (guild_war_id, guild_id, user_id, is_eligible)
    SELECT war.id, war.opponent_guild_id, gm.user_id, TRUE
    FROM public.guild_members gm
    WHERE gm.guild_id = war.opponent_guild_id AND gm.status = 'active'
    ON CONFLICT (guild_war_id, guild_id, user_id) DO NOTHING;

    -- Mark frozen timestamp
    UPDATE public.guild_wars 
    SET roster_frozen_at = NOW(), status = 'active', accepted_at = NOW()
    WHERE id = war_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
