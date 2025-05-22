<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" class="logo" width="120"/>

# Maintenant je souhaiterais mettre en place le monitoring de plusieurs choses :

L'état de la VM server, l'état de l'app python et l'état de la base de donnée mariadb. Ce monitoring sera hébérgé sur une vm debian en non graphique, il faut donc commencer par l'étape d'installation de la vm

Voici un tutoriel pas à pas pour mettre en place le monitoring de l’état de ta VM Debian (serveur), de ton application Python et de ta base de données MariaDB, en partant de l’installation de la VM de supervision.

---

## 1. Installer une VM Debian sans interface graphique

### a. Télécharger l’ISO Debian

- Va sur le site officiel [debian.org](https://www.debian.org/) et télécharge l’image "netinst" ou "CD" de Debian.


### b. Créer la machine virtuelle

- Utilise VirtualBox, VMware ou Proxmox.
- Attribue au moins 1 Go de RAM et 10 Go de disque (plus si besoin).
- Monte l’ISO téléchargé.


### c. Installation sans interface graphique

- Démarre la VM sur l’ISO.
- Suis les instructions : choisis la langue, le fuseau horaire, le partitionnement.
- Quand le choix des logiciels s’affiche, **décoche "Environnement de bureau Debian"** et laisse seulement "Utilitaires usuels du système" et "serveur SSH" si tu veux l’accès distant[^2][^5][^4][^8].
- Termine l’installation.

---

## 2. Mettre à jour et préparer la VM

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install vim htop curl wget git -y
```


---

## 3. Monitoring de l’état de la VM (ressources système)

### a. Installer et utiliser `htop` (console)

```bash
sudo apt install htop -y
htop
```

- Permet de surveiller CPU, RAM, processus en temps réel.


### b. Installer `glances` (plus détaillé)

```bash
sudo apt install glances -y
glances
```

- Surveille CPU, RAM, disque, réseau, etc.


### c. Pour un monitoring distant et centralisé : **Netdata**

```bash
bash <(curl -Ss https://my-netdata.io/kickstart.sh)
```

- Accès web sur `http://<ip_vm>:19999`
- Netdata donne un tableau de bord temps réel pour la VM, les services, et la base de données.

---

## 4. Monitoring de l’application Python

### a. Superviser le processus (ex : avec `supervisord`)

```bash
sudo apt install supervisor -y
```

Crée un fichier de conf `/etc/supervisor/conf.d/app.conf` :

```
[program:myapp]
command=python3 /chemin/vers/app.py
directory=/chemin/vers/
autostart=true
autorestart=true
stderr_logfile=/var/log/myapp.err.log
stdout_logfile=/var/log/myapp.out.log
```

Redémarre supervisor :

```bash
sudo supervisorctl reread
sudo supervisorctl update
```

- Permet de voir si l’app Python tourne et de la relancer automatiquement en cas de crash.


### b. Monitoring applicatif (optionnel)

Tu peux utiliser des outils comme Prometheus + exporters Python, ou des solutions comme [IBM Python Data Collector][^6][^9] pour des métriques plus fines (requêtes, erreurs, temps de réponse).

---

## 5. Monitoring de la base de données MariaDB

### a. Installer un plugin de monitoring (ex : Netdata, Prometheus, Centreon)

#### **Avec Netdata** (déjà installé plus haut)

Netdata détecte automatiquement MariaDB/MySQL et affiche des métriques (requêtes, connexions, slow queries…).

#### **Avec Prometheus + MySQL Exporter**[^10]

Sur la VM qui fait le monitoring :

```bash
sudo apt install prometheus prometheus-mysqld-exporter -y
```

Configure l’exporter avec les accès à MariaDB, puis ajoute-le à la config Prometheus, et visualise avec Grafana.

#### **Avec Centreon**[^7]

- Installe le plugin sur la VM de supervision :

```bash
sudo apt install centreon-plugin-applications-databases-mysql
```

- Crée un utilisateur MariaDB dédié au monitoring avec les droits `SELECT` :

```sql
CREATE USER 'monitoring'@'ip_vm_monitor' IDENTIFIED BY 'motdepasse';
GRANT SELECT ON *.* TO 'monitoring'@'ip_vm_monitor';
FLUSH PRIVILEGES;
```


---

## 6. Accès aux tableaux de bord

- **Netdata** : http://ip_de_ta_vm_monitor:19999
- **Prometheus/Grafana** : via leur interface web respective
- **Centreon** : via son interface web si tu l’as installée

---

## Résumé

- **VM Debian non graphique** : installation minimale, sécurité et légèreté
- **Monitoring VM** : htop, glances, Netdata
- **Surveillance app Python** : supervisor, Netdata, Prometheus exporter
- **Surveillance MariaDB** : Netdata, Prometheus exporter, Centreon plugin

Ce setup te permet de surveiller en temps réel l’état de la VM, de l’application Python et de la base MariaDB, le tout sur une VM Debian légère et sans interface graphique[^2][^5][^7][^10][^12].

<div style="text-align: center">⁂</div>

[^1]: https://www.reddit.com/r/debian/comments/1ieq7lt/debian_doesnt_allow_me_to_choose_install_with_or/?tl=fr

[^2]: https://goopensource.fr/debian-installation-sans-interface-graphique/

[^3]: https://www.youtube.com/watch?v=Bt5k4nV5coI

[^4]: https://forum-debian.fr/viewtopic.php?t=2986

[^5]: https://www.youtube.com/watch?v=pr54p_7nEHA

[^6]: https://www.ibm.com/docs/en/cloud-paks/cp-management/2.3.0?topic=collection-configuring-python-application-monitoring

[^7]: https://docs.centreon.com/docs/getting-started/monitor-mysql-server/

[^8]: https://www.reddit.com/r/debian/comments/18ipqwl/debian_12_installation_problem/?tl=fr

[^9]: https://www.ibm.com/docs/fr/cloud-paks/cp-management/2.3.x?topic=collection-configuring-python-application-monitoring

[^10]: https://www.digitalocean.com/community/tutorials/monitoring-mysql-and-mariadb-droplets-using-prometheus-mysql-exporter

[^11]: https://stackoverflow.com/questions/43974559/forking-daemonizing-and-monitoring-a-python-script

[^12]: https://www.linuxbabe.com/ubuntu/mysql-mariadb-database-performance-monitoring-percona

[^13]: https://www.reddit.com/r/selfhosted/comments/102xq3m/very_lightweight_monitoring_of_various/

[^14]: https://dev.to/shricodev/learn-to-monitor-your-python-application-like-a-pro-15pg

