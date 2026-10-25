# 🏋️‍♂️ GymBro — Social Fitness App for Gym Friends Across Distances

![GymBro Banner](https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&auto=format&fit=crop&q=80)

> **"We may not share the same barbell rack today, but the standard we set together never drops."**

**GymBro** is a dedicated private social fitness platform designed specifically for gym partners and lifting crews who used to train together but are now separated by college, new jobs, moving to different cities, or life circumstances. 

GymBro is **NOT** just a cold workout log. It is an authentic, hype-filled social network built around the emotional bond, accountability, and banter between gym buddies.

---

## ⚡ Key Highlights & Features

### 1. 📋 The Chalkboard (The Brotherhood Feed)
- **Live Squad Timeline**: Share workout recaps, PR achievements, gym selfies, and banter across states.
- **Dynamic Workout Cards**: Automatically displays split badges (`PUSH`, `PULL`, `LEGS`, `UPPER`, `LOWER`), duration, volume lifted (in both **kg** and **lbs**), energy/pump level (1-10), and expandable set/rep breakdowns.
- **Interactive Brotherhood Reactions**:
  - 👊 **Fist Bump** — Standard gym partner salute
  - 🔥 **Fire** — Explosive sets and big numbers
  - 🏋️ **Light Weight Baby!** — Ronnie Coleman shoutout
  - ⚡ **Hype** — High energy motivation
  - 💀 **Dead** — Brutal leg day roasts
- **In-Post Banter & Comments**: Real-time replies to hype up your bros or check their squat depth.

### 2. 🏆 The Iron Wall (Personal Records & Strength Progression)
- **Big 3 Leaderboard**: Live ranking of the squad's Squat, Bench Press, and Deadlift (S/B/D) combined total.
- **Interactive Recharts Progression**: Visual 6-month progression line chart tracking strength metrics across crew members.
- **Estimated 1RM Calculator**: Automatically computes 1-Rep Max using the Epley formula (`weight * (1 + reps / 30)`).
- **Celebratory PR Confetti**: Launches full-screen particle confetti when you or a gym bro crushes a new record!
- **Dedicated PR Modal**: Record new weights, add shoutout notes to your original spotter, and upload proof media.

### 3. 📡 Spot Your Bro (Squad Radar & Bro Nudges)
- **Live Squad Status**: See who is currently `At the Gym Now` 🏋️, who `Worked Out Today` ✅, who is taking a `Rest Day` 💤, or who `Needs a Bro Nudge` ⚠️.
- **Distance Accountability**: Displays each bro's physical distance (e.g. *Penn State • 380 miles away*, *Gold's Gym Austin • 1,150 miles away*).
- **Instant Bro Nudges**: Send pre-baked or custom gym banter pokes directly to your friends' screens:
  - *"Bro, the squat rack is calling your name! Don't leave it hanging 🏋️"*
  - *"Did you hit chest today? Answer truthfully, distance won't hide you! 👊"*
  - *"Two scoops of pre-workout are waiting for you. Get up! ⚡"*
- **Instant Response Action**: One-tap *"👊 Tell Bro: I hit the gym today!"*

### 4. 😂 The Locker Room (Gym Memes & Humor)
- **Pre-Curated Meme Gallery**: Pre-workout jitters, leg day stairs survival, plate math memes, and gym partner roasts.
- **Meme Creator & Dropper**: Upload images or select from built-in templates with custom captioning.

### 5. 📊 My Stats & Lifting Profile
- **Brotherhood Streak Tracker**: Consecutive day consistency counter with flame badge.
- **Weekly Consistency Chart**: Recharts bar graph displaying daily volume lifted across the week.
- **Split Distribution Pie Chart**: Visual breakdown of Push vs Pull vs Legs vs Upper/Lower ratios.
- **Hometown Gym vs Current Gym**: Keeps the memory of where the brotherhood started alive while tracking distant progress.

### 6. 🛡️ Guilds & Guild Wars System (Team Brotherhood & Cross-City Rivalries)
- **Private Brotherhood Guilds**:
  - Form private teams restricted strictly to **accepted GymBro friends**.
  - Creators automatically become **Guild Captains** with management rights.
  - Safe captaincy handoff: Captains cannot abandon a multi-member Guild without transferring captaincy to another member.
  - 5-Tab Dedicated Guild Detail: **Overview**, **Members**, **Guild Wars**, **Leaderboards**, and **History & Hall of Fame**.
