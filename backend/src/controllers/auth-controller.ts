import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { pool } from '../config/db';
import { generateAccessKey } from '../utils/crypto-utils';

const JWT_SECRET = process.env.JWT_SECRET || 'parish_management_secret_key';

let appUsersSchemaEnsured = false;
const ensureAppUsersSchema = async () => {
  if (appUsersSchemaEnsured) return;
  try {
    await pool.query(`ALTER TABLE app_users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);`);
    appUsersSchemaEnsured = true;
  } catch (err) {
    console.warn('Could not ensure app_users schema in auth-controller:', err);
  }
};

/**
 * Verifies credentials (access key or member phone number + password) against PostgreSQL app_users table and signs a JWT if matched.
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    await ensureAppUsersSchema();
    const {
      accessKey,
      access_key,
      key,
      identifier,
      username,
      phone,
      phoneNumber,
      phone_number,
      password,
    } = req.body;

    const rawId = (accessKey || access_key || key || identifier || username || phone || phoneNumber || phone_number || '').trim();

    if (!rawId) {
      res.status(400).json({ error: 'Access key or phone number is required' });
      return;
    }

    const cleanPhone = rawId.replace(/\s+/g, '').replace(/-/g, '').replace(/^\+91/, '');

    const result = await pool.query(
      `SELECT u.id, u.member_id, u.access_key, u.role, u.password_hash,
              m.first_name, m.last_name, m.email, m.phone_number
       FROM app_users u
       LEFT JOIN members m ON u.member_id = m.id
       WHERE u.access_key = $1
          OR m.phone_number = $1
          OR REPLACE(REPLACE(REPLACE(m.phone_number, ' ', ''), '-', ''), '+91', '') = $2
       ORDER BY (u.password_hash IS NOT NULL) DESC, u.id ASC
       LIMIT 1`,
      [rawId, cleanPhone]
    );

    if (result.rows.length === 0) {
      res.status(401).json({ error: 'Invalid access key or credentials' });
      return;
    }

    const appUser = result.rows[0];

    // Password verification logic
    if (appUser.password_hash) {
      const pwd = (password !== undefined && password !== null) ? String(password).trim() : '';
      if (!pwd) {
        // If password was omitted in body, check if rawId itself matches the password_hash
        const keyMatch = await bcrypt.compare(rawId, appUser.password_hash);
        if (!keyMatch) {
          res.status(401).json({ error: 'Password is required' });
          return;
        }
      } else {
        const isMatch = await bcrypt.compare(pwd, appUser.password_hash);
        if (!isMatch) {
          res.status(401).json({ error: 'Invalid password' });
          return;
        }
      }
    } else {
      // Legacy / demo access key user without password_hash (e.g. admin123, user123)
      if (password && typeof password === 'string' && password.trim()) {
        if (password.trim() !== appUser.access_key && rawId !== appUser.access_key) {
          res.status(401).json({ error: 'Invalid credentials' });
          return;
        }
      }
    }

    const memberIdStr = appUser.member_id ? String(appUser.member_id) : null;
    const userIdStr = String(appUser.id);

    // Sign the token with no expiration to allow infinite login as expected by mobile PWA
    const token = jwt.sign(
      {
        userId: userIdStr,
        memberId: memberIdStr,
        role: appUser.role,
        firstName: appUser.first_name || '',
        lastName: appUser.last_name || '',
      },
      JWT_SECRET
    );

    res.status(200).json({
      message: 'Authentication successful',
      token,
      user: {
        id: userIdStr,
        memberId: memberIdStr,
        role: appUser.role,
        firstName: appUser.first_name || '',
        lastName: appUser.last_name || '',
        email: appUser.email || null,
        phoneNumber: appUser.phone_number || null,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Endpoint helper to generate a new unique, secure alphanumeric access key.
 */
export const generateKey = async (req: Request, res: Response): Promise<void> => {
  try {
    const lengthQuery = req.query.length ? parseInt(req.query.length as string, 10) : 12;
    const accessKey = generateAccessKey(isNaN(lengthQuery) ? 12 : lengthQuery);
    res.status(200).json({ accessKey });
  } catch (error) {
    console.error('Generate access key error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
