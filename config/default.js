require('dotenv').config();

module.exports = {
  app: {
    port: process.env.PORT || 3000,
    jwt_secret: process.env.JWT_SECRET || '',
    jwt_expiration: '24h'
  },
  database: {
    dbName: process.env.POSTGRES_DBNAME,
    username: process.env.POSTGRES_USERNAME,
    password: process.env.POSTGRES_PASS,
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT,
    dialect: 'postgres',
    settings: {
      dbConnections: {
        max: 5,
        min: 0
      },
      idleTime: 10000,
      acquireDB: 30000,
      evictDB: 1000
    }
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: Number(process.env.REDIS_PORT || 6379),
    password: process.env.REDIS_PASSWORD || undefined,
    // Cache TTLs (seconds)
    productListTtl: Number(process.env.REDIS_PRODUCT_LIST_TTL || 60),
    productDetailTtl: Number(process.env.REDIS_PRODUCT_DETAIL_TTL || 120),
    categoryTtl: Number(process.env.REDIS_CATEGORY_TTL || 300)
  },
  rateLimit: {
    authWindowSeconds: Number(process.env.RATE_LIMIT_AUTH_WINDOW || 900),
    authMaxRequests: Number(process.env.RATE_LIMIT_AUTH_MAX || 20),
    apiWindowSeconds: Number(process.env.RATE_LIMIT_API_WINDOW || 60),
    apiMaxRequests: Number(process.env.RATE_LIMIT_API_MAX || 120)
  },
  cloudinary: {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  }
};
