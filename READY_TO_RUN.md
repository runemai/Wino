# 🚀 Klar til at Køre!

## ✅ Status:

- ✅ Xcode 26.2 er installeret
- ✅ iOS projekt er åbnet i Xcode
- ⚠️ xcode-select skal opdateres (1 kommando)

## 🔧 Sidste Skridt (2 minutter):

### 1. Opdater xcode-select

Kør denne kommando i Terminal (du skal indtaste dit password):

```bash
sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer
```

Eller kør scriptet:

```bash
cd wino-app
./SETUP_XCODE_SELECT.sh
```

### 2. I Xcode (som allerede er åbnet):

1. **Vælg Team:**
   - Klik på **"App"** projektet (venstre sidebar)
   - Vælg **"App"** target
   - Gå til **"Signing & Capabilities"** tab
   - Under **"Signing"**, vælg dit **Apple Developer Team**
   - Hvis du ikke har et: Klik **"Add an Account..."** og log ind med dit Apple ID
   - Eller vælg **"Personal Team"** (gratis, til test)

2. **Vælg iPhone:**
   - I toppen af Xcode, klik på device dropdown
   - Vælg din **iPhone** (skal være tilsluttet via USB)
   - Eller vælg **"iPhone 15 Pro"** simulator

3. **Kør Appen! 🎉**
   - Klik **▶️ Run** knappen (eller `Cmd+R`)
   - Vent på build (første gang: 2-5 minutter)
   - Appen installeres og åbner på din iPhone

## ✨ Test Native Features:

Når appen kører:
- **Kamera knap** → Native iOS kamera
- **Upload knap** → Native foto picker

## 📝 Efter Kode Ændringer:

```bash
pnpm cap:build
```

Derefter kør appen igen i Xcode.

---

**Alt er klar - kør appen nu!** 🚀
