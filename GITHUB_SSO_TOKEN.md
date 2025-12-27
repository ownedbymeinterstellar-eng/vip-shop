# 🔑 GitHub Personal Access Token für SSO (Google Login)

Dein GitHub Account `ownedbymeinterstellar-eng` verwendet Google-Login.
Das bedeutet: Kein Passwort zum Pushen → **Du brauchst ein Personal Access Token!**

---

## 📝 Schritt 1: Token erstellen

### 1.1 Token Page öffnen
Gehe zu: https://github.com/settings/tokens

(Falls nicht angemeldet: Melde dich mit `ownedbymeinterstellar-eng` an)

### 1.2 "Generate new token" → "Generate new token (classic)"

### 1.3 Token konfigurieren
- **Note**: `vip-shop-deployment` (oder beliebig)
- **Expiration**: 90 days (oder länger)
- **Scopes** (Häkchen setzen):
  - [x] `repo` (voller Zugriff auf Repos)
  - [x] `workflow` (falls GitHub Actions später)

### 1.4 "Generate token" klicken

### 1.5 Token **SOFORT** kopieren!
```
ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

⚠️ **WICHTIG**: Du siehst den Token nur EINMAL! Kopiere ihn jetzt!

---

## 🔧 Schritt 2: Git mit Token konfigurieren

### Option A: Credential Manager (Windows) - EMPFOHLEN

1. **Öffne Credential Manager:**
   ```powershell
   rundll32.exe keyvault.dll,KalStartMgr
   ```

2. Gehe zu: **Windows Credentials**

3. Suche nach `git:https://github.com` Einträge

4. **Lösche** alle GitHub-Einträge

5. Im Terminal (Project-Folder):
   ```powershell
   git push -u origin main
   ```

6. **Username**: `ownedbymeinterstellar-eng`

7. **Password**: Paste dein Token: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxx`

8. **Fertig!** ✅

---

### Option B: Git Command Line

```powershell
# Remote mit Token in URL setzen
git remote set-url origin https://ownedbymeinterstellar-eng:ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxx@github.com/ownedbymeinterstellar-eng/vip-shop.git

# Dann push
git push -u origin main
```

⚠️ **ABER**: Der Token ist dann in der Git Config sichtbar! Nicht empfohlen.

---

### Option C: Git Credential Store

```powershell
# Credential Helper installieren
git config --global credential.helper manager

# Dann beim nächsten Push:
# Username: ownedbymeinterstellar-eng
# Password: ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## ✅ Test

```powershell
# Im Project-Folder
git push -u origin main
```

**Sollte funktionieren!** ✨

---

## 🆘 Token vergessen?

Falls du den Token nicht gespeichert hast:

1. Gehe zu: https://github.com/settings/tokens
2. Finde deinen Token
3. Klick **Delete**
4. Erstelle einen neuen Token

---

## 🔐 Sicherheit

- **Token speichern**: Credential Manager (Windows) oder `.ssh/` (Mac/Linux)
- **Token teilen**: NIEMALS! Behandle ihn wie ein Passwort!
- **Token löschen**: Falls kompromittiert sofort löschen
- **Token Rotation**: Alle 90 Tage ein neuer Token

---

## 📚 Häufige Probleme

**"Invalid username or password"**
- Überprüfe: Ist das Token korrekt kopiert?
- Leerzeichen am Anfang/Ende? Nein?
- Token noch gültig? (nicht abgelaufen)

**"fatal: could not read Username"**
- Credential Manager wurde nicht zurückgesetzt
- Versuche Option B oder C

**"401 Unauthorized"**
- Token hat falsche Permissions
- Erstelle neuen Token mit `repo` Scope

---

## 🎯 Zusammenfassung

1. ✅ Token erstellen: https://github.com/settings/tokens
2. ✅ Token kopieren (SOFORT!)
3. ✅ Credential Manager löschen (Windows)
4. ✅ `git push -u origin main` ausführen
5. ✅ Username: `ownedbymeinterstellar-eng`
6. ✅ Password: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxx`
7. ✅ Deine Dateien sind online! 🚀

---

**Jetzt bereit zum Pushen?** 💪
