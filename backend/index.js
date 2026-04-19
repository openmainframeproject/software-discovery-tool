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
let bitFlag = 1;
for (const distroName of Object.keys(SUPPORTED_DISTROS)) {
  const versions = Object.keys(SUPPORTED_DISTROS[distroName]).sort();
  for (const version of versions) {
    if (!DISTRO_BIT_MAP[distroName]) {
      DISTRO_BIT_MAP[distroName] = {};
    }
    DISTRO_BIT_MAP[distroName][version] = bitFlag;
    bitFlag *= 2;
  }
}

const getTables = (searchBit) => {
  const ans = [];
  for (const distroName of Object.keys(SUPPORTED_DISTROS)) {
    const versions = Object.keys(SUPPORTED_DISTROS[distroName]).sort();
    for (const version of versions) {
      const b = DISTRO_BIT_MAP[distroName][version];
      if ((BigInt(b) & BigInt(searchBit)) > 0n) {
        ans.push(SUPPORTED_DISTROS[distroName][version]);
      }
    }
  }
  return ans;
};

// Replicate routes
app.get('/getSupportedDistros', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.json(DISTRO_BIT_MAP);
});

app.get('/sdt/getSupportedDistros', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.json(DISTRO_BIT_MAP);
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

    let allRows = [];
    for (const table of tables) {
      let query;
      let params;
      if (exactMatch) {
        query = `SELECT packageName, description, version, osName FROM ${table} WHERE packageName = ?`;
        params = [searchTerm];
      } else {
        query = `SELECT packageName, description, version, osName FROM ${table} WHERE packageName REGEXP ?`;
        params = [searchTerm];
      }
      const [rows] = await pool.query(query, params);
      allRows = allRows.concat(rows);
    }

    const totalLength = allRows.length;
    let results = [];
    let lastPage = Math.ceil(totalLength / MAX_RECORDS_TO_SEND);

    if (totalLength <= MAX_RECORDS_TO_SEND) {
      results = allRows;
    } else {
      const startIdx = pageNumber * MAX_RECORDS_TO_SEND;
      let endIdx;
      if (pageNumber === 0) {
        endIdx = MAX_RECORDS_TO_SEND;
        lastPage = 1; // Replicating the weird Python logic where last_page is 1 if page_number is 0?
        // Actually the Python code says: last_page = 1 #math.ceil(totalLength/MAX_RECORDS_TO_SEND)
      } else {
        endIdx = totalLength;
        lastPage = 1;
      }
      results = allRows.slice(startIdx, endIdx);
    }

    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.json({
      total_packages: totalLength,
      current_page: pageNumber,
      last_page: lastPage,
      more_available: totalLength !== results.length,
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
