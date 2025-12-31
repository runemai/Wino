# Quick Fix for iOS App Crash

## Problem
dyld crash: `ExternallyViewableState::triggerNotifications`

## Quick Fix (5 min)

### Step 1: I Xcode
1. **Åbn Xcode**: `pnpm cap:ios` (hvis ikke allerede åbent)
2. **Resolve Packages**:
   - **File → Packages → Resolve Package Versions**
   - Vent til det er færdigt (kan tage 1-2 minutter)
3. **Clean Build**:
   - **Product → Clean Build Folder** (Shift+⌘+K)
4. **Build**:
   - **Product → Run** (⌘+R)

### Step 2: Hvis det stadig fejler
Luk Xcode og kør i terminal:
```bash
cd "/Users/runemai/Documents/Tech projects/Wino/wino-app"
rm -rf ~/Library/Developer/Xcode/DerivedData/*
pnpm cap:sync
```

Derefter i Xcode igen:
- File → Packages → Resolve Package Versions
- Product → Clean Build Folder
- Build (⌘+R)

## Why This Happens
- Swift Package Manager dependencies ikke resolved
- Xcode build cache er korrupt
- Frameworks ikke korrekt linked

## Expected Result
Appen starter og viser loading screen, derefter web app fra https://wino-six.vercel.app

