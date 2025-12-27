# SendGrid Email-Debugging für VIP Shop

## Problem: Emails werden nicht versendet

Wenn du SendGrid nutzt und Kunden erhalten nach der Bestellung keine Emails, folge diesen Schritten zum Debuggen.

## Schritt 1: Test-Email senden

Nutze die neue Test-Route, um eine Email zu senden:

### Mit curl:
```bash
curl -X POST https://api.vipshop.cloud/admin/test-email \
  -H "x-admin-secret: dein-admin-secret" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "deine-test-email@gmail.com",
    "type": "initial"
  }'
```

### Mit Postman:
1. POST: `https://api.vipshop.cloud/admin/test-email`
2. Header: `x-admin-secret: dein-admin-secret`
3. Body (JSON):
```json
{
  "email": "deine-test-email@gmail.com",
  "type": "initial"
}
```

### Email-Typen zum Testen:
- `initial` - Bestellungsbestätigung
- `approval` - Genehmigung
- `completion` - Code-Versand
- `rejection` - Ablehnung

## Schritt 2: Logs überprüfen

Nach dem Test-Email-Request:

1. **Lokal**: Schaue in die Terminal-Ausgabe
2. **Vercel**: 
   - Gehe zu Vercel Dashboard → Dein Projekt
   - Klicke auf "Deployments"
   - Öffne den aktuellen Deployment
   - Schaue in die "Functions" Logs

Du solltest eine der folgenden Meldungen sehen:

### ✅ Erfolgreiche Emails:
```
📧 Sending email to deine-email@example.com with subject: "📋 Deine Bestellung wurde erhalten - VIP Shop"
✓ Email Service: Configured and ready
✓ Email successfully sent to deine-email@example.com: message-id-here
```

### ❌ Fehler 1: Credentials fehlen
```
⚠️ Email Service: Missing credentials (EMAIL_USER or EMAIL_PASSWORD not set)
⚠️ Email not configured - skipping email send to deine-email@example.com
```

**Lösung**: Überprüfe in Vercel, dass diese Variablen gesetzt sind:
- `EMAIL_HOST`
- `EMAIL_PORT`
- `EMAIL_USER=apikey`
- `EMAIL_PASSWORD=SG.xxxxxxxxxxxxx`
- `EMAIL_FROM`

### ❌ Fehler 2: SendGrid API Key ungültig
```
❌ Error sending email to deine-email@example.com:
   Subject: "📋 Deine Bestellung wurde erhalten - VIP Shop"
   Error: Invalid API key provided
   Code: EAUTH
```

**Lösung**: 
1. Gehe zu SendGrid Dashboard: https://app.sendgrid.com/
2. Klicke auf "API Keys" (oder "Settings" → "API Keys")
3. Erstelle einen neuen API Key mit voller Berechtigung (Full Access)
4. Aktualisiere die `EMAIL_PASSWORD` Variable in Vercel mit dem neuen Key

### ❌ Fehler 3: Ungültige Absender-Email
```
❌ Error sending email to deine-email@example.com:
   Subject: "..."
   Error: The from email address does not contain a valid address
   Code: ENOTALLOWED
```

**Lösung**:
1. In SendGrid muss die `EMAIL_FROM` Adresse verifiziert sein
2. Gehe zu SendGrid Dashboard → "Settings" → "Sender Authentication"
3. Verifiziere die Email-Adresse, die du in `EMAIL_FROM` verwendest
4. Oder nutze eine bereits verifizierte Adresse

## Schritt 3: Bestellungs-Workflow überprüfen

Die Emails sollten automatisch in diesen Momenten versendet werden:

1. **Bestellung erstellt** (Kunde sieht Erfolgsmeldung)
   → `sendInitialOrderEmail` wird aufgerufen
   → Email sollte ankommen

2. **Admin genehmigt Bestellung** (im Admin Panel)
   → `sendApprovalEmail` wird aufgerufen
   → Email mit Telegram-Link sollte ankommen

3. **Admin schließt Bestellung ab** (im Admin Panel)
   → `sendCompletionEmail` wird aufgerufen
   → Email mit dem Code sollte ankommen

4. **Admin lehnt ab** (im Admin Panel)
   → `sendRejectionEmail` wird aufgerufen
   → Email mit Ablehnungsgrund sollte ankommen

## Häufige Probleme & Lösungen

### Problem: "Email wird versendet" aber kommt nicht an
**Wahrscheinliche Ursachen:**
1. Email landet im SPAM
2. Absender-Adresse ist nicht verifiziert
3. SendGrid-Account hat tägliches Versend-Limit erreicht

**Lösung:**
- Überprüfe den SPAM-Ordner
- Versuche eine andere Absender-Adresse zu testen
- Überprüfe SendGrid Dashboard → "Logs" um zu sehen, was versendet wurde

### Problem: "Fehler beim Laden der Bestellungen" im Admin Panel
Das könnte mit Emails gar nichts zu tun haben, sondern:
- Admin Secret ist falsch
- Backend läuft nicht
- Supabase-Verbindung funktioniert nicht

### Problem: Neue Umgebungsvariablen werden nicht erkannt
Nach dem Hinzufügen von neuen Variablen in Vercel:
1. Der Server wird automatisch neu deployiert
2. Warte 1-2 Minuten auf den neuen Deployment
3. Teste dann eine neue Email

## Schnelle Checkliste

- [ ] `EMAIL_USER=apikey` ist gesetzt
- [ ] `EMAIL_PASSWORD=SG.xxx` ist gesetzt und gültig
- [ ] `EMAIL_HOST=smtp.sendgrid.net` ist gesetzt
- [ ] `EMAIL_PORT=587` ist gesetzt
- [ ] `EMAIL_FROM` ist eine verifizierte Absender-Adresse
- [ ] Ich habe eine Test-Email versendet und sie ist angekommen
- [ ] Bestellungen zeigen jetzt die Erfolgsseite mit Bestellungs-ID an

Wenn alles ✓ ist, sollten Emails funktionieren!
