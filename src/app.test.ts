import request from 'supertest';
import app from './app';

describe('Test root GET', () => {
  it('returns welcome json message', async () => {
    const res = await request(app).get('/');

    expect(res.status).toBe(200);
    expect(res.type).toBe('application/json');
  });
});
