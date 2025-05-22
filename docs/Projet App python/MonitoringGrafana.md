# Monitoring via Grafana/Prometheus

# Tutoriel : Monitoring d’une VM Ubuntu (App + MariaDB) avec une VM Debian (Grafana + Prometheus)

Ce guide détaille comment monitorer :
- Une VM Ubuntu Server hébergeant à la fois l’application Python **et** la base MariaDB
- Depuis une VM Debian (sans interface graphique) qui héberge **Prometheus** et **Grafana**

---

## Sommaire

1. [Schéma de l’architecture](#1-schéma-de-larchitecture)
2. [Sur la VM Ubuntu (App + MariaDB)](#2-sur-la-vm-ubuntu-app--mariadb)
    - a. Installer Node Exporter (monitoring système)
    - b. Installer mysqld_exporter (monitoring MariaDB)
    - c. Exposer les métriques de l’application Python
3. [Sur la VM Debian (Monitoring)](#3-sur-la-vm-debian-monitoring)
    - a. Installer Prometheus
    - b. Configurer Prometheus pour scraper la VM Ubuntu
    - c. Installer Grafana
    - d. Connecter Grafana à Prometheus
4. [Créer et importer des dashboards Grafana](#4-créer-et-importer-des-dashboards-grafana)
5. [Ressources](#5-ressources)

---

## 1. Schéma de l’architecture

```

[ VM Ubuntu ]
├─ Application Python (port 5000)
├─ MariaDB
├─ Node Exporter (port 9100)
└─ mysqld_exporter (port 9104)
│
▼
[ Réseau local ]
│
▼
[ VM Debian ]
├─ Prometheus (port 9090)
└─ Grafana (port 3000)

```

---

## 2. Sur la VM Ubuntu (App + MariaDB)

### a. Installer Node Exporter (monitoring système)

```

cd /opt
wget https://github.com/prometheus/node_exporter/releases/download/v1.8.1/node_exporter-1.8.1.linux-amd64.tar.gz
tar xvf node_exporter-1.8.1.linux-amd64.tar.gz
sudo mv node_exporter-1.8.1.linux-amd64/node_exporter /usr/local/bin/

```

Créer un service systemd :

```

sudo nano /etc/systemd/system/node_exporter.service

```

Contenu :
```

[Unit]
Description=Node Exporter
After=network.target

[Service]
User=nobody
ExecStart=/usr/local/bin/node_exporter

[Install]
WantedBy=default.target

```

Activer et démarrer :

```

sudo systemctl daemon-reload
sudo systemctl enable node_exporter
sudo systemctl start node_exporter

```
Vérifie sur : `http://<IP_VM_UBUNTU>:9100/metrics`

---

### b. Installer mysqld_exporter (monitoring MariaDB)

**1. Créer un utilisateur MariaDB pour l’exporter**  
Connecte-toi à MariaDB :

```

sudo mariadb

```
Dans le shell MariaDB :
```

CREATE USER 'exporter'@'localhost' IDENTIFIED BY 'motdepasse_exporter';
GRANT PROCESS, REPLICATION CLIENT, SELECT ON *.* TO 'exporter'@'localhost';
FLUSH PRIVILEGES;
EXIT;

```

**2. Installer mysqld_exporter**  
```

cd /opt
wget https://github.com/prometheus/mysqld_exporter/releases/download/v0.15.1/mysqld_exporter-0.15.1.linux-amd64.tar.gz
tar xvf mysqld_exporter-0.15.1.linux-amd64.tar.gz
sudo mv mysqld_exporter-0.15.1.linux-amd64/mysqld_exporter /usr/local/bin/

```

Créer le fichier de config :

```

sudo nano /etc/.mysqld_exporter.cnf

```
Contenu :
```

[client]
user=exporter
password=motdepasse_exporter

```
Protéger le fichier :
```

sudo chmod 600 /etc/.mysqld_exporter.cnf

```

Créer le service systemd :

```

sudo nano /etc/systemd/system/mysqld_exporter.service

```
Contenu :
```

[Unit]
Description=Prometheus MySQL Exporter
After=network.target

[Service]
User=nobody
Environment="DATA_SOURCE_NAME=exporter:motdepasse_exporter@(localhost:3306)/"
ExecStart=/usr/local/bin/mysqld_exporter --config.my-cnf=/etc/.mysqld_exporter.cnf

[Install]
WantedBy=multi-user.target

```

Activer et démarrer :

```

sudo systemctl daemon-reload
sudo systemctl enable mysqld_exporter
sudo systemctl start mysqld_exporter

```
Vérifie sur : `http://<IP_VM_UBUNTU>:9104/metrics`

---

### c. Exposer les métriques de l’application Python

Dans ton projet Flask, installe l’exporter Prometheus :

```

pip install prometheus_flask_exporter

```

Dans `app.py` :
```

from flask import Flask
from prometheus_flask_exporter import PrometheusMetrics

app = Flask(__name__)
metrics = PrometheusMetrics(app)

@app.route('/')
def index():
return "Hello, world!"

if __name__ == '__main__':
app.run(host='0.0.0.0')

```
Les métriques seront disponibles sur :  
`http://<IP_VM_UBUNTU>:5000/metrics`

---

## 3. Sur la VM Debian (Monitoring)

### a. Installer Prometheus

```

sudo apt update
sudo apt install prometheus -y

```
Prometheus écoute sur le port 9090.

---

### b. Configurer Prometheus pour scraper la VM Ubuntu

Édite `/etc/prometheus/prometheus.yml` et ajoute dans `scrape_configs` :

```

scrape_configs:

- job_name: 'node_exporter'
static_configs:
    - targets: ['<IP_VM_UBUNTU>:9100']
- job_name: 'mysqld_exporter'
static_configs:
    - targets: ['<IP_VM_UBUNTU>:9104']
- job_name: 'python_app'
metrics_path: /metrics
static_configs:
    - targets: ['<IP_VM_UBUNTU>:5000']

```

Redémarre Prometheus :

```

sudo systemctl restart prometheus

```

---

### c. Installer Grafana

```

sudo apt-get install -y apt-transport-https software-properties-common wget
wget -q -O - https://packages.grafana.com/gpg.key | sudo apt-key add -
echo "deb https://packages.grafana.com/oss/deb stable main" | sudo tee /etc/apt/sources.list.d/grafana.list
sudo apt update
sudo apt install grafana -y
sudo systemctl enable grafana-server
sudo systemctl start grafana-server

```
Grafana est accessible sur :  
`http://<IP_VM_DEBIAN>:3000`  
Identifiants par défaut : `admin` / `admin`

---

### d. Connecter Grafana à Prometheus

1. Connecte-toi à Grafana
2. Va dans **Configuration > Data Sources > Add data source**
3. Choisis **Prometheus**
4. Renseigne l’URL : `http://localhost:9090` (si Grafana et Prometheus sont sur la même VM Debian)
5. Clique sur **Save & Test**

---

## 4. Créer et importer des dashboards Grafana

- **Pour le monitoring système (Node Exporter)** :
    - Dashboard ID : **1860** ([Node Exporter Full](https://grafana.com/grafana/dashboards/1860-node-exporter-full/))
- **Pour MariaDB/MySQL** :
    - Dashboard ID : **7362** ([MySQL Overview](https://grafana.com/grafana/dashboards/7362-mysql-overview/))
- **Pour l’application Python** :
    - Crée tes propres graphes à partir des métriques exposées par `prometheus_flask_exporter`

Pour importer un dashboard :
1. Va dans **Dashboard > Import**
2. Entre l’ID du dashboard
3. Sélectionne ta source de données Prometheus
4. Clique sur **Import**

---

## 5. Ressources

- [Documentation officielle Prometheus](https://prometheus.io/docs/)
- [Documentation officielle Grafana](https://grafana.com/docs/)
- [Exporter Flask pour Prometheus](https://github.com/rycus86/prometheus_flask_exporter)
- [Node Exporter Dashboard (ID 1860)](https://grafana.com/grafana/dashboards/1860-node-exporter-full/)
- [MariaDB/MySQL Dashboard (ID 7362)](https://grafana.com/grafana/dashboards/7362-mysql-overview/)
- [Exemple de configuration multi-serveurs Grafana/Prometheus][^1][^2][^3][^5][^6][^7][^8]

---

**Résumé** :  
Avec ce setup, tu surveilles l’état de ta VM Ubuntu (app + MariaDB) depuis une VM Debian dédiée au monitoring, avec une interface web moderne, centralisée et accessible depuis n’importe quel navigateur.
```

Ce tutoriel est prêt à être utilisé pour déployer une supervision complète de ton infrastructure !

<div style="text-align: center">⁂</div>

[^1]: https://community.grafana.com/t/how-to-add-multiple-servers-to-single-dashboard/28050

[^2]: https://www.reddit.com/r/PrometheusMonitoring/comments/7tv8cv/monitoring_two_or_more_servers_with_prometheus/

[^3]: https://grafana.com/docs/grafana/latest/getting-started/get-started-grafana-prometheus/

[^4]: https://community.grafana.com/t/how-to-display-stat-panels-from-multiple-prometheus-sources-in-one-dashboard/131512

[^5]: https://techhut.tv/monitor-home-server-grafana-prometheus-influxdb/

[^6]: https://www.scaleway.com/en/docs/tutorials/prometheus-monitoring-grafana-dashboard/

[^7]: https://blog.devops.dev/host-container-monitoring-with-grafana-prometheus-d880137b7cc0

[^8]: https://discuss.prometheus.io/t/one-cluster-with-prometheus-to-scrape-multiple-clusters/1365

