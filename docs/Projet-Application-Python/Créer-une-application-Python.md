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
- [2. Développer l’application Python en local avec VS Code](#2-d%C3%A9velopper-lapplication-python-en-local-avec-vs-code)
    - [2.1 Créer le projet et l’environnement](#21-cr%C3%A9er-le-projet-et-lenvironnement)
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

Connecte-toi à ta VM et installe les outils nécessaires :

```bash
# Installer sudo et ajouter ton utilisateur au groupe sudo
sudo apt install sudo
sudo adduser <user> sudo  # Remplace <user> par ton nom d'utilisateur

# Installer OpenSSH pour l'administration à distance
sudo apt install openssh-server

# Installer nginx (reverse proxy / mini framework web)
sudo apt install nginx

# Installer Python 3.12
sudo apt install python3.12

# Installer PHP (optionnel, seulement si besoin)
sudo apt install php

# Installer pip et Flask
sudo apt install python3-pip
pip install flask
```


---

## 2. Développer l’application Python en local avec VS Code

### 2.1 Créer le projet et l’environnement

Ouvre un terminal sur ta machine locale :

```bash
# Créer un dossier pour le projet
mkdir -p ~/Documents/projet-python
cd ~/Documents/projet-python

# Ouvrir VS Code dans ce dossier (si installé)
code .
```


### 2.2 Écrire le code Flask

Crée un fichier `app.py` :

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


### 2.3 Créer le template HTML

Crée un dossier `templates` puis le fichier HTML :

```bash
mkdir templates
cd templates
nano index.html
```

Exemple de contenu pour `index.html` :

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


### 2.4 Tester l’application localement

Dans le dossier du projet :

```bash
python app.py
```

- Ouvre [http://127.0.0.1:5000](http://127.0.0.1:5000) dans ton navigateur.
- La page HTML doit s’afficher.

---

## 3. Versionner et publier le projet sur GitHub

### 3.1 Initialiser Git et faire un commit

Dans le dossier du projet :

```bash
# Installer git si besoin
sudo apt install git

# Initialiser le dépôt Git
git init

# Ajouter tous les fichiers au suivi
git add .

# Faire un premier commit
git commit -m "Premier commit"
```


### 3.2 Créer un dépôt GitHub et pousser le code

1. Va sur [GitHub](https://github.com) et crée un nouveau repository (ne coche pas README, .gitignore, etc.).
2. Récupère l’URL SSH de ton dépôt (ex : `git@github.com:utilisateur/nom-du-repo.git`).
3. Dans le terminal local :
```bash
git remote add origin git@github.com:utilisateur/nom-du-repo.git
git branch -M main
git push -u origin main
```


---

## 4. Récupérer le projet sur la VM avec git pull

Sur ta VM Ubuntu Server :

```bash
# Installer git si ce n'est pas déjà fait
sudo apt install git

# Cloner le dépôt la première fois (dans le dossier souhaité)
git clone git@github.com:utilisateur/nom-du-repo.git

# Pour mettre à jour le projet plus tard
cd nom-du-repo
git pull
```

- **Astuce :** Si tu utilises HTTPS au lieu de SSH, adapte l’URL de ton dépôt.

---

## 5. Vérifier le fonctionnement sur la VM

1. Installe les dépendances si besoin (par exemple Flask avec pip).
2. Lance l’application :
```bash
python app.py
```

3. Ouvre un navigateur et accède à :
`http://<ip_de_ta_vm>:5000`

- Si la page ne s’affiche pas, vérifie les paramètres réseau de ta VM (NAT, bridge, pare-feu, etc.).

---

## 🎉 Félicitations, ton application Python est en ligne !

- Tu as versionné et transféré ton projet avec Git et GitHub.
- Tu sais maintenant mettre à jour ton application sur la VM avec `git pull`.
- Tu peux continuer à développer et déployer de nouvelles fonctionnalités facilement.

---

N’hésite pas à adapter ce guide ou à demander de l’aide pour des étapes plus avancées (déploiement, automatisation, etc.) !