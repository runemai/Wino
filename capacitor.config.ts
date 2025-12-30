import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.wino.app',
  appName: 'Wino',
  webDir: 'public',
  // Note: server.url is removed for production builds
  // When server.url is not set, Capacitor will use the bundled web assets (offline mode)
  // For development, you can temporarily uncomment and set your local IP:
  // server: {
  //   url: 'http://192.168.1.31:3000',
  //   cleartext: true,
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
