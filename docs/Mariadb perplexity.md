# Déploiement d’un projet Python avec MariaDB, GitHub et gestion sécurisée des identifiants

## Sommaire

1. [Installation de MariaDB sur Ubuntu Server](#1-installation-de-mariadb-sur-ubuntu-server)
2. [Gestion sécurisée des identifiants avec un fichier `.env`](#2-gestion-sécurisée-des-identifiants-avec-un-fichier-env)
3. [Versionner et déployer avec Git/GitHub](#3-versionner-et-déployer-avec-gitgithub)
4. [Bonnes pratiques supplémentaires](#4-bonnes-pratiques-supplémentaires)
5. [Exemple d’arborescence de projet](#5-exemple-darborescence-de-projet)
6. [Exemple de connexion à MariaDB en Python](#6-exemple-de-connexion-à-mariadb-en-python)

---

## 1. Installation de MariaDB sur Ubuntu Server

Sur la VM Ubuntu Server, exécute les commandes suivantes :

```bash
sudo apt update
sudo apt install mariadb-server -y
```
Vérifie que le service fonctionne :

```
sudo systemctl status mariadb
```

---

## 2. Gestion sécurisée des identifiants avec un fichier `.env`

### a. Créer un fichier `.env`

À la racine de ton projet, crée un fichier nommé `.env` :
```
DB_HOST=localhost
DB_USER=mon_utilisateur
DB_PASSWORD=mon_mot_de_passe
DB_NAME=ma_base
```

### b. Ignorer le fichier `.env` dans Git

Créer un fichier `.gitignore` dans la racine de ton dossier   
Ajoute `.env` à ton fichier `.gitignore` (il s'agit juste d'écrire `.env` dans le fichier `.gitignore`et de le sauvegarder. Github se chargera d'interpréter le .gitignore tout seul)  


### c. Charger le `.env` dans ton code Python

Installe la librairie python-dotenv :
```
pip install python-dotenv
```

Dans ton script Python (exemple : `app.py`), ajoute :

```python
import os
from dotenv import load_dotenv

load_dotenv() # charge le fichier .env

db_host = os.getenv("DB_HOST")
db_user = os.getenv("DB_USER")
db_password = os.getenv("DB_PASSWORD")
db_name = os.getenv("DB_NAME")
```
:::danger[Faire Attention]

En bonne pratique de scripting, faite attention à rajouter les imports en haut du script and le restant AVANT la ligne de fin de script python (qui doit ressembler à ça `if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True))`
:::

### Pousser le code (hors `.env`)

```bash
git add .
git commit -m "nomducommit"
git push



