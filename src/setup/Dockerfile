################# Dockerfile for software-discovery-tool #####################
#
# This Dockerfile builds a basic installation of software-discovery-tool.
#
#
# To build this image, from the directory containing this Dockerfile
# (assuming that the file is named Dockerfile):
# docker build -t <image_name> .
#
# To Start software-discovery-tool use the following command.
# docker run --name <container_name> -p <port_number>:80 -d <image_name>
#
# Test in the browser by using the following url:
# http://<hostname>:<port_number>/
# http://<hostname>:<port_number>/software-discovery-tool
#
# Or by running the provided unit-tests:
# cd /opt/software-discovery-tool/src/tests
# pytest 
########################################################################################

# Base image
  FROM s390x/ubuntu:16.04

# The author
  MAINTAINER LoZ Open Source Ecosystem (https://www.ibm.com/developerworks/community/groups/community/lozopensource)

# Set environment variable
  ENV SOURCE_DIR=/home
  WORKDIR $SOURCE_DIR

# Install dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    gcc \
    git \
    python3-dev \
    libssl-dev \
    libffi-dev \
    cron \
    python3-lxml \
    apache2 \
    libapache2-mod-wsgi-py3 \
    
&&  pip3 install 'cffi==1.11.5' \
    'cryptography==1.4' \
    Flask \
    flask-cors \
    launchpadlib \
    simplejson \
    requests \
    pytest


#Set Environmental Variables
RUN echo $PATH
ENV PATH=/usr/local/bin:$PATH
RUN sh -c "echo 'export PATH=/usr/local/bin:$PATH' > /etc/profile.d/alternate_install_path.sh"

# Clone software-discovery-tool from git
RUN  cd /opt/ \
&& git clone https://github.com/openmainframeproject/software-discovery-tool.git \
&& cd software-discovery-tool \


# Set Environmental Variables
&&  sh -c "echo 'export PYTHONPATH=/opt/software-discovery-tool/src/classes:/opt/software-discovery-tool/src/config:$PYTHONPATH' > /etc/profile.d/software-discovery-tool.sh" \

# Copy the apache configuration file from /opt/software-discovery-tool/src/config/sdt.conf into respective apache configuration folder as below
&&  cp -f /opt/software-discovery-tool/src/config/sdt.conf /etc/apache2/sites-enabled/sdt.conf \
&&  mv /etc/apache2/sites-enabled/000-default.conf /etc/apache2/sites-enabled/z-000-default.conf \

#Create new user and group for apache
&& useradd apache \


#Set appropriate folder and file permission on /opt/software-discovery-tool/ folder for apache
&& chown -R apache:apache /opt/software-discovery-tool/ \

# Clean up cache , source data and un-used packages

&& apt-get remove -y \
    gcc \
    git \
    libssl-dev  \
    libffi-dev \
    cron \
 && apt-get autoremove -y \
 && apt autoremove -y \
 && apt-get clean && rm -rf /var/lib/apt/lists/* $SOURCE_DIR

# Expose port
EXPOSE 80

# Start Apache Http Server
CMD ["apachectl","-D", "FOREGROUND"]

# End of Dockerfile
