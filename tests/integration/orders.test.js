const { describeIfDb } = require('../helpers/describeIfDb');

describeIfDb('Orders, inventory, returns, and seller permissions', () => {
  let app;
  let request;
  let ensureDbSynced;
  let createApprovedSeller;
  let createCatalogBasics;
  let registerAndLogin;
  let Models;

  beforeAll(async () => {
    ({
      app,
      request,
      ensureDbSynced,
      createApprovedSeller,
      createCatalogBasics,
      registerAndLogin,
      Models
    } = require('../helpers/apiHarness'));
    await ensureDbSynced();
  });

  it('places an order, decrements inventory, and supports return request', async () => {
    const seller = await createApprovedSeller();
    const customer = await registerAndLogin({ prefix: 'ord_cust' });
    const { category, brand } = await createCatalogBasics();
    const models = await Models();

    const productRes = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${seller.token}`)
      .send({
        title: 'Orderable Product',
        base_price: 2000,
        category_id: category.id,
        brand_id: brand.id,
        variants: [
          {
            sku: `ORD-${Date.now()}`,
            price: 2000,
            stock_qty: 10
          }
        ]
      });

    expect(productRes.statusCode).toBe(201);
    const variant = productRes.body.data.product_variants[0];

    const address = await models.addresses.create({
      user_id: customer.user.id,
      label: 'Home',
      full_name: customer.user.full_name || 'Customer',
      phone: '3001234567',
      city: 'Lahore',
      area: 'Model Town',
      street: 'Street 1',
      postal_code: '54000',
      is_default: true
    });

    const orderRes = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${customer.token}`)
      .send({
        address_id: address.id,
        payment_method: 'cod',
        notes: 'Please call before delivery',
        items: [
          {
            variant_id: variant.id,
            quantity: 2,
            unit_price: 2000
          }
        ]
      });

    expect(orderRes.statusCode).toBe(201);
    expect(orderRes.body.data.total_amount).toBe(4200);

    const updatedVariant = await models.product_variants.findByPk(variant.id);
    expect(updatedVariant.stock_qty).toBe(8);

    const inventoryRes = await request(app)
      .post('/api/inventory/adjust')
      .set('Authorization', `Bearer ${seller.token}`)
      .send({
        variant_id: variant.id,
        quantity_change: 5,
        action: 'RESTOCK'
      });

    expect(inventoryRes.statusCode).toBe(200);
    expect(inventoryRes.body.data.new_qty).toBe(13);

    const orderItem = orderRes.body.data.order_items[0];
    const returnRes = await request(app)
      .post('/api/returns')
      .set('Authorization', `Bearer ${customer.token}`)
      .send({
        order_id: orderRes.body.data.id,
        order_item_id: orderItem.id,
        reason: 'Damaged item',
        description: 'Box arrived broken'
      });

    expect(returnRes.statusCode).toBe(201);
    expect(returnRes.body.data.status).toBe('pending');
  });

  it('prevents sellers from accessing admin-only seller approval list without admin role', async () => {
    const seller = await createApprovedSeller();

    const res = await request(app)
      .get('/api/sellers')
      .set('Authorization', `Bearer ${seller.token}`);

    expect(res.statusCode).toBe(403);
  });

  it('rejects order creation without auth', async () => {
    const res = await request(app).post('/api/orders').send({ items: [] });
    expect(res.statusCode).toBe(401);
  });
});
