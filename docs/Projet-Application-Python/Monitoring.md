# Monitoring via Grafana/Prometheus

Ce guide détaille comment monitorer :

- Une VM Ubuntu Server hébergeant à la fois l’application Python **et** la base MariaDB
- Depuis une VM Debian (sans interface graphique, vierge sauf openssh-server) qui héberge **Prometheus** et **Grafana**

> **À chaque fois que tu vois une adresse IP (exemple : `192.168.1.100` ou `192.168.1.90`), ADAPTE-LA à ton propre réseau !**

---

## Sommaire

1. [Schéma de l’architecture](#1-sch%C3%A9ma-de-larchitecture)
2. [Sur la VM Ubuntu (App + MariaDB)](#2-sur-la-vm-ubuntu-app--mariadb)
    - a. Installer Node Exporter (monitoring système)
    - b. Installer mysqld_exporter (monitoring MariaDB)
    - c. Exposer les métriques de l’application Python
3. [Sur la VM Debian (Monitoring)](#3-sur-la-vm-debian-monitoring)
    - a. Installer Prometheus
    - b. Configurer Prometheus pour scraper la VM Ubuntu
    - c. Installer Grafana
    - d. Connecter Grafana à Prometheus
4. [Créer et importer des dashboards Grafana](#4-cr%C3%A9er-et-importer-des-dashboards-grafana)
    - a. Dashboard système
    - b. Dashboard MariaDB
    - c. Dashboard pour l’application Python (exemple détaillé)
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

```bash
cd /opt
sudo wget https://github.com/prometheus/node_exporter/releases/download/v1.8.1/node_exporter-1.8.1.linux-amd64.tar.gz
sudo tar xvf node_exporter-1.8.1.linux-amd64.tar.gz
sudo mv node_exporter-1.8.1.linux-amd64/node_exporter /usr/local/bin/
```

Créer un service systemd :

```bash
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
WantedBy=multi-user.target
```

Activer et démarrer :

```bash
sudo systemctl daemon-reload
sudo systemctl enable node_exporter
sudo systemctl start node_exporter
```

Vérifie sur : `http://<IP_VM_UBUNTU>:9100/metrics`

---

### b. Installer mysqld_exporter (monitoring MariaDB)

**1. Créer un utilisateur MariaDB pour l’exporter**
Connecte-toi à MariaDB :

```bash
sudo mariadb
```

Dans le shell MariaDB :

```sql
CREATE USER 'exporter'@'localhost' IDENTIFIED BY 'motdepasse_exporter';
GRANT PROCESS, REPLICATION CLIENT, SELECT ON *.* TO 'exporter'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

**2. Installer mysqld_exporter**

```bash
cd /opt
wget https://github.com/prometheus/mysqld_exporter/releases/download/v0.15.1/mysqld_exporter-0.15.1.linux-amd64.tar.gz
tar xvf mysqld_exporter-0.15.1.linux-amd64.tar.gz
sudo mv mysqld_exporter-0.15.1.linux-amd64/mysqld_exporter /usr/local/bin/
```

Créer le fichier de config :

```bash
sudo nano /etc/.mysqld_exporter.cnf
```

Contenu :

```
[client]
user=exporter
password=motdepasse_exporter
```

Protéger le fichier :

```bash
sudo chmod 600 /etc/.mysqld_exporter.cnf
```

Créer le service systemd :

```bash
sudo nano /etc/systemd/system/mysqld_exporter.service
```

Contenu :

```
[Unit]
Description=Prometheus MySQL Exporter
After=network.target

[Service]
User=nobody
ExecStart=/usr/local/bin/mysqld_exporter --config.my-cnf=/etc/.mysqld_exporter.cnf

[Install]
WantedBy=multi-user.target
```

Activer et démarrer :

```bash
sudo systemctl daemon-reload
sudo systemctl enable mysqld_exporter
sudo systemctl start mysqld_exporter
```

Vérifie sur : `http://<IP_VM_UBUNTU>:9104/metrics`

---

### c. Exposer les métriques de l’application Python

Dans ton projet Flask, installe l’exporter Prometheus :

```bash
pip install prometheus_flask_exporter
```

Dans `app.py` :

```python
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

```bash
sudo apt update
sudo apt install prometheus -y
```

Prometheus écoute sur le port 9090.

---

### b. Configurer Prometheus pour scraper la VM Ubuntu

Édite `/etc/prometheus/prometheus.yml` et ajoute dans `scrape_configs` :

```yaml
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

```bash
sudo systemctl restart prometheus
```


---

### c. Installer Grafana

```bash
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
5. Clique sur **Save \& Test**

---

## 4. Créer et importer des dashboards Grafana

### a. Dashboard système (Node Exporter)

- Dashboard ID : **1860** ([Node Exporter Full](https://grafana.com/grafana/dashboards/1860-node-exporter-full/))


### b. Dashboard MariaDB/MySQL

- Dashboard ID : **7362** ([MySQL Overview](https://grafana.com/grafana/dashboards/7362-mysql-overview/))


### c. Dashboard pour l’application Python (exemple détaillé)

#### Exemple de panels pour ton dashboard Python

1. **Nombre total de requêtes HTTP**
    - **Titre** : Total HTTP Requests
    - **Query** :

```
sum(flask_http_request_total)
```

    - **Type** : Stat
2. **Nombre de requêtes par endpoint**
    - **Titre** : Requests per Endpoint
    - **Query** :

```
sum by (endpoint) (flask_http_request_total)
```

    - **Type** : Table ou Bar Chart
3. **Temps moyen de réponse**
    - **Titre** : Average Response Time (s)
    - **Query** :

```
sum(rate(flask_http_request_duration_seconds_sum[1m])) / sum(rate(flask_http_request_duration_seconds_count[1m]))
```

    - **Type** : Stat
4. **Uptime de l’application**
    - **Titre** : Application Uptime (heures)
    - **Query** :

```
(time() - process_start_time_seconds{job="python_app"}) / 3600
```

    - **Type** : Stat
5. **Utilisation mémoire**
    - **Titre** : RAM utilisée (MB)
    - **Query** :

```
process_resident_memory_bytes{job="python_app"} / 1024 / 1024
```

    - **Type** : Stat
6. **Utilisation CPU**
    - **Titre** : CPU Time (s)
    - **Query** :

```
process_cpu_seconds_total{job="python_app"}
```

    - **Type** : Stat

#### Comment créer ce dashboard dans Grafana

1. Va dans **+ > Dashboard > Add new panel**
2. Pour chaque panel :
    - Colle la requête (query) Prometheus correspondante
    - Choisis le type de visualisation (Stat, Table, Bar Chart…)
    - Donne un titre explicite
    - Clique sur **Apply**
3. Organise tes panels comme tu le souhaites
4. Clique sur **Save dashboard** pour enregistrer

---

## 5. Ressources

- [Documentation officielle Prometheus](https://prometheus.io/docs/)
- [Documentation officielle Grafana](https://grafana.com/docs/)
- [Exporter Flask pour Prometheus](https://github.com/rycus86/prometheus_flask_exporter)
- [Node Exporter Dashboard (ID 1860)](https://grafana.com/grafana/dashboards/1860-node-exporter-full/)
- [MariaDB/MySQL Dashboard (ID 7362)](https://grafana.com/grafana/dashboards/7362-mysql-overview/)

---

**Résumé** :
Avec ce setup, tu surveilles l’état de ta VM Ubuntu (app + MariaDB) et de ton application Python depuis une VM Debian dédiée au monitoring, avec une interface web moderne, centralisée et accessible depuis n’importe quel navigateur.
Tu as maintenant un exemple précis pour créer un dashboard Grafana dédié à ton application Python, incluant uptime, requêtes, temps de réponse, RAM, CPU, etc.