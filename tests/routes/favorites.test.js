const mockQuery = jest.fn();

jest.mock('pg', () => ({
  Pool: jest.fn().mockImplementation(() => ({ query: mockQuery })),
}));

const request = require('supertest');
const app = require('../../src/app');

beforeEach(() => {
  mockQuery.mockReset();
});

describe('GET /api/favorites', () => {
  test('returns a list of favorited quotation ids', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ quotation_id: 3 }, { quotation_id: 1 }] });

    const res = await request(app).get('/api/favorites');

    expect(res.status).toBe(200);
    expect(res.body).toEqual([3, 1]);
  });
});

describe('POST /api/favorites/:quotationId', () => {
  test('returns 404 when the quotation does not exist', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] }); // quotation existence check

    const res = await request(app).post('/api/favorites/999');

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Quotation not found');
  });

  test('adds a quotation to favorites', async () => {
    mockQuery
      .mockResolvedValueOnce({ rows: [{ id: 1 }] }) // quotation exists
      .mockResolvedValueOnce({ rows: [{ id: 1, quotation_id: 1 }] }); // insert

    const res = await request(app).post('/api/favorites/1');

    expect(res.status).toBe(201);
    expect(res.body.message).toBe('Added to favorites');
  });

  test('reports when a quotation is already favorited', async () => {
    mockQuery
      .mockResolvedValueOnce({ rows: [{ id: 1 }] }) // quotation exists
      .mockResolvedValueOnce({ rows: [] }); // ON CONFLICT DO NOTHING, nothing returned

    const res = await request(app).post('/api/favorites/1');

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Already in favorites');
  });
});

describe('DELETE /api/favorites/:quotationId', () => {
  test('removes a quotation from favorites', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ quotation_id: 1 }] });

    const res = await request(app).delete('/api/favorites/1');

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Removed from favorites');
  });

  test('returns 404 when the favorite does not exist', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const res = await request(app).delete('/api/favorites/999');

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Not found in favorites');
  });
});

describe('GET /api/favorites/:quotationId', () => {
  test('reports true when a quotation is favorited', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ id: 1 }] });

    const res = await request(app).get('/api/favorites/1');

    expect(res.status).toBe(200);
    expect(res.body.isFavorited).toBe(true);
  });

  test('reports false when a quotation is not favorited', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const res = await request(app).get('/api/favorites/999');

    expect(res.status).toBe(200);
    expect(res.body.isFavorited).toBe(false);
  });
});
