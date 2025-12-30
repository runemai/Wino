# 🔧 Fix: Parring Hænger

## Problem:
Parring hænger i Xcode, og der er ikke noget på telefonen at gøre.

## Løsning (Prøv i rækkefølge):

### 1. Stop og Genstart Parring

1. **I Xcode:**
   - Gå til **Window → Devices and Simulators** (Shift+Cmd+2)
   - Klik på din iPhone
   - Hvis der er en "Cancel" knap - klik den
   - Luk Devices and Simulators vinduet

2. **Fjern og Genindsæt iPhone:**
   - Træk USB kablet ud
   - Vent 5 sekunder
   - Sæt det i igen

3. **På iPhone:**
   - Lås og lås op for iPhone (tryk power knap)
   - Tjek om der er nye popups

4. **I Xcode igen:**
   - Åbn **Window → Devices and Simulators** igen
   - Klik på din iPhone
   - Prøv "Use for Development" igen

### 2. Genstart Xcode

1. **Luk Xcode helt** (Cmd+Q)
2. **Genstart Xcode**
3. **Åbn projektet igen**
4. Prøv parring igen

### 3. Prøv Andet USB Kabel/Port

- **Prøv andet USB kabel** (nogle kabler er kun til opladning)
- **Prøv anden USB port** på Mac
- **Prøv USB-C hub** hvis du bruger en

### 4. Tjek iPhone Status

1. **På iPhone:**
   - Gå til **Settings → General → About**
   - Tjek at iPhone ikke er i "Restricted Mode"
   - Gå til **Settings → Screen Time → Content & Privacy Restrictions**
   - Tjek at der ikke er restriktioner

2. **Genstart iPhone:**
   - Hold power knap + volume down (eller power knap alene på ældre modeller)
   - Sluk iPhone
   - Tænd den igen
   - Prøv parring igen

### 5. Alternativ: Brug Simulator (Workaround)

Hvis parring stadig ikke virker, kan du teste i simulator:

1. **I Xcode:**
   - Vælg **"iPhone 15 Pro"** eller anden simulator fra device dropdown
   - Klik Run (▶️)
   - **Note:** Simulator har begrænset kamera support, men resten af appen virker

2. **For rigtig kamera test senere:**
   - Du kan altid prøve at parre iPhone igen senere
   - Eller brug en anden Mac/computer

### 6. Reset Pairing (Avanceret)

Hvis intet virker:

1. **Fjern iPhone fra Xcode:**
   - Window → Devices and Simulators
   - Højreklik på din iPhone
   - Vælg "Unpair" eller "Remove"

2. **Reset på iPhone:**
   - Settings → General → Reset → Reset Location & Privacy
   - (Dette nulstiller trust settings)

3. **Start forfra:**
   - Tilslut iPhone igen
   - Trust på iPhone
   - Trust i Finder
   - Prøv parring i Xcode igen

## Quick Fix (Prøv Først):

```bash
# Genstart Xcode
killall Xcode
# Åbn projektet igen
open ios/App/App.xcodeproj
```

Derefter i Xcode:
- Window → Devices and Simulators
- Fjern iPhone (hvis den er der)
- Tilslut iPhone igen
- Prøv "Use for Development"

---

**Tip:** Hvis parring stadig hænger, brug simulator til at teste appen, og prøv at parre iPhone senere.
