# 🔧 Fix: iPhone "Not Installed / Paired"

## Problem:
Din iPhone vises som "not installed / paired" i Xcode.

## Løsning (3 trin):

### 1. Trust Computer på iPhone

1. **Tilslut iPhone til Mac** via USB
2. **På din iPhone:**
   - Du skulle se en popup: **"Trust This Computer?"**
   - Klik **"Trust"**
   - Indtast din iPhone **passcode** hvis bedt om det

3. **Hvis popup ikke vises:**
   - Gå til **Settings → General → VPN & Device Management**
   - Tjek om din Mac vises der

### 2. Trust iPhone på Mac

1. **På din Mac:**
   - Åbn **Finder**
   - Klik på din **iPhone** i sidebar
   - Hvis der står "Trust" - klik på det
   - Indtast din Mac password hvis bedt om det

### 3. I Xcode

1. **Åbn Xcode** (hvis ikke allerede åbent)
2. Gå til **Window → Devices and Simulators** (Shift+Cmd+2)
3. **Tjek din iPhone:**
   - Den skulle nu vise status
   - Hvis den stadig siger "not paired":
     - Klik på din iPhone
     - Klik **"Use for Development"** knappen
     - Vent på at parring gennemføres

4. **I Xcode projektet:**
   - Vælg din iPhone fra device dropdown (øverst)
   - Vent 10-20 sekunder
   - Prøv at bygge igen

## Troubleshooting:

### "iPhone is locked"
- **Lås op for din iPhone** (skærmen skal være tændt og ulåst)

### "Could not find Developer Disk Image"
- Din iPhone iOS version er nyere end Xcode version
- Opdater Xcode til nyeste version
- Eller brug en ældre iPhone/iOS version

### "Device is busy"
- **Afbryd andre processer** der bruger iPhone (fx iTunes, Photos)
- **Genstart Xcode**
- Prøv igen

### "Could not connect to device"
- **Prøv andet USB kabel** (nogle kabler er kun til opladning)
- **Prøv anden USB port** på Mac
- **Genstart både iPhone og Mac**

## Quick Checklist:

- ✅ iPhone er tilsluttet via USB
- ✅ iPhone er ulåst (skærm tændt)
- ✅ "Trust This Computer" er accepteret på iPhone
- ✅ iPhone er trusted i Finder på Mac
- ✅ Xcode → Window → Devices and Simulators viser iPhone
- ✅ "Use for Development" er klikket

---

**Efter parring, skulle din iPhone være klar til at køre appen!** ✅
