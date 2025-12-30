# 🍷 Automatisk Critic Reviews Feature

## ✅ Implementeret

### Hvad er ændret:

1. **Automatisk hentning når vin oprettes**
   - Når en ny vin gemmes, hentes critic reviews automatisk i baggrunden
   - Sker asynkront så det ikke blokerer gem-processen
   - Reviews gemmes i databasen automatisk

2. **Automatisk hentning for eksisterende vine**
   - Når en vin vises i edit mode, tjekkes om der er reviews
   - Hvis ingen reviews findes, genereres de automatisk
   - Virker både for nye og eksisterende vine

3. **Visuel indikation for årgang mismatch**
   - Hvis review'en er for en anden årgang end vinen, vises en gul/amber badge
   - Badge tekst: "Anden årgang"
   - Warning besked i expanded view hvis årgangen ikke matcher
   - Systemet matcher årgang ved at søge efter 4-cifrede årstal i review teksten

4. **Fjernet "Find Reviews" knap**
   - Reviews hentes nu automatisk - ingen knap nødvendig
   - Knappen vises kun hvis autoFetch fejler og der stadig ikke er reviews

## 📁 Ændrede Filer:

### `src/app/wine-details/actions.ts`
- `saveWineAction` returnerer nu `wineId` så vi kan redirect til edit page
- Tilføjet `generateCriticReviewsForWine` helper function
- Automatisk kald til critic reviews generation efter vin gemmes

### `src/app/wine-details/wine-details-experience.tsx`
- Opdateret til at redirect til edit page efter create (så reviews kan vises)
- `WineCriticReviews` komponent får nu `autoFetch={true}` prop
- Viser reviews for både create og edit mode

### `src/components/wine-critic-reviews.tsx`
- Tilføjet `autoFetch` prop for automatisk hentning
- Tilføjet `getVintageMismatch` function til at detektere årgang mismatch
- Visuel indikation med amber badge og warning besked
- Automatisk generering hvis ingen reviews findes og `autoFetch` er true

## 🎨 Visuel Indikation:

### Årgang Match:
- Normal hvid baggrund
- Ingen ekstra indikation

### Årgang Mismatch:
- **Badge**: Gul/amber badge med tekst "Anden årgang" ved siden af kritikerens navn
- **Border**: Amber border omkring review card
- **Background**: Let amber baggrund
- **Warning**: Info besked i expanded view der forklarer at review'en er for en anden årgang

## 🔄 Flow:

### Når vin oprettes:
1. Bruger uploader billede og udfylder form
2. Klikker "Gem vin"
3. Vin gemmes i database
4. Automatisk: Critic reviews genereres i baggrunden
5. Redirect til edit page hvor reviews vises automatisk

### Når vin vises:
1. Bruger åbner vin i edit mode
2. `WineCriticReviews` komponent loader
3. Tjekker om der er reviews i database
4. Hvis ingen reviews: Genererer automatisk
5. Viser reviews med visuel indikation for årgang mismatch

## ✅ Virker på både Web og Mobile:

- Alle API calls bruger standard fetch (virker på begge platforme)
- Ingen platform-specifik kode
- Samme UX på web og mobile

## 🧪 Test:

1. **Opret ny vin:**
   - Upload billede og gem vin
   - Tjek at reviews automatisk vises på edit page

2. **Vis eksisterende vin:**
   - Åbn en vin uden reviews
   - Tjek at reviews automatisk genereres og vises

3. **Årgang mismatch:**
   - Opret vin med årgang "2019"
   - Tjek at reviews med anden årgang viser amber badge
   - Expand review og tjek warning besked

4. **Test på mobile:**
   - Test samme flow på iPhone
   - Tjek at alt virker som forventet

---

**Feature er klar til brug!** 🎉
