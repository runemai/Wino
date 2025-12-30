## Wino – mobilvenlig vinsamling drevet af AI

En Next.js 14-app der gør det muligt at scanne vinetiketter, få metadata ud via AI og gemme vine i Supabase.

## Forudsætninger

- Node.js 20.x (projektet inkluderer en lokal bin i `../node-v20.12.2-darwin-x64`; tilføj dens `bin` til din `PATH` eller installer globalt).
- pnpm (anbefalet) eller anden npm-klient.
- Supabase-projekt + OpenAI API-nøgle.

## Opsætning

1. Kopiér `.env.local.example` til `.env.local` og udfyld variablerne.
2. Kør Supabase-scripts (kræver [Supabase CLI](https://supabase.com/docs/guides/cli/installation)):

   ```bash
   supabase db execute --file supabase/schema.sql
   supabase db execute --file supabase/storage-policies.sql
   ```

   Alternativt kan du åbne SQL-editoren i Supabase og køre indholdet manuelt.

3. I Supabase Console:
   - Aktiver storage-bucketten `wine-labels` (gøres af scriptet ovenfor, men verificér at den er public).
   - Sørg for at `wines`-tabellen eksisterer og RLS-politikkerne er slået til.
4. Installer afhængigheder:

   ```bash
   pnpm install
   ```

5. Start udviklingsserveren:

   ```bash
   pnpm dev
   ```

   Appen kører nu på [http://localhost:3000](http://localhost:3000).

## Udviklingstips

- Forsiden henter vine via Supabase; hvis API-fejl opstår, vises smukke demo-data, så UI altid er befolket.
- Kamera-flowet på `/capture` bruger `MediaDevices.getUserMedia`. På desktop uden kamera kan du uploade billeder.
- AI-udlæsning foregår via `/api/extract-wine`, som kræver en gyldig `OPENAI_API_KEY`.

## Deployment

### Vercel Deployment (Web)

Projektet kan deployes til Vercel med automatisk CI/CD via GitHub:

1. **Opret Vercel konto:**
   - Gå til [vercel.com](https://vercel.com) og opret en konto (eller login)
   - Forbind din GitHub konto til Vercel

2. **Import projekt:**
   - Klik på "Add New Project" i Vercel Dashboard
   - Vælg GitHub repository (eller push koden til GitHub først)
   - Vercel vil automatisk detektere Next.js

3. **Konfigurer miljøvariabler:**
   I Vercel Dashboard → Project Settings → Environment Variables, tilføj:
   
   - `NEXT_PUBLIC_SUPABASE_URL` (tilgængelig for alle environments)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (tilgængelig for alle environments)
   - `SUPABASE_SERVICE_ROLE_KEY` (kun Production, Preview, Development)
   - `SUPABASE_STORAGE_BUCKET` (kun Production, Preview, Development)
   - `OPENAI_API_KEY` (kun Production, Preview, Development)

4. **Deploy:**
   - Klik "Deploy" - Vercel vil automatisk deploye ved hver push til main branch
   - Din app vil være tilgængelig på `https://your-project.vercel.app`

**Vercel Build Settings (automatisk detekteret):**
- Build Command: `pnpm build`
- Output Directory: `.next`
- Install Command: `pnpm install`

### iOS App Deployment

iOS appen kan køre i to modi:

**1. Standalone/Offline Mode (Anbefalet):**
- I production build bruges de bundled web assets (ingen `server.url` i `capacitor.config.ts`)
- Appen kører offline og bruger kun internet til API kald (Supabase, OpenAI)
- Build med: `pnpm cap:build`
- Deploy via Xcode → App Store eller TestFlight

**2. Live Server Mode (Development):**
- Sæt `server.url` i `capacitor.config.ts` til Vercel URL eller localhost
- Appen loader web appen fra serveren (kræver internet)
- Nyttigt til udvikling og test

**Production iOS Build Workflow:**
```bash
# 1. Build Next.js app for Capacitor
pnpm cap:build

# 2. Synkroniser til iOS projekt
pnpm cap:sync

# 3. Åbn i Xcode og build
pnpm cap:ios

# 4. I Xcode: Product → Archive → Upload to App Store/TestFlight
```

**Noter:**
- I production mode (uden `server.url`) er appen standalone og kan køre offline
- Miljøvariabler (`NEXT_PUBLIC_*`) er bundlet ind i build, så Supabase URL skal være korrekt
- Server-side API keys (SUPABASE_SERVICE_ROLE_KEY, OPENAI_API_KEY) kører kun på Vercel server, ikke i iOS appen

## Scripts

- `pnpm dev` – udviklingsserver
- `pnpm build` – produktionsbuild
- `pnpm build:capacitor` – byg for Capacitor (iOS/Android)
- `pnpm cap:build` – byg og synkroniser til iOS (hurtig kommando)
- `pnpm cap:sync` – synkroniser web assets til iOS projekt
- `pnpm cap:ios` – åbn iOS projekt i Xcode
- `pnpm lint` – ESLint via Next.js

## iOS Native App

Appen kan køres som native iOS app med fuld kamera og fotobibliotek support!

**Hurtig start:**
1. Se `IOS_QUICK_START.md` for 5-minutters guide
2. Eller se `IOS_SETUP.md` for komplet setup

**Workflow:**
- `pnpm cap:build` – byg og synkroniser efter kode ændringer
- `pnpm cap:ios` – åbn i Xcode og kør på iPhone

Se `CAPACITOR_WORKFLOW.md` for detaljeret workflow guide.
