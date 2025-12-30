# 🔧 Fix Sort Skærm på iPhone

## Problem:
Sort skærm betyder at Capacitor ikke kan indlæse web-appen.

## Løsning:

### Option 1: Brug Next.js Dev Server (Hurtig Test)

1. **Start Next.js server:**
   ```bash
   cd wino-app
   pnpm dev
   ```

2. **Opdater capacitor.config.ts:**
   ```typescript
   server: {
     url: 'http://localhost:3000',
     cleartext: true,
   }
   ```

3. **Synkroniser:**
   ```bash
   pnpm cap:sync
   ```

4. **I Xcode:**
   - Kør appen igen
   - **Note:** Din Mac og iPhone skal være på samme WiFi netværk

### Option 2: Fix Build og Brug Static Files

1. **Fix build problemer:**
   - Prøv at slette `.next` mappe
   - Prøv at reinstallere dependencies

2. **Byg og synkroniser:**
   ```bash
   pnpm cap:build
   ```

### Option 3: Brug Simpler HTML (Midlertidig)

Jeg har opdateret `public/index.html` til at vise en besked hvis Next.js ikke er tilgængelig.

## Tjek i Xcode Console:

1. **I Xcode:**
   - Window → Devices and Simulators
   - Vælg din iPhone
   - Klik "Open Console"
   - Se efter fejlbeskeder

2. **Tjek Safari Web Inspector:**
   - På din Mac: Safari → Develop → [Din iPhone] → Wino
   - Se console for JavaScript fejl

## Quick Fix (Prøv Først):

```bash
cd wino-app
pnpm dev
```

Derefter i `capacitor.config.ts`, uncomment server URL:
```typescript
server: {
  url: 'http://localhost:3000',
  cleartext: true,
}
```

Kør `pnpm cap:sync` og test igen.

---

**Tip:** For development, brug Next.js dev server. For production, fix build og brug static files.

