# Google AI Studio Preview Layer — PlanPasika.v1

Warstwa podglądu webowego (NPM / Vite / React) utworzona wyłącznie na potrzeby środowiska podglądu w przeglądarce w platformie Google AI Studio. 

> [!IMPORTANT]
> **Projekt nadrzędny i jedyne źródło prawdy:** Natywna aplikacja Android w języku Kotlin (Jetpack Compose, Room SQLite, Material 3) znajdująca się w katalogu `/app` oraz plikach Gradle w katalogu głównym.
> Warstwa podglądu nie zastępuje aplikacji Android i może zostać w każdej chwili bezpiecznie usunięta.

---

## 1. Jak uruchomić Preview

W środowisku chmurowym Google AI Studio serwer podglądu uruchamiany jest automatycznie przez `control-plane-api` za pomocą polecenia:

```bash
npm run dev
# (uruchamia: vite --host 0.0.0.0 --port 3000)
```

Dostęp do podglądu: `http://localhost:3000` (przekazywany przez Nginx na port `8080`).

Do weryfikacji kompilacji warstwy podglądu:
```bash
npm run build
```

---

## 2. Pliki i zależności należące wyłącznie do warstwy Preview

Następujące pliki i katalogi stanowią **wyłącznie** warstwę podglądu AI Studio i nie należą do projektu Android:

### Pliki w katalogu głównym:
- `package.json`
- `package-lock.json`
- `node_modules/`
- `vite.config.ts`
- `tsconfig.json`
- `tailwind.config.js`
- `postcss.config.js`
- `index.html`
- `PREVIEW_SETUP.md` (niniejszy plik)

### Katalog podglądu:
- `preview/` (oraz wszystkie podkatalogi: `preview/components/`, `preview/data/`, etc.)

---

## 3. Zależności NPM i uzasadnienie

- `react`, `react-dom` — minimalny silnik renderowania komponentów UI w przeglądarce.
- `vite`, `@vitejs/plugin-react` — szybki bundler dev-server wymagany przez `control-plane-api` AI Studio.
- `typescript`, `@types/react`, `@types/react-dom` — bezpieczeństwo typów.
- `lucide-react` — lekkie ikony wektorowe odpowiadające ikonom Material Icons w Jetpack Compose.
- `tailwindcss`, `postcss`, `autoprefixer`, `clsx`, `tailwind-merge` — odwzorowanie ciemnego motywu Xiaomi 14T (AMOLED Dark).

---

## 4. Procedura bezpiecznego usunięcia warstwy Preview

Aby całkowicie usunąć warstwę NPM Preview i pozostawić czysty, natywny projekt Androida, wykonaj polecenie:

```bash
rm -rf package.json package-lock.json node_modules vite.config.ts tsconfig.json tailwind.config.js postcss.config.js index.html preview PREVIEW_SETUP.md
```

---

## 5. Jak zweryfikować, że projekt Android pozostał nietknięty

Po usunięciu warstwy Preview, w projekcie powinny znajdować się wyłącznie natywne pliki Android/Gradle:

1. **Pliki konfiguracyjne projektu Android:**
   - `build.gradle.kts`
   - `settings.gradle.kts`
   - `gradle.properties`
   - `metadata.json`
   - `.env.example`
   - `gradle/libs.versions.toml`
   - `gradle/wrapper/gradle-wrapper.properties`
2. **Kod źródłowy modułu Android (`/app`):**
   - `app/build.gradle.kts`
   - `app/proguard-rules.pro`
   - `app/src/main/AndroidManifest.xml`
   - `app/src/main/java/com/example/...` (cała architektura MVVM, Room, ekrany Compose)
   - `app/src/test/java/com/example/...` (testy jednostkowe)
   - `app/src/main/res/...` (zasoby XML)

Wszystkie pliki aplikacji Android znajdują się w swoich oryginalnych lokalizacjach i nie zostały zmodyfikowane przez utworzenie warstwy Preview.
