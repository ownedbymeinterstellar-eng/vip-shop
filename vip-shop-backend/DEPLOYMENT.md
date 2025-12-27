# Backend Deployment auf Vercel

## Quick Start

### 1. Vercel CLI installieren
```bash
npm install -g vercel
```

### 2. Einloggen
```bash
vercel login
```

### 3. Environment Variables setzen
```bash
vercel env add SUPABASE_URL
# Kopiere hier: https://your-project-id.supabase.co

vercel env add SUPABASE_SERVICE_ROLE_KEY
# Kopiere hier: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

vercel env add ADMIN_SECRET
# Gib ein sicheres Passwort ein: z.B. abc123xyz
```

### 4. Deployen
```bash
vercel
```

### 5. Produktions-URL kopieren
Nach dem Deploy siehst du die URL, z.B.:
```
https://vip-shop-backend-abc123.vercel.app
```

## Environment Variables von Supabase

1. Gehe zu https://supabase.com/dashboard
2. Wähle dein Projekt
3. Gehe zu **Settings** → **API**
4. Kopiere:
   - **Project URL** → `SUPABASE_URL`
   - **Service Role secret** → `SUPABASE_SERVICE_ROLE_KEY`

## Logs anschauen
```bash
vercel logs --tail
```

## Probleme?

### "Unauthorized" Fehler
- Überprüfe: Ist `ADMIN_SECRET` gesetzt?
- Überprüfe: Sind Requests in der Client-App den Secret-Header setzen?
  ```javascript
  fetch('/admin/orders', {
    headers: { 'x-admin-secret': 'your-secret' }
  })
  ```

### Supabase Connection Fehler
- Überprüfe: `SUPABASE_URL` und `SUPABASE_SERVICE_ROLE_KEY` korrekt?
- Überprüfe: Sind die Tabellen in Supabase erstellt?

## Redeploy erzwingen
```bash
vercel redeploy
```
