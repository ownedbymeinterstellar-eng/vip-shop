# ⚡ Quick Start - Schaffst du in 20 Minuten!

Wenn du schnell online gehen willst: Folge diesem Guide!

---

## 1️⃣ GitHub Repository (2 Min)

```bash
# Im Projekt-Verzeichnis
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/DEIN-USERNAME/vip-shop.git
git push -u origin main
```

Gehe zu https://github.com/new und erstelle das Repo vorher!

---

## 2️⃣ Supabase Setup (3 Min)

1. Gehe zu https://supabase.com → **Sign Up**
2. Erstelle ein neues Projekt
3. Kopiere diese Keys (Settings → API):
   ```
   SUPABASE_URL = https://...
   SUPABASE_SERVICE_ROLE_KEY = eyJ...
   ```
4. Gehe zu **SQL Editor** → **New Query** und führe aus:
   ```sql
   CREATE TABLE orders (id TEXT PRIMARY KEY, product_name TEXT NOT NULL, payment_method TEXT NOT NULL, code TEXT NOT NULL UNIQUE, telegram_username TEXT, status TEXT DEFAULT 'pending', created_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW());
   CREATE TABLE used_codes (code TEXT PRIMARY KEY, order_id TEXT NOT NULL, FOREIGN KEY (order_id) REFERENCES orders(id));
   ```

---

## 3️⃣ Backend auf Vercel (5 Min)

1. Gehe zu https://vercel.com → **Sign Up with GitHub**
2. **Add New Project** → Wähle `vip-shop-backend`
3. Environment Variables hinzufügen:
   - `SUPABASE_URL` = [Von Supabase kopiert]
   - `SUPABASE_SERVICE_ROLE_KEY` = [Von Supabase kopiert]
   - `ADMIN_SECRET` = `super_secret_123`
   - `NODE_ENV` = `production`
4. **Deploy**
5. **URL merken**: z.B. `https://vip-shop-backend-abc123.vercel.app`

---

## 4️⃣ Frontend updaten (2 Min)

Öffne `webseite mit emojis/src/config.ts` und stelle sicher, dass die Backend-URL korrekt ist:

```typescript
export const API_BASE_URL = import.meta.env.PROD
  ? 'https://vip-shop-backend-abc123.vercel.app'  // ← DEINE BACKEND URL
  : 'http://localhost:3000';
```

Speichern und pushen:
```bash
git add .
git commit -m "Update backend URL"
git push
```

---

## 5️⃣ Frontend auf Vercel (5 Min)

1. Vercel Dashboard → **Add New Project**
2. Wähle `webseite mit emojis`
3. Wähle Framework: **Vite**
4. Environment Variables:
   - `VITE_API_URL` = `https://vip-shop-backend-abc123.vercel.app`
5. **Deploy**

---

## 🎉 FERTIG!

Deine Website ist online! 🚀

- Frontend: `https://webseite-mit-emojis-xxxxx.vercel.app`
- Backend: `https://vip-shop-backend-xxxxx.vercel.app`
- Datenbank: Supabase

**Jedes Mal wenn du zu GitHub pushst, wird alles automatisch aktualisiert!**

---

## 🧪 Test ob es funktioniert

Öffne die Frontend URL im Browser und teste:
1. Seite lädt vollständig
2. Keine Fehler in DevTools (F12 → Console)
3. API Calls funktionieren

---

## ❓ Was ist falsch gelaufen?

- **"Weiße Seite"**: Gehe zu Vercel Dashboard → Deployments → Logs
- **CORS Error**: Backend CORS anpassen + redeploy
- **Datenbank Fehler**: Supabase Dashboard → Tabellen überprüfen

---

**Mehr Details?** Siehe `HOSTING_SETUP_GUIDE.md` oder `DEPLOYMENT_CHECKLISTE.md`

Happy Hosting! 🎊
