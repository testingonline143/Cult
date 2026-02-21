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
- **Routing**: Wouter — pages: Home (/), Admin (/admin), Organizer Dashboard (/organizer), 404
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
- **OTP**: Mock OTP system (always 123456) stored in memory Map with 5-minute expiry
- **Validation**: Zod schemas generated from Drizzle table definitions via drizzle-zod
- **Dev Server**: Vite middleware is used in development for HMR; static file serving in production
- **Build**: esbuild bundles the server to `dist/index.cjs`; Vite builds client to `dist/public/`

### Database
- **Database**: PostgreSQL (required, connected via `DATABASE_URL` environment variable)
- **ORM**: Drizzle ORM with `drizzle-orm/node-postgres` driver
- **Schema Location**: `shared/schema.ts` — shared between client and server
- **Tables**:
  - `clubs` — id (UUID), name, category, emoji, shortDesc, fullDesc, organizerName, organizerYears, organizerAvatar, organizerResponse, memberCount, schedule, location, activeSince, whatsappNumber, healthStatus, healthLabel, lastActive, foundingTaken, foundingTotal, bgColor, timeOfDay, isActive, createdAt
  - `join_requests` — id (UUID), clubId, clubName, name, phone, markedDone, createdAt
  - `club_submissions` — id (UUID), clubName, organizerName, whatsappNumber, category, meetupFrequency, markedDone, createdAt
  - `users` — id (UUID), username, password, phone, name
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
- **Phone OTP login**: Mock OTP 123456, localStorage session, pre-fills join forms for logged-in users
- **Organizer dashboard** (/organizer): WhatsApp + OTP login, club overview, manage join requests, edit club details

## External Dependencies

- **PostgreSQL**: Primary database, connected via `DATABASE_URL` env var using `pg` (node-postgres) driver
- **Google Fonts**: Plus Jakarta Sans, Lora, JetBrains Mono loaded via CDN in index.html
- **Replit Plugins**: `@replit/vite-plugin-runtime-error-modal`, `@replit/vite-plugin-cartographer`, `@replit/vite-plugin-dev-banner` (dev-only)
- **Auth**: Mock OTP system (no external SMS service); localStorage-based sessions
- **No external APIs**: All data is self-contained in the PostgreSQL database
