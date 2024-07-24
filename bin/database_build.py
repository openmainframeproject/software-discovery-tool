#!/usr/bin/python3
from pickle import TRUE
import json
import pymysql
import sys
import os
from dotenv import load_dotenv
load_dotenv()  # Load database name from the .env file

sys.path.append('/opt/software-discovery-tool/src/config')
import supported_distros
SUPPORTED_DISTROS = supported_distros.SUPPORTED_DISTROS
SDT_BASE = '/opt/software-discovery-tool'
DATA_FILE_LOCATION = '%s/distro_data/data_files' % SDT_BASE

HOST = os.environ.get('DB_HOST')
USER = ''
PASSWORD = ''
DB_NAME = os.environ.get('DB_NAME')

def connectdb(username,password,database):
    conn = pymysql.connect(host=HOST,user=username,password=password)
    cur = conn.cursor()
    query = f"CREATE OR REPLACE DATABASE {database}"
    cur.execute(query)
    conn.close()
    print("DB INITIATILIZED SUCCESSFULLY")

def db_init():
    username = USER
    password = PASSWORD
    table_name = ""

    if password == "":
        password = input("Enter password for connecting to MariaDB server : ")
    dbName = DB_NAME

    if table_name == "" or table_name == "all" or table_name == "All":
        connectdb(username,password,dbName)
        initall(dbName,username,password)
    else:
        create_one(dbName,username,password,table_name)

def jsontosql(db,table,file,os,user,password):
    filepath = f'{DATA_FILE_LOCATION}/{file}.json'
    jsonFile = open(file=filepath)
    data = json.load(jsonFile)
    final_data = []
    for item in data :
        if item : 
            row = dict(item, osName = os)
            final_data.append(row)
    keyset = data[0].keys()
    conn = pymysql.connect(host=HOST,user=user,password=password,database=db,autocommit=True)
    curr = conn.cursor()
    try:
        data.remove({})
    except ValueError:
        pass
    if len(keyset)==2:
        query = f"INSERT INTO {table} (packageName, version, osName) VALUES (%(packageName)s, %(version)s, %(osName)s)"
    else:
        query = f"INSERT INTO {table} (packageName, version, description, osName) VALUES (%(packageName)s, %(version)s, %(description)s, %(osName)s)"
    if len(final_data) == 0 : 
        print(f"{table} : No Entries found")
    else :
        curr.executemany(query,final_data)
        print(f"{table} : Entries filled")
    conn.close()

def createTable(db,tblname,username,password):
    conn = pymysql.connect(host=HOST,user=username,password=password,database=db)
    curr = conn.cursor()
    query = f"CREATE OR REPLACE TABLE {tblname} ("\
			"pkgId INT NOT NULL AUTO_INCREMENT, "\
			"packageName VARCHAR(100) NOT NULL,"\
			"version VARCHAR(500) NOT NULL,"\
			"description VARCHAR(500), "\
			"osName VARCHAR(100) NOT NULL, "\
			"PRIMARY KEY (pkgId)"\
			")"
    curr.execute(query)
    conn.close()
    print(f"{tblname} formed successfully")

def create_one(db,username,password,table_name): 
    conn = pymysql.connect(host=HOST,user=username,password=password)
    cur = conn.cursor()
    query = f"CREATE DATABASE IF NOT EXISTS {db}"
    cur.execute(query)

    flag=True
    for os in SUPPORTED_DISTROS:
        if not SUPPORTED_DISTROS[os]:
            continue
        else:
            for distro in SUPPORTED_DISTROS[os]:
                if SUPPORTED_DISTROS[os][distro] == table_name:
                    flag=False
                    createTable(db,SUPPORTED_DISTROS[os][distro],username,password)
                    jsontosql(db,SUPPORTED_DISTROS[os][distro],SUPPORTED_DISTROS[os][distro],distro,username,password)
    conn.close()

    if flag==False:
        print(f"SUCCESSFULLY INITIALIZED {table_name} TABLE")
    else:
        print(f"NO MATCHES FOUND. TRY SOMETHING ELSE")

def initall(db,username,password): 
    count = 0
    for os_Key in SUPPORTED_DISTROS:
        if not SUPPORTED_DISTROS[os_Key]:
            continue
        else:
            for distro in SUPPORTED_DISTROS[os_Key]:
                path = f'{DATA_FILE_LOCATION}/{SUPPORTED_DISTROS[os_Key][distro]}.json'
                if os.path.exists(path):
                    createTable(db,SUPPORTED_DISTROS[os_Key][distro],username,password)
                    jsontosql(db,SUPPORTED_DISTROS[os_Key][distro],SUPPORTED_DISTROS[os_Key][distro],distro,username,password)
                    count = count+1 
                else:
                    print(f"{SUPPORTED_DISTROS[os_Key][distro]} FILE DOESN'T EXIST")
    print(f"SUCCESSFULLY INITIALIZED {count} TABLES")

if __name__ == "__main__":
    db_init()
