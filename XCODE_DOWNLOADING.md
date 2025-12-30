# ⏳ Xcode Downloader Stadig

## Status:

Xcode downloader stadig (`Xcode.appdownload` i stedet for `Xcode.app`).

## Næste Skridt:

### 1. Vent på Download

- Tjek App Store for download status
- Download kan tage 30-60 minutter (15 GB)
- Vent til download er 100% færdig

### 2. Efter Download er Færdig:

1. **Åbn Xcode første gang:**
   - Find Xcode i Applications
   - Åbn Xcode
   - Accepter licensaftalen
   - Vent på at Command Line Tools installeres

2. **Opdater xcode-select:**
   ```bash
   sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer
   ```
   (Indtast dit password)

3. **Verificer:**
   ```bash
   xcodebuild -version
   ```

### 3. Åbn Projektet Igen:

```bash
cd wino-app
pnpm cap:ios
```

## I Mellemtiden:

- **Xcode projektet er allerede åbnet** - du kan se strukturen
- Du kan ikke bygge endnu, men kan se projektet
- Vent til Xcode er færdig med at downloade

## Når Xcode er Færdig:

Følg guiden i `XCODE_FINAL_STEPS.md` for at:
1. Vælge dit Apple Developer Team
2. Vælge din iPhone
3. Køre appen

---

**Vent på at Xcode downloader færdigt, derefter er alt klar!** ⏳
