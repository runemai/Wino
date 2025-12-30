# 🚀 iOS Quick Start Guide

## ✅ Hvad er allerede sat op:

- ✅ Capacitor installeret med Camera og Filesystem plugins
- ✅ iOS projekt oprettet i `ios/` mappen
- ✅ Permissions konfigureret i `Info.plist`
- ✅ AppDelegate opdateret for Capacitor
- ✅ Build scripts klar til brug

## 🎯 Næste Skridt (5 minutter):

### 1. Åbn Xcode Projektet
```bash
cd wino-app
pnpm cap:ios
```

### 2. I Xcode - Tilføj Capabilities

1. Vælg **"App"** projektet i venstre sidebar
2. Vælg **"App"** target (under TARGETS)
3. Gå til **"Signing & Capabilities"** tab
4. Klik **"+ Capability"** og tilføj:
   - ✅ **Camera**
   - ✅ **Photo Library**

### 3. Konfigurer Signing

1. Under **"Signing & Capabilities"**:
   - Vælg dit **Apple Developer Team**
   - Eller **"Personal Team"** for lokal test (gratis)

### 4. Vælg Din iPhone

1. I toppen af Xcode, vælg din **iPhone** fra device dropdown
2. Eller brug **iPhone Simulator** hvis du ikke har en fysisk enhed

### 5. Kør Appen! 🎉

1. Klik på **▶️ Run** knappen (eller tryk `Cmd+R`)
2. Vent på at appen bygger og installeres
3. Appen åbner automatisk på din iPhone

## 📱 Test Native Features

Når appen kører:

1. **Gå til scan siden** (via menu eller direkte URL)
2. **Test kamera**:
   - Klik "Tag billede" knappen
   - Du skulle se native iOS kamera interface
   - Tag et billede af en vinetiket
3. **Test foto bibliotek**:
   - Klik "Vælg fra bibliotek" (hvis upload mode)
   - Du skulle se native iOS foto picker

## 🔄 Opdater Appen Efter Kode Ændringer

Hver gang du laver ændringer i Next.js koden:

```bash
pnpm cap:build
```

Dette:
1. Bygger Next.js appen
2. Kopierer filer til `public/` mappen  
3. Synkroniserer til iOS projektet

Derefter i Xcode:
- Klik **▶️ Run** igen (eller `Cmd+R`)
- Appen opdateres med de nye ændringer

## 🐛 Troubleshooting

### "App installation failed"
- Tjek at du har valgt dit Apple Developer Team
- For første gang: Gå til iPhone Settings → General → VPN & Device Management → Tillid til dit developer certifikat

### "Camera not working"
- Tjek at Camera capability er tilføjet i Xcode
- Tjek at du tester på rigtig iPhone (ikke simulator)
- Gå til iPhone Settings → Privacy → Camera → Tillad Wino

### "Build errors in Xcode"
- Prøv: Product → Clean Build Folder (Shift+Cmd+K)
- Prøv: File → Close Project, og åbn igen
- Tjek at alle capabilities er tilføjet korrekt

### "Changes not showing"
- Kør `pnpm cap:build` igen
- I Xcode: Product → Clean Build Folder
- Kør appen igen

## 📚 Mere Information

- Se `CAPACITOR_WORKFLOW.md` for detaljeret workflow
- Se `XCODE_SETUP_COMPLETE.md` for setup detaljer
- Se `IOS_SETUP.md` for komplet setup guide

## ✨ Tips

- **Hurtig udvikling**: Brug `pnpm dev` for web først, test på iOS når det virker
- **Native features**: Test kun på rigtig iPhone (simulator har begrænset kamera support)
- **Hot reload**: Virker ikke i Capacitor - byg igen efter ændringer

---

**Klar til at køre!** 🎉 Åbn Xcode og tryk Run!
