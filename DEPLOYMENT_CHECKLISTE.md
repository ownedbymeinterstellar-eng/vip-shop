# ✅ Deployment Checkliste - Schritt für Schritt

Verwende diese Checkliste um sicherzustellen, dass alles funktioniert!

---

## 📋 PHASE 1: Vorbereitung (Vor GitHub)

### Lokal testen
- [ ] Backend lokal läuft: `npm run dev` in `vip-shop-backend`
- [ ] Frontend lokal läuft: `npm run dev` in `webseite mit emojis`
- [ ] Alle API Calls funktionieren lokal
- [ ] Keine Fehler in der Browser Console

### .env & .gitignore überprüfen
- [ ] `.env` Datei existiert (NICHT in Git!)
- [ ] `.gitignore` enthält `node_modules/`, `.env`, `dist/`
- [ ] `vercel.json` existiert im Backend Ordner

---

## 🔑 PHASE 2: Supabase Setup

### Account & Projekt
- [ ] Supabase Account erstellt: https://supabase.com
- [ ] Neues Projekt erstellt
- [ ] Projekt URL notiert
- [ ] Service Role Secret notiert

### Datenbank
- [ ] SQL-Script in Supabase ausgeführt (Tabellen erstellt)
- [ ] Tabellen werden angezeigt: `Table Editor` → `orders` & `used_codes`
- [ ] API Keys kopiert:
  - [ ] `SUPABASE_URL`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY`

---

## 🐙 PHASE 3: GitHub Repository

### Repo erstellen & Code hochladen
- [ ] Neues Repository auf GitHub erstellt
- [ ] Repository ist **Public**
- [ ] Code gepusht:
  ```bash
  git init
  git add .
  git commit -m "Initial commit"
  git branch -M main
  git remote add origin https://github.com/DEIN-USERNAME/REPO-NAME.git
  git push -u origin main
  ```
- [ ] Code ist sichtbar auf GitHub

---

## 🚀 PHASE 4: Backend Deployment (Vercel)

### Vercel Setup
- [ ] Vercel Account erstellt: https://vercel.com
- [ ] Mit GitHub verknüpft

### Deploy via Dashboard
- [ ] Vercel Dashboard: **Add New** → **Project**
- [ ] Backend Repo ausgewählt
- [ ] Framework: `Node.js`
- [ ] Root Directory: `vip-shop-backend` (falls nötig)

### Environment Variables (WICHTIG!)
- [ ] `SUPABASE_URL` = [Wert von Supabase]
- [ ] `SUPABASE_SERVICE_ROLE_KEY` = [Wert von Supabase]
- [ ] `ADMIN_SECRET` = [Sicheres Passwort]
- [ ] `NODE_ENV` = `production`

### Nach Deploy
- [ ] Deploy erfolgreich (keine Fehler)
- [ ] Backend URL notiert: `https://vip-shop-backend-xxxxx.vercel.app`
- [ ] API Test: `curl https://vip-shop-backend-xxxxx.vercel.app/health`

---

## 🎨 PHASE 5: Frontend Vorbereitung

### API URL anpassen
- [ ] `webseite mit emojis/src/config.ts` überprüft
- [ ] Backend URL in `config.ts` ist korrekt
- [ ] Oder: Environment Variable `VITE_API_URL` wird verwendet

### CORS anpassen
- [ ] Backend `server.js` CORS aktualisiert:
  ```javascript
  origin: [
    'http://localhost:8000',
    'http://localhost:3000',
    'https://webseite-mit-emojis-xxxxx.vercel.app'
  ]
  ```
- [ ] Änderungen zu GitHub gepusht

### Build Test
- [ ] `npm run build` erfolgreich lokal
- [ ] `npm run preview` zeigt korrekte Website
- [ ] Keine Build-Fehler

---

## 🌐 PHASE 6: Frontend Deployment (Vercel)

### Deploy via Dashboard
- [ ] Vercel Dashboard: **Add New** → **Project**
- [ ] Frontend Repo ausgewählt
- [ ] Framework: **Vite**
- [ ] Build Command: `npm run build` (oder `bun run build`)
- [ ] Output Directory: `dist`

### Environment Variables
- [ ] `VITE_API_URL` = `https://vip-shop-backend-xxxxx.vercel.app`

### Nach Deploy
- [ ] Deploy erfolgreich (keine Fehler)
- [ ] Frontend URL notiert: `https://webseite-mit-emojis-xxxxx.vercel.app`
- [ ] Website laden in Browser
- [ ] Keine 404 Fehler

---

## 🧪 PHASE 7: End-to-End Tests

### Frontend Tests
- [ ] Website lädt vollständig
- [ ] Navigation funktioniert
- [ ] UI-Elemente sichtbar
- [ ] Keine Fehler in DevTools Console (F12)

### API Tests
- [ ] Browser Console öffnen (F12)
- [ ] Teste einen API Call:
  ```javascript
  fetch('https://vip-shop-backend-xxxxx.vercel.app/health')
    .then(r => r.json())
    .then(console.log)
  ```
- [ ] Response sollte erfolg zeigen

### Formular Test (falls vorhanden)
- [ ] Formular ausfüllen
- [ ] Submit Button klicken
- [ ] Daten werden zu Backend gesendet (Network Tab)
- [ ] Erfolgreich in Supabase gespeichert

### Fehlerbehandlung
- [ ] Absichtlich falsches Passwort eingeben
- [ ] Fehler wird angezeigt (kein Crash)

---

## 🔐 PHASE 8: Sicherheit & Cleanup

### Secrets sicher
- [ ] `.env` ist NICHT im Repository
- [ ] `.env.example` zeigt nur Platzhalter
- [ ] Alle Secrets nur in Vercel gesetzt
- [ ] ADMIN_SECRET ist sicher und geheim

### Code sauber
- [ ] Keine `console.log()` Debuggings übrig
- [ ] Keine Test-Daten in Produktion
- [ ] Keine Local Development URLs in Produktion

### Monitoring einrichten
- [ ] Vercel Logs regelmäßig checken
- [ ] Supabase Logs überwachen
- [ ] Error Tracking aktivieren (optional)

---

## 📱 PHASE 9: Weitere Optimierungen (Optional)

### Eigene Domain
- [ ] Domain bei Registrar gekauft (z.B. namecheap.com)
- [ ] Domain zu Vercel hinzugefügt
- [ ] DNS Records aktualisiert
- [ ] SSL aktiviert (automatisch)

### Performance
- [ ] Frontend Build optimiert
- [ ] Bilder optimiert
- [ ] Caching konfiguriert

### Backups
- [ ] Supabase Daily Backups aktiviert
- [ ] GitHub als Backup für Code

---

## ✨ FERTIG!

Wenn alle Häkchen gesetzt sind:
- ✅ Website läuft online
- ✅ Backend antwortet
- ✅ Datenbank funktioniert
- ✅ Automatische Updates bei Git Push

**Herzlichen Glückwunsch! 🎉**

---

## 🆘 Probleme?

| Problem | Lösung |
|---------|--------|
| "Cannot find module" | `npm install` im Vercel Build ausführen - sollte automatisch sein |
| CORS Error | Backend CORS Origin anpassen + redeploy |
| Datenbank Fehler | Supabase Logs checken, Tabellen überprüfen |
| 404 nach Deploy | Vite Config `base` überprüfen |
| Environment Variables nicht gesetzt | Vercel Dashboard → Settings → Environment Variables überprüfen |

**Fragen?** Schau die `HOSTING_SETUP_GUIDE.md`!
