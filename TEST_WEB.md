# 🌐 Test Web Version

## ✅ Sådan Tester Du Web Versionen:

### 1. Start Dev Server:

```bash
cd wino-app
pnpm dev
```

### 2. Åbn i Browser:

**URL:** `http://localhost:3000`

Eller klik her: [http://localhost:3000](http://localhost:3000)

### 3. Test Features:

- ✅ **Forside** - Se alle dine vine
- ✅ **Scan** - Brug web kamera til at tage billeder
- ✅ **Upload** - Upload billeder fra computeren
- ✅ **AI Analyse** - Få vin information
- ✅ **Login/Logout** - Supabase authentication

### 4. Stop Server:

Tryk `Ctrl + C` i terminalen

---

## 🔍 Hvad Sker Der:

1. **Next.js dev server** starter på port 3000
2. **Web version** bruger:
   - `createBrowserClient` for Supabase (web optimeret)
   - `getUserMedia` for kamera (web API)
   - Normal web browser features

3. **Ingen mobile features** aktiveres (kun når kørt i Capacitor)

---

## 📝 Noter:

- Web versionen er **fuldstændig uafhængig** af mobile versionen
- Du kan have begge kørende samtidigt
- Web versionen virker præcis som før mobile integration

---

**Klar til test!** 🚀
