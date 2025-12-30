#!/bin/bash
# Script to create iOS project using Node 22+

set -e

cd "$(dirname "$0")"
PROJECT_ROOT="$(pwd)"
PARENT_DIR="$(dirname "$PROJECT_ROOT")"

# Find or download Node 22
NODE22_PATH=""
if [ -d "$PARENT_DIR/node-v22.11.0-darwin-arm64" ]; then
    NODE22_PATH="$PARENT_DIR/node-v22.11.0-darwin-arm64/bin/node"
elif [ -d "$PARENT_DIR/node-v22"*"-darwin-arm64" ]; then
    NODE22_PATH=$(find "$PARENT_DIR" -name "node-v22*-darwin-arm64" -type d | head -1)/bin/node
fi

if [ -z "$NODE22_PATH" ] || [ ! -f "$NODE22_PATH" ]; then
    echo "Node.js 22+ not found. Please install it first."
    echo "You can download it from: https://nodejs.org/dist/v22.11.0/node-v22.11.0-darwin-arm64.tar.xz"
    exit 1
fi

echo "Using Node.js: $NODE22_PATH"
echo "Version: $($NODE22_PATH --version)"

# Use Node 22 to run Capacitor CLI
export PATH="$(dirname "$NODE22_PATH"):$PATH"

# Add iOS platform
echo "Adding iOS platform..."
"$NODE22_PATH" ./node_modules/.bin/cap add ios || {
    echo "Failed to add iOS platform. Trying alternative method..."
    "$NODE22_PATH" -e "require('@capacitor/cli').run(['add', 'ios'])"
}

# Sync
echo "Syncing Capacitor..."
"$NODE22_PATH" ./node_modules/.bin/cap sync ios

echo "✅ iOS project created! Open it with: pnpm cap:ios"
