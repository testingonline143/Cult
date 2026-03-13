# CultFam — Full App Documentation

## Table of Contents

1. [What Is CultFam?](#1-what-is-cultfam)
2. [Tech Stack & Architecture](#2-tech-stack--architecture)
3. [Design System](#3-design-system)
4. [User Roles & Permissions](#4-user-roles--permissions)
5. [User Journeys](#5-user-journeys)
6. [Every Screen Explained](#6-every-screen-explained)
7. [Club Features](#7-club-features)
8. [Events System](#8-events-system)
9. [Organiser Dashboard](#9-organiser-dashboard)
10. [Admin Portal](#10-admin-portal)
11. [Data Model](#11-data-model)
12. [Notification System](#12-notification-system)
13. [Key Business Logic](#13-key-business-logic)
14. [API Reference Summary](#14-api-reference-summary)

---

## 1. What Is CultFam?

CultFam is a mobile-first community platform for discovering and joining hobby clubs, currently focused on **Tirupati**. It connects people who share interests in trekking, cycling, books, photography, fitness, art, and more.

**Core idea:** Every city has hidden hobby communities. CultFam makes them discoverable, joinable, and manageable — all in one place.

**Who uses it:**
- **Regular users** — discover clubs, join them, attend events, and interact with the community feed
- **Organisers** — run their club, manage members, post events, share content, and track club growth
- **Admin** — oversee the entire platform, manage all clubs/users/events, and broadcast messages

---

## 2. Tech Stack & Architecture

### Frontend
- **React 18** with TypeScript, built with **Vite**
- **Wouter** for client-side routing
- **TanStack Query v5** for server state management and caching
- **Shadcn/ui** component library (built on Radix UI primitives)
- **Tailwind CSS** for styling with custom CSS variables
- **Lucide React** for icons

### Backend
- **Express 5** with Node.js
- **Drizzle ORM** with **PostgreSQL** (Replit-managed database)
- **Replit Auth** (OpenID Connect) for authentication
- **Multer** for image uploads (stored in `/uploads/`)
- **QRCode** library for event check-in QR codes

### Key Libraries
- `drizzle-zod` — auto-generates Zod schemas from the database schema
- `date-fns` — date formatting throughout the UI
- `recharts` — analytics charts in the admin portal
- `zod-validation-error` — readable API error messages

### Architecture Pattern
- Single Express server on **port 5000** serves both the API and the Vite-built frontend
- All protected routes require Replit Auth session cookies
- Frontend uses relative API paths (no proxy needed)
- Images uploaded to local `uploads/` directory, served as static files

---

## 3. Design System

### Colour Palette

| Variable | Purpose |
|---|---|
| `--terra` / `#C4622D` | Primary brand colour — buttons, accents, highlights |
| `--terra-pale` | Light terra background for selected states |
| `--cream` / `#FAF7F2` | Page background, warm off-white |
| `--warm-white` | Card backgrounds, slightly warmer than white |
| `--warm-border` | Subtle borders between elements |
| `--ink` | Main text colour |
| `--green-accent` | Success states, active/healthy indicators |
| `--muted-warm` | Secondary text, captions |

Dark mode is supported via CSS variable swapping on `document.documentElement` with a `dark` class.

### Typography
- **Font Display** (`font-display`) — used for headings and section labels
- Body text uses the system sans-serif stack

### Layout
- **Mobile-first**, max ~430px wide, centred on desktop
- **Bottom navigation bar** — always visible for authenticated users
- Content uses `space-y-4` rhythm with `rounded-[18px]` cards
- Cards use `border-[1.5px] border-[var(--warm-border)]` consistently

### Bottom Navigation Structure
```
[ CLUBS ]  [ EVENTS ]  [ ⊕ FAB ]  [ FEED ]  [ DASHBOARD/PROFILE ]
```
- Left two tabs: Clubs, Events
- Centre: Floating Action Button (context-sensitive options)
- Right two tabs: Feed, Dashboard (for organisers) or Profile (for regular users)

### Story Ring System (Club Avatars)
Clubs with new posts since last visit show an animated pulsing ring around their avatar:
- **Pulsing ring + dot** = new unseen posts
- **Solid static ring** = previously seen
- **No ring** = no recent posts

---

## 4. User Roles & Permissions

### Role Hierarchy
```
user  →  organiser  →  admin
```

Roles are stored in the `users.role` database column. The admin is additionally identified by the `ADMIN_USER_ID` environment variable (not just the role column).

---

### Regular User (`role: "user"`)

**What they can do:**
- Log in with Replit Auth
- Complete the onboarding quiz (interests, vibe, availability, city)
- Browse and search all clubs
- View club detail pages (description, FAQs, schedule, moments, events, polls)
- Submit a join request to any club (includes name, phone, optional answers to join questions)
- RSVP to events (only if an approved club member)
- Cancel their RSVP
- Join the waitlist when an event is full
- Like and comment on moments in the feed
- View their profile (clubs they've joined, join request statuses)
- Edit their profile (name, bio, city, profile photo)
- Vote on club polls
- View notifications
- Rate clubs (1–5 stars with optional review)
- Give kudos to other attendees after an event

**What they cannot do:**
- Create clubs (Submits a proposal that is reviewed by Admins)
- Create events
- Access the organiser dashboard
- Access the admin portal

**Club Proposals:**
When a regular user creates a club, it is created with `isActive: false`. These clubs act as proposals. Admins can view and approve these pending clubs from the Inactive Clubs section in their Admin Dashboard.

---

### Organiser (`role: "organiser"`)

Becomes organiser by either:
1. Creating a club (auto-promoted on creation)
2. Being manually promoted by admin

**Everything a regular user can do, plus:**
- Access the **Organiser Dashboard** (`/organizer`)
- Manage their club (edit description, schedule, organiser name, WhatsApp, cover photo, join questions)
- Create and manage events for their club
- Patch/delete events
- Review, approve, or reject member join requests
- Post, edit, and delete club moments
- Create, edit, and delete FAQs for their club
- Manage the club schedule (day-by-day schedule entries)
- Post announcements to club members (pinnable)
- Create and close polls
- Add co-organisers to their club (by user ID)
- View club insights (member count, pending requests, recent joins, event stats)
- View club analytics (member growth chart, engagement rate, no-show rate — after first event)
- Generate QR code for event check-in
- Scan QR codes at events to check in attendees

---

### Admin (`role: "admin"` + `ADMIN_USER_ID` env var)

Access is dual-gated: the user's role must be `"admin"` OR their user ID must match `ADMIN_USER_ID`. In practice the backend checks only the env var for all `/api/admin/*` routes.

**Everything an organiser can do, plus:**
- Access the **Admin Portal** (`/admin`)
- View platform-wide analytics (total users, clubs, events, RSVPs, check-ins, moments, comments, new activity this week)
- View the live activity feed (recent joins, RSVPs, moments, comments across all clubs)
- View weekly growth chart (user signups over time)
- Manage all clubs — activate/deactivate any club, set health status and label
- Manage all users — view user details (clubs, events, activity), change any user's role
- Manage all events — view all events across all clubs, soft-delete or restore events
- Manage all join requests — approve or reject any pending request platform-wide
- Manage all polls — close any open poll
- Send a broadcast notification to all users

---

## 5. User Journeys

### New User Journey
```
1. Visit the app → Landing page (/)
2. Click "Get Started" → Replit OAuth login
3. After auth → Onboarding quiz (/onboarding)
   - Pick interests (hobbies)
   - Pick vibe preference (casual / structured)
   - Pick availability (morning / evening / weekends)
   - Enter city
4. Quiz submitted → Matched Clubs page (/matched-clubs)
   - Up to 6 clubs scored by interest match, vibe, city, and popularity
   - Can quick-join clubs with one tap
5. Continue → Home Feed (/home)
```

### Joining a Club
```
1. Browse clubs on Clubs tab or Explore page
2. Tap a club → Club Detail page
3. Tap "Join Club" (or "Become a Founding Member" if spots remain)
4. Fill in name, phone number, optional answers to join questions
5. Request submitted → status shows as "Pending" in Profile
6. Organiser reviews and approves → user gets a notification
7. Status changes to "Approved" → user can now RSVP to events
```

### Attending an Event
```
1. Browse events on Events tab or Club Detail page
2. Tap event → Event Detail page
3. Tap "RSVP" (must be an approved member)
   - If full → joins waitlist (auto-promoted if someone cancels)
4. Receive confirmation notification
5. On event day → organiser scans QR code at the door to check in
6. After event → can give kudos to other attendees
```

### Creating a Club (as an aspiring organiser)
```
1. Tap FAB → "Create a Club"
2. Club is submitted as a proposal (`isActive: false`)
3. Admins approve the proposal via Admin Dashboard
4. On approval, club is activated and user is promoted to `organiser`
```

---

## 6. Every Screen Explained

| Route | Page | Who Can Access |
|---|---|---|
| `/` | Landing / Home | Everyone (unauthenticated) |
| `/onboarding` | Interest quiz | Authenticated users who haven't completed quiz |
| `/matched-clubs` | Quiz match results | Authenticated users |
| `/home` | Feed (moments + events) | All authenticated users |
| `/explore` | Search/filter clubs | All authenticated users |
| `/events` | Upcoming events list | All authenticated users |
| `/event/:id` | Event detail + RSVP | All authenticated users |
| `/club/:id` | Club detail page | All authenticated users |
| `/create` | Create a club form | All users (Proposals/Insta-Create) |
| `/organizer` | Organiser dashboard | `organiser` or `admin` role |
| `/profile` | My profile | All authenticated users |
| `/member/:id` | Public member profile | All authenticated users |
| `/notifications` | Notification inbox | All authenticated users |
| `/scan/:eventId` | QR check-in scanner | `organiser` or `admin` role |
| `/admin` | Admin portal | User matching `ADMIN_USER_ID` |

### Landing Page (`/`)
Public page. Shows the app's value proposition. "Get Started" triggers Replit login. If already authenticated, redirects to `/home`.

### Onboarding (`/onboarding`)
Multi-step quiz. Asks:
1. Interests — multi-select from 12 hobby categories
2. Vibe preference — Casual vs Structured
3. Availability — morning / evening / weekends (multi-select)
4. College or work background (optional)
5. City selection

On completion, saves answers and sets `quizCompleted: true` on the user. Redirects to `/matched-clubs`.

### Matched Clubs (`/matched-clubs`)
Shows up to 6 clubs scored by quiz match. Each card shows a match percentage. User can tap to join directly. After joining one, can "Continue to Feed".

### Home Feed (`/home`)
The main daily-use screen. Contains:
- **Club story rings** at the top — horizontally scrollable avatars of joined clubs with unseen-post indicators
- **Upcoming events** strip — compact cards for events in joined clubs
- **Moments feed** — card-style posts from clubs the user has joined, chronological
  - Like button (toggle)
  - Comment button (opens comment sheet)
  - Share button
  - Expandable captions (truncated at 160 chars)
- **FAB options**: Post a moment (to a joined club), Create a club, Create an event (organisers only)

### Explore (`/explore`)
Browse all active clubs. Filters:
- Category (Trekking, Books, Cycling, etc.)
- City
- Vibe (casual / structured)
- Search by name

Each club card shows: emoji, name, member count, schedule, health badge, founding member spots remaining.

### Events (`/events`)
List of upcoming events across all clubs. Shows date, time, club name, location, RSVP count. Tapping an event goes to Event Detail. Organisers see a "Create an Event" empty-state button when no events exist.

### Club Detail (`/club/:id`)
Full club page. Sections:
- Cover photo, emoji, name, health badge, location, schedule
- Organiser info (name, avatar, response time)
- Founding member progress bar (X of 20 spots taken)
- Moments (recent posts from the club)
- Upcoming events
- FAQs
- Weekly schedule
- Announcements
- Polls (vote on open polls, see results)
- Ratings (average star rating, individual reviews)
- Join button (or pending/approved status)

### Event Detail (`/event/:id`)
Full event page. Shows:
- Title, date, time, location (with link if provided)
- Club name and emoji
- RSVP count / capacity bar
- Waitlist count (if full)
- RSVP / Cancel RSVP button
- Comments section
- Attendee list (visible to members)
- Kudos section (give kudos after attending)

### Profile (`/profile`)
My account page. Shows:
- Profile photo (uploadable), name, bio, city
- Edit profile form
- Dark/light mode toggle
- Clubs I've joined (with membership status)
- My upcoming RSVPs
- Link to admin portal (if admin)
- Link to organiser dashboard (if organiser)

### Notifications (`/notifications`)
Inbox of all notifications with read/unread states. Types:
- Join approved / rejected
- New event posted (for club members)
- RSVP confirmed
- Moved off waitlist
- Broadcast messages from admin

### Scan Event (`/scan/:eventId`)
Organiser-only QR code scanner. Shows the event's QR code for display, and a scan input to enter attendee check-in tokens. Marks attendees as checked in.

---

## 7. Club Features

### Club Health
Each club has a `healthStatus` (green / yellow / red) and a `healthLabel` (e.g. "Very Active", "Growing", "Low Activity"). These are **set by the admin** based on observed activity — organisers do not self-rate.

Displayed as a coloured badge on club cards and detail pages.

### Founding Members
Each club has a `foundingTotal` (default: 20) and a `foundingTaken` counter. The first 20 members to join get the "Founding Member" badge. The progress bar on the club detail page shows spots remaining, creating urgency.

### Moments
Short posts from the club (caption + optional photo + optional emoji icon). Posted by organisers. Appear in:
- The club detail page
- The main home feed for members

Members can like and comment on moments.

### FAQs
Organiser-managed Q&A list shown on the club detail page. Sortable. Helps answer common questions before someone joins.

### Weekly Schedule
Structured schedule entries (day of week, start time, end time, activity, location). Shown as a visual week grid on the club detail page.

### Announcements
Organiser-posted announcements with title, body text, and an optional "pinned" flag. Pinned announcements appear at the top.

### Polls
Organisers create polls (question + 2–4 options). Members vote once. Results show as a bar chart with percentages. Polls can be closed by the organiser or admin.

### Ratings
Any user can rate a club 1–5 stars and leave a review. The average rating and total count are displayed on the club page.

### Co-Organisers
The club creator can add co-organisers by user ID. Co-organisers get full organiser access to that club.

---

## 8. Events System

### Creating an Event
Only organisers (who are the club creator) can create events for their club. Fields:
- Title, description
- Location (text + optional Google Maps URL)
- Start date/time, optional end time
- Max capacity
- Optional cover image
- Recurrence (none / weekly / biweekly / monthly) — creates up to 5 instances

When created, all approved club members receive a notification.

### RSVP Flow
1. Only approved club members can RSVP
2. If capacity not reached → status `"going"`
3. If capacity reached → status `"waitlisted"` with position shown
4. When someone cancels → first waitlisted person is auto-promoted and notified

### Check-In
Each RSVP has a unique `checkinToken` (UUID). The organiser's scan page accepts these tokens to mark `checkedIn: true`.

### Kudos
After an event, attendees can give one kudo to another attendee. Kudo types are predefined (e.g. "Great energy", "Most helpful"). One kudo per event per giver (enforced by unique index).

### Comments
Any authenticated user can comment on events. Comments show the user's name and profile image.

---

## 9. Organiser Dashboard

Route: `/organizer`

The organiser dashboard is the control centre for managing a club. If an organiser has multiple clubs, they select one from a picker at the top.

### Tabs

#### Overview
- Club health badge, member count, founding spot progress
- Club share link (copy to clipboard)
- **Getting Started Checklist** (shown until all items complete):
  - Create your first event
  - Post your first moment
  - Share your club link
- Co-organisers section (visible to club creator only)

#### Join Requests
- List of pending membership requests
- Each shows: name, phone, date, answers to join questions, founding member badge
- Approve / Reject actions
- Notification sent to user on approval or rejection

#### Insights
Shown data:
- Total members, pending requests, total events, avg attendance rate
- Recent joins (last 7 days)
- Recent RSVPs
- Engagement rate and no-show rate (**only shown after at least 1 event**)

#### Analytics
Shown data:
- Member growth chart (last 8 weeks, bar chart)
- Per-event stats (attendance, no-show counts) — after events exist
- Most active members
- Top event

#### Events
- List of club events (upcoming and past)
- Create event form (title, description, date/time, location, capacity, recurrence)
- Edit / Cancel / Delete individual events

#### Content
Sub-sections:
- **FAQs** — add, edit, delete, reorder
- **Schedule** — day-by-day weekly schedule entries
- **Moments** — post, edit, delete club moments with caption, icon, and optional photo
- **Polls** — create polls, view results, close polls

#### Announcements
- Post announcements (title, body, pin toggle)
- Edit and delete announcements

#### Edit Club
Editable fields:
- Cover photo
- Short description (shown on cards)
- Full description (shown on detail page)
- Organiser name
- WhatsApp number
- Schedule text
- Location
- Join Question 1 and 2 (shown to applicants)

---

## 10. Admin Portal

Route: `/admin`

Access requires your user ID to match the `ADMIN_USER_ID` environment variable.

### Analytics Tab
Platform-wide counters:
- Total users, clubs, active clubs, events, RSVPs, check-ins, moments, comments
- New this week: users, events, joins
- City distribution chart
- Weekly user growth area chart
- Live activity feed (latest joins, RSVPs, moments, comments)

### Clubs Tab
- Full list of all clubs with member counts and status
- Toggle active/inactive for any club
- Set health status (green/yellow/red) and health label for any club

### Users Tab
- Full user list with roles, cities, and join dates
- Drill into any user to see their clubs, events attended, moments posted
- Change any user's role (user → organiser → admin)

### Events Tab
- All events across all clubs
- Soft-delete any event (marks as cancelled)
- Restore cancelled events

### Join Requests Tab
- All pending join requests across all clubs
- Approve or reject any request
- Mark requests as done (dismiss from view)

### Polls Tab
- All open polls across all clubs
- Close any poll

### Broadcast
- Send a notification to every user on the platform
- Fields: title, message, optional link URL

---

## 11. Data Model

### Core Tables

#### `users`
The authenticated user. Managed by Replit Auth.
Key fields: `id`, `email`, `firstName`, `lastName`, `profileImageUrl`, `bio`, `city`, `role` (`"user"` / `"organiser"` / `"admin"`), `quizCompleted`

#### `sessions`
Auth session storage (managed by Replit Auth integration).

#### `clubs`
The main club entity.
Key fields: `id`, `name`, `category`, `emoji`, `shortDesc`, `fullDesc`, `organizerName`, `memberCount`, `schedule`, `location`, `city`, `healthStatus`, `healthLabel`, `foundingTaken`, `foundingTotal`, `isActive`, `creatorUserId`, `coOrganiserUserIds[]`, `joinQuestion1`, `joinQuestion2`, `coverImageUrl`

#### `join_requests`
Tracks membership. There is no separate club_members table — "approved" join requests are the members.
Key fields: `id`, `clubId`, `clubName`, `name`, `phone`, `userId`, `status` (`"pending"` / `"approved"` / `"rejected"`), `isFoundingMember`, `answer1`, `answer2`

#### `user_quiz_answers`
Stores onboarding quiz results.
Fields: `userId`, `interests[]`, `experienceLevel`, `vibePreference`, `availability[]`, `collegeOrWork`

### Events Tables

#### `events`
A scheduled club activity.
Fields: `id`, `clubId`, `title`, `description`, `locationText`, `locationUrl`, `startsAt`, `endsAt`, `maxCapacity`, `coverImageUrl`, `isPublic`, `isCancelled`, `recurrenceRule`

#### `event_rsvps`
Tracks who is attending an event.
Fields: `id`, `eventId`, `userId`, `status` (`"going"` / `"waitlisted"`), `checkinToken`, `checkedIn`, `checkedInAt`

#### `event_comments`
User comments on events.
Fields: `id`, `eventId`, `userId`, `userName`, `userImageUrl`, `text`

#### `kudos`
Post-event appreciation between attendees.
Fields: `id`, `eventId`, `giverId`, `receiverId`, `kudoType`
Constraint: one kudo per giver per event (unique index on `eventId + giverId`)

### Content Tables

#### `club_moments`
Short posts (like stories) from a club.
Fields: `id`, `clubId`, `caption`, `imageUrl`, `emoji`, `likesCount`, `authorUserId`, `authorName`

#### `moment_likes`
Tracks which users liked which moments.
Constraint: unique per `momentId + userId`

#### `moment_comments`
User comments on moments.
Fields: `id`, `momentId`, `userId`, `userName`, `userImageUrl`, `content`

#### `club_faqs`
Q&A entries on a club's detail page.
Fields: `id`, `clubId`, `question`, `answer`, `sortOrder`

#### `club_schedule_entries`
Structured weekly schedule.
Fields: `id`, `clubId`, `dayOfWeek`, `startTime`, `endTime`, `activity`, `location`

#### `club_announcements`
Official posts from the organiser to club members.
Fields: `id`, `clubId`, `authorUserId`, `authorName`, `title`, `body`, `isPinned`

#### `club_polls`
Voting questions for the club.
Fields: `id`, `clubId`, `question`, `options[]`, `isOpen`

#### `poll_votes`
Tracks individual poll votes.
Fields: `id`, `pollId`, `userId`, `optionIndex`

#### `club_ratings`
Star ratings and reviews for clubs.
Fields: `id`, `clubId`, `userId`, `rating` (1–5), `review`

#### `notifications`
In-app notification inbox.
Fields: `id`, `userId`, `type`, `title`, `message`, `linkUrl`, `isRead`

---

## 12. Notification System

Notifications are created server-side and delivered to the user's inbox at `/notifications`.

### Notification Types

| Type | When Triggered |
|---|---|
| `join_approved` | Organiser or admin approves a join request |
| `join_rejected` | Organiser or admin rejects a join request |
| `new_event` | Organiser creates a new event (sent to all club members) |
| `rsvp_confirmed` | User successfully RSVPs to an event |
| `waitlist_promoted` | User is moved from waitlist to confirmed when a spot opens |
| `broadcast` | Admin sends a platform-wide message |

The bell icon in the navigation shows an unread count badge.

---

## 13. Key Business Logic

### Founding Members
- Every club starts with `foundingTotal: 20` and `foundingTaken: 0`
- The first 20 people to join (via `approveJoinRequestWithFoundingCheck`) get `isFoundingMember: true`
- `foundingTaken` increments on each founding member approval
- Once 20 are taken, subsequent members join without the founding badge
- Club creator is always the first founding member (auto-joined on creation)

### Club Health Status
- `healthStatus` and `healthLabel` are set **only by the admin** via the admin portal
- Organisers cannot self-rate their own club's health
- Displayed on club cards as a coloured badge: green = "Very Active", yellow = "Growing", red = "Low Activity"

### Permission Guards (Backend)

| Guard | What It Does |
|---|---|
| `isAuthenticated` | Requires valid Replit Auth session |
| `requireRole("organiser", "admin")` | Checks the user's `role` column |
| `requireClubManager(clubIdParam)` | Checks if user is creator or co-organiser |
| `requireClubCreator(clubIdParam)` | Checks if user is the club's `creatorUserId` |
| `isAdmin` | Checks user ID against `ADMIN_USER_ID` env var |

### Auto-Join (Onboarding)
`POST /api/onboarding/quick-join` calls `autoJoinSampleClubs(userId)` which automatically creates approved join requests for a set of sample clubs. Idempotent — checks for existing requests before inserting.

### Waitlist Auto-Promotion
When someone cancels their "going" RSVP, the server immediately calls `promoteFirstFromWaitlist(eventId)`:
1. Finds the earliest-created "waitlisted" RSVP
2. Updates its status to `"going"`
3. Sends a `waitlist_promoted` notification to that user

### Quiz Matching Algorithm
Clubs are scored per user:
- +50 points if the club category matches any of the user's interests
- +25 points if the club vibe matches the user's vibe preference
- +15 points if the club city matches the user's city
- Up to +10 points based on member count (popularity signal)
- Capped at 99% match
- Top 6 clubs returned

### Club Creation → Auto-Promotion
When a user creates a club:
1. Club is created with `creatorUserId = userId`
2. If the user's role is `"user"`, it is automatically upgraded to `"organiser"`
3. A join request is created for the creator and immediately approved
4. Creator becomes founding member #1

### Recurrence Events
When creating an event with a recurrence rule, the server generates 5 instances total (the original + 4 more):
- `weekly` — 1 week apart
- `biweekly` — 2 weeks apart
- `monthly` — 1 month apart

---

## 14. API Reference Summary

### Public (no auth required)
| Method | Path | Description |
|---|---|---|
| GET | `/api/clubs` | List all active clubs (with optional search/filter) |
| GET | `/api/clubs/:id` | Get a single club |
| GET | `/api/events` | List upcoming events |
| GET | `/api/events/:id` | Get event details |
| GET | `/api/clubs/:id/events` | Events for a club |
| GET | `/api/clubs/:id/moments` | Moments for a club |
| GET | `/api/clubs/:id/faqs` | FAQs for a club |
| GET | `/api/clubs/:id/announcements` | Announcements for a club |
| GET | `/api/feed` | Global moments feed |

### Authenticated Users
| Method | Path | Description |
|---|---|---|
| POST | `/api/join` | Submit a join request |
| GET | `/api/user/clubs` | My approved clubs |
| GET | `/api/user/join-requests` | My join requests |
| PATCH | `/api/user/profile` | Update my profile |
| POST | `/api/user/photo` | Upload profile photo |

| POST | `/api/quiz` | Submit onboarding quiz |
| GET | `/api/quiz/matches` | Get quiz-matched clubs |
| POST | `/api/events/:id/rsvp` | RSVP to event |
| DELETE | `/api/events/:id/rsvp` | Cancel RSVP |
| POST | `/api/moments/:id/like` | Like a moment |
| DELETE | `/api/moments/:id/like` | Unlike a moment |
| POST | `/api/moments/:id/comments` | Comment on a moment |
| POST | `/api/events/:id/comments` | Comment on an event |
| POST | `/api/events/:id/kudos` | Give kudos after event |
| GET | `/api/notifications` | My notifications |
| PATCH | `/api/notifications/read-all` | Mark all as read |

### Organiser Only
| Method | Path | Description |
|---|---|---|
| POST | `/api/clubs/create` | Create a new club |
| GET | `/api/organizer/my-clubs` | My managed clubs |
| PATCH | `/api/organizer/club/:id` | Edit club details |
| GET | `/api/organizer/join-requests/:clubId` | Club's join requests |
| POST | `/api/organizer/join-requests/:id/approve` | Approve a request |
| POST | `/api/organizer/join-requests/:id/reject` | Reject a request |
| POST | `/api/clubs/:id/events` | Create an event |
| PATCH | `/api/events/:id` | Edit an event |
| DELETE | `/api/events/:id` | Delete an event |
| POST | `/api/clubs/:clubId/moments` | Post a moment |
| PATCH | `/api/clubs/:clubId/moments/:id` | Edit a moment |
| DELETE | `/api/clubs/:clubId/moments/:id` | Delete a moment |
| POST/PATCH/DELETE | `/api/clubs/:id/faqs` | Manage FAQs |
| POST/PATCH/DELETE | `/api/clubs/:id/schedule` | Manage schedule |
| POST/PATCH/DELETE | `/api/clubs/:id/announcements` | Manage announcements |
| POST | `/api/clubs/:id/polls` | Create a poll |
| POST | `/api/clubs/:id/co-organisers` | Add co-organiser |

### Admin Only
| Method | Path | Description |
|---|---|---|
| GET | `/api/admin/analytics` | Platform-wide stats |
| GET | `/api/admin/activity-feed` | Live activity stream |
| GET | `/api/admin/growth` | Weekly user growth |
| GET | `/api/admin/clubs` | All clubs |
| PATCH | `/api/admin/clubs/:id/activate` | Activate a club |
| PATCH | `/api/admin/clubs/:id/deactivate` | Deactivate a club |
| PATCH | `/api/admin/clubs/:id/health` | Set club health |
| GET | `/api/admin/users` | All users |
| GET | `/api/admin/users/:id/detail` | User detail |
| PATCH | `/api/admin/users/:id/role` | Change user role |
| GET | `/api/admin/events` | All events |
| DELETE | `/api/admin/events/:id` | Soft-delete event |
| PATCH | `/api/admin/events/:id/restore` | Restore event |
| GET | `/api/admin/join-requests` | All join requests |
| POST | `/api/admin/join-requests/:id/approve` | Approve request |
| POST | `/api/admin/join-requests/:id/reject` | Reject request |
| GET | `/api/admin/polls` | All polls |
| PATCH | `/api/admin/polls/:id/close` | Close a poll |
| POST | `/api/admin/broadcast` | Broadcast to all users |
