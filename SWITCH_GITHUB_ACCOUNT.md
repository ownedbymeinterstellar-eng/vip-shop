# 🔄 GitHub Account wechseln (für Push)

Du bist Owner von `ownedbymeinterstellar-eng` aber dein Git ist mit `just1n-design` verbunden.

---

## 🔧 Schnelle Lösung

### Option 1: Credentials Manager löschen (Windows/Mac)

**Windows:**
```powershell
# Öffne: Control Panel → Credential Manager → Windows Credentials
# Suche: git:https://github.com
# Lösche den Eintrag
```

**Mac:**
```bash
# Terminal:
git credential-osxkeychain erase
# Dann Enter drücken und noch mal Enter
```

**Linux:**
```bash
git credential reject https://github.com
```

Dann beim nächsten Push fragt Git nach deinen Credentials - gib deine `ownedbymeinterstellar-eng` Daten ein!

---

### Option 2: Git Config lokal ändern

```powershell
# Überprüfe aktuelle Config
git config user.name
git config user.email

# Ändere zu ownedbymeinterstellar-eng Daten
git config user.name "ownedbymeinterstellar-eng"
git config user.email "deine-email@example.com"

# Überprüfe Änderung
git config user.name
```

---

### Option 3: SSH Key verwenden (Saubere Lösung)

```powershell
# 1. SSH Key für ownedbymeinterstellar-eng erstellen
ssh-keygen -t ed25519 -C "ownedbymeinterstellar-eng@github.com"

# 2. Key Datei: C:\Users\DEIN-USERNAME\.ssh\id_ed25519

# 3. GitHub SSH Key hinzufügen:
#    https://github.com/settings/keys
#    New SSH key → Paste den Key

# 4. Remote zu SSH ändern
git remote set-url origin git@github.com:ownedbymeinterstellar-eng/vip-shop.git

# 5. Test
git push -u origin main
```

---

## ⚡ Empfohlene Schnell-Lösung

**Windows Credential Manager:**

1. Öffne: `Windows-Taste` → `Credential Manager` suchen
2. Klick `Windows Credentials`
3. Suche nach `git:https://github.com`
4. Lösche den Eintrag
5. Im Terminal:
   ```powershell
   git push -u origin main
   ```
6. GitHub fragt nach Username/Password
7. Gib deine `ownedbymeinterstellar-eng` Daten ein
8. **Fertig!** ✅

---

## 🆘 Immer noch Error?

```powershell
# Überprüfe Remote
git remote -v

# Sollte sein:
# origin  https://github.com/ownedbymeinterstellar-eng/vip-shop.git (fetch)
# origin  https://github.com/ownedbymeinterstellar-eng/vip-shop.git (push)
```

Falls nicht:
```powershell
git remote set-url origin https://github.com/ownedbymeinterstellar-eng/vip-shop.git
```

---

## ✅ Dann Push!

```powershell
git push -u origin main
```

**Success!** Deine Dateien sind jetzt unter `ownedbymeinterstellar-eng` auf GitHub! 🎉
