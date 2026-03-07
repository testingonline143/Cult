# CultFam — Complete User Guide & Flow Documentation

> This document covers every screen, button, click, and outcome for all three user roles:
> **Regular Member**, **Club Creator / Organiser**, and **Admin**.
> Written in plain English so anyone can understand exactly what happens at each step.

---

## Table of Contents

1. [App Overview](#1-app-overview)
2. [Landing Page (Unauthenticated)](#2-landing-page-unauthenticated)
3. [Sign In / Authentication](#3-sign-in--authentication)
4. [Onboarding Quiz (First-Time Users)](#4-onboarding-quiz-first-time-users)
5. [Matched Clubs Page](#5-matched-clubs-page)
6. [Regular Member — Full Flow](#6-regular-member--full-flow)
   - [Home Feed](#61-home-feed)
   - [Explore Page](#62-explore-page)
   - [Club Detail Page](#63-club-detail-page)
   - [Joining a Club](#64-joining-a-club)
   - [Event Detail & RSVP](#65-event-detail--rsvp)
   - [Events Calendar](#66-events-calendar)
   - [Posting Moments](#67-posting-moments)
   - [Notifications](#68-notifications)
   - [Profile Page](#69-profile-page)
7. [Club Creator / Organiser — Full Flow](#7-club-creator--organiser--full-flow)
   - [Creating a Club](#71-creating-a-club)
   - [Organiser Dashboard — Overview Tab](#72-organiser-dashboard--overview-tab)
   - [Organiser Dashboard — Requests Tab](#73-organiser-dashboard--requests-tab)
   - [Organiser Dashboard — Events Tab](#74-organiser-dashboard--events-tab)
   - [Organiser Dashboard — Content Tab](#75-organiser-dashboard--content-tab)
   - [Organiser Dashboard — Insights Tab](#76-organiser-dashboard--insights-tab)
   - [Organiser Dashboard — Edit Tab](#77-organiser-dashboard--edit-tab)
   - [Organiser Dashboard — Announcements Tab](#78-organiser-dashboard--announcements-tab)
   - [QR Code Attendance Scanner](#79-qr-code-attendance-scanner)
8. [Admin — Full Flow](#8-admin--full-flow)
   - [Accessing the Admin Panel](#81-accessing-the-admin-panel)
   - [Analytics Tab](#82-analytics-tab)
   - [Clubs Tab](#83-clubs-tab)
   - [Join Requests Tab](#84-join-requests-tab)
   - [Users Tab](#85-users-tab)
9. [Shared Elements](#9-shared-elements)
   - [Navigation Bar](#91-navigation-bar)
   - [Notifications Badge](#92-notifications-badge)
10. [Edge Cases & Special States](#10-edge-cases--special-states)

---

## 1. App Overview

CultFam is a mobile-first community platform for discovering and joining local hobby clubs, currently focused on Tirupati. The app connects three types of people:

- **Regular Members** — People looking to find and join hobby clubs
- **Club Creators / Organisers** — People who run a club and manage its members and events
- **Admins** — Platform super-users who can oversee everything

The app runs entirely in a browser (optimised for mobile). There is no separate mobile app to download.

---

## 2. Landing Page (Unauthenticated)

**URL:** `/`

When someone visits CultFam for the very first time (not logged in), they land here.

**What they see:**
- A full-screen hero section with the headline "Your city's hobby scene. *All in one place.*"
- Two buttons: **"Explore Clubs →"** and **"Start a Club"**
- An animated activity ticker showing recent community activity (e.g., "Ravi joined Trekkers")
- A scrolling showcase of active clubs with their name, emoji, member count, schedule, and location
- A "How It Works" section: Find a club → Join → Show up
- An "Organiser" section explaining the benefits of creating a club
- A footer with links

**What each button does:**

| Button | What happens |
|---|---|
| **"Explore Clubs →"** | Scrolls down to the clubs showcase OR navigates to `/explore` |
| **"Start a Club"** | Takes user to `/api/login` (prompts sign-in first) |
| **"Sign In"** (top right) | Takes user to `/api/login` |
| **"List Your Club"** (top right) | Takes user to `/api/login` |
| **Any club card** | Shows a preview; clicking "Join" prompts sign-in |
| **"Tirupati"** city badge (top) | Currently shows the active city — decorative |

**Auto-redirect:** If a user is already logged in and visits `/`, they are **immediately redirected to `/home`** (the personalised feed). They never see the landing page again while their session is active.

---

## 3. Sign In / Authentication

**URL:** `/api/login` → Replit Auth → `/api/callback` → `/home` or `/onboarding`

CultFam uses **Replit Auth** (a Google/GitHub-style single sign-on). There is no username/password to remember.

**Flow step by step:**
1. User clicks any "Sign In", "Join", or "List Your Club" button
2. They are redirected to Replit's login screen
3. They sign in with their Replit account (or create one — takes 30 seconds)
4. Replit sends them back to CultFam automatically
5. CultFam checks: **Has this person taken the quiz?**
   - **No quiz yet** → redirect to `/onboarding` (the interest quiz)
   - **Quiz done** → redirect to `/home` (the personalised feed)

**What gets created:** On first sign-in, CultFam creates a user record with their Replit name, email, and a unique ID. Their session is stored securely and persists across browser sessions until they sign out.

---

## 4. Onboarding Quiz (First-Time Users)

**URL:** `/onboarding`

Every new user must complete this 5-step quiz before they can use the app. It's used to find matching clubs for them. If a user tries to visit any other page before completing it, they are automatically redirected back here.

**Step 1 — Interests (pick up to 3):**
Options include: Running, Cycling, Trekking, Football, Cricket, Badminton, Chess, Music, Art & Craft, Photography, Books, Writing, Yoga, Dance, Gaming, Cooking, and more.
- User taps their interests (they light up in terra/orange when selected)
- Must pick at least 1 to proceed
- "Next →" button at the bottom activates once selection is made

**Step 2 — Availability (when are you free?):**
Options: Early Morning (5–8am), Morning (8–11am), Afternoon, Evening (5–8pm), Night, Weekends Only.
- Multiple selections allowed
- "Next →" to proceed

**Step 3 — Vibe (activity intensity preference):**
Options: Chill (casual, social), Moderate (balanced), Intense (competitive, serious).
- Single selection
- "Next →" to proceed

**Step 4 — Experience Level:**
Options: Beginner (just starting), Intermediate (some experience), Passionate (dedicated practitioner).
- Single selection
- "Next →" to proceed

**Step 5 — Who are you?**
Options: Student, Working Professional, Homemaker, Retired, Other.
- Single selection
- **"Find My Tribe →"** button (final submit)

**What happens on submit:**
- Quiz answers are saved to the user's profile
- `quizCompleted` is set to `true` so they won't see this page again
- User is redirected to `/matched-clubs`

**Re-taking the quiz:** Users can redo the quiz any time from their Profile page by tapping "Redo Quiz". This updates their preferences and refreshes their matched clubs.

---

## 5. Matched Clubs Page

**URL:** `/matched-clubs`

This page appears immediately after the quiz and shows personalised club recommendations.

**What they see:**
- A heading "Your Tribe Awaits 🎯"
- Each club card shows: name, category emoji, match percentage (e.g., "94% match"), why it matched ("Matches: Trekking, Morning, Casual"), member count, schedule, and location
- Clubs are sorted by match score, highest first

**What each button does:**

| Button | What happens |
|---|---|
| **Club card / "View Club"** | Opens the Club Detail page (`/club/:id`) |
| **"Explore All Clubs"** | Goes to `/explore` to browse everything |
| **"Go to Home Feed"** | Goes to `/home` |

**Edge case:** If no clubs match their exact preferences, a general list of active clubs is shown instead with a message encouraging them to explore.

---

## 6. Regular Member — Full Flow

### 6.1 Home Feed

**URL:** `/home`

This is the main screen members see after logging in. It is personalised based on their clubs and activity.

**What they see (when they have joined clubs):**

**Top section — Greeting card:**
- "Hey [Name] 👋" with their profile photo or initials
- A circular progress ring showing how many clubs they've joined (goal: 5 clubs)
- Streak information (if enabled)

**"Happening Soon" section:**
- Events from their clubs happening within the next 48 hours
- Each card shows: club emoji, event name, date, time, location
- Tapping an event card opens the Event Detail page

**"My Clubs" section:**
- Horizontal scroll of clubs they belong to
- Each club shows its emoji, name, and member count
- Tapping a club opens its Club Detail page
- A "+" add button takes them to `/explore`

**"Community" feed section:**
- A vertical scroll of "Moments" (photo/text posts) from all clubs on the platform
- Each moment card shows: club name, club emoji, time posted, author name (if available), photo or emoji, caption, like count, comment count
- **Like button** — tap the heart to like/unlike (optimistic update, instant visual feedback)
- **Comment button** — tap the speech bubble icon to navigate to the club moments tab
- **Share button** — taps the share icon; on mobile opens the native share sheet; on desktop copies the link to clipboard; a toast confirms "Link copied!"

**"Discover New Clubs" section (if they haven't joined all clubs):**
- A 2-column grid of clubs they haven't joined yet
- Each card shows name, category, member count, location, schedule
- Tapping a card opens the Club Detail page

**What they see (brand new user — 0 clubs joined):**

Instead of the My Clubs section, they see a bold **"Find Your First Tribe"** hero card:
- Terra gradient background
- "Find Your Tribe in Tirupati" heading
- Count of active clubs waiting
- Horizontal scroll of club preview cards (name + emoji)
- **"Explore Clubs →"** button → goes to `/explore`
- **"Take Quiz"** button (if quiz not completed yet) → goes to `/onboarding`

The Community feed shows the first 4 moments only, followed by a **"There's more inside"** lock card:
- Terra gradient card with 🔒 icon
- "Join a club to see all moments from your community"
- **"Explore Clubs →"** button → goes to `/explore`

---

### 6.2 Explore Page

**URL:** `/explore`

A searchable, filterable directory of all clubs on the platform.

**What they see:**
- A search bar at the top ("Search clubs, hobbies...")
- Filter chips: All, Trekking, Fitness, Books, Photography, Cycling, Art, Music, etc.
- Secondary filters: City, Vibe (Casual / Competitive), Time of Day (Morning, Evening, Weekends)
- A grid/list of all matching club cards

**What each interaction does:**

| Action | What happens |
|---|---|
| **Type in search bar** | Filters clubs live by name and description |
| **Tap a category chip** | Shows only clubs in that category |
| **Tap "City" filter** | Dropdown to pick Tirupati, Hyderabad, etc. |
| **Tap "Vibe" filter** | Toggle Casual vs. Competitive |
| **Tap "Time" filter** | Toggle Morning / Evening / Weekends |
| **Tap a club card** | Opens Club Detail page (`/club/:id`) |
| **Tap "Start a Club"** (if no results) | Goes to `/create` |

**Club card shows:**
- Club emoji + name
- Category badge
- Health status dot (green = Very Active, yellow = Growing)
- "X members", schedule, location
- Founding member spots remaining (if still open)
- "Join" or "View" button

---

### 6.3 Club Detail Page

**URL:** `/club/:id`

The full profile page for a specific club. Anyone can view this page — you don't need to be a member.

**Header section:**
- Club cover image (if set) or a colour gradient with emoji
- Club name, category, organiser name, city
- Health status badge ("Very Active", "Growing", etc.)
- Member count + founding member count
- Schedule and location
- "Chat on WhatsApp" button → opens WhatsApp group link in new tab (for approved members only)

**Tab bar (switches between sections):**

**Meet-ups tab** (default):
- Lists all upcoming events for this club
- Each event card shows: title, date, time, location, RSVP count / capacity
- **"RSVP"** button → adds user to the attendee list (they must be a member or can RSVP if the club allows)
- **"View Details"** → opens Event Detail page
- If no events: "No upcoming events" message

**Schedule tab:**
- Shows the club's regular weekly schedule (e.g., "Every Sunday 5:30 AM at Alipiri Gate")
- This is different from specific one-off events — it's the recurring routine

**Moments tab:**
- Social feed of photo/text posts from this club
- Each moment: author avatar (initials), author name, time posted, emoji or photo, caption
- **Like, Comment** interactions
- If user is an approved member: **"Share a Moment"** button appears at the top
  - Tapping opens a post form with: caption textarea, emoji picker (12 emoji options), optional photo upload
  - **"Post Moment"** button submits (disabled if caption is empty)
  - **"Cancel"** collapses the form
  - After posting, the moment appears at the top of the feed instantly

**Gallery tab:**
- Grid of all photo moments from the club
- Tapping a photo opens a full-screen view

**About / FAQs tab:**
- Full club description
- Organiser profile (name, years running, typical response time, avatar emoji)
- FAQs in an accordion (question expands to show answer on tap)

**Members tab:**
- Preview of the first few approved members with their name and initials
- "Founding Members" highlighted with a special badge
- Tapping a member opens their public profile (`/member/:id`)

**Polls tab:**
- Active polls the organiser has created
- User can tap a poll option to vote (one vote per poll, cannot change)
- Vote counts shown as a bar after voting

**Rating section (bottom of page):**
- 5-star tap rating
- Short text review field
- "Submit Rating" button → saves the review

---

### 6.4 Joining a Club

**Who can join:** Any authenticated user whose quiz is completed.

**Flow:**

**Step 1 — Click "Request to Join" button on the club card or club detail page**

**Step 2 — Join form appears (bottom sheet / modal):**
- Name field (pre-filled from profile)
- Phone number field
- Answer to Join Question 1 (if the organiser set one — e.g., "Why do you want to join?")
- Answer to Join Question 2 (if set — e.g., "What is your fitness level?")
- **"Submit Request"** button

**Step 3 — After submitting:**
- User sees "Request Pending" status on the club page
- Their join request appears in the organiser's dashboard
- They receive a notification when approved or rejected

**If approved:**
- Status changes to "Member" on the club page
- They can now RSVP to events, post moments, and access the WhatsApp group link
- If they are within the founding member limit → they get a "Founding Member" badge permanently

**If rejected:**
- They see "Request not approved" on the club page
- They receive a notification explaining the decision
- They can submit a new request later (the button reappears)

**Founding Member spots:**
- Each club has a limited number of founding spots (e.g., 20)
- The club card shows "X founding spots left"
- First-come, first-served: once all spots are taken, new members join as regular members
- Founding member status is permanent — it shows on their profile and the club's Members tab

**Leaving a club:**
- "Leave Club" button appears on the club detail page if they are a member
- Tapping shows a confirmation dialog: "Are you sure you want to leave [Club Name]?"
- **"Confirm Leave"** → removes them from the member list; their founding member status is lost
- **"Cancel"** → nothing happens

---

### 6.5 Event Detail & RSVP

**URL:** `/event/:id`

Full information page for a specific event.

**What they see:**
- Event cover image (if set) or a gradient card
- Event title, date, time, location
- Club name (tap to go to club page)
- Organiser name
- RSVP count vs. capacity (e.g., "12 / 20 going")
- Map or location text
- Event description

**RSVP buttons:**

| State | Button shown | What clicking does |
|---|---|---|
| Not RSVPed | **"I'm Going ✓"** | Adds them to attendee list; button changes to "Cancel RSVP"; sends confirmation notification |
| RSVPed | **"Cancel RSVP"** | Removes them from the list; button reverts |
| Event full | **"Join Waitlist"** | Puts them on the waitlist; they'll get a notification if a spot opens |
| On waitlist | **"Leave Waitlist"** | Removes them from the waitlist |
| Event passed | **"Attended"** or **"Missed"** | Shows their check-in status (read-only after event) |

**QR Ticket:**
- Once RSVPed, a **"View My Ticket"** section appears
- Shows a unique QR code tied to their RSVP
- At the event, the organiser scans this QR code to mark them as "Attended"

**Comments section:**
- Only visible to club members
- Text field + "Post" button
- Comments appear in reverse-chronological order
- User can delete their own comments

**Share button:**
- Shares the event link via native share sheet or copies to clipboard

---

### 6.6 Events Calendar

**URL:** `/events`

A list of all upcoming events across the platform (not just the clubs they've joined).

**What they see:**
- Two sections: "My Club Events" (events from clubs they've joined) and "Other Events" (public events from other clubs)
- Each card shows: event name, club, date, time, location, RSVP count
- Tapping any card opens the Event Detail page
- RSVP button directly on the card (same flow as above)

---

### 6.7 Posting Moments

Members who have been **approved** into a club can post moments in that club's Moments tab.

**Flow:**
1. Open the club's Moments tab
2. Tap **"Share a Moment"** button (only visible to approved members)
3. A form expands below the button:
   - **Caption** text area — what they want to say
   - **Emoji picker** — 12 mood/reaction emojis (🎉 📸 🏃 🎵 📚 🌄 ⚽ 🎨 🍜 💪 🧘 🎭)
   - **"+ Add Photo"** upload button — optional; opens file picker; shows preview once uploaded
4. Tap **"Post Moment"** — disabled if caption is blank
5. The moment appears at the top of the feed immediately with "You" as the author name
6. Tap **"Cancel"** anytime to collapse the form without posting

**Editing/Deleting moments:**
- A user can edit or delete their own moments
- Three-dot menu or pencil/trash icon appears on their own moment cards
- Editing reopens the form with the existing content
- Deleting shows a confirmation dialog

---

### 6.8 Notifications

**URL:** `/notifications`

All system and club-related updates in one place.

**Types of notifications a member receives:**

| Notification | When it appears |
|---|---|
| "Membership Approved!" | When organiser or admin approves their join request |
| "Membership Update" (rejected) | When organiser or admin rejects their join request |
| "New Event" | When a club they're in creates a new event |
| "RSVP Confirmed" | When they successfully RSVP |
| "You're off the waitlist!" | When a spot opens and they are promoted from waitlist |
| "New Announcement" | When organiser pins a broadcast to the club |

**What each interaction does:**

| Action | What happens |
|---|---|
| **Tap a notification** | Navigates to the relevant page (club, event, etc.) |
| **"Mark as Read"** | Fades the notification and clears the unread badge |
| **"Mark All Read"** | Marks every notification as read at once |

**Unread badge:** The bell icon in the navigation bar shows a red dot + count when there are unread notifications. This count updates automatically every 30 seconds.

---

### 6.9 Profile Page

**URL:** `/profile`

The user's personal settings and activity record.

**What they see:**

**Top section:**
- Profile photo (tap to upload a new one)
- Their name and email
- City (editable)
- Bio text (editable — tap to edit inline)
- **"Save"** button appears when any field is changed

**Badges section:**
- "Founding Member" badge (shown for each club where they have founding status)
- "Attended X events" badge

**My Clubs section:**
- List of all clubs they belong to with status (Pending, Approved)
- Tap any club to go to its Club Detail page

**Upcoming Events section:**
- Their RSVPed events that haven't happened yet
- Tap to view Event Detail

**Past Events section:**
- Previous events with attendance status: "Attended ✓" (check-in confirmed) or "Missed" (RSVPed but no check-in)

**Redo Quiz button:**
- Tapping opens the onboarding quiz again
- Re-completing it updates their interest profile and refreshes their matched clubs

**Sign Out button:**
- Ends their session immediately
- They are redirected to the landing page (`/`)

---

## 7. Club Creator / Organiser — Full Flow

### 7.1 Creating a Club

**URL:** `/create`

Any user can create a club. After creating, they automatically become the organiser.

**Creation form — Page 1 (Club Basics):**
- **Club Name** — text field (required)
- **Category** — dropdown: Trekking, Fitness, Books, Photography, Cycling, Art, Music, Tech, Food, Gaming, Dance, Other
- **Short Description** — one-liner tagline (shown on club cards)
- **Full Description** — longer paragraph about what the club does
- **Schedule** — text (e.g., "Every Sunday at 5:30 AM")
- **Location** — text (e.g., "Alipiri Gate, Tirupati")
- **City** — dropdown

**Creation form — Page 2 (Branding):**
- **Club Emoji** — emoji picker (tap to pick from a grid)
- **Cover Photo** — optional image upload (shown at top of club page)
- **Background Colour** — colour picker for the club card background
- **WhatsApp Group Link** — optional link to the club's WhatsApp group (only shown to approved members)
- **Founding Member Limit** — number of founding spots (default: 20)

**Creation form — Page 3 (Join Questions):**
- **Join Question 1** — optional custom question for applicants (e.g., "What's your experience level?")
- **Join Question 2** — optional second question

**"Create Club" button:**
- Validates all required fields
- Creates the club in the database
- Sets the creator as the club organiser
- Redirects to the Organiser Dashboard (`/organizer`) for the new club
- The creator's role is updated to "organiser" if it wasn't already

**Note:** Creating a club does not require admin approval. It is live immediately. Admins can deactivate clubs later if needed.

---

### 7.2 Organiser Dashboard — Overview Tab

**URL:** `/organizer` (defaults to Overview tab)

The first screen an organiser sees. Shows the health and status of their club at a glance.

**Club selector (top):**
- If they manage multiple clubs, a horizontal scrollable list of club names appears
- Tapping a different club loads that club's dashboard

**"Your Club is Live!" Getting Started Checklist** (shown for new clubs):
This card appears when the club has fewer than 1 event AND fewer than 1 moment.

| Checklist item | Status | Clicking does |
|---|---|---|
| Club created | ✓ Always done | Nothing — decorative |
| Create your first event | ☐ or ✓ | Navigates to Events tab |
| Post your first moment | ☐ or ✓ | Navigates to Content tab → Moments section |
| Share your club link | Always shown | Copies the club's public URL to clipboard |

Below the checklist: "Your club link: cultfam.app/club/[id]" in a copyable box.

The checklist **disappears** once the club has at least 1 event AND at least 1 moment.

**Club Health Card:**
- Health status badge (e.g., "Very Active 🟢")
- Member count with a "X founding spots claimed" sub-line
- City and schedule

**Quick Actions:**
- **"X pending requests"** badge → tapping goes to Requests tab filtered to pending
- **"Next Event: [Name]"** card → shows the soonest upcoming event with date and a **"Scan"** button
  - Tapping **"Scan"** → opens the QR attendance scanner for that event (`/scan/:eventId`)
- **"Manage Members"** → goes to Requests tab showing approved members

**Club Link Copy:**
- "Copy Link" button → copies `https://cultfam.app/club/[id]` to clipboard
- Toast confirms "Link copied!"
- "Share via WhatsApp" button → opens WhatsApp with a pre-filled message containing the club link

---

### 7.3 Organiser Dashboard — Requests Tab

This tab manages everyone who has applied to join the club.

**Filter buttons:**
- **Pending** — awaiting decision (default view, shows badge count)
- **Approved** — current members
- **Rejected** — declined applicants

**Each request card shows:**
- Applicant's name and phone number
- Time of request
- Answers to the club's join questions (if any were set)
- Founding member eligibility note (if spots remain)

**Action buttons per card:**

| Button | What happens |
|---|---|
| **"Approve ✓"** | Moves request to Approved; increments club member count; sends "Membership Approved!" notification to the user; if founding spots remain, marks them as founding member |
| **"Reject ✗"** | Moves request to Rejected; sends "Membership Update" notification to the user |
| **"Remove"** (on Approved tab) | Removes the member; decrements member count |

**CSV Export button** (on Approved tab):
- **"Download Members CSV"** → downloads a file with columns: Name, Phone, Join Date, Founding Member status

---

### 7.4 Organiser Dashboard — Events Tab

Full event management for the club.

**Creating a new event:**
Tap **"+ Create New Event"** to expand the creation form:

| Field | Description |
|---|---|
| **Title** | Event name (required) |
| **Description** | What will happen at the event |
| **Date & Time** | Date/time picker (required) |
| **Location** | Where the event is held |
| **Max Capacity** | Maximum number of RSVPs (default: 20) |
| **Repeat** | None / Weekly / Bi-weekly / Monthly — if set, creates 4 instances automatically |
| **Cover Photo** | Optional image upload |

- **"Create Event"** button → saves the event; it immediately appears on the club's Meet-ups tab and in the Events Calendar
- **"Cancel"** → collapses the form

**Existing event cards show:**
- Title, date, time, location
- RSVP count vs. capacity (e.g., "8 / 20 RSVPs")
- Waitlist count (if event is full)

**Three-dot menu on each event:**

| Option | What happens |
|---|---|
| **"Edit"** | Opens an edit form pre-filled with the event's current data; save updates the event for all users |
| **"Duplicate"** | Pre-fills the creation form with this event's details so a similar event can be created quickly |
| **"View Attendees"** | Shows a list of everyone who has RSVPed with their check-in status |
| **"Cancel Event"** | Marks the event as cancelled; all RSVPed members receive a notification; the event shows as "Cancelled" on the club page |

**The event link** (copy button on each card):
- Copies the event's public URL to clipboard for sharing

---

### 7.5 Organiser Dashboard — Content Tab

Manages supplementary club content. Has 4 sub-sections selectable by tabs at the top.

**Sub-section: FAQs**
- List of all existing Q&A pairs
- **"+ Add FAQ"** → form with Question and Answer fields; "Save" adds it
- **Edit (pencil icon)** on each FAQ → edit inline; "Save" updates it
- **Delete (trash icon)** → removes the FAQ with a confirmation prompt

**Sub-section: Schedule**
- The club's regular weekly/recurring schedule (not one-off events)
- Example entry: "Every Sunday, 5:30 AM, Alipiri Gate — Morning Trek"
- **"+ Add Schedule Entry"** → form with Day, Time, Location, Activity fields
- **Edit / Delete** per entry (same as FAQs)

**Sub-section: Moments**
- The organiser's view of all moments posted in this club
- They can post new moments using the same form as members (caption, emoji, photo)
- They can **delete any moment** posted by any member (moderation power)
- They **cannot** edit another member's moment text — only delete it

**Sub-section: Polls**
- Create a multiple-choice question to gather member feedback
- **"+ Create Poll"** → form with: Question, up to 4 answer options, optional expiry date
- Once published, the poll appears on the club's Polls tab for members to vote on
- Organiser sees real-time vote counts per option
- **"Close Poll"** button → stops accepting new votes; shows final results

---

### 7.6 Organiser Dashboard — Insights Tab

Analytics about the club's performance.

**Metrics shown:**
- Total approved members
- Total events held
- Average attendance per event (based on check-in scans)
- Engagement rate (RSVPs ÷ total members, shown as %)
- No-show rate (RSVPed but didn't check in, shown as %)

**Member Growth Chart:**
- Bar chart showing new members per week for the last 8 weeks
- Helps organiser see if growth is accelerating or slowing

**Most Active Members leaderboard:**
- Top 5 members ranked by number of events attended
- Shows name and attendance count

**Top Moments:**
- Moments with the highest like counts

---

### 7.7 Organiser Dashboard — Edit Tab

**Only the club creator (not co-organisers) can access this tab.**

Allows updating the club's core profile.

**Editable fields:**
- Club Name
- Short description (tagline)
- Full description
- Schedule text
- Location
- WhatsApp link
- Cover photo (upload new or remove existing)
- Club emoji
- Background colour
- Join Question 1 and 2 (can be added, edited, or cleared)

**"Save Changes"** button → updates the club profile immediately; all visitors see the new info.

---

### 7.8 Organiser Dashboard — Announcements Tab

Send messages to all club members at once.

**Creating an announcement:**
- **Title** field (required)
- **Message body** field (required)
- **"Pin to club page"** toggle — if enabled, the announcement appears as a pinned card at the top of the club's detail page
- **"Send to All Members"** button → creates a notification for every approved member with the announcement content; pinned announcements appear on the club page instantly

**Managing existing announcements:**
- List of past announcements with date, title, and pin status
- **"Unpin"** button on pinned announcements → removes it from the club page
- **"Delete"** button → removes the announcement record

---

### 7.9 QR Code Attendance Scanner

**URL:** `/scan/:eventId`

A tool for marking members as "Attended" at the event venue.

**What the organiser sees:**
- Event name and date at the top
- A large camera viewfinder box (dark background)
- "Start Camera Scanner" button in the centre of the viewfinder (before camera starts)
- A manual search field below ("Search by name or phone")
- A full attendee list showing everyone who RSVPed with their current check-in status

**Flow:**
1. Organiser taps **"Start Camera Scanner"**
2. Browser asks for camera permission — organiser taps "Allow"
3. Camera view appears with a green scanning square overlay
4. **Torch/Flashlight button** appears in the top-right corner of the viewfinder (on devices that support it) — tapping toggles the torch on/off (orange when on, dark when off)
5. Member opens their ticket QR code on their phone
6. Organiser points the camera at the QR code
7. Scanner reads it instantly

**Outcomes:**

| Result | What shows on screen | Sound/vibration |
|---|---|---|
| **Successful check-in** | Green overlay: "✓ [Name] — Checked in!" | Single long vibration |
| **Already checked in** | Yellow overlay: "[Name] already checked in" | Two short vibrations |
| **Wrong QR / invalid** | Red overlay: "Not a valid CultFam ticket" | Three rapid vibrations |
| **Check-in failed** | Red overlay: "Check-in failed — try scanning again" | Three rapid vibrations |

After 2.5 seconds, the overlay disappears and the scanner is ready for the next person.

**Manual check-in:**
- Organiser types a member's name or phone number in the search box
- Matching members appear in the list
- Tap **"Check In"** next to their name → marks them as attended instantly (same as QR scan)

**Attendee list:**
- Shows all RSVPed members
- Green checkmark ✓ next to those already checked in
- Helps organiser track who has arrived

---

## 8. Admin — Full Flow

### 8.1 Accessing the Admin Panel

**URL:** `/admin`

Access is strictly controlled. Only the person whose Replit user ID matches the `ADMIN_USER_ID` environment variable can use the admin panel.

**If the ADMIN_USER_ID is not set:**
- The admin page shows a setup screen
- It displays the current user's Replit ID
- Instructions: "Add this ID as a secret called ADMIN_USER_ID in your Replit project settings"

**If the user is not the admin:**
- The page shows "Access Denied"
- All `/api/admin/*` API routes return HTTP 403 Forbidden

**If the user is the admin:**
- The full admin dashboard loads with 4 tabs: Analytics, Clubs, Requests, Users

---

### 8.2 Analytics Tab

Platform-wide statistics.

**Key metrics cards:**
- Total registered users
- Active clubs
- Total events created
- Total RSVPs
- Total check-ins
- Total moments posted
- Total comments

**Platform Growth Chart:**
- Bar chart of new user registrations per week (last 8 weeks)
- Helps admin see if the platform is growing or stagnating

**City Breakdown:**
- Count of clubs per city

**"Platform Pulse" activity feed:**
- Live scroll of recent activity: "[Name] joined [Club]", "[Club] created a new event", etc.

**Broadcast button:**
- **"Send Platform Broadcast"** → opens a form with Title and Message fields
- Tapping **"Send to All Users"** creates a notification for every single user on the platform
- Used for important announcements like new city launches or maintenance windows

---

### 8.3 Clubs Tab

A searchable list of every club on the platform.

**Each club row shows:**
- Club name and emoji
- Category
- Organiser name
- Member count
- City
- Current active/inactive status

**Search bar:** Filter clubs by name in real-time.

**Per-club actions:**

| Button | What happens |
|---|---|
| **"Pause Club"** (on active club) | Sets club to inactive; the club is hidden from Explore and new members cannot join; existing members are unaffected |
| **"Activate Club"** (on paused club) | Makes the club live again |
| **"Set Health Status"** | Opens a dropdown: Very Active, Active, Growing, Slow, Inactive — updates the health badge visible to all users on the club's page and card |

---

### 8.4 Join Requests Tab

Global view of every pending join request across all clubs.

**What admin sees:**
- Every unresolved join request on the platform, sorted by newest first
- Applicant's name, phone, the club they applied to, time of request, and their answers to join questions

**Per-request actions:**

| Button | What happens |
|---|---|
| **"Approve"** | Approves the membership; increments the club's member count; checks founding member eligibility; sends "Membership Approved!" notification to the user |
| **"Reject"** | Rejects the request; sends "Membership Update" notification to the user |

Admin approval has the exact same effect as organiser approval — the user becomes a full club member.

---

### 8.5 Users Tab

A directory of every registered user on the platform.

**Search bar:** Filter by name or email.

**Each user row shows:**
- Name, email, profile photo (or initials)
- Current role: user / organiser / admin
- Date joined

**Per-user actions:**

| Button | What happens |
|---|---|
| **"View Details"** | Opens a side drawer with the user's full history: clubs joined, events attended, moments posted, past join requests |
| **"Change Role → organiser"** | Upgrades the user to organiser role; they can now create and manage clubs |
| **"Change Role → user"** | Demotes an organiser back to regular user; they lose organiser dashboard access |
| **"Change Role → admin"** | Promotes the user to admin — use with extreme caution |

---

## 9. Shared Elements

### 9.1 Navigation Bar

The bottom navigation bar is visible on every page for logged-in users. It has 5 icons:

| Icon | Page | URL |
|---|---|---|
| 🏠 Home | Home Feed | `/home` |
| 🔍 Explore | Club Directory | `/explore` |
| ➕ Create | Start a Club / Add Event | `/create` |
| 🔔 Notifications | Inbox | `/notifications` |
| 👤 Profile | Personal Profile | `/profile` |

The "+" icon in the centre goes to `/create`. If the user already has a club, it may show a quick-create panel.

Organisers also see a **🗂 Dashboard** shortcut (or they navigate via profile → "My Clubs → Manage").

### 9.2 Notifications Badge

- Red circle with number on the 🔔 bell icon
- Updates every 30 seconds automatically
- Disappears when all notifications are marked as read
- Tapping the bell goes to `/notifications`

---

## 10. Edge Cases & Special States

| Situation | What happens |
|---|---|
| **User visits any protected page while logged out** | Redirected to `/api/login` automatically |
| **User visits any page before completing the quiz** | Redirected to `/onboarding` (except landing page and admin) |
| **Event is at full capacity** | RSVP button changes to "Join Waitlist" |
| **User on waitlist when someone cancels RSVP** | Automatic promotion; they receive a "You're off the waitlist!" notification |
| **User tries to post a moment without a caption** | "Post Moment" button stays disabled; no submission possible |
| **Organiser scans a QR code for the wrong event** | Red overlay error; the system validates event ID inside the QR code |
| **Scanner is opened on desktop/PC** | Camera view still launches using desktop webcam (front camera) — torch button is hidden since desktop cameras don't have torches |
| **Club has no events yet** | "No upcoming events" empty state with a prompt for the organiser to create one |
| **Club founding spots are all taken** | "Founding Member" slots show as "FULL"; new approvals join as regular members |
| **User re-takes quiz** | Their interest profile updates; their Matched Clubs page refreshes with new recommendations |
| **Admin sets a club to Inactive** | Club disappears from Explore and new join requests are blocked; existing members still have access |
| **Multiple clubs managed by one organiser** | A club-switcher selector appears at the top of the Organiser Dashboard |
| **Moment with emoji "fire" or "star" in old data** | Automatically displayed as 🔥 or ⭐ (backwards-compatibility alias) |
| **User shares a moment on a device without native share API** | Falls back to clipboard copy; toast shows "Link copied!" |
| **WhatsApp group link not set by organiser** | "Chat on WhatsApp" button is hidden; members see nothing |
