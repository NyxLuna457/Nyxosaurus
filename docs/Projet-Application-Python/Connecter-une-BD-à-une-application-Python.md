# Connecter une base de données à une application Python avec pipx

## Sommaire

1. [Installation de MariaDB sur Ubuntu Server](#1-installation-de-mariadb-sur-ubuntu-server)
2. [Gestion sécurisée des identifiants avec un fichier `.env`](#2-gestion-s%C3%A9curis%C3%A9e-des-identifiants-avec-un-fichier-env)
3. [Installer pipx et les dépendances Python](#3-installer-pipx-et-les-d%C3%A9pendances-python)
4. [Exemple d’arborescence de projet](#4-exemple-darborescence-de-projet)
5. [Connexion à MariaDB en Python avec pipx](#5-connexion-%C3%A0-mariadb-en-python-avec-pipx)
6. [Bonnes pratiques supplémentaires](#6-bonnes-pratiques-suppl%C3%A9mentaires)

---

## 1. Installation de MariaDB sur Ubuntu Server

Sur la VM Ubuntu Server, exécute :

```bash
sudo apt update
sudo apt install mariadb-server mariadb-client -y
```

Vérifie que le service fonctionne :

```bash
sudo systemctl status mariadb
```


### Sécurisation de l’installation

```bash
sudo mysql_secure_installation
```

Réponds aux questions pour :

- Définir un mot de passe root
- Supprimer les utilisateurs anonymes
- Désactiver la connexion root à distance
- Supprimer la base de test
- Recharger les tables de privilèges

---

### Création d’une base de données et d’un utilisateur

Connecte-toi au shell MariaDB :

```bash
sudo mariadb
```

Crée une base de données et un utilisateur :

```sql
CREATE DATABASE nom_de_la_base;
GRANT ALL ON nom_de_la_base.* TO 'utilisateur'@'localhost' IDENTIFIED BY 'mot_de_passe' WITH GRANT OPTION;
FLUSH PRIVILEGES;
```

Vérifie la création :

```sql
SHOW DATABASES;
SELECT User, Host FROM mysql.user;
exit
```


---

## 2. Gestion sécurisée des identifiants avec un fichier `.env`

Crée un fichier `.env` à la racine de ton projet :

```
DB_HOST=localhost
DB_USER=mon_utilisateur
DB_PASSWORD=mon_mot_de_passe
DB_NAME=ma_base
```

Ajoute `.env` à ton `.gitignore` pour ne jamais le pousser sur GitHub.

---

## 3. Installer pipx et les dépendances Python

### a. Installer pipx

Sur la plupart des distributions Linux :

```bash
python3 -m pip install --user pipx
python3 -m pipx ensurepath
```

> **Remarque :** Redémarre ton terminal ou exécute `source ~/.bashrc` si la commande `pipx` n’est pas reconnue.

### b. Installer les dépendances avec pipx

Utilise pipx pour installer et exécuter les modules nécessaires :

```bash
pipx install mysql-connector-python
pipx install python-dotenv
```


---

## 4. Exemple d’arborescence de projet

```
mon_projet/
├── app.py
├── .env              # Ignoré par git, contient les identifiants réels
├── .env.example      # Version sans secrets à partager
├── .gitignore
└── ...
```


---

## 5. Connexion à MariaDB en Python avec pipx

Tu peux lancer ton script Python avec les dépendances gérées par pipx :

```python
import os
from dotenv import load_dotenv
import mysql.connector

load_dotenv()

try:
    connection = mysql.connector.connect(
        host=os.getenv('DB_HOST'),
        user=os.getenv('DB_USER'),
        password=os.getenv('DB_PASSWORD'),
        database=os.getenv('DB_NAME')
    )
    if connection.is_connected():
        print("✅ Connexion réussie à MariaDB")
except mysql.connector.Error as e:
    print(f"❌ Erreur de connexion : {e}")
finally:
    if 'connection' in locals() and connection.is_connected():
        connection.close()
```

**Pour exécuter ton script avec pipx** (si besoin, adapte le chemin) :

```bash
pipx runpip mysql-connector-python install python-dotenv
pipx run --spec mysql-connector-python python app.py
```

> `pipx run` permet d’exécuter un script Python avec les paquets installés par pipx, sans polluer l’environnement global.

---

## 6. Bonnes pratiques supplémentaires

- **Fournis un fichier `.env.example`** (structure sans valeurs sensibles) :

```
DB_HOST=
DB_USER=
DB_PASSWORD=
DB_NAME=
```

- **Ne jamais pousser `.env`** ou toute information sensible sur GitHub.
- **Sépare tes environnements** (développement, production) avec différents fichiers `.env` si besoin.

---

## En résumé

- pipx permet d’installer et d’exécuter des paquets Python de façon isolée, sans venv ni pip global.
- Tu peux facilement gérer tes dépendances même dans des environnements où pip install ne fonctionne pas.
- La connexion à MariaDB se fait comme d’habitude, en important les modules via pipx.

