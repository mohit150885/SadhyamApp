# SadhyamIAS — Android app (React Native + Expo)

The student side of the SadhyamIAS website as a native Android app. It uses the same Firebase project and the same
website APIs, so everything you change in the website's admin panel (courses, banners, prices, theme colour, tests,
notifications …) shows up in the app instantly. The admin panel is **not** part of the app.

Expo SDK 58 · React Native 0.88 · Expo Router · Firebase JS SDK · Reanimated 4

---

## 1. Configure

Everything lives in **`.env`**:

| Key | What it does |
|---|---|
| `EXPO_PUBLIC_WEBSITE_URL` | **Your website domain** (no trailing slash). The app calls its APIs (tests, library, results, PDFs), loads website images from it and opens it in the browser for payments. Change it whenever your domain changes. |
| `EXPO_PUBLIC_APP_NAME`, `EXPO_PUBLIC_APP_TAGLINE` | Shown in the launch animation. |
| `EXPO_PUBLIC_PURCHASE_MODE` | `external` (default) or `none` — see "Payments" below. |
| `EXPO_PUBLIC_FIREBASE_*` | Same Firebase web config as the website (already filled in from your project). |
| `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` | Firebase's Google **Web client ID**. Set it to show "Continue with Google" (see section 3). |
| `ANDROID_PACKAGE` | Android application id (e.g. `com.sadhyamias.app`). Choose it before your first Play upload — it can't change later. |

`EXPO_PUBLIC_*` values are bundled into the app, so never put secrets (Razorpay secret, service account) here.
After changing `.env`, restart `npx expo start`; for store builds, rebuild.

The website itself needs no changes. Its API routes already accept the Firebase ID token the app sends
(`Authorization: Bearer …`), and native apps aren't affected by CORS.

## 2. Run it

```bash
npm install
npx expo start          # scan the QR code with Expo Go (SDK 58) on your Android phone
```

Everything works in Expo Go except Google sign-in, which needs a development build (section 3).

## 3. Google sign-in (native, Firebase Auth)

"Continue with Google" uses the Android Google account picker and signs in to **Firebase Auth with the Google
provider** — exactly like the website's Google button (`GoogleAuthProvider.credential(idToken)` →
`signInWithCredential`). A student who used Google on the website gets the same account (uid) in the app.

One-time setup:

1. **Web client ID** — Firebase console → Authentication → Sign-in method → Google (enable it) →
   *Web SDK configuration* → copy **Web client ID** into `.env` as `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`.
2. **Android app in Firebase** — Project settings → *Add app* → Android, package = `ANDROID_PACKAGE` from `.env`
   (`com.sadhyamias.app`).
3. **SHA-1 fingerprints** — add them to that Android app (Project settings → your Android app → *Add fingerprint*):
   * EAS builds: `eas credentials -p android` shows the SHA-1 of your upload/keystore.
   * Play Store: Play Console → *App integrity* → **App signing key certificate** SHA-1 (add this one too).
   * Local `npx expo run:android`: `cd android && ./gradlew signingReport` (debug SHA-1).
   Without the right SHA-1, Google returns `DEVELOPER_ERROR`.

Google sign-in is a native module, so it **doesn't run in Expo Go** (the button explains this there; email login works).
Test it with a development build:

```bash
npx eas-cli@latest build --profile development --platform android   # install the APK, then:
npx expo start --dev-client
```

## 4. Build for the Play Store

```bash
npm i -g eas-cli
eas login
eas build --platform android --profile preview      # installable APK for testing
eas build --platform android --profile production   # .aab for Google Play
eas submit --platform android                       # optional: upload to Play Console
```

App icon, adaptive icon and splash are in `assets/images` (generated from the website logo).

## 5. Payments (Google Play policy)

No payment is processed inside the app — no Razorpay SDK, no checkout WebView, no UPI form.

* Every **Enroll Now / Buy / Pay now** action goes through `src/providers/PurchaseProvider.tsx`.
  It shows a bottom-sheet dialog ("Continue on our website") and opens the item's page on your website
  in the **system browser** (`Linking.openURL`, not a WebView). Not signed in? It asks the student to log in first so the
  purchase lands on the same account.
* The student pays with Razorpay on the website. The website marks `orders/{id}` as **paid** (verify-payment / webhook).
* When the student returns, the app is already listening to their orders in Firestore and reloads
  `/api/my/library` on resume — the item unlocks automatically and a "Payment received — unlocked!" toast appears.
* `EXPO_PUBLIC_PURCHASE_MODE=none` turns the app into a pure "reader" app: purchase buttons only explain that the item
  can't be bought in the app (no link out). Use this if a Play review asks you to remove the external link.

Before submitting, check the current Google Play **Payments policy** for your country (rules on linking to external
purchases change and differ between regions and programmes). In the Play Console **Data safety** form, state that
payments are processed outside the app on your website, and that the app collects name, email and phone for the account.
The app declares no billing permission.

Google Play also requires in-app **account deletion**: Account → Settings → Delete account (deletes the Firebase sign-in
and files a deletion request in `support_queries` for your team). Add your website's contact page as the deletion
URL in the Play Console.

## 6. What's inside

| Area | Screens |
|---|---|
| Launch | Animated intro: logo pop + spin, light ripples, shine sweep, name letter-by-letter, underline, tagline, zoom-out reveal |
| Tabs | Home · Explore (courses / test series / study material, exam tabs, search, filters, sort) · My Learning · Account |
| Catalog | Course, test series, study material and faculty detail pages with parallax cover, reviews (read + submit), FAQs, countdowns, sticky enrol bar |
| Tests | Instructions, full CBT exam (timer, sections, palette, mark for review, zoom, autosave on phone + server, resume, auto-submit, answer-sheet mode for scanned papers), result with rank/percentile/leaderboard, solutions with explanations and solution PDF |
| Study material | Watermarked PDF reader (pdf.js in a local WebView, pages streamed from your website) |
| Account | Login, sign-up, forgot password, Google (native, Firebase Auth), profile, settings (password, verification, delete account), orders, order detail |
| Info | Results/toppers, about, contact (support form), help centre, FAQs, refund / terms / privacy, notifications, global search |

Content is cached on the phone, so the app opens instantly and works offline with the last data it saw.

```
src/
  app/                 screens (Expo Router)
    (tabs)/            Home, Explore, My Learning, Account
    course/ test-series/ material/ faculty/   detail pages
    test/ result/ solutions/ series/ read/    tests + PDF reader
  components/          UI kit, cards, hero, intro animation, exam palette, PDF viewer
  hooks/               live Firestore content, orders, library, notifications
  lib/                 config (.env), firebase, website API client, theme, shared models from the website
  providers/           auth, purchase redirect
```
