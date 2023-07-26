#!/usr/bin/python3
from pickle import TRUE
import json
import pymysql
import sys
import os

sys.path.append('/opt/software-discovery-tool/src/config')
import supported_distros
SUPPORTED_DISTROS = supported_distros.SUPPORTED_DISTROS
SDT_BASE = '/opt/software-discovery-tool'
DATA_FILE_LOCATION = '%s/distro_data/data_files' % SDT_BASE
HOST = 'localhost'
DB_NAME = 'sdtDB'
def connectdb(username,password,database):
    conn = pymysql.connect(host=HOST,user=username,password=password)
    cur = conn.cursor()
    query = f"CREATE OR REPLACE DATABASE {database}"
    cur.execute(query)
    conn.close()
    print("DB INITIATILIZED SUCCESSFULLY")

def db_init():
    username = ""
    table_name = ""

    if len(sys.argv)==2 and sys.argv[1]=='root':
        username = sys.argv[1]
    elif len(sys.argv)==2:
        username = input("Enter username to use for connecting to MariaDB server : ")
        table_name = sys.argv[1]
    elif len(sys.argv)==3 and sys.argv[1]=='root':
        username = sys.argv[1]
        table_name = sys.argv[2]    
    else:
        username = input("Enter username to use for connecting to MariaDB server : ")
    password = input("Enter password for connecting to MariaDB server : ")
    dbName = DB_NAME

    if table_name == "":
        connectdb(username,password,dbName)
        initall(dbName,username,password)
    else:
        create_one(dbName,username,password,table_name)

def jsontosql(db,table,file,os,user,password):
    filepath = f'{DATA_FILE_LOCATION}/{file}.json'
    jsonFile = open(file=filepath)
    #print(jsonFile)
    data = json.load(jsonFile)
    #final_data = [dict(item, osName=os) for item in data]
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
        print(f"{table} : {len(final_data)} Entries filled")
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

    # conn = pymysql.connect(host=HOST,user=username,password=password,database=db)
    # curr = conn.cursor()
    # Check of db exist or not --- CREATE DATABASE IF NOT EXISTS DBname
    # Execute Krna command
    # Connection Close

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

def test():
    print("OK")
    #print(len(supported_distros.SUPPORTED_DISTROS))
    for os in SUPPORTED_DISTROS:
        if not SUPPORTED_DISTROS[os]:
            continue
        else:
            for distro in SUPPORTED_DISTROS[os]:
                print(f"osName : {distro} file : {SUPPORTED_DISTROS[os][distro]}")
                print()

if __name__ == "__main__":
    db_init()
    #test()
    
    
