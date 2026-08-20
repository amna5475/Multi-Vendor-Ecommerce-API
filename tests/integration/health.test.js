const { describeIfDb } = require('../helpers/describeIfDb');

describeIfDb('Health endpoint', () => {
  let app;
  let request;
  let ensureDbSynced;

  beforeAll(async () => {
    ({ app, request, ensureDbSynced } = require('../helpers/apiHarness'));
    await ensureDbSynced();
  });

  it('returns API health payload', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('OK');
    expect(['connected', 'unavailable']).toContain(res.body.redis);
  });
});
