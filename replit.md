# CultFam - Tirupati Club Discovery Platform

## Overview

CultFam is a club discovery platform specifically built for Tirupati, India. It helps users find and join local community clubs (trekking, books, cycling, photography, fitness, art, etc.). The app features a single-page landing experience with an integrated matcher widget in the hero, club browsing with emoji-based cards, a process section, and instant club creation for organizers.

The project follows a full-stack TypeScript monorepo pattern with a React frontend, Express backend, and PostgreSQL database.

## User Preferences

Preferred communication style: Simple, everyday language.
Design preference: Dark-mode-first, glassmorphic design. Space Grotesk (`font-display`) for bold headings, Inter (`font-sans`) for body text. Neon green primary (#00FF94, `155 100% 50%`) on near-black background (#0A0A0A). Glassmorphism: semi-transparent cards with `backdrop-blur-lg` (use `glass-card` / `glass-card-hover` CSS classes). Neon accent text via `neon-text` class, glow effects via `neon-glow` / `neon-text-glow`. Custom Tailwind color `neon` available. Gen-Z copy style throughout. Emojis used for category icons.

## System Architecture

### Frontend (client/)
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter — pages: Home (/), Explore (/explore), Events (/events), Create (/create), Profile (/profile), Admin (/admin), Organizer Dashboard (/organizer), Onboarding Quiz (/onboarding), Matched Clubs (/matched-clubs), Club Detail (/club/:id), Event Detail (/event/:id), Check-in (/checkin/:eventId), 404
- **Navigation**: Landing page (/) uses top Navbar only (no bottom tab bar). Inner app pages use fixed bottom tab bar (`client/src/components/bottom-nav.tsx`) with 5 tabs: HOME (/home), EXPLORE (/explore), EVENTS (/events), CREATE (/create), PROFILE (/profile). Bottom nav visible on these 5 routes. HOME tab (/home) shows a clean mobile feed with "Find Your Tribe in Tirupati", "Happening Today", and "Trending Clubs". Admin/organizer/onboarding/club-detail/event-detail pages use top Navbar only.
- **Styling**: Tailwind CSS with CSS variables for theming (dark-mode-first, glassmorphic design)
- **UI Components**: shadcn/ui (new-york style) built on Radix UI primitives, stored in `client/src/components/ui/`
- **Animations**: Framer Motion for scroll-triggered animations and transitions
- **State Management**: TanStack React Query for server state; React useState for local state
- **Auth**: Replit Auth integration via `client/src/hooks/use-auth.ts` — uses session cookies, fetches user from `/api/auth/user`. Supports Google, GitHub, Apple, and email sign-in via `/api/login`.
- **Forms**: React Hook Form with Zod validation via @hookform/resolvers
- **Build Tool**: Vite with React plugin
- **Path aliases**: `@/` maps to `client/src/`, `@shared/` maps to `shared/`

### Backend (server/)
- **Framework**: Express 5 on Node.js with TypeScript (run via tsx)
- **API Pattern**: RESTful JSON API under `/api/` prefix
- **Auth**: Replit Auth via `server/replit_integrations/auth/` — `setupAuth(app)` configures session middleware + OpenID Connect; `isAuthenticated` middleware protects routes; user data accessed via `req.user.claims.sub`
- **Endpoints**:
  - `GET /api/auth/user` — get current authenticated user
  - `GET /api/login` — redirect to Replit Auth login
  - `GET /api/logout` — logout and clear session
  - `GET /api/clubs` — list all clubs (supports `?category=` query param for filtering)
  - `GET /api/clubs/:id` — get single club with full details
  - `POST /api/join` — submit a join request (authenticated); auto-increments memberCount and foundingTaken atomically
  - `POST /api/clubs/create` — **instant club creation** (authenticated, creates live club immediately, sets creatorUserId)
  - `GET /api/organizer/my-club` — get authenticated user's club (by creatorUserId)
  - `GET /api/organizer/join-requests/:clubId` — get join requests for organizer's club (authenticated, verifies ownership)
  - `PATCH /api/organizer/join-requests/:id/contacted` — mark join request as contacted
  - `PATCH /api/organizer/club/:id` — update club details (authenticated, verifies ownership)
  - `POST /api/clubs/:id/events` — create event for a club (authenticated, verifies ownership)
  - `GET /api/admin/clubs` — list all clubs for admin monitoring (admin only)
  - `PATCH /api/admin/clubs/:id/deactivate` — deactivate a club (admin only)
  - `PATCH /api/admin/clubs/:id/activate` — reactivate a club (admin only)
  - `GET /api/admin/join-requests` — list all join requests, newest first (admin only)
  - `PATCH /api/admin/join-requests/:id/done` — mark join request as done (admin only)
  - `PATCH /api/user/profile` — update authenticated user's name and bio
  - `GET /api/user/join-requests` — get authenticated user's join requests
  - `GET /api/user/events` — get authenticated user's RSVP'd events
  - `GET /api/stats` — returns live platform stats (5-minute cache)
  - `GET /api/events` — list upcoming events with RSVP arrays (supports ?city=&limit= params)
  - `GET /api/events/:id` — get single event with rsvps and club info
  - `GET /api/clubs/:id/events` — get events for a specific club
  - `POST /api/events/:id/rsvp` — RSVP to an event (authenticated)
  - `DELETE /api/events/:id/rsvp` — cancel RSVP (authenticated)
  - `POST /api/events/:id/checkin` — check in to an event (authenticated)
  - `GET /api/events/:id/attendees` — get attendees with check-in status (organizer only)
  - `POST /api/quiz` — submit quiz answers (authenticated)
  - `GET /api/quiz/matches` — get matched clubs based on quiz answers (authenticated)
  - `GET /api/clubs/:id/activity` — get club activity signals
  - `GET /api/activity/feed` — get recent platform-wide join activity
  - `GET /api/clubs-with-activity` — get all clubs with recentJoins count
- **Validation**: Zod schemas generated from Drizzle table definitions via drizzle-zod
- **Dev Server**: Vite middleware is used in development for HMR; static file serving in production
- **Build**: esbuild bundles the server to `dist/index.cjs`; Vite builds client to `dist/public/`

### Database
- **Database**: PostgreSQL (required, connected via `DATABASE_URL` environment variable)
- **ORM**: Drizzle ORM with `drizzle-orm/node-postgres` driver
- **Schema Location**: `shared/schema.ts` re-exports from `shared/models/auth.ts` — shared between client and server
- **Tables**:
  - `users` — id (UUID), email (unique), firstName, lastName, profileImageUrl, bio, city, quizCompleted, createdAt, updatedAt
  - `sessions` — sid (PK), sess (jsonb), expire (timestamp) — used by express-session for Replit Auth
  - `clubs` — id (UUID), name, category, emoji, shortDesc, fullDesc, organizerName, organizerYears, organizerAvatar, organizerResponse, memberCount, schedule, location, city, vibe, activeSince, whatsappNumber, healthStatus, healthLabel, lastActive, foundingTaken, foundingTotal, bgColor, timeOfDay, isActive, highlights (text[]), **creatorUserId** (links to auth user), createdAt
  - `join_requests` — id (UUID), clubId, clubName, name, phone, markedDone, createdAt
  - `user_quiz_answers` — id (UUID), userId, interests (text[]), experienceLevel, vibePreference, availability (text[]), collegeOrWork, createdAt
  - `events` — id (UUID), clubId, title, description, locationText, locationUrl, startsAt, endsAt, maxCapacity, coverImageUrl, isPublic, createdAt
  - `event_rsvps` — id (UUID), eventId, userId, status, checkedIn, checkedInAt, createdAt
- **Migrations**: Raw SQL migrations applied in server startup; drizzle-kit for reference
- **Seeding**: `server/seed.ts` contains hardcoded club data for initial population

### Shared Code (shared/)
- `shared/schema.ts` re-exports users/sessions from `shared/models/auth.ts`, defines all other Drizzle tables, Zod insert schemas, TypeScript types, CATEGORIES, CITIES constants
- `shared/models/auth.ts` defines the `users` and `sessions` tables with Replit Auth-compatible schema
- This is imported by both client and server via the `@shared/` path alias

### Storage Layer
- `server/storage.ts` defines an `IStorage` interface and `DatabaseStorage` class implementing it
- All database access goes through this storage abstraction
- Key methods: getClubs, getClubsByCreator, incrementMemberCount (atomic SQL), createJoinRequest, markJoinRequestDone, updateClub, createClub, createEvent, createRsvp, checkInRsvp

### Auth System
- **Replit Auth**: Uses OpenID Connect via `server/replit_integrations/auth/` (auto-generated integration)
- **Session**: express-session with connect-pg-simple, stored in `sessions` table
- **User Model**: Users are upserted on login via Replit Auth callback (id, email, firstName, lastName, profileImageUrl)
- **Frontend Hook**: `client/src/hooks/use-auth.ts` — `useAuth()` returns `{ user, isLoading, isAuthenticated, logout }`
- **Protected Routes**: Backend uses `isAuthenticated` middleware; frontend checks `isAuthenticated` flag
- **Old auth removed**: No more OTP, phone-based auth, localStorage sessions, or x-user-id headers

### Theme System
- Custom ThemeProvider in `client/src/components/theme-provider.tsx`
- Supports light/dark mode toggle with localStorage persistence
- CSS variables defined in `client/src/index.css` with separate light/dark values
- Uses Tailwind's `darkMode: ["class"]` strategy

### Key Features
- **Instant club creation**: Authenticated users fill a rich form (name, category, description, schedule, location, organizer name, WhatsApp, city) → club goes live immediately → redirected to organizer dashboard
- **Member count auto-increment**: Joining a club atomically increments memberCount and foundingTaken (if spots available)
- **Admin dashboard** (/admin): Requires Replit Auth + `ADMIN_USER_ID` env var match; shows live clubs monitoring with deactivate/activate controls, plus join requests. Non-admin users see "Access Denied"
- **Replit Auth sign-in**: Google, GitHub, Apple, email sign-in via `/api/login`; session-based auth
- **Organizer dashboard** (/organizer): Identifies organizer by creatorUserId; club overview, manage join requests, create events, edit club details, QR codes for events, attendance tracking
- **Onboarding quiz** (/onboarding): 5-step quiz (interests, availability, vibe, experience, user type) with progress bar, slide transitions, loading screen → matched clubs page
- **Quiz gate**: New users redirected to quiz after first login; returning users skip quiz. "Redo Quiz" option in profile.
- **Club detail page** (/club/:id): Dedicated shareable page with full club info, events, join form, organizer info, WhatsApp link
- **Explore page** (/explore): Search, category/city/vibe filters, uses shared `ClubCard` component with health status, founding spots, and recent joins; gradient scroll hint on category filter bar
- **Deactivated club handling**: Club detail page and modal show "inactive" notice for deactivated clubs; explore page filters them out
- **Authenticated joins**: `POST /api/join` requires authentication; join forms show "Sign In to Join" for unauthenticated users; WhatsApp purpose explained in form
- **Events system**: Organizers create events with QR codes, users RSVP, homepage shows upcoming events. **Event duplication**: organizers can one-tap duplicate any event (past or upcoming) — pre-fills title, description, location, and capacity into the create form with a new date picker. "Duplicating from" banner shows source event and can be cleared.
- **Public event pages** (/event/:id): Standalone shareable event detail page with full event info, RSVP button, WhatsApp share, link back to parent club. Post-RSVP "You're in!" celebration with WhatsApp share prompt. Event cards on homepage and club detail page are clickable and link to event detail page.
- **QR check-in** (/checkin/:eventId): Scan QR at event to check in; shows RSVP status, one-tap check-in
- **WhatsApp sharing**: Share buttons on club cards, detail pages, event pages, and modals using Web Share API with WhatsApp fallback. Post-RSVP share prompts on event cards and event detail page.
- **Open Graph meta tags**: Server-side OG tags for club pages and event pages (bot detection) for rich previews on WhatsApp/social media. Event OG tags include date, time, location, and club name.
- **Profile page** (/profile): Editable name + bio (200 char), profile photo upload (tap avatar to change, multer + /uploads/ static serving, max 5MB, jpeg/png/webp/gif), joined clubs list, RSVP'd events, request history, redo quiz button
- **Live stats**: Homepage stats bar shows real counts from DB (totalMembers, totalClubs, upcomingEvents) with 5-minute cache
- **Multi-city**: Supports Tirupati, Chennai, Bengaluru, Hyderabad, Kochi
- **Social proof / Activity signals**: "X joined this week" badge on club cards, Recent Activity section on club detail page/modal, Club Highlights editable by organizers
- **Mobile-first app layout**: Bottom tab bar navigation (Home/Explore/Events/Create/Profile), pages designed as focused views — Home is a feed with "Happening Today" + "Trending Clubs", Explore has full-width image-style club cards, Events has calendar-style cards with filters, Create has tabbed New Club / New Event forms

## External Dependencies

- **PostgreSQL**: Primary database, connected via `DATABASE_URL` env var using `pg` (node-postgres) driver
- **Google Fonts**: Space Grotesk, Inter loaded via CDN in index.html
- **Replit Plugins**: `@replit/vite-plugin-runtime-error-modal`, `@replit/vite-plugin-cartographer`, `@replit/vite-plugin-dev-banner` (dev-only)
- **Auth**: Replit Auth (OpenID Connect) — no external SMS service needed
- **No external APIs**: All data is self-contained in the PostgreSQL database
