# 📱 Næste Skridt - Installer Xcode

## Status

✅ **iOS projekt er sat op og klar**  
✅ **Alle permissions og capabilities er konfigureret**  
❌ **Xcode mangler** - skal installeres før appen kan køres

## Installer Xcode Nu

### Hurtig metode:

1. **Åbn App Store** (jeg har åbnet den for dig)
2. **Søg efter "Xcode"**
3. **Klik "Hent"** eller "Get" (gratis, men ~15 GB)
4. **Vent på download** (30-60 minutter typisk)

### Efter Installation:

1. **Åbn Xcode** første gang
2. **Accepter licensaftalen**
3. **Vent på at Command Line Tools installeres** (automatisk)

### Test Installation:

```bash
xcodebuild -version
```

Du skulle se Xcode version nummer.

## Når Xcode er Installeret:

```bash
cd wino-app
pnpm cap:ios
```

Dette åbner Xcode med dit projekt.

## I Xcode:

1. **Vælg Team:**
   - Vælg "App" target
   - "Signing & Capabilities" tab
   - Vælg dit Apple Developer Team (eller "Personal Team")

2. **Vælg iPhone:**
   - Vælg din iPhone fra device dropdown

3. **Kør Appen:**
   - Klik ▶️ Run (eller `Cmd+R`)

## System Info:

- **macOS:** 26.2 ✅ (Kompatibel)
- **Ledig plads:** 47 GB ✅ (Nok plads til Xcode)
- **Status:** Klar til Xcode installation

## Alternativer:

Hvis du ikke kan installere Xcode lige nu:
- **Web version:** Appen virker stadig i browseren (`pnpm dev`)
- **Senere:** Du kan installere Xcode når du har tid
- **iOS Simulator:** Inkluderet i Xcode, kan teste uden fysisk iPhone

---

**Alt er klar - du skal bare installere Xcode!** 🎉
