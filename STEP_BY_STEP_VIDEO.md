# 📹 Step-by-Step Video Guide - Mit Screenshots

Detaillierte visuelle Anleitung für jeden Schritt.

---

## 🎯 Schritt 1: GitHub Repository vorbereiten

### 1.1 Terminal öffnen
```
Windows: Cmd oder PowerShell
Mac/Linux: Terminal
```
Position: Im Projekt-Hauptordner

### 1.2 GitHub Repo erstellen (Website)
1. Gehe zu: https://github.com/new
2. Ausfüllen:
   - **Repository name**: `vip-shop` (oder dein Projektname)
   - **Description**: (optional) z.B. "VIP Shop Backend + Frontend"
   - **Public** wählen ⭐ (WICHTIG!)
   - [ ] Initialize with README NICHT ankreuzen
3. **Create repository** Button klicken

### 1.3 Code zu GitHub pushen (Terminal)

**Schritt für Schritt Befehle:**

```bash
# 1. Git initialisieren
git init

# 2. Alle Dateien hinzufügen
git add .

# 3. Initial Commit
git commit -m "Initial commit"

# 4. Hauptbranch umbenennen zu 'main'
git branch -M main

# 5. Remote Repository verbinden (URL von GitHub)
git remote add origin https://github.com/DEIN-USERNAME/vip-shop.git

# 6. Zu GitHub pushen
git push -u origin main
```

**Output sollte so aussehen:**
```
Enumerating objects: 150, done.
...
To https://github.com/DEIN-USERNAME/vip-shop.git
 * [new branch]      main -> main
Branch 'main' set up to track remote branch 'main' from 'origin'.
```

### 1.4 Überprüfen auf GitHub
- Gehe zu: https://github.com/DEIN-USERNAME/vip-shop
- Siehst du deine Dateien?
- ✅ Schritt 1 fertig!

---

## 🎯 Schritt 2: Supabase Datenbank

### 2.1 Supabase Konto erstellen
1. Gehe zu: https://supabase.com
2. **Start Your Project** oder **Sign Up**
3. Mit GitHub anmelden (einfacher)
4. GitHub Auto-Authorization

### 2.2 Neues Projekt erstellen
1. **New project**
2. Ausfüllen:
   - **Name**: `vip-shop-db`
   - **Database Password**: [Sicheres Passwort] (z.B. `P@ssw0rd123`)
   - **Region**: Wähle deine Region (z.B. Europe: Frankfurt)
3. **Create new project** (dauert 1-2 Minuten)

### 2.3 Datenbank Tabellen erstellen
1. Warte bis Projekt "Ready" ist
2. Gehe zu **SQL Editor** (Linke Seite → SQL Editor)
3. **New Query**
4. Kopiere diesen Code:

```sql
-- Tabelle: orders
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  product_name TEXT NOT NULL,
  payment_method TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  telegram_username TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabelle: used_codes
CREATE TABLE IF NOT EXISTS used_codes (
  code TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(id)
);

-- Indexes für bessere Performance
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_code ON orders(code);
```

5. **Run** (Blauer Button oben)
6. ✅ Tabellen sollten erstellt sein!

### 2.4 Überprüfe Tabellen
1. Gehe zu **Table Editor** (Linke Seite)
2. Siehst du `orders` und `used_codes`?
3. ✅ Supabase Setup fertig!

### 2.5 API Keys kopieren (WICHTIG!)
1. Gehe zu **Settings** (Linke Seite unten)
2. Klick **API** Tab
3. Kopiere diese Werte in ein sicheres Dokument:

```
📋 Kopiere diese:
SUPABASE_URL: https://[project-ref].supabase.co
SUPABASE_ANON_KEY: eyJhbGciOiJIUzI1NiIsInR5...
SUPABASE_SERVICE_ROLE_KEY: eyJhbGciOiJIUzI1NiIsInR5...
```

**⚠️ WICHTIG**: Diese Werte sind Geheimnisse! Nicht öffentlich teilen!

---

## 🎯 Schritt 3: Backend auf Vercel deployen

### 3.1 Vercel Konto erstellen
1. Gehe zu: https://vercel.com
2. **Sign Up** oder **Sign in with GitHub**
3. Mit GitHub verbinden
4. Auto-Authorisierung

### 3.2 Backend Projekt importieren
1. Vercel Dashboard öffnen: https://vercel.com/dashboard
2. **Add New** (Oben Rechts) → **Project**
3. **Import Git Repository**
4. GitHub Auto-verbunden?
   - Wenn nein: **GitHub App installieren**
5. Repo suchen: `vip-shop` oder `vip-shop-backend`
6. **Import** klicken

### 3.3 Konfiguration einstellen
**Framework Preset**: Sollte `Node.js` sein (Auto-erkannt)

**Root Directory**: 
- Wenn Backend separat: `vip-shop-backend` eingeben
- Falls alles im Root: Leer lassen

### 3.4 Environment Variables setzen
1. Scrolle zu **Environment Variables**
2. Füge folgende hinzu:

| Name | Value |
|------|-------|
| `SUPABASE_URL` | `https://[project-ref].supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOi...` |
| `ADMIN_SECRET` | `super_secret_admin_123` |
| `NODE_ENV` | `production` |

3. **Deploy** (Blauer Button)

### 3.5 Deploy warten
- Status: **Building** → (1-2 Minuten)
- Status: **Ready** ✅

### 3.6 Backend URL kopieren
Nach Deploy siehst du:
```
Congratulations! Your project has been successfully deployed
https://vip-shop-backend-abc123.vercel.app
```

