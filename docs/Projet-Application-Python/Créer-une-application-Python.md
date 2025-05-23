# Créer une application Python

## Résumé

Ce guide t’accompagne étape par étape pour :

- Créer une VM Ubuntu Server et installer les outils nécessaires (sudo, SSH, nginx, Python, Flask…)
- Développer une application web simple avec Flask et une page HTML statique
- Versionner ton projet avec Git et publier sur GitHub
- Générer une clé SSH sur ta VM, l’ajouter à GitHub, et cloner/mettre à jour ton projet

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
- [4. Générer une clé SSH sur la VM et l’ajouter à GitHub](#4-g%C3%A9n%C3%A9rer-une-cl%C3%A9-ssh-sur-la-vm-et-lajouter-%C3%A0-github)
    - [4.1 Générer la clé SSH](#41-g%C3%A9n%C3%A9rer-la-cl%C3%A9-ssh)
    - [4.2 Ajouter la clé publique à GitHub](#42-ajouter-la-cl%C3%A9-publique-%C3%A0-github)
    - [4.3 Vérifier la connexion SSH avec GitHub](#43-v%C3%A9rifier-la-connexion-ssh-avec-github)
- [5. Cloner le projet sur la VM et le mettre à jour avec git pull](#5-cloner-le-projet-sur-la-vm-et-le-mettre-%C3%A0-jour-avec-git-pull)
- [6. Vérifier le fonctionnement sur la VM](#6-v%C3%A9rifier-le-fonctionnement-sur-la-vm)

---

## 1. Préparer la VM Ubuntu Server

### 1.1 Installer sudo et ajouter l’utilisateur au groupe sudo

```bash
sudo apt install sudo
sudo adduser <user> sudo
```

Remplace `<user>` par ton nom d'utilisateur.

---

### 1.2 Installer OpenSSH

```bash
sudo apt install openssh-server
```


---

### 1.3 Installer nginx

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

```bash
sudo apt install python3-pip
pip install flask
```


---

## 2. Développer l’application Python en local avec VS Code

### 2.1 Créer le projet

```bash
mkdir -p ~/Documents/projet-python
cd ~/Documents/projet-python
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

```bash
python app.py
```

Ouvre [http://127.0.0.1:5000](http://127.0.0.1:5000) dans ton navigateur.

---

## 3. Versionner et publier le projet sur GitHub

### 3.1 Initialiser Git et faire un commit

```bash
sudo apt install git
git init
git add .
git commit -m "Premier commit"
```


---

### 3.2 Créer un dépôt GitHub et pousser le code

1. Va sur [GitHub](https://github.com) et crée un nouveau repository (laisse-le vide, ne coche pas README, .gitignore, etc.).
2. Récupère l’URL SSH de ton dépôt (exemple : `git@github.com:utilisateur/nom-du-repo.git`).
3. Ajoute le dépôt distant et pousse le code :
```bash
git remote add origin git@github.com:utilisateur/nom-du-repo.git
git branch -M main
git push -u origin main
```


---

## 4. Générer une clé SSH sur la VM et l’ajouter à GitHub

### 4.1 Générer la clé SSH

Sur ta VM Ubuntu, exécute :

```bash
ssh-keygen -t ed25519 -C "ton_email@example.com"
```

Appuie sur **Entrée** à chaque question pour accepter les valeurs par défaut.

---

### 4.2 Ajouter la clé publique à GitHub

Affiche la clé publique générée :

```bash
cat ~/.ssh/id_ed25519.pub
```

**Copie** tout le contenu affiché.

Sur GitHub :

- Va dans **Settings > SSH and GPG keys > New SSH key**
- Colle la clé dans le champ prévu, donne-lui un nom, puis valide.

---

### 4.3 Vérifier la connexion SSH avec GitHub

Teste la connexion :

```bash
ssh -T git@github.com
```

Tu dois voir un message du type :
`Hi <ton_username>! You've successfully authenticated, but GitHub does not provide shell access.`

---

## 5. Cloner le projet sur la VM et le mettre à jour avec git pull

Place-toi dans le dossier où tu veux cloner ton projet, puis :

```bash
git clone git@github.com:utilisateur/nom-du-repo.git
cd nom-du-repo
```

Pour mettre à jour le projet plus tard :

```bash
git pull
```


---

## 6. Vérifier le fonctionnement sur la VM

Installe Flask si besoin :

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


---

## 🎉 Félicitations, ton application Python est en ligne !

- Tu as versionné et transféré ton projet avec Git et GitHub.
- Tu as sécurisé l’accès avec une clé SSH.
- Tu sais maintenant mettre à jour ton application sur la VM avec `git pull`.

