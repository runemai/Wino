#!/bin/bash
# Quick fix for black screen - use Next.js dev server

echo "🔧 Fix Sort Skærm - Brug Next.js Dev Server"
echo ""

# Find Mac IP address
MAC_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1)

if [ -z "$MAC_IP" ]; then
    echo "❌ Kunne ikke finde Mac IP adresse"
    echo "   Tjek at du er på samme WiFi som iPhone"
    exit 1
fi

echo "📱 Mac IP: $MAC_IP"
echo ""

# Update capacitor config
echo "Opdaterer capacitor.config.ts..."
cat > capacitor.config.ts << EOF
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.wino.app',
  appName: 'Wino',
  webDir: 'public',
  server: {
    url: 'http://$MAC_IP:3000',
    cleartext: true,
  },
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
EOF

echo "✅ Config opdateret"
echo ""
echo "Næste skridt:"
echo "1. Start Next.js server:"
echo "   pnpm dev"
echo ""
echo "2. I anden terminal, synkroniser:"
echo "   pnpm cap:sync"
echo ""
echo "3. I Xcode, kør appen igen (Cmd+R)"
echo ""
echo "⚠️  Vigtigt:"
echo "   - Mac og iPhone skal være på samme WiFi"
echo "   - Next.js server skal køre (pnpm dev)"
echo "   - Firewall skal tillade port 3000"

