# Deployment Guide

Denne guide beskriver hvordan du deployer Wino appen til Vercel og konfigurerer både web og iOS app.

## Forudsætninger

- GitHub repository med koden (allerede oprettet)
- Vercel konto (gratis tier er tilstrækkelig)
- Supabase projekt med database og storage bucket konfigureret
- OpenAI API key

## Trin 1: Push kode til GitHub

Først skal koden push'es til GitHub:

```bash
cd wino-app
git add .
git commit -m "Initial commit: Ready for deployment"
git remote add origin <DIT_GITHUB_REPO_URL>
git push -u origin main
```

Hvis du allerede har et repository:
```bash
git remote add origin <DIT_GITHUB_REPO_URL>
git branch -M main
git push -u origin main
```

## Trin 2: Opret Vercel Projekt

1. **Gå til Vercel:**
   - Besøg [vercel.com](https://vercel.com)
   - Log ind (eller opret konto) med GitHub

2. **Import projekt:**
   - Klik på "Add New..." → "Project"
   - Vælg dit GitHub repository
   - Vercel vil automatisk detektere Next.js

3. **Konfigurer projekt:**
   - **Project Name:** `wino` (eller dit valg)
   - **Framework Preset:** Next.js (automatisk detekteret)
   - **Root Directory:** `./wino-app` (hvis repo roden er `/Users/runemai/Documents/Tech projects/Wino`, ellers `.`)
   - **Build Command:** `pnpm build` (automatisk)
   - **Output Directory:** `.next` (automatisk)
   - **Install Command:** `pnpm install` (automatisk)

4. **Klik "Deploy"** (ikke endnu - vi skal tilføje miljøvariabler først!)

## Trin 3: Konfigurer Miljøvariabler i Vercel

**FØR du klikker Deploy, skal du tilføje miljøvariabler:**

1. **I Vercel project setup, scroll ned til "Environment Variables"**

2. **Tilføj følgende variabler:**

   **For Production, Preview, og Development:**
   ```
   NEXT_PUBLIC_SUPABASE_URL = <din_supabase_url>
   NEXT_PUBLIC_SUPABASE_ANON_KEY = <din_supabase_anon_key>
   ```

   **Kun for Production, Preview, og Development (IKKE exposed til browser):**
   ```
   SUPABASE_SERVICE_ROLE_KEY = <din_service_role_key>
   SUPABASE_STORAGE_BUCKET = wine-labels
   OPENAI_API_KEY = <din_openai_api_key>
   ```

3. **Hvor finder jeg disse værdier?**
   - **Supabase URL & Keys:** 
     - Gå til [Supabase Dashboard](https://supabase.com/dashboard)
     - Vælg dit projekt → Settings → API
     - `NEXT_PUBLIC_SUPABASE_URL` = Project URL
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = anon/public key
     - `SUPABASE_SERVICE_ROLE_KEY` = service_role key (⚠️ Hold dette hemmeligt!)
   
   - **Supabase Storage Bucket:**
     - Gå til Storage i Supabase Dashboard
     - Tjek bucket navnet (typisk `wine-labels`)
   
   - **OpenAI API Key:**
     - Gå til [OpenAI Platform](https://platform.openai.com/api-keys)
     - Opret eller kopiér din API key

4. **Klik "Save"** for hver variabel

5. **Nu kan du klikke "Deploy"**

## Trin 4: Verificer Deployment

Efter deployment (1-3 minutter):

1. Vercel vil give dig en URL: `https://wino-six.vercel.app` (eller dit eget domain)
2. Test at appen virker:
   - Åbn URL'en i browseren: https://wino-six.vercel.app
   - Test at du kan se vine (Supabase connection)
   - Test at du kan uploade/scanne et vinbillede (OpenAI API)

3. **Hvis der er fejl:**
   - Gå til Vercel Dashboard → dit projekt → "Deployments"
   - Klik på den seneste deployment → "View Function Logs"
   - Tjek for fejl relateret til miljøvariabler eller API calls

## Trin 5: iOS App Configuration

### Option A: Standalone/Offline Mode (Anbefalet)

iOS appen bundler web assets og kører offline:

1. **Sikre at `capacitor.config.ts` IKKE har `server.url` sat:**
   ```typescript
   // ✅ Korrekt - ingen server.url
   const config: CapacitorConfig = {
     webDir: 'public',
     // server.url er kommenteret ud
   };
   ```

2. **Build iOS app:**
   ```bash
   cd wino-app
   pnpm cap:build
   pnpm cap:ios
   ```

3. **I Xcode:**
   - Build og test på simulator eller device
   - Appen kører standalone med bundled assets

### Option B: Live Server Mode (Development/Test)

Hvis du vil teste mod live Vercel URL:

1. **Opdater `capacitor.config.ts` midlertidigt:**
   ```typescript
   server: {
     url: 'https://wino-six.vercel.app',
     cleartext: false, // HTTPS
   },
   ```

2. **Synkroniser:**
   ```bash
   cd wino-app
   pnpm cap:sync
   ```

3. **Test i Xcode:**
   ```bash
   pnpm cap:ios
   ```
   Dette åbner Xcode hvor du kan build og teste på simulator eller device.

4. **Vigtigt:** Fjern `server.url` igen før production build (kommenter det ud igen)!

## Trin 6: Automatisk Deployment

Efter første deployment er Vercel automatisk konfigureret:

- **Hver push til `main` branch** → automatisk deployment
- **Preview deployments** for hver pull request
- **Production deployment** fra `main` branch

## Troubleshooting

### "Invalid environment variables"
- Tjek at alle miljøvariabler er sat korrekt i Vercel Dashboard
- Sørg for at `NEXT_PUBLIC_*` variabler er tilgængelige for alle environments

### "Supabase connection failed"
- Verificer at `NEXT_PUBLIC_SUPABASE_URL` og `NEXT_PUBLIC_SUPABASE_ANON_KEY` er korrekte
- Tjek Supabase Dashboard at projektet ikke er paused

### "OpenAI API error"
- Verificer at `OPENAI_API_KEY` er korrekt
- Tjek at din OpenAI account har credits

### "Storage upload failed"
- Verificer at `SUPABASE_STORAGE_BUCKET` navnet matcher din bucket
- Tjek at bucket'en er public eller RLS policies er korrekt konfigureret

### iOS app kan ikke connecte til Supabase
- I standalone mode skal `NEXT_PUBLIC_*` variabler være bundlet i build
- Verificer at build process inkluderer miljøvariablerne
- Tjek at Supabase URL er korrekt i bundle

## Næste Steps

- [ ] Push kode til GitHub
- [ ] Opret Vercel projekt og forbind til GitHub
- [ ] Konfigurer miljøvariabler i Vercel
- [ ] Deploy og test web app
- [ ] Build iOS app i standalone mode
- [ ] Test iOS app på device/simulator
- [ ] Opsæt automatisk deployment workflow

