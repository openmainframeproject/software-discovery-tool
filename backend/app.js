import express from 'express';
import cors from 'cors';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { SUPPORTED_DISTROS, MAX_RECORDS_TO_SEND } from './config.js';
import { buildDistroBitMap, getTables, stringifyBigInts } from './utils.js';

const createCorsMiddleware = () => {
  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:3000'];

  return cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    }
  });
};

const createSwaggerMiddleware = () => {
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
    apis: ['./app.js'],
  };
  const swaggerSpec = swaggerJsdoc(swaggerOptions);
  return [swaggerUi.serve, swaggerUi.setup(swaggerSpec)];
};

export const createApp = (pool) => {
  const app = express();
  const distroBitMap = buildDistroBitMap(SUPPORTED_DISTROS);

  app.use(createCorsMiddleware());
  app.use(express.json());
  app.use('/api-docs', ...createSwaggerMiddleware());

  const setNoCacheHeaders = (res) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  };

  const getSupportedDistrosHandler = (req, res) => {
    setNoCacheHeaders(res);
    res.json(stringifyBigInts(distroBitMap));
  };

  app.get('/getSupportedDistros', getSupportedDistrosHandler);
  app.get('/sdt/getSupportedDistros', getSupportedDistrosHandler);

  app.get(['/searchPackages', '/sdt/searchPackages'], async (req, res) => {
    const searchTerm = (req.query.search_term || '').trim();
    const exactMatch = req.query.exact_match === 'true';
    const searchDescription = req.query.search_description === 'true';
    const searchBitFlag = req.query.search_bit_flag || '0';
    const pageNumber = parseInt(req.query.page_number || '0');
    const limit = Math.min(parseInt(req.query.limit || MAX_RECORDS_TO_SEND), 500);

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
      const tables = getTables(searchBitFlag, distroBitMap, SUPPORTED_DISTROS);
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

      setNoCacheHeaders(res);
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

  return app;
};
