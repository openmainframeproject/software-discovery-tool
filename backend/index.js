import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import 'dotenv/config';
import { SUPPORTED_DISTROS, MAX_RECORDS_TO_SEND } from './config.js';

const app = express();
app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Calculate DISTRO_BIT_MAP
const DISTRO_BIT_MAP = {};
let bitFlag = 1n;
for (const distroName of Object.keys(SUPPORTED_DISTROS)) {
  const versions = Object.keys(SUPPORTED_DISTROS[distroName]).sort();
  for (const version of versions) {
    if (!DISTRO_BIT_MAP[distroName]) {
      DISTRO_BIT_MAP[distroName] = {};
    }
    DISTRO_BIT_MAP[distroName][version] = bitFlag;
    bitFlag *= 2n;
  }
}

const getTables = (searchBit) => {
  const ans = [];
  for (const distroName of Object.keys(SUPPORTED_DISTROS)) {
    const versions = Object.keys(SUPPORTED_DISTROS[distroName]).sort();
    for (const version of versions) {
      const b = DISTRO_BIT_MAP[distroName][version];
      if ((b & BigInt(searchBit)) > 0n) {
        ans.push(SUPPORTED_DISTROS[distroName][version]);
      }
    }
  }
  return ans;
};

// Helper function to stringify BigInts in an object
const stringifyBigInts = (obj) => {
  return JSON.parse(JSON.stringify(obj, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value
  ));
};

// Replicate routes
app.get('/getSupportedDistros', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.json(stringifyBigInts(DISTRO_BIT_MAP));
});

app.get('/sdt/getSupportedDistros', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.json(stringifyBigInts(DISTRO_BIT_MAP));
});

app.get(['/searchPackages', '/sdt/searchPackages'], async (req, res) => {
  const searchTerm = (req.query.search_term || '').trim();
  const exactMatch = req.query.exact_match === 'true';
  const searchBitFlag = req.query.search_bit_flag || '0';
  const pageNumber = parseInt(req.query.page_number || '0');

  if (!searchTerm) {
    return res.json({
      total_packages: 0,
      current_page: 0,
      last_page: 0,
      more_available: false,
      packages: []
    });
  }

  try {
    const tables = getTables(searchBitFlag);
    if (tables.length === 0) {
      return res.json({
        total_packages: 0,
        current_page: pageNumber,
        last_page: 0,
        more_available: false,
        packages: []
      });
    }

    const subQuery = exactMatch
      ? 'SELECT packageName, description, version, osName FROM ?? WHERE packageName = ?'
      : 'SELECT packageName, description, version, osName FROM ?? WHERE packageName REGEXP ?';

    const unionQuery = tables.map(() => `(${subQuery})`).join(' UNION ALL ');
    const countQuery = `SELECT COUNT(*) as total FROM (${unionQuery}) AS combined`;
    
    const countParams = [];
    tables.forEach(table => {
      countParams.push(table, searchTerm);
    });

    const [countResult] = await pool.query(countQuery, countParams);
    const totalLength = countResult[0].total;

    const dataQuery = `${unionQuery} LIMIT ? OFFSET ?`;
    const dataParams = [...countParams, MAX_RECORDS_TO_SEND, pageNumber * MAX_RECORDS_TO_SEND];

    const [results] = await pool.query(dataQuery, dataParams);
    const lastPage = Math.ceil(totalLength / MAX_RECORDS_TO_SEND);

    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.json({
      total_packages: totalLength,
      current_page: pageNumber,
      last_page: lastPage,
      more_available: (pageNumber + 1) * MAX_RECORDS_TO_SEND < totalLength,
      packages: results
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
