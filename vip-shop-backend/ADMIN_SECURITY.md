# 🔐 Admin Panel Security Implementation

## Was wurde geändert?

### 1. **JWT-Token Authentication System**
   - **Vorher**: Admin-Secret wurde bei jedem Request als Header übermittelt
   - **Nachher**: Admin meldet sich einmalig an und erhält einen JWT-Token (8 Stunden gültig)
   - **Vorteil**: Secret wird nur einmal übermittelt, nicht bei jedem Request

### 2. **Admin Login Rate-Limiting**
   - Max. 5 Anmeldeversuche pro IP-Adresse pro Stunde
   - Nach 5 Versuchen: 60-Minuten Sperrung
   - **Schutz vor**: Brute-Force-Attacken

### 3. **JWT-Token Middleware**
   - Alle Admin-Endpoints erfordern jetzt einen gültigen JWT-Token
   - Token wird automatisch nach 8 Stunden ungültig
   - **Neue Endpoints**:
     - `POST /api/admin/login` - Anmelden und Token erhalten
     - `GET /api/admin/verify` - Token-Gültigkeit prüfen
     - `GET /api/admin/orders` - Bestellungen abrufen (statt `/admin/orders`)
     - `POST /api/admin/approve/:id` - Bestellung genehmigen
     - `POST /api/admin/reject/:id` - Bestellung ablehnen
     - `POST /api/admin/finish/:id` - Bestellung abschließen

### 4. **Environment Variables**
   - `ADMIN_SECRET` - Für den Admin-Login (sollte 32+ Zeichen sein)
   - `JWT_SECRET` - Für Token-Signing (sollte 64+ Zeichen sein)

---

## Wie du es lokal testest

### 1. Dependencies installieren
```bash
cd vip-shop-backend
npm install jsonwebtoken
```

### 2. Environment Variables setzen (in .env oder als ENV-Variablen)
```bash
ADMIN_SECRET=mein_super_geheimes_admin_passwort
JWT_SECRET=mein_super_langer_jwt_secret_mindestens_64_zeichen_lang
```

### 3. Server starten
```bash
npm start
# oder
npm run dev
```

### 4. Admin-Login testen (via cURL oder Postman)
```bash
curl -X POST http://localhost:3000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"secret":"mein_super_geheimes_admin_passwort"}'
```

**Antwort:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": "8h",
  "message": "Authentication successful"
}
```

### 5. Mit Token Bestellungen abrufen
```bash
curl -X GET http://localhost:3000/api/admin/orders \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## Sicherheitsfeatures Zusammenfassung

| Feature | Vorher | Nachher |
|---------|--------|---------|
| **Auth-Methode** | Plain-Text Secret | JWT-Token |
| **Secret-Übermittlung** | Bei jedem Request | Nur beim Login |
| **Token-Lebensdauer** | Unbegrenzt | 8 Stunden |
| **Rate-Limiting** | Nur für Orders | ✅ Auch für Admin-Login |
| **Brute-Force-Schutz** | Nein | ✅ 5 Versuche/h, dann 60min Sperrung |
| **Token-Validierung** | N/A | ✅ Auf alle Admin-Endpoints |

---

## Deployment auf Production (Vercel)

### Wichtig: Diese Environment Variables setzen!

1. Gehe zu **Vercel Dashboard** → **Settings** → **Environment Variables**
2. Setze folgende Variablen:

```
ADMIN_SECRET=<generiere ein starkes Passwort, z.B. 32+ Zeichen>
JWT_SECRET=<generiere einen zufälligen String, mindestens 64 Zeichen>
```

**Tipps zum Generieren:**
```bash
# Linux/Mac
openssl rand -base64 32  # für ADMIN_SECRET
openssl rand -base64 64  # für JWT_SECRET

# Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object {Get-Random -Maximum 256}))
```

---

## Alte Routes sind deprecated (WICHTIG!)

Diese alten Routes funktionieren nicht mehr:
- ❌ `GET /admin/orders` → Nutze `GET /api/admin/orders`
- ❌ `POST /admin/approve/:id` → Nutze `POST /api/admin/approve/:id`
- ❌ `POST /admin/reject/:id` → Nutze `POST /api/admin/reject/:id`
- ❌ `POST /admin/finish/:id` → Nutze `POST /api/admin/finish/:id`

Header `x-admin-secret` funktioniert nicht mehr. Nutze stattdessen `Authorization: Bearer <token>`

---

## Admin-Panel Frontend (admin-secure.html)

Das neue Admin-Panel (`vip-shop-frontend/admin-secure.html`) hat:
- ✅ Login-Formular mit Admin-Secret
- ✅ Token wird lokal gespeichert (localStorage)
- ✅ Automatische Token-Erneuerung nach 8 Stunden (TODO)
- ✅ Sichere Anfragen mit JWT-Token
- ✅ Bessere UX mit Fehlerbehandlung

**Aktuelle Status**: Login-Seite funktioniert, Hauptpanel wird noch erweitert

---

## Nächste Schritte für später

1. ✅ JWT-Token Authentication
2. ✅ Rate-Limiting für Admin-Login
3. ✅ Neue Endpoints mit Middleware
4. ⏳ Komplettes Admin-Panel Frontend
5. ⏳ Audit-Logs für Admin-Aktionen
6. ⏳ 2FA für Admin-Login
7. ⏳ IP-Whitelist für Admin-Zugriffe

---

## Troubleshooting

### "Invalid token" Fehler
- Token ist abgelaufen (max 8 Stunden)
- JWT_SECRET wurde geändert
- Token wurde beschädigt

**Lösung**: Neu anmelden und neuen Token erhalten

### "Unauthorized" beim Admin-Login
- ADMIN_SECRET ist falsch
- Zu viele Anmeldeversuche (Rate-Limit)

**Lösung**: Warte 60 Minuten oder prüfe ADMIN_SECRET in .env

### npm install jsonwebtoken fehlgeschlagen
```bash
npm install jsonwebtoken --save
```

---

## Sicherheits-Checkliste für Production

- [ ] Beide `ADMIN_SECRET` und `JWT_SECRET` in Vercel Environment Variables gesetzt
- [ ] ADMIN_SECRET ist mindestens 32 Zeichen lang
- [ ] JWT_SECRET ist mindestens 64 Zeichen lang
- [ ] HTTPS auf Production Domain aktiviert
- [ ] Old admin.html ist deaktiviert/gelöscht
- [ ] Nur admin-secure.html wird benutzt
- [ ] Regelmäßige Backups der Supabase-Datenbank
- [ ] Audit-Logs werden geprüft
