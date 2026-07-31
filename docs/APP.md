# Super-Cube® Learn — PWA & native app (Capacitor)

This project ships **two layers**:

1. **Progressive Web App (PWA)** — install from the browser (Chrome, Edge, Android; iOS Add to Home Screen).
2. **Capacitor native shells** — optional iOS / Android store apps that load the live Learn site in a WebView.

The LMS stays a **Next.js** app (App Router). Native shells do **not** reimplement courses; they open `https://www.super-cube.me/learn` (or your staging URL).

---

## A. PWA (already in the codebase)

### What was added

| Piece | Path |
|--------|------|
| Web manifest | `src/app/manifest.ts` → `/manifest.webmanifest` |
| Icons | `public/icons/icon-192.png`, `icon-512.png`, maskable + Apple |
| Service worker | `public/sw.js` |
| SW registration | `src/components/PwaRegister.tsx` |
| Install banner | `src/components/learn/InstallAppBanner.tsx` |
| Mobile bottom nav | `src/components/learn/LearnBottomNav.tsx` |
| Learn layout shell | `src/app/learn/layout.tsx` |

### Behaviour

- **Start URL:** `/learn` (opens the pathway, not marketing home).
- **Standalone:** marketing Header/Footer hide when `display-mode: standalone`.
- **Offline:** last-fetched Learn navigations + icons may be cached; full offline video library is not guaranteed.
- **Dev:** service worker is **off** unless `NEXT_PUBLIC_PWA_DEV=true`.

### How users install

**Android / Chrome / Edge**

1. Open `https://www.super-cube.me/learn` (HTTPS required).
2. Tap **Install Super-Cube Learn** (banner) or browser menu → **Install app**.

**iPhone / iPad**

1. Open Learn in Safari.
2. Share → **Add to Home Screen**.

### Local PWA test

```bash
npm run build && npm run start
# or: NEXT_PUBLIC_PWA_DEV=true npm run dev
```

Use Chrome DevTools → Application → Manifest / Service Workers.

---

## B. Capacitor (iOS / Android store path)

### Config

- `capacitor.config.ts` — app id `me.supercube.learn`, loads `{CAPACITOR_SERVER_URL}/learn`
- `native-shell/` — minimal local webDir fallback
- `src/components/CapacitorInit.tsx` — status bar, splash hide, Android back button

### One-time setup (on a machine with Xcode / Android Studio)

```bash
# Install deps (if not already)
npm install

# Add platforms (creates ios/ and android/ — large, often gitignored until ready)
npx cap add ios
npx cap add android

# Point at production (default) or staging
export CAPACITOR_SERVER_URL=https://www.super-cube.me
npx cap sync

# Open native IDEs
npx cap open ios      # requires macOS + Xcode
npx cap open android  # requires Android Studio
```

### Local device against dev server

```bash
# Terminal 1 — Next must be reachable from the device
npm run dev -- -H 0.0.0.0 -p 3000

# Phone/emulator:
# - iOS simulator: CAPACITOR_SERVER_URL=http://localhost:3000
# - Android emulator: CAPACITOR_SERVER_URL=http://10.0.2.2:3000
# - Physical phone: CAPACITOR_SERVER_URL=http://YOUR_LAN_IP:3000

export CAPACITOR_SERVER_URL=http://10.0.2.2:3000
npx cap sync
npx cap run android
```

### Store checklist (high level)

**Both**

- [ ] Production URL live (HTTPS) with Learn working
- [ ] Privacy policy URL (data, analytics, payments)
- [ ] App icons + splash (Capacitor assets / native projects)
- [ ] App id stable: `me.supercube.learn` (change only if intentional)
- [ ] Test: pathway, video play, PDF download, Paystack/auth if live

**Apple App Store**

- [ ] Apple Developer account
- [ ] Xcode archive → App Store Connect
- [ ] Screenshots, description, age rating (education)
- [ ] Sign in with Apple if you use third-party social login later

**Google Play**

- [ ] Play Console account
- [ ] Signed AAB from Android Studio
- [ ] Data safety form, content rating

### npm scripts

```bash
npm run cap:sync      # sync web assets + plugins
npm run cap:ios       # open Xcode
npm run cap:android   # open Android Studio
```

---

## C. Architecture notes

```
┌─────────────────────────────────────┐
│  Next.js (www.super-cube.me)        │
│  Marketing + /learn LMS             │
│  PWA manifest + service worker      │
└──────────────▲──────────────────────┘
               │ HTTPS WebView
     ┌─────────┴──────────┐
     │ Capacitor iOS/And  │
     │ App Store / Play   │
     └────────────────────┘
```

**Do not** static-export the whole Next app for Capacitor unless you redesign for static hosting. Live URL keeps assessments, media, and future Supabase/Paystack working.

### Optional later

- Offline lesson text pack (IndexedDB)
- Push notifications (web + Capacitor Push)
- Deep links: `supercube://learn/courses/...`
- Separate marketing site vs learn subdomain (`learn.super-cube.me`)

---

## Support

- Site: https://www.super-cube.me  
- Learn app entry: https://www.super-cube.me/learn  
