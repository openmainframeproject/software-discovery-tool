FROM ubuntu:22.04

RUN  apt-get -y update && \
  apt-get install -y sudo python3 python3-pip \
  gcc git python3-dev libssl-dev libffi-dev \
  python3-lxml apache2 libapache2-mod-wsgi-py3 \
  mariadb-server python3-pymysql vim nano wget

RUN sudo pip3 install cffi cryptography Flask \
        launchpadlib simplejson requests pytest \
        python-dotenv

ADD --keep-git-dir=true https://github.com/openmainframeproject/software-discovery-tool.git /opt/software-discovery-tool

WORKDIR /opt/software-discovery-tool

RUN git submodule update --init --recursive --remote

RUN  mv src/config/supported_distros.py.example src/config/supported_distros.py && \
         mv .env.example .env

RUN git fetch && git checkout remotes/origin/data-update-fixes
RUN bash -c "echo 'export PYTHONPATH=/opt/software-discovery-tool/src/classes:/opt/software-discovery-tool/src/config:$PYTHONPATH' > /etc/profile.d/software-discovery-tool.sh"

RUN cp -f /opt/software-discovery-tool/src/config/sdt.conf /etc/apache2/sites-available/sdt.conf && \
    mv /etc/apache2/sites-available/000-default.conf /etc/apache2/sites-available/z-000-default.conf

RUN useradd -s /usr/bin/bash apache && \
    chown -R apache:apache /opt/software-discovery-tool/

RUN a2dissite 000-default.conf && \
        a2ensite sdt.conf

RUN apachectl restart

#USER apache
