import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SDT_BASE = path.join(__dirname, '..');
dotenv.config({ path: path.join(SDT_BASE, 'backend', '.env') });

const distrosPath = path.join(SDT_BASE, 'config', 'distros.json');
const SUPPORTED_DISTROS = JSON.parse(fs.readFileSync(distrosPath, 'utf8'));
const DATA_FILE_LOCATION = path.join(SDT_BASE, 'distro_data', 'data_files');

const HOST = process.env.DB_HOST || 'localhost';
const DB_NAME = process.env.DB_NAME || 'sdtDB';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function createTable(connection, tblname) {
  const queryDrop = `DROP TABLE IF EXISTS \`${tblname}\``;
  const queryCreate = `CREATE TABLE \`${tblname}\` (
    pkgId INT NOT NULL AUTO_INCREMENT,
    packageName VARCHAR(100) NOT NULL,
    version VARCHAR(500) NOT NULL,
    description VARCHAR(500),
    repo VARCHAR(500),
    osName VARCHAR(100) NOT NULL,
    PRIMARY KEY (pkgId)
  )`;
  await connection.query(queryDrop);
  await connection.query(queryCreate);
  console.log(`${tblname} formed successfully`);
}

async function jsonToSql(connection, table, file, osName) {
  const filepath = path.join(DATA_FILE_LOCATION, `${file}.json`);
  if (!fs.existsSync(filepath)) {
    console.log(`${file} FILE DOESN'T EXIST`);
    return;
  }
  const data = JSON.parse(fs.readFileSync(filepath, 'utf8'));
  const finalData = data
    .filter(item => Object.keys(item).length > 0)
    .map(item => [
      item.packageName,
      item.version,
      item.description || null,
      item.repo ? [...new Set(item.repo.split(','))].join(',') : null,
      osName
    ]);

  if (finalData.length === 0) {
    console.log(`${table} : No Entries found`);
    return;
  }

  const query = `INSERT INTO \`${table}\` (packageName, version, description, repo, osName) VALUES ?`;
  await connection.query(query, [finalData]);
  console.log(`${table} : Entries filled`);
}

async function dbInit() {
  const username = await question("Enter privileged username to create/update SQL tables: ");
  const password = await question("Enter password for privileged username: ");
  
  let connection;
  try {
    connection = await mysql.createConnection({
      host: HOST,
      user: username,
      password: password
    });

    await connection.query(`DROP DATABASE IF EXISTS \`${DB_NAME}\``);
    await connection.query(`CREATE DATABASE \`${DB_NAME}\``);
    console.log("DB INITIALIZED SUCCESSFULLY");
    await connection.changeUser({ database: DB_NAME });

    let count = 0;
    for (const osKey in SUPPORTED_DISTROS) {
      const versions = SUPPORTED_DISTROS[osKey];
      for (const distro in versions) {
        const tableName = versions[distro];
        if (tableName) {
          await createTable(connection, tableName);
          await jsonToSql(connection, tableName, tableName, distro);
          count++;
        }
      }
    }
    console.log(`SUCCESSFULLY INITIALIZED ${count} TABLES`);
  } catch (err) {
    console.error("Error during DB initialization:", err);
  } finally {
    if (connection) await connection.end();
    rl.close();
  }
}

dbInit();
