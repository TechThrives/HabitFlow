# HabitFlow

A minimal, modern habit tracker built with React, Tailwind CSS, and Supabase. HabitFlow helps you build better habits with flexible scheduling (Daily, Weekly, Monthly), detailed analytics, and a distraction-free interface.

## Features

- **Flexible Scheduling:** Support for Daily, Weekly (e.g., "Mon, Wed, Fri"), and Monthly habits.
- **Authentication:** Secure Sign Up and Sign In powered by Supabase Auth.
- **Cloud Sync:** Data is stored in the cloud, accessible from any device.
- **Analytics Dashboard:**
  - 30-Day Trend Charts
  - Yearly Contribution Heatmap (GitHub-style)
  - Completion Rates & Streak Tracking
  - Productivity by Day of Week
- **Dark/Light Mode:** Fully responsive theme switching.
- **PWA Ready UI:** Mobile-responsive design with a side-drawer navigation.

## Tech Stack

- **Frontend:** React 19, React Router v7, Lucide React
- **Styling:** Tailwind CSS
- **Charts:** Recharts
- **Backend/Database:** Supabase (PostgreSQL + Auth)

## Supabase Setup (Database Schema)

To run this application, you need to set up a Supabase project.

1.  Create a new project at [supabase.com](https://supabase.com).
2.  Go to the **SQL Editor** in your dashboard.
3.  Run the following SQL script to create the tables and security policies.

```sql
-- 1. Create Habits Table
create table public.habits (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  title text not null,
  description text,
  "goalType" text check ("goalType" in ('daily', 'weekly', 'monthly')),
  color text,
  "startDate" date default now(),
  "createdAt" bigint default extract(epoch from now()) * 1000,
  "targetTime" text not null,
  "targetDayOfWeek" integer,
  "targetDayOfMonth" integer
);

-- 2. Create Entries Table
create table public.entries (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  "habitId" uuid references public.habits(id) on delete cascade not null,
  date date not null,
  status text check (status in ('completed', 'skipped', 'pending')),

  -- Ensure only one entry per habit per day
  unique("habitId", date)
);

-- 3. Enable Row Level Security (RLS)
-- This ensures users can only access their own data
alter table public.habits enable row level security;
alter table public.entries enable row level security;

-- 4. Create Security Policies
-- Habits: Users can only see/edit their own habits
create policy "Users can CRUD their own habits"
  on habits for all
  using (auth.uid() = user_id);

-- Entries: Users can only see/edit their own entries
create policy "Users can CRUD their own entries"
  on entries for all
  using (auth.uid() = user_id);
```

### Environment Configuration

After setting up the database, you must update the `.env` file with your project credentials:

```typescript
// src/services/supabase.ts
const SUPABASE_URL = "YOUR_SUPABASE_PROJECT_URL";
const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";
```

You can find these in your Supabase Dashboard under **Project Settings > API**.

## Thank You
