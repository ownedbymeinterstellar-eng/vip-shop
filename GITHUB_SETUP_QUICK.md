# ⚡ GitHub Setup - Schnell erklärt

## Deine Situation
- Account: `just1n-design`
- Du willst deine Dateien hochladen
- Das alte Repo gehört jemand anderen

## Lösung in 3 Schritten

### Schritt 1: Neues Repo erstellen (2 Min)

**Im Browser:**
1. Gehe zu: https://github.com/new
2. **Repository name**: `vip-shop` (oder dein Name)
3. **Owner**: just1n-design (sollte automatisch sein)
4. **Public** ✓
5. Lass alles andere leer (No README, .gitignore, license)
6. **Create repository**

Du siehst dann eine Seite mit:
```
https://github.com/just1n-design/vip-shop
```

### Schritt 2: Git Remote URL ändern (1 Min)

**Im Terminal (in deinem Projekt-Ordner):**

```powershell
git remote set-url origin https://github.com/just1n-design/vip-shop.git
```

**Überprüfe ob's geklappt hat:**
```powershell
git remote -v
```

Output sollte sein:
```
origin  https://github.com/just1n-design/vip-shop.git (fetch)
origin  https://github.com/just1n-design/vip-shop.git (push)
```

### Schritt 3: Code hochladen (1 Min)

```powershell
git push -u origin main
```

**Fertig! 🎉**

Deine Dateien sind jetzt auf GitHub unter:
```
https://github.com/just1n-design/vip-shop
```

---

## Falls es nicht funktioniert

**Error: "Could not read Username"**
- GitHub fragt dich nach Credentials
- Gib dein GitHub Passwort oder Personal Access Token ein

**Error: "fatal: bad refspec 'main'"**
- Du hast noch keinen Commit gemacht
- Mach erst: `git commit -m "Initial commit"`
- Dann: `git push -u origin main`

---

## Dann kann es weitergehen mit Hosting! 🚀

Danach einfach **QUICK_START.md** folgen!
