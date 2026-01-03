import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import db from '../database/db.js';

const router = express.Router();

// Sign Up
router.post(
  '/signup',
  [
    body('employee_id').notEmpty().withMessage('Employee ID is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain uppercase, lowercase, and number'),
    body('role').isIn(['employee', 'hr']).withMessage('Role must be employee or hr'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { employee_id, email, password, role } = req.body;

      // Check if user exists
      const existingUser = db
        .prepare('SELECT * FROM users WHERE email = ? OR employee_id = ?')
        .get(email, employee_id);

      if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const result = db
        .prepare(
          'INSERT INTO users (employee_id, email, password, role) VALUES (?, ?, ?, ?)'
        )
        .run(employee_id, email, hashedPassword, role);

      // Create basic profile
      db.prepare(
        'INSERT INTO employee_profiles (user_id, first_name, last_name) VALUES (?, ?, ?)'
      ).run(result.lastInsertRowid, 'New', 'User');

      res.status(201).json({
        message: 'User created successfully. Please verify your email.',
        userId: result.lastInsertRowid,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Sign In
router.post(
  '/signin',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;

      // Find user
      const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;

      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Check password
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Generate token
      const secret = process.env.JWT_SECRET || 'your-secret-key';
      const token = jwt.sign(
        { userId: user.id, role: user.role, email: user.email },
        secret,
        { expiresIn: '7d' }
      );

      // Get user profile
      const profile = db
        .prepare('SELECT * FROM employee_profiles WHERE user_id = ?')
        .get(user.id) as any;

      res.json({
        token,
        user: {
          id: user.id,
          employee_id: user.employee_id,
          email: user.email,
          role: user.role,
          profile,
        },
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Get current user
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const secret = process.env.JWT_SECRET || 'your-secret-key';
    const decoded = jwt.verify(token, secret) as any;

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(decoded.userId) as any;
    const profile = db
      .prepare('SELECT * FROM employee_profiles WHERE user_id = ?')
      .get(decoded.userId) as any;

    res.json({
      user: {
        id: user.id,
        employee_id: user.employee_id,
        email: user.email,
        role: user.role,
        profile,
      },
    });
  } catch (error: any) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

export default router;

