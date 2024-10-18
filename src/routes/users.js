const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { findUserByEmail, createUser, createAdmin, findUserById, updateUserById, deleteUserById, getAllUsers} = require('../models/user');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const { body, param, validationResult, matchedData } = require('express-validator');

const router = express.Router();
const logger = require('../logger');

// Request parameter validators
const validateNameChain = () => body('name')
    .notEmpty().withMessage('Name must not be empty')
    .isString().withMessage("Name must be a string");

const validateEmailChain = () => body('email')
    .notEmpty().withMessage('Email must not be empty')
    .isEmail().withMessage("Must be a valid email address")
    .normalizeEmail();

const validatePasswordChain = () => body('password')
    .notEmpty().withMessage("Password must not be empty")
    .isString().withMessage("Password must be a string");

const validateIdChain = () => param('id')
    .notEmpty().withMessage('ID must not be empty')
    .isInt({ min: 1 }).withMessage('ID must be a number greater than or equal to 1')
    .toInt();

const validateAdminRoleChain = () => body('is_admin')
    .isBoolean().withMessage('Is admin must be boolean');

// Register a new user validate name, email and password - TODO check email is not in use
router.post('/register', validateNameChain(), validateEmailChain(), validatePasswordChain(), validateAdminRoleChain(),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const sanitizedRequestData = matchedData(req);
        const hashedPassword = await bcrypt.hash(sanitizedRequestData.password, 10);

        try {
            sanitizedRequestData.is_admin ? await createAdmin(sanitizedRequestData.name, sanitizedRequestData.email, hashedPassword) : await createUser(sanitizedRequestData.name, sanitizedRequestData.email, hashedPassword);
            res.status(201).json({ message: 'User created successfully' });
        } catch (error) {
            logger.error(error);
            res.status(400).json({ error: 'User already exists or invalid data' });
        }
    });

// Login and get token validate email and password
router.post('/login', validateEmailChain(), validatePasswordChain(),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const sanitizedRequestData = matchedData(req);
        const user = await findUserByEmail(sanitizedRequestData.email);

        if (!user || !await bcrypt.compare(sanitizedRequestData.password, user.password)) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const accessToken = jwt.sign({ id: user.id, role: user.role }, 'jwt_secret');
        res.json({ accessToken });
    });

// Get all users (ADMIN only)
router.get('/', authenticateToken, authorizeRole('ADMIN'),
    async (req, res) => {
        res.json({"users": await getAllUsers()});
    });

// Get user by ID (USER/ADMIN) validate id is a number >= 1
router.get('/:id', validateIdChain(), authenticateToken,
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const sanitizedRequestData = matchedData(req);
        const user = await findUserById(sanitizedRequestData.id);

        if (!user) {
            return res.sendStatus(404);
        }

        // Current user cannot get data from another user
        if (req.user.role === 'USER' && req.user.id !== sanitizedRequestData.id) {
            return res.sendStatus(403);
        }

        res.json(user);
    });

// Update user (USER can update self; ADMIN can update anyone) validate id is a number >= 1
router.put('/:id', validateIdChain(), validateNameChain(), validateEmailChain(), authenticateToken,
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            logger.error(errors);
            return res.status(400).json({ errors: errors.array() });
        }
        const sanitizedRequestData = matchedData(req);

        const user = await findUserById(sanitizedRequestData.id);
        if (!user) return res.sendStatus(404);

        if (req.user.role === 'USER' && req.user.id !== sanitizedRequestData.id) return res.sendStatus(403);

        await updateUserById(sanitizedRequestData.id, sanitizedRequestData.name, sanitizedRequestData.email);
        res.json({ message: 'User updated' });
    });

// Delete user (ADMIN only, but cannot delete self) validate id is a number >= 1
router.delete('/:id', validateIdChain(), authenticateToken, authorizeRole('ADMIN'),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const sanitizedRequestData = matchedData(req);
        if (req.user.id === sanitizedRequestData.id) return res.status(400).json({ error: 'You cannot delete yourself' });

        const user = await findUserById(sanitizedRequestData.id);
        if (!user) return res.sendStatus(404);

        await deleteUserById(sanitizedRequestData.id);
        res.json({ message: 'User deleted' });
    });

module.exports = router;
