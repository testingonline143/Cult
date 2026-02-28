# Sangh - Tirupati Club Discovery Platform

## Overview

Sangh is a club discovery platform specifically built for Tirupati, India. It helps users find and join local community clubs (trekking, books, cycling, photography, fitness, art, etc.). The app features a single-page landing experience with an integrated matcher widget in the hero, club browsing with emoji-based cards, a process section, and a form for organizers to submit new clubs.

The project follows a full-stack TypeScript monorepo pattern with a React frontend, Express backend, and PostgreSQL database.

## User Preferences

Preferred communication style: Simple, everyday language.
Design preference: Earthy, nature-inspired theme matching the sangh-v2 HTML reference. Uses Fraunces serif for headings and Instrument Sans for body text. Forest green primary with cream/paper backgrounds and clay accents. Emojis used extensively for category icons, step icons, and decorative elements. No commission/pricing mentions. No comparison table section.

## System Architecture

### Frontend (client/)
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter — pages: Home (/), Admin (/admin), Organizer Dashboard (/organizer), Profile (/profile), Onboarding Quiz (/onboarding), Matched Clubs (/matched-clubs), Explore (/explore), Club Detail (/club/:id), Check-in (/checkin/:eventId), 404
- **Styling**: Tailwind CSS with CSS variables for theming (light/dark mode support)
- **UI Components**: shadcn/ui (new-york style) built on Radix UI primitives, stored in `client/src/components/ui/`
- **Animations**: Framer Motion for scroll-triggered animations and transitions
- **State Management**: TanStack React Query for server state; React useState for local state
- **Auth**: AuthProvider context (client/src/lib/auth.tsx) with localStorage-based session; phone OTP login with mock OTP (123456)
- **Forms**: React Hook Form with Zod validation via @hookform/resolvers
- **Build Tool**: Vite with React plugin
- **Path aliases**: `@/` maps to `client/src/`, `@shared/` maps to `shared/`

### Backend (server/)
- **Framework**: Express 5 on Node.js with TypeScript (run via tsx)
- **API Pattern**: RESTful JSON API under `/api/` prefix
- **Endpoints**:
  - `GET /api/clubs` — list all clubs (supports `?category=` query param for filtering)
  - `GET /api/clubs/:id` — get single club with full details
  - `POST /api/join` — submit a join request; auto-increments memberCount and foundingTaken atomically
  - `POST /api/club-submissions` — submit a new club (body: clubName, organizerName, whatsappNumber, category, meetupFrequency?)
  - `GET /api/admin/join-requests` — list all join requests (newest first)
  - `GET /api/admin/club-submissions` — list all club submissions (newest first)
  - `PATCH /api/admin/join-requests/:id/done` — mark join request as done
  - `PATCH /api/admin/club-submissions/:id/done` — mark submission as done
  - `POST /api/auth/send-otp` — send mock OTP to phone number
  - `POST /api/auth/verify-otp` — verify OTP and create/update user
  - `POST /api/organizer/login` — organizer login by WhatsApp + OTP
  - `GET /api/organizer/club/:whatsappNumber` — get organizer's club
  - `GET /api/organizer/join-requests/:clubId` — get join requests for organizer's club
  - `PATCH /api/organizer/join-requests/:id/contacted` — mark join request as contacted
  - `PATCH /api/organizer/club/:id` — update club details (shortDesc, schedule, location, healthStatus)
  - `POST /api/admin/club-submissions/:id/approve` — approve submission and create a live club
  - `GET /api/user/join-requests` — get authenticated user's join requests (requires x-user-id header)
  - `PATCH /api/user/profile` — update authenticated user's name and bio (requires x-user-id header), computes hasRealProfile badge
  - `GET /api/stats` — returns live platform stats: totalMembers, totalClubs, upcomingEvents (5-minute cache)
  - `GET /api/events` — list upcoming events (supports ?city=&limit= params)
  - `GET /api/events/:id` — get single event with rsvps and club info
  - `GET /api/clubs/:id/events` — get events for a specific club
  - `POST /api/clubs/:id/events` — create event for a club (organizer use)
  - `POST /api/events/:id/rsvp` — RSVP to an event (requires x-user-id header)
  - `DELETE /api/events/:id/rsvp` — cancel RSVP (requires x-user-id header)
  - `GET /api/user/events` — get authenticated user's RSVP'd events (requires x-user-id header)
  - `GET /api/clubs/search` — search clubs with filters (search, category, city, vibe)
  - `POST /api/quiz` — submit quiz answers (requires x-user-id header)
  - `GET /api/quiz/matches` — get matched clubs based on quiz answers (requires x-user-id header)
  - `POST /api/events/:id/checkin` — check in a user at an event (requires x-user-id header, validates RSVP exists)
  - `GET /api/events/:id/attendees` — get attendees with check-in status (returns attendees, checkedInCount, totalRsvps)
  - `GET /api/clubs/:id/activity` — get club activity: recentJoins (7-day count), recentJoinNames (first names), totalEvents, lastEventDate
  - `GET /api/activity/feed` — get last 10 platform-wide join actions for activity ticker (name, clubName, clubEmoji, createdAt)
  - `GET /api/clubs-with-activity` — get all clubs with recentJoins count appended (supports same filters as /api/clubs)
