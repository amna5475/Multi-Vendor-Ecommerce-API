const fs = require('fs');
const path = require('path');

const statusPath = path.join(__dirname, '.db-status');
const hasDatabase = fs.existsSync(statusPath) && fs.readFileSync(statusPath, 'utf8').trim() === '1';

const describeIfDb = hasDatabase ? describe : describe.skip;

module.exports = {
  hasDatabase,
  describeIfDb
};
