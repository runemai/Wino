#!/bin/bash
# Opdater xcode-select til at bruge Xcode.app

echo "🔧 Opdaterer xcode-select til at bruge Xcode.app..."
echo ""
echo "Du skal indtaste dit Mac password:"
echo ""

sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ xcode-select opdateret!"
    echo ""
    echo "Verificerer..."
    xcodebuild -version
    echo ""
    echo "✅ Alt er klar!"
else
    echo ""
    echo "❌ Fejl ved opdatering. Prøv manuelt:"
    echo "   sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer"
fi
