# Installation

## Steps for setting up software-discovery-tool application on server

The instructions provided below specify the steps for Ubuntu 20.04/22.04/24.04:

_**NOTE:**_
* make sure you are logged in as user with sudo permissions

### Step 1: Install prerequisites

System prerequisites

```bash
sudo apt update
sudo apt dist-upgrade
sudo apt install nodejs npm git mariadb-server python3-pymysql python3-requests
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
Edit the `.env` file with your database credentials.

### Step 4: Cloning Data Directory (Only First Time)
The Software Discovery Tool uses submodules for data. To initialize them:
```bash
git submodule update --init --recursive --remote
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

### Step 5: Install and populate the SQL database

#### Install MariaDB and complete the secure installation.
```bash
sudo apt install mariadb-server
sudo mariadb-secure-installation
```

#### Log in to MariaDB and create the read-only user and database.
```bash
mariadb -u root -p

# Create the database
MariaDB> CREATE DATABASE sdtDB;

# Create the read-only user
MariaDB> CREATE USER 'sdtreaduser'@'localhost' IDENTIFIED BY 'SDTUSERPWD';  # Replace 'SDTUSERPWD' with the desired password. 

# Grant permissions.
MariaDB> GRANT SELECT ON sdtDB.* TO 'sdtreaduser'@'localhost';

# Apply changes and exit.
MariaDB> flush privileges;
MariaDB> quit
```

#### Run the script to populate the database
When prompted, use a privileged account (like root) to create the tables.
```bash
python3 ./bin/database_build.py
```

### Step 6: Verify that the software-discovery-tool server is up and running

Start the Node.js backend:
```bash
cd backend
npm start
```

The backend should now be running on port 5000 (or the port specified in your `.env` file).

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
Ensure `REACT_APP_API_URL` points to your backend URL.

#### Start the react frontend application
```bash
npm start
```

You can now navigate to the frontend via port 3000 in your web browser.
