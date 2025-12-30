# 🚀 Start Dev Server for iPhone

## Sort Skærm Fix:

Jeg har konfigureret appen til at bruge Next.js dev server i stedet for static files.

## Næste Skridt:

### 1. Start Next.js Dev Server

I en terminal:

```bash
cd wino-app
pnpm dev
```

Serveren starter på `http://localhost:3000`

### 2. Tjek Firewall

Hvis iPhone ikke kan forbinde:

1. **System Settings → Network → Firewall**
2. Tillad **Node.js** eller **Terminal** gennem firewall
3. Eller slå firewall midlertidigt fra for test

### 3. Synkroniser (hvis ikke allerede gjort)

I en anden terminal:

```bash
cd wino-app
pnpm cap:sync
```

### 4. Kør Appen i Xcode

1. **I Xcode:**
   - Klik **▶️ Run** (eller `Cmd+R`)
   - Appen skulle nu indlæse fra dev server

### 5. Test på iPhone

- Appen skulle nu vise Next.js appen
- **Vigtigt:** Mac og iPhone skal være på samme WiFi netværk

## Hvis Det Stadig Ikke Virker:

### Tjek WiFi:

1. **På din Mac:**
   - System Settings → Network
   - Tjek WiFi navn

2. **På din iPhone:**
   - Settings → WiFi
   - Tjek at det er samme netværk

### Tjek IP Adresse:

Mac IP er sat til: `192.168.1.31`

Hvis din Mac har anden IP:
1. Kør: `ifconfig | grep "inet " | grep -v 127.0.0.1`
2. Opdater `capacitor.config.ts` med korrekt IP
3. Kør `pnpm cap:sync` igen

### Test Forbindelse:

På din iPhone, åbn Safari og gå til:
```
http://192.168.1.31:3000
```

Hvis det virker i Safari, skulle det også virke i appen.

---

**Når dev server kører, skulle appen virke på din iPhone!** 🎉

