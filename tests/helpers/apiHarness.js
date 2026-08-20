const request = require('supertest');
const app = require('../../app');
const { dbSync, Models } = require('../../models/dbModel');
const { uniqueSuffix } = require('../helpers/testUtils');

let synced = false;

const ensureDbSynced = async () => {
  if (!synced) {
    await dbSync();
    synced = true;
  }
};

const registerAndLogin = async ({ role = 'customer', prefix = 'user' } = {}) => {
  const suffix = uniqueSuffix();
  const payload = {
    full_name: `${prefix} ${suffix}`,
    email: `${prefix}_${suffix}@example.com`,
    password: 'Secret123',
    phone: `3${uniqueSuffix().replace(/\D/g, '').padEnd(10, '0').slice(0, 10)}`,
    role
  };

  const registerRes = await request(app).post('/api/auth/register').send(payload);
  expect(registerRes.statusCode).toBe(201);

  const loginRes = await request(app).post('/api/auth/login').send({
    email: payload.email,
    password: payload.password
  });
  expect(loginRes.statusCode).toBe(200);

  return {
    user: loginRes.body.data.user,
    token: loginRes.body.data.token,
    credentials: payload
  };
};

/**
 * Creates an approved seller with JWT containing seller_id.
 */
const createApprovedSeller = async () => {
  await ensureDbSynced();
  const models = await Models();
  const auth = await registerAndLogin({ role: 'customer', prefix: 'seller' });

  const seller = await models.sellers.create({
    user_id: auth.user.id,
    shop_name: `Shop ${uniqueSuffix()}`,
    shop_slug: `shop-${uniqueSuffix()}`,
    ntn_number: 'NTN-123',
    bank_name: 'Test Bank',
    bank_account: '123456',
    bank_iban: 'PK00TEST000000',
    ntn_doc_url: 'https://example.com/ntn.pdf',
    id_card_doc_url: 'https://example.com/id.pdf',
    status: 'approved',
    approved_at: new Date(),
    rating: 0
  });

  await models.users.update({ role: 'seller' }, { where: { id: auth.user.id } });

  const loginRes = await request(app).post('/api/auth/login').send({
    email: auth.credentials.email,
    password: auth.credentials.password
  });

  expect(loginRes.statusCode).toBe(200);
  expect(loginRes.body.data.user.seller_id).toBe(seller.id);

  return {
    ...auth,
    token: loginRes.body.data.token,
    user: loginRes.body.data.user,
    seller
  };
};

const createCatalogBasics = async () => {
  await ensureDbSynced();
  const models = await Models();
  const suffix = uniqueSuffix();

  const category = await models.categories.create({
    name: `Category ${suffix}`,
    slug: `category-${suffix}`,
    is_active: true,
    sort_order: 1
  });

  const brand = await models.brands.create({
    name: `Brand ${suffix}`,
    slug: `brand-${suffix}`
  });

  return { category, brand };
};

module.exports = {
  app,
  request,
  ensureDbSynced,
  registerAndLogin,
  createApprovedSeller,
  createCatalogBasics,
  Models
};
