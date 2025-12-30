# 📱 Brug Simulator (Workaround)

## Hvis iPhone Parring Hænger:

Du kan teste appen i iOS Simulator i stedet!

## Sådan Gør Du:

### 1. Vælg Simulator i Xcode

1. **I Xcode:**
   - I toppen, til venstre for Run knappen
   - Klik på device dropdown
   - Vælg **"iPhone 15 Pro"** eller anden simulator
   - (Ikke din fysiske iPhone)

### 2. Kør Appen

1. Klik **▶️ Run** (eller `Cmd+R`)
2. Simulator åbner automatisk
3. Appen installeres og kører i simulator

## Hvad Virker i Simulator:

✅ **Hele appen** - UI, navigation, funktionalitet  
✅ **Foto bibliotek** - Du kan vælge billeder fra simulator's foto bibliotek  
⚠️ **Kamera** - Begrænset support (kan tage screenshots som "fotos")  
✅ **File system** - Virker normalt  
✅ **Supabase** - Virker normalt  
✅ **AI analyse** - Virker normalt  

## Test Kamera Senere:

Når iPhone parring virker, kan du:
1. Vælge din iPhone i stedet for simulator
2. Teste rigtig kamera funktionalitet

## Fordele ved Simulator:

- ✅ Hurtigere iteration (ingen USB kabel nødvendig)
- ✅ Nemmere debugging
- ✅ Forskellige iPhone størrelser til test
- ✅ Screenshots er nemme

## Ulemper:

- ⚠️ Begrænset kamera support
- ⚠️ Forskellig performance end rigtig device

---

**Tip:** Brug simulator til at teste og udvikle, test kamera på rigtig iPhone senere når parring virker!
