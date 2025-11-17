const path = require('path');

module.exports = {
  client: 'sqlite3',
  connection: {
    filename: path.join(__dirname, '../database/qadash.db')
  },
  useNullAsDefault: true,
  migrations: {
    directory: path.join(__dirname, '../database/migrations')
  }
};
