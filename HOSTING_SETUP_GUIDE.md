# 🚀 Kostenlos Hosting Setup Guide - VIP Shop

Dieser Guide zeigt dir, wie du deine Webseite (Frontend + Backend) kostenlos online hosting kannst.

---

## 📋 Was wir brauchen:
- **Frontend**: React/Vite App → Vercel
- **Backend**: Node.js/Express → Vercel
- **Datenbank**: Supabase (PostgreSQL, kostenlos)
- **GitHub**: Für automatische Deployments

---

## 🔧 SCHRITT 1: GitHub Repository erstellen

### 1.1 Neues GitHub Repo erstellen
1. Gehe zu https://github.com/new
2. Repository-Name: z.B. `vip-shop` oder `webseite-mit-emojis`
3. Wähle **Public** (für kostenloses Hosting)
4. Klick **Create repository**

### 1.2 Projekt zu GitHub pushen
```bash
# Im Projekt-Verzeichnis (z.B. vip-shop-backend oder webseite mit emojis)
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/DEIN-USERNAME/REPO-NAME.git
git push -u origin main
```

---

## 🗄️ SCHRITT 2: Supabase Datenbank einrichten

### 2.1 Supabase Account erstellen
1. Gehe zu https://supabase.com
2. Klick **Sign Up**
3. Melde dich mit GitHub an (einfacher)
4. Erstelle ein neues Projekt

### 2.2 Projekt-Details
- **Name**: z.B. `vip-shop-db`
- **Password**: Sicheres Passwort merken!
- **Region**: Wähle deine nächste Region (z.B. Europa)

### 2.3 Datenbanktabellen erstellen
Gehe in Supabase zu **SQL Editor** und führe diesen Code aus:

```sql
-- Tabelle für Bestellungen
CREATE TABLE orders (
  id TEXT PRIMARY KEY,
  product_name TEXT NOT NULL,
  payment_method TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  telegram_username TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabelle für verwendete Codes
CREATE TABLE used_codes (
  code TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id)
);
```

### 2.4 API Keys kopieren
1. Gehe zu **Project Settings** → **API**
2. Kopiere diese Werte:
   - `Project URL` → `SUPABASE_URL`
   - `anon public` → `SUPABASE_ANON_KEY`
   - `service_role secret` → `SUPABASE_SERVICE_ROLE_KEY`
3. **SPEICHERE diese Werte - du brauchst sie später!**

---

## ⚙️ SCHRITT 3: Backend für Vercel vorbereiten

### 3.1 Vercel Config Datei erstellen
Erstelle die Datei `vip-shop-backend/vercel.json`:

```json
{
  "version": 2,
  "env": {
    "PORT": "3000",
    "NODE_ENV": "production"
  },
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "server.js"
    }
  ]
}
```

### 3.2 .gitignore überprüfen
Stelle sicher, dass `vip-shop-backend/.gitignore` folgendes enthält:
```
node_modules/
.env
.env.local
.env.*.local
dist/
build/
*.log
.DS_Store
```

**WICHTIG**: `.env` sollte NICHT in Git sein! Wir setzen die Variablen später in Vercel.

---

## 🎨 SCHRITT 4: Frontend für Vercel vorbereiten

### 4.1 Vite Config für Produktion
Die `vite.config.ts` sollte diesen `base` Path haben:

```typescript
base: '/',  // oder '/REPO-NAME' wenn es nicht die main domain ist
```

### 4.2 API URL konfigurieren
Erstelle `webseite mit emojis/src/config.ts`:

```typescript
// Für Production vs Development
export const API_BASE_URL = 
  import.meta.env.PROD 
    ? 'https://DEIN-BACKEND-DOMAIN.vercel.app'  // Vercel Backend URL
    : 'http://localhost:3000';
```

Dann in deinen API Calls nutzen:
```typescript
import { API_BASE_URL } from './config';

fetch(`${API_BASE_URL}/order`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
});
```

### 4.3 Build erstellen
```bash
npm run build
# Oder wenn Bun installiert:
bun run build
```

---

## 🚀 SCHRITT 5: Vercel Deployment

### 5.1 Vercel Account erstellen
1. Gehe zu https://vercel.com
2. Klick **Sign Up**
3. Wähle **GitHub** als Login-Methode
4. Autorisiere GitHub

### 5.2 Backend deployen

**Option A: Via Vercel Dashboard (Einfach)**
1. Gehe zu https://vercel.com/dashboard
2. Klick **Add New...** → **Project**
3. Wähle dein Backend GitHub Repo (`vip-shop-backend`)
4. Klick **Import**
5. Unter **Environment Variables** füge hinzu:
   ```
   SUPABASE_URL = [Dein Wert von oben]
   SUPABASE_SERVICE_ROLE_KEY = [Dein Wert von oben]
   ADMIN_SECRET = [Sicheres Passwort, z.B. "abc123xyz"]
   NODE_ENV = production
   ```
