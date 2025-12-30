# Installer Xcode

## Xcode er påkrævet for iOS udvikling

Xcode er Apple's officielle IDE til iOS udvikling og er **gratis** at downloade.

## Installation (3 trin):

### 1. Download Xcode

**Option A: Via App Store (Anbefalet)**
1. Åbn **App Store** på din Mac
2. Søg efter **"Xcode"**
3. Klik **"Hent"** eller **"Get"**
4. Vent på download (ca. 10-15 GB, kan tage 30-60 minutter)

**Option B: Via Apple Developer Website**
1. Gå til: https://developer.apple.com/xcode/
2. Klik **"Download"**
3. Log ind med dit Apple ID
4. Download Xcode

### 2. Installer Xcode

1. Når download er færdig, åbn **Xcode** fra Applications
2. Første gang: Xcode vil bede dig acceptere licensaftalen
3. Xcode vil automatisk installere **Command Line Tools**

### 3. Verificer Installation

Åbn Terminal og kør:

```bash
xcodebuild -version
```

Du skulle se noget som:
```
Xcode 15.0
Build version 15A240d
```

## Efter Installation:

Når Xcode er installeret, kan du:

1. **Åbne projektet:**
   ```bash
   cd wino-app
   pnpm cap:ios
   ```

2. **I Xcode:**
   - Vælg dit Apple Developer Team (eller "Personal Team" for test)
   - Vælg din iPhone
   - Klik Run (▶️)

## Alternativer (hvis du ikke kan installere Xcode nu):

### Option 1: Brug iOS Simulator
- Xcode inkluderer iOS Simulator
- Du kan teste appen i simulator først
- Simulator har begrænset kamera support

### Option 2: Remote Build Service
- Brug en cloud-baseret build service
- Mere komplekst setup

### Option 3: Vent med iOS
- Fokuser på web versionen først
- Installer Xcode senere når du er klar

## System Krav:

- **macOS:** Ventura (13.0) eller nyere
- **Disk plads:** Mindst 20 GB ledig plads
- **RAM:** 8 GB minimum (16 GB anbefalet)
- **Internet:** Hurtig forbindelse for download

## Tips:

- **Første download:** Kan tage lang tid (10-15 GB)
- **Opdateringer:** Xcode opdateres ofte, hold det opdateret
- **Disk plads:** Xcode tager meget plads, sørg for nok ledig plads

---

**Når Xcode er installeret, er du klar til at køre appen på din iPhone!** 🎉