**Kopiere diese URL!** (Brauchst du später)

---

## 🎯 Schritt 4: Frontend Konfiguration

### 4.1 Backend URL im Frontend setzen

**Datei öffnen**: `webseite mit emojis/src/config.ts`

**Überprüfe den Inhalt:**
```typescript
export const API_BASE_URL = import.meta.env.PROD
  ? import.meta.env.VITE_API_URL || 'https://vip-shop-backend-abc123.vercel.app'
  : 'http://localhost:3000';
```

**Ändere die Backend URL** zu deiner Vercel Backend URL (von Schritt 3.6)

### 4.2 Änderungen zu GitHub pushen

```bash
# Im Terminal, Frontend-Ordner
git add .
git commit -m "Update backend URL for production"
git push
```

### 4.3 Überprüfe GitHub
- https://github.com/DEIN-USERNAME/webseite-mit-emojis
- Siehst du die neuste Änderung?

---

## 🎯 Schritt 5: Frontend auf Vercel deployen

### 5.1 Frontend Projekt importieren
1. Vercel Dashboard: https://vercel.com/dashboard
2. **Add New** → **Project**
3. GitHub Repo `webseite mit emojis` auswählen
4. **Import**

### 5.2 Konfiguration
**Framework Preset**: **Vite** (sollte auto erkannt werden)

**Build Command**: `npm run build` (oder `bun run build`)

**Output Directory**: `dist`

**Install Command**: `npm install` (oder `bun install`)

### 5.3 Environment Variables
| Name | Value |
|------|-------|
| `VITE_API_URL` | `https://vip-shop-backend-abc123.vercel.app` |

(Die URL von Schritt 3.6)

### 5.4 Deploy
1. **Deploy** Button
2. Warten... (2-3 Minuten)
3. Status: **Ready** ✅

### 5.5 Frontend URL kopieren
```
https://webseite-mit-emojis-abc123.vercel.app
```

**Das ist deine Website! 🎉**

---

## 🎯 Schritt 6: CORS anpassen

### 6.1 Backend CORS updaten

**Datei öffnen**: `vip-shop-backend/server.js` (Zeile ~24)

**Finde diese Zeilen:**
```javascript
app.use(cors({
  origin: ['http://localhost:8000', 'http://localhost:3000', ...],
  ...
}));
```

**Ändere zu:**
```javascript
app.use(cors({
  origin: [
    'http://localhost:8000',
    'http://localhost:3000',
    'http://127.0.0.1:8000',
    'http://127.0.0.1:3000',
    'https://webseite-mit-emojis-abc123.vercel.app'  // ← Deine Frontend URL!
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'x-admin-secret']
}));
```

### 6.2 Speichern und Pushen

```bash
# Im Terminal, Backend-Ordner
git add server.js
git commit -m "Update CORS for production domains"
git push
```

### 6.3 Vercel redeploy warten
- Vercel Dashboard → Backend Projekt → Deployments
- Warten bis neuer Deploy "Ready" ist
- Sollte automatisch triggern

---

## 🎯 Schritt 7: Test

### 7.1 Website öffnen
Gehe zu: `https://webseite-mit-emojis-abc123.vercel.app`

**Checkliste:**
- [ ] Seite lädt
- [ ] Keine weißes Leere Seite
- [ ] Alle Inhalte sichtbar
- [ ] Keine sichtbaren Fehler

### 7.2 DevTools öffnen
Drücke: **F12** (oder Cmd+Option+I auf Mac)

**Gehe zu**: **Console** Tab

**Checkliste:**
- [ ] Keine roten Fehlermeldungen
- [ ] Keine CORS-Fehler
- [ ] Keine "404 Not Found" Fehler

### 7.3 API Test
In der Console geben ein:

```javascript
fetch('https://vip-shop-backend-abc123.vercel.app/health')
  .then(r => r.json())
  .then(console.log)
```

**Sollte ausgeben:**
```json
{ "status": "ok" }
```

Falls Error: → Siehe TROUBLESHOOTING.md

### 7.4 Formular Test (falls relevant)
- Fülle ein Formular aus
- Klick Submit
- Überprüfe Network Tab: Request erfolgreich?
- Überprüfe Supabase: Daten gespeichert?

---

## ✅ Fertig!

Du hast erfolgreich deployed! 🚀

**Deine Website:**
```
Frontend: https://webseite-mit-emojis-abc123.vercel.app
Backend: https://vip-shop-backend-abc123.vercel.app
```

**Automatische Updates:**
- Jedes Mal wenn du zu GitHub pushst
- Vercel deployt automatisch
- Keine manuellen Schritte mehr nötig!

**Nächste Schritte:**
1. Website mit Freunden teilen! 
2. Optional: Eigene Domain hinzufügen
3. Optional: Monitoring aktivieren

---

## 🎓 Häufig gestellte Fragen

**Q: Wie lange dauert ein Deploy?**
A: Normalerweise 1-3 Minuten. Vercel zeigt den Status.

**Q: Kann ich kostenlos die Limits upgraden?**
A: Vercel kostenlos hat großzügige Limits. Nach Bedarf Pro upgraden.

**Q: Was wenn ich mein Repository private machen will?**
A: Kein Problem! Vercel unterstützt auch private Repos (auch kostenlos).

**Q: Kann ich meine Domain nutzen?**
A: Ja! Vercel Settings → Domains → Hinzufügen + DNS konfigurieren.

---

Viel Spaß mit deinem Online-Projekt! 🎉
