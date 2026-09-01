import request from 'supertest';
import { createApp } from '../app.js';
import { createMockPool, mockDbFailure, mockSearchResults } from './helpers/mockPool.js';

describe('GET /searchPackages', () => {
  test('returns empty results when search_term is missing', async () => {
    const app = createApp(createMockPool());
    const res = await request(app).get('/searchPackages');

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      total_packages: 0,
      current_page: 0,
      last_page: 0,
      more_available: false,
      packages: []
    });
  });

  test('returns empty results when search_term is blank', async () => {
    const app = createApp(createMockPool());
    const res = await request(app).get('/searchPackages?search_term=%20%20');

    expect(res.statusCode).toEqual(200);
    expect(res.body.total_packages).toEqual(0);
    expect(res.body.packages).toEqual([]);
  });

  test('returns 400 for invalid page_number', async () => {
    const app = createApp(createMockPool());
    const res = await request(app).get('/searchPackages?search_term=nginx&page_number=-1');

    expect(res.statusCode).toEqual(400);
    expect(res.body).toEqual({ error: 'Invalid page_number' });
  });

  test('returns 400 for non-numeric page_number', async () => {
    const app = createApp(createMockPool());
    const res = await request(app).get('/searchPackages?search_term=nginx&page_number=abc');

    expect(res.statusCode).toEqual(400);
    expect(res.body).toEqual({ error: 'Invalid page_number' });
  });

  test('returns 400 for invalid limit', async () => {
    const app = createApp(createMockPool());
    const res = await request(app).get('/searchPackages?search_term=nginx&limit=0');

    expect(res.statusCode).toEqual(400);
    expect(res.body).toEqual({ error: 'Invalid limit' });
  });

  test('returns 400 for invalid search_bit_flag', async () => {
    const app = createApp(createMockPool());
    const res = await request(app).get('/searchPackages?search_term=nginx&search_bit_flag=not-a-number');

    expect(res.statusCode).toEqual(400);
    expect(res.body).toEqual({ error: 'Invalid search_bit_flag' });
  });

  test('returns empty results when no distros match the search bitmask', async () => {
    const app = createApp(createMockPool());
    const res = await request(app).get('/searchPackages?search_term=nginx&search_bit_flag=0');

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      total_packages: 0,
      current_page: 0,
      last_page: 0,
      more_available: false,
      packages: []
    });
  });

  test('returns paginated package results from the database', async () => {
    const packages = [
      {
        packageName: 'nginx',
        description: 'High performance web server',
        version: '1.24.0',
        osName: 'Fedora 42'
      }
    ];
    const pool = createMockPool(mockSearchResults(1, packages));
    const app = createApp(pool);

    const res = await request(app)
      .get('/searchPackages')
      .query({
        search_term: 'nginx',
        search_bit_flag: '2048',
        page_number: '0',
        limit: '10'
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body.total_packages).toEqual(1);
    expect(res.body.current_page).toEqual(0);
    expect(res.body.last_page).toEqual(1);
    expect(res.body.more_available).toEqual(false);
    expect(res.body.packages).toEqual(packages);
    expect(pool.query).toHaveBeenCalledTimes(2);
  });

  test('returns 500 when the database query fails', async () => {
    const app = createApp(createMockPool(mockDbFailure()));

    const res = await request(app)
      .get('/searchPackages')
      .query({
        search_term: 'nginx',
        search_bit_flag: '2048'
      });

    expect(res.statusCode).toEqual(500);
    expect(res.body).toEqual({ error: 'Internal server error' });
  });
});

describe('GET /sdt/searchPackages', () => {
  test('supports the legacy search path', async () => {
    const app = createApp(createMockPool());
    const res = await request(app).get('/sdt/searchPackages');

    expect(res.statusCode).toEqual(200);
    expect(res.body.packages).toEqual([]);
  });
});
