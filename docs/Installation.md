# Steps for setting up PDS application on server

The instructions provided below specify the steps for SLES 11 SP4/12/12 SP1/12 SP2 and Ubuntu 16.04/17.04/17.10:

_**NOTE:**_
* make sure you are logged in as user with sudo permissions

### Step 1: Install prerequisite

* For SLES (11 SP4, 12):

        sudo zypper install -y python python-setuptools gcc git libffi-devel python-devel openssl openssl-devel cronie python-xml pyxml tar wget aaa_base which w3m
        sudo easy_install pip
        sudo pip install 'cryptography==1.4' Flask launchpadlib simplejson logging

* For Ubuntu (16.04, 17.04, 17.10):

        sudo apt-get update
        sudo apt-get install -y python3 python3-pip gcc git python3-dev libssl-dev libffi-dev cron python3-lxml apache2 libapache2-mod-wsgi-py3
        sudo pip3 install 'cffi==1.11.5' 'cryptography==1.4' Flask launchpadlib simplejson requests pytest

* For SLES (12 SP1, 12 SP2, 12 SP3):

        sudo zypper install -y python3 python3-pip python3-setuptools gcc git libffi-devel python3-devel openssl openssl-devel cronie python3-lxml tar wget aaa_base which w3m apache2 apache2-devel apache2-worker apache2-mod_wsgi-python3
        sudo pip3 install cryptography launchpadlib simplejson Flask pytest

* if "/usr/local/bin" is not part of $PATH add it to the path:

        echo $PATH
        export PATH=/usr/local/bin:$PATH
        sudo sh -c "echo 'export PATH=/usr/local/bin:$PATH' > /etc/profile.d/alternate_install_path.sh"

###  Step 2: Checkout the source code, into /opt/ folder

        cd /opt/
        sudo git clone https://github.com/linux-on-ibm-z/PDS.git
        cd PDS

Note: In case PDS code is already checked out, do the following for latest updates

        cd /opt/PDS
        sudo git pull origin master

###  Step 3: Set Environment variables

        sudo sh -c "echo 'export PYTHONPATH=/opt/PDS/src/classes:/opt/PDS/src/config:$PYTHONPATH' > /etc/profile.d/pds.sh"

### Step 4: Install and configure PDS

* SLES (11 SP4, 12):

    #### Copy the init.d script to start/stop/restart PDS application

        sudo chmod 755 -R /opt/PDS/src/setup
        cd /opt/PDS/src/setup
        sudo ./create_initid_script.sh

    #### Enable pds service

        sudo systemctl reload pds

    #### Start the Flask server as below

        sudo service pds start

* SLES (12 SP1, 12 SP2, 12 SP3) and Ubuntu (16.04, 17.04, 17.10):

    #### Copy the apache configuration file from `/opt/PDS/src/config/pds.conf` into respective apache configuration folder as below
    * SLES (12 SP1, 12 SP2, 12 SP3):

            sudo cp -f /opt/PDS/src/config/pds.conf /etc/apache2/conf.d/pds.conf

    * For Ubuntu (16.04, 17.04, 17.10):

            sudo cp -f /opt/PDS/src/config/pds.conf /etc/apache2/sites-enabled/pds.conf
            sudo mv /etc/apache2/sites-enabled/000-default.conf /etc/apache2/sites-enabled/z-000-default.conf

    #### Create new user and group for apache

        sudo useradd apache
        sudo groupadd apache

    #### Enable authorization module in apache configuration(Only for SLES 12 SP1, 12 SP2, 12 SP3)

        sudo a2enmod mod_access_compat

    #### Set appropriate folder and file permission on /opt/PDS/ folder for apache

        sudo chown -R apache:apache /opt/PDS/


    #### Start/Restart Apache service

        sudo apachectl restart

###  Step 5: Verify that the PDS server is up and running

```http://server_ip_or_fully_qualified_domain_name:port_number/pds``` <br />

(Alternatively, you can check with unittesting) <br />
```cd PDS/src/tests``` <br />
```pytest```

_**NOTE:**_ 

* For SLES (11 SP4, 12) by default the port_number will be 5000
* For SLES (12 SP1, 12 SP2, 12 SP3) and Ubuntu (16.04, 17.04, 17.10)  by default the port_number will be 80

###  Step 6: (Optional) Custom configuration
Following configuration settings can be managed in `/opt/PDS/src/config/config.py`:

        <PDS_BASE> - Base location where PDS is Installed/Cloned. Defaults to `/opt/PDS/`

        <DATA_FILE_LOCATION> - Location of folder containing all distribution specific JSON data
        
        <LOG_FILE_LOCATION> - Location of folder containing PDS logs
        
        <enable_proxy_authentication> - Flag enabling/disabling proxy based network access
        
        <proxy_user> - Proxy server user name
        
        <proxy_password> - Proxy server password
        
        <proxy_server> - Proxy server IP/fully qualified domain name
        
        <proxy_port> - Proxy port number
        
        <DEBUG_LEVEL> - Set Debug levels for the application to log
        
        <server_host> - IP/fully qualified domain name of server where PDS application will be deployed
        
        <server_port> - PDS port on which application will be accessible to end users

        <SUPPORTED_DISTROS> - Mapping of all the supported distros, new distros added need to be mapped here.

        <MAX_RECORDS_TO_SEND> = Max number of records returned to the client. Defaults to 100

        <CACHE_SIZE> - Number of searches to be cached. Default to 10

_**NOTE:**_
* In order to add new distribution support refer [here](Adding_new_distros.md)

In case any of the parameters are updated, the server has to be restarted:

* SLES (12 SP1, 12 SP2, 12 SP3) and Ubuntu (16.04, 17.04, 17.10):

    #### Start/Restart Apache service

        sudo apachectl restart

* SLES (11 SP4, 12):

    #### Start the Flask server as below

        sudo service pds start

