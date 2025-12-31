# Fix for dyld Crash in iOS App

## Error
```
#0	0x0000000180bf5864 in dyld4::ExternallyViewableState::triggerNotifications ()
```

## Cause
This is a dynamic linker (dyld) crash, typically caused by:
- Missing or incorrectly linked frameworks
- Swift Package Manager dependencies not resolved
- Corrupted build cache

## Solutions

### Solution 1: Resolve Swift Packages in Xcode
1. **Open Xcode**: `pnpm cap:ios`
2. **Resolve Packages**:
   - File → Packages → Resolve Package Versions
   - Wait for it to complete
3. **Update Packages** (optional):
   - File → Packages → Update to Latest Package Versions
4. **Clean Build**:
   - Product → Clean Build Folder (Shift+⌘+K)
5. **Build again**: ⌘+R

### Solution 2: Reset Derived Data
1. In Xcode: Xcode → Settings → Locations
2. Note the "Derived Data" path
3. Quit Xcode
4. Delete the Derived Data folder:
   ```bash
   rm -rf ~/Library/Developer/Xcode/DerivedData
   ```
5. Reopen Xcode and build again

### Solution 3: Re-add iOS Platform
If the above doesn't work, re-add the iOS platform:
```bash
cd wino-app
rm -rf ios
pnpm cap add ios
pnpm cap sync ios
```

### Solution 4: Check Package.swift Paths
The Package.swift might have incorrect paths. Check:
- File: `ios/App/CapApp-SPM/Package.swift`
- Verify paths to `node_modules` are correct
- If using pnpm, paths might need adjustment

### Solution 5: Verify Xcode Version
- Ensure Xcode 15.0+ is installed
- Check: `xcodebuild -version`
- Update if needed from App Store

## Current Dependencies
- Capacitor: 8.0.0
- Camera Plugin: 8.0.0
- Filesystem Plugin: 8.0.0
- iOS Deployment Target: 15.0

## Debug Steps
1. Check Xcode Console for more detailed error messages
2. Look for framework loading errors
3. Check if Capacitor frameworks are properly linked
4. Verify all Swift packages are resolved (no red warnings in Xcode)

## If Still Failing
Try building with verbose output:
- Product → Scheme → Edit Scheme
- Run → Arguments
- Add: `-v` to launch arguments
- Check console for detailed loading messages