- **OTP**: Mock OTP system (always 123456) stored in memory Map with 5-minute expiry
- **Validation**: Zod schemas generated from Drizzle table definitions via drizzle-zod
- **Dev Server**: Vite middleware is used in development for HMR; static file serving in production
- **Build**: esbuild bundles the server to `dist/index.cjs`; Vite builds client to `dist/public/`

### Database
- **Database**: PostgreSQL (required, connected via `DATABASE_URL` environment variable)
- **ORM**: Drizzle ORM with `drizzle-orm/node-postgres` driver
- **Schema Location**: `shared/schema.ts` — shared between client and server
- **Tables**:
  - `clubs` — id (UUID), name, category, emoji, shortDesc, fullDesc, organizerName, organizerYears, organizerAvatar, organizerResponse, memberCount, schedule, location, activeSince, whatsappNumber, healthStatus, healthLabel, lastActive, foundingTaken, foundingTotal, bgColor, timeOfDay, isActive, highlights (text[]), createdAt
  - `join_requests` — id (UUID), clubId, clubName, name, phone, markedDone, createdAt
  - `club_submissions` — id (UUID), clubName, organizerName, whatsappNumber, category, meetupFrequency, markedDone, createdAt
  - `users` — id (UUID), username, password, phone, name, city, bio, profilePhotoUrl, hasRealProfile, quizCompleted
  - `user_quiz_answers` — id (UUID), userId, interests (text[]), experienceLevel, vibePreference, availability (text[]), collegeOrWork, createdAt
  - `events` — id (UUID), clubId, title, description, locationText, locationUrl, startsAt, endsAt, maxCapacity, coverImageUrl, isPublic, createdAt
  - `event_rsvps` — id (UUID), eventId, userId, status, createdAt
- **Migrations**: Drizzle Kit with `drizzle-kit push` command (schema-push approach, no migration files)
- **Seeding**: `server/seed.ts` contains hardcoded club data for initial population

### Shared Code (shared/)
- `shared/schema.ts` contains Drizzle table definitions, Zod insert schemas, TypeScript types, and a CATEGORIES constant
- This is imported by both client and server via the `@shared/` path alias

### Storage Layer
- `server/storage.ts` defines an `IStorage` interface and `DatabaseStorage` class implementing it
- All database access goes through this storage abstraction
- Key methods: getClubs, incrementMemberCount (atomic SQL), createJoinRequest, markJoinRequestDone, getClubsByOrganizer, updateClub, createOrUpdateUserByPhone

### Theme System
- Custom ThemeProvider in `client/src/components/theme-provider.tsx`
- Supports light/dark mode toggle with localStorage persistence
- CSS variables defined in `client/src/index.css` with separate light/dark values
- Uses Tailwind's `darkMode: ["class"]` strategy

### Key Features
- **Member count auto-increment**: Joining a club atomically increments memberCount and foundingTaken (if spots available)
- **Admin dashboard** (/admin): Password "sangh2026", shows join requests and club submissions with Mark as Done
- **Phone OTP login**: Mock OTP 123456, localStorage session, pre-fills join forms for logged-in users; 6 individual OTP digit boxes with masked phone display and 60-second resend timer
- **Organizer dashboard** (/organizer): WhatsApp + OTP login, club overview, manage join requests, create events, edit club details, QR codes for events, attendance tracking
- **Onboarding quiz** (/onboarding): 5-step quiz (interests, availability, vibe, experience, user type) with progress bar, slide transitions, loading screen → matched clubs page
- **Quiz gate**: New users redirected to quiz after first login; returning users skip quiz. "Redo Quiz" option in profile.
- **Club detail page** (/club/:id): Dedicated shareable page with full club info, events, join form, organizer info, WhatsApp link
- **Explore page** (/explore): Search, category/city/vibe filters, club cards with join
- **Events system**: Organizers create events with QR codes, users RSVP, homepage shows upcoming events
- **QR check-in** (/checkin/:eventId): Scan QR at event to check in; shows RSVP status, one-tap check-in
- **WhatsApp sharing**: Share buttons on club cards, detail pages, and modals using Web Share API with WhatsApp fallback
- **Open Graph meta tags**: Server-side OG tags for club pages (bot detection) for rich previews on WhatsApp/social media
- **Profile page** (/profile): Editable name + bio (200 char), Real Profile badge (green check), joined clubs list, RSVP'd events, request history, redo quiz button
- **Live stats**: Homepage stats bar shows real counts from DB (totalMembers, totalClubs, upcomingEvents) with 5-minute cache
- **Multi-city**: Supports Tirupati, Chennai, Bengaluru, Hyderabad, Kochi
- **Social proof / Activity signals**: Live activity ticker on homepage (auto-scrolling marquee of recent joins), "X joined this week" badge on club cards, Recent Activity section on club detail page/modal (recent joins, events hosted, last meetup), Club Highlights editable by organizers
- **Club highlights**: Organizers can add text highlights (one per line) via dashboard; displayed on club detail page/modal with quote styling

## External Dependencies

- **PostgreSQL**: Primary database, connected via `DATABASE_URL` env var using `pg` (node-postgres) driver
- **Google Fonts**: Plus Jakarta Sans, Lora, JetBrains Mono loaded via CDN in index.html
- **Replit Plugins**: `@replit/vite-plugin-runtime-error-modal`, `@replit/vite-plugin-cartographer`, `@replit/vite-plugin-dev-banner` (dev-only)
- **Auth**: Mock OTP system (no external SMS service); localStorage-based sessions
- **No external APIs**: All data is self-contained in the PostgreSQL database
