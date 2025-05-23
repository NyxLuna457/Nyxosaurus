# Créer une application Python

## Résumé

Ce guide t’accompagne étape par étape pour :

- Créer une VM Ubuntu Server et installer les outils nécessaires (sudo, SSH, nginx, Python, Flask…)
- Développer une application web simple avec Flask et une page HTML statique
- Utiliser VS Code pour coder en local
- Versionner ton projet avec Git et publier sur GitHub
- Récupérer et exécuter ton projet sur la VM avec `git pull`

---

## Sommaire

- [1. Préparer la VM Ubuntu Server](#1-pr%C3%A9parer-la-vm-ubuntu-server)
    - [1.1 Installer sudo et ajouter l’utilisateur au groupe sudo](#11-installer-sudo-et-ajouter-lutilisateur-au-groupe-sudo)
    - [1.2 Installer OpenSSH](#12-installer-openssh)
    - [1.3 Installer nginx](#13-installer-nginx)
    - [1.4 Installer Python 3.12](#14-installer-python-312)
    - [1.5 Installer pip et Flask](#15-installer-pip-et-flask)
- [2. Développer l’application Python en local avec VS Code](#2-d%C3%A9velopper-lapplication-python-en-local-avec-vs-code)
    - [2.1 Créer le projet](#21-cr%C3%A9er-le-projet)
    - [2.2 Écrire le code Flask](#22-%C3%A9crire-le-code-flask)
    - [2.3 Créer le template HTML](#23-cr%C3%A9er-le-template-html)
    - [2.4 Tester l’application localement](#24-tester-lapplication-localement)
- [3. Versionner et publier le projet sur GitHub](#3-versionner-et-publier-le-projet-sur-github)
    - [3.1 Initialiser Git et faire un commit](#31-initialiser-git-et-faire-un-commit)
    - [3.2 Créer un dépôt GitHub et pousser le code](#32-cr%C3%A9er-un-d%C3%A9p%C3%B4t-github-et-pousser-le-code)
- [4. Récupérer le projet sur la VM avec git pull](#4-r%C3%A9cup%C3%A9rer-le-projet-sur-la-vm-avec-git-pull)
- [5. Vérifier le fonctionnement sur la VM](#5-v%C3%A9rifier-le-fonctionnement-sur-la-vm)

---

## 1. Préparer la VM Ubuntu Server

### 1.1 Installer sudo et ajouter l’utilisateur au groupe sudo

Installe sudo :

```bash
sudo apt install sudo
```

Ajoute ton utilisateur au groupe sudo (remplace `<user>` par ton nom d'utilisateur) :

```bash
sudo adduser <user> sudo
```


---

### 1.2 Installer OpenSSH

Pour administrer la VM à distance :

```bash
sudo apt install openssh-server
```


---

### 1.3 Installer nginx

Pour avoir un reverse proxy ou un mini framework web :

```bash
sudo apt install nginx
```


---

### 1.4 Installer Python 3.12

```bash
sudo apt install python3.12
```

---

### 1.5 Installer pip et Flask

Installe pip :

```bash
sudo apt install python3-pip
```

Installe Flask :

```bash
pip install flask
```


---

## 2. Développer l’application Python en local avec VS Code

### 2.1 Créer le projet

Crée un dossier pour ton projet et place-toi dedans :

```bash
mkdir -p ~/Documents/projet-python
cd ~/Documents/projet-python
```

Ouvre VS Code dans ce dossier (si installé) :

```bash
code .
```


---

### 2.2 Écrire le code Flask

Crée un fichier `app.py` et colle le code suivant :

```python
from flask import Flask

app = Flask(__name__)

@app.route('/')
def home():
    with open('templates/index.html', 'r') as file:
        return file.read()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
```


---

### 2.3 Créer le template HTML

Crée un dossier `templates` puis un fichier `index.html` à l’intérieur :

```bash
mkdir templates
cd templates
nano index.html
```

Colle ce contenu dans `index.html` :

```html
<html>
    <head>
        <title>La page statique de Nyx</title>
    </head>
    <body>
        <h1>Bienvenue sur la meilleure page web!</h1>
        <p>Ceci est une page HTML servie par Flask</p>
    </body>
</html>
```


---

### 2.4 Tester l’application localement

Dans le dossier du projet, lance :

```bash
python app.py
```

Ouvre ensuite [http://127.0.0.1:5000](http://127.0.0.1:5000) dans ton navigateur pour voir le résultat.

---

## 3. Versionner et publier le projet sur GitHub

### 3.1 Initialiser Git et faire un commit

Installe git si besoin :

```bash
sudo apt install git
```

Initialise le dépôt Git :

```bash
git init
```

Ajoute tous les fichiers au suivi :

```bash
git add .
```

Fais un premier commit :

```bash
git commit -m "Premier commit"
```


---

### 3.2 Créer un dépôt GitHub et pousser le code

1. Va sur [GitHub](https://github.com) et crée un nouveau repository (laisse-le vide, ne coche pas README, .gitignore, etc.).
2. Récupère l’URL SSH de ton dépôt (exemple : `git@github.com:utilisateur/nom-du-repo.git`).
3. Ajoute le dépôt distant :
```bash
git remote add origin git@github.com:utilisateur/nom-du-repo.git
```

Change le nom de la branche principale si besoin :

```bash
git branch -M main
```

Pousse le code sur GitHub :

```bash
git push -u origin main
```


---

## 4. Récupérer le projet sur la VM avec git pull

Sur ta VM Ubuntu Server, installe git si ce n’est pas déjà fait :

```bash
sudo apt install git
```

Clone le dépôt la première fois (remplace l’URL par la tienne) :

```bash
git clone git@github.com:utilisateur/nom-du-repo.git
```

Place-toi dans le dossier cloné :

```bash
cd nom-du-repo
```

Pour mettre à jour le projet plus tard :

```bash
git pull
```


---

## 5. Vérifier le fonctionnement sur la VM

Dans le dossier du projet, installe Flask si besoin :

```bash
pip install flask
```

Lance l’application :

```bash
python app.py
```

Ouvre ensuite un navigateur et accède à :

```
http://<ip_de_ta_vm>:5000
```

Si la page ne s’affiche pas, vérifie les paramètres réseau de ta VM (NAT, bridge, pare-feu, etc.).

---

## 🎉 Félicitations, ton application Python est en ligne !

- Tu as versionné et transféré ton projet avec Git et GitHub.
- Tu sais maintenant mettre à jour ton application sur la VM avec `git pull`.
- Tu peux continuer à développer et déployer de nouvelles fonctionnalités facilement.
