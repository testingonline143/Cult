# CultFam — Complete UI/UX Design Reference

> This document is the single source of truth for every visual decision in CultFam.
> It covers the full design system, every page layout, every button (colour, label, action, all states),
> interactive behaviour, spacing, typography, and edge-case visuals.
> A designer or developer should be able to recreate any screen from this document alone.

---

## Table of Contents

1. [Design System](#1-design-system)
   - [Colour Palette](#11-colour-palette)
   - [Typography](#12-typography)
   - [Spacing Scale](#13-spacing-scale)
   - [Shadow Scale](#14-shadow-scale)
   - [Border Radius](#15-border-radius)
2. [Component Library](#2-component-library)
   - [Buttons](#21-buttons)
   - [Cards](#22-cards)
   - [Badges](#23-badges)
   - [Inputs & Forms](#24-inputs--forms)
   - [Toasts & Alerts](#25-toasts--alerts)
3. [Global Interactive States](#3-global-interactive-states)
4. [Navigation Bar](#4-navigation-bar)
5. [Landing Page](#5-landing-page)
6. [Onboarding Quiz](#6-onboarding-quiz)
7. [Matched Clubs Page](#7-matched-clubs-page)
8. [Home Feed](#8-home-feed)
9. [Explore Page](#9-explore-page)
10. [Club Detail Page](#10-club-detail-page)
11. [Event Detail Page](#11-event-detail-page)
12. [Notifications Page](#12-notifications-page)
13. [Profile Page](#13-profile-page)
14. [Organiser Dashboard](#14-organiser-dashboard)
15. [Admin Panel](#15-admin-panel)
16. [QR Code Scanner](#16-qr-code-scanner)

---

## 1. Design System

### 1.1 Colour Palette

The entire app uses a warm, editorial palette inspired by handcrafted paper, terracotta clay, and Indian ink.

#### Primary Colours

| Token | Hex | Usage |
|---|---|---|
| `--terra` | `#C4622D` | Primary CTA buttons, active states, links, progress bars, key accents |
| `--terra2` | `#A84E22` | Darker terra for pressed/active button states, hover borders |
| `--terra-light` | `#F0845A` | Lighter terra for gradients, pill selections, icon backgrounds |
| `--terra-pale` | `rgba(196,98,45,0.10)` | Badge backgrounds, tag fills, unread notification tint |

#### Neutral / Dark

| Token | Hex | Usage |
|---|---|---|
| `--ink` | `#1A1410` | Primary body text, headings, icons |
| `--ink2` | `#2D2419` | Slightly lighter text for cards, subheadings |
| `--ink3` | `#3D3228` | Tertiary labels, captions |
| `--muted-warm` | `#8A7A6A` | Placeholder text, timestamps, secondary labels |
| `--muted-warm2` | `#B5A898` | Disabled text, faint captions |

#### Background / Surface

| Token | Hex | Usage |
|---|---|---|
| `--cream` | `#F5F0E8` | Global page background (the body background colour) |
| `--cream2` | `#EDE8DC` | Slightly darker cream for alternating rows, input fills |
| `--cream3` | `#E4DDCE` | Borders on cream backgrounds, hover states on cream |
| `--warm-white` | `#FDFAF5` | Card surfaces, modals, drawers — slightly warmer than pure white |

#### Accent Colours

| Token | Hex | Usage |
|---|---|---|
| `--gold` | `#C9A84C` | Founding member badges, star ratings, premium indicators |
| `--gold-pale` | `rgba(201,168,76,0.15)` | Gold badge backgrounds, highlight fills |
| `--green-accent` | `#3D6B45` | WhatsApp button border, "Very Active" health status, success indicators |

#### Semantic / System

| Token | Value | Usage |
|---|---|---|
| `--destructive` | `hsl(0 84% 60%)` ≈ `#F04040` | Delete, reject, error states |
| `--border` | `rgba(26,20,16,0.10)` | Default border on cards and containers |
| `--warm-border` | `rgba(26,20,16,0.10)` | Glass card borders |
| `--warm-border2` | `rgba(26,20,16,0.06)` | Subtler dividers |

---

### 1.2 Typography

Three fonts form the type system. They are loaded from Google Fonts and defined in `:root`.

#### Font 1 — Outfit (Body)
- **Variable:** `--font-sans`
- **Stack:** `'Outfit', sans-serif`
- **Applied to:** All body copy, labels, captions, form inputs, navigation items, table text
- **Weights used:** 400 (regular), 500 (medium), 600 (semibold), 700 (bold)
- **Sizes:** 12px (xs), 14px (sm), 16px (base), 18px (lg), 20px (xl)

#### Font 2 — Playfair Display (Headings / Display)
- **Variable:** `--font-display`
- **Stack:** `'Playfair Display', serif`
- **Applied to:** Page titles, hero headlines, club names on covers, section headings
- **Weights used:** 400 (regular), 700 (bold), 900 (black)
- **Sizes:** 24px (2xl), 30px (3xl), 36px (4xl), 48px (5xl)
- **Style note:** Often combined with italic for emphasis on hero text

#### Font 3 — Bebas Neue (Stats / Numbers)
- **Variable:** `--font-mono`
- **Stack:** `'Bebas Neue', sans-serif`
- **Applied to:** Large metric numbers (member counts, event counts), countdown timers, stat cards
- **Weight:** 400 (only weight available)
- **Style note:** Always uppercase by nature; letter-spacing 0 or slightly negative

#### Type Scale Reference

| Tailwind class | Size | Font | Use case |
|---|---|---|---|
| `text-xs` | 12px | Outfit | Timestamps, micro-labels |
| `text-sm` | 14px | Outfit | Body copy, descriptions, tab labels |
| `text-base` | 16px | Outfit | Standard body, card content |
| `text-lg` | 18px | Outfit | Section subheadings |
| `text-xl` | 20px | Outfit / Playfair | Card titles, page subheadings |
| `text-2xl` | 24px | Playfair Display | Page headings |
| `text-3xl` | 30px | Playfair Display | Hero subheadings |
| `text-4xl` | 36px | Playfair Display | Hero headlines |
| `text-5xl` | 48px | Playfair Display | Landing page hero |
| Large numbers | 32–48px | Bebas Neue | Member count, event count |

---

### 1.3 Spacing Scale

CultFam uses Tailwind's default 4px base unit. The most common values used in this app:

| Value | px | Context |
|---|---|---|
| `p-2` | 8px | Icon padding, compact badge padding |
| `p-3` | 12px | Small card internal padding |
| `p-4` | 16px | Standard card padding |
| `p-5` | 20px | Page horizontal padding (mobile) |
| `p-6` | 24px | Large card padding, section padding |
| `px-5` | 20px left+right | Standard mobile page edge margin |
| `px-6` | 24px left+right | Card content horizontal margin |
| `gap-3` | 12px | Tight grid gaps (filter pills, badge rows) |
| `gap-4` | 16px | Standard grid gaps |
| `gap-6` | 24px | Section spacing within a page |
| `space-y-6` | 24px | Vertical rhythm between major sections |
| `space-y-4` | 16px | Vertical rhythm between related items |
| `mt-3` / `mb-3` | 12px | Small vertical separators |
| `mt-6` / `mb-6` | 24px | Section breaks |

---

### 1.4 Shadow Scale

Shadows use warm ink-tinted values instead of pure grey, maintaining the editorial warmth:

| Variable | Value | Usage |
|---|---|---|
| `--shadow-2xs` | `0 1px 2px rgba(26,20,16,0.04)` | Floating micro-elements |
| `--shadow-xs` | `0 1px 3px rgba(26,20,16,0.06)` | Subtle depth on inputs |
| `--shadow-sm` | `0 2px 6px rgba(26,20,16,0.08)` | Default card depth |
| `--shadow` | `0 4px 12px rgba(26,20,16,0.08)` | Raised cards |
| `--shadow-md` | `0 4px 16px rgba(26,20,16,0.10)` | Hovered cards |
| `--shadow-lg` | `0 8px 24px rgba(26,20,16,0.12)` | Modals, bottom sheets |
| `--shadow-xl` | `0 12px 32px rgba(26,20,16,0.14)` | Dropdowns, popovers |
| `--shadow-2xl` | `0 16px 48px rgba(26,20,16,0.16)` | Full-screen overlays |
| `--warm-shadow` | `0 4px 24px rgba(26,20,16,0.12)` | Neon glow / card focus state |
| `--warm-shadow2` | `0 2px 12px rgba(26,20,16,0.08)` | Hover state on glass cards |

---

### 1.5 Border Radius

| Value | px | Usage |
|---|---|---|
| `rounded` | 4px | Very small chips |
| `rounded-md` | 6px | Inline code, small tags |
| `rounded-lg` | 8px | Inputs, small buttons, compact cards |
| `rounded-xl` | 12px | Standard cards (shadcn Card) |
| `rounded-2xl` | 16px | Large feature cards |
| `rounded-[18px]` | 18px | Glass cards (`.glass-card` class) |
| `rounded-[20px]` | 20px | Hero sections, immersive cards |
| `rounded-full` | 9999px | Pills, avatar circles, icon buttons |

---

## 2. Component Library

### 2.1 Buttons

Buttons are built with shadcn/ui `Button` component using class-variance-authority. All buttons include hover/active elevation micro-animations via custom CSS overlay classes.

#### Interactive Behaviour (applies to ALL buttons)
- **Hover:** A `rgba(0,0,0,0.03)` overlay (`--elevate-1`) fades over the button face — gives a subtle darkening effect
- **Active (pressed):** A `rgba(0,0,0,0.08)` overlay (`--elevate-2`) — noticeably darker, creates a "press down" feel
- **Disabled:** `opacity: 50%` + `pointer-events: none` — the button is greyed out and cannot be clicked
- **Focus ring:** `ring-2` with colour `var(--ring)` = terra (#C4622D), offset 2px — visible on keyboard tab navigation

#### Button Variants

---

**Variant: `default` (Primary CTA)**

| Property | Value |
|---|---|
| Background | `#C4622D` (terra) |
| Text colour | `#FFFFFF` (white) |
| Border | 1px solid, auto-derived darker terra `~#A84E22` |
| Border radius | `rounded-lg` (8px) |
| Font | Outfit, 14px, weight 500 |
| Min height | 36px |
| Padding | `px-4 py-2` |
| Hover | Terra background + `--elevate-1` overlay |
| Active | Terra background + `--elevate-2` overlay (appears slightly darker) |
| Disabled | Terra background at 50% opacity |

**Examples in use:** "Explore Clubs →", "Request to Join", "Create Event", "Post Moment", "Send to All Members", "Find My Tribe →"

---

**Variant: `secondary`**

| Property | Value |
|---|---|
| Background | `hsl(38 20% 88%)` ≈ `#E4DDCE` (creamy grey) |
| Text colour | `#1A1410` (ink) |
| Border | 1px solid, auto-derived slightly darker cream |
| Font | Outfit, 14px, weight 500 |
| Hover | Cream background + `--elevate-1` overlay |
| Active | Cream background + `--elevate-2` overlay |
| Disabled | 50% opacity |

**Examples in use:** "Cancel", "Back", tab pills (inactive state), filter chips (inactive)

---

**Variant: `outline`**

| Property | Value |
|---|---|
| Background | Transparent |
| Text colour | `#1A1410` (ink) |
| Border | 1px solid `rgba(0,0,0,0.10)` |
| Box shadow | `0 1px 3px rgba(26,20,16,0.06)` (very subtle) |
| Hover | `--elevate-1` overlay on transparent background |
| Disabled | 50% opacity |

**Examples in use:** "Share via WhatsApp" (with green border override), secondary options where a filled button would be too heavy

---

**Variant: `ghost`**

| Property | Value |
|---|---|
| Background | Transparent |
| Text colour | `#1A1410` (ink) |
| Border | Transparent (1px, invisible — holds layout space) |
| Hover | `--elevate-1` overlay |
| Active | `--elevate-2` overlay |

**Examples in use:** Navigation icon buttons, "Back ←" links, icon-only action buttons (like, share, comment)

---

**Variant: `destructive`**

| Property | Value |
|---|---|
| Background | `hsl(0 84% 60%)` ≈ `#F04040` (red) |
| Text colour | `#FFFFFF` |
| Border | 1px solid, auto-derived darker red |
| Hover | Red background + `--elevate-1` overlay |
| Active | Red + `--elevate-2` overlay |
| Disabled | 50% opacity |

**Examples in use:** "Cancel Event", "Remove Member", "Delete", "Reject ✗" (in request cards)

---

**Variant: Custom Terra Pill (used in many pages)**

This is a `default` button with `rounded-full` override:

| Property | Value |
|---|---|
| Background | `#C4622D` |
| Text | White |
| Border radius | `rounded-full` (fully rounded ends) |
| Example | "Join Now" on landing navbar, category filter pills (selected state) |

---

**Special: WhatsApp Button**

| Property | Value |
|---|---|
| Background | `rgba(61,107,69,0.08)` (very pale green) |
| Text colour | `#3D6B45` (green-accent) |
| Border | `1.5px solid #3D6B45` |
| Border radius | `rounded-xl` |
| Icon | WhatsApp logo from `react-icons/si` |
| Hover | Green tint deepens slightly |

---

**Button Sizes**

| Size | Min height | Padding | Use |
|---|---|---|---|
| `sm` | 32px | `px-3 py-1` | Compact actions in lists, inline |
| `default` | 36px | `px-4 py-2` | Standard buttons |
| `lg` | 40px | `px-6 py-2.5` | Primary hero CTAs |
| `icon` | 36×36px | None | Square icon-only buttons |

---

### 2.2 Cards

#### Glass Card (`.glass-card`)
The dominant card style across the entire app:
- **Background:** `#FDFAF5` (warm-white)
- **Border:** `1.5px solid rgba(26,20,16,0.10)`
- **Border radius:** `18px`
- **Hover state** (`.glass-card-hover`): border colour changes to `#C4622D` (terra), box-shadow adds `0 2px 12px rgba(26,20,16,0.08)`

#### Standard Card (shadcn `Card`)
- **Background:** `hsl(40 33% 98%)` ≈ `#FDFAF6`
- **Border:** `1px solid rgba(26,20,16,0.10)`
- **Border radius:** `rounded-xl` (12px)
- **Shadow:** `0 2px 6px rgba(26,20,16,0.08)` (shadow-sm)

#### Feature / Hero Card
Used in landing page and key CTAs:
- **Background:** Terra gradient — `linear-gradient(135deg, #C4622D, #F0845A)`
- **Text:** White
- **Border radius:** `rounded-[20px]`
- **Shadow:** `0 8px 24px rgba(26,20,16,0.12)` (shadow-lg)

#### Moment Card (Feed)
- **Background:** `#FDFAF5` (warm-white)
- **Border:** `1.5px solid rgba(26,20,16,0.10)`
- **Border radius:** `18px`
- **Contains:** Author row (avatar + name + time) → emoji or photo → caption → action row (like, comment, share)

#### Event Card
- **Left accent strip:** 4px wide, `#C4622D` (terra), full height left edge
- **Background:** warm-white
- **Contains:** Club emoji chip, event title (Playfair Display), date/time/location in muted-warm, RSVP count badge

---

### 2.3 Badges

| Variant | Background | Text | Border | Use |
|---|---|---|---|---|
| `default` (Terra) | `#C4622D` | White | Terra (darker) | Primary labels, "Active", category tags |
| `secondary` | `#E4DDCE` (cream-grey) | Ink | Cream border | Neutral labels |
| `outline` | Transparent | Ink | `rgba(0,0,0,0.05)` | Subtle tags, schedule |
| Gold (founding) | `rgba(201,168,76,0.15)` | `#C9A84C` | Gold 30% | "Founding Member" badge |
| Green (status) | `rgba(61,107,69,0.10)` | `#3D6B45` | Green 30% | "Very Active", "Attended ✓" |
| Red (destructive) | Red 10% | Red (`#F04040`) | Red 30% | "Waitlist", "Missed" |
| Pending | Terra-pale | Terra | Terra 30% | "Pending Approval" |

All badges: `rounded-full`, font Outfit 12px weight 600, padding `px-2.5 py-0.5`

---

### 2.4 Inputs & Forms

**Text Input / Textarea**
- **Background:** `rgba(26,20,16,0.06)` (very faint warm tint) or `#FDFAF5`
- **Border:** `1px solid rgba(26,20,16,0.12)`
- **Border radius:** `rounded-lg` (8px)
- **Font:** Outfit 14px, ink colour
- **Placeholder:** `#8A7A6A` (muted-warm)
- **Focus:** Border becomes terra (`#C4622D`), ring: `ring-2 ring-[#C4622D] ring-offset-2`
- **Disabled:** Background `cream2`, text muted-warm, no focus ring

**Select / Dropdown**
- Same border and background as text input
- Chevron icon on right side in muted-warm colour
- Options list: warm-white background, `rounded-lg`, shadow-xl

**Search Bar**
- **Background:** Warm-white with `rgba(26,20,16,0.06)` border
- **Left icon:** Magnifying glass in muted-warm (`#8A7A6A`)
- **Clear button:** × icon on right, appears when text is entered
- **Border radius:** `rounded-full` (pill-shaped)

**Checkbox / Toggle**
- Unchecked: `rgba(26,20,16,0.12)` border, transparent fill
- Checked: `#C4622D` (terra) fill, white checkmark

**Form validation errors**
- Text colour: `#F04040` (destructive red), 12px
- Appears below the input with 4px margin top
- Input border also turns red on validation failure

---

### 2.5 Toasts & Alerts

Toasts appear at the bottom of the screen on mobile, top-right on desktop.

| Type | Background | Text | Icon | Duration |
|---|---|---|---|---|
| Success | `#FDFAF5` with green left border | Ink | Green checkmark | 3 seconds |
| Error | `#FDFAF5` with red left border | Ink | Red × | 5 seconds |
| Info | `#FDFAF5` with terra left border | Ink | Terra info circle | 3 seconds |
| "Link copied!" | `#FDFAF5` with terra left border | "Link copied to clipboard" | 📋 | 2 seconds |

All toasts:
- **Border radius:** `rounded-xl`
- **Shadow:** `shadow-lg`
- **Enter animation:** Slide up + fade in
- **Exit animation:** Fade out

---

## 3. Global Interactive States

These states apply to ALL interactive elements (buttons, cards, links, pills).

### Hover Elevation (`.hover-elevate`)
When the user hovers over a tappable element:
- A `::after` pseudo-element with `background-color: rgba(0,0,0,0.03)` overlays the element
- This creates a very subtle darkening — the element appears to "lift" slightly
- The overlay respects `border-radius` of the parent element

### Active Press (`.active-elevate-2`)
When the user clicks/taps:
- The `::after` overlay switches to `background-color: rgba(0,0,0,0.08)`
- Creates a clearly visible "press down" effect without needing to change background colours

### Focus Ring
- `ring-2` (2px ring)
- `ring-offset-2` (2px gap between element and ring)
- Ring colour: `#C4622D` (terra) — the `--ring` variable
- Only visible on keyboard navigation (hidden on mouse clicks)

### Disabled State
- All interactive elements: `opacity: 0.5`
- `pointer-events: none` — cursor changes to default, clicks do nothing

### Transition Timing
- Colour and border transitions: `transition-colors duration-200 ease-in-out`
- Shadow transitions: `transition-shadow duration-200`
- Overlay opacity: `transition-opacity duration-150`

---

## 4. Navigation Bar

The persistent bottom navigation bar visible to all logged-in users on mobile.

**Container:**
- Position: Fixed at bottom of viewport
- Background: `#FDFAF5` (warm-white)
- Top border: `1px solid rgba(26,20,16,0.10)`
- Height: 64px
- Safe area padding-bottom for iPhones (env(safe-area-inset-bottom))
- Shadow: `0 -2px 12px rgba(26,20,16,0.06)` (shadow casts upward)

**Layout:** 5 equal columns, each containing an icon above a label.

| Tab | Icon | Label | Destination |
|---|---|---|---|
| Home | House icon | "Home" | `/home` |
| Explore | Search/compass icon | "Explore" | `/explore` |
| Create | Plus circle (larger, terra) | — (no label) | `/create` |
| Notifications | Bell icon | "Alerts" | `/notifications` |
| Profile | User circle | "Profile" | `/profile` |

**Active tab state:**
- Icon: `#C4622D` (terra), filled
- Label: `#C4622D` (terra), Outfit 11px weight 600

**Inactive tab state:**
- Icon: `#8A7A6A` (muted-warm), outline style
- Label: `#8A7A6A`, Outfit 11px weight 400

**Centre "+" button (Create):**
- Background: `#C4622D` (terra)
- Icon: Plus, white, 22px
- Shape: Circle, 52px diameter
- Elevated 8px above the nav bar (margin-top: -20px)
- Shadow: `0 4px 12px rgba(196,98,45,0.35)` (terra-tinted shadow)

**Notification badge:**
- Position: Top-right of the bell icon
- Background: `#F04040` (red)
- Text: White, Outfit 10px weight 700
- Shape: Circle (up to 9) or pill (10+)
- Size: 18px diameter for single digit; 22×16px for double digit
- Border: 2px solid `#FDFAF5` (warm-white, separates badge from background)

---

## 5. Landing Page

**URL:** `/` — visible to unauthenticated users only

**Global page settings:**
- Background: `#F5F0E8` (cream)
- No bottom navigation bar
- Max-width for content sections: `max-w-5xl mx-auto px-5`

---

### Section 1 — Sticky Navbar

**Container:**
- Position: Sticky top-0
- Background: `rgba(245,240,232,0.85)` with `backdrop-blur-md`
- Border-bottom: `1px solid rgba(26,20,16,0.08)`
- Height: 64px
- Padding: `px-5`

**Left — Logo:**
- Text: "CultFam" in Playfair Display, 22px, bold, ink colour
- No logo image — text only

**Right — Buttons:**

| Button | Label | Colour | Action |
|---|---|---|---|
| Outline button | "Sign In" | Outline variant (cream border, ink text) | → `/api/login` |
| Primary button | "List Your Club" | `#C4622D` (terra), white text, `rounded-full` | → `/api/login` |

**City indicator:**
- Pill badge: `rounded-full`, background `rgba(196,98,45,0.10)` (terra-pale), text `#C4622D`
- Label: "📍 Tirupati" — decorative, no click action

---

### Section 2 — Hero

**Container:**
- Padding: `pt-20 pb-16 px-5`
- Background: Cream

**Headline:**
- Font: Playfair Display
- Size: `text-5xl` (48px) on desktop, `text-4xl` (36px) on mobile
- Weight: Bold (700)
- Colour: `#1A1410` (ink)
- Content: "Your city's hobby scene."
- Second line (italic): "*All in one place.*" — same font, italic style
- Line height: 1.15

**Sub-headline:**
- Font: Outfit, 18px, weight 400
- Colour: `#8A7A6A` (muted-warm)
- Content: "Discover, join, and show up for the things you love. Real clubs, real people, right here in Tirupati."

**Button row (2 buttons, side by side):**

| Button | Label | Style | Action |
|---|---|---|---|
| Left (Primary) | "Explore Clubs →" | Terra background (`#C4622D`), white text, `rounded-full`, `px-6 py-3`, `text-base` | Scrolls to clubs section or → `/explore` |
| Right (Outline) | "Start a Club" | Outline variant, ink text, `rounded-full`, `px-6 py-3` | → `/api/login` |

**Activity Ticker (below buttons):**
- Horizontal auto-scrolling marquee, infinite loop
- Items: small pill chips — background `rgba(26,20,16,0.06)`, ink text, `rounded-full`
- Examples: "🏃 Trekking", "📚 Book Club", "🎵 Indie Music", "📸 Photography"
- Animation: `animation: marquee 20s linear infinite`

---

### Section 3 — Clubs Showcase

**Section heading:**
- "Active Clubs in Tirupati" — Playfair Display 28px, ink
- Sub-text: count of clubs — Outfit 14px, muted-warm

**Grid:**
- Mobile: 1 column
- Tablet: 2 columns
- Desktop: 3 columns
- Gap: `gap-4`

**Club Card anatomy:**

```
┌─────────────────────────────────────┐
│ [Gradient header — category colour] │
│  [Emoji 40px] [Category badge]      │
│  Club Name (Playfair Display 18px)  │
├─────────────────────────────────────┤
│  Short description (Outfit 14px)    │
│  🧑 X members  📅 Schedule  📍 City │
│  [Founding spots badge] if open     │
│                                     │
│  [Join / View →] button             │
└─────────────────────────────────────┘
```

**Card specifics:**
- Background: warm-white
- Border: `1.5px solid rgba(26,20,16,0.10)`
- Border radius: `18px`
- Shadow: `shadow-sm`
- Hover: border turns terra (`#C4622D`), shadow increases to `shadow-md`

**Category gradient headers (top strip, 80px tall):**

| Category | Gradient |
|---|---|
| Trekking | `#8B6E4E → #C4622D` |
| Fitness | `#2D6A4F → #40916C` |
| Books | `#5C4033 → #8B6E4E` |
| Photography | `#1A1A2E → #4A4E69` |
| Cycling | `#1B4332 → #3D6B45` |
| Art | `#7B2D8B → #B05CCF` |
| Music | `#1A1410 → #C4622D` |
| Tech | `#0D1B2A → #1B4F72` |
| Food | `#7D3C0A → #C4622D` |
| Dance | `#4A0E8F → #9B59B6` |

**"Join" button on card (unauthenticated):**
- Terra background (`#C4622D`), white text, `rounded-lg`, size `sm`
- Clicking → `/api/login` (sign in first, then join flow)

**"View" button on card (already joined):**
- Outline variant, ink text
- Clicking → `/club/:id`

**Founding member strip (if spots remain):**
- Background: `rgba(201,168,76,0.15)` (gold-pale)
- Text: "⭐ X founding spots left" in `#C9A84C` (gold), Outfit 12px weight 600
- Border radius matches card bottom

---

### Section 4 — How It Works

**Background:** `#EDE8DC` (cream2) — slightly different from page background to define the section

**Heading:** "How It Works" — Playfair Display 28px

**3 steps in a horizontal row (or vertical on mobile):**

| # | Icon | Title | Body |
|---|---|---|---|
| 1 | 🔍 in terra circle | "Find a Club" | Browse clubs that match your hobby and schedule |
| 2 | ✋ in terra circle | "Join Up" | Send a quick request. Organisers approve within 24 hrs |
| 3 | 🎉 in terra circle | "Show Up" | Attend meetups, meet real people, build lasting habits |

**Step number circles:**
- Background: `#C4622D` (terra)
- Text/icon: White
- Size: 48px diameter
- Offset connector line between steps: `1px solid rgba(196,98,45,0.30)` (terra 30%)

---

### Section 5 — Organiser / Start a Club CTA

**Container:**
- Background: Terra gradient `linear-gradient(135deg, #C4622D, #F0845A)`
- Border radius: `rounded-[20px]`
- Padding: `p-8`
- Text: White

**Content:**
- Heading: "Run a club? List it free." — Playfair Display 28px white
- Body: "CultFam helps you find serious hobbyists, manage RSVPs, and build a real community." — Outfit 16px white 80% opacity
- Button: "Start Your Club →" — Background white, text terra (`#C4622D`), `rounded-full`, `px-6 py-3`
  - Hover: slight white darkening via `--elevate-1` overlay
  - Action: → `/api/login`

---

### Section 6 — Footer

**Background:** `#1A1410` (ink)
**Text:** `rgba(255,255,255,0.60)` (white 60%)

**Contents:**
- Logo: "CultFam" in Playfair Display, white
- City: "📍 Tirupati, AP"
- Tagline: "Building real communities through shared hobbies"
- Links row: "Explore", "List a Club", "About" — white 60%, hover white 100%
- Copyright: "© 2025 CultFam" — white 40%, Outfit 12px

---

## 6. Onboarding Quiz

**URL:** `/onboarding`
**Layout:** Full-screen (no nav bar). Mobile-first. Maximum width `max-w-lg mx-auto`.

**Background:** Cream (`#F5F0E8`)

---

### Progress Bar

- Position: Fixed top of screen, below any system status bar
- Height: 4px
- Background (track): `rgba(26,20,16,0.10)` (warm-border)
- Fill: `#C4622D` (terra)
- Fill width: Animates smoothly — `transition: width 400ms ease`
- Progress values: 20% → 40% → 60% → 80% → 100% (for steps 1–5)

---

### Step Header

- Step indicator: "Step 2 of 5" — Outfit 12px, muted-warm (`#8A7A6A`), top-right
- Question heading: Playfair Display, 28px, ink, weight 700
- Sub-text: Outfit 16px, muted-warm, below question
- Example: "What are you into?" / "Pick up to 3 interests"

---

### Choice Cards (Interest Grid)

**Layout:** 3-column grid on steps 1, 4, 5 / 2-column on steps 2–3

**Unselected card:**
- Background: `#FDFAF5` (warm-white)
- Border: `1.5px solid rgba(26,20,16,0.10)`
- Border radius: `18px`
- Shadow: `shadow-sm`
- Contents: Large emoji (32px) centred, label below in Outfit 14px ink

**Selected card:**
- Background: `rgba(196,98,45,0.10)` (terra-pale)
- Border: `1.5px solid #C4622D` (terra)
- Label: `#C4622D` (terra)
- Subtle inner shadow: `inset 0 0 0 1px rgba(196,98,45,0.20)`

**Hover (unselected):**
- Border: `rgba(196,98,45,0.40)` (terra 40%)
- Shadow: `shadow-md`

**Hover (selected):**
- Slightly deeper terra tint background

---

### Navigation Buttons

**"Back" button** (steps 2–5):
- Variant: `ghost`
- Label: "← Back"
- Colour: Muted-warm (`#8A7A6A`)
- Position: Left side of button row

**"Next →" / "Find My Tribe →" button:**
- Variant: `default` (primary)
- Background: `#C4622D` (terra)
- Text: White
- Width: Grows to fill right side of button row
- Disabled state: 50% opacity when no selection made
- Last step label changes to "Find My Tribe →" with slight animation

---

## 7. Matched Clubs Page

**URL:** `/matched-clubs`

**Background:** Cream

**Header:**
- Heading: "Your Tribe Awaits 🎯" — Playfair Display 28px, ink
- Sub-text: "Based on your interests, here's what we found" — Outfit 16px, muted-warm

**Match Score Badge (on each club card):**
- Background: Terra gradient
- Text: White, Bebas Neue font, 20px
- Label: "94% match"
- Position: Top-right corner of card, overlapping the cover image

**"Why it matched" strip:**
- Background: `rgba(196,98,45,0.08)` (very pale terra)
- Text: "Matches: Trekking, Morning, Casual" — Outfit 12px, terra
- Border-left: `3px solid #C4622D` (terra)

**Per-card buttons:**

| Button | Label | Style | Action |
|---|---|---|---|
| Primary | "Join Club →" | Terra, white text, `rounded-full` | → `/club/:id` (join flow) |
| Secondary | "View Club" | Outline, ink text | → `/club/:id` |

**Bottom action buttons:**

| Button | Label | Style | Action |
|---|---|---|---|
| Primary | "Explore All Clubs" | Terra, white, `rounded-full`, full-width | → `/explore` |
| Ghost | "Go to Home Feed" | Ghost, muted-warm text | → `/home` |

---

## 8. Home Feed

**URL:** `/home`

**Background:** Cream (`#F5F0E8`)
**Page padding:** `px-5` (20px sides)

---

### Sticky Header

- Height: 64px
- Background: `rgba(245,240,232,0.90)` with `backdrop-blur-sm`
- Border-bottom: `1px solid rgba(26,20,16,0.08)`

| Element | Description |
|---|---|
| Left — Avatar | 40px circle. Initials if no photo. Background: terra-pale. Text: terra. |
| Centre — Welcome | "Hey, Ravi 👋" — Outfit 16px, ink, weight 600 |
| Right — Bell | Ghost icon button. Red badge overlaid for unread count. → `/notifications` |

---

### Streak / Progress Card (for returning users)

- Background: `#1A1410` (ink) — dark card, high contrast
- Border radius: `rounded-[20px]`
- Text: White
- Left side: "🔥 3-day streak" + "Keep the momentum going" in Outfit
- Right side: Circular progress ring (SVG)
  - Track colour: `rgba(255,255,255,0.10)`
  - Fill colour: `#C4622D` (terra)
  - Centre text: "2/5 clubs" in Bebas Neue white
- Padding: `p-5`

---

### "Happening Soon" Section

- Section label: "Happening Soon" — Outfit 14px, muted-warm, weight 600, uppercase letter-spacing
- Horizontal scroll row

**Event card (horizontal scroll):**
- Width: 280px, fixed
- Background: warm-white
- Left strip: 4px solid terra
- Border radius: `rounded-xl`
- Contents: Club emoji chip (terra-pale background) + Event name (Outfit 16px, ink, weight 600) + Date/time (Outfit 13px, muted-warm) + Location + "RSVP'd" badge (green) or "RSVP →" button (terra)

---

### "My Clubs" Section

- Section label: "My Clubs" — same style as above + "+" icon button (terra, `rounded-full`)
- Horizontal scroll row of circular club avatars

**Club avatar circle:**
- Size: 64px
- Background: Club emoji background colour (set by organiser) or terra-pale default
- Emoji: 28px centred
- Label below: Club name, Outfit 11px, ink, max 2 lines, text-center, `truncate`
- Active ring on currently-viewed club: `2px solid #C4622D`

---

### "Community" Moments Feed

- Section label: "Community" — Outfit 14px, muted-warm, weight 600
- Vertical list, `space-y-4`

**Moment Card anatomy:**

```
┌────────────────────────────────────────┐
│ [Club emoji 28px] Club Name   [Time]   │
│ Posted by Author Name (Outfit 12px)    │
├────────────────────────────────────────┤
│ [Photo if present — 16:9 ratio]        │
│ OR [Large emoji 48px centred]          │
│                                        │
│ Caption text (Outfit 15px, ink)        │
├────────────────────────────────────────┤
│ ♥ 12   💬 3   Share icon              │
└────────────────────────────────────────┘
```

**Card specifics:**
- Background: warm-white
- Border: `1.5px solid rgba(26,20,16,0.10)`
- Border radius: `18px`
- Club emoji background: `rgba(196,98,45,0.10)` pill

**Action button row:**

| Button | Icon | Liked state | Action |
|---|---|---|---|
| Like | ♥ heart | Filled terra (`#C4622D`) when liked; outline muted-warm when not | Toggles like; count updates instantly |
| Comment | 💬 bubble | Always outline muted-warm | → Club detail Moments tab |
| Share | ↗ arrow | Always outline muted-warm | Opens native share or copies link |

---

### Empty State — Brand New User (0 clubs)

Replaces the "My Clubs" section:

**"Find Your First Tribe" hero card:**
- Background: Terra gradient `linear-gradient(135deg, #C4622D 0%, #F0845A 100%)`
- Border radius: `rounded-[20px]`
- Padding: `p-6`

**Contents:**
- Heading: "Find Your Tribe in Tirupati" — Playfair Display 22px, white, bold
- Sub-text: "X clubs are waiting for you" — Outfit 15px, white 80%
- Horizontal scroll of 3 club preview chips (emoji + name, white pill background 20% opacity)
- Buttons (stacked vertically):
  1. "Explore Clubs →" — white background, terra text, `rounded-full`, full-width
  2. "Take the Quiz" (if quiz not done) — outline white, white text, `rounded-full`

**Community feed "join nudge" card** (after the 4th moment):
- Background: Terra gradient
- Border radius: `18px`
- Icon: 🔒 white, 32px
- Text: "There's more inside" — Playfair Display 18px, white
- Sub-text: "Join a club to see all moments from your community" — Outfit 14px, white 80%
- Button: "Explore Clubs →" — white bg, terra text, `rounded-full`

---

## 9. Explore Page

**URL:** `/explore`

**Background:** Cream
**Page padding:** `px-5`

---

### Search Bar

- Width: Full (100% minus page padding)
- Height: 48px
- Background: warm-white
- Border: `1.5px solid rgba(26,20,16,0.10)`
- Border radius: `rounded-full`
- Left icon: 🔍 magnifying glass in muted-warm (`#8A7A6A`), 18px
- Placeholder: "Search clubs, hobbies..." — muted-warm italic
- Right: × clear button (appears when text entered), muted-warm
- Focus: Border turns terra; ring appears

---

### Category Pills (Horizontal Scroll)

- Scroll: Horizontal, `overflow-x-auto`, no scrollbar visible
- Gap: `gap-2`
- Padding: `py-3`

**Inactive pill:**
- Background: warm-white
- Border: `1.5px solid rgba(26,20,16,0.10)`
- Text: Ink, Outfit 13px weight 500
- Border radius: `rounded-full`
- Padding: `px-4 py-2`

**Active pill (selected):**
- Background: `#1A1410` (ink) OR `#C4622D` (terra) — depending on context
- Text: White
- Border: None (or matching background)

---

### Secondary Filters

**"Vibe" toggle:**
- Two buttons side by side: "Casual" / "Competitive"
- Inactive: Secondary variant (cream-grey bg, ink text)
- Active: Primary variant (terra bg, white text)

**"Time" toggle:**
- Three buttons: "Morning" / "Evening" / "Weekends"
- Same active/inactive treatment as Vibe

---

### Club Cards Grid

- Mobile: 1 column
- Tablet+: 2 columns
- Gap: `gap-4`

**Same card anatomy as Landing Page Section 3 (clubs showcase).** See [Section 5 → Clubs Showcase](#section-3--clubs-showcase) for full detail.

**"No results" empty state:**
- Emoji: 🔍 large centred (48px)
- Heading: "No clubs found" — Outfit 18px, ink
- Sub-text: "Try different filters or" + link "Start a Club" (terra underline)

---

## 10. Club Detail Page

**URL:** `/club/:id`

---

### Cover Header

- Height: 240px
- Content: Cover image (if set) filling the area with `object-cover`
  - Fallback: Category gradient (see gradient table in [Section 5](#category-gradient-headers-top-strip-80px-tall))
- Overlay: `linear-gradient(to bottom, transparent 40%, rgba(26,20,16,0.70) 100%)` — darkens the bottom for text legibility

**Back button (top-left overlay):**
- Background: `rgba(255,255,255,0.20)` (glass)
- Border: `1px solid rgba(255,255,255,0.30)`
- Icon: ← white arrow, 20px
- Border radius: `rounded-full`
- Action: Browser back (or → `/explore`)

**Category badge (top-right overlay):**
- Background: Terra (`#C4622D`)
- Text: White, Outfit 12px weight 600
- Border radius: `rounded-full`
- Example: "🏔 Trekking"

**Bottom-of-header text (overlaid on gradient):**
- Club name: Playfair Display 26px, white, bold
- Organiser: "by [Name]" — Outfit 14px, white 70%
- City: "📍 Tirupati" — Outfit 13px, white 60%

---

### Join / Status Button (below header)

| State | Background | Text | Icon | Border |
|---|---|---|---|---|
| "Request to Join" | `#C4622D` (terra) | White | Plus icon | None |
| "Pending Approval" | `rgba(196,98,45,0.10)` | `#C4622D` (terra) | Clock icon | `1.5px solid #C4622D` |
| "Member ✓" | `rgba(61,107,69,0.10)` | `#3D6B45` (green) | Check icon | `1.5px solid #3D6B45` |
| "Leave Club" | Outline / ghost | `#F04040` (red) | Exit icon | Red border |

All states: `rounded-full`, full width, height 44px

---

### Stats Row (3 columns)

- Background: warm-white card
- Border: warm-border
- Border radius: `rounded-xl`

| Column | Value font | Label font |
|---|---|---|
| Members | Bebas Neue 28px, ink | "Members" Outfit 11px, muted-warm |
| Events | Bebas Neue 28px, ink | "Events" Outfit 11px, muted-warm |
| Rating | Bebas Neue 28px, gold | "Rating" Outfit 11px, muted-warm |

---

### Founding Member Banner

Shown when founding spots remain:
- Background: `rgba(201,168,76,0.12)` (gold-pale)
- Left border: `3px solid #C9A84C` (gold)
- Icon: ⭐ gold
- Text: "X founding spots left — join now" — Outfit 14px, `#C9A84C` (gold)
- Border radius: `rounded-xl`

---

### WhatsApp Button

(Only visible to approved members)
- Full width
- Background: `rgba(61,107,69,0.08)`
- Text: "Chat on WhatsApp" — Outfit 15px, `#3D6B45` (green), weight 600
- Border: `1.5px solid #3D6B45`
- Icon: WhatsApp logo from `react-icons/si`, green
- Border radius: `rounded-xl`
- Action: Opens `whatsappLink` URL in new tab

---

### Tab Bar

- Horizontal scroll tabs below the stats/buttons
- Height: 44px
- Border-bottom: `1px solid rgba(26,20,16,0.10)`
- Background: warm-white

**Inactive tab:**
- Text: Muted-warm (`#8A7A6A`), Outfit 14px
- Bottom border: None

**Active tab:**
- Text: Terra (`#C4622D`), Outfit 14px, weight 600
- Bottom border: `2px solid #C4622D`

**Tabs available:** Meet-ups | Schedule | Moments | Gallery | About | Members | Polls

---

### Meet-ups Tab — Event Cards

**RSVP button states on event card:**

| State | Background | Text | Icon |
|---|---|---|---|
| "RSVP →" | Terra | White | Calendar+ |
| "Cancel RSVP" | Pale green | Green | Check |
| "Join Waitlist" | Gold-pale | Gold | Clock |
| "Full" | Cream-grey | Muted | — |
| Past event | Cream-grey | Muted-warm | — |

---

### Moments Tab — Post Form (approved members only)

**"Share a Moment" trigger button:**
- Variant: Outline with terra border
- Label: "📸 Share a Moment"
- Full width, `rounded-xl`

**Form (expands below):**
- Caption textarea: warm-white, terra focus border, 80px min-height
- Emoji picker: 4-column grid of 12 emojis; selected one has terra background circle
- Photo upload: Dashed border area, `#8A7A6A` text, "Tap to add photo"

**Post form buttons:**

| Button | Label | Style | Enabled when |
|---|---|---|---|
| Submit | "Post Moment" | Terra, white, `rounded-full` | Caption is not empty |
| Cancel | "Cancel" | Ghost, muted-warm | Always |

---

## 11. Event Detail Page

**URL:** `/event/:id`

---

### Cover

Same structure as Club Detail cover (240px, image or gradient, dark overlay, back button).

**Event-specific header text:**
- Event title: Playfair Display 24px, white, bold
- Club name: "🏔 Tirupati Trekkers" — Outfit 14px, white 70%
- Date line: "Sunday, 12 Jan 2025 • 5:30 AM" — Outfit 13px, white 60%

---

### RSVP Button (5 states)

| State | Background | Text | Border | Icon |
|---|---|---|---|---|
| "I'm Going ✓" | `#C4622D` (terra) | White | None | Calendar-check |
| "Cancel RSVP" | Pale green `rgba(61,107,69,0.10)` | `#3D6B45` | Green 1.5px | ✓ check |
| "Join Waitlist" | Gold-pale | `#C9A84C` | Gold 1.5px | Clock |
| "Leave Waitlist" | Outline | Muted-warm | Warm border | — |
| Past / missed | Cream-grey | Muted-warm | None | — |

All RSVP buttons: Full width, height 48px, `rounded-full`

---

### RSVP Counter

- "12 / 20 going" — Bebas Neue 22px left + Outfit 13px right
- Progress bar below: terra fill, cream track, `rounded-full`, 6px height
- "8 on waitlist" sub-text (if full): gold colour, Outfit 12px

---

### QR Ticket Card (after RSVP)

- Background: warm-white
- Border: `1.5px solid rgba(196,98,45,0.25)` (terra tint)
- Border radius: `rounded-[20px]`
- Heading: "Your Ticket" — Outfit 14px, muted-warm
- QR Code: Centred, 160×160px, black on white
- Below QR: Event name in Outfit 14px, ink
- Dashed separator line between QR section and details
- Footer strip: terra background, white text, "Show this at the venue"

---

### Comment Section

- Only visible to club members
- Input: Full-width, `rounded-xl`, warm-white, terra focus ring
- "Post" button: Compact terra button, `rounded-lg`, right of input
- Comment items: Avatar circle (initials, terra-pale bg) + name (Outfit 13px weight 600) + comment text (Outfit 14px) + time (muted-warm 12px)
- Delete button (own comments only): trash icon in muted-warm, top-right of comment

---

## 12. Notifications Page

**URL:** `/notifications`

**Background:** Cream
**Page padding:** `px-5`

**Page heading:** "Notifications" — Playfair Display 24px, ink

**"Mark All Read" button:**
- Position: Top-right of heading row
- Variant: Ghost
- Text: "Mark all read" — Outfit 13px, terra (`#C4622D`)
- Action: Sets all notifications to read; removes all badges

---

### Notification Card — Unread

- Background: `rgba(196,98,45,0.06)` (very faint terra tint)
- Left border: `3px solid #C4622D` (terra)
- Border radius: `rounded-xl`
- Shadow: `shadow-sm`

### Notification Card — Read

- Background: warm-white
- Left border: `3px solid transparent`
- Border radius: `rounded-xl`
- Reduced opacity: No change (full opacity, just no tint/border)

---

### Notification Icon Circle (left of text)

| Notification type | Icon | Circle background |
|---|---|---|
| Membership Approved | User check | `rgba(61,107,69,0.10)` (pale green) |
| Membership Rejected | User × | `rgba(240,64,64,0.10)` (pale red) |
| New Event | Calendar | `rgba(196,98,45,0.10)` (terra-pale) |
| RSVP Confirmed | Check circle | `rgba(61,107,69,0.10)` (pale green) |
| Waitlist Promoted | ↑ arrow | `rgba(201,168,76,0.15)` (gold-pale) |
| New Announcement | Megaphone | `rgba(196,98,45,0.10)` (terra-pale) |
| Admin Broadcast | Shield | `rgba(26,20,16,0.08)` (ink-pale) |

Icon circle: 40px, `rounded-full`
Icon itself: 20px, colour matching the type (green/red/terra/gold)

**Notification text:**
- Title: Outfit 14px, ink, weight 600
- Body: Outfit 13px, muted-warm
- Timestamp: Outfit 11px, muted-warm, right-aligned bottom

**"Mark as Read" action:**
- Tap anywhere on the card (on read, navigates to relevant page)
- Or small dot button top-right: 8px solid terra circle → click → fades and removes border/tint

---

## 13. Profile Page

**URL:** `/profile`

**Background:** Cream
**Page padding:** `px-5`

---

### Profile Header Card

- Background: warm-white glass card
- Border radius: `rounded-[20px]`
- Padding: `p-6`

**Avatar:**
- Size: 80px circle
- Background: terra-pale
- Content: User initials (2 letters), Playfair Display 28px, terra
- Overlay on hover: Camera icon on `rgba(0,0,0,0.40)` dark overlay
- "Edit" label below: Outfit 12px, terra — tap to open file picker

**Name:** Playfair Display 22px, ink
**Email:** Outfit 13px, muted-warm
**City:** Outfit 14px, ink — editable inline (tap → input appears)
**Bio:** Outfit 14px, muted-warm — editable (tap → textarea)

**"Save" button** (appears when any field changed):
- Terra, white, `rounded-full`, compact (height 36px)
- Position: Bottom-right of card

---

### Badges Row

- Horizontal scroll
- Founding Member badge: Gold-pale background, gold border, ⭐ icon, "Founding Member — [Club Name]"
- Attended badge: Green-pale background, green border, ✓ icon, "Attended X events"
- Badge shape: `rounded-full`, Outfit 12px weight 600, padding `px-3 py-1`

---

### Quick Links (organisers and admins only)

- Full-width cards linking to dashboards
- Background: warm-white
- Left icon: Shield (admin) or Chart (organiser) in terra circle
- Text: "Admin Dashboard" or "Organiser Dashboard" — Outfit 16px, ink, weight 600
- Right: → chevron in muted-warm
- Border radius: `rounded-xl`
- Action: → `/admin` or → `/organizer`

---

### My Clubs List

Each club item:
- Club emoji in terra-pale circle (40px)
- Club name: Outfit 15px, ink
- Status badge: "Approved" (green) or "Pending" (terra)
- Right side: "Leave" (ghost red) or "Manage" (ghost terra, if organiser)

---

### Event History

**Upcoming events (RSVPed):**
- Terra-pale background strip
- Event name (Outfit 14px weight 600), club name (muted-warm 12px), date (muted-warm 12px)
- "View Ticket" button → ghost terra → opens Event Detail

**Past events:**
- Attended: Green check badge ("Attended ✓")
- Missed: Red label ("Missed")
- Same layout as upcoming but with status replacing the ticket button

---

### Sign Out Button

- Position: Bottom of page, full width
- Variant: Outline
- Text: "Sign Out" — Outfit 15px, ink
- Border: warm-border
- Hover: Background cream-grey, text darkens
- Action: Ends session → redirect to landing page `/`
- No confirmation dialog — sign out is instant

**"Redo Quiz" button:**
- Position: Above Sign Out
- Variant: Ghost
- Text: "🔄 Redo Interests Quiz" — Outfit 14px, muted-warm
- Action: → `/onboarding`

---

## 14. Organiser Dashboard

**URL:** `/organizer`

**Background:** Cream
**Layout:** No standard bottom nav bar shown; replaced with dashboard tab bar at the top (sticky)

---

### Club Selector (if multiple clubs)

- Horizontal scroll strip below page header
- Each pill: Club emoji + name
- Active: Terra bg, white text, `rounded-full`
- Inactive: warm-white bg, ink text, warm-border

---

### Dashboard Tab Bar (sticky)

- Height: 48px
- Background: warm-white
- Border-bottom: warm-border
- Horizontal scroll

**Tabs:**

| Tab | Active state | Badge |
|---|---|---|
| Overview | Terra underline + text | None |
| Requests | Terra underline + text | Red circle with pending count |
| Events | Terra underline + text | None |
| Content | Terra underline + text | None |
| Insights | Terra underline + text | None |
| Edit | Terra underline + text | None |
| Announcements | Terra underline + text | None |

---

### Overview Tab

**Getting Started Checklist (new clubs only):**

Card background: warm-white
Border-left: `4px solid #C4622D` (terra)
Border radius: `rounded-xl`
Heading: "Your Club is Live! 🎉" — Outfit 17px weight 700, ink

| Item | Done icon | Not done icon | Action on click |
|---|---|---|---|
| Club created | ✓ green circle | — | Nothing |
| Create first event | ✓ green / ☐ grey | Terra right arrow → Events tab |
| Post first moment | ✓ green / ☐ grey | Terra right arrow → Content tab (Moments) |
| Share club link | 📋 always | Copies link to clipboard; toast "Link copied!" |

**Club Health Card:**
- 2×2 grid of metric tiles
- Each tile: Bebas Neue number (28px) + Outfit label (11px, muted-warm)

**"Pending Requests" alert:**
- Background: `rgba(196,98,45,0.08)` (terra-pale)
- Left border: `3px solid #C4622D`
- Text: "X pending requests" — Outfit 14px, terra, weight 600
- Button: "Review Now →" — ghost terra, right side
- Action: → Requests tab

---

### Requests Tab

**Filter row:**

| Button | Active bg | Inactive bg | Badge |
|---|---|---|---|
| "Pending" | Ink, white text | Cream-grey | Red count |
| "Approved" | Ink, white text | Cream-grey | None |
| "Rejected" | Ink, white text | Cream-grey | None |

**Request card:**
- Background: warm-white glass card
- Border radius: `rounded-xl`

Per-card action buttons:

| Button | Label | Style | Action |
|---|---|---|---|
| Approve | "Approve ✓" | Small, green bg (`rgba(61,107,69,0.90)`), white text | Approves membership; sends notification |
| Reject | "Reject ✗" | Small, destructive (red bg), white text | Rejects; sends notification |
| Remove (Approved tab) | "Remove" | Ghost, red text | Removes member |

---

### Events Tab

**"+ Create New Event" button:**
- Full width, `rounded-xl`, height 48px
- Background: `rgba(196,98,45,0.08)` (terra-pale)
- Border: `1.5px dashed rgba(196,98,45,0.40)` (terra dashed)
- Icon: + in terra
- Text: "Create New Event" — terra, Outfit 15px weight 600
- Action: Expands form below inline

**Event creation form fields:**
- All fields: warm-white bg, terra focus ring, `rounded-lg`
- "Cover Photo" upload: dashed border area

**"Create Event" submit:**
- Terra bg, white, `rounded-full`, full width, height 44px

**"Cancel" form:**
- Ghost, muted-warm, below create button

**Existing event three-dot menu:**
- Icon: `⋮` (vertical ellipsis) in muted-warm
- Opens a popover/dropdown with: Edit | Duplicate | View Attendees | Cancel Event
- "Cancel Event" item: Red text colour in the dropdown list

---

### Content Tab

**Sub-tab row:**

| Sub-tab | Content |
|---|---|
| FAQs | Accordion-style Q&A list |
| Schedule | Recurring slot list |
| Moments | Organiser view of all moments |
| Polls | Poll creation and results |

**"+ Add" buttons (per sub-tab):**
- Same dashed terra style as "Create New Event" button

**Poll option bars (results):**
- Background: cream-grey track
- Fill: Terra gradient
- Border radius: `rounded-full`
- Percentage label: Right-aligned, Bebas Neue 16px, terra

---

### Insights Tab

**Chart background:** warm-white card, `rounded-xl`

**Bar chart (Member Growth):**
- Bars: Terra (`#C4622D`)
- Axis lines: `rgba(26,20,16,0.08)`
- Labels: Outfit 11px, muted-warm
- Hover tooltip: warm-white bg, ink text, shadow-md

**Stat cards (3-column grid):**
- Background: warm-white
- Metric: Bebas Neue 32px, ink
- Label: Outfit 11px, muted-warm

---

### Edit Tab

**All form fields:** Same style as inputs defined in [Section 2.4](#24-inputs--forms)

**"Save Changes" button:**
- Terra, white, `rounded-full`, full width, height 44px
- Disabled (grey) until a field is changed

---

### Announcements Tab

**Compose form:**
- Title input: Full width
- Message textarea: 100px min-height
- "Pin to club page" toggle switch: Thumb is terra when on; cream-grey when off

**"Send to All Members" button:**
- Terra, white, `rounded-full`, full width, height 44px

**Past announcements list:**
- Each item: Date (muted-warm), Title (ink weight 600), pinned chip (gold if pinned)
- "Unpin" button: Ghost, muted-warm, right side
- "Delete" button: Ghost, red, right side

---

## 15. Admin Panel

**URL:** `/admin`

**Distinguishing visual:** The admin panel uses an **inverted header** (ink background) to clearly separate it from the regular user-facing app. The rest of the page uses the standard cream background.

---

### Admin Header Bar

- Background: `#1A1410` (ink)
- Text: White
- Logo: "CultFam Admin" — Playfair Display 18px, white
- Icon: Shield icon, terra (`#C4622D`), 22px
- Height: 60px

---

### Admin Tab Bar

- Background: `#2D2419` (ink2)
- 4 tabs: Analytics | Clubs | Requests | Users
- Active tab: Terra underline + white text
- Inactive tab: White 50% text

---

### Analytics Tab

**"Vitals" scroll strip:**
- Horizontal scroll
- Each vitals chip: Ink bg, white number (Bebas Neue 22px), white 60% label (Outfit 12px)
- Metrics: Total Users, Active Clubs, Events, RSVPs, Check-ins, Moments

**Platform Growth Chart:**
- Same style as Insights charts — terra bars, recharts library

**"Send Platform Broadcast" button:**
- Fixed position (bottom-right) or prominent in the tab
- Background: `#C4622D` (terra)
- Icon: Megaphone, white
- Text: "Broadcast"
- Shape: `rounded-full`, shadow-xl
- Opens modal: Title + Message inputs + "Send to All Users" (terra) + "Cancel" (ghost)

---

### Clubs Tab

**Search bar:** Standard pill search (same as Explore)

**Club table row:**

| Element | Style |
|---|---|
| Club emoji | 32px in terra-pale circle |
| Club name | Outfit 15px, ink, weight 600 |
| Category | Small badge (secondary variant) |
| Member count | Bebas Neue 18px, ink |
| Organiser | Outfit 13px, muted-warm |
| Status | "Active" green badge / "Paused" red badge |

**Per-row action buttons:**

| Button | Label | Style | Action |
|---|---|---|---|
| Toggle | "Pause Club" or "Activate Club" | Compact outline (red border for pause, green for activate) | Updates club active status |
| Health | "Set Health Status" | Ghost, terra text | Opens dropdown: Very Active / Active / Growing / Slow / Inactive |

---

### Join Requests Tab (Admin View)

Identical layout to the Organiser Requests tab.

Additional context column: "Club: [Club Name]" shown on each request card since this shows requests from all clubs.

Approve/Reject buttons: Same green/red styling as organiser view.

---

### Users Tab

**Search bar:** Standard

**User row:**

| Element | Style |
|---|---|
| Avatar | 36px circle, initials, terra-pale bg |
| Name | Outfit 14px, ink, weight 600 |
| Email | Outfit 12px, muted-warm |
| Role badge | "admin" (ink bg, white) / "organiser" (terra bg, white) / "user" (secondary) |
| Joined date | Outfit 11px, muted-warm |

**"View Details" button:**
- Ghost, terra text, Outfit 13px
- Opens a right-side drawer with full user history

**Role change buttons (in details drawer):**

| Button | Label | Style | Action |
|---|---|---|---|
| Promote | "Make Organiser" | Small, terra | Upgrades role |
| Demote | "Make User" | Small, secondary | Downgrades to user |
| Admin | "Make Admin" | Small, ink bg, white | Grants admin access — red warning shown |

---

## 16. QR Code Scanner

**URL:** `/scan/:eventId`

---

### Page Layout

- Background: `#1A1410` (ink) — dark page to help the camera view stand out
- Page heading: Event name in Playfair Display 22px, white
- Sub-heading: Event date, Outfit 14px, white 60%

---

### Camera Viewfinder

- Shape: Square, 300×300px, centred on page
- Border: `2px solid rgba(255,255,255,0.20)` (glass edge)
- Border radius: `rounded-[20px]`
- Background (before start): `rgba(26,20,16,0.60)` dark

**Scanning overlay graphic (4 corner brackets):**
- Colour: `#C4622D` (terra)
- Width of each bracket: 30px
- Weight: 3px
- Animated pulse: `opacity 1s ease-in-out infinite`

**"Start Camera" button** (before camera starts):
- Position: Centred inside the viewfinder
- Background: `rgba(196,98,45,0.90)` (terra, semi-transparent)
- Text: "Start Camera Scanner" — white, Outfit 16px weight 600
- Border radius: `rounded-full`
- Icon: Camera icon, white, above text

---

### Torch / Flashlight Button

- Position: Top-right corner of viewfinder, overlaid
- Size: 40×40px, `rounded-full`
- **Off state:** Background `rgba(26,20,16,0.60)`, icon: Bolt/flash outline, white
- **On state:** Background `#F0845A` (terra-light), icon: Bolt/flash filled, white
- Hidden on devices where torch is not supported (auto-detection)

---

### Scan Result Overlays

Full-size overlay appears over the viewfinder for 2.5 seconds then fades:

**Success:**
- Background: `rgba(61,107,69,0.90)` (dark green)
- Icon: ✓ circle, white, 48px
- Text: "[Name] — Checked in!" — Outfit 18px weight 700, white
- Border radius: `rounded-[20px]` (matches viewfinder)

**Already checked in:**
- Background: `rgba(201,168,76,0.90)` (gold)
- Icon: ⚠ triangle, white, 48px
- Text: "[Name] already checked in" — Outfit 18px, white

**Invalid QR:**
- Background: `rgba(240,64,64,0.90)` (red)
- Icon: × circle, white, 48px
- Text: "Not a valid CultFam ticket" — Outfit 18px, white

---

### Manual Check-in Search

Below the viewfinder:
- Search input: Dark-themed (ink bg, white text, terra focus ring), `rounded-full`
- Placeholder: "Search by name or phone..." — white 40%
- Results: appear below as white cards on ink bg

**Attendee list:**
- Background: `rgba(255,255,255,0.05)` (dark glass)
- Each row: Name (white, 14px) + status chip ("Attended" green / pending)
- "Check In" button per row: Compact terra, white, `rounded-lg`

---

*End of CultFam UI/UX Design Reference — v1.0*
*All hex values are sourced directly from `client/src/index.css` and the live component code.*
