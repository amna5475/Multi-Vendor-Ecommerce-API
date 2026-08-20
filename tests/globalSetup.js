const fs = require('fs');
const path = require('path');

module.exports = async () => {
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret_for_jest_suite';
  process.env.POSTGRES_DBNAME = process.env.POSTGRES_DBNAME || 'ecommerce';
  process.env.POSTGRES_USERNAME = process.env.POSTGRES_USERNAME || 'postgres';
  process.env.POSTGRES_PASS = process.env.POSTGRES_PASS || 'postgres';
  process.env.POSTGRES_HOST = process.env.POSTGRES_HOST || 'localhost';
  process.env.POSTGRES_PORT = process.env.POSTGRES_PORT || '5432';
  process.env.REDIS_HOST = process.env.REDIS_HOST || 'localhost';
  process.env.REDIS_PORT = process.env.REDIS_PORT || '6379';
  process.env.RATE_LIMIT_AUTH_WINDOW = '60';
  process.env.RATE_LIMIT_AUTH_MAX = '1000';
  process.env.RATE_LIMIT_API_WINDOW = '60';
  process.env.RATE_LIMIT_API_MAX = '1000';

  // Clear node-config cache concerns by ensuring env is ready before DB probe
  const { isDatabaseAvailable } = require('./helpers/testUtils');
  const available = await isDatabaseAvailable();
  const statusPath = path.join(__dirname, '.db-status');
  fs.writeFileSync(statusPath, available ? '1' : '0');

  if (!available) {
    // eslint-disable-next-line no-console
    console.warn('\n[jest] PostgreSQL unavailable — integration tests will be skipped.\n');
  }
};
