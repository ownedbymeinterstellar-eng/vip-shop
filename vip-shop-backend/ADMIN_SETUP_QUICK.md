# ⚡ Admin Panel - Quick Setup Guide

## 🚀 5-Minuten Setup

### Schritt 1: Dependencies installieren
```bash
cd vip-shop-backend
npm install jsonwebtoken
```

### Schritt 2: Environment Variables setzen
Erstelle/Update deine `.env` Datei:

```env
ADMIN_SECRET=your_super_secret_password_min_32_chars
JWT_SECRET=your_super_secret_jwt_key_min_64_chars_very_random
```

**Schnell generieren?** (PowerShell):
```powershell
# ADMIN_SECRET (32 Zeichen)
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})

# JWT_SECRET (64 Zeichen) 
-join ((65..90) + (97..122) + (48..57) + (33..47) | Get-Random -Count 64 | ForEach-Object {[char]$_})
```

### Schritt 3: Server starten
```bash
npm start
```

### Schritt 4: Admin-Login testen
Öffne deinen Browser und gehe zu:
```
http://localhost:3000/health
```

Sollte anzeigen:
```json
{"status":"ok","timestamp":"..."}
```

---

## 📱 Admin-Panel nutzen

### URL für Production
```
https://vipshop.cloud/admin-secure.html
```

### URL lokal
```
http://localhost:8000/admin-secure.html
```

### Login
1. Admin-Secret eingeben (aus deiner .env)
2. Button "Anmelden" klicken
3. JWT-Token wird gespeichert (localStorage)
4. Panel wird geladen (wird noch erweitert)

---

## 🔒 Sicherheits-Checkliste

Bevor du online gehst:

- [ ] `ADMIN_SECRET` in .env gesetzt (mindestens 32 Zeichen)
- [ ] `JWT_SECRET` in .env gesetzt (mindestens 64 Zeichen)
- [ ] `npm install jsonwebtoken` ausgeführt
- [ ] Server startet ohne Fehler
- [ ] `/health` endpoint antwortet
- [ ] `/api/admin/login` funktioniert lokal

---

## 🛠️ Troubleshooting

### "Cannot find module 'jsonwebtoken'"
```bash
npm install jsonwebtoken
```

### "Unauthorized" beim Admin-Login
- Admin-Secret ist falsch
- Zu viele Versuche (warte 60 Minuten)

### Token funktioniert nicht
- Token ist abgelaufen (8 Stunden)
- JWT_SECRET wurde geändert
- Neu anmelden

---

## 📊 API-Endpoints Übersicht

| Methode | Endpoint | Auth | Beschreibung |
|---------|----------|------|-------------|
| POST | `/api/admin/login` | Secret | Admin-Secret eingeben, JWT-Token erhalten |
| GET | `/api/admin/verify` | JWT | Token validieren |
| GET | `/api/admin/orders` | JWT | Alle Orders abrufen |
| POST | `/api/admin/approve/:id` | JWT | Order genehmigen |
| POST | `/api/admin/reject/:id` | JWT | Order ablehnen |
| POST | `/api/admin/finish/:id` | JWT | Order abschließen |

---

## 💡 Tipps

1. **Token speichert sich automatisch** - Wird im Browser localStorage gespeichert
2. **8 Stunden gültig** - Nach 8 Stunden musst du dich neu anmelden
3. **Rate-Limit beachten** - Max 5 Login-Versuche pro Stunde pro IP
4. **Sicheres Secret** - Nutze komplexe Passwörter mit Großbuchstaben, Zahlen, Sonderzeichen

---

Weitere Details: Siehe `ADMIN_SECURITY.md`
