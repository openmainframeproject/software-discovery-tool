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
sudo apt install python3 gcc git python3-dev libssl-dev libffi-dev cron python3-lxml apache2
```

Python dependencies

```bash
sudo apt install libapache2-mod-wsgi-py3 python3-cffi python3-cryptography python3-flask python3-launchpadlib python3-simplejson python3-requests python3-pytest python3-flask-cors python3-dotenv
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

###  Step 3: Set Environment variables
```bash
sudo sh -c "echo 'export PYTHONPATH=/opt/software-discovery-tool/src/classes:/opt/software-discovery-tool/src/config:$PYTHONPATH' > /etc/profile.d/software-discovery-tool.sh"
```
        
### Step 4: Install and configure software-discovery-tool

#### Copy the Apache configuration file from `/opt/software-discovery-tool/src/config/sdt.conf` into respective Apache configuration folder as below
```bash
sudo cp -f /opt/software-discovery-tool/src/config/sdt.conf /etc/apache2/sites-available/sdt.conf
sudo mv /etc/apache2/sites-available/000-default.conf /etc/apache2/sites-available/z-000-default.conf
```
        

#### Set appropriate folder and file permission on /opt/software-discovery-tool/ folder for the Apache user on Ubuntu: www-data
```bash
sudo chown -R www-data:www-data /opt/software-discovery-tool/
```

#### Start/Restart Apache service
```bash
sudo apachectl restart
```

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
 We now run the following commands to properly enable the config files of the software-discovery-tool server and then restart the Apache server. 
```bash
sudo a2ensite z-000-default.conf
sudo a2ensite sdt.conf
sudo systemctl reload apache2
sudo apachectl restart
```
We can check if the server is up and running by going to following URL :

```http://server_ip_or_fully_qualified_domain_name:port_number/sdt``` <br />

(Alternatively, you can check with unittesting) <br />
```cd software-discovery-tool/src/tests``` <br />

If you run `pytest` as your logged user, it may give errors/warnings since you have given user `www-data` ownership.
```bash
sudo -u www-data pytest
```
_**NOTE:**_ 

* By default the port_number will be 80

###  Step 8: (Optional) Custom configuration
Following configuration settings can be managed in `/opt/software-discovery-tool/src/config/config.py`:

        <software-discovery-tool_BASE> - Base location where software-discovery-tool is Installed/Cloned. Defaults to `/opt/software-discovery-tool/`

        <DATA_FILE_LOCATION> - Location of folder containing all distribution specific JSON data
        
        <LOG_FILE_LOCATION> - Location of folder containing software-discovery-tool logs
        
        <enable_proxy_authentication> - Flag enabling/disabling proxy based network access
        
        <proxy_user> - Proxy server user name
        
        <proxy_password> - Proxy server password
        
        <proxy_server> - Proxy server IP/fully qualified domain name
        
        <proxy_port> - Proxy port number
        
        <DEBUG_LEVEL> - Set Debug levels for the application to log
        
        <server_host> - IP/fully qualified domain name of server where software-discovery-tool application will be deployed
        
        <server_port> - software-discovery-tool port on which application will be accessible to end users

        <SUPPORTED_DISTROS> - Mapping of all the supported distros, new distros added need to be mapped here.

        <MAX_RECORDS_TO_SEND> = Max number of records returned to the client. Defaults to 100

        <CACHE_SIZE> - Number of searches to be cached. Default to 10

_**NOTE:**_
* In order to add new distribution support refer [here](Adding_new_distros.md)

In case any of the parameters are updated, the server has to be restarted:

#### Start/Restart Apache service
```bash
sudo apachectl restart
```
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

To configure the Flask server URL for your React application, follow these steps:

1. **Locate the `.env.example` file:**

    Inside the root directory of the project, you will find a file named `.env.example`. This file contains example environment variables required to run the application.

    ```plaintext
    REACT_APP_API_URL='http://localhost:80/sdt'
    ```

2. **Create a `.env` file:**

    - Copy the `.env.example` file and rename it to `.env`:

```bash
sudo -u www-data cp .env.example .env
```

    - Open the newly created `.env` file and ensure it contains the following line:<br><br>

    ```plaintext
    REACT_APP_API_URL='http://server_ip_or_fully_qualified_domain_name:80/sdt'
    ```

3. **Use the Environment Variable:**

    The `REACT_APP_API_URL` variable is now set and will be used by your React application to communicate with the Flask server running at the specified URL.

#### Start the react frontend application
```bash
sudo -u www-data npm run start
```

You can now navigate to the frontend via port 3000 in your web browser.
