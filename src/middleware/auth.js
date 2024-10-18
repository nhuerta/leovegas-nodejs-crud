const jwt = require('jsonwebtoken');
const { connectionPool } = require('../db');
const logger = require('../logger');
// Authentication middleware
const authenticateToken = async (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) return res.sendStatus(401);

    try {
        const user = jwt.verify(token, 'jwt_secret');

        const [rows] = await connectionPool.query('SELECT * FROM users WHERE id = ?', [user.id]);
        if (rows.length === 0) return res.sendStatus(403);

        req.user = rows[0];
        next();
    } catch (err) {
        return res.sendStatus(403);
    }
};

// Role-based authorization
const authorizeRole = (role) => {
    return (req, res, next) => {
        if (req.user.role !== role) {
            return res.sendStatus(403);
        }
        next();
    };
};

module.exports = { authenticateToken, authorizeRole };
