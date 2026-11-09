# MANHUNT / PLAY — v0.6

A private, **walking-only** location-aware team game made with **React Native + Expo SDK 57 + Firebase**. Designed for a small group of friends in a safe, permitted area. Not a production-certified tracking or emergency system.

## What's new compared with v0.5

1. **Real native street maps are the default.** Google Maps on Android; Apple Maps on iOS. Map boundary and estimated rest-zone are overlaid on the street map. **Radar** remains an offline-style backup, explicitly labelled as schematic. The Google Maps Android SDK requires its **own key** for a development/production build; the Firebase JS key is *not* a Maps key.
2. **Two chat channels:** **All Players** (any joined player can talk to everyone in the match; great for two-player tests) and **Team Only** (Firestore restricts reads and writes to the assigned Hunter/Runner team). Opposing teams *cannot* read each other's **Team Only** chat. They can both read **All Players**, by design.
3. **Live chat UX:** Firestore live subscription, offline/cache indicator, reconnect button, room audience count, pending/sent indicators, newest message autoscroll, message tones, and an unread badge for the selected channel when viewing another tab.
4. **Original audio effects:** optional sounds for button taps, role reveal, countdown seconds, match start, incoming messages and result. Audio ON/OFF button in top navigation. Original synthesized WAV files included in `assets/sfx/`; no external sound assets or microphone access required for these effects.
5. **Visual game polish:** cleaner role-and-timer hero, objective card, arena legend, center-map action, larger map, clearer channel selector, and distinct Hunter/Runner colors. No physical chasing or contact is part of the app's required interactions.
6. **Preserved:** Create Room → Join Room → Ready → Random Assignment → Role Reveal → Game, foreground-only location consent/pause, approximate GPS pings, safe-zone indicator, manual capture confirmation, match end rules.

## 1. Upgrade without losing your Firebase configuration

1. Back up your working v0.5 project.
2. Extract this ZIP and copy its contents into your project. **Keep your own `.env`**; it is intentionally excluded from the ZIP.
3. Your `.env` must have the five `EXPO_PUBLIC_FIREBASE_*` values from your existing working Firebase project. Optional Firebase Storage/measurement variables can stay as they are.
4. **Crucial:** Firebase Console → your `manhunt-87a3d` project → **Firestore Database → Rules** → paste all the contents of the included **`firestore.rules`** → **Publish**. Don't publish these under Realtime Database rules.
5. Keep Firebase Authentication → Sign-in method → **Anonymous: Enabled**.
6. In the project terminal:

   ```sh
   npm install
   npx expo install --check
   npm test
   npx expo start --clear
   ```

7. Start a **new room** and install the same v0.6 code on both phones. Both phones must use the **same Firebase project** and same 8-character room code.

> If `npm install` shows incompatible Expo versions, run `npx expo install --fix` and then `npm test`. This ZIP does not contain `node_modules`.

## 2. Why messages didn't arrive before

The v0.5 chat was **Team Only**, so in a **two-player** game there is one Hunter and one Runner: each team has **one member**, and messages can only be read by that one person. The channels weren't supposed to exchange messages.

v0.6 adds **All Players** with the new path:

```
rooms/{roomCode}/publicMessages/{messageId}
```

This channel is readable/writable only by **joined, authenticated match participants**. The existing private team path remains:

```
rooms/{roomCode}/teamMessages/{hunter|runner}/messages/{messageId}
```

Rules prevent a Runner from reading/writing Hunter **Team Only** messages, and vice versa. All Players messages are deliberately shared across both teams and are not a secret. **Team chat is not end-to-end encrypted.**

### Two-phone message test

1. Phone A: create room. Phone B: join. Both tap Ready; host assigns random roles and starts match.
2. Open **Chat** on both phones and select **All Players**.
3. A sends `Hello from A`. A should show ✓ after the server acknowledges; B should see the incoming message. B replies; A should see it.
4. If delivery fails: check the **LIVE SYNC / OFFLINE / CONNECTION ERROR** indicator, and inspect the actual error shown on the chat panel. Confirm both devices use the **same Firebase project**, new rules are **Published**, and both are signed in.
5. Switch both phones to **Team Only**. In a two-player game, both should only see their own team's messages. This is intentional. To test delivery between two teammates, use **3 players** (two Runners) or **6+ players** (two Hunters).
6. For adversarial privacy testing, use the **Firebase Local Emulator Suite** with two distinct auth users to attempt a read on the opposing team's path. This ZIP includes static rule assertions, **not** a live Rules Emulator test.

