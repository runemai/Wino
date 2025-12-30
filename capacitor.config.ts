import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.wino.app',
  appName: 'Wino',
  webDir: 'public',
  
  // ============================================================================
  // SERVER CONFIGURATION
  // ============================================================================
  // Choose ONE of the following options:
  
  // OPTION A: Offline/Standalone Mode (Production - Recommended)
  // When server.url is not set, Capacitor bundles web assets for offline use.
  // Uncomment this section for offline mode:
  // (Currently active - no server.url configured)
  
  // OPTION B: Live Vercel Server (Development/Testing)
  // For testing against the live deployed Vercel app, uncomment below:
  // server: {
  //   url: 'https://wino-six.vercel.app',
  //   cleartext: false, // HTTPS
  // },
  
  // OPTION C: Local Development Server
  // For local development on your network, uncomment below and set your local IP:
  // server: {
  //   url: 'http://192.168.1.31:3000',
  //   cleartext: true, // HTTP for local development
  // },
  
  plugins: {
    Camera: {
      permissions: {
        camera: 'This app needs access to your camera to capture wine labels.',
        photos: 'This app needs access to your photo library to select images.',
      },
    },
    Filesystem: {
      iosIsDocuments: true,
    },
  },
};

export default config;
