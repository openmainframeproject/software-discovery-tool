#!/usr/bin/python3
from pickle import TRUE
import json
import pymysql
import sys

sys.path.insert(1, '../src/config')
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
    if len(sys.argv)==2 and sys.argv[1]=='root':
        username = sys.argv[1]
    else:
        username = input("Enter username to use for connecting to MariaDB server : ")
    password = input("Enter password for connecting to MariaDB server : ")
    dbName = DB_NAME
    connectdb(username,password,dbName)
    initall(dbName,username,password)

def jsontosql(db,table,file,os,user,password):
    filepath = f'{DATA_FILE_LOCATION}/{file}.json'
    jsonFile = open(file=filepath)
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

def initall(db,username,password): 
    count = 0
    for os in SUPPORTED_DISTROS:
        if not SUPPORTED_DISTROS[os]:
            continue
        else:
            for distro in SUPPORTED_DISTROS[os]:
                createTable(db,SUPPORTED_DISTROS[os][distro],username,password)
                jsontosql(db,SUPPORTED_DISTROS[os][distro],SUPPORTED_DISTROS[os][distro],distro,username,password)
                count = count+1 
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

if __name__ == "__main__":
    db_init()
    #test()
