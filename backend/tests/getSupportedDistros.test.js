import request from 'supertest';
import { createApp } from '../app.js';
import { createMockPool } from './helpers/mockPool.js';

describe('GET /getSupportedDistros', () => {
  const app = createApp(createMockPool());

  test('returns distribution bitmask data', async () => {
    const res = await request(app).get('/getSupportedDistros');

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('Fedora');
    expect(res.body.Fedora).toHaveProperty('Fedora 42');
    expect(typeof res.body.Fedora['Fedora 42']).toBe('string');
  });

  test('sets no-cache response headers', async () => {
    const res = await request(app).get('/getSupportedDistros');

    expect(res.headers['cache-control']).toBe('no-cache, no-store, must-revalidate');
    expect(res.headers.pragma).toBe('no-cache');
    expect(res.headers.expires).toBe('0');
  });
});

describe('GET /sdt/getSupportedDistros', () => {
  const app = createApp(createMockPool());

  test('returns the same distribution data on the legacy path', async () => {
    const res = await request(app).get('/sdt/getSupportedDistros');

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('Debian');
    expect(res.body.Debian).toHaveProperty('12(Bookworm)');
  });
});
