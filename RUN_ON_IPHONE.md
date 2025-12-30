# 🚀 Kør Appen på Din iPhone

## ✅ Telefonen er parret!

Nu kan du køre appen på din iPhone.

## Sidste Skridt (2 minutter):

### 1. Vælg Din iPhone i Xcode

1. **I Xcode, øverst til venstre:**
   - Klik på device dropdown (siger måske "Any iOS Device" eller simulator navn)
   - Vælg din **iPhone** (ikke simulator)
   - Din iPhone skulle nu være synlig og klar

### 2. Kør Appen! 🎉

1. **Klik på ▶️ Run knappen** (eller tryk `Cmd+R`)
2. **Vent på build** (første gang kan tage 2-5 minutter)
3. **På din iPhone:**
   - Du skulle se: **"Untrusted Developer"** besked
   - Gå til **Settings → General → VPN & Device Management**
   - Find dit developer certifikat (fx "89753MX28L" eller dit navn)
   - Klik på det
   - Klik **"Trust"**
   - Klik **"Trust"** igen for at bekræfte

4. **Appen installeres og åbner automatisk!**

## Test Native Features:

Når appen kører på din iPhone:

1. **Gå til scan siden** (via menu eller direkte)
2. **Test kamera:**
   - Klik **"Tag billede"** knappen
   - Du skulle se **native iOS kamera interface**
   - Tag et billede af en vinetiket
   - Billedet bliver automatisk analyseret

3. **Test foto bibliotek:**
   - Klik **"Vælg fra bibliotek"** (hvis upload mode)
   - Du skulle se **native iOS foto picker**
   - Vælg et billede

## Hvis Appen Ikke Åbner:

1. **På din iPhone:**
   - Find **Wino** app ikonet på home screen
   - Tryk på det for at åbne

2. **Hvis der er "Untrusted Developer" fejl:**
   - Gå til Settings → General → VPN & Device Management
   - Trust dit developer certifikat

## Efter Kode Ændringer:

Når du laver ændringer i Next.js koden:

```bash
cd wino-app
pnpm cap:build
```

Derefter i Xcode:
- Klik ▶️ Run igen
- Appen opdateres med de nye ændringer

## Troubleshooting:

### "App installation failed"
- Tjek at du har trusted developer certifikatet på iPhone
- Settings → General → VPN & Device Management → Trust

### "Build failed"
- Prøv: Product → Clean Build Folder (Shift+Cmd+K)
- Prøv at bygge igen

### "Device not connected"
- Tjek USB kabel
- Tjek at iPhone er ulåst
- Prøv at genindsætte kablet

---

**Alt er klar - kør appen nu!** 🎉
