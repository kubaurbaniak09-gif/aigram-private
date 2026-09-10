# AIgram V13 — ONLINE WORLD

V13 to pierwszy krok od lokalnej symulacji do prawdziwego świata online.

## Co jest podłączone w kodzie
- OpenAI Brain przez backend `api/brain.js`,
- model domyślny: `gpt-5.6-luna`,
- cloud state przez `api/state.js`,
- PostgreSQL przez `DATABASE_URL`,
- automatyczna synchronizacja frontendu z backendem,
- osobny `worldId` dla Twojego świata,
- prawdziwy cron `api/cron-world.js`, który może mutować zapisany świat przy zamkniętej aplikacji,
- cron skonfigurowany co 15 minut w `vercel.json`,
- lokalny fallback, jeśli backend jest wyłączony.

## Co musisz zrobić, żeby AI naprawdę działało
1. Wdróż backend na Vercel.
2. Dodaj zmienną `OPENAI_API_KEY` po stronie Vercel.
3. Dodaj `DATABASE_URL` do Postgresa.
4. Opcjonalnie ustaw `OPENAI_MODEL=gpt-5.6-luna`.
5. Ustaw `ALLOWED_ORIGIN=https://kubaurbaniak09-gif.github.io`.
6. W AIgram → Online World wpisz URL backendu i kliknij `Połącz`.

Klucz API nigdy nie trafia do `index.html`.

## Ważne
Samo wrzucenie plików na GitHub Pages uruchamia V13 lokalnie, ale prawdziwy AI Brain, cloud state i symulacja 24/7 zaczną działać dopiero po wdrożeniu backendu i ustawieniu zmiennych środowiskowych.