No app-side display restriction can substitute for the Firestore authorization rules: publish the updated rules before testing.

## 3. Google Maps on Android (real street tiles)

`react-native-maps` version **1.27.2** is matched to Expo **SDK 57**. It provides a native **Google map on Android** and a native **Apple map on iOS**. Expo Go may show blank Google tiles in some Android releases; **building a development client** lets your app use your own key.

### Set up a Google Maps Platform API key

1. Open https://console.cloud.google.com/ and select/create a Google Cloud project (may be the same project as Firebase).
2. Enable **Maps SDK for Android**. Google Maps Platform may require a billing account.
3. Create a **new Google Maps Platform API key**. This is **not** your `EXPO_PUBLIC_FIREBASE_API_KEY`.
4. Restrict the key to **Maps SDK for Android**. In **Application restrictions**, add **Android apps**, your app ID (`app.json` → `expo.android.package`), and the **SHA-1 signing fingerprint** from your Expo/EAS Android development build.
5. Choose your final unique Android package ID in `app.json` before generating/building. The included `com.example.manhuntwalk` is a **placeholder** and must not be used for store release.
6. In a local `.env` (or your EAS build environment), add:

   ```dotenv
   GOOGLE_MAPS_API_KEY_ANDROID=YOUR_ANDROID_MAPS_SDK_KEY
   ```

   `app.config.js` adds this key at **native build time** to the `react-native-maps` config plugin. It is **not** an `EXPO_PUBLIC_` setting.
7. Install a development client and build a new Android binary:

   ```sh
   npx expo install expo-dev-client
   npx eas-cli build:configure
   npx eas-cli build --platform android --profile development
   ```

   You will need an Expo account. Ensure `GOOGLE_MAPS_API_KEY_ANDROID` is available to the **EAS build job**, not just the local Metro process. You may use the EAS environment variable settings. After building, install the resulting development app, not Expo Go.
8. Launch the app and open **Arena → Street map**. If only the markers, Google logo, or gray tiles appear, inspect Android `logcat` for Maps authorization errors and verify the **API key / package ID / SHA-1 / billing / SDK** combination.

**iOS** uses Apple Maps by default, so it doesn't require a Google Maps iOS SDK key. The included **Backup** view is a schematic, not a street map or navigation app.

Map permission is **foreground only**; pause sharing immediately clears the current published location while connected. Remote deletion after sudden termination/offline is **best effort**, not guaranteed. Do not reveal precise live positions or use estimated pings for capture/navigation decisions.

## 4. Audio setup

v0.6 uses `expo-audio` **~57.0.5** (compatible with Expo 57). Sound effects are short, custom-generated WAV assets under `assets/sfx/`:

- `tap.wav` — button and tab selection
- `reveal.wav` — the secret role card
- `count.wav` — the last three countdown seconds
- `start.wav` — the match starts
- `message.wav` — new incoming message in the open channel
- `win.wav` — match ends

Sounds play only inside the app; tap **♪ ON / ♪ OFF** in the header to disable. There's no voice chat, no music streaming, and no microphone recording.

## 5. Firebase paths and safe gameplay

- `rooms/{roomId}`: room config, status, timer.
- `rooms/{roomId}/players/{uid}`: consent flag, approximate location or `null`, role, Ready, manual capture status.
- `rooms/{roomId}/publicMessages/{id}`: match-wide text. Authenticated room members only.
- `rooms/{roomId}/teamMessages/{team}/messages/{id}`: private text for that assigned team.

Runners get delayed approximate pings, not turn-by-turn live tracking. Players must consent to share location, are not tracked in background, and can stop sharing or leave. Play **walking-only**, in a permitted area away from roads and hazards; no physical contact required. The geofence and safe-zone are approximate UI aids, not safety guarantees.

## 6. Verification status

- The source includes unit checks for GPS approximations, role assignment, match results, radar, chat paths, and basic Firestore rule structure. Run `npm test`.
- Static checks do **not** verify Firebase rules against live services. Test with real devices and/or Firebase Rules Emulator before releasing.
- A complete Expo device build, Android Google Maps key authentication, and live chat delivery **cannot be confirmed from this environment**. The package is a ready-to-test implementation, not a claim of production readiness.

Docs: https://docs.expo.dev/versions/v57.0.0/sdk/map-view/ • https://docs.expo.dev/versions/v57.0.0/sdk/audio/ • https://firebase.google.com/docs/firestore/query-data/listen
