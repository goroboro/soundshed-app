# Mobile-Friendly Interface — Plan

Date: 2026-07-22
Status: In progress — Phase 1 chunk 1 done (2026-07-22)

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

## Git Setup (done 2026-07-22)

- Fork: `goroboro/soundshed-app` → git remote `origin` (SSH)
- Upstream: `soundshed/soundshed-app` → git remote `upstream`
- Working branch: `mobile-ui` (pushed to origin)
- Pull updates: `git fetch upstream && git rebase upstream/main mobile-ui`

## Modularity Strategy

Goal: every upstream merge only ever touches the few lines we changed in
shared files.

**New files (can never conflict with upstream):**
- `css/mobile.css` — all responsive overrides (loaded after styles.css)
- `src/core/mobile.ts` — `useIsMobile()` hook / `MOBILE_QUERY` (900px, keep in
  sync with mobile.css)
- `src/components/mobile/` — `mobile-nav.tsx` (done); later: `mobile-video-player.tsx`,
  `mobile-amp.tsx`

**Existing files touched (small additive edits = merge-conflict surface):**
- `src/components/app.tsx` — +15 lines: css import, `useIsMobile`, conditional
  `<MobileNav/>` (desktop nav left untouched, hidden via CSS on mobile)
- `src/components/settings.tsx` — +19 lines: mobile-only "More" section with
  About link (About is not a bottom-bar tab on mobile)
- `index.html` — *(Phase 3 only)* PWA manifest link

## Plan

### Phase 1 — CSS-only responsiveness (chunk 1 DONE 2026-07-22)

Done in chunk 1:
- Mobile shell: slim sticky top bar (brand + sign-in/user button) + fixed
  bottom tab bar (Home, Amp [with status dot], Jam, Toolkit, Settings),
  safe-area insets, reuses existing SVG icons and routes.
- Mobile overrides in `css/mobile.css`: desktop nav hidden, hero/heading
  scales, tighter paddings, full-width magic cards, home image panel hidden,
  settings table overflow, video player contained (16:9, no 640px overflow).
- Verified: typecheck, build-web, 355 unit + 10 integration tests, headless
  Chrome screenshots (mobile home/settings, desktop unchanged).

Remaining Phase 1 items:
- Full-screen mobile video player (`mobile-video-player.tsx`) to replace the
  draggable 640px PiP on phones (CSS containment is a stopgap for now).

### Phase 2 — Mobile-specific UX

- Reorganise the amp page (the most complex screen: signal path, FX controls,
  channel strip) for phones — e.g. preset name + channel selector always
  visible, FX details in expandable sections or a detail view.
  (`mobile-amp.tsx` + small edit to `device-main.tsx`.)
- Touch-friendly sliders (check hit areas of `lib/webaudio-controls`).
- Remove/adjust hover-only affordances.
- Bigger touch targets for amp controls (started: tone/settings buttons 40px).

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
