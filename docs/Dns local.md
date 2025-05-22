# DNS ou Reverse Proxy ?

Ce guide explique comment :
- Configurer Nginx comme reverse proxy pour une application Python (ex : Flask)
- Accéder à l’application via une URL personnalisée (ex : `monapp.local`) au lieu de l’IP
- Utiliser soit la méthode du fichier `hosts`, soit un DNS local avec `dnsmasq`

---

## Sommaire

1. [Configurer Nginx comme reverse proxy](#1-configurer-nginx-comme-reverse-proxy)
2. [Méthode 1 : Ajouter un nom de domaine local via le fichier hosts](#2-méthode-1-ajouter-un-nom-de-domaine-local-via-le-fichier-hosts)
3. [Méthode 2 : Installer et configurer un DNS local avec dnsmasq](#3-méthode-2-installer-et-configurer-un-dns-local-avec-dnsmasq)
4. [Accéder à l’application](#4-accéder-à-lapplication)
5. [Remarques](#5-remarques)

---

## 1. Configurer Nginx comme reverse proxy

Supposons que ton application Python (Flask) tourne sur le port 5000.

Crée un fichier de configuration Nginx pour ton site, par exemple `/etc/nginx/sites-available/monapp` :

```
server {
listen 80;
server_name monapp.local;

location / {
    proxy_pass http://127.0.0.1:5000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Active la configuration et recharge Nginx :

```bash
sudo ln -s /etc/nginx/sites-available/monapp /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 2. Méthode 1 : Ajouter un nom de domaine local via le fichier hosts

Sur la machine cliente (celle depuis laquelle tu veux accéder à l’application), édite le fichier `hosts` :

- **Linux/Mac** : `/etc/hosts`
- **Windows** : `C:\Windows\System32\drivers\etc\hosts`

Ajoute la ligne suivante (remplace l’IP par celle de ta VM, et "monapp" par le nom que tu souhaites donner à ton site) :
```
192.168.1.42 monapp.local
```

Enregistre le fichier.

Sur Windows, tu peux forcer le rafraîchissement du cache DNS avec :

```
ipconfig /flushdns
```


---

## 3. Méthode 2 : Installer et configurer un DNS local avec dnsmasq

Cette méthode permet à tous les appareils de ton réseau d’accéder à l’application via le même nom de domaine local, sans modifier chaque fichier hosts.

### a. Installer dnsmasq sur une machine du réseau

```
sudo apt update
sudo apt install dnsmasq
```

### b. Configurer dnsmasq pour ton domaine local

Ouvre ou crée le fichier `/etc/dnsmasq.d/monapp.conf` :

```
sudo nano /etc/dnsmasq.d/monapp.conf
```
Ajoute la ligne suivante (remplace l’IP par celle de ta VM) :

```
address=/monapp.local/192.168.1.42
```

Redémarre dnsmasq :

```
sudo systemctl restart dnsmasq
```


### c. Configurer les clients pour utiliser le serveur DNS local

Sur chaque machine cliente, configure l’adresse IP de la machine où dnsmasq est installé comme serveur DNS principal.  
- Sous Linux/Mac, modifie les paramètres réseau ou `/etc/resolv.conf` :
    ```
    nameserver 192.168.1.42
    ```
- Sous Windows, va dans les propriétés de la carte réseau et définis le DNS manuellement.

### d. Tester la résolution

Sur la machine cliente :
```
ping monapp.local
```

Tu dois voir l’IP de ta VM en réponse.

---

## 4. Accéder à l’application

Dans ton navigateur, tape simplement :

http://monapp.local


Tu seras redirigé vers ton application Python hébergée sur la VM, via Nginx.

---

## 5. Remarques

- **Méthode hosts** : fonctionne uniquement sur les machines où tu as modifié le fichier hosts.
- **Méthode dnsmasq** : idéale pour un réseau local, car tous les appareils peuvent accéder à l’URL sans configuration supplémentaire.
- Pour plusieurs applications/sites, ajoute d’autres lignes dans le fichier hosts ou d’autres entrées dans la configuration dnsmasq, et crée d’autres blocs `server` dans Nginx.
- Pour un usage en production ou sur un réseau plus large, il est recommandé d’utiliser un vrai serveur DNS ou d’acheter un nom de domaine.(Exemples de fournisseurs DNS : Cloudflare, Google Public DNS, Cisco OpenDNS)

---

**Résumé** :  
Nginx gère le reverse proxy vers ton application Python, et tu peux accéder à celle-ci via une URL personnalisée grâce à la modification du fichier hosts ou à l’utilisation de dnsmasq comme DNS local.






