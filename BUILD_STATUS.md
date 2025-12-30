# Build Status og Næste Skridt

## Status

✅ Capacitor er installeret og konfigureret  
✅ Native camera hooks er oprettet  
✅ Scan experience er opdateret til at bruge native APIs  
⚠️ Build fejler pga. TypeScript/module problemer  
⚠️ Capacitor CLI kræver Node.js 22+ (du har Node 20)

## Løsninger

### Option 1: Opgrader til Node.js 22+

```bash
# Installer Node.js 22+ via nvm eller direkte
# Derefter:
cd wino-app
pnpm install
pnpm build
pnpm cap:add:ios
pnpm cap:sync
pnpm cap:ios
```

### Option 2: Brug lokal Node.js (hvis tilgængelig)

Hvis du har Node.js 22+ installeret et andet sted, brug den til Capacitor kommandoer:

```bash
# Find Node 22+ path
which node22  # eller lignende

# Brug den til Capacitor
/path/to/node22/bin/npx cap add ios
```

### Option 3: Manuel iOS Setup

Hvis du ikke kan opgradere Node.js lige nu:

1. **Opret iOS projekt manuelt**:
   - Åbn Xcode
   - File > New > Project
   - Vælg "iOS" > "App"
   - Navn: "Wino", Bundle ID: "com.wino.app"
   - Sprog: Swift, UI: SwiftUI

2. **Tilføj Capacitor dependencies**:
   - Tilføj Capacitor via Swift Package Manager eller CocoaPods
   - Se Capacitor iOS dokumentation

3. **Konfigurer webDir**:
   - Kopier `.next` output til iOS projektets `public` mappe

## TypeScript Fejl der Skal Fixes

1. **QueryClient import** - Fikset med @ts-ignore (midlertidig løsning)
2. **Supabase createServerClient** - Fikset med @ts-ignore (midlertidig løsning)  
3. **Build errors** - Kræver nærmere undersøgelse

## Anbefaling

Den nemmeste løsning er at opgradere til Node.js 22+, da det løser både Capacitor CLI problemet og kan hjælpe med build fejlene.