- **Two Distinct Competition Categories**:
  - 🏃 **Workout Consistency War**:
    - **10 points** per qualifying completed workout session ($\ge 30$ minutes).
    - **Daily cap**: 1 workout per member per calendar day (prevents unhealthy or duplicate session spam).
    - **Weekly consistency bonus**: **+20 points** upon achieving the 4-workout/week milestone.
  - 💥 **Strength & PR War**:
    - **5 points** per verified new PR.
    - Requires $\ge 1.0$ kg progression over member's previous verified personal best.
    - Anti-farming protection: 1 PR award per distinct exercise per member per war.
- **Fair Normalization Formula for Flexible Team Sizes**:
  - Roster is **frozen** at war acceptance (`roster_frozen_at`).
  - Score formula: $\text{Normalized Score} = \frac{\text{Total Qualifying Points}}{\text{Eligible Members in Frozen Roster}}$.
  - Both raw points and normalized scores are displayed transparently.
  - Deterministic tie-breaking: **Normalized Score** $\rightarrow$ **Participation Rate** $\rightarrow$ **Raw Points**.
- **Permanent Persistence Architecture**:
  - GymBro's 24-hour social feed expiration **never** erases workouts, PRs, or earned Guild War points.
  - Contributions are recorded with immutable idempotency keys (`war_{warId}_workout_{workoutId}`).
- **War VS Arena Dashboard**:
  - Split-screen head-to-head arena with countdown timer, normalized score meters, formula explanation, real-time activity log, and individual member contribution leaderboards.

### 7. 🔄 Instant Persona Switcher
- Effortlessly switch between 5 authentic gym personas right from the header dropdown to test the app from any perspective:
  1. **Alex Rivera** (@alex_lifts) — Junior at Penn State (380 miles away), chasing a 315 bench.
  2. **Marcus Chen** (@marcus_quads) — Software Dev in Austin (1,150 miles away), squat specialist.
  3. **Leo Vance** (@leo_vance) — Holding down the hometown fort at Metro Iron Club.
  4. **Jordan Brooks** (@jordan_bulk) — Wall Street analyst hitting 5:30 AM deadlifts in NYC.
  5. **Sam Miller** (@sam_iron) — Med student in Chicago needing motivation between exams.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router) + React 19 |
| **Language** | TypeScript (Strict mode) |
| **Styling** | Tailwind CSS v4 (Dark Obsidian + Neon Lime/Amber aesthetic) |
| **Icons** | Lucide React |
| **Charts** | Recharts (Responsive Line, Bar, and Pie Charts) |
| **Delight** | Canvas-Confetti |
| **Database** | PostgreSQL (Supabase) + Schema DDL |
| **Authentication** | Supabase Auth |
| **Storage** | Supabase Storage (`gymbro-media` bucket) |
| **Local Persistence** | Intelligent LocalStorage sync with seamless fallback |

---

## 🚀 Getting Started Locally

### Prerequisites
- Node.js 18+ (tested with Node v24)
- npm or pnpm

