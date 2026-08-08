const mockQuery = jest.fn();

jest.mock('pg', () => ({
  Pool: jest.fn().mockImplementation(() => ({ query: mockQuery })),
}));

const request = require('supertest');
const app = require('../../src/app');

beforeEach(() => {
  mockQuery.mockReset();
});

describe('GET /api/quotation/latest', () => {
  test('returns the most recent quotation', async () => {
    const row = { id: 1, customer_name: 'Alice', final_price: '1500.00' };
    mockQuery.mockResolvedValueOnce({ rows: [row] });

    const res = await request(app).get('/api/quotation/latest');

    expect(res.status).toBe(200);
    expect(res.body).toEqual(row);
  });

  test('returns 404 when there are no quotations', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const res = await request(app).get('/api/quotation/latest');

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('No quotations found');
  });

  test('returns 500 on a database error', async () => {
    mockQuery.mockRejectedValueOnce(new Error('connection refused'));

    const res = await request(app).get('/api/quotation/latest');

    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Database error');
  });
});

describe('GET /api/quotation/:id', () => {
  test('returns the quotation with the given id', async () => {
    const row = { id: 42, customer_name: 'Bob' };
    mockQuery.mockResolvedValueOnce({ rows: [row] });

    const res = await request(app).get('/api/quotation/42');

    expect(res.status).toBe(200);
    expect(res.body).toEqual(row);
    expect(mockQuery).toHaveBeenCalledWith(
      'SELECT * FROM quotations WHERE id = $1',
      ['42']
    );
  });

  test('returns 404 when the quotation does not exist', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const res = await request(app).get('/api/quotation/999');

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Quotation not found');
  });
});

describe('GET /api/quotations', () => {
  test('returns all quotations ordered by most recent', async () => {
    const rows = [{ id: 2 }, { id: 1 }];
    mockQuery.mockResolvedValueOnce({ rows });

    const res = await request(app).get('/api/quotations');

    expect(res.status).toBe(200);
    expect(res.body).toEqual(rows);
  });
});

describe('POST /api/quotation', () => {
  test('creates a quotation, converting blank numeric fields to null', async () => {
    const createdRow = { id: 10, customer_name: 'Carol' };
    mockQuery.mockResolvedValueOnce({ rows: [createdRow] });

    const res = await request(app)
      .post('/api/quotation')
      .send({
        customer_name: 'Carol',
        final_price: '999.99',
        platform: 'AMD',
        cpu_details: 'Ryzen 7',
        cpu_unit: '1',
        cpu_price: '350',
        // storage2 left blank on purpose
        storage2_unit: '',
        storage2_price: '',
      })
      .set('Content-Type', 'application/x-www-form-urlencoded');

    expect(res.status).toBe(201);
    expect(res.body).toEqual(createdRow);

    const [, params] = mockQuery.mock.calls[0];
    // customer_name, final_price, platform, cpu_details, cpu_unit, cpu_price, ...
    expect(params[0]).toBe('Carol');
    expect(params[1]).toBe(999.99);
    expect(params[4]).toBe(1); // cpu_unit parsed to int
    expect(params[5]).toBe(350); // cpu_price parsed to float
    // storage2_unit and storage2_price should be null, not NaN/0
    const storage2UnitIndex = 24;
    const storage2PriceIndex = 25;
    expect(params[storage2UnitIndex]).toBeNull();
    expect(params[storage2PriceIndex]).toBeNull();
  });

  test('returns 500 when the insert fails', async () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockQuery.mockRejectedValueOnce(new Error('insert failed'));

    const res = await request(app)
      .post('/api/quotation')
      .send({ customer_name: 'Dave', final_price: '100', platform: 'INTEL' });

    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Database error');

    errorSpy.mockRestore();
  });
});

describe('PUT /api/quotation/:id', () => {
  test('updates a quotation', async () => {
    const updatedRow = { id: 5, customer_name: 'Eve' };
    mockQuery.mockResolvedValueOnce({ rows: [updatedRow] });

    const res = await request(app)
      .put('/api/quotation/5')
      .send({ customer_name: 'Eve', final_price: '200', platform: 'AMD' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual(updatedRow);
  });

  test('returns 404 when updating a non-existent quotation', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .put('/api/quotation/999')
      .send({ customer_name: 'Ghost', final_price: '0', platform: 'AMD' });

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Quotation not found');
  });
});

describe('DELETE /api/quotation/:id', () => {
  test('deletes an existing quotation', async () => {
    mockQuery
      .mockResolvedValueOnce({ rows: [{ id: 7 }] }) // existence check
      .mockResolvedValueOnce({ rows: [{ id: 7 }] }); // delete

    const res = await request(app).delete('/api/quotation/7');

    expect(res.status).toBe(200);
    expect(res.body.deletedId).toBe(7);
  });

  test('returns 404 when deleting a quotation that does not exist', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] }); // existence check finds nothing

    const res = await request(app).delete('/api/quotation/999');

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Quotation not found');
  });
});

describe('GET /api/records', () => {
  test('returns the trimmed record list', async () => {
    const rows = [{ id: 1, platform: 'AMD', customer_name: 'Alice', created_at: '2026-01-01', final_price: '1000.00' }];
    mockQuery.mockResolvedValueOnce({ rows });

    const res = await request(app).get('/api/records');

    expect(res.status).toBe(200);
    expect(res.body).toEqual(rows);
  });
});
