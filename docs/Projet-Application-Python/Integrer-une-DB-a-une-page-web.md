# Afficher le contenu de la BD sur la page Web

Ce guide détaille chaque étape pour :
- [Créer une base de données MariaDB et un utilisateur dédié](#1-création-dune-base-de-données-et-dun-utilisateur-mariadb)
- [Créer une table et insérer des données](#2-création-dune-table-et-insertion-de-données)
- [Configurer une application Flask pour afficher dynamiquement le contenu de cette table](#3-préparer-le-projet-flask)
- [Écrire le code Flask pour afficher la table](#4-écrire-le-code-flask-pour-afficher-la-table)
- [Lancer l’application](#5-lancer-lapplication)

---

## 1. Création d'une base de données et d'un utilisateur MariaDB

### a. Se connecter à MariaDB en tant qu'administrateur

Sur ta VM, ouvre un terminal et lance :

```

sudo mariadb

```

### b. Créer une nouvelle base de données

Dans le shell MariaDB, exécute :

```

CREATE DATABASE demo CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

```

- Ici, `demo` est le nom de ta base. Tu peux le personnaliser.
- Le jeu de caractères `utf8mb4` permet de stocker tous types de caractères (y compris les emojis).

### c. Créer un utilisateur dédié et lui donner les droits

Toujours dans le shell MariaDB, exécute :

```

CREATE USER 'flaskuser'@'localhost' IDENTIFIED BY 'motdepassefort';
GRANT ALL PRIVILEGES ON demo.* TO 'flaskuser'@'localhost';
FLUSH PRIVILEGES;

```

- Remplace `flaskuser` et `motdepassefort` par des valeurs sécurisées.
- L'utilisateur n’aura des droits que sur la base `demo`.

### d. Vérifier la création

Pour voir la liste des bases :

```

SHOW DATABASES;

```

Pour voir les utilisateurs :

```

SELECT User, Host FROM mysql.user;

```

Quitte le shell MariaDB :

```

EXIT;

```

---

## 2. Création d'une table et insertion de données

### a. Se connecter avec le nouvel utilisateur

Dans le terminal :

```

mariadb -u flaskuser -p demo

```

Entre le mot de passe défini plus haut.

### b. Créer une table

Par exemple, une table `Personel` :

```

CREATE TABLE Personel (
id INT PRIMARY KEY AUTO_INCREMENT,
Prénoms VARCHAR(50) NOT NULL,
Nom VARCHAR(50) NOT NULL
);

```

- `id` est une clé primaire auto-incrémentée.
- `Prénoms` et `Nom` sont des champs texte.

### c. Insérer des données dans la table

```

INSERT INTO Personel (Prénoms, Nom) VALUES
('Alice', 'Martin'),
('Bob', 'Durand'),
('Claire', 'Lefevre');

```

### d. Vérifier le contenu de la table

```

SELECT * FROM Personel;

```

Quitte le shell MariaDB :

```

EXIT;

```

---

## 3. Préparer le projet Flask

### a. Installer les dépendances

Dans ton dossier de projet Python :

```
sudo apt install libmariadb-dev
pip install flask python-dotenv mariadb

```

---

## 4. Écrire le code Flask pour afficher la table

### a. Fichier `app.py` :

```Python
import os
from flask import Flask, render_template
from dotenv import load_dotenv
import mariadb

# Charger les variables d'environnement du fichier .env
load_dotenv()

app = Flask(__name__)

def get_db_connection():
    return mariadb.connect(
        host=os.getenv('DB_HOST'),
        user=os.getenv('DB_USER'),
        password=os.getenv('DB_PASSWORD'),
        database=os.getenv('DB_NAME')
    )
db_config = {
    'host': os.getenv('DB_HOST'),
    'user': os.getenv('DB_USER'),
    'password': os.getenv('DB_PASSWORD'),
    'database': os.getenv('DB_NAME')
}

@app.route('/')
def afficher_personnes():
    try:
        conn = mariadb.connect(**db_config)
        cur = conn.cursor()
        cur.execute("SELECT id, Prénoms, Nom FROM Personel;")
        personnes = cur.fetchall()
        conn.close()
    except mariadb.Error as e:
        return f"<h1>Erreur de connexion à la base de données :</h1><pre>{e}</pre>"

    # Template HTML simple
    html = '''
    <h1>Liste du Personel</h1>
    <table border="1">
        <tr>
            <th>ID</th><th>Nom</th><th>Prénom</th>
        </tr>
        {% for p in personnes %}
        <tr>
            <td>{{ p[0] }}</td>
            <td>{{ p[1] }}</td>
            <td>{{ p[2] }}</td>
        </tr>
        {% endfor %}
    </table>
    '''
    return render_template_string(html, personnes=personnes)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

```

---

### b. Fichier `templates/index.html` :

```html

<!DOCTYPE html>

<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Liste des personnes</title>
</head>
<body>
    <h1>Table Personel</h1>
    <table border="1">
        <tr>
            <th>ID</th>
            <th>Prénom</th>
            <th>Nom</th>
        </tr>
        {% for person in Personel %}
        <tr>
            <td>{{ person }}</td>
            <td>{{ person }}</td>
            <td>{{ person }}</td>
        </tr>
        {% endfor %}
    </table>
</body>
</html>
```

---

## 5. Lancer l’application

Dans le terminal :

```

python app.py

```

Puis ouvre ton navigateur à l’adresse :

```

http://<ip_de_ta_vm>:5000

```

ou, si tu utilises un reverse proxy/nginx et un DNS local :

```

http://monapp.local

```

---

## Résumé

- **Création d’une base et d’un utilisateur MariaDB dédiés**
- **Création d’une table et insertion de données**
- **Connexion à la base depuis Flask avec des identifiants sécurisés dans `.env`**
- **Affichage dynamique du contenu de la table sur la page web Flask**

Tu peux adapter ce modèle pour n’importe quelle table ou structure de données !
