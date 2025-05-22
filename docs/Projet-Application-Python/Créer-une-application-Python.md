# Créer une application Python

## Créer VM ubuntu server
```bash
 apt install sudo #ajouter l'utilisateur dans le groupe sudo avec “adduser user sudo” en remplaçant “user” avec votre nom d’utilisateur
 apt install openssh-server #afin d’administrer la VM depuis le terminal du poste local
 apt install nginx #mini framework web/reverse proxy)
 apt install python3.12
 apt install php
 pip install flask #micro framework
```
## Utilisation de VS code :  
En local  
```bash 
   Sudo apt install python3-pip  
   Pip install Flask  
   mkdir Documents/projet-python
   cd Documents/projet-python
   code .  #marche uniquement si VS code est déjà installé  
   nano app.py 
```
```python
from flask import Flask

app = Flask(__name__)

@app.route('/')
def home ():
    with open( 'templates/index.html', 'r') as file:
        return file.read()

if __name__ == '__main__':
    app.run(host=’0.0.0.0', port=5000, debug=True)
```
```bash
mkdir templates  
cd templates
nano index.html
```

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
    - Une page en HTML avec ce que vous avez rentré dans le fichier "index" devrait s'afficher


## Utilisation de github pour versionner et pouvoir transférer les fichiers vers la VM :

>- En local :   
- `sudo apt install git`  
- Dans le répertoire contenant les fichiers   
 ```
 git init  
 git add . # sert à envoyer l'ensemble des fichiers présents dans le répertoire dans un cache en attendant le commit  
 git commit -m "Premier commit"
 ```

> Sur [Github](https://github.com):  
    - Créer un compte si nécessaire  
    - Clique sur "New Repository"  
    - Donne lui un nom, laisse le dépôt vide et ne coche pas READ ni .gitignore etc...   
    - Récupère l'URL SSH de ton dépôt (Doit ressembler à git@github.com:utilisateur/nom-du-repo.git)  

>- De nouveau en local :
```  
git remote add origin "git@github.com:utilisateur/nom-du-repo.git"  
git branch -M main
git push -u origin main
```
## Félicitations, tu viens de pousser ton projet sur github !  

 - Le fichier app.py et le dossier avec le fichier index.html devraient se retrouver dans ton repository.   
 - Vérifie tout de même que tout fonctionne avec un "python app.py" et en tapant l'adresse ip de ta vm:5000 dans ton navigateur.   
 - Si la page ne s'affiche pas, vérifie les paramètres réseau de ta VM   
