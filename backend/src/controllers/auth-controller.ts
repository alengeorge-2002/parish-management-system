import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { pool } from '../config/db';
import { generateAccessKey } from '../utils/crypto-utils';

const JWT_SECRET = process.env.JWT_SECRET || 'parish_management_secret_key';

/**
 * Verifies an access key against PostgreSQL app_users table and signs a JWT if matched.
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { accessKey, access_key } = req.body;
    const key = accessKey || access_key;

    if (!key) {
      res.status(400).json({ error: 'Access key is required' });
      return;
    }

    const result = await pool.query(
      `SELECT u.id, u.member_id, u.access_key, u.role,
              m.first_name, m.last_name, m.email, m.phone_number
       FROM app_users u
       LEFT JOIN members m ON u.member_id = m.id
       WHERE u.access_key = $1`,
      [key.trim()]
    );

    if (result.rows.length === 0) {
      res.status(401).json({ error: 'Invalid access key' });
      return;
    }

    const appUser = result.rows[0];
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
