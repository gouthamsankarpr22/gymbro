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

### 6. 🔄 Instant Persona Switcher
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
│   │   ├── globals.css           # Dark gym aesthetic, glow classes, custom scrollbar
│   │   ├── layout.tsx            # HTML structure, SEO metadata, fonts & viewport
│   │   └── page.tsx              # Root coordinator & orchestrator for all views
│   ├── components/
│   │   ├── Navbar.tsx            # Header, squad picker, streak badge, user persona switcher
│   │   ├── BroFeed.tsx           # Social chalkboard, workout cards, fist bumps, comments
│   │   ├── PRBoard.tsx           # The Iron Wall, Big 3 leaderboard, Recharts line graph
│   │   ├── WorkoutLoggerModal.tsx# Workout session logger with dynamic sets & PR flag
│   │   ├── AddPRModal.tsx        # Dedicated PR recorder with 1RM calculator
│   │   ├── SquadRadar.tsx        # "Spot Your Bro" live radar, distance tracker, nudges
│   │   ├── LockerRoomMemes.tsx   # Gym memes gallery & banter creator
│   │   ├── ProfileView.tsx       # User profile stats, weekly volume & split charts
│   │   └── SupabaseConfigModal.tsx # Supabase connection tester, schema viewer, data reset
│   ├── lib/
│   │   ├── seed-data.ts          # Authentic gym bros, workouts, PRs, and meme data
│   │   ├── storage.ts            # Local + Supabase synchronization store
│   │   ├── utils.ts              # 1RM formula, weight conversions (kg/lbs), confetti
│   │   └── supabase/
│   │       └── client.ts         # Supabase client initialization with graceful fallback
│   └── types/
│       └── index.ts              # Complete TypeScript interfaces
├── supabase/
│   └── schema.sql                # Production-ready PostgreSQL schema & RLS policies
├── .env.example                  # Environment variables template
├── package.json
├── tsconfig.json
└── README.md
```

---

## 👊 The Brotherhood Promise

Whether separated by 50 miles or 3,000 miles, **GymBro** ensures that no set is taken alone, no PR goes uncelebrated, and no bro skips leg day unnoticed!
