# Supabase Setup Guide - VIP Shop Backend

## 🚀 Schritt-für-Schritt Anleitung

### 1. Supabase Projekt erstellen

1. Gehe zu [supabase.com](https://supabase.com)
2. Klicke auf **"Sign in"** und erstelle einen kostenlosen Account
3. Klicke auf **"New Project"**
4. Fülle die Informationen aus:
   - **Name**: z.B. "vip-shop"
   - **Database Password**: Sicheres Passwort wählen
   - **Region**: Wähle eine Region nah bei dir (z.B. Europe)
5. Klicke **"Create new project"** und warte bis es erstellt ist (1-2 Minuten)

---

### 2. API Keys kopieren

Nach der Projekterstellung findest du die Credentials im Dashboard:

1. Gehe zu **Settings** → **API**
2. Kopiere folgende Werte:
   - **Project URL** → `SUPABASE_URL`
   - **anon public** → `SUPABASE_ANON_KEY`
   - **service_role secret** → `SUPABASE_SERVICE_ROLE_KEY`

---

### 3. `.env` Datei updaten

Öffne `vip-shop-backend/.env` und ersetze die Placeholder-Werte:

```env
PORT=3000
NODE_ENV=development
ADMIN_SECRET=your-secret-admin-key-change-this

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

### 4. Datenbanktabellen erstellen

Gehe zu **SQL Editor** im Supabase Dashboard und führe folgende SQL-Befehle aus:

```sql
-- Tabelle: orders
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  product_name TEXT NOT NULL,
  payment_method TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabelle: used_codes
CREATE TABLE IF NOT EXISTS used_codes (
  code TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE
);

-- Indizes für bessere Performance
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_used_codes_order_id ON used_codes(order_id);
```

---

### 5. Row Level Security (RLS) konfigurieren (Optional aber empfohlen)

Um die Datenbank zu sichern, kannst du RLS aktivieren:

**Für `orders` Tabelle:**

```sql
-- RLS aktivieren
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Policy: Jeder kann seine eigene Bestellung sehen
CREATE POLICY "Users can view their own orders"
  ON orders FOR SELECT
  USING (auth.uid()::text = id OR NOT auth.role() = 'authenticated');

-- Policy: Nur Service Role kann Bestellungen erstellen/updaten
CREATE POLICY "Only service role can create orders"
  ON orders FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Only service role can update orders"
  ON orders FOR UPDATE
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
```

---

### 6. Abhängigkeiten installieren

```bash
cd vip-shop-backend
npm install
```

---

### 7. Backend starten

```bash
# Entwicklung (mit Auto-Reload)
npm run dev

# Production
npm start
```

Der Server startet auf `http://localhost:3000`

---

## 📝 Umweltumgebungs-Variablen

| Variable | Beschreibung | Beispiel |
|----------|-------------|---------|
| `PORT` | Port des Servers | `3000` |
| `NODE_ENV` | Umgebung | `development` oder `production` |
| `ADMIN_SECRET` | Secret für Admin-Endpoints | `your-secret-key` |
| `SUPABASE_URL` | Supabase Projekt URL | `https://xxxx.supabase.co` |
| `SUPABASE_ANON_KEY` | Public API Key | `eyJ...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Service Role Key | `eyJ...` |

---

## 🔗 API Endpoints

### Public Endpoints

**POST `/order`** - Bestellung erstellen
```json
{
  "product_name": "Premium Pack",
  "payment_method": "paysafecard",
  "code": "1234-5678-9012-3456"
}
```

**GET `/order/:id`** - Bestellungsstatus abrufen
```
GET /order/550e8400-e29b-41d4-a716-446655440000
```

**GET `/health`** - Health Check
```
GET /health
```

### Admin Endpoints (benötigt `x-admin-secret` Header)

**GET `/admin/orders`** - Alle ausstehenden Bestellungen
```
GET /admin/orders?status=pending
Header: x-admin-secret: your-secret-key
```

**POST `/admin/approve/:id`** - Bestellung genehmigen
```
POST /admin/approve/550e8400-e29b-41d4-a716-446655440000
Header: x-admin-secret: your-secret-key
```

**POST `/admin/reject/:id`** - Bestellung ablehnen
```
POST /admin/reject/550e8400-e29b-41d4-a716-446655440000
Header: x-admin-secret: your-secret-key
```

---

## 🐛 Häufige Probleme

### Problem: "SUPABASE_URL und SUPABASE_SERVICE_ROLE_KEY müssen gesetzt sein"
**Lösung**: Überprüfe deine `.env` Datei und stelle sicher, dass die Werte korrekt eingetragen sind.

### Problem: "Database error"
**Lösung**: 
1. Überprüfe die Tabellen im Supabase Dashboard
2. Stelle sicher, dass RLS nicht aktiviert ist (oder die Policies korrekt konfiguriert sind)
3. Prüfe die Supabase Logs im Dashboard

### Problem: Verbindungsfehler zu Supabase
**Lösung**:
1. Überprüfe deine Internetverbindung
2. Stelle sicher, dass der Supabase Projekt aktiv ist
3. Teste die API Keys im Supabase Dashboard

---

## 📚 Weitere Ressourcen

- [Supabase Dokumentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [PostgreSQL Dokumentation](https://www.postgresql.org/docs/)

---

## ✅ Deployment

### Auf Vercel, Railway, Render, etc. deployen:

1. Pushe deinen Code zu GitHub
2. Verbinde dein Repository mit dem Hosting-Service
3. Setze die Environment Variables im Dashboard:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ADMIN_SECRET`
   - `NODE_ENV=production`
4. Deploy!

---

**Viel Erfolg! 🎉**
