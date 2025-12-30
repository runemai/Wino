# ✅ iOS Projekt Setup Færdig!

## Hvad er gjort:

✅ **Info.plist permissions tilføjet:**
- `NSCameraUsageDescription` - For kamera adgang
- `NSPhotoLibraryUsageDescription` - For at læse fra fotobibliotek  
- `NSPhotoLibraryAddUsageDescription` - For at gemme til fotobibliotek

✅ **AppDelegate opdateret** - Capacitor initialisering er sat op

✅ **iOS projekt struktur** - Oprettet og konfigureret

## Næste skridt i Xcode:

1. **Åbn projektet** (hvis ikke allerede åbent):
   ```bash
   cd wino-app
   pnpm cap:ios
   ```

2. **Tilføj Capabilities** (i Xcode):
   - Vælg projektet i venstre sidebar
   - Vælg "App" target
   - Gå til "Signing & Capabilities" tab
   - Klik "+ Capability" og tilføj:
     - ✅ **Camera**
     - ✅ **Photo Library** (hvis ikke allerede der)

3. **Konfigurer Signing**:
   - Vælg dit Apple Developer Team
   - Eller "Personal Team" for lokal test

4. **Vælg din iPhone** som target device (øverst i Xcode)

5. **Kør appen** (▶️ knap) eller tryk `Cmd+R`

## Vigtigt - Når du opdaterer Next.js appen:

Efter hver ændring i Next.js koden:

```bash
cd wino-app
pnpm build
pnpm cap:sync
```

Dette kopierer de opdaterede filer til iOS projektet.

## Test native features:

Når appen kører på din iPhone:
- ✅ Kamera knappen bruger nu native iOS kamera
- ✅ Upload knappen bruger native fotobibliotek picker
- ✅ Alle permissions er konfigureret

## Troubleshooting:

**Hvis appen ikke bygger:**
- Tjek at du har valgt dit Apple Developer Team
- Tjek at din iPhone er tilsluttet og tillid er givet

**Hvis kamera ikke virker:**
- Tjek at Camera capability er tilføjet i Xcode
- Tjek at `NSCameraUsageDescription` er i Info.plist (✅ allerede gjort)

**Hvis permissions ikke vises:**
- Tjek at alle tre NS*UsageDescription keys er i Info.plist (✅ allerede gjort)

Alt er nu klar til at køre! 🎉
