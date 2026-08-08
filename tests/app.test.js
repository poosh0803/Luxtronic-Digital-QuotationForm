jest.mock('pg', () => ({
  Pool: jest.fn().mockImplementation(() => ({ query: jest.fn() })),
}));

const request = require('supertest');
const app = require('../src/app');

describe('static page routes', () => {
  test.each([
    ['/', 'index.html'],
    ['/newQuotation', 'newQuotation.html'],
    ['/records', 'records.html'],
    ['/analytics', 'analytics.html'],
    ['/centrecom', 'centrecom.html'],
  ])('GET %s serves %s', async (route) => {
    const res = await request(app).get(route);

    expect(res.status).toBe(200);
    expect(res.type).toBe('text/html');
  });
});

describe('GET /api/staticice-proxy', () => {
  test('returns 400 when the query parameter is missing', async () => {
    const res = await request(app).get('/api/staticice-proxy');

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Query parameter is required');
  });
});

describe('GET /api/staticice-proxy-multipage', () => {
  test('returns 400 when the url parameter is missing', async () => {
    const res = await request(app).get('/api/staticice-proxy-multipage');

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('URL parameter is required');
  });
});
