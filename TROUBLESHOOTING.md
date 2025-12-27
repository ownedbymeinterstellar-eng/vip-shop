# 🔧 Troubleshooting Guide

Hier findest du Lösungen für häufige Probleme!

---

## ❌ Frontend: Weiße Seite / Nichts lädt

### Problem
Nach dem Deploy sehe ich nur eine weiße Seite.

### Mögliche Ursachen & Lösungen

**1. Build Error**
```bash
# Gehe zu Vercel Dashboard → Deployments → Letzter Deploy
# Schau die Logs - dort steht der Fehler
```

Häufige Build-Fehler:
- `Module not found` → `npm install` hat nicht alle Dependencies installiert
- `TypeScript Error` → Type-Fehler in deinem Code
- `Build command failed` → Falscher Build-Command

**Lösung:**
```bash
# Lokal testen
npm run build
npm run preview
# Wenn Fehler, beheben und committen
git add .
git commit -m "Fix build error"
git push
```

**2. Vite Base Path falsch**

In `vite.config.ts` überprüfen:
```typescript
base: '/',  // Das sollte / sein (oder dein Repo-Name)
```

**3. CSS/Bilder laden nicht**

Gehe zu Browser DevTools (F12) → Network Tab
- Überprüfe: Laden die Assets mit den richtigen Pfaden?
- URL sollte z.B. sein: `https://domain.vercel.app/assets/...`
- Falls Fehler: Vite Config `base` anpassen

---

## 🔴 Frontend: CORS Error

### Problem
In der Browser Console (F12 → Console) sehe ich:
```
Access to XMLHttpRequest has been blocked by CORS policy
```

### Ursache
Der Backend erlaubt Requests von dieser Frontend-URL nicht.

### Lösung

**Schritt 1:** Frontend URL von Vercel kopieren
```
https://webseite-mit-emojis-abc123.vercel.app
```

**Schritt 2:** Backend CORS anpassen

Öffne `vip-shop-backend/server.js` (Zeile ~24):

```javascript
app.use(cors({
  origin: [
    'http://localhost:8000',
    'http://localhost:3000',
    'https://webseite-mit-emojis-abc123.vercel.app'  // ← HINZUFÜGEN
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'x-admin-secret']
}));
```

**Schritt 3:** Pushen
```bash
git add vip-shop-backend/server.js
git commit -m "Update CORS for production"
git push
```

**Schritt 4:** Warten bis Backend redeploy fertig
- Vercel Dashboard → Backend Projekt → Deployments
- Warten bis Status "Ready" ist (grüner Haken)

**Schritt 5:** Frontend neu laden
```
Strg+Shift+R  (oder Cmd+Shift+R auf Mac)
```

---

## 🔴 Backend: API antwortet nicht / 500 Error

### Problem
API Call gibt 500 Error oder `Cannot GET /order`

### Mögliche Ursachen & Lösungen

**1. Supabase nicht verbunden**

Überprüfe Environment Variables in Vercel:
- Vercel Dashboard → Backend Projekt → Settings → Environment Variables
- Sind diese gesetzt?
  - [ ] `SUPABASE_URL`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY`
  - [ ] `ADMIN_SECRET`
  - [ ] `NODE_ENV`

Wenn nicht: Hinzufügen und Redeploy erzwingen
```bash
vercel redeploy
```

**2. Supabase Credentials falsch**

SUPABASE_URL sollte so aussehen:
```
https://your-project-id.supabase.co
```

SUPABASE_SERVICE_ROLE_KEY sollte so aussehen:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ...
```

Wenn falsch: Richtige Werte von Supabase kopieren und aktualisieren.

**3. Tabellen existieren nicht**

Überprüfe in Supabase Dashboard:
- Gehe zu **Table Editor**
- Siehst du `orders` und `used_codes` Tabellen?

Falls nicht:
- Gehe zu **SQL Editor** → **New Query**
- Führe das SQL Script aus (siehe HOSTING_SETUP_GUIDE.md)

**4. Logs anschauen**

```bash
vercel logs --tail
```

Das zeigt dir in Echtzeit was passiert!

---

## ⚠️ Backend: "Unauthorized" Error (401)

### Problem
API antwortet mit `{ error: 'Unauthorized' }`

### Ursache
Admin-Secret ist falsch oder nicht gesetzt.

### Lösung

**1. Admin-Secret überprüfen**

In `vip-shop-backend/server.js` Zeile ~10:
```javascript
const ADMIN_SECRET = process.env.ADMIN_SECRET;
```

**2. Environment Variable setzen**

Vercel Dashboard → Backend Projekt → Settings → Environment Variables
- `ADMIN_SECRET` muss gesetzt sein (z.B. `super_secret_123`)

