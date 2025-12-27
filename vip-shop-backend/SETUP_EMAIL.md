# Email-Konfiguration für VIP Shop

## Problem: Emails werden nicht versendet

Wenn Kunden nach der Bestellung **keine Email erhalten**, liegt das meist daran, dass die Email-Umgebungsvariablen nicht richtig konfiguriert sind.

## Schritt 1: Email-Anbieter einrichten (Gmail-Beispiel)

### Gmail mit App Password (empfohlen)

1. Gehe zu: https://myaccount.google.com/apppasswords
2. Wähle "Mail" und "Windows Computer"
3. Google generiert ein 16-stelliges Passwort
4. **Speichere dieses Passwort** - du wirst es gleich brauchen

## Schritt 2: Umgebungsvariablen in Vercel setzen

1. Gehe zu Vercel Dashboard → Dein Projekt
2. Klicke auf "Settings" → "Environment Variables"
3. Füge folgende Variablen hinzu:

```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=deine-email@gmail.com
EMAIL_PASSWORD=dein-16-stelliges-app-passwort
EMAIL_FROM=deine-email@gmail.com
```

⚠️ **WICHTIG:**
- `EMAIL_USER`: Deine vollständige Gmail-Adresse
- `EMAIL_PASSWORD`: Das 16-stellige App-Passwort (NICHT dein normales Passwort!)
- `EMAIL_FROM`: Kann gleich wie `EMAIL_USER` sein

## Schritt 3: Lokal testen (falls du lokal entwickelst)

Erstelle eine `.env` Datei im `vip-shop-backend` Ordner:

```
PORT=3000
NODE_ENV=development
ADMIN_SECRET=super_ultra_secret_123
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-key-here

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=deine-email@gmail.com
EMAIL_PASSWORD=dein-16-stelliges-app-passwort
EMAIL_FROM=deine-email@gmail.com
```

## Schritt 4: Server neu starten und testen

1. Starte den Backend-Server neu
2. Schaue in die Console-Logs:
   - ✓ Solltest du sehen: `✓ Email Service: Configured and ready`
   - ❌ Wenn du siehst: `⚠️ Email Service: Missing credentials` → Variablen sind nicht gesetzt!

3. Erstelle eine Test-Bestellung und überprüfe die Logs:
   - `📧 Sending email to...` → Email wird versendet
   - `✓ Email successfully sent to...` → Erfolg!
   - `❌ Error sending email to...` → Es gibt ein Problem

## Fehlerbehandlung

### "Missing credentials"
→ Umgebungsvariablen sind nicht gesetzt oder falsch geschrieben

### "SMTP Error: 535"
→ Das App-Passwort ist falsch. Generiere ein neues!

### "SMTP Error: 534"
→ Gmail hat die weniger sichere App blockiert. Nutze immer App Passwords!

### "SMTP Error: 535 5.7.8"
→ 2-Faktor-Authentifizierung ist aktiv. Nutze App Passwords!

## Alternative Email-Anbieter

Falls du nicht Gmail nutzen möchtest:

### SendGrid
```
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=apikey
EMAIL_PASSWORD=SG.xxxxxxxxxxxxx
```

### Mailgun
```
EMAIL_HOST=smtp.mailgun.org
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=postmaster@sandboxXXX.mailgun.org
EMAIL_PASSWORD=dein-passwort
```

## Logs überprüfen

Nach dem Deployment zu Vercel:
1. Gehe zu Vercel Dashboard → Dein Projekt
2. Klicke auf "Deployments"
3. Öffne den aktuellen Deployment
4. Klicke auf "Functions" oder die Logs um die Console-Ausgabe zu sehen

Dort solltest du die Email-Log-Einträge sehen!
