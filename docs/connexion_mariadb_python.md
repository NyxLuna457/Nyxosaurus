
# Connexion à une base MariaDB avec une application Python

Ce guide explique comment établir une connexion entre un script Python et une base de données **MariaDB**, tester la connexion, et gérer les erreurs.

---

## 🔧 Prérequis

- Python 3.12 installé
- Accès à une base de données MariaDB (locale ou distante)
- Un utilisateur et mot de passe MariaDB valides
- Accès à Internet (pour installer les bibliothèques Python)

---

## 📦 Installation de la bibliothèque

Il existe plusieurs connecteurs compatibles. Le plus simple est `mysql-connector-python` :

```bash
pip install mysql-connector-python
```
---

## 🧪 Exemple avec `mysql-connector-python`

```python
import mariadb
import mysql.connector
from mysql.connector import Error
from dotenv import load_dotenv

load_dotenv()

def check_db_connection():
    try:
        conn = mysql.connector.connect(
            host=os.getenv('DB_HOST'),
            user=os.getenv('DB_USER'),
            password=os.getenv('DB_PASSWORD'),
            database=os.getenv('DB_DATABASE')
        )
        if conn.is_connected():
            conn.close()
            return True
        else:
            return False
    except Error:
        return False


try:
    conn = mariadb.connect(**db_config)
    conn.ping()
    print("yes")
    conn.close()
except mariadb.Error as err:
    print(f"Erreur lors de la connexion à MariaDB : {err}")
```
---

## 🔐 Bonnes pratiques

- Ne jamais stocker les mots de passe en clair → utilisez des variables d'environnement ou un fichier `.env`.
- Toujours fermer la connexion (`connection.close()`).
- Gérer les erreurs proprement avec `try/except`.

---

## ✅ Test de connexion

Vous pouvez simplement tester le script en le exécutant avec :

```bash
python app.py
```

Un message `"Yes"` doit apparaître si la connexion est réussie.

---

## 🧾 Ressources

- [Documentation officielle de mysql-connector](https://dev.mysql.com/doc/connector-python/en/)
- [Documentation PyMySQL](https://pymysql.readthedocs.io/en/latest/)
