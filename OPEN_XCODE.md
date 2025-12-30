# Åbn Xcode Projekt

## Hurtig metode:

```bash
cd wino-app
pnpm cap:ios
```

Eller direkte:

```bash
open ios/App/App.xcodeproj
```

## Hvis Xcode ikke åbner automatisk:

1. Find Xcode i Finder eller Spotlight
2. File → Open
3. Naviger til: `wino-app/ios/App/App.xcodeproj`
4. Klik Open

## Alternativ via Terminal:

```bash
cd "/Users/runemai/Documents/Tech projects/Wino/wino-app"
open -a Xcode ios/App/App.xcodeproj
```

---

**Note:** Hvis `cap:ios` åbner forkert program, brug `open ios/App/App.xcodeproj` direkte.
