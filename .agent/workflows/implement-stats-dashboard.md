---
description: How to implement the Fully Cloud Stats Dashboard and Admin Panel
---

# 🏏 Implementing the Phase 2 Stats Dashboard

This workflow guides you through the technical steps to connect your website to a cloud database and build an automated leaderboard.

## 1. Supabase Setup (Database)
1. Create a project at [Supabase](https://supabase.com).
2. Run this SQL in their SQL Editor to create your tables:
```sql
CREATE TABLE squad (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text UNIQUE NOT NULL,
  photo_url text,
  is_active boolean DEFAULT true
);

CREATE TABLE seasons (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  year text NOT NULL,
  name text NOT NULL, -- e.g., 'Summer 2024'
  status text DEFAULT 'active', -- 'active' or 'finished'
  archived_stats jsonb -- Stores the final processed JSON if finished
);

CREATE TABLE mappings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  source_name text NOT NULL,
  target_name text NOT NULL
);
```
3. Copy your `SUPABASE_URL` and `SUPABASE_ANON_KEY`.

## 2. Serverless Function (Data Pipeline)
1. Install dependencies: `npm install @supabase/supabase-js papaparse axios`.
2. Create **Live Fetcher**: `src/functions/fetch-stats.js`.
3. Create **Automated Archiver (Cron Job)**: `src/functions/archive-season-cron.js`.
   - Use the Netlify `schedule` export:
     ```javascript
     export const config = { schedule: "0 0 31 12 *" };
     ```
   - This function will trigger once a year on Dec 31st to snapshot current stats into Supabase.
4. Use this logic structure for the fetcher:
   - Request `season_id` from the frontend.
   - Fetch the season record from Supabase.
   - **If status is 'finished'**: Return `archived_stats` instantly.
   - **If status is 'active'**:
     - Fetch `mappings` and `squad` list.
     - Fetch live CricClubs CSV.
     - Process and return.
    - **Merge & Filter**: Only include players in the `squad` table.

## 3. Admin UI (Management)
1. Register `netlify-identity-widget` in `main.jsx`.
2. Create a `/admin` route in `App.jsx`.
3. Build forms to:
   - Add/Remove names from the `squad` table.
   - Create entries in the `mappings` table (e.g., "B. Gupta" → "Brikesh Gupta").

## 4. Leaderboard UI (Display)
1. Create `/stats` page.
2. Use `useEffect` to fetch from `/.netlify/functions/fetch-stats`.
3. Render **Category Winner Cards**:
   - `Top Scorer`: Current leading runs.
   - `Top Wickets`: Current leading wickets.
   - `Best Milestone`: Tracks 50s, 100s, 4W, and 5W achievements.
4. Render the Full Leaderboard Table:
   - Columns: Photo, Name, Matches, Runs, Wickets, Catches, Run-Outs, Stumpings, 50s, 100s, Total Points.
5. Add buttons to filter by league and **Year/Season** (pass the league ID and season ID as query parameters to your function).

## 🚢 Deployment
Push your changes to GitHub. Netlify will automatically detect the new function and the new routes.
