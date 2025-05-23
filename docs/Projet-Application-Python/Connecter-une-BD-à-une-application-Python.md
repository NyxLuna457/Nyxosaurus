# Connecter une BD à une application Python

## Sommaire

1. [Installation de MariaDB sur Ubuntu Server](#1-installation-de-mariadb-sur-ubuntu-server)
2. [Gestion sécurisée des identifiants avec un fichier `.env`](#2-gestion-sécurisée-des-identifiants-avec-un-fichier-env)
3. [Bonnes pratiques supplémentaires](#3-bonnes-pratiques-supplémentaires)
4. [Exemple d’arborescence de projet](#4-exemple-darborescence-de-projet)
5. [Connexion à MariaDB en Python](#5-connexion-à-mariadb-en-python)

---

## 1. Installation de MariaDB sur Ubuntu Server

### Sur la VM Ubuntu Server, exécute les commandes suivantes :

```bash
sudo apt update
sudo apt install mariadb-server mariadb-client -y
```
Vérifie que le service fonctionne :

```
sudo systemctl status mariadb
```
---

### Sécurisation de l’installation

Lance le script de sécurisation fourni par MariaDB :

```
sudo mysql_secure_installation
```
Réponds aux questions pour :
- Définir un mot de passe root
- Supprimer les utilisateurs anonymes
- Désactiver la connexion root à distance
- Supprimer la base de test
- Recharger les tables de privilèges

:::danger[Il est recommandé de répondre "**Y**" à toutes les questions pour une configuration sécurisée.]
:::
---

### Création d’une base de données et d’un utilisateur

Connecte-toi au shell MariaDB :

```
sudo mariadb
```

Crée une base de données (remplace `nom_de_la_base` par le nom souhaité) :

```
CREATE DATABASE nom_de_la_base;
```

Crée un utilisateur (remplace `utilisateur`, `mot_de_passe` et `nom_de_la_base` par tes valeurs) :

```
GRANT ALL ON nom_de_la_base.* TO 'utilisateur'@'localhost' IDENTIFIED BY 'mot_de_passe' WITH GRANT OPTION; 
```

La condition `WITH GRANT OPTION` permet de donner le droit à l'utilisateur de donner les mêmes droits que celui dont il dispose à d'autres utilisateurs


Recharge les privilèges pour appliquer les changements :

```
FLUSH PRIVILEGES;
```

Vérifie la création de la base de données et de l’utilisateur si besoin :

```
SHOW DATABASES;
SELECT User, Host FROM mysql.user;
```

Quitte le shell MariaDB :

```
exit
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
Remplis avec les infos correspondantes à l'étape précédente

### b. Ignorer le fichier `.env` dans Git

Créer un fichier `.gitignore` dans la racine de ton dossier   
Ajoute `.env` à ton fichier `.gitignore` (il s'agit juste d'écrire `.env` dans le fichier `.gitignore`et de le sauvegarder. Github se chargera d'interpréter le `.gitignore` tout seul)  

### c. Pousser le code (hors `.env`)

```bash
git add .
git commit -m "nomducommit"
git push
```
---

## 3. Bonnes pratiques supplémentaires

- **Fournir un fichier `.env.example`** dans ton dépôt (structure sans valeurs sensibles) :

    ```
    DB_HOST=
    DB_USER=
    DB_PASSWORD=
    DB_NAME=
    ```

- **Ne jamais pousser `.env`** ou toute information sensible sur GitHub.
- **Séparer tes environnements** (développement, production) avec différents fichiers `.env` si besoin.

---

## 4. Exemple d’arborescence de projet

```
mon_projet/
├── app.py
├── .env # Ignoré par git, contient les identifiants réels
├── .env.example # Version sans secrets à partager
├── .gitignore
├── requirements.txt
└── ...
```

---

## 5. Connexion à MariaDB en Python

Installe le connecteur si besoin :
```
pip install mysql-connector-python python-dotenv
```

Intégrer à l'app python :

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
:::danger[Faire Attention]

En bonne pratique de scripting, faite attention à rajouter les `imports` en haut du script et le restant AVANT la ligne de fin de script python (qui doit ressembler à ça `if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True))`
:::

:::tip[Comprendre le script]

Ici le script extrait les données du fichier .env et s'en sert pour se connecter à la base mariadb.  
Ensuite selon la réussite ou l'échec de la connection, le script print le message correspondant  
Finalement, le script ferme la connexion à la base de donnée.
:::

