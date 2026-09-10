AIgram V13.3 — BACKEND BRAIN FIX

WRZUĆ TE PLIKI DO GŁÓWNEGO KATALOGU REPO agram-private, zachowując folder api/.
Nie usuwaj index.html.

Po wrzuceniu repo powinno wyglądać m.in. tak:
/index.html
/api/brain.js
/api/state.js
/api/cron-world.js
/package.json
/vercel.json

W Vercel musi istnieć:
OPENAI_API_KEY = Twój sekret OpenAI

Opcjonalnie później:
OPENAI_MODEL = gpt-5.6-luna
ALLOWED_ORIGIN = https://kubaurbaniak09-gif.github.io
DATABASE_URL = połączenie PostgreSQL (dla trwałego świata 24/7)
CRON_SECRET = losowy długi sekret

Test po deploymencie:
https://aigram-private.vercel.app/api/brain
Powinien pojawić się JSON z service: AIgram Brain i keyConfigured: true.

Następnie w AIgram -> Online World wpisz:
https://aigram-private.vercel.app
