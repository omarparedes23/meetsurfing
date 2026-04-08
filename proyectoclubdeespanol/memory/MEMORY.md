# Spanish Club Moscow — Project Memory

## Project Identity
- **Name**: Spanish Club Moscow (clubespanolmoscu)
- **Path**: d:/tempo/claudecode/clubespanolmoscu
- **Stack**: Next.js 14 App Router + Tailwind CSS + Supabase + Framer Motion + Lucide React
- **Language**: TypeScript, bilingual (Spanish + Russian)

## Design System
- Dark mode default, bg: #0A0A0F, surface: #12121A, surface2: #1A1A2E
- Primary accent: Red #E63946, secondary: Gold #F1C40F
- Glassmorphism cards (`glass-card`, `glass-card-hover` CSS classes)
- Fonts: Inter (body, has cyrillic subset), Playfair Display (headings)

## Architecture
- All data fetching via server components (RSC) — no client-side data fetching
- `lib/supabase.ts` — all Supabase queries
- `lib/utils.ts` — date helpers, Moscow timezone (UTC+3 hardcoded, no DST)
- `types/index.ts` — shared TypeScript interfaces

## Live Status Logic
- Moscow time = UTC+3 (no DST), computed client-side in LiveStatus.tsx
- Active: Friday (dayOfWeek === 5) AND hour >= 19 (19:00–23:59 MSK)
- Component re-checks every 60 seconds via setInterval

## Business Rules
- `friday` events: free (price=0), at Casa Agave
- `party` events: paid, telegram_bot_link required, button redirects to Telegram bot
- Supabase Storage bucket name: `gallery` (public)

## Initial Build Status
- Full project scaffolded in one session (March 2026)
- All 18 files created, no terminal commands run by Claude
- User must run: npm install, configure .env.local, run supabase/schema.sql, then npm run dev
