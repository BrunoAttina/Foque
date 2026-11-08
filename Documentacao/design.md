---
name: Glacial Focus Game
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#3e484f'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#6e7980'
  outline-variant: '#bdc8d1'
  surface-tint: '#00668a'
  primary: '#00668a'
  on-primary: '#ffffff'
  primary-container: '#38bdf8'
  on-primary-container: '#004965'
  inverse-primary: '#7bd0ff'
  secondary: '#006c49'
  on-secondary: '#ffffff'
  secondary-container: '#6cf8bb'
  on-secondary-container: '#00714d'
  tertiary: '#ae3115'
  on-tertiary: '#ffffff'
  tertiary-container: '#ff947c'
  on-tertiary-container: '#861800'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#c4e7ff'
  primary-fixed-dim: '#7bd0ff'
  on-primary-fixed: '#001e2c'
  on-primary-fixed-variant: '#004c69'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#ffdad2'
  tertiary-fixed-dim: '#ffb4a3'
  on-tertiary-fixed: '#3d0600'
  on-tertiary-fixed-variant: '#8c1900'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  display:
    fontFamily: Outfit
    fontSize: 40px
    fontWeight: '800'
    lineHeight: 48px
    letterSpacing: -0.02em
  display-mobile:
    fontFamily: Outfit
    fontSize: 32px
    fontWeight: '800'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Outfit
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Outfit
    fontSize: 22px
    fontWeight: '700'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Outfit
    fontSize: 18px
    fontWeight: '700'
    lineHeight: 24px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '500'
    lineHeight: 24px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '700'
    lineHeight: 18px
    letterSpacing: 0.02em
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.04em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 10px
    fontWeight: '800'
    lineHeight: 14px
    letterSpacing: 0.06em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-mobile: 0.75rem
  margin: 1.5rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

This design system establishes a balance between hyper-tactile playfulness and clean, modern geometric discipline. Designed for deep work and high-focus gamification, the interface draws inspiration from tactile mobile games, micro-rewards, and snappy motivational cues while maintaining an airy, premium digital workspace.

The core aesthetic blends **Tactile / Skeuomorphic Modernism** (extrusions, directional pseudo-3D press offsets, candy-surfaced pill containers) with a crisp, arctic-inspired visual clarity. The emotional atmosphere is challenging yet rewarding, crisp yet approachable—transforming tedious focus sessions into satisfying, punchy milestones governed by a charismatic, demanding seal companion.

## Colors

The palette revolves around glacial precision contrasted with vibrant motivational triggers:

- **Primary (`#38BDF8`) & Deep Arctic (`#0284C7`)**: Delivers refreshing, ice-shelf clarity. Used for primary interactive highlights, status rings, and navigational states. Supported by hard-surface drop shadows in `#0284C7` and `#0369A1` to achieve the distinct chunky press-depth.
- **Secondary Mint (`#10B981`)**: The vitality tone, signaling completed deep-focus intervals, streak preservation, and restorative breaks.
- **Tertiary Amber Flame (`#FF6B4A`)**: High-urgency gamification color, applied to streak flames, XP counters, critical focus timers, and dynamic call-to-actions.
- **Neutral Canvas**: Crisp snow tones (`#F8FAFC`, `#F0F9FF`) form the dominant backdrop with crystalline blue undertones, framed by bold midnight slate (`#0F172A`) for crisp typographic legibility.

## Typography

Typography pairs **Outfit** for energetic, punchy headlines with **Plus Jakarta Sans** for warm, highly-legible UI labels and microcopy. Outfit’s geometric construction lends an arcade-ready cadence to streak tallies, countdown timers, and celebratory banners. Plus Jakarta Sans brings rounded terminals and structured proportions that maintain clean readability across dense session logs and status widgets.

## Layout & Spacing

The layout philosophy uses a strict mobile-first fluid container anchored inside safe viewport margins. 

- **Grid Framework**: 4-column system on mobile devices expanding into an 8-column layout on tablet viewports.
- **Rhythm**: Standard spacing aligns strictly to an 8pt base grid (`space-xs` = 4px, `space-sm` = 8px, `space-md` = 16px, `space-lg` = 24px, `space-xl` = 32px).
- **Interactive Safe Padding**: Action targets maintain a minimum vertical clearance of `48px` to ensure effortless touch interaction during focused intervals.

## Elevation & Depth

Elevation departs from diffuse drop shadows in favor of **extruded 3D bevels and directional physical offsets**:

1. **Tactile Extrusion (Primary Interaction)**: Interactive buttons and action cards feature a solid `4px` bottom border/extrusion shadow tinted 20–30% darker than their surface color (e.g., `#38BDF8` face paired with a `#0284C7` bottom plate). When pressed (`:active`), the element translates `3px` downward with the bottom lip shrinking to `1px`, delivering a physical, springy click.
2. **Glacial Floating Surfaces (Cards & Modules)**: Cards employ clean, ultra-soft diffuse ambient depth (`0 8px 24px -4px rgba(2, 132, 199, 0.08)`) with a crisp 1.5px solid border (`#E0F2FE`) to simulate polished, translucent ice floes.
3. **Modal & Mascot Layering**: Dialogues sit atop an iced glass backdrop blur (`backdrop-filter: blur(8px) bg-slate-900/40`) accompanied by an outer `0 20px 32px -8px rgba(15, 23, 42, 0.15)` elevation envelope.

## Shapes

The shape system leverages roundedness level `2` (8px base corner radius), scaling to `16px` (`rounded-lg`) for interactive cards and `24px` (`rounded-xl`) for main activity containers and speech bubbles.

Buttons and floating streak chips utilize full pill contours (`border-radius: 9999px`) to emphasize a bouncy, resilient touch language. Mascot speech balloons feature rounded corners with directional wedge tails oriented toward character avatars.

## Components

- **3D Chunky Action Buttons**: Built with a double-layered structure (surface face + solid bottom extrusion plate). Primary state features `#38BDF8` face with `#0284C7` extrusion; accent states feature `#FF6B4A` face with `#DD4B2A` extrusion. Pressed states translate down with crisp audio-haptic feedback.
- **Ice-Slab Cards**: Modules crafted on `#FFFFFF` surfaces with `#E0F2FE` borders and `16px` radius. Active session cards feature an inner ice-gradient gleam and progress rings.
- **Focus Chips & Streak Badges**: Pill-shaped badges (`border-radius: 9999px`) containing high-contrast bold labels, flame icons, or XP gems. Encased with `2px` crisp outlines and micro-shadows.
- **Session Progress Trackers**: Segmented thick bars with rounded capsules (`height: 16px`), using secondary mint (`#10B981`) fills over a frosted ice track (`#E2E8F0`).
- **Mascot Speech Prompt Bubbles**: White elevated dialogue cards with `16px` radius, subtle ice-blue drops, and bold typography delivering sarcastic, motivational, or celebrating commentary.