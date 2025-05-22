# Mise en place d'une démarche CI/CD

Ce guide explique comment mettre en place un déploiement continu (CI/CD) sur ta VM Ubuntu hébergeant l’application Python, en utilisant **Tailscale** pour un accès réseau privé et sécurisé, et un workflow GitHub Actions défini dans un fichier `.yml` pour automatiser le déploiement à chaque `git push`.

---

## Sommaire

1. Pré-requis
2. Installation et configuration de Tailscale
3. Préparation de la VM Ubuntu pour le déploiement
4. Création du service systemd pour l’application Python
5. Configuration du workflow GitHub Actions (`.github/workflows/deploy.yml`)
6. Sécurisation et tests
7. Résumé du flux

---

## 1. Pré-requis

- Un dépôt GitHub pour ton application Python.
- Une VM Ubuntu Server (hébergeant l’application Python et MariaDB).
- Un compte Tailscale et Tailscale installé sur la VM Ubuntu.
- Un Tailscale Auth Key (authentification automatisée pour CI/CD).
- Un accès SSH à la VM Ubuntu (via Tailscale).
- Un fichier `.yml` pour GitHub Actions.

---

## 2. Installation et configuration de Tailscale

### a. Installer Tailscale sur la VM Ubuntu

```

curl -fsSL https://tailscale.com/install.sh | sh
sudo tailscale up --authkey=<TAILSCALE_AUTHKEY> --hostname="ubuntu-app-server"

```
Génère un Auth Key sur le dashboard Tailscale (section Keys), choisis une clé **ephemeral** et **reusable** pour CI/CD.

### b. Vérifier l’adresse Tailscale de la VM

```

tailscale ip -4

```
Note cette IP (ex: `100.x.x.x`).

---

## 3. Préparation de la VM Ubuntu pour le déploiement

### a. Cloner le dépôt sur la VM

```

cd /opt
git clone git@github.com:ton-utilisateur/ton-repo.git
cd ton-repo

```
Configure les clés SSH pour permettre le `git pull` sans mot de passe.

### b. Créer un script de déploiement

Dans `/opt/ton-repo/deploy.sh` :

```

\#!/bin/bash
git pull origin main
sudo systemctl restart myapp

```

Rends-le exécutable :

```

chmod +x deploy.sh

```

---

## 4. Création du service systemd pour l’application Python

Dans `/etc/systemd/system/myapp.service` :

```

[Unit]
Description=Mon Application Python
After=network.target

[Service]
User=ubuntu
WorkingDirectory=/opt/ton-repo
ExecStart=/usr/bin/python3 app.py
Restart=always

[Install]
WantedBy=multi-user.target

```

Active et démarre le service :

```

sudo systemctl daemon-reload
sudo systemctl enable myapp
sudo systemctl start myapp

```

---

## 5. Configuration du workflow GitHub Actions (`.github/workflows/deploy.yml`)

Crée un fichier `.github/workflows/deploy.yml` dans ton dépôt GitHub :

```

name: Deploy to Ubuntu App Server via Tailscale

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

**Explications** :
- `TAILSCALE_AUTHKEY` : clé d’authentification Tailscale, stockée dans les secrets GitHub.
- `SSH_PRIVATE_KEY` : ta clé privée SSH (format OpenSSH), stockée dans les secrets GitHub.
- `<IP_TAILSCALE_VM>` : remplace par l’IP Tailscale de ta VM Ubuntu (ex : `100.x.x.x`).
- Le workflow se déclenche à chaque `git push` sur la branche `main`, établit un tunnel Tailscale, puis exécute le script de déploiement sur la VM via SSH.

---

## 6. Sécurisation et tests

- **Secrets GitHub** : Ajoute `TAILSCALE_AUTHKEY` et `SSH_PRIVATE_KEY` dans les paramètres du dépôt GitHub (Settings > Secrets and variables > Actions).
- **Test du workflow** : Fais une modification et un `git push` sur `main`. Vérifie sur GitHub Actions que le workflow s’exécute sans erreur et que l’application est redéployée sur la VM.
- **Logs** : Consulte les logs du workflow GitHub et ceux de `systemctl status myapp` sur la VM pour diagnostiquer d’éventuels problèmes.

---

## 7. Résumé du flux

1. Tu fais un `git push` sur la branche `main` de ton dépôt GitHub.
2. GitHub Actions lance le workflow défini dans `.github/workflows/deploy.yml`.
3. Le workflow établit une connexion Tailscale, puis se connecte en SSH à ta VM Ubuntu via son IP Tailscale.
4. Il exécute le script de déploiement (`deploy.sh`) sur la VM, qui fait un `git pull` et redémarre l’application Python.
5. Les changements sont appliqués automatiquement, de manière sécurisée et privée grâce à Tailscale.

---

Avec cette méthode, tu bénéficies d’un déploiement continu sécurisé, sans exposition de ports publics, et d’une configuration simple et maintenable grâce au fichier `.yml` de GitHub Actions.
```

<div style="text-align: center">⁂</div>

[^1]: https://www.ionos.fr/digitalguide/sites-internet/developpement-web/markdown/

[^2]: https://programminghistorian.org/fr/lecons/debuter-avec-markdown

[^3]: https://delladata.fr/4-astuces-pour-rmarkdown/

[^4]: https://support.zendesk.com/hc/fr/articles/4408846544922-Formatage-de-texte-avec-Markdown

[^5]: https://experienceleague.adobe.com/fr/docs/contributor/contributor-guide/writing-essentials/markdown

[^6]: https://fr.markdown.net.br/syntaxe-de-base/

[^7]: https://documentation-snds.health-data-hub.fr/snds/contribuer/guide_contribution/tutoriel_markdown

[^8]: https://docs.github.com/fr/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax

