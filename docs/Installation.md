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
sudo apt install nodejs npm git mariadb-server
```

###  Step 2: Checkout the source code, into /opt/ folder
```bash
cd /opt/
sudo git clone https://github.com/openmainframeproject/software-discovery-tool.git
cd software-discovery-tool
```
        
Note: In case software-discovery-tool code is already checked out, do the following for latest updates
```bash
cd /opt/software-discovery-tool
sudo git pull origin master
```

### Step 3: Configure the Node.js Backend

Change to the backend directory and install dependencies:
```bash
cd /opt/software-discovery-tool/backend
sudo npm install
```

#### Set up Environment Variables
Create a `.env` file from the example:
```bash
sudo cp .env.example .env
```
Edit the `.env` file with your database credentials.

### Step 4: Install and populate the SQL database

### Step 5: Cloning Data Directory (Only First Time)
 openmainframeproject/software-discovery-tool-data contains all OMP created json files. To add the data files, we will use `git submodule`
- map the submodule directory with the directory path and update the directory:
```bash
sudo -u www-data git submodule update --init --recursive --remote
```

#### Updating Data Directory
Everytime there's an upstream change in the submodule:
- To update the data directory with the main repo with the remote changes:
```bash
sudo -u www-data git pull <upstream remote> <default branch> --recurse-submodules
```
- To update ONLY the data directory keeping the main repo as it is:
```bash
sudo -u www-data git submodule update --recursive --remote
```

#### Bringing in additional data: PDS

The data directory we cloned above only brings in sources maintained by this project. Notably it does not include SUSE Linux Enterprise Server, Red Hat Enterprise Linux, or Ubuntu. Instead, these sources are maintained by the Package Distro Search tool (abbreviated as PDS). In order to bring in those data sources, you will need to do that directly, as follows.

For example, taking RHEL_8_Package_List.json
- Usage help will be displayed:
```bash
cd /opt/software-discovery-tool/bin
./package_build.py
Usage:
./package_build.py <exact_file_name.json>
			[if data is from PDS]
./package_build.py debian
			[if data is from Debian]
./package_build.py
			[for displaying this help]
Example:
./package_build.py RHEL_8_Package_List.json
```
Example of extracting the RHEL_8_Package_List.json from PDS repo:
```bash
sudo -u www-data ./bin/package_build.py RHEL_8_Package_List.json
Extracting RHEL_8_Package_List.json from PDS data ...
Thanks for using SDT!
```
 _**NOTE:**_
- Make sure the json file exists in the PDS data directory.
- Please keep in mind that the directory belongs to user `www-data`, so in case of permission error,
	run the chown cmd or directly use `package_build.py` as `www-data` user like:
	```bash
	sudo -u www-data ./bin/package_build.py RHEL_8_Package_List.json
	```

#### Update Supported Distros list

The `src/config/supported_distros.py` must now be created and updated to reflect the new json files that have been brought in from PDS.

Copy in sample file provided with this repository.

```bash
sudo -u www-data cp src/config/supported_distros.py.example src/config/supported_distros.py
```

And then make edits to add the sources you retrieved from PDS.

For more details about the formatting and expectations of this file, follow steps mentioned in Step 2 of [Adding_new_distros](https://github.com/openmainframeproject/software-discovery-tool/blob/master/docs/Adding_new_distros.md#step-2-update-the-supported_distros-variable-in-configuration-file-sdt_basesrcconfigconfigpy)

### Step 6: Install and populate the SQL database

#### Install dependencies and complete the secure installation. Remember the root password you set, you will need this in the future.
```bash
sudo apt install mariadb-server python3-pymysql
sudo mysql_secure_installation
```
- On newer versions of MariaDB (10.5+) and Ubuntu (24.04+), `mysql_secure_installation` may not be available. Use `mariadb-secure-installation` instead:
  ```bash
  sudo mariadb-secure-installation
  ```
During this process, you will set a root password to be used later, otherwise the defaults are fine.

***NOTE:***
- If you encounter the following error when running `sudo mysql_secure_installation`:
  ```bash
  Enter current password for root (enter for none): 
  ERROR 2002 (HY000): Can't connect to local server through socket '/run/mysqld/mysqld.sock' (2)
  ```
  It means the MariaDB service is not running. Start it with:
  ```bash
  sudo service mariadb start
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