### 1. Clone & Install
```bash
git clone <repo-url>
cd gymbro
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. The app runs immediately in **Interactive Demo Mode** with rich pre-seeded brotherhood data, allowing you to test every feature without any initial setup!

---

## 🗄️ Supabase PostgreSQL Setup (Production Ready)

GymBro is fully integrated with Supabase. Follow these steps to connect your own Supabase instance:

### Step 1: Create a Supabase Project
1. Head over to [supabase.com](https://supabase.com) and create a free project.

### Step 2: Run the Database Schema
1. Open your Supabase Dashboard and navigate to the **SQL Editor**.
2. Open the file [`supabase/schema.sql`](supabase/schema.sql) in this repository.
3. Paste the SQL script into the editor and click **Run**.
   - This creates all 10 tables (`profiles`, `squads`, `squad_members`, `workouts`, `workout_exercises`, `personal_records`, `feed_posts`, `post_reactions`, `post_comments`, `bro_nudges`).
   - Configures automatic user profile creation triggers on Auth signup.
   - Sets up Row Level Security (RLS) policies.
   - Pre-configures the storage bucket policy for `gymbro-media`.

### Step 3: Configure Environment Variables
1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
2. Retrieve your project URL and `anon` key from **Project Settings -> API** in Supabase:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
3. Restart your dev server (`npm run dev`). The status pill in the top navbar will switch to **"Supabase Live"** with a green dot!

---

## ☁️ Deployment to Vercel

GymBro is ready for 1-click deployment on Vercel:

1. Push your repository to GitHub / GitLab.
2. Import the repository in [Vercel](https://vercel.com).
3. In the **Environment Variables** section, add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Click **Deploy**. Vercel will build and launch your application globally on their Edge network.

---

## 📁 Project Architecture

```
d:/Gymbro
├── src/
│   ├── app/
│   │   ├── globals.css              # Dark gym aesthetic, glow classes, custom scrollbar
│   │   ├── layout.tsx               # HTML structure, SEO metadata, fonts & viewport
│   │   └── page.tsx                 # Root coordinator & orchestrator for all views & Guilds
│   ├── components/
│   │   ├── Navbar.tsx               # Header, squad picker, streak badge, Guilds & Wars link
│   │   ├── GuildsHall.tsx           # Master Guild Hall hub (My Guilds, Live Wars, Directory)
│   │   ├── GuildDetailView.tsx      # 5-Tab view: Overview, Members, Wars, Leaderboards, History
│   │   ├── GuildWarDashboard.tsx    # Head-to-head VS Arena dashboard with normalized scores
│   │   ├── CreateGuildModal.tsx     # Guild creation modal with emblem picker & validations
│   │   ├── CreateWarChallengeModal.tsx # Captain challenge declaration (7d/30d, Consistency/Strength)
│   │   ├── InviteFriendModal.tsx    # Friends-only invitation modal
│   │   ├── BroFeed.tsx              # Social chalkboard, workout cards, fist bumps, comments
│   │   ├── PRBoard.tsx              # The Iron Wall, Big 3 leaderboard, Recharts line graph
│   │   ├── WorkoutLoggerModal.tsx   # Workout session logger with dynamic sets & PR flag
│   │   ├── AddPRModal.tsx           # Dedicated PR recorder with 1RM calculator
│   │   ├── SquadRadar.tsx           # "Spot Your Bro" live radar, distance tracker, nudges
│   │   ├── LockerRoomMemes.tsx      # Gym memes gallery & banter creator
│   │   ├── ProfileView.tsx          # User profile stats, weekly volume & split charts
│   │   └── SupabaseConfigModal.tsx  # Supabase connection tester, schema viewer, data reset
│   ├── lib/
│   │   ├── scoring-engine.ts        # Authoritative scoring, validation, and fair normalization
│   │   ├── __tests__/
│   │   │   └── scoring-engine.test.ts # 10 comprehensive unit tests with Vitest
│   │   ├── seed-data.ts             # Authentic gym bros, workouts, PRs, and meme data
│   │   ├── seed-guilds.ts           # Sample Guilds, active wars, history, and friendships
│   │   ├── storage.ts               # Local + Supabase synchronization store with RLS compliance
│   │   ├── utils.ts                 # 1RM formula, weight conversions (kg/lbs), confetti
│   │   └── supabase/
│   │       └── client.ts            # Supabase client initialization with graceful fallback
│   └── types/
│       └── index.ts                 # Complete TypeScript interfaces for app & Guild Wars
├── supabase/
│   ├── schema.sql                   # Full PostgreSQL schema with RLS policies
│   └── migrations/
│       └── 002_guilds_and_guild_wars.sql # Dedicated migration for Guilds & Wars tables and RLS
├── .env.example                     # Environment variables template
├── package.json                     # Scripts (dev, build, test via Vitest)
├── tsconfig.json
└── README.md
```

---

## 🧪 Automated Testing

GymBro includes automated unit tests for the **Scoring & Normalization Engine**:

```bash
# Run all Vitest unit tests
npm test
# or
npx vitest run
```

Tests cover:
- Qualifying workout minimum durations ($\ge 30$ mins) and daily scoring caps (1 workout/day)
- Idempotent scoring preventing duplicate point awards
- Weekly 4-workout milestone bonus (+20 pts)
- Strength & PR progression threshold ($\ge 1.0$ kg) and anti-farming per-exercise caps
- Roster freeze Denominator immutability across flexible team sizes
- Deterministic tie-breaking rules
- War finalization and stats mutation

---

## 👊 The Brotherhood Promise

Whether separated by 50 miles or 3,000 miles, **GymBro** ensures that no set is taken alone, no PR goes uncelebrated, and no bro skips leg day unnoticed!
