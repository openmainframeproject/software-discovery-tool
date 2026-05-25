import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import 'dotenv/config';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { SUPPORTED_DISTROS, MAX_RECORDS_TO_SEND } from './config.js';

const app = express();
const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:3000'];
app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
}));
app.use(express.json());

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Software Discovery Tool API',
      version: '1.0.0',
      description: 'REST API for the Open Mainframe Software Discovery Tool. Replaces the Flask backend.',
    },
    servers: [{ url: `http://localhost:${process.env.PORT || 5000}` }],
  },
  apis: ['./index.js'],
};
const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

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

/**
 * @swagger
 * /getSupportedDistros:
 *   get:
 *     summary: Returns a mapping of supported distributions and their versions with bitmask flags.
 *     responses:
 *       200:
 *         description: A JSON object containing the distribution bit map.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
app.get('/getSupportedDistros', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.json(stringifyBigInts(DISTRO_BIT_MAP));
});

/**
 * @swagger
 * /sdt/getSupportedDistros:
 *   get:
 *     summary: Returns a mapping of supported distributions and their versions with bitmask flags (legacy path).
 *     responses:
 *       200:
 *         description: A JSON object containing the distribution bit map.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
app.get('/sdt/getSupportedDistros', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.json(stringifyBigInts(DISTRO_BIT_MAP));
});

/**
 * @swagger
 * /searchPackages:
 *   get:
 *     summary: Search for software packages across multiple distributions.
 *     parameters:
 *       - in: query
 *         name: search_term
 *         schema:
 *           type: string
 *         required: true
 *         description: The term to search for.
 *       - in: query
 *         name: exact_match
 *         schema:
 *           type: boolean
 *         description: Whether to perform an exact match on the package name.
 *       - in: query
 *         name: search_bit_flag
 *         schema:
 *           type: string
 *         description: A bitmask representing the selected distributions and versions.
 *       - in: query
 *         name: page_number
 *         schema:
 *           type: integer
 *         description: The page number for pagination.
 *       - in: query
 *         name: search_description
 *         schema:
 *           type: boolean
 *         description: Whether to search within package descriptions.
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of records to return per page.
 *     responses:
 *       200:
 *         description: A paginated list of matching packages.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total_packages:
 *                   type: integer
 *                 current_page:
 *                   type: integer
 *                 last_page:
 *                   type: integer
 *                 more_available:
 *                   type: boolean
 *                 packages:
 *                   type: array
 *                   items:
 *                     type: object
 *       500:
 *         description: Server error.
 */

/**
 * @swagger
 * /sdt/searchPackages:
 *   get:
 *     summary: Search for software packages across multiple distributions (legacy path).
 *     parameters:
 *       - in: query
 *         name: search_term
 *         schema:
 *           type: string
 *         required: true
 *         description: The term to search for.
 *       - in: query
 *         name: exact_match
 *         schema:
 *           type: boolean
 *         description: Whether to perform an exact match on the package name.
 *       - in: query
 *         name: search_bit_flag
 *         schema:
 *           type: string
 *         description: A bitmask representing the selected distributions and versions.
 *       - in: query
 *         name: page_number
 *         schema:
 *           type: integer
 *         description: The page number for pagination.
 *       - in: query
 *         name: search_description
 *         schema:
 *           type: boolean
 *         description: Whether to search within package descriptions.
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of records to return per page.
 *     responses:
 *       200:
 *         description: A paginated list of matching packages.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       500:
 *         description: Server error.
 */
app.get(['/searchPackages', '/sdt/searchPackages'], async (req, res) => {
  const searchTerm = (req.query.search_term || '').trim();
  const exactMatch = req.query.exact_match === 'true';
  const searchDescription = req.query.search_description === 'true';
  const searchBitFlag = req.query.search_bit_flag || '0';
  const pageNumber = parseInt(req.query.page_number || '0');
  const limit = Math.min(parseInt(req.query.limit || MAX_RECORDS_TO_SEND), 500); // Max 500 for safety

  if (isNaN(pageNumber) || pageNumber < 0) {
    return res.status(400).json({ error: 'Invalid page_number' });
  }

  if (isNaN(limit) || limit <= 0) {
    return res.status(400).json({ error: 'Invalid limit' });
  }

  try {
    BigInt(searchBitFlag);
  } catch (e) {
    return res.status(400).json({ error: 'Invalid search_bit_flag' });
  }

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

    let sqlSearchTerm = searchTerm;
    if (!exactMatch) {
      if (sqlSearchTerm.includes('*')) {
        sqlSearchTerm = sqlSearchTerm.replace(/\*/g, '%');
      } else {
        sqlSearchTerm = `%${sqlSearchTerm}%`;
      }
    }

    const subQuery = exactMatch
      ? 'SELECT packageName, description, version, osName FROM ?? WHERE packageName = ?'
      : (searchDescription 
          ? 'SELECT packageName, description, version, osName FROM ?? WHERE (packageName LIKE ? OR description LIKE ?)'
          : 'SELECT packageName, description, version, osName FROM ?? WHERE packageName LIKE ?');

    const unionQuery = tables.map(() => `(${subQuery})`).join(' UNION ALL ');
    const countQuery = `SELECT COUNT(*) as total FROM (${unionQuery}) AS combined`;
    
    const queryParams = [];
    tables.forEach(table => {
      queryParams.push(table);
      queryParams.push(sqlSearchTerm);
      if (!exactMatch && searchDescription) {
        queryParams.push(sqlSearchTerm);
      }
    });

    const [countResult] = await pool.query(countQuery, queryParams);
    const totalLength = countResult[0].total;

    const dataQuery = `${unionQuery} LIMIT ? OFFSET ?`;
    const dataParams = [...queryParams, limit, pageNumber * limit];

    const [results] = await pool.query(dataQuery, dataParams);
    const lastPage = Math.ceil(totalLength / limit);

    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.json({
      total_packages: totalLength,
      current_page: pageNumber,
      last_page: lastPage,
      more_available: (pageNumber + 1) * limit < totalLength,
      packages: results
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default app;
const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
