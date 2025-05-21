
# Connexion à une base MariaDB avec une application Python

Ce guide explique comment établir une connexion entre un script Python et une base de données **MariaDB**, tester la connexion, et gérer les erreurs.

---

## 🔧 Prérequis

- Python 3.x installé
- Accès à une base de données MariaDB (locale ou distante)
- Un utilisateur et mot de passe MariaDB valides
- Accès à Internet (pour installer les bibliothèques Python)

---

## 📦 Installation de la bibliothèque

Il existe plusieurs connecteurs compatibles. Le plus simple est `mysql-connector-python` :

```bash
pip install mysql-connector-python
```

Ou, en alternative :

```bash
pip install pymysql
```

---

## 🧪 Exemple avec `mysql-connector-python`

```python
import mysql.connector
from mysql.connector import Error

try:
    connection = mysql.connector.connect(
        host='localhost',
        user='votre_utilisateur',
        password='votre_mot_de_passe',
        database='nom_de_votre_base'
    )

    if connection.is_connected():
        print("✅ Connexion réussie à la base MariaDB")
        print("Yes")

except Error as e:
    print(f"❌ Erreur de connexion : {e}")

finally:
    if 'connection' in locals() and connection.is_connected():
        connection.close()
```

---

## 💡 Exemple avec `pymysql`

```python
import pymysql

try:
    connection = pymysql.connect(
        host='localhost',
        user='votre_utilisateur',
        password='votre_mot_de_passe',
        database='nom_de_votre_base'
    )
    print("✅ Connexion réussie à la base MariaDB")
    print("Yes")

except pymysql.MySQLError as e:
    print(f"❌ Erreur de connexion : {e}")

finally:
    if 'connection' in locals():
        connection.close()
```

---

## 🛠 Options supplémentaires

- **Changer de port** si MariaDB écoute ailleurs que sur 3306 :

```python
port=3307
```

- **Connexion distante** :
  - Assurez-vous que le pare-feu autorise le port 3306
  - MariaDB doit être configuré pour écouter sur `0.0.0.0` ou l'adresse du serveur

- **Lister les bases** après connexion :

```python
cursor = connection.cursor()
cursor.execute("SHOW DATABASES;")
for db in cursor.fetchall():
    print(db)
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
