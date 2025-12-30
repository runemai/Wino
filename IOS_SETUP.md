# iOS App Setup Guide

## Hurtig Start

Din Wino app er nu deployet på Vercel og klar til at blive brugt i iOS appen.

### App URL
- **Production URL:** https://wino-six.vercel.app

## To Måder at Køre iOS Appen

### 1. Offline/Standalone Mode (Anbefalet til Production)

Appen bundler web assets og virker offline:

```bash
cd wino-app
pnpm cap:build
pnpm cap:ios
```

**I `capacitor.config.ts`:**
- ✅ `server.url` er IKKE sat (standard konfiguration)
- Appen bruger bundled assets fra `public/` mappen

### 2. Live Server Mode (Til Testing)

For at teste mod live Vercel server:

**I `capacitor.config.ts`, uncomment denne sektion:**
```typescript
server: {
  url: 'https://wino-six.vercel.app',
  cleartext: false,
},
```

Derefter:
```bash
cd wino-app
pnpm cap:sync
pnpm cap:ios
```

**⚠️ Vigtigt:** Kommenter `server.url` ud igen før production build!

## Build Process

1. **Build web assets:**
   ```bash
   pnpm build
   ```

2. **Synkroniser med Capacitor:**
   ```bash
   pnpm cap:sync
   ```

3. **Åbn i Xcode:**
   ```bash
   pnpm cap:ios
   ```

4. **I Xcode:**
   - Vælg en simulator eller device
   - Klik på "Run" knappen (⌘R)
   - Appen vil åbne og køre

## Troubleshooting

### App kan ikke connecte til Supabase
- Tjek at miljøvariablerne (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) er sat korrekt i din `.env.local`
- I standalone mode skal disse være bundlet i build

### App viser hvid skærm
- Tjek at build var succesfuld: `pnpm build`
- Verificer at `public/` mappen indeholder web assets
- Prøv at synkronisere igen: `pnpm cap:sync`

### Camera permissions
- I Xcode: Projekt → Target → Info → Tjek at camera permissions er tilføjet
- På device: Settings → Wino → Tillad kamera adgang

## Næste Steps

- [ ] Test appen i simulator
- [ ] Test appen på fysisk device
- [ ] Konfigurer App Store metadata (hvis du vil udgive)
- [ ] Setup Code Signing i Xcode
