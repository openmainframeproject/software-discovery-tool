FROM ubuntu:22.04

RUN  apt-get -y update && \
  apt-get install -y sudo python3 python3-pip \
  gcc git python3-dev libssl-dev libffi-dev cron \
  python3-lxml apache2 libapache2-mod-wsgi-py3 \
  mariadb-server python3-pymysql

RUN sudo pip3 install cffi cryptography Flask \
        launchpadlib simplejson requests pytest \
        python-dotenv

ADD --keep-git-dir=true https://github.com/openmainframeproject/software-discovery-tool.git /opt/software-discovery-tool

WORKDIR /opt/software-discovery-tool

RUN git submodule update --init --recursive --remote

RUN  cp src/config/supported_distros.py.example src/config/supported_distros.py

RUN bash -c "echo 'export PYTHONPATH=/opt/software-discovery-tool/src/classes:/opt/software-discovery-tool/src/config:$PYTHONPATH' > /etc/profile.d/software-discovery-tool.sh"

RUN cp -f /opt/software-discovery-tool/src/config/sdt.conf /etc/apache2/sites-available/sdt.conf && \
    mv /etc/apache2/sites-available/000-default.conf /etc/apache2/sites-available/z-000-default.conf

RUN useradd apache && \
    chown -R apache:apache /opt/software-discovery-tool/

RUN apachectl restart
USER apache
