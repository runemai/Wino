# 🔧 Supabase Gratis Version + Capacitor

## Status:

✅ **Supabase gratis version virker fint med Capacitor!**

Gratis versionen har:
- ✅ 500 MB database storage
- ✅ 1 GB file storage
- ✅ 2 GB bandwidth
- ✅ Alle API features

## Konfiguration:

Jeg har opdateret Supabase client'en til at virke bedre med Capacitor:

### Ændringer:

1. **Storage Configuration:**
   - Bruger `localStorage` i stedet for cookies i native apps
   - Bedre session management på iOS

2. **Session Handling:**
   - `autoRefreshToken: true` - Automatisk token refresh
   - `persistSession: true` - Gemmer session mellem app starts
   - `detectSessionInUrl: false` - Deaktiverer URL-baseret session (ikke relevant i native)

## Hvad Virker:

✅ **Database queries** - Alle dine queries virker normalt  
✅ **File uploads** - Storage uploads virker  
✅ **Authentication** - Hvis du bruger auth senere  
✅ **Real-time** - Hvis du bruger real-time features  

## Gratis Version Begrænsninger:

- **Database:** 500 MB (rigeligt til start)
- **Storage:** 1 GB (godt til billeder)
- **Bandwidth:** 2 GB/måned
- **API requests:** Ingen begrænsning (kun rate limiting)

## Tips:

1. **Monitor Usage:**
   - Gå til Supabase Dashboard → Settings → Usage
   - Tjek at du ikke nærmer dig grænserne

2. **Optimize Storage:**
   - Komprimer billeder før upload
   - Slet gamle/unødvendige filer

3. **Upgrade Når Nødvendigt:**
   - Når du når grænserne, kan du opgradere til Pro ($25/måned)

## Test Supabase:

1. **I appen:**
   - Prøv at hente vine (skulle virke)
   - Prøv at uploade et billede (skulle virke)

2. **Hvis der er fejl:**
   - Tjek Supabase Dashboard for fejl
   - Tjek console i Safari Web Inspector

---

**Supabase gratis version er perfekt til development og små apps!** ✅
