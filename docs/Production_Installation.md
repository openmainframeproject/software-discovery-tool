# Production Installation

This guide covers deploying the Software Discovery Tool as a production service on Ubuntu 24.04 using Apache2 as the web server. For a developer setup, see [Installation.md](Installation.md).

## Overview

The production deployment has two components:
- **Node.js backend** — runs as a systemd service on port 5000
- **React frontend** — compiled to static files and served by Apache2

> **Note on building the frontend:** Step 6 (building the React frontend) can be done either directly on your production server (since Node.js 22 is installed in Step 1) or on a local development machine. If you build locally, use `scp` to copy the resulting `react-frontend/dist/` directory to your server before proceeding to Step 7.

## Prerequisites

- Ubuntu 24.04 server with sudo access
- Domain name or IP address for the server

---

## Step 1: Install Node.js 22 (via NodeSource)

Ubuntu 24.04's apt ships Node.js 18 which is too old for Vite 8 (requires Node 20.19+ or 22). Install Node.js 22 LTS from NodeSource:

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs
```

Verify the installation:

```bash
node --version   # Should print v22.x.x
npm --version
```

---

## Step 2: Install system dependencies

```bash
sudo apt update
sudo apt dist-upgrade
sudo apt install git apache2 mariadb-server python3 python3-requests
```

---

## Step 3: Clone the repository

```bash
git clone https://github.com/openmainframeproject/software-discovery-tool.git
cd software-discovery-tool
git submodule update --init --recursive
```

---

## Step 4: Set up MariaDB

### Secure the installation

```bash
sudo mariadb-secure-installation
```

### Create the database and read-only user

```bash
mariadb -u root -p
```

```sql
CREATE DATABASE sdtDB;
CREATE USER 'sdtreaduser'@'localhost' IDENTIFIED BY 'REPLACE_WITH_STRONG_PASSWORD';
GRANT SELECT ON sdtDB.* TO 'sdtreaduser'@'localhost';
FLUSH PRIVILEGES;
QUIT;
```

---

## Step 5: Populate the database

### Configure the backend environment

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` and set your database credentials:

```
DB_HOST=localhost
DB_USER=sdtreaduser
DB_PASSWORD=REPLACE_WITH_STRONG_PASSWORD
DB_NAME=sdtDB
PORT=5000
ALLOWED_ORIGINS=http://YOUR_SERVER_IP_OR_DOMAIN
```

### Load package data (optional)

The `distro_data/` submodule pulled in Step 3 already includes data for all supported distributions.

Use `bin/package_build.py` to import any [distro data from PDS](https://github.com/linux-on-ibm-z/PDS/tree/master/distro_data) you wish to include:

```bash
python3 bin/package_build.py RHEL_9_0_Package_List.json
# Repeat for each additional source you want to include
```

The `bin/package_build.py` can also be used to update sources you pulled in via the `distro_data` submodule if you want newer versions than included in that repository, see `--help` in the tool for more.

Edit `config/distros.json` to add the new source files you just pulled in.

### Run the database build script

From the repo root:

```bash
npm install
node bin/database_build.js
```

When prompted, enter a privileged MariaDB account (e.g. root) to create the tables.

---

## Step 6: Build the React frontend

```bash
cd react-frontend
npm install
cp .env.example .env
```

Edit `react-frontend/.env`:

```
VITE_REACT_APP_API_URL=/sdt
```

Build the production bundle:

```bash
npm run build
```

This generates compiled static files in `react-frontend/dist/`.

If you built on a local machine, copy the `dist/` directory to your server:

```bash
scp -r react-frontend/dist/ youruser@YOUR_SERVER_IP:/path/to/software-discovery-tool/react-frontend/
```

---

## Step 7: Configure Apache2

### Enable required Apache modules

```bash
sudo a2enmod proxy proxy_http rewrite headers
sudo systemctl restart apache2
```

### Create the virtual host configuration

A ready-to-use config file is included at `docs/software-discovery-tool.conf`. Copy it into place and update `YOUR_DOMAIN_OR_IP`:

```bash
sudo cp /path/to/software-discovery-tool/docs/software-discovery-tool.conf \
    /etc/apache2/sites-available/software-discovery-tool.conf
sudo sed -i 's/YOUR_DOMAIN_OR_IP/your.actual.domain/' \
    /etc/apache2/sites-available/software-discovery-tool.conf
```

### Deploy the built files

```bash
sudo mkdir -p /srv/www/software-discovery-tool/react-frontend
sudo cp -r react-frontend/dist /srv/www/software-discovery-tool/react-frontend/.
```

### Enable the site

```bash
sudo a2ensite software-discovery-tool.conf
sudo a2dissite 000-default.conf
sudo systemctl reload apache2
```

---

## Step 8: Run the backend as a systemd service

### Create a dedicated system user

```bash
sudo adduser --system --no-create-home sdt
```

### Copy backend and config to /opt

```bash
sudo mkdir -p /opt/software-discovery-tool
sudo cp -r backend /opt/software-discovery-tool/
sudo cp -r config /opt/software-discovery-tool/
sudo chown -R sdt /opt/software-discovery-tool/
```

### Install backend dependencies

```bash
cd /opt/software-discovery-tool/backend
sudo -u sdt HOME=/tmp npm install --omit=dev
```

### Create the systemd service

A ready-to-use service file is included at `docs/sdt-backend.service`. Copy it into place:

```bash
sudo cp /path/to/software-discovery-tool/docs/sdt-backend.service \
    /etc/systemd/system/sdt-backend.service
```

### Start the service

```bash
sudo systemctl daemon-reload
sudo systemctl enable sdt-backend
sudo systemctl start sdt-backend
```

Verify the backend is running:

```bash
sudo systemctl status sdt-backend
curl http://localhost:5000/sdt/getSupportedDistros
```

---

## Step 9: Verify the deployment

Visit `http://YOUR_DOMAIN_OR_IP` in a browser. You should see the Software Discovery Tool frontend and be able to search for packages.

If the frontend loads but searches fail, check:

```bash
sudo tail -f /var/log/apache2/sdt-error.log
sudo journalctl -u sdt-backend -f
```

---

## Updating the deployment

### Update backend

```bash
cd /path/to/software-discovery-tool
git pull
git submodule update --recursive --remote
sudo cp -r backend /opt/software-discovery-tool/
sudo cp -r config /opt/software-discovery-tool/
sudo chown -R sdt /opt/software-discovery-tool/
cd /opt/software-discovery-tool/backend && sudo -u sdt HOME=/tmp npm install --omit=dev
sudo systemctl restart sdt-backend
```

### Update frontend

```bash
cd react-frontend
npm install
npm run build
sudo cp -r dist /srv/www/software-discovery-tool/react-frontend/.
sudo systemctl reload apache2
```
