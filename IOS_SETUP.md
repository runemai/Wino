# iOS Setup Guide for Wino

This guide will help you set up the Wino app to run natively on iOS with full camera, file system, and photo library support.

## Prerequisites

1. **macOS** - iOS development requires macOS
2. **Xcode** - Install from the Mac App Store (version 14.0 or later)
3. **Node.js 22+** - Required for Capacitor CLI (or use the local Node.js in the project)
4. **CocoaPods** - Install with `sudo gem install cocoapods`

## Step 1: Build the Next.js App for Capacitor

First, build your Next.js app with static export enabled:

```bash
cd wino-app
pnpm build:capacitor
```

This creates an `out` directory with the static files that Capacitor will use.

## Step 2: Initialize iOS Project

If you haven't already, add the iOS platform:

```bash
# Make sure you're using Node 22+ or use npx with the local node
pnpm cap:add:ios
```

This will create an `ios` directory in your project root.

## Step 3: Configure iOS Project

1. Open the iOS project in Xcode:

```bash
pnpm cap:ios
```

2. In Xcode, configure the following:

   - **Signing & Capabilities**: 
     - Select your development team
     - Enable "Camera" capability
     - Enable "Photo Library" capability
   
   - **Info.plist** (or in Xcode's Info tab):
     Add the following permissions descriptions:
     - `NSCameraUsageDescription`: "This app needs access to your camera to capture wine labels."
     - `NSPhotoLibraryUsageDescription`: "This app needs access to your photo library to select images."
     - `NSPhotoLibraryAddUsageDescription`: "This app needs to save images to your photo library."

## Step 4: Install iOS Dependencies

Navigate to the iOS directory and install CocoaPods dependencies:

```bash
cd ios/App
pod install
cd ../..
```

## Step 5: Sync Capacitor

After making any changes to your web app, sync them to iOS:

```bash
pnpm build:capacitor
pnpm cap:sync
```

This updates the iOS project with your latest web build.

## Step 6: Run on Device or Simulator

1. Open Xcode:
   ```bash
   pnpm cap:ios
   ```

2. Select your target device (iPhone simulator or connected device)

3. Click the Run button (▶️) or press `Cmd+R`

## Development Workflow

1. **Make changes to your Next.js app**
2. **Rebuild for Capacitor**:
   ```bash
   pnpm build:capacitor
   ```
3. **Sync to iOS**:
   ```bash
   pnpm cap:sync
   ```
4. **Test in Xcode** or on your device

## Native Features Available

Once running on iOS, the app will automatically use:

- ✅ **Native Camera** - Full access to iPhone camera with proper permissions
- ✅ **Photo Library** - Access to select images from your photo library
- ✅ **File System** - Native file system access for saving/loading images
- ✅ **Native UI** - Better performance and native feel

## Troubleshooting

### "Capacitor CLI requires NodeJS >=22.0.0"

If you see this error, you can:
1. Install Node.js 22+ globally, or
2. Use the local Node.js installation in the project root
3. Or manually create the iOS project structure (already done if you see `ios/` directory)

### Camera not working

1. Check that camera permissions are granted in iOS Settings
2. Verify `NSCameraUsageDescription` is set in Info.plist
3. Make sure you're testing on a real device (simulator camera support is limited)

### Build errors

1. Clean build folder in Xcode: `Product > Clean Build Folder` (Shift+Cmd+K)
2. Delete `ios/App/Pods` and re-run `pod install`
3. Make sure CocoaPods is up to date: `sudo gem update cocoapods`

### Sync issues

If `cap sync` doesn't work:
1. Manually copy the `out` directory to `ios/App/App/public/`
2. Or rebuild and try again

## Next Steps

- Configure app icons and splash screens
- Set up App Store Connect for distribution
- Configure push notifications (if needed)
- Set up analytics and crash reporting

## Additional Resources

- [Capacitor iOS Documentation](https://capacitorjs.com/docs/ios)
- [Capacitor Camera Plugin](https://capacitorjs.com/docs/apis/camera)
- [Capacitor Filesystem Plugin](https://capacitorjs.com/docs/apis/filesystem)
