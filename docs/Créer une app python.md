Créer VM ubuntu server
installer sudo, puis ajouter le user dans sudo avec “adduser user sudo” en remplaçant “user” avec votre nom d’utilisateur
installer ssh-server afin d’administrer la VM depuis le terminal de l’ordinateur
Installer nginx
installer mariadb
installer python 3.12
installer php
installer flask (pip install flask) (micro framework)


Créer un dossier “test” (mkdir test)(cd test)
Créer un fichier app.py : 
from flask import Flask


##Utilisation de VS code :  
>- En local   
    - Sudo apt install python3-pip  
    - Pip install Flask  
    - mkdir Documents/projet-python  
    - nano app.py 

```python
from flask import Flask

app = Flask(__name__)

@app.route('/')
def home ():
    with open( 'templates/index.html', 'r') as file:
        return file.read()

if __name__ == '__main__':
    app.run(debug=True)
    app.run(host=’0.0.0.0, port=5000, debug=true)
```
Mkdir templates  
cd templates

nano index.html :

```
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
> - Run python app.py dans ./test  
    - Vérifier que ca run sur le port 5000 ( 127.0.0.1:5000 dans l’url web)


##Utilisation de github pour versionner et pouvoir transférer les fichiers vers la VM :

> - En local :   
     - sudo apt install git  
     - Dans le répértoire contentant les fichiers   
     - - git init  
     - - git add . ( sert à envoyer l'ensemble des fichiers présents dans le répértoire dans un cache en attendant le commit)
     - - git commit -m "Premier commit"

> - Sur [Github](https://github.com)  
    - Créer un compte si nécéssaire  
    - Clique sur "New Repository"  
    - Donne lui un nom, laisse le dépôt vide et ne coche pas READ ni .gitignore etc...   
    - Récupère l'URL SSH de ton dépôt (Doit ressembler à git@github.com:utilisateur/nom-du-repo.git)  

> - De nouveau en local :  
    - git remote add origin "git@github.com:utilisateur/nom-du-repo.git"  
    - git branch -M main
    - git push -u origin main

Félicitations, tu viens de pousser ton projet sur github ! Le fichier app.py et le dossier avec le fichier index.html devraient se retrouver dans ton repository
