# 🔧 Fix xcode-select (hvis nødvendigt)

Hvis Xcode ikke virker korrekt, skal du måske opdatere xcode-select.

## Hvis du får fejl med xcodebuild:

Kør denne kommando i Terminal:

```bash
sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer
```

Du skal indtaste dit password.

## Verificer:

```bash
xcodebuild -version
```

Du skulle se Xcode version nummer.

## Hvis Xcode ikke findes i /Applications:

1. Åbn Finder
2. Gå til Applications
3. Tjek om Xcode.app er der
4. Hvis ikke: Installer Xcode fra App Store igen

---

**Xcode projektet er allerede åbnet - du kan fortsætte i Xcode selvom xcode-select ikke er opdateret endnu.**
