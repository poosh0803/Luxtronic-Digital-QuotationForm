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

describe('GET /api/odoo/products', () => {
  test('returns 400 when the q parameter is missing', async () => {
    const res = await request(app).get('/api/odoo/products');

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Query parameter is required');
  });

  test('returns 503 when ODOO_API_URL is not configured', async () => {
    delete process.env.ODOO_API_URL;
    const res = await request(app).get('/api/odoo/products?q=ryzen');

    expect(res.status).toBe(503);
  });
});

describe('searchProducts', () => {
  const { searchProducts } = require('../src/route/odoo');
  const products = [
    { id: 1, display_name: 'AMD Ryzen 7 9800X3D', default_code: 'CPU-9800', barcode: false, list_price: 700, qty_available: 0 },
    { id: 2, display_name: 'AMD Ryzen 5 7500F', default_code: 'CPU-7500', barcode: false, list_price: 250, qty_available: 3 },
    { id: 3, display_name: 'Corsair RAM 32GB', default_code: false, barcode: '123', list_price: 150, qty_available: 5 },
  ];

  test('requires every search term to match, case-insensitively', () => {
    expect(searchProducts(products, 'ryzen x3d').map((p) => p.id)).toEqual([1]);
  });

  test('matches on SKU and lists in-stock products first', () => {
    expect(searchProducts(products, 'cpu-').map((p) => p.id)).toEqual([2, 1]);
  });

  test('normalises unset Odoo text fields to empty strings', () => {
    expect(searchProducts(products, 'corsair')[0].sku).toBe('');
  });
});
