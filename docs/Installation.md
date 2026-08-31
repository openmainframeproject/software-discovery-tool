# Installation

## Steps for setting up software-discovery-tool application on server

The instructions provided below specify the steps for Ubuntu 24.04:

_**NOTE:**_
* make sure you are logged in as user with sudo permissions

### Step 1: Install prerequisites

#### Install Node.js 22 via NodeSource

Ubuntu 24.04's default apt package provides Node.js 18, which is too old for Vite 8 (requires Node 20.19+ or 22). Install Node.js 22 LTS from NodeSource:

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs
```

Verify:
```bash
node --version   # Should print v22.x.x
```

#### Install remaining system dependencies

```bash
sudo apt update
sudo apt dist-upgrade
sudo apt install git mariadb-server
# Python is only required if you plan to use bin/package_build.py
sudo apt install python3 python3-requests
```

###  Step 2: Checkout the source code
```bash
git clone https://github.com/openmainframeproject/software-discovery-tool.git
cd software-discovery-tool
```

### Step 3: Configure the Node.js Backend

Change to the backend directory and install dependencies:
```bash
cd backend
npm install
```

#### Set up Environment Variables
Create a `.env` file from the example:
```bash
cp .env.example .env
```
Edit the `.env` file with your database credentials, preferred port (default 5000), and `ALLOWED_ORIGINS` (e.g., `http://localhost:3000`).

### Step 4: Cloning Data Directory (Only First Time)
The Software Discovery Tool uses submodules for data. To initialize them:
```bash
git submodule update --init --recursive
```

Then pull the latest data from the submodule's remote (the pinned commit in the repo may be outdated):
```bash
cd distro_data/data_files
git pull https://github.com/openmainframeproject/software-discovery-tool-data.git
cd ../..
```

#### Updating Data Directory
To update the data directory with the latest remote changes:
```bash
git submodule update --recursive --remote
```

#### Bringing in additional data: PDS

To bring in data sources like RHEL, SLES, or Ubuntu, use the `package_build.py` script.

Example of extracting the RHEL_8_Package_List.json from PDS repo:
```bash
python3 ./bin/package_build.py RHEL_8_Package_List.json
```

_**NOTE:**_
After adding new `.json` files, you must update `config/distros.json` to include them. You can do this manually or by running:
```bash
python3 ./bin/config_build.py
```

### Step 5: Install and populate the SQL database

#### Install MariaDB and complete the secure installation.
```bash
sudo apt install mariadb-server
sudo mariadb-secure-installation
```

#### Log in to MariaDB with the root account you set and create the read-only user (with a password, changed below) and database.
```bash
# Log in to MariaDB with the root account you set.
mariadb -u root -p

# Create the read-only user
MariaDB> CREATE USER 'sdtreaduser'@'localhost' IDENTIFIED BY 'SDTUSERPWD';  # Replace 'SDTUSERPWD' with the desired password. 

# Grant permissions.
MariaDB> GRANT SELECT ON sdtDB.* TO 'sdtreaduser'@'localhost';

# Apply changes and exit.
MariaDB> flush privileges;
MariaDB> quit
```

_**NOTE:**_
For enhanced security, we've granted the software-discovery-tool user (sdtreaduser) only read (SELECT) permissions on the required database. This adheres to the principle of least privilege and minimizes the impact if the user credentials are compromised.

#### Populate the database
The database build script uses the configuration from `backend/.env`.

1. Install root dependencies:
   ```bash
   npm install
   ```

2. Run the build script:
   ```bash
   node bin/database_build.js
   ```
When prompted, use a privileged account (like root) to create the tables.

### Step 6: Verify that the software-discovery-tool server is up and running

Start the Node.js backend:
```bash
cd backend
npm start
```

The backend should now be running on port 5000 (or the port specified in your `.env` file). You can visit `http://localhost:5000/api-docs` to see the Swagger documentation.

### Step 7: Start React (frontend) application

#### Change to the react-frontend directory
```bash
cd ../react-frontend
```

#### Install the required npm packages
```bash
npm install
```

#### Setting up the Environment Variables
```bash
cp .env.example .env
```
Ensure `VITE_REACT_APP_API_URL` is set to `/sdt` so that API requests are routed through the Vite dev server proxy to your backend (configured in `vite.config.js`).

#### Start the react frontend application
```bash
npm run dev
```

You can now navigate to the frontend via port 3000 in your web browser.