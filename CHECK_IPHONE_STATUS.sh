#!/bin/bash
# Tjek iPhone status

echo "📱 Tjekker iPhone status..."
echo ""

# Tjek om iPhone er tilsluttet
if system_profiler SPUSBDataType 2>/dev/null | grep -q "iPhone"; then
    echo "✅ iPhone er tilsluttet via USB"
    echo ""
    
    # Prøv at finde iPhone info
    echo "iPhone Information:"
    system_profiler SPUSBDataType | grep -A 15 "iPhone" | head -10
    echo ""
else
    echo "❌ Ingen iPhone tilsluttet"
    echo ""
    echo "Tilslut din iPhone via USB og prøv igen"
    exit 1
fi

echo "📋 Næste skridt:"
echo ""
echo "1. På iPhone:"
echo "   - Tjek om der er 'Trust This Computer?' popup"
echo "   - Klik 'Trust'"
echo ""
echo "2. I Finder:"
echo "   - Klik på din iPhone i sidebar"
echo "   - Klik 'Trust' hvis det vises"
echo ""
echo "3. I Xcode:"
echo "   - Window → Devices and Simulators (Shift+Cmd+2)"
echo "   - Klik 'Use for Development'"
echo ""