***NOTE:***
- For enhanced security, we've granted the software-discovery-tool user (sdtreaduser) only read (SELECT) permissions on the required database. This adheres to the principle of least privilege and minimizes the impact if the user credentials are compromised.
- When working with SDT, two separate users with distinct permission sets are used: Diagram
        - [User for Read-only Database Access](https://github.com/openmainframeproject/software-discovery-tool/blob/master/docs/Installation.md#set-appropriate-folder-and-file-permission-on-optsoftware-discovery-tool-folder-for-apache) (Read-Only Permissions): This user is granted strictly read-only permissions over the entire project, including the database, for use when a user searches the database through the tool.
        - [User for Build Database Step (All Privileges)](https://github.com/openmainframeproject/software-discovery-tool/blob/master/docs/Installation.md#run-the-script-to-populate-the-database-when-prompted-by-the-script-for-a-user-and-password-use-the-root-account-and-password-you-set-above): This user is granted all privileges over the database for the `database_build` step below, allowing them to create new tables and drop old ones. This user's credentials should never be stored in a `.env` file, and customers must remember the password or set up a local system to manage it securely.
![Diagram](./static/diagram.svg)

#### Create a .env file in the root of the project with credentials set above (see .env.example)

A sample `.env.example` is included in this respository. Copy that to your new `.env` file in `/opt/software-discovery-tool/` and the value of `DB_PASSWORD` with the password for your sdtreaduser.

```bash
sudo -u www-data cp .env.example .env
```

#### Run the script to populate the database, when prompted by the script for a user and password, use the root account and password you set above.
```bash
cd /opt/software-discovery-tool/bin/
./database_build.py
```
***NOTE:***
- If you encounter the following error:
  ```bash
  pymysql.err.OperationalError: (1698, "Access denied for user 'root'@'localhost'")
  ```
  Then give access to root user using:
  ```bash
  mariadb -u root -p
  MariaDB> ALTER USER 'root'@'localhost' IDENTIFIED VIA mysql_native_password USING PASSWORD('password'); # Replace the 'password' with the root password you set while installing mariadb.
  ```
###  Step 7: Verify that the software-discovery-tool server is up and running

Start the Node.js backend:
```bash
cd /opt/software-discovery-tool/backend
npm start
```

The backend should now be running on port 5000 (or the port specified in your `.env` file).

###  Step 8: (Optional) Custom configuration
Following configuration settings can be managed in `/opt/software-discovery-tool/backend/config.js` or the `.env` file:

        <PORT> - Port on which the backend application will be accessible.

        <DB_HOST>, <DB_USER>, <DB_PASSWORD>, <DB_NAME> - Database connection details.

        <SUPPORTED_DISTROS> - Mapping of all the supported distros, new distros added need to be mapped here.

        <MAX_RECORDS_TO_SEND> - Max number of records returned to the client. Defaults to 100
###  Step 9: Start React (frontend) server

#### Install npm
```bash
sudo apt install npm
```

#### Change to the react-frontend directory
```bash
cd react-frontend
```

#### Create the npm cache directory
```bash
sudo mkdir /var/www/.npm
sudo chown -R www-data:www-data "/var/www/.npm"
```

#### Install the required npm packages
```bash
sudo -u www-data npm install
```
#### Setting up the Environment Variables

To configure the Node.js server URL for your React application, follow these steps:

1. **Locate the `.env.example` file:**

    Inside the `react-frontend` directory of the project, you will find a file named `.env.example`. This file contains example environment variables required to run the application.

    ```plaintext
    REACT_APP_API_URL='http://localhost:5000'
    ```

2. **Create a `.env` file:**

    - Copy the `.env.example` file and rename it to `.env`:

```bash
sudo -u www-data cp .env.example .env
```

    - Open the newly created `.env` file and ensure it contains the following line:<br><br>

    ```plaintext
    REACT_APP_API_URL='http://server_ip_or_fully_qualified_domain_name:5000'
    ```

3. **Use the Environment Variable:**

    The `REACT_APP_API_URL` variable is now set and will be used by your React application to communicate with the Node.js server running at the specified URL.

#### Start the react frontend application
```bash
sudo -u www-data npm run start
```

You can now navigate to the frontend via port 3000 in your web browser.
