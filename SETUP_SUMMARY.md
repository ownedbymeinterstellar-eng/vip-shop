# VIP Shop Setup - 28.12.2025

## ✅ FUNKTIONIERT

### Deployment
- **Frontend:** Vercel (https://vipshop.cloud)
- **Backend:** Render (https://api.vipshop.cloud)
- **Datenbank:** Supabase

### Domains
- **vipshop.cloud:** A Record `216.198.79.1` (Vercel)
- **api.vipshop.cloud:** CNAME `vip-shop.onrender.com` (Render)

### Environment Variables (Render Backend)
- `SUPABASE_URL`: https://nvocayguhpocrcnypqhj.supabase.co
- `SUPABASE_SERVICE_ROLE_KEY`: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52b2NheWd1aHBvY3JjbnlwcWhqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Njc1NTA3NiwiZXhwIjoyMDgyMzMxMDc2fQ.PJnseMC7R1efOKqJSWt_r2h7N1CrPmPbEcV0dFeuelI
- `ADMIN_SECRET`: SWa?v%6sr&ge-5$7|T
- `RESEND_API_KEY`: re_9KphWyQa_DHyixSXGM1BAYWuHr6LPgcCa (aber Emails deaktiviert)
- `EMAIL_FROM`: noreply@vipshop.cloud

### GitHub Repository
- URL: https://github.com/ownedbymeinterstellar-eng/vip-shop
- Owner: ownedbymeinterstellar-eng
- Collaborator: justinprg

### Features
- ✅ Rate Limiting: 5 Bestellungen pro IP pro Stunde
- ✅ Email Verification Code: 6-stelliger Code (wird generiert, Email nicht gesendet)
- ✅ Code Format Validierung: Paysafecard + Cryptovoucher
- ✅ Supabase Datenbank
- ✅ Admin Panel: https://vipshop.cloud/admin.html (einfach ein Passwort eingeben)

## 🔧 WICHTIGE COMMITS

Letzte funktionierende Versionen:
- `4e3770e`: Replace reCAPTCHA with Rate Limiting and Email Verification
- `78127dd`: Add important 24h-48h processing time message

## 📝 NÄCHSTE SCHRITTE

1. Teste alles lokal mit `npm start` im Backend
2. Berichte Fehler dem Team
3. Für neuen Developer: Diesen File als Reference nutzen

## ⚠️ BEKANNTE PROBLEME

- Emails werden nicht wirklich gesendet (Resend/SendGrid deaktiviert)
- Admin Panel zeigt Orders aber Genehmigung/Ablehnung braucht Testing
- CORS manchmal problematisch - Cache-Header in vercel.json beachten!

## 💡 TIPPS FÜR NEUE DEVELOPER

1. Immer `git push` nach Änderungen - Vercel/Render brauchen 2-3 Minuten
2. Bei Problemen: Browser-Cache clearen (Ctrl+Shift+Delete)
3. Bei CORS-Errors: Sicherstellen dass Backend CORS-Headers hat
4. Lokale `.env` nicht in Git pushen!
5. PowerShell bei langen Befehlen mit Umlauten problematisch - UTF-8 beachten