**3. Client-Code überprüfen**

Wenn du Admin-Endpoints aufrufst, brauchst du den Header:
```javascript
fetch('/admin/orders', {
  headers: {
    'x-admin-secret': 'super_secret_123'  // Gleicher Wert wie in Vercel!
  }
})
```

---

## 📦 Abhängigkeiten: "Cannot find module"

### Problem
```
Error: Cannot find module 'express'
```

### Ursache
Dependencies wurden nicht installiert.

### Lösung

**Vercel sollte `npm install` automatisch ausführen!**

Falls nicht:
1. Vercel Dashboard → Backend → Deployments → Letzter Deploy → Logs
2. Schau ob `npm install` ausgeführt wurde
3. Falls nicht: `.npmrc` Datei erstellen:

```
# vip-shop-backend/.npmrc
engine-strict=true
```

**Alternative: Build Script spezifizieren**

Vercel Dashboard → Backend → Settings → Build & Development:
- **Build Command**: `npm install && npm run build` (falls relevant)
- **Output Directory**: `.` (aktuelles Verzeichnis)

---

## 🌍 Environment Variables in Frontend

### Problem
Frontend kennt die Backend URL nicht.

### Ursache
`VITE_API_URL` nicht gesetzt oder falsch.

### Lösung

**1. Environment Variable in Vercel setzen**

Vercel Dashboard → Frontend Projekt → Settings → Environment Variables:
- Key: `VITE_API_URL`
- Value: `https://dein-backend.vercel.app`

**2. In Code verwenden**

Datei `src/config.ts`:
```typescript
export const API_BASE_URL = import.meta.env.PROD
  ? import.meta.env.VITE_API_URL
  : 'http://localhost:3000';
```

**3. Überprüfen in Dev-Build**

```bash
npm run build
cat dist/index.html
# Überprüfe ob die URL eingebettet ist
```

---

## 🔐 Secrets-Sicherheit: Keys in GitHub gepusht

### ⚠️ WICHTIG: Du hast Secrets in GitHub gepusht!

**Sofort handeln:**
1. Neue Supabase-Keys generieren (alte revoken)
2. Git History bereinigen (git filter-branch oder BFG)
3. Repo als Private setzen (fallback, aber nicht ideal)

**Verhindere das in Zukunft:**

Stelle sicher:
- `.env` ist in `.gitignore`
- `SUPABASE_SERVICE_ROLE_KEY` ist NIEMALS im Code
- Verwende nur `SUPABASE_ANON_KEY` im Frontend-Code (niemals Service Role Key!)

---

## 🚀 Deploy dauert ewig / Hängt fest

### Problem
Deploy läuft seit 30 Minuten, Status unbekannt.

### Lösung

**1. Abbrechen**
```bash
vercel cancel
```

**2. Logs checken**
```bash
vercel logs --tail
```

**3. Redeploy erzwingen**
```bash
vercel redeploy
```

**4. Cached Dependencies löschen**
Vercel Dashboard → Project Settings → Build Cache → Clear All

---

## 📝 Logs lesen

### Terminal Logs
```bash
# Echtzeitlogs (Cmd+C zum Stoppen)
vercel logs --tail

# Letzte 100 Zeilen
vercel logs

# Mit Filtring
vercel logs | grep error
```

### Vercel Dashboard Logs
1. Vercel Dashboard → Dein Projekt
2. Klick auf **Deployments**
3. Wähle einen Deploy
4. Tabs: **Logs** oder **Runtime Logs**

### Browser Logs
1. Website öffnen
2. F12 → Console Tab
3. Alle Fehler/Warnungen dort sichtbar

---

## 🆘 Immer noch nicht gelöst?

**Checkliste:**
- [ ] Alle Environment Variables gesetzt?
- [ ] GitHub Push erfolgreich?
- [ ] Vercel Deploy erfolgreich? (Status: Ready)
- [ ] CORS Konfiguration aktualisiert?
- [ ] Frontend URL im Backend CORS eingetragen?
- [ ] Supabase Tabellen existieren?
- [ ] Logs gecheckt?

**Dann:**
1. Schau die `HOSTING_SETUP_GUIDE.md` von vorne durch
2. Teste lokal: `npm run dev` im Backend
3. Teste lokal: `npm run dev` im Frontend
4. Wenn lokal funktioniert aber online nicht → Environment Variables Problem

---

## 📞 Noch Fragen?

- Vercel Docs: https://vercel.com/docs
- Supabase Docs: https://supabase.com/docs
- Express Docs: https://expressjs.com
- Vite Docs: https://vitejs.dev

Viel Erfolg! 🚀
