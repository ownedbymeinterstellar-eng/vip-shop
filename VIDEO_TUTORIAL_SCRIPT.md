# 🎬 Video Tutorial Script - Deployment in 10 Minuten

Verwende diesen Text als Grundlage für ein Video oder Bildschirmaufnahme.

---

## 📹 Szene 1: Intro (0:00-0:30)

**Text auf Bildschirm:**
```
Kostenlos Hosting für Frontend + Backend
Mit Vercel + Supabase
Dauert nur 10 Minuten! ⚡
```

**Sprecher:** 
"Hallo! Heute zeige ich dir, wie du deine React Website mit Node.js Backend kostenlos hosten kannst - auf Vercel und Supabase. Es dauert keine 10 Minuten!"

---

## 📹 Szene 2: Was wird benötigt? (0:30-1:00)

**Zeige auf dem Bildschirm:**
1. GitHub Account
2. Vercel Account (kostenlos)
3. Supabase Account (kostenlos)

**Sprecher:**
"Du brauchst drei Dinge:
1. Ein GitHub Account - da ist dein Code
2. Vercel für dein Frontend und Backend
3. Supabase für die Datenbank"

---

## 📹 Szene 3: GitHub Repo hochladen (1:00-2:30)

**Zeige:**
- Terminal öffnen
- `git init` ausführen
- `git add .` ausführen
- `git commit -m "Initial commit"` ausführen
- GitHub neue Repo erstellen
- `git remote add origin...` ausführen
- `git push -u origin main` ausführen

**Sprecher:**
"Schritt 1: Code zu GitHub hochladen. Öffne das Terminal im Projekt-Ordner.

Erst initialisieren wir Git, adden alle Dateien, und machen einen Commit. Dann erstelle ich auf GitHub ein neues Repository - wichtig: Public, damit Vercel es sehen kann.

Dann verbinde ich das lokale Repo mit GitHub und pushe alles rauf."

---

## 📹 Szene 4: Supabase Setup (2:30-4:00)

**Zeige Website:**
- Gehe zu supabase.com
- Sign Up
- Create New Project
- Kopiere URL und Keys

**Dann in SQL Editor:**
- Paste das SQL Script
- Führe aus
- Tabellen werden angezeigt

**Sprecher:**
"Schritt 2: Datenbank auf Supabase.

Ich gehe zu supabase.com und erstelle ein neues Projekt. Das dauert etwa 1 Minute.

Danach gehe ich zu SQL Editor und führe ein Script aus, das meine Tabellen erstellt. Boom - Datenbank ist fertig!

Jetzt kopiere ich die wichtigen Keys: Project URL und Service Role Secret. Diese brauch ich für den Backend."

---

## 📹 Szene 5: Backend Deployment (4:00-6:30)

**Zeige Website:**
- Gehe zu vercel.com
- Sign In with GitHub
- Add New Project
- Wähle Backend Repo

**Dann:**
- Framework: Node.js
- Environment Variables hinzufügen:
  - SUPABASE_URL
  - SUPABASE_SERVICE_ROLE_KEY
  - ADMIN_SECRET
  - NODE_ENV

**Sprecher:**
"Schritt 3: Backend auf Vercel deployen.

Ich gehe zu Vercel, melde mich mit GitHub an, und importiere mein Backend Projekt.

Dann muss ich noch die Environment Variables setzen - das sind sozusagen die Geheimnisse, die der Backend braucht:
- Supabase URL
- Supabase Secret Key
- Admin Secret für die Admin-Endpoints
- Node Environment auf 'production'

Dann klick ich Deploy und warte... und fertig! Der Backend läuft online!"

**Sprecher (nach Deploy):**
"Die Backend URL ist jetzt: [Backend URL kopieren und anzeigen]"

---

## 📹 Szene 6: Frontend vorbereiten (6:30-7:30)

**Zeige Code Editor:**
- Öffne `src/config.ts`
- Ändere Backend URL
- Speichern

**Terminal:**
- `git add .`
- `git commit -m "Update backend URL"`
- `git push`

**Sprecher:**
"Schritt 4: Frontend Konfiguration.

Der Frontend braucht zu wissen, wo der Backend ist. Ich öffne die config.ts Datei und trage die Backend URL ein.

Dann pushe ich die Änderung zu GitHub."

---

## 📹 Szene 7: Frontend Deployment (7:30-9:30)

**Zeige Website:**
- Vercel Dashboard
- Add New Project
- Wähle Frontend Repo
- Framework: Vite
- Environment Variables: VITE_API_URL
- Deploy

**Sprecher:**
"Schritt 5: Frontend deployen.

Wieder in Vercel, diesmal das Frontend Repo. Ich wähle Vite als Framework, setze die Backend URL als Environment Variable, und click Deploy!

Während der Deploy läuft, kann ich schon die finale URL sehen..."

---

## 📹 Szene 8: Test (9:30-10:00)

**Zeige:**
- Frontend URL im Browser
- Website lädt
- DevTools → Console → Keine Fehler
- Teste einen API Call

**Sprecher:**
"Schritt 6: Testen.

Ich öffne meine Website im Browser... und sie lädt! Super!

Ich öffne die DevTools um sicherzustellen, dass es keine Fehler gibt... alles sauber!

Jetzt teste ich noch, ob API Calls funktionieren... ja, alles läuft!"

---

## 📹 Szene 9: Outro (10:00-10:30)

**Text auf Bildschirm:**
```
✅ Website Online!
✅ Automatische Updates
✅ Kostenlos
✅ Scalable

Nächstes Video: Eigene Domain
```

**Sprecher:**
"Fertig! Deine Website läuft jetzt online - kostenlos!

Das Beste: Jedes Mal wenn du Code zu GitHub pushst, wird dein Website automatisch aktualisiert.

Falls du noch Probleme hast, schau die HOSTING_SETUP_GUIDE.md im Repo!

Bis bald! 👋"

---

## 🎥 Tipps für das Video

### Schnitte
- Schnelle Übergänge zwischen Schritten
- Terminal Output beschleunigen (x2 Speed wo möglich)
- Deploy Wartezeit raff-schnell zeigen (oder schneiden)

### Sound
- Hintergrund Musik: Chillhop / Lofi
- Laut und klar sprechen
- Gelegentliche Soundeffekte (z.B. bei erfolgreichen Deployments)

### Visuals
- Zoom in auf wichtige Text-Teile
- Cursor Bewegungen deutlich zeigen
- Text-Overlays für wichtige URLs/Keys

### CTA (Call to Action)
- "Like und Subscribe!"
- "Fragen in den Kommentaren?"
- "Nächstes Video in 2 Wochen!"

---

## 📊 Timing
- Total: 10 Minuten
- Ideal für YouTube Shorts erweiterbar (Kapitel-Schnitte)
- Mit Pausen zum Typen: 12-15 Minuten

Viel Spaß beim Filmen! 🎬
