# Shadow Anki (Expo, no EAS)

A mobile app for YouTube shadowing practice with an Anki-style forgetting-curve scheduler.

## Stack
- Expo + Expo Router
- SQLite (expo-sqlite)
- React Native WebView
- Zustand

## Run
```bash
npm install
npx expo start
```

## Build locally (no EAS)
```bash
npx expo run:android
npx expo run:ios
```

## MVP Features
- Add YouTube video by URL (including youtu.be and youtube.com links)
- Segment playback for shadowing
- Review queue driven by SM-2 scheduler
- Notion-inspired clean UI
