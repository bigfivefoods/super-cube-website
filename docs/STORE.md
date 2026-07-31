# Super-Cube® Learn — app store packaging

Native shells load the live site (`https://www.super-cube.me/learn`) via Capacitor WebView. You do **not** reimplement courses in Swift/Kotlin.

## Prerequisites

- Node 20+
- Xcode 15+ (iOS) on macOS
- Android Studio + SDK 34+
- Apple Developer + Google Play Console accounts

## One-time setup

```bash
cd /path/to/super-cube-website
npm install
export CAPACITOR_SERVER_URL=https://www.super-cube.me

npm run cap:add:ios
npm run cap:add:android
npx cap sync
```

Optional push:

```bash
npm run cap:add:push
```

## Open IDEs

```bash
npx cap open ios
npx cap open android
```

### iOS (TestFlight → App Store)

1. Xcode → Signing & Capabilities → Team
2. Bundle ID: `me.supercube.learn`
3. Display name: Super-Cube Learn
4. Privacy: describe auth, notifications if used
5. Archive → Distribute → TestFlight
6. App Store screenshots: 6.7" + 6.1" iPhone; marketing text from `site` in content.ts

### Android (Play Console)

1. `android/app/build.gradle` applicationId `me.supercube.learn`
2. Generate upload keystore (keep offline)
3. Build signed AAB
4. Play Console → Internal testing → Production
5. Content rating questionnaire; target API as required

## Store listing copy (draft)

**Title:** Super-Cube Learn  
**Subtitle:** Human-centric leadership pathway  
**Description:**  
Super-Cube® Learn is a structured leadership development app: orient, baseline across six faces, deliberate practice, re-measure, and download your growth report. Built from doctoral research in African business networks.

**Keywords:** leadership, development, education, soft skills, SDGs  

## Deep links

Web is canonical: `https://www.super-cube.me/learn/...`  
Native uses the same URLs inside the WebView.

## Release checklist

- [ ] Production env on Vercel (Supabase, Paystack, VIDEO_CDN)
- [ ] Orgs SQL applied
- [ ] CAPACITOR_SERVER_URL points at production
- [ ] Splash / icon assets match brand
- [ ] Test: demo → orientation → one lesson on device
- [ ] Privacy policy URL (use /about or add /privacy)
