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
- **Web Bluetooth also requires a secure context (HTTPS or localhost)** —
  confirmed 2026-07-22: scanning failed from a phone over plain
  `http://192.168.x.x` with "Bluetooth may not be switched on or the browser
  or OS may not support Bluetooth" (device-selector.tsx fallback message),
  and worked immediately once the same server was restarted with
  `http-server --ssl` and a self-signed cert (after accepting the cert
  warning). Consequence: any phone deployment of the web app (incl. PWA in
  Phase 3) must be served over HTTPS.
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

Done in Phase 1 follow-up (2026-07-22):
- Full-screen mobile video player (`mobile-video-player.tsx`) replaces the
  draggable PiP on phones (44px close button, tap-outside-to-close). The
  PiP is unchanged on desktop. Verified on device.

### Other (done 2026-07-22)

- **User-supplied YouTube API key** (works on desktop + mobile): the built-in
  key in `src/env.ts` is rejected, so Jam search failed. Settings > Video
  Search now accepts an optional key (persisted in the existing localStorage
  `settings` blob via AppStateStore), taking priority over the built-in key.
  Touched: `appstate.ts` (+1 field), `appViewModel.ts` (load/save),
  `videoSearchApi.ts` (key fallback), `settings.tsx` (section). Verified on
  device: Jam search works with a user key.

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
  screen, with an offline shell. Works locally over self-signed HTTPS (cert
  warning accepted once); Web Bluetooth survives installation on Android.
  Note: service worker / installed app is bound to the origin, so a local
  LAN deployment needs a static/DHCP-reserved IP for the server box.
- Consider a **Capacitor** wrapper (the project already ships an Electron
  wrapper) if native app parity for iOS/Android is ever wanted — this is the
  only realistic route to BLE amp control on iOS.

### Idea to explore later — self-host the web app on the Android phone

The web build is a pure static SPA with no backend of its own (amp = Web
Bluetooth, Jam = Google YouTube API, tone cloud = soundshed.com, state =
localStorage), so it can run directly on the phone:

1. Build on PC → copy `build/` to the phone (adb push / zip download).
2. Serve locally on the phone: a Play Store folder-server app pointed at the
   folder, or Termux (`pkg install nodejs && npx http-server build`).
3. Open `http://localhost:8080` in Chrome.

- **localhost is a secure context** by definition, so Web Bluetooth should
  work over plain HTTP with no self-signed cert / expiry / IP churn. (Verify
  Android Chrome accepts BLE from `http://localhost` — designed to, but
  Android has had quirks.)
- Gains: no PC needed, works off your LAN, no IP reservation.
- Trade-offs: updates require re-pushing the build to the phone; Android
  aggressively kills background processes, so the little server needs a
  battery-optimization exemption or a Termux foreground wake-lock to stay up.
- Cheap proof of concept: zip `build/`, get it on the phone, try a
  folder-server app + `localhost` + a BLE scan.

## Suggested next steps

1. Phase 1 (shell + video player) and the YouTube key fix are done and
   verified on device.
2. Phase 2 — reorganise the amp page for phones; test the amp on a phone
   first to see what feels cramped before designing the layout.
3. Phase 3 (optional) — PWA, or explore the phone self-hosting idea above.
