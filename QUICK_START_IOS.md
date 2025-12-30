# Quick Start: iOS Native App

## What's Been Set Up

✅ Capacitor installed with Camera and Filesystem plugins  
✅ Native camera hook created (`use-native-camera.ts`)  
✅ Scan experience updated to use native APIs on iOS  
✅ Capacitor configuration file created  
✅ Next.js configured for static export  

## Quick Commands

```bash
# Build for iOS
pnpm build:capacitor

# Sync to iOS project
pnpm cap:sync

# Open in Xcode
pnpm cap:ios
```

## How It Works

When the app runs on iOS:
- **Camera mode**: Uses native iOS camera instead of web camera API
- **Upload mode**: Uses native photo library picker instead of file input
- **File system**: Full access to iOS file system for saving images

The app automatically detects if it's running on a native platform and uses the appropriate APIs.

## Next Steps

1. **Build the app**: `pnpm build:capacitor`
2. **Add iOS platform** (if not done): `pnpm cap:add:ios`
3. **Configure permissions** in Xcode (see IOS_SETUP.md)
4. **Run on device**: `pnpm cap:ios` then click Run in Xcode

See `IOS_SETUP.md` for detailed instructions.
