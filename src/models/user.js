const { connectionPool } = require('../db');

// Function to find a user by email
const findUserByEmail = async (email) => {
    const [rows] = await connectionPool.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
};

const getAllUsers = async () => {
    const [rows, fields] = await connectionPool.query('SELECT * FROM users');
    // Filter out role, password, token
    return Object.values(rows).map(user => ({
        id: user.id,
        name: user.name,
        email: user.email
    }));
}

// Function to create a new user
const createUser = async (name, email, hashedPassword) => {
    try {
        return await connectionPool.query('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, hashedPassword]);
    } catch (error) {
        throw new Error('Error creating user');
    }
};

// Function to create a new admin
const createAdmin = async (name, email, hashedPassword) => {
    try {
        return await connectionPool.query('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)', [name, email, hashedPassword, 'ADMIN']);
    } catch (error) {
        throw new Error('Error creating user');
    }
};

// Function to find user by ID
const findUserById = async (id) => {
    const [rows] = await connectionPool.query('SELECT * FROM users WHERE id = ?', [id]);
    return rows[0];
};

// Function to update user details
const updateUserById = async (id, name, email) => {
    return connectionPool.query('UPDATE users SET name = ?, email = ? WHERE id = ?', [name, email, id]);
};

// Function to delete user
const deleteUserById = async (id) => {
    await connectionPool.query('DELETE FROM users WHERE id = ?', [id]);
};

module.exports = {
    findUserByEmail,
    getAllUsers,
    createUser,
    createAdmin,
    findUserById,
    updateUserById,
    deleteUserById
};
