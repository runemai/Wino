# Capacitor Workflow Guide

## Hurtig Start

### Første gang setup (allerede gjort ✅):
```bash
pnpm cap:add:ios
```

### Hver gang du opdaterer koden:

**Option 1: Automatisk (anbefalet)**
```bash
pnpm cap:build
```
Dette bygger Next.js, kopierer filer til `public/`, og synkroniserer til iOS.

**Option 2: Manuelt**
```bash
pnpm build:capacitor  # Bygger og kopierer til public/
pnpm cap:sync         # Synkroniserer til iOS projekt
```

### Åbn i Xcode:
```bash
pnpm cap:ios
```

## Build Process Forklaring

1. **`pnpm build:capacitor`**:
   - Bygger Next.js appen med `CAPACITOR=1` environment variable
   - Kopierer static assets fra `.next/static` til `public/_next/static`
   - Sikrer at `public/index.html` eksisterer

2. **`pnpm cap:sync`**:
   - Kopierer alt fra `public/` mappen til `ios/App/App/public/`
   - Opdaterer iOS projektet med de nyeste web assets
   - Opdaterer Capacitor plugins

3. **`pnpm cap:ios`**:
   - Åbner Xcode med iOS projektet

## Development Workflow

### Under udvikling:

1. **Udvikl lokalt** (web):
   ```bash
   pnpm dev
   ```
   Test i browseren først.

2. **Test på iPhone**:
   ```bash
   pnpm cap:build
   pnpm cap:ios
   ```
   Kør i Xcode.

### Når du laver ændringer:

- **React/TypeScript ændringer**: Kør `pnpm cap:build`
- **Styling ændringer**: Kør `pnpm cap:build`
- **Native iOS ændringer**: Åbn direkte i Xcode

## Troubleshooting

### "The web assets directory must contain an index.html"
- Kør `pnpm build:capacitor` først
- Tjek at `public/index.html` eksisterer

### Ændringer vises ikke på iPhone
1. Kør `pnpm cap:build` igen
2. I Xcode: Product → Clean Build Folder (Shift+Cmd+K)
3. Kør appen igen

### Build fejler
- Tjek at Node.js 22+ er tilgængelig
- Prøv at slette `.next` og `public/_next` og byg igen
- Tjek console for specifikke fejl

## Tips

- **Hurtig iteration**: Brug `pnpm dev` for web først, test på iOS når det virker
- **Native features**: Test kamera/foto funktioner kun på rigtig iPhone (ikke simulator)
- **Hot reload**: Next.js hot reload virker ikke i Capacitor - byg igen efter ændringer

## File Structure

```
wino-app/
├── public/              # Web assets for Capacitor (kopieres til iOS)
│   ├── index.html      # Entry point
│   └── _next/          # Next.js static assets
├── .next/              # Next.js build output
├── ios/                # iOS native projekt
│   └── App/
│       └── App/
│           └── public/ # Kopi af public/ (opdateres ved sync)
└── src/                # Next.js source code
```
