import request from 'supertest';
import app from '../index.js';

describe('API Endpoints', () => {
  test('GET /getSupportedDistros should return distribution data', async () => {
    const res = await request(app).get('/getSupportedDistros');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('Fedora');
    expect(res.body.Fedora).toHaveProperty('Fedora 40');
  });

  test('GET /searchPackages without search term should return empty results', async () => {
    const res = await request(app).get('/searchPackages');
    expect(res.statusCode).toEqual(200);
    expect(res.body.total_packages).toEqual(0);
    expect(res.body.packages).toEqual([]);
  });
});
