# 🔧 CORS Konfiguration für Produktion

Nach dem du die Frontend URL von Vercel hast, muss der Backend die URL kennen.

## Schritt 1: Deine Frontend URL von Vercel kopieren

Nach dem Frontend-Deploy siehst du eine URL wie:
```
https://webseite-mit-emojis-abc123.vercel.app
```

## Schritt 2: Backend CORS anpassen

Öffne `vip-shop-backend/server.js` und finde diese Zeilen (ca. Zeile 24-29):

```javascript
app.use(cors({
  origin: ['http://localhost:8000', 'http://localhost:3000', 'http://127.0.0.1:8000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'x-admin-secret']
}));
```

Ändere es zu:

```javascript
app.use(cors({
  origin: [
    'http://localhost:8000',
    'http://localhost:3000',
    'http://127.0.0.1:8000',
    'http://127.0.0.1:3000',
    'https://webseite-mit-emojis-abc123.vercel.app'  // ← DEINE FRONTEND URL
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'x-admin-secret']
}));
```

## Schritt 3: Speichern und Pushen

```bash
git add vip-shop-backend/server.js
git commit -m "Update CORS for production frontend"
git push
```

Vercel wird automatisch neu-deployen! ✨

## Schritt 4: Überprüfen

Öffne deine Frontend URL und öffne die DevTools (F12):
- Console sollte keine CORS-Fehler zeigen
- API Calls sollten funktionieren

---

## ⚠️ WICHTIG: Mehrere Frontends?

Falls du mehrere Frontends hast:

```javascript
origin: [
  'http://localhost:8000',
  'http://localhost:3000',
  'https://webseite-mit-emojis-abc123.vercel.app',
  'https://anderes-projekt-xyz.vercel.app',
  'https://meine-domain.com'
]
```

---

## 🔐 Sicherheit

CORS-Origins sollten **spezifisch** sein, nicht `'*'` verwenden!

Beispiele:
- ✅ `https://meine-domain.com`
- ✅ `https://*.vercel.app` (Wildcard ist ok)
- ❌ `*` (Unsicher!)
