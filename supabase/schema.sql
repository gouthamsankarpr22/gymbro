-- ==============================================================================
-- GYMBRO DATABASE SCHEMA (Supabase / PostgreSQL)
-- A Social Fitness Platform for Gym Friends Separated by Distance
-- ==============================================================================

-- 1. PROFILES (Extends Supabase Auth users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    bio TEXT,
    hometown_gym TEXT DEFAULT 'Metro Fitness OG',
    current_location TEXT DEFAULT 'College Campus Gym',
    current_streak INT DEFAULT 1,
    total_workouts INT DEFAULT 0,
    favorite_lift TEXT DEFAULT 'Incline Barbell Bench',
    big_three_total_kg NUMERIC(6, 1) DEFAULT 420.0,
    status TEXT DEFAULT 'pumped' CHECK (status IN ('pumped', 'resting', 'needs_motivation', 'at_the_gym')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. SQUADS (Private circles for gym partners)
CREATE TABLE IF NOT EXISTS public.squads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    avatar_url TEXT,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    invite_code TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. SQUAD MEMBERS
CREATE TABLE IF NOT EXISTS public.squad_members (
    squad_id UUID REFERENCES public.squads(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member' CHECK (role IN ('leader', 'member')),
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (squad_id, user_id)
);

-- 4. WORKOUTS (Daily sessions logged)
CREATE TABLE IF NOT EXISTS public.workouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    split TEXT NOT NULL CHECK (split IN ('Push', 'Pull', 'Legs', 'Upper', 'Lower', 'Arms', 'Full Body', 'Cardio')),
    duration_minutes INT NOT NULL DEFAULT 60,
    notes TEXT,
    photo_url TEXT,
    total_volume_kg NUMERIC(8, 1) DEFAULT 0,
    energy_rating INT DEFAULT 8 CHECK (energy_rating BETWEEN 1 AND 10),
    completed_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. WORKOUT EXERCISES
CREATE TABLE IF NOT EXISTS public.workout_exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workout_id UUID REFERENCES public.workouts(id) ON DELETE CASCADE NOT NULL,
    exercise_name TEXT NOT NULL,
    sets INT NOT NULL DEFAULT 3,
    reps INT NOT NULL DEFAULT 10,
    weight_kg NUMERIC(6, 1) NOT NULL DEFAULT 60,
    is_pr BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. PERSONAL RECORDS (The Iron Wall)
CREATE TABLE IF NOT EXISTS public.personal_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    exercise_name TEXT NOT NULL,
    weight_kg NUMERIC(6, 1) NOT NULL,
    reps INT NOT NULL DEFAULT 1,
    one_rep_max_est NUMERIC(6, 1) NOT NULL,
    previous_weight_kg NUMERIC(6, 1),
    proof_media_url TEXT,
    shoutout_note TEXT,
    achieved_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. FEED POSTS (Social Chalkboard)
CREATE TABLE IF NOT EXISTS public.feed_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    squad_id UUID REFERENCES public.squads(id) ON DELETE SET NULL,
    type TEXT NOT NULL CHECK (type IN ('workout', 'pr', 'meme', 'nudge', 'announcement')),
    content TEXT NOT NULL,
    media_url TEXT,
    workout_id UUID REFERENCES public.workouts(id) ON DELETE SET NULL,
    pr_id UUID REFERENCES public.personal_records(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. POST REACTIONS (Fist bumps, fire, light weight baby, hype, dead)
CREATE TABLE IF NOT EXISTS public.post_reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES public.feed_posts(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    reaction_type TEXT NOT NULL CHECK (reaction_type IN ('fist_bump', 'fire', 'heavy', 'hype', 'skull')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (post_id, user_id, reaction_type)
);

-- 9. COMMENTS
CREATE TABLE IF NOT EXISTS public.post_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES public.feed_posts(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. BRO NUDGES (Spotting your distant bro)
CREATE TABLE IF NOT EXISTS public.bro_nudges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    to_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'hit_gym', 'dismissed')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.squads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.squad_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personal_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feed_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bro_nudges ENABLE ROW LEVEL SECURITY;

-- Read policies: allow members to read brotherhood data
CREATE POLICY "Public profiles are readable by authenticated users" 
ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Squads are readable by everyone" 
ON public.squads FOR SELECT USING (true);

CREATE POLICY "Squad members can insert squads" 
ON public.squads FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Workouts viewable by everyone" 
ON public.workouts FOR SELECT USING (true);

CREATE POLICY "Users can insert own workouts" 
ON public.workouts FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Feed posts viewable by everyone" 
ON public.feed_posts FOR SELECT USING (true);

CREATE POLICY "Users can insert own feed posts" 
ON public.feed_posts FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Reactions viewable by everyone" 
ON public.post_reactions FOR SELECT USING (true);

CREATE POLICY "Users can toggle own reactions" 
ON public.post_reactions FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Comments viewable by everyone" 
ON public.post_comments FOR SELECT USING (true);

CREATE POLICY "Users can insert comments" 
ON public.post_comments FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Nudges visible to involved users" 
ON public.bro_nudges FOR SELECT USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

CREATE POLICY "Users can send nudges" 
ON public.bro_nudges FOR INSERT WITH CHECK (auth.uid() = from_user_id);

CREATE POLICY "Recipient can update nudge status" 
ON public.bro_nudges FOR UPDATE USING (auth.uid() = to_user_id);

-- ==============================================================================
-- AUTOMATIC PROFILE CREATION TRIGGER
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, username, full_name, avatar_url)
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
        COALESCE(new.raw_user_meta_data->>'full_name', 'Gym Bro'),
        COALESCE(new.raw_user_meta_data->>'avatar_url', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- STORAGE BUCKETS SETUP FOR SUPABASE
-- Run in Supabase SQL editor:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('gymbro-media', 'gymbro-media', true);
-- ==============================================================================
