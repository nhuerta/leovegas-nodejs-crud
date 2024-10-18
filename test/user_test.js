const request = require('supertest');
const { expect } = require('chai');
const app = require('../src/app');
const { setupTestUsers } = require('./helper');
const { connectionPool } = require('../src/db');

describe('User API', function () {
    let adminToken, userToken, adminId, regularUserId;

    before(async function () {
        await connectionPool.query('DELETE FROM users');
        let testUserData = await setupTestUsers();
        adminToken = testUserData.adminToken;
        userToken = testUserData.regularUserToken;
        adminId = testUserData.adminUser.id;
        regularUserId = testUserData.regularUser.id;
    });

    describe('POST /users/register', function () {
        it('should register a new user', async function () {
            const res = await request(app)
                .post('/users/register')
                .send({ name: 'John', email: 'john@example.com', password: 'password123', is_admin: false });

            expect(res.status).to.equal(201);
            expect(res.body).to.have.property('message', 'User created successfully');
        });

        it('should return 400 for missing fields', async function () {
            const res = await request(app)
                .post('/users/register')
                .send({ name: '', email: '', password: '' });

            expect(res.status).to.equal(400);
            expect(res.body.errors).to.be.an('array');
        });
    });

    describe('POST /users/login', function () {
        it('should log in and return a token', async function () {
            const res = await request(app)
                .post('/users/login')
                .send({ email: 'john@example.com', password: 'password123' });

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('accessToken');
        });

        it('should return 401 for invalid credentials', async function () {
            const res = await request(app)
                .post('/users/login')
                .send({ email: 'wrong@example.com', password: 'password123' });

            expect(res.status).to.equal(401);
            expect(res.body).to.have.property('error', 'Invalid email or password');
        });
    });

    describe('GET /users', function () {
        it('should allow admin to get all users', async function () {
            const res = await request(app)
                .get('/users')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('users');
        });

        it('should forbid non-admin users', async function () {
            const res = await request(app)
                .get('/users')
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.status).to.equal(403);
        });
    });

    describe('GET /users/:id', function () {
        it('should get a user by ID', async function () {
            const res = await request(app)
                .get('/users/' + regularUserId)
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('id', regularUserId);
        });

        it('should return 403 if a user tries to get another user\'s data', async function () {
            const res = await request(app)
                .get('/users/' + adminId)
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.status).to.equal(403);
        });
    });

    describe('PUT /users/:id', function () {
        it('should update a user (self-update)', async function () {
            const res = await request(app)
                .put('/users/' + regularUserId)
                .set('Authorization', `Bearer ${userToken}`)
                .send({ name: 'John Updated', email: 'john_updated@example.com' });

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('message', 'User updated');
        });

        it('should forbid user updating another user', async function () {
            const res = await request(app)
                .put('/users/' + adminId)
                .set('Authorization', `Bearer ${userToken}`)
                .send({ name: 'John Updated', email: 'john_updated@example.com' });

            expect(res.status).to.equal(403);
        });
    });

    describe('DELETE /users/:id', function () {
        it('should delete a user (admin)', async function () {
            const res = await request(app)
                .delete('/users/' + regularUserId)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('message', 'User deleted');
        });

        it('should not allow admin to delete self', async function () {
            const res = await request(app)
                .delete('/users/' + adminId)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.status).to.equal(400);
            expect(res.body).to.have.property('error', 'You cannot delete yourself');
        });
    });
});