6. Klick **Deploy**

**Option B: Via Vercel CLI**
```bash
cd vip-shop-backend
npm i -g vercel
vercel login
vercel env add SUPABASE_URL
# Kopiere den Wert von oben
vercel env add SUPABASE_SERVICE_ROLE_KEY
# Kopiere den Wert von oben
vercel env add ADMIN_SECRET
# Gib ein sicheres Passwort ein
vercel
```

### 5.3 Backend URL notieren
Nach dem Deploy siehst du die URL, z.B.:
```
https://vip-shop-backend.vercel.app
```
**SPEICHERE diese URL!**

### 5.4 CORS anpassen
Bearbeite `vip-shop-backend/server.js` und ändere die CORS-Konfiguration:

```javascript
app.use(cors({
  origin: [
    'http://localhost:8000',
    'http://localhost:3000',
    'https://DEIN-FRONTEND-DOMAIN.vercel.app'  // Wird später verwendet
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'x-admin-secret']
}));
```

Commit und push:
```bash
git add .
git commit -m "Update CORS for production"
git push
```

### 5.5 Frontend deployen
1. Gehe zu https://vercel.com/dashboard
2. Klick **Add New...** → **Project**
3. Wähle dein Frontend Repo (`webseite mit emojis`)
4. Unter **Framework** wähle **Vite**
5. Unter **Environment Variables** füge hinzu:
   ```
   VITE_API_URL = https://vip-shop-backend.vercel.app
   ```
6. Klick **Deploy**

Nach dem Deploy erhältst du die Frontend URL:
```
https://webseite-mit-emojis.vercel.app
```

---

## 🔐 SCHRITT 6: Sicherheit

### 6.1 Environment Variables überprüfen
Stelle sicher, dass KEINE Secrets in GitHub sind:
- `.env` sollte im `.gitignore` sein
- Nutze Vercel's Environment Variables für Secrets
- `SUPABASE_SERVICE_ROLE_KEY` sollte NIEMALS in den Client-Code gehen

### 6.2 Admin-Secret schützen
Der `ADMIN_SECRET` wird für Admin-Endpoints genutzt. Behandle ihn wie ein Passwort.

---

## ✅ Fertig! Deine Webseite ist online!

| Komponente | URL |
|-----------|-----|
| Frontend | https://webseite-mit-emojis.vercel.app |
| Backend | https://vip-shop-backend.vercel.app |
| Datenbank | Supabase (integriert im Backend) |

### Automatische Updates
Jedes Mal wenn du zu GitHub pushst, wird Vercel automatisch aktualisiert! 🎉

---

## 🐛 Troubleshooting

### Frontend lädt nicht
- Überprüfe: Ist die `API_BASE_URL` korrekt?
- Öffne Browser DevTools (F12) → Console
- Siehst du CORS-Fehler? → Backend CORS-Konfiguration anpassen

### Backend antwortet nicht
- Gehe zu Vercel Dashboard → Dein Backend Projekt → Deployments
- Klick auf den letzten Deploy und schau die Logs
- Überprüfe: Sind alle Environment Variables gesetzt?

### Datenbank-Fehler
- Gehe zu Supabase Dashboard
- Überprüfe: Sind die Tabellen erstellt?
- Schau die Logs unter **SQL Editor**

### Environment Variables Fehler
- Vercel Dashboard → Project Settings → Environment Variables
- Stelle sicher, dass die Werte korrekt sind (kein Extra-Whitespace!)

---

## 🎓 Kostenlose Limits

| Service | Kostenloses Limit |
|---------|-------------------|
| **Vercel Frontend** | Unlimited Deployments, 100 GB Bandbreite/Monat |
| **Vercel Backend** | 100 Serverless Function Invocations/Tag (für Hobby) |
| **Supabase** | 500 MB Speicher, Unlimited Queries |
| **GitHub** | Unlimited Public Repos |

**Hinweis**: Wenn der Backend heavy genutzt wird (>100 Requests/Tag), upgrade auf "Pro" (~$20/Monat) oder nutze einen anderen Hoster (z.B. Railway, Render).

---

## 💡 Tipps & Tricks

### Lokale Entwicklung
```bash
# Backend lokal testen
cd vip-shop-backend
npm install
npm run dev

# Frontend lokal testen
cd "webseite mit emojis"
npm install
npm run dev
```

### Automatische Deployments deaktivieren
Vercel Dashboard → Project Settings → Git → Deaktiviere "Deployments on Push"

### Logs anschauen
```bash
vercel logs
```

### Deployment neustarten
```bash
vercel redeploy
```

---

## 📞 Weitere Hilfe

- Vercel Docs: https://vercel.com/docs
- Supabase Docs: https://supabase.com/docs
- React/Vite Docs: https://vitejs.dev/

Viel Erfolg! 🚀
