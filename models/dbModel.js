const config = require('config');
const { Sequelize, DataTypes } = require('sequelize');

const { database } = config;

const sequelize = new Sequelize(database.dbName, database.username, database.password, {
  dialect: 'postgres',
  logging: false,
  host: database.host,
  port: database.port,
  pool: {
    max: database.settings.dbConnections.max,
    min: database.settings.dbConnections.min,
    idle: database.settings.idleTime,
    acquire: database.settings.acquireDB,
    evict: database.settings.evictDB,
  },
  timezone: 'Asia/Karachi'
});

sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

let cachedModels = null;

exports.Models = async () => {
  if (cachedModels) return cachedModels;

  let models = {};
  try {
    /**
     * USERS Model
     */
    models.users = await sequelize.define('users', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      full_name: { type: Sequelize.STRING },
      email: { type: Sequelize.STRING, unique: true },
      phone: { type: Sequelize.STRING, unique: true },
      password_hash: { type: Sequelize.STRING },
      role: { type: Sequelize.STRING },
      is_verified: { type: Sequelize.BOOLEAN, defaultValue: false },
      is_active: { type: Sequelize.BOOLEAN, defaultValue: true },
      created_at: { type: Sequelize.DATE },
      updated_at: { type: Sequelize.DATE }
    }, { timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' });

    /**
     * USER_SESSIONS Model
     */
    models.user_sessions = await sequelize.define('user_sessions', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      user_id: { type: Sequelize.UUID, allowNull: false },
      token: { type: Sequelize.TEXT, unique: true },
      device_info: { type: Sequelize.TEXT },
      ip_address: { type: Sequelize.STRING },
      expires_at: { type: Sequelize.DATE },
      created_at: { type: Sequelize.DATE }
    }, { timestamps: true, createdAt: 'created_at', updatedAt: false });

    /**
     * ADDRESSES Model
     */
    models.addresses = await sequelize.define('addresses', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      user_id: { type: Sequelize.UUID, allowNull: false },
      label: { type: Sequelize.STRING },
      full_name: { type: Sequelize.STRING },
      phone: { type: Sequelize.STRING },
      city: { type: Sequelize.STRING },
      area: { type: Sequelize.STRING },
      street: { type: Sequelize.STRING },
      postal_code: { type: Sequelize.STRING },
      is_default: { type: Sequelize.BOOLEAN, defaultValue: false }
    }, { timestamps: false });

    /**
     * SELLERS Model
     */
    //  Associates a user account with a seller profile. 
    //  Each seller is a user first, but with additional business details.
    models.sellers = await sequelize.define('sellers', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      user_id: { type: Sequelize.UUID, allowNull: false },
      shop_name: { type: Sequelize.STRING, unique: true },
      shop_slug: { type: Sequelize.STRING, unique: true },
      description: { type: Sequelize.TEXT },
      logo_url: { type: Sequelize.TEXT },
      ntn_number: { type: Sequelize.STRING },
      bank_name: { type: Sequelize.STRING },
      bank_account: { type: Sequelize.STRING },
      bank_iban: { type: Sequelize.STRING },
      ntn_doc_url: { type: Sequelize.TEXT },
      id_card_doc_url: { type: Sequelize.TEXT },
      rating: { type: Sequelize.FLOAT, defaultValue: 0 },
      status: { type: Sequelize.STRING },
      approved_at: { type: Sequelize.DATE }
    }, { timestamps: false });

    /**
     * SELLER_STAFF Model (Junction Table)
     * Links users to sellers with specific roles/permissions.
     * Allows one user to manage multiple shops.
     */
    models.seller_staff = await sequelize.define('seller_staff', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      user_id: { type: Sequelize.UUID, allowNull: false },
      seller_id: { type: Sequelize.UUID, allowNull: false },
      role: { type: Sequelize.STRING, defaultValue: 'staff' }, // e.g., 'manager', 'inventory', 'support'
      is_active: { type: Sequelize.BOOLEAN, defaultValue: true },
      joined_at: { type: Sequelize.DATE }
    }, { timestamps: true, createdAt: 'joined_at', updatedAt: false });

    /**
     * CATEGORIES Model
     */
    models.categories = await sequelize.define('categories', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      parent_id: { type: Sequelize.UUID },
      name: { type: Sequelize.STRING },
      slug: { type: Sequelize.STRING, unique: true },
      icon_url: { type: Sequelize.STRING },
      sort_order: { type: Sequelize.INTEGER },
      is_active: { type: Sequelize.BOOLEAN, defaultValue: true }
    }, { timestamps: false });

    /**
     * BRANDS Model
     */
    models.brands = await sequelize.define('brands', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      name: { type: Sequelize.STRING, unique: true },
      slug: { type: Sequelize.STRING, unique: true },
      logo_url: { type: Sequelize.STRING },
      is_verified: { type: Sequelize.BOOLEAN, defaultValue: false }
    }, { timestamps: false });

    /**
     * PRODUCTS Model
     */
    models.products = await sequelize.define('products', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      seller_id: { type: Sequelize.UUID, allowNull: false },
      category_id: { type: Sequelize.UUID, allowNull: false },
      brand_id: { type: Sequelize.UUID, allowNull: false },
      title: { type: Sequelize.STRING },
      slug: { type: Sequelize.STRING, unique: true },
      description: { type: Sequelize.TEXT },
      base_price: { type: Sequelize.FLOAT },
      discount_percent: { type: Sequelize.FLOAT, defaultValue: 0 },
      condition: { type: Sequelize.STRING },
      status: { type: Sequelize.STRING },
      total_sold: { type: Sequelize.INTEGER, defaultValue: 0 },
      avg_rating: { type: Sequelize.FLOAT, defaultValue: 0 },
      review_count: { type: Sequelize.INTEGER, defaultValue: 0 },
      created_at: { type: Sequelize.DATE },
      updated_at: { type: Sequelize.DATE }
    }, { timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' });

    /**
     * PRODUCT_IMAGES Model
     */
    models.product_images = await sequelize.define('product_images', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      product_id: { type: Sequelize.UUID, allowNull: false },
      url: { type: Sequelize.TEXT },
      is_primary: { type: Sequelize.BOOLEAN, defaultValue: false },
      sort_order: { type: Sequelize.INTEGER }
    }, { timestamps: false });

    /**
     * PRODUCT_ATTRIBUTES Model
     */
    // FOR ADDITIONAL SPECIFCATIONS Each attribute is stored as a key-value pair in the attribute_value column.
    models.product_attributes = await sequelize.define('product_attributes', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      product_id: { type: Sequelize.UUID, allowNull: false },
      attribute_name: { type: Sequelize.STRING },
      attribute_value: { type: Sequelize.STRING }
    }, { timestamps: false });

    /**
     * PRODUCT_VARIANTS Model
     */
    models.product_variants = await sequelize.define('product_variants', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      product_id: { type: Sequelize.UUID, allowNull: false },
      sku: { type: Sequelize.STRING, unique: true },
      color: { type: Sequelize.STRING },
      size: { type: Sequelize.STRING },
      material: { type: Sequelize.STRING },
      price: { type: Sequelize.FLOAT },
      stock_qty: { type: Sequelize.INTEGER, defaultValue: 0 },
      reserved_qty: { type: Sequelize.INTEGER, defaultValue: 0 },
      image_url: { type: Sequelize.TEXT }, // Variant specific image
      is_active: { type: Sequelize.BOOLEAN, defaultValue: true },
      status: { type: Sequelize.STRING }
    }, { timestamps: false });

    /**
     * PRODUCT_QUESTIONS Model
     */
    models.product_questions = await sequelize.define('product_questions', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      product_id: { type: Sequelize.UUID, allowNull: false },
      user_id: { type: Sequelize.UUID, allowNull: false },
      question: { type: Sequelize.TEXT, allowNull: false },
      answer: { type: Sequelize.TEXT },
      answered_by: { type: Sequelize.UUID }, // Seller user ID
      is_public: { type: Sequelize.BOOLEAN, defaultValue: true },
      created_at: { type: Sequelize.DATE },
      answered_at: { type: Sequelize.DATE }
    }, { timestamps: true, createdAt: 'created_at', updatedAt: 'answered_at' });

    /**
     * SHOP_FOLLOWERS Model
     */
    models.shop_followers = await sequelize.define('shop_followers', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      user_id: { type: Sequelize.UUID, allowNull: false },
      seller_id: { type: Sequelize.UUID, allowNull: false },
      followed_at: { type: Sequelize.DATE }
    }, { timestamps: true, createdAt: 'followed_at', updatedAt: false });

    /**
     * ADMIN_ACTIVITY_LOGS Model
     */
    models.admin_activity_logs = await sequelize.define('admin_activity_logs', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      admin_id: { type: Sequelize.UUID, allowNull: false },
      action: { type: Sequelize.STRING }, // e.g., 'APPROVE_SELLER', 'DELETE_PRODUCT'
      target_type: { type: Sequelize.STRING }, // e.g., 'sellers', 'products'
      target_id: { type: Sequelize.UUID },
      details: { type: Sequelize.JSONB }, // For storing before/after states
      ip_address: { type: Sequelize.STRING },
      created_at: { type: Sequelize.DATE }
    }, { timestamps: true, createdAt: 'created_at', updatedAt: false });

    /**
     * INVENTORY Model
     */
    // SOLD OUT , RESTOCKED , QUANTITY CHANGE Tracks the history of inventory changes for product variants.
    models.inventory = await sequelize.define('inventory', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      variant_id: { type: Sequelize.UUID, allowNull: false },
      action: { type: Sequelize.STRING },
      quantity_change: { type: Sequelize.INTEGER },
      qty_after: { type: Sequelize.INTEGER },
      reference_type: { type: Sequelize.STRING },
      reference_id: { type: Sequelize.UUID },
      created_at: { type: Sequelize.DATE }
    }, { timestamps: true, tableName: 'inventory', createdAt: 'created_at', updatedAt: false });

    /**
     * WISHLISTS Model
     */
    models.wishlists = await sequelize.define('wishlists', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      user_id: { type: Sequelize.UUID, allowNull: false },
      product_id: { type: Sequelize.UUID, allowNull: false },
      added_at: { type: Sequelize.DATE }
    }, { timestamps: true, createdAt: 'added_at', updatedAt: false });

    /**
     * VOUCHERS Model
     */
    models.vouchers = await sequelize.define('vouchers', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      code: { type: Sequelize.STRING, unique: true },
      type: { type: Sequelize.STRING },
      value: { type: Sequelize.FLOAT },
      min_order_value: { type: Sequelize.FLOAT },
      max_discount: { type: Sequelize.FLOAT },
      usage_limit: { type: Sequelize.INTEGER },
      used_count: { type: Sequelize.INTEGER, defaultValue: 0 },
      seller_id: { type: Sequelize.UUID },
      valid_from: { type: Sequelize.DATE },
      valid_until: { type: Sequelize.DATE },
      is_active: { type: Sequelize.BOOLEAN, defaultValue: true }
    }, { timestamps: false });

    /**
     * WALLETS Model
     */
    models.wallets = await sequelize.define('wallets', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      user_id: { type: Sequelize.UUID, allowNull: false, unique: true },
      balance: { type: Sequelize.FLOAT, defaultValue: 0 },
      currency: { type: Sequelize.STRING, defaultValue: 'PKR' },
      is_locked: { type: Sequelize.BOOLEAN, defaultValue: false }
    }, { timestamps: true });

    /**
     * WALLET_TRANSACTIONS Model
     */
    models.wallet_transactions = await sequelize.define('wallet_transactions', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      wallet_id: { type: Sequelize.UUID, allowNull: false },
      type: { type: Sequelize.STRING }, // e.g., 'CREDIT', 'DEBIT'
      amount: { type: Sequelize.FLOAT, allowNull: false },
      purpose: { type: Sequelize.STRING }, // e.g., 'ORDER_PAYMENT', 'REFUND', 'DEPOSIT'
      reference_type: { type: Sequelize.STRING }, // e.g., 'orders', 'payment_refunds'
      reference_id: { type: Sequelize.UUID },
      status: { type: Sequelize.STRING }, // e.g., 'PENDING', 'COMPLETED', 'FAILED'
      created_at: { type: Sequelize.DATE }
    }, { timestamps: true, createdAt: 'created_at', updatedAt: false });

    /**
     * CAMPAIGNS Model (e.g., Flash Sales, 11.11, Seasonal)
     */
    models.campaigns = await sequelize.define('campaigns', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      title: { type: Sequelize.STRING, allowNull: false },
      slug: { type: Sequelize.STRING, unique: true },
      banner_url: { type: Sequelize.TEXT },
      is_active: { type: Sequelize.BOOLEAN, defaultValue: true },
      start_date: { type: Sequelize.DATE },
      end_date: { type: Sequelize.DATE }
    }, { timestamps: false });

    /**
     * CAMPAIGN_PRODUCTS Model (Junction Table)
     */
    models.campaign_products = await sequelize.define('campaign_products', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      campaign_id: { type: Sequelize.UUID, allowNull: false },
      product_id: { type: Sequelize.UUID, allowNull: false },
      discount_override: { type: Sequelize.FLOAT }, // Special discount just for this campaign
      sort_order: { type: Sequelize.INTEGER }
    }, { timestamps: false });

    /**
     * ORDERS Model
     */
    models.orders = await sequelize.define('orders', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      user_id: { type: Sequelize.UUID, allowNull: false },
      address_id: { type: Sequelize.UUID, allowNull: false },
      order_number: { type: Sequelize.STRING, unique: true },
      status: { type: Sequelize.STRING },
      subtotal: { type: Sequelize.FLOAT },
      discount_amount: { type: Sequelize.FLOAT },
      shipping_fee: { type: Sequelize.FLOAT },
      total_amount: { type: Sequelize.FLOAT },
      payment_method: { type: Sequelize.STRING },
      payment_status: { type: Sequelize.STRING },
      voucher_id: { type: Sequelize.UUID },
      notes: { type: Sequelize.STRING },
      placed_at: { type: Sequelize.DATE },
      updated_at: { type: Sequelize.DATE }
    }, { timestamps: true, createdAt: 'placed_at', updatedAt: 'updated_at' });

    /**
     * ORDER_ITEMS Model
     */
    models.order_items = await sequelize.define('order_items', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      order_id: { type: Sequelize.UUID, allowNull: false },
      variant_id: { type: Sequelize.UUID, allowNull: false },
      seller_id: { type: Sequelize.UUID, allowNull: false },
      quantity: { type: Sequelize.INTEGER },
      unit_price: { type: Sequelize.FLOAT },
      discount: { type: Sequelize.FLOAT },
      subtotal: { type: Sequelize.FLOAT },
      status: { type: Sequelize.STRING }
    }, { timestamps: false });

    /**
     * PAYMENTS Model
     */
    models.payments = await sequelize.define('payments', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      order_id: { type: Sequelize.UUID, allowNull: false },
      method: { type: Sequelize.STRING },
      gateway: { type: Sequelize.STRING },
      transaction_id: { type: Sequelize.STRING, unique: true },
      amount: { type: Sequelize.FLOAT },
      currency: { type: Sequelize.STRING },
      status: { type: Sequelize.STRING },
      failure_reason: { type: Sequelize.STRING },
      paid_at: { type: Sequelize.DATE },
      created_at: { type: Sequelize.DATE }
    }, { timestamps: true, createdAt: 'created_at', updatedAt: false });

    /**
     * PAYMENT_REFUNDS Model
     */
    models.payment_refunds = await sequelize.define('payment_refunds', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      payment_id: { type: Sequelize.UUID, allowNull: false },
      amount: { type: Sequelize.FLOAT },
      reason: { type: Sequelize.STRING },
      status: { type: Sequelize.STRING },
      gateway_refund_id: { type: Sequelize.STRING },
      refunded_at: { type: Sequelize.DATE }
    }, { timestamps: false });

    /**
     * SHIPMENTS Model
     */
    models.shipments = await sequelize.define('shipments', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      order_id: { type: Sequelize.UUID, allowNull: false },
      seller_id: { type: Sequelize.UUID, allowNull: false },
      courier_name: { type: Sequelize.STRING },
      tracking_number: { type: Sequelize.STRING, unique: true },
      status: { type: Sequelize.STRING },
      pickup_at: { type: Sequelize.DATE },
      dispatched_at: { type: Sequelize.DATE },
      delivered_at: { type: Sequelize.DATE },
      estimated_at: { type: Sequelize.DATE }
    }, { timestamps: false });

    /**
     * SHIPMENT_EVENTS Model
     */

    //Used for tracking DISPATCHED OR DELIVERED the history and timeline of a shipment's progress.
    models.shipment_events = await sequelize.define('shipment_events', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      shipment_id: { type: Sequelize.UUID, allowNull: false },
      event_type: { type: Sequelize.STRING },
      location: { type: Sequelize.STRING },
      description: { type: Sequelize.STRING },
      occurred_at: { type: Sequelize.DATE }
    }, { timestamps: false });

    /**
     * RETURNS Model
     */
    models.returns = await sequelize.define('returns', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      order_id: { type: Sequelize.UUID, allowNull: false },
      order_item_id: { type: Sequelize.UUID, allowNull: false },
      user_id: { type: Sequelize.UUID, allowNull: false },
      reason: { type: Sequelize.STRING },
      description: { type: Sequelize.STRING },
      status: { type: Sequelize.STRING },
      resolution: { type: Sequelize.STRING },
      refund_amount: { type: Sequelize.FLOAT },
      requested_at: { type: Sequelize.DATE },
      resolved_at: { type: Sequelize.DATE }
    }, { timestamps: false });

    /**
     * REVIEWS Model
     */
    models.reviews = await sequelize.define('reviews', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      user_id: { type: Sequelize.UUID, allowNull: false },
      product_id: { type: Sequelize.UUID, allowNull: false },
      order_item_id: { type: Sequelize.UUID, allowNull: false },
      rating: { type: Sequelize.INTEGER },
      comment: { type: Sequelize.TEXT },
      is_verified_purchase: { type: Sequelize.BOOLEAN, defaultValue: false },
      helpful_count: { type: Sequelize.INTEGER, defaultValue: 0 },
      created_at: { type: Sequelize.DATE }
    }, { timestamps: true, createdAt: 'created_at', updatedAt: false });

    /**
     * REVIEW_IMAGES Model
     */
    models.review_images = await sequelize.define('review_images', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      review_id: { type: Sequelize.UUID, allowNull: false },
      url: { type: Sequelize.TEXT }
    }, { timestamps: false });

    /**
     * NOTIFICATIONS Model
     */
    models.notifications = await sequelize.define('notifications', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      user_id: { type: Sequelize.UUID, allowNull: false },
      type: { type: Sequelize.STRING },
      title: { type: Sequelize.STRING },
      body: { type: Sequelize.TEXT },
      reference_type: { type: Sequelize.STRING },
      reference_id: { type: Sequelize.UUID },
      is_read: { type: Sequelize.BOOLEAN, defaultValue: false },
      sent_at: { type: Sequelize.DATE }
    }, { timestamps: true, createdAt: 'sent_at', updatedAt: false });

    /**
     * SELLER_SETTLEMENTS Model
     */
    models.seller_settlements = await sequelize.define('seller_settlements', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      seller_id: { type: Sequelize.UUID, allowNull: false },
      gross_amount: { type: Sequelize.FLOAT },
      commission: { type: Sequelize.FLOAT },
      net_amount: { type: Sequelize.FLOAT },
      status: { type: Sequelize.STRING },
      bank_reference: { type: Sequelize.STRING },
      period_start: { type: Sequelize.DATE },
      period_end: { type: Sequelize.DATE },
      settled_at: { type: Sequelize.DATE }
    }, { timestamps: false });

    // Relationships
    models.users.hasMany(models.user_sessions, { foreignKey: 'user_id' });
    models.user_sessions.belongsTo(models.users, { foreignKey: 'user_id' });

    models.users.hasMany(models.addresses, { foreignKey: 'user_id' });
    models.addresses.belongsTo(models.users, { foreignKey: 'user_id' });

    models.users.hasMany(models.orders, { foreignKey: 'user_id' });
    models.orders.belongsTo(models.users, { foreignKey: 'user_id' });

    models.users.hasMany(models.reviews, { foreignKey: 'user_id' });
    models.reviews.belongsTo(models.users, { foreignKey: 'user_id' });

    models.users.hasMany(models.wishlists, { foreignKey: 'user_id' });
    models.wishlists.belongsTo(models.users, { foreignKey: 'user_id' });

    models.users.hasMany(models.notifications, { foreignKey: 'user_id' });
    models.notifications.belongsTo(models.users, { foreignKey: 'user_id' });

    models.users.hasOne(models.wallets, { foreignKey: 'user_id' });
    models.wallets.belongsTo(models.users, { foreignKey: 'user_id' });

    models.wallets.hasMany(models.wallet_transactions, { foreignKey: 'wallet_id' });
    models.wallet_transactions.belongsTo(models.wallets, { foreignKey: 'wallet_id' });

    models.users.hasMany(models.product_questions, { foreignKey: 'user_id' });
    models.product_questions.belongsTo(models.users, { foreignKey: 'user_id' });

    models.users.hasMany(models.shop_followers, { foreignKey: 'user_id' });
    models.shop_followers.belongsTo(models.users, { foreignKey: 'user_id' });

    models.users.hasOne(models.sellers, { as: 'OwnedShop', foreignKey: 'user_id' });
    models.sellers.belongsTo(models.users, { as: 'Owner', foreignKey: 'user_id' });

    // Junction Table Relationships for Staff
    models.users.hasMany(models.seller_staff, { foreignKey: 'user_id' });
    models.seller_staff.belongsTo(models.users, { foreignKey: 'user_id' });
    models.sellers.hasMany(models.seller_staff, { foreignKey: 'seller_id' });
    models.seller_staff.belongsTo(models.sellers, { foreignKey: 'seller_id' });

    // Many-to-Many through Junction Table
    models.users.belongsToMany(models.sellers, { through: models.seller_staff, foreignKey: 'user_id', otherKey: 'seller_id', as: 'Workplaces' });
    models.sellers.belongsToMany(models.users, { through: models.seller_staff, foreignKey: 'seller_id', otherKey: 'user_id', as: 'StaffList' });

    models.users.hasMany(models.returns, { foreignKey: 'user_id' });
    models.returns.belongsTo(models.users, { foreignKey: 'user_id' });

    models.sellers.hasMany(models.products, { foreignKey: 'seller_id' });
    models.products.belongsTo(models.sellers, { foreignKey: 'seller_id' });

    models.sellers.hasMany(models.order_items, { foreignKey: 'seller_id' });
    models.order_items.belongsTo(models.sellers, { foreignKey: 'seller_id' });

    models.sellers.hasMany(models.shipments, { foreignKey: 'seller_id' });
    models.shipments.belongsTo(models.sellers, { foreignKey: 'seller_id' });

    models.sellers.hasMany(models.seller_settlements, { foreignKey: 'seller_id' });
    models.seller_settlements.belongsTo(models.sellers, { foreignKey: 'seller_id' });

    models.sellers.hasMany(models.vouchers, { foreignKey: 'seller_id' });
    models.vouchers.belongsTo(models.sellers, { foreignKey: 'seller_id' });

    models.sellers.hasMany(models.shop_followers, { foreignKey: 'seller_id' });
    models.shop_followers.belongsTo(models.sellers, { foreignKey: 'seller_id' });

    models.products.hasMany(models.product_questions, { foreignKey: 'product_id' });
    models.product_questions.belongsTo(models.products, { foreignKey: 'product_id' });

    models.products.hasMany(models.product_variants, { foreignKey: 'product_id' });
    models.product_variants.belongsTo(models.products, { foreignKey: 'product_id' });

    models.campaigns.belongsToMany(models.products, { through: models.campaign_products, foreignKey: 'campaign_id', otherKey: 'product_id' });
    models.products.belongsToMany(models.campaigns, { through: models.campaign_products, foreignKey: 'product_id', otherKey: 'campaign_id' });

    models.categories.hasMany(models.categories, { as: 'SubCategories', foreignKey: 'parent_id' });
    models.categories.belongsTo(models.categories, { as: 'ParentCategory', foreignKey: 'parent_id' });

    models.categories.hasMany(models.products, { foreignKey: 'category_id' });
    models.products.belongsTo(models.categories, { foreignKey: 'category_id' });

    models.brands.hasMany(models.products, { foreignKey: 'brand_id' });
    models.products.belongsTo(models.brands, { foreignKey: 'brand_id' });

    models.products.hasMany(models.product_images, { foreignKey: 'product_id' });
    models.product_images.belongsTo(models.products, { foreignKey: 'product_id' });

    models.products.hasMany(models.product_attributes, { foreignKey: 'product_id' });
    models.product_attributes.belongsTo(models.products, { foreignKey: 'product_id' });

    models.products.hasMany(models.product_variants, { foreignKey: 'product_id' });
    models.product_variants.belongsTo(models.products, { foreignKey: 'product_id' });

    models.products.hasMany(models.reviews, { foreignKey: 'product_id' });
    models.reviews.belongsTo(models.products, { foreignKey: 'product_id' });

    models.products.hasMany(models.wishlists, { foreignKey: 'product_id' });
    models.wishlists.belongsTo(models.products, { foreignKey: 'product_id' });

    models.product_variants.hasMany(models.order_items, { foreignKey: 'variant_id' });
    models.order_items.belongsTo(models.product_variants, { foreignKey: 'variant_id' });

    models.product_variants.hasMany(models.inventory, { foreignKey: 'variant_id' });
    models.inventory.belongsTo(models.product_variants, { foreignKey: 'variant_id' });

    models.orders.hasMany(models.order_items, { foreignKey: 'order_id' });
    models.order_items.belongsTo(models.orders, { foreignKey: 'order_id' });

    models.orders.hasOne(models.payments, { foreignKey: 'order_id' });
    models.payments.belongsTo(models.orders, { foreignKey: 'order_id' });

    models.orders.hasMany(models.shipments, { foreignKey: 'order_id' });
    models.shipments.belongsTo(models.orders, { foreignKey: 'order_id' });

    models.orders.hasMany(models.returns, { foreignKey: 'order_id' });
    models.returns.belongsTo(models.orders, { foreignKey: 'order_id' });

    models.orders.belongsTo(models.addresses, { foreignKey: 'address_id' });
    models.orders.belongsTo(models.vouchers, { foreignKey: 'voucher_id' });

    models.order_items.hasMany(models.returns, { foreignKey: 'order_item_id' });
    models.returns.belongsTo(models.order_items, { foreignKey: 'order_item_id' });

    models.order_items.hasOne(models.reviews, { foreignKey: 'order_item_id' });
    models.reviews.belongsTo(models.order_items, { foreignKey: 'order_item_id' });

    models.payments.hasMany(models.payment_refunds, { foreignKey: 'payment_id' });
    models.payment_refunds.belongsTo(models.payments, { foreignKey: 'payment_id' });

    models.shipments.hasMany(models.shipment_events, { foreignKey: 'shipment_id' });
    models.shipment_events.belongsTo(models.shipments, { foreignKey: 'shipment_id' });

    models.reviews.hasMany(models.review_images, { foreignKey: 'review_id' });
    models.review_images.belongsTo(models.reviews, { foreignKey: 'review_id' });

    // Additional Relationships from ERD
    models.orders.hasMany(models.returns, { foreignKey: 'order_id' });
    models.returns.belongsTo(models.orders, { foreignKey: 'order_id' });

    models.order_items.hasMany(models.returns, { foreignKey: 'order_item_id' });
    models.returns.belongsTo(models.order_items, { foreignKey: 'order_item_id' });

    cachedModels = models;
    return models;
  } catch (error) {
    console.error('Error defining models:', error);
    throw error;
  }
};

exports.sequelize = sequelize;
exports.dbSync = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected.');
    await exports.Models();
    // Move sync here so it only happens once on startup
    await sequelize.sync({ force: false, alter: true });
    console.log('Database synchronized.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    if (process.env.NODE_ENV === 'test') {
      throw error;
    }
    process.exit(1);
  }
};
