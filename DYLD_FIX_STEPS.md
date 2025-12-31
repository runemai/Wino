# Fix dyld Crash - Step by Step

## Error
```
0x180bf5864 in dyld4::ExternallyViewableState::triggerNotifications
```

## Immediate Fix (Do This in Xcode)

### Step 1: Resolve Swift Packages
1. **Open Xcode** (`pnpm cap:ios`)
2. **Wait for Xcode to fully load**
3. **Go to**: File → Packages
4. **Click**: "Resolve Package Versions"
   - Wait for completion (may take 2-3 minutes)
   - Watch for any errors in the status bar

### Step 2: Verify Package Resolution
1. In Project Navigator, expand "Package Dependencies"
2. Verify you see:
   - `capacitor-swift-pm` (from GitHub)
   - `CapApp-SPM` (local package)
3. If any show errors, right-click → "Reset Package Caches"

### Step 3: Clean Everything
1. **Product → Clean Build Folder** (Shift+⌘+K)
2. **Close Xcode completely**
3. **Reopen**: `pnpm cap:ios`
4. **Wait** for Xcode to re-index

### Step 4: Build
1. Select a simulator (iPhone 15 Pro recommended)
2. **Product → Run** (⌘+R)
3. Watch Console for errors

## If Still Crashing

### Alternative: Check Console Logs
In Xcode Console (View → Debug Area → Activate Console):
- Look for messages like "Library not loaded"
- Check for missing framework errors
- Note any specific framework names

### Nuclear Option: Re-add iOS Platform
```bash
cd wino-app
rm -rf ios
pnpm cap add ios
# Wait for it to complete
pnpm cap sync ios
pnpm cap:ios
```

Then in Xcode:
- File → Packages → Resolve Package Versions
- Clean Build Folder
- Build

## Common Issues

### Xcode Version
You're on Xcode 26.2 (beta). Consider:
- Using stable Xcode 15.x if available
- Or ensure all packages are compatible with Xcode 16 beta

### Swift Package Paths
If using pnpm, paths in Package.swift might need adjustment for your setup.

