const mysql = require('mysql2/promise');

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'leovegas_nodejs_crud'
};

const connectionPool = mysql.createPool(dbConfig);

module.exports = {
    connectionPool
};
