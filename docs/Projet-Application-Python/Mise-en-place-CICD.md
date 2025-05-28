# Déploiement automatisé via Tailscale, GitHub Actions et PM2

Ce guide explique comment mettre en place un déploiement continu (CI/CD) pour une **application Python** sur une VM Ubuntu, en utilisant **Tailscale** pour un accès réseau privé, **PM2** comme gestionnaire de processus Python, et un workflow GitHub Actions pour automatiser le déploiement à chaque `git push`.

---

## Sommaire

1. [Pré-requis](#pr%C3%A9-requis)
2. [Installation et configuration de Tailscale](#installation-et-configuration-de-tailscale)
    - [Générer une clé d’authentification Tailscale (Auth Key)](#g%C3%A9n%C3%A9rer-une-cl%C3%A9-dauthentification-tailscale-auth-key)
3. [Installation et configuration de PM2 pour Python](#installation-et-configuration-de-pm2-pour-python)
4. [Préparation de la VM Ubuntu pour le déploiement Python](#pr%C3%A9paration-de-la-vm-ubuntu-pour-le-d%C3%A9ploiement-python)
    - [Générer et configurer la clé SSH pour le déploiement](#g%C3%A9n%C3%A9rer-et-configurer-la-cl%C3%A9-ssh-pour-le-d%C3%A9ploiement)
5. [Configuration du workflow GitHub Actions (`deploy.yml`)](#configuration-du-workflow-github-actions-deployyml)
6. [Sécurisation et tests](#s%C3%A9curisation-et-tests)
7. [Résumé du flux](#r%C3%A9sum%C3%A9-du-flux)

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

```bash
curl -fsSL https://tailscale.com/install.sh | sh
sudo tailscale up --authkey=<TAILSCALE_AUTHKEY> --hostname="ubuntu-app-server"
```


### b. Générer une clé d’authentification Tailscale (Auth Key)

1. Connecte-toi à [https://login.tailscale.com/admin](https://login.tailscale.com/admin)
2. Dans le menu de gauche, clique sur **Settings** (ou **Paramètres**).
3. Clique sur **Keys** (ou **Clés d’authentification**).
4. Clique sur **Generate auth key** (ou **Générer une clé d’authentification**).
5. Coche les options recommandées :
    - **Ephemeral** (éphémère) : la clé ne peut être utilisée qu’une seule fois (idéal pour CI/CD).
    - **Reusable** (réutilisable) : optionnelle, si tu veux que la clé puisse être utilisée plusieurs fois.
    - **Preauthorized** (préautorisée) : permet à la VM de rejoindre le réseau sans validation manuelle.
6. Clique sur **Generate key**.
7. **Copie la clé générée** et conserve-la précieusement (elle ne sera plus affichée).

### c. Vérifier l’adresse Tailscale de la VM

```bash
tailscale ip -4
```

- Note cette IP (ex: `100.x.x.x`).

---

## 3. Installation et configuration de PM2 pour Python

### a. Installer Node.js et PM2

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2
```


### b. Lancer l’application Python avec PM2

Depuis le dossier de ton projet (par exemple `/opt/ton-repo`) :

```bash
pm2 start app.py --interpreter /usr/bin/python3 --name myapp
```

- `--interpreter /usr/bin/python3` force l’utilisation de Python 3.
- `--name myapp` donne un nom à ton processus.


### c. S’assurer que l’application redémarre au reboot

```bash
pm2 startup
# Suis l’instruction affichée (copie/colle la commande générée)
pm2 save
```


### d. Commandes utiles PM2

- Redémarrer l’appli : `pm2 restart myapp`
- Voir les logs : `pm2 logs myapp`
- Lister les apps : `pm2 list`

---

## 4. Préparation de la VM Ubuntu pour le déploiement Python

### a. Générer et configurer la clé SSH pour le déploiement

#### 1. Générer une nouvelle paire de clés SSH sur ta machine locale

Ouvre un terminal et exécute :

```bash
ssh-keygen -t ed25519 -C "github-deploy"
```

- Appuie sur **Entrée** à chaque question pour accepter les valeurs par défaut (le fichier sera créé dans `~/.ssh/id_ed25519`).
- Tu obtiens deux fichiers :
    - **Clé privée** : `~/.ssh/id_ed25519` (à rentrer dans les secrets github sous le titre SSH_PRIVATE_KEY)
    - **Clé publique** : `~/.ssh/id_ed25519.pub` (à copier sur la VM)


#### 2. Copier la clé publique sur la VM Ubuntu

Sur ta machine locale (remplace ubuntu par ton nom d'utilisateur):

```bash
ssh-copy-id -i ~/.ssh/id_ed25519.pub ubuntu@<IP_TAILSCALE_VM>
```

ou, si `ssh-copy-id` n’est pas disponible :

```bash
cat ~/.ssh/id_ed25519.pub | ssh ubuntu@<IP_TAILSCALE_VM> 'mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys'
```

- Cela autorise les connexions SSH sans mot de passe depuis GitHub Actions (qui utilisera la clé privée).


#### 3. Tester la connexion SSH

Depuis ta machine locale :

```bash
ssh -i ~/.ssh/id_ed25519 ubuntu@<IP_TAILSCALE_VM>
```

- Tu dois pouvoir te connecter sans mot de passe.


#### 4. Sécuriser les permissions sur la VM

Sur la VM, vérifie :

```bash
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```


### b. Cloner le dépôt sur la VM

```bash
cd /opt
git clone git@github.com:ton-utilisateur/ton-repo.git
cd ton-repo
```

- Si tu utilises une URL HTTPS, adapte la commande en conséquence.


### c. Créer un script de déploiement

Dans `/opt/ton-repo/deploy.sh` :

```bash
#!/bin/bash
git pull origin main
pm2 restart myapp
```

Rends-le exécutable :

```bash
chmod +x deploy.sh
```


---

## 5. Configuration du workflow GitHub Actions (`deploy.yml`)

Crée un fichier `.github/workflows/deploy.yml` dans ton dépôt GitHub :

```yaml
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
- Ajoute la clé privée SSH et la clé Tailscale dans les **secrets GitHub**.

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