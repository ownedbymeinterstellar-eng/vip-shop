# 🛠️ Setup Config Helper - Alle Schritte an einem Ort

Nutze dieses Dokument um deine Konfiguration zu tracken!

---

## 1️⃣ GitHub Repository

**Mein Repository:**
```
GitHub Repo URL: https://github.com/USERNAME/REPO-NAME
Repository-Name: _________________________
Private/Public: ☐ Public (WICHTIG für kostenloses Hosting)
```

**Checklist:**
- [ ] Repository erstellt
- [ ] Code mit `git push` hochgeladen
- [ ] Code sichtbar auf GitHub

---

## 2️⃣ Supabase Projekt

**Mein Supabase Projekt:**
```
Projekt Name: _________________________
Region: _________________________
Passwort: _________________________ (SICHER SPEICHERN!)
```

**API Credentials (SPEICHERE DIESE!):**
```
SUPABASE_URL: https://_____________________.supabase.co
SUPABASE_ANON_KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.___
SUPABASE_SERVICE_ROLE_KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.___
```

**Datenbank Setup:**
- [ ] SQL Script ausgeführt
- [ ] `orders` Tabelle erstellt
- [ ] `used_codes` Tabelle erstellt
- [ ] Tabellen sichtbar in Table Editor

---

## 3️⃣ Backend Configuration

**Mein Backend auf Vercel:**
```
Vercel Project Name: _________________________
Backend URL: https://_____________________________.vercel.app
Deploy Status: ☐ Ready ☐ Building ☐ Error
```

**Environment Variables (In Vercel gesetzt):**
- [ ] SUPABASE_URL = `https://_____.supabase.co`
- [ ] SUPABASE_SERVICE_ROLE_KEY = `eyJ...`
- [ ] ADMIN_SECRET = `_________________________`
- [ ] NODE_ENV = `production`

**Backend Test:**
- [ ] API antwortet: `curl https://BACKEND-URL/health`
- [ ] Keine 500 Fehler
- [ ] Supabase Verbindung funktioniert

---

## 4️⃣ Frontend Configuration

**Mein Frontend auf Vercel:**
```
Vercel Project Name: _________________________
Frontend URL: https://_____________________________.vercel.app
Deploy Status: ☐ Ready ☐ Building ☐ Error
```

**Environment Variables (In Vercel gesetzt):**
- [ ] VITE_API_URL = `https://BACKEND-URL.vercel.app`

**Lokale Config (src/config.ts):**
- [ ] API_BASE_URL zeigt auf Backend
- [ ] Lokal: `http://localhost:3000`
- [ ] Produktion: `https://BACKEND-URL.vercel.app`

---

## 5️⃣ CORS Configuration

**Backend CORS Origins (server.js Zeile ~24):**
```javascript
origin: [
  'http://localhost:8000',
  'http://localhost:3000',
  'https://DEIN-FRONTEND.vercel.app'  // ← Wichtig!
]
```

**Checklist:**
- [ ] CORS Origins aktualisiert
- [ ] Änderungen zu GitHub gepusht
- [ ] Backend redeploy fertig (Status: Ready)
- [ ] Keine CORS Errors im Browser (F12 → Console)

---

## 6️⃣ Security Checklist

**Secrets & Keys:**
- [ ] `.env` ist NICHT in GitHub (in .gitignore)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` ist NICHT im Client-Code
- [ ] `ADMIN_SECRET` ist sicher und geheim
- [ ] Nur öffentliche Keys sind im Code: `SUPABASE_ANON_KEY`

**Vercel Settings:**
- [ ] Environment Variables sind gesetzt
- [ ] Deployment Logs sind privat
- [ ] Automatische Deployments aktiviert (optional)

---

## 7️⃣ Testing Checklist

**Lokal testen:**
- [ ] Backend startet: `npm run dev` in Backend-Ordner
- [ ] Frontend startet: `npm run dev` in Frontend-Ordner
- [ ] Keine Fehler in DevTools Console
- [ ] API Calls funktionieren lokal

**Production testen:**
- [ ] Frontend URL öffnet Seite
- [ ] Seite lädt vollständig (keine 404/500)
- [ ] DevTools Console zeigt keine kritischen Fehler
- [ ] API Calls funktionieren (Network Tab)
- [ ] Daten werden in Supabase gespeichert

---

## 8️⃣ Wichtige Links

Speichere diese für später:

```
Dashboard-Links:
- Vercel Frontend: https://vercel.com/dashboard/PROJECT-NAME
- Vercel Backend: https://vercel.com/dashboard/PROJECT-NAME
- Supabase: https://supabase.com/dashboard/PROJECT-NAME
- GitHub: https://github.com/USERNAME/REPO-NAME

Dokumentation:
- Setup Guide: ./HOSTING_SETUP_GUIDE.md
- Checkliste: ./DEPLOYMENT_CHECKLISTE.md
- Troubleshooting: ./TROUBLESHOOTING.md
- Quick Start: ./QUICK_START.md
```

---

## 9️⃣ Probleme Aufgetreten?

**Falls etwas schiefläuft, überprüfe in dieser Reihenfolge:**

1. **Browser Console (F12 → Console)**
   - Siehst du Fehler?
   - CORS Fehler? → CORS anpassen
   - API Error? → Backend URL überprüfen

2. **Vercel Logs**
   ```bash
   vercel logs --tail
   ```
   - Deploy erfolgreich?
   - Welche Fehler stehen dort?

3. **Environment Variables**
   - Vercel Dashboard → Settings → Environment Variables
   - Alle gesetzt?
   - Keine Tippfehler?

4. **Supabase Dashboard**
   - Tabellen existieren?
   - Daten werden gespeichert?
   - Datenbank-Logs überprüfen

5. **Lokal testen**
   ```bash
   npm run dev
   # Backend und Frontend lokal starten
   # Funktioniert es lokal? Wenn ja → Environment Variables Problem
   ```

---

## 🎯 Status Übersicht

Markiere mit ✅ wenn fertig:

```
[ ] Phase 1: GitHub Setup
[ ] Phase 2: Supabase Setup
[ ] Phase 3: Backend Deployment
[ ] Phase 4: Frontend Konfiguration
[ ] Phase 5: Frontend Deployment
[ ] Phase 6: CORS Anpassung
[ ] Phase 7: End-to-End Testing
[ ] Phase 8: Live! 🚀
```

---

## 💡 Nächste Schritte (Optional)

Nach erfolgreichem Deployment:

### Eigene Domain
- [ ] Domain registrieren (namecheap.com, etc.)
- [ ] Zu Vercel hinzufügen (Project Settings → Domains)
- [ ] DNS Records aktualisieren
- [ ] SSL wird automatisch konfiguriert

### Monitoring
- [ ] Vercel Alerts aktivieren
- [ ] Supabase Backups aktivieren
- [ ] Error Tracking einrichten (optional)

### Weitere Optimierungen
- [ ] Analytics aktivieren
- [ ] Performance optimieren
- [ ] Caching konfigurieren
- [ ] CI/CD Pipeline erweitern

---

**Herzlichen Glückwunsch! Deine Website ist online! 🎉**

Speichere dieses Dokument für später - du wirst es brauchen, wenn du Updates machst!
