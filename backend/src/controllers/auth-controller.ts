import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { AppUser } from '../models';
import { generateAccessKey } from '../utils/crypto-utils';

const JWT_SECRET = process.env.JWT_SECRET || 'parish_management_secret_key';

/**
 * Verifies an access key against the database and signs an infinite JWT if matched.
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { accessKey } = req.body;

    if (!accessKey) {
      res.status(400).json({ error: 'Access key is required' });
      return;
    }

    const appUser = await AppUser.findOne({ access_key: accessKey }).populate('member_id');
    console.log('Received login request with accessKey:', accessKey);
    console.log('DB query found user:', !!appUser);

    if (!appUser) {
      res.status(401).json({ error: 'Invalid access key' });
      return;
    }

    const member: any = appUser.member_id;
    const memberIdStr = member?._id ? member._id.toString() : (member?.id || null);
    const userIdStr = appUser._id.toString();

    // Sign the token with absolutely NO expiration parameter to allow infinite login
    const token = jwt.sign(
      {
        userId: userIdStr,
        memberId: memberIdStr,
        role: appUser.role,
        firstName: member?.first_name || '',
        lastName: member?.last_name || '',
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
        firstName: member?.first_name || '',
        lastName: member?.last_name || '',
        email: member?.email || null,
        phoneNumber: member?.phone_number || null,
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
