#!/bin/bash
# Quick guide til Xcode installation

echo "🍎 Xcode Installation Guide"
echo ""
echo "Xcode er påkrævet for iOS udvikling."
echo ""
echo "📥 Download Xcode:"
echo "   1. Åbn App Store"
echo "   2. Søg efter 'Xcode'"
echo "   3. Klik 'Hent' (gratis, men ~15 GB)"
echo ""
echo "⏱️  Download tager typisk 30-60 minutter"
echo ""
echo "✅ Efter installation:"
echo "   1. Åbn Xcode første gang"
echo "   2. Accepter licensaftalen"
echo "   3. Vent på at Command Line Tools installeres"
echo ""
echo "🧪 Test installation:"
echo "   xcodebuild -version"
echo ""
echo "🚀 Når Xcode er installeret, kør:"
echo "   cd wino-app"
echo "   pnpm cap:ios"
echo ""

# Tjek om Xcode allerede er installeret
if command -v xcodebuild &> /dev/null; then
    echo "✅ Xcode ser ud til at være installeret!"
    xcodebuild -version
else
    echo "❌ Xcode er ikke installeret endnu."
    echo ""
    echo "Åbner App Store..."
    open "macappstore://apps.apple.com/app/xcode/id497799835"
fi
