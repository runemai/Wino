# Fixes Applied

## Problem 1: `public/_next` Folder Conflict ✅ FIXED

### Issue:
```
Error: You can not have a '_next' folder inside of your public folder. 
This conflicts with the internal '/_next' route.
```

### Root Cause:
The Capacitor build script (`scripts/build-for-capacitor.js`) was copying static assets from `.next/static` to `public/_next/static`, which conflicts with Next.js's internal `/_next` route.

### Solution:
1. **Removed `public/_next` folder** from repository
2. **Updated `.gitignore`** to ignore `public/_next/` (should only exist locally for Capacitor builds)
3. **Updated build script** to:
   - Clean up `public/_next` before building (if it exists)
   - Only create it during Capacitor builds (not regular Next.js builds)
   - Added warning message that it should not be committed

### Files Changed:
- `.gitignore` - Added `public/_next/` to ignore list
- `scripts/build-for-capacitor.js` - Added cleanup and improved logging

### Verification:
- ✅ Regular Next.js build (`pnpm build`) works without errors
- ✅ `public/_next` is removed and won't conflict
- ✅ Capacitor build script will recreate it only when needed

### Notes:
- The `public/_next` folder is **only for Capacitor builds** and should **never be committed** to git
- When building for web (Vercel), Next.js handles static assets internally via the `/.next` route
- When building for Capacitor (iOS/Android), we need the assets in `public/_next/static` for the bundled app

## Status
All build issues resolved. Both web and iOS builds should work correctly now.

