const { Sequelize } = require('sequelize');
const config = require('config');

/**
 * Returns true when PostgreSQL is reachable for integration tests.
 */
const isDatabaseAvailable = async () => {
  const database = config.get('database');
  const sequelize = new Sequelize(database.dbName, database.username, database.password, {
    host: database.host,
    port: database.port,
    dialect: 'postgres',
    logging: false
  });

  try {
    await sequelize.authenticate();
    await sequelize.close();
    return true;
  } catch (error) {
    await sequelize.close().catch(() => {});
    return false;
  }
};

const uniqueSuffix = () => `${Date.now()}_${Math.floor(Math.random() * 100000)}`;

module.exports = {
  isDatabaseAvailable,
  uniqueSuffix
};
