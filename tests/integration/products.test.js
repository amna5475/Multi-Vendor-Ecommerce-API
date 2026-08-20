const { describeIfDb } = require('../helpers/describeIfDb');

describeIfDb('Products API', () => {
  let app;
  let request;
  let ensureDbSynced;
  let createApprovedSeller;
  let createCatalogBasics;
  let registerAndLogin;

  beforeAll(async () => {
    ({
      app,
      request,
      ensureDbSynced,
      createApprovedSeller,
      createCatalogBasics,
      registerAndLogin
    } = require('../helpers/apiHarness'));
    await ensureDbSynced();
  });

  it('allows an approved seller to create a product with variants', async () => {
    const seller = await createApprovedSeller();
    const { category, brand } = await createCatalogBasics();

    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${seller.token}`)
      .send({
        title: 'Wireless Headphones',
        base_price: 4999,
        category_id: category.id,
        brand_id: brand.id,
        description: 'Noise cancelling headphones',
        status: 'active',
        variants: [
          {
            sku: `SKU-${Date.now()}`,
            color: 'Black',
            size: 'Standard',
            price: 4999,
            stock_qty: 25
          }
        ]
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.data.title).toBe('Wireless Headphones');
    expect(res.body.data.product_variants.length).toBeGreaterThan(0);
  });

  it('lists products for public search/browse', async () => {
    const res = await request(app).get('/api/products');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('blocks customers from creating products', async () => {
    const customer = await registerAndLogin({ prefix: 'prod_cust' });
    const { category, brand } = await createCatalogBasics();

    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${customer.token}`)
      .send({
        title: 'Should Fail',
        base_price: 100,
        category_id: category.id,
        brand_id: brand.id
      });

    expect(res.statusCode).toBe(403);
  });

  it('returns product details by id', async () => {
    const seller = await createApprovedSeller();
    const { category, brand } = await createCatalogBasics();

    const created = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${seller.token}`)
      .send({
        title: 'Detail Product',
        base_price: 1500,
        category_id: category.id,
        brand_id: brand.id,
        variants: [{ sku: `DET-${Date.now()}`, price: 1500, stock_qty: 5 }]
      });

    const productId = created.body.data.id;
    const res = await request(app).get(`/api/products/${productId}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.id).toBe(productId);
  });
});
