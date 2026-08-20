const { describeIfDb } = require('../helpers/describeIfDb');

describeIfDb('Auth API', () => {
  let app;
  let request;
  let ensureDbSynced;
  let registerAndLogin;

  beforeAll(async () => {
    ({ app, request, ensureDbSynced, registerAndLogin } = require('../helpers/apiHarness'));
    await ensureDbSynced();
  });

  it('registers a new customer', async () => {
    const auth = await registerAndLogin({ prefix: 'auth_reg' });
    expect(auth.user.email).toContain('@example.com');
    expect(auth.token).toBeTruthy();
  });

  it('rejects duplicate email registration', async () => {
    const auth = await registerAndLogin({ prefix: 'auth_dup' });

    const res = await request(app).post('/api/auth/register').send({
      full_name: 'Duplicate User',
      email: auth.credentials.email,
      password: 'Secret123',
      phone: `3${Date.now()}`.slice(0, 11)
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/already registered/i);
  });

  it('rejects invalid login credentials', async () => {
    const auth = await registerAndLogin({ prefix: 'auth_bad' });

    const res = await request(app).post('/api/auth/login').send({
      email: auth.credentials.email,
      password: 'WrongPassword'
    });

    expect(res.statusCode).toBe(401);
  });

  it('validates login payload', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'not-an-email',
      password: 'x'
    });

    expect(res.statusCode).toBe(400);
  });
});
