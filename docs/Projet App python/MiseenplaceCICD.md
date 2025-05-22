# Mise en place d'une logique CI/CD

# Déploiement automatisé via Tailscale, GitHub Actions et PM2

Ce guide explique comment mettre en place un déploiement continu (CI/CD) pour une **application Python** sur une VM Ubuntu, en utilisant **Tailscale** pour un accès réseau privé, **PM2** comme gestionnaire de processus Python, et un workflow GitHub Actions (fichier `.yml`) pour automatiser le déploiement à chaque `git push`.

---

## Sommaire

1. Pré-requis
2. Installation et configuration de Tailscale
3. Installation et configuration de PM2 pour Python
4. Préparation de la VM Ubuntu pour le déploiement Python
5. Configuration du workflow GitHub Actions (`.github/workflows/deploy.yml`)
6. Sécurisation et tests
7. Résumé du flux

---

## 1. Pré-requis

- Un dépôt GitHub pour ton application Python.
- Une VM Ubuntu Server (hébergeant l’application Python et MariaDB).
- Un compte Tailscale et Tailscale installé sur la VM Ubuntu.
- Un Tailscale Auth Key (clé d’authentification pour CI/CD).
- Un accès SSH à la VM Ubuntu (via Tailscale).
- Un fichier `.yml` pour GitHub Actions.

---

## 2. Installation et configuration de Tailscale

### a. Installer Tailscale sur la VM Ubuntu

```

curl -fsSL https://tailscale.com/install.sh | sh
sudo tailscale up --authkey=<TAILSCALE_AUTHKEY> --hostname="ubuntu-app-server"

```
- Génère un Auth Key sur le dashboard Tailscale (section Keys), choisis une clé **ephemeral** et **reusable** pour CI/CD.

### b. Vérifier l’adresse Tailscale de la VM

```

tailscale ip -4

```
- Note cette IP (ex: `100.x.x.x`).

---

## 3. Installation et configuration de PM2 pour Python

### a. Installer Node.js et PM2

```

curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2

```

### b. Lancer l’application Python avec PM2

Depuis le dossier de ton projet (par exemple `/opt/ton-repo`) :

```

pm2 start app.py --interpreter /usr/bin/python3 --name myapp

```

- `--interpreter /usr/bin/python3` force l’utilisation de Python 3.
- `--name myapp` donne un nom à ton processus.

### c. S’assurer que l’application redémarre au reboot

```

pm2 startup

# Suis l’instruction affichée (copie/colle la commande générée)

pm2 save

```

- Cela garantit que PM2 relancera ton appli Python automatiquement après un redémarrage du serveur[^5].

### d. Commandes utiles PM2

- Redémarrer l’appli : `pm2 restart myapp`
- Voir les logs : `pm2 logs myapp`
- Lister les apps : `pm2 list`

---

## 4. Préparation de la VM Ubuntu pour le déploiement Python

### a. Cloner le dépôt sur la VM

```

cd /opt
git clone git@github.com:ton-utilisateur/ton-repo.git
cd ton-repo

```
- Configure les clés SSH pour permettre le `git pull` sans mot de passe.

### b. Créer un script de déploiement

Dans `/opt/ton-repo/deploy.sh` :

```

\#!/bin/bash
git pull origin main
pm2 restart myapp

```

Rends-le exécutable :

```

chmod +x deploy.sh

```

---

## 5. Configuration du workflow GitHub Actions (`.github/workflows/deploy.yml`)

Crée un fichier `.github/workflows/deploy.yml` dans ton dépôt GitHub :

```

name: Deploy to Ubuntu App Server via Tailscale and PM2

on:
push:
branches:
- main

jobs:
deploy:
runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4
    
      - name: Set up Tailscale
        uses: tailscale/github-action@v3
        with:
          authkey: ${{ secrets.TAILSCALE_AUTHKEY }}
    
      - name: Wait for Tailscale
        run: sleep 5
    
      - name: Deploy via SSH
        env:
          SSH_PRIVATE_KEY: ${{ secrets.SSH_PRIVATE_KEY }}
        run: |
          echo "$SSH_PRIVATE_KEY" > id_rsa
          chmod 600 id_rsa
          ssh -o StrictHostKeyChecking=no -i id_rsa ubuntu@<IP_TAILSCALE_VM> 'cd /opt/ton-repo && ./deploy.sh'
    ```

- Remplace `<IP_TAILSCALE_VM>` par l’IP Tailscale de ta VM Ubuntu (ex : `100.x.x.x`).
- `TAILSCALE_AUTHKEY` et `SSH_PRIVATE_KEY` sont à stocker dans les secrets GitHub.

---

## 6. Sécurisation et tests

- **Secrets GitHub** : Ajoute `TAILSCALE_AUTHKEY` et `SSH_PRIVATE_KEY` dans les paramètres du dépôt GitHub (Settings > Secrets and variables > Actions).
- **Test du workflow** : Fais une modification et un `git push` sur `main`. Vérifie sur GitHub Actions que le workflow s’exécute sans erreur et que l’application Python est redéployée sur la VM.
- **Logs** : Consulte les logs du workflow GitHub et ceux de `pm2 logs myapp` sur la VM pour diagnostiquer d’éventuels problèmes.

---

## 7. Résumé du flux

1. Tu fais un `git push` sur la branche `main` de ton dépôt GitHub.
2. GitHub Actions lance le workflow défini dans `.github/workflows/deploy.yml`.
3. Le workflow établit une connexion Tailscale, puis se connecte en SSH à ta VM Ubuntu via son IP Tailscale.
4. Il exécute le script de déploiement (`deploy.sh`) sur la VM, qui fait un `git pull` et redémarre l’application Python via PM2.
5. Les changements sont appliqués automatiquement, de manière sécurisée et privée grâce à Tailscale.

---

Avec cette méthode, tu bénéficies d’un déploiement continu sécurisé, sans exposition de ports publics, et d’une gestion simplifiée de ton application Python grâce à PM2.
```

