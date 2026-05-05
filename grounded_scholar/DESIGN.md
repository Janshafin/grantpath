---
name: Grounded Scholar
colors:
  surface: '#f9f9f6'
  surface-dim: '#dadad7'
  surface-bright: '#f9f9f6'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f4f4f1'
  surface-container: '#eeeeeb'
  surface-container-high: '#e8e8e5'
  surface-container-highest: '#e2e3e0'
  on-surface: '#1a1c1b'
  on-surface-variant: '#404943'
  inverse-surface: '#2f312f'
  inverse-on-surface: '#f1f1ee'
  outline: '#707973'
  outline-variant: '#bfc9c1'
  surface-tint: '#296a4e'
  primary: '#095238'
  on-primary: '#ffffff'
  primary-container: '#2a6b4f'
  on-primary-container: '#a6e9c6'
  inverse-primary: '#92d4b2'
  secondary: '#805600'
  on-secondary: '#ffffff'
  secondary-container: '#fdb742'
  on-secondary-container: '#6e4900'
  tertiary: '#494846'
  on-tertiary: '#ffffff'
  tertiary-container: '#61605d'
  on-tertiary-container: '#dddad7'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#aef1cd'
  primary-fixed-dim: '#92d4b2'
  on-primary-fixed: '#002114'
  on-primary-fixed-variant: '#075137'
  secondary-fixed: '#ffddb0'
  secondary-fixed-dim: '#ffba47'
  on-secondary-fixed: '#291800'
  on-secondary-fixed-variant: '#614000'
  tertiary-fixed: '#e5e2de'
  tertiary-fixed-dim: '#c8c6c3'
  on-tertiary-fixed: '#1c1c1a'
  on-tertiary-fixed-variant: '#474744'
  background: '#f9f9f6'
  on-background: '#1a1c1b'
  surface-variant: '#e2e3e0'
typography:
  h1:
    fontFamily: Newsreader
    fontSize: 48px
    fontWeight: '600'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  h2:
    fontFamily: Newsreader
    fontSize: 32px
    fontWeight: '500'
    lineHeight: '1.2'
  h3:
    fontFamily: Newsreader
    fontSize: 24px
    fontWeight: '500'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  button:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '700'
    lineHeight: '1'
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.02em
spacing:
  unit: 4px
  xs: 8px
  sm: 16px
  md: 24px
  lg: 48px
  xl: 80px
  gutter: 24px
  margin: 32px
---

## Brand & Style

The design system is rooted in the concept of "Digital Craftsmanship." It balances the intellectual authority of academia with the warmth of a community-focused resource. By rejecting modern trends like glassmorphism and rounded corners, the system establishes a grounded, permanent feel—much like a printed directory or a hand-stamped document.

The visual style is a refined **Minimal-Brutalism**. It utilizes a strict flat aesthetic, relying on heavy structural lines and generous whitespace rather than shadows or depth to create hierarchy. The experience should feel tactile and "analog," evoking the reliability of a physical library and the accessibility of a local bulletin board.

## Colors

The palette is inspired by natural, earthy tones to reinforce the "grounded" brand personality. 

- **Background (#FAFAF7):** A warm, parchment-like off-white that reduces eye strain and feels more human than pure white.
- **Primary Text (#1C1C1A):** An "ink black" used for high-contrast legibility.
- **Forest Green (#2A6B4F):** Reserved for growth-oriented actions: primary CTAs, success states, and scholarship "Found" indicators.
- **Warm Amber (#C4860A):** A high-visibility but non-aggressive tone used specifically for urgency, such as deadlines and expiring grants.
- **Surface & Border:** Surfaces are pure white to pop against the warm background, defined strictly by 1px borders in a muted stone grey.

## Typography

This design system utilizes a traditional serif/sans-serif pairing to communicate both authority and utility. 

**Headings** utilize 'Newsreader' (as a high-quality alternative to Lora available in the spec) to provide a literary, established feel. Headings should have tight letter-spacing and substantial line heights to feel like editorial titles.

**Body copy** uses 'Inter' for its neutral, highly legible characteristics. It ensures that dense scholarship data remains easy to scan. 

**UI Elements** (Labels, Buttons, Metadata) use 'Inter' in bold or semi-bold weights, often with increased letter spacing for clarity in small sizes.

## Layout & Spacing

The layout philosophy follows a **Fixed Grid** system to maintain a structured, "catalog" feel. Elements are aligned to a 12-column grid on desktop and a 4-column grid on mobile.

The spacing rhythm is generous. To counteract the sharp edges of the square aesthetic, use large internal padding (minimum 24px) within cards and containers. This "breathability" ensures the information feels accessible rather than overwhelming. Gutters are kept wide to clearly separate distinct scholarship entries.

## Elevation & Depth

The design system completely eschews shadows and Z-index layering. Depth is communicated exclusively through **Bold Borders** and **Color Blocking**.

- **Level 0:** The warm background (#FAFAF7).
- **Level 1:** White surfaces (#FFFFFF) with a 1px border (#E8E5DE).
- **Active State:** Elements may use a thicker 2px border or a slight color shift in the border to indicate focus.
- **Interaction:** Since there are no shadows, hover states should be indicated by color fills (e.g., a button filling with Forest Green) or the appearance of a 1px border where there was none.

## Shapes

The shape language is strictly **Sharp (0px radius)**. Every element—including buttons, input fields, cards, and tags—must have 90-degree corners. This reinforces the "grounded" and "authoritative" nature of the brand. There are no exceptions for pills or circles; even avatars should be square to maintain the structural integrity of the grid.

## Components

### Buttons
Buttons are rectangular with 0px border-radius. 
- **Primary:** Forest Green background, White text.
- **Secondary:** White background, 1px Border, Near-Black text.
- **Warning (Deadlines):** Warm Amber background, Near-Black text.

### Input Fields
Inputs are white rectangles with a 1px #E8E5DE border. On focus, the border hard-shifts to Near-Black. Labels should always be visible above the field in 'Inter' Bold.

### Cards (Scholarship Listings)
Cards are the primary container. They feature a 1px border, no shadow, and generous internal padding (32px). Titles within cards use Newsreader, while metadata (amount, location) uses Inter.

### Status Chips
Used for "Hyperlocal" tags or "Community Verified" markers. These are square boxes with a light background and 1px border. They must never be pill-shaped.

### Deadline Tracker
A specialized component featuring a vertical Warm Amber bar on the left edge of a square card to denote urgency without using traditional "alert" iconography.

### Search Bar
A large, prominent square field. Instead of a magnifying glass icon, use a clear "SEARCH" button text to maintain the text-heavy, handcrafted aesthetic.