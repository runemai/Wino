# 🎯 Sidste Skridt i Xcode

## ✅ Xcode er installeret!

Nu skal du bare konfigurere projektet i Xcode og køre det.

## I Xcode (som lige er åbnet):

### 1. Vælg dit Apple Developer Team

1. I venstre sidebar, klik på **"App"** projektet (blå ikon)
2. Vælg **"App"** target under "TARGETS"
3. Gå til **"Signing & Capabilities"** tab
4. Under **"Signing"**:
   - ✅ **"Automatically manage signing"** skal være checked
   - Vælg dit **Apple Developer Team** fra dropdown
   - Hvis du ikke har et team: Vælg **"Add an Account..."** og log ind med dit Apple ID
   - Eller vælg **"Personal Team"** (gratis, til test)

### 2. Tjek Capabilities

Under **"Signing & Capabilities"** tab, tjek at du kan se:
- ✅ **Camera** capability
- ✅ **Photo Library** capability

(Hvis de ikke er der, klik "+ Capability" og tilføj dem)

### 3. Vælg Din iPhone

1. I toppen af Xcode, til venstre for Run knappen
2. Klik på device dropdown (siger måske "Any iOS Device")
3. Vælg din **iPhone** (den skal være tilsluttet via USB)
   - Eller vælg **"iPhone 15 Pro"** simulator hvis du vil teste i simulator først

### 4. Kør Appen! 🚀

1. Klik på **▶️ Run** knappen (eller tryk `Cmd+R`)
2. Vent på at appen bygger (første gang kan tage 2-5 minutter)
3. Appen installeres automatisk på din iPhone og åbner

## Hvis du får fejl:

### "No signing certificate found"
- Vælg dit Apple Developer Team under Signing
- Eller opret et "Personal Team" (gratis)

### "Device not trusted"
- På din iPhone: Settings → General → VPN & Device Management
- Find dit developer certifikat og klik "Trust"

### "Build failed"
- Prøv: Product → Clean Build Folder (Shift+Cmd+K)
- Prøv at bygge igen

## Test Native Features:

Når appen kører på din iPhone:

1. **Gå til scan siden**
2. **Test kamera:**
   - Klik "Tag billede"
   - Du skulle se native iOS kamera
   - Tag et billede
3. **Test foto bibliotek:**
   - Klik "Vælg fra bibliotek"
   - Du skulle se native iOS foto picker

## Efter Kode Ændringer:

Når du laver ændringer i Next.js koden:

```bash
cd wino-app
pnpm cap:build
```

Derefter i Xcode:
- Klik ▶️ Run igen

---

**Alt er klar - kør appen nu!** 🎉
