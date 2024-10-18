const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createUser, createAdmin, findUserByEmail } = require('../src/models/user');
const jwtSecret = 'jwt_secret';

// Helper function to create a test user in the database
async function createTestUser(name, email, password, role = 'USER') {
    const hashedPassword = await bcrypt.hash(password, 10);

    if (role === 'ADMIN') {
        await createAdmin(name, email, hashedPassword);
    } else {
        await createUser(name, email, hashedPassword);
    }

    return await findUserByEmail(email);
}

// Helper function to generate a JWT token for a user
function generateToken(user) {
    return jwt.sign({ id: user.id, role: user.role }, jwtSecret);
}

// Helper function to set up test users before tests
async function setupTestUsers() {
    // Create an admin user
    const adminUser = await createTestUser('Admin User', 'admin@example.com', 'adminpass', 'ADMIN');
    const adminToken = generateToken(adminUser);

    // Create a regular user
    const regularUser = await createTestUser('Regular User', 'user@example.com', 'userpass');
    const regularUserToken = generateToken(regularUser);
    return { adminUser: adminUser, adminToken: adminToken, regularUser: regularUser, regularUserToken: regularUserToken };
}

module.exports = {
    setupTestUsers
};
