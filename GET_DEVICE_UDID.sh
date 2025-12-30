#!/bin/bash
# Hjælp til at finde iPhone UDID

echo "📱 Find din iPhone UDID:"
echo ""
echo "Metode 1 (Nemmere):"
echo "1. Tilslut iPhone til Mac"
echo "2. Åbn Finder"
echo "3. Klik på din iPhone i sidebar"
echo "4. Klik på 'Serial Number' - det skifter til 'Identifier (UDID)'"
echo "5. Kopier UDID'en (Cmd+C)"
echo ""
echo "Metode 2 (Terminal):"
echo "Kør: system_profiler SPUSBDataType | grep -A 11 iPhone"
echo ""

# Prøv at finde tilsluttet iPhone
if system_profiler SPUSBDataType 2>/dev/null | grep -q "iPhone"; then
    echo "✅ iPhone fundet! Finder UDID..."
    echo ""
    system_profiler SPUSBDataType | grep -A 11 "iPhone" | grep "Serial Number" | head -1
    echo ""
    echo "Hvis du ikke kan se UDID, brug Metode 1 (Finder)"
else
    echo "❌ Ingen iPhone tilsluttet"
    echo ""
    echo "Tilslut din iPhone og prøv igen"
fi

echo ""
echo "Når du har UDID, tilføj den her:"
echo "https://developer.apple.com/account/resources/devices/list"
