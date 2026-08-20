const fs = require('fs');
const path = require('path');

module.exports = async () => {
  const statusPath = path.join(__dirname, '.db-status');
  if (fs.existsSync(statusPath)) {
    fs.unlinkSync(statusPath);
  }
};
