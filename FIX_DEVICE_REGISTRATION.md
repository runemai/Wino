# 🔧 Fix Device Registration

## Problem:
"Your team has no devices from which to generate a provisioning profile"

## Løsning (2 metoder):

### Metode 1: Automatisk (Nemmere) ✅

1. **Tilslut din iPhone** til Mac via USB
2. **I Xcode:**
   - Vælg din iPhone fra device dropdown (øverst)
   - Xcode vil automatisk registrere din iPhone
   - Vent et øjeblik - Xcode håndterer det automatisk

3. **Hvis det ikke virker automatisk:**
   - Gå til **Window → Devices and Simulators** (Shift+Cmd+2)
   - Tjek at din iPhone vises
   - Hvis den vises: Xcode registrerer den automatisk

### Metode 2: Manuel (Hvis automatisk ikke virker)

1. **Find din iPhone's UDID:**
   - Tilslut iPhone til Mac
   - Åbn **Finder**
   - Klik på din iPhone i sidebar
   - Klik på **"Serial Number"** - det skifter til **"Identifier (UDID)"**
   - Kopier UDID'en (Cmd+C)

2. **Tilføj Device i Apple Developer Portal:**
   - Gå til: https://developer.apple.com/account/resources/devices/list
   - Klik **"+"** for at tilføje ny device
   - Indtast:
     - **Name:** Din iPhone navn (fx "Rune's iPhone")
     - **UDID:** Indsæt UDID'en du kopierede
   - Klik **"Continue"** og **"Register"**

3. **I Xcode:**
   - Gå til **Signing & Capabilities**
   - Klik **"Try Again"** eller refresh
   - Xcode vil nu kunne generere provisioning profile

## Quick Fix (Prøv først):

1. **Tilslut iPhone** til Mac
2. **I Xcode:**
   - Vælg din iPhone fra device dropdown
   - Vent 10-20 sekunder
   - Xcode registrerer automatisk

3. **Hvis det stadig fejler:**
   - Gå til **Product → Clean Build Folder** (Shift+Cmd+K)
   - Prøv at bygge igen

## Alternativ: Brug Simulator

Hvis du vil teste først uden fysisk device:

1. I Xcode, vælg **"iPhone 15 Pro"** simulator
2. Klik Run (▶️)
3. **Note:** Simulator har begrænset kamera support

---

**Prøv Metode 1 først - det er oftest automatisk!** ✅
