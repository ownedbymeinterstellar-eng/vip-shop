# 🔧 Token Permissions Fehler beheben

**Error**: `Permission to ownedbymeinterstellar-eng/vip-shop.git denied`

Das bedeutet: Dein Token hat nicht die richtigen Berechtigungen!

---

## ✅ Lösung: Neuen Token mit richtigen Scopes erstellen

### Schritt 1: Alten Token löschen

1. Gehe zu: https://github.com/settings/tokens
2. Finde deinen Token `vip-shop-deployment`
3. Klick **Delete**

### Schritt 2: Neuen Token mit ALLEN nötigen Scopes erstellen

1. Gehe zu: https://github.com/settings/tokens
2. **Generate new token (classic)**
3. Ausfüllen:
   - **Note**: `vip-shop-push-token`
   - **Expiration**: `No expiration` (oder 90 days)
   
4. **Scopes** (ALLE diese häkchen)!
   - [x] `repo` (Full control of private repositories)
   - [x] `repo:status` (Access commit status)
   - [x] `repo_deployment` (Access deployment status)
   - [x] `public_repo` (Access public repositories)
   - [x] `write:repo_hook` (Write access to hooks)
   - [x] `admin:repo_hook` (Full control of repository hooks)
   - [x] `workflow` (Full control of GitHub Actions)

5. **Generate token**

6. **SOFORT kopieren**:
   ```
   ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

---

## Schritt 3: Credential Manager aktualisieren

**Windows:**
```powershell
# 1. Öffne Credential Manager
rundll32.exe keyvault.dll,KalStartMgr

# 2. Gehe zu: Windows Credentials
# 3. Suche und LÖSCHE alle github.com Einträge
```

**Mac:**
```bash
git credential-osxkeychain erase
# Drücke Enter zweimal
```

**Linux:**
```bash
git credential reject https://github.com
```

---

## Schritt 4: Neu pushen

```powershell
git push -u origin main
```

Wenn gefragt:
- **Username**: `ownedbymeinterstellar-eng`
- **Password**: Dein NEUER Token

---

## Alternative: SSH verwenden (Sauberer)

Falls Token immer noch Problem macht:

```powershell
# 1. SSH Key generieren
ssh-keygen -t ed25519 -C "ownedbymeinterstellar-eng@github.com"
# Einfach Enter für alle Fragen

# 2. Key anzeigen
type $env:USERPROFILE\.ssh\id_ed25519.pub

# 3. GitHub SSH Key hinzufügen
# https://github.com/settings/keys
# New SSH key → Paste den Key oben

# 4. Remote zu SSH ändern
git remote set-url origin git@github.com:ownedbymeinterstellar-eng/vip-shop.git

# 5. Push testen
git push -u origin main
```

---

## 🆘 Immer noch Error?

**Überprüfe:**
1. Bist du mit Google in GitHub angemeldet?
2. Token wurde mit ALLEN Scopes erstellt?
3. Credential Manager wurde geleert?
4. Repo URL ist korrekt: `ownedbymeinterstellar-eng/vip-shop`?

**Debug:**
```powershell
git remote -v
# Sollte sein: https://github.com/ownedbymeinterstellar-eng/vip-shop.git

git config --list | grep github
# Sollte Token/Username zeigen
```

---

**Versuch die neue Token-Lösung! 🔑**
