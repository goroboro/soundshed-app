# Mobile-Friendly Interface — Plan

Date: 2026-07-22
Status: Proposed (not started)

## Background

The web interface is hard to use on a small screen. After reviewing the codebase,
the current UI is built desktop-first with only minimal responsiveness.

## Codebase Findings

- **Stack:** React 19 + TypeScript, Pullstate 2 stores, React Router (HashRouter),
  Bootstrap CSS (already imported) plus a large custom design system in
  `css/styles.css` (~2,000 lines, dark glassmorphism/glow aesthetic).
- **Tabs** (fixed top nav in `src/components/app.tsx`): Home, Amp (`/device`),
  Jam (lessons), Toolkit (scalex iframe), Settings, About.
- **Amp control:** Web mode (`IsWebMode: true` in `src/env.ts`) talks to a
  Positive Grid Spark over **Web Bluetooth** (`SparkTransport: "ble"`).
- **Video:** Lessons use YouTube/ReactPlayer; a draggable picture-in-picture
  player (`react-draggable`, fixed 640px/320px widths) is a desktop assumption.
- **Current responsiveness:** viewport meta tag exists, but only two media
  queries exist (`max-width: 860px` for the home grid, `max-width: 920px` for
  the tone list). Everything else is desktop-first:
  - top nav is an unbroken row of links, no collapse behaviour
  - page sections use heavy `2rem` paddings
  - hero/heading sizes are large (e.g. 2.6rem hero)
  - amp tab panels, tone list rows, and video player are not fully fluid
  - many interactions are hover-only (shimmers, underline glows) — no value on touch

## Platform Caveat (decide before polishing amp UI for phones)

- **Web Bluetooth only works in Chromium browsers** (Chrome/Edge on Android).
- **iOS Safari has no Web Bluetooth**, so the Amp tab cannot connect at all
  on an iPhone; users would only get Home/Jam/Toolkit/Settings.
- There is an existing `AmpOfflineControl` fallback for non-native mode, but on
  iOS it should be a clear, informative state ("connecting to an amp requires a
  Chromium browser or the desktop app") rather than a scan that finds nothing.

## Plan

### Phase 1 — CSS-only responsiveness (biggest win, lowest risk)

- Collapse the top nav into a **hamburger menu** or, preferably, a **bottom tab
  bar** (standard mobile pattern; 5–6 short labels fit comfortably).
- Add mobile breakpoints for:
  - page paddings (2rem → ~1rem)
  - hero and section headings
  - draggable video player (width `min(640px, 90vw)`, or a full-width modal on phones)
  - amp tab panels (stack columns, ≥44px touch targets for sliders/buttons)
- Reuse Bootstrap responsive utilities where they already fit (Bootstrap is
  already in the bundle).

**Main files touched:** `css/styles.css`, `src/components/app.tsx` (nav),
`src/components/device/device-main.tsx` + related device components,
video player block in `app.tsx`.

### Phase 2 — Mobile-specific UX

- Reorganise the amp page (the most complex screen: signal path, FX controls,
  channel strip) for phones — e.g. preset name + channel selector always
  visible, FX details in expandable sections or a detail view.
- Touch-friendly sliders (check hit areas of `lib/webaudio-controls`).
- Remove/adjust hover-only affordances.

### Phase 3 — Feel like an app (optional)

- **PWA:** manifest + service worker so the app can be installed to the home
  screen, with an offline shell.
- Consider a **Capacitor** wrapper (the project already ships an Electron
  wrapper) if native app parity for iOS/Android is ever wanted — this is the
  only realistic route to BLE amp control on iOS.

## Suggested next steps

1. Confirm the iOS/BLE stance (Phase 2 caveat above).
2. Start Phase 1 — CSS + small `app.tsx` tweaks, no architectural changes.
3. Validate on a phone (Android Chrome) and in devtools device mode.
