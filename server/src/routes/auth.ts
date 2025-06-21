import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { getDb } from '../config/database';
import { User } from '../models/User';

const router = Router();
const SALT_ROUNDS = 10;

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - pin
 *             properties:
 *               username:
 *                 type: string
 *                 example: testuser
 *               pin:
 *                 type: string
 *                 example: "1234"
 *                 minLength: 4
 *                 maxLength: 4
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { username, pin } = req.body;

    if (!username || !pin || pin.length !== 4) {
      return res.status(400).json({ message: 'Username and a 4-digit PIN are required.' });
    }

    const db = getDb();
    const existingUser = await db.collection<User>('users').findOne({ username });

    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists.' });
    }

    const hashedPin = await bcrypt.hash(pin, SALT_ROUNDS);

    const newUser: User = {
      username,
      pin: hashedPin,
      balance: 10000, // Starting balance
      nfts: [],
    };

    await db.collection('users').insertOne(newUser);

    res.status(201).json({ message: 'User created successfully.' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration.' });
  }
});

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: Log in a user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - pin
 *             properties:
 *               username:
 *                 type: string
 *                 example: testuser
 *               pin:
 *                 type: string
 *                 example: "1234"
 *                 minLength: 4
 *                 maxLength: 4
 *     responses:
 *       200:
 *         description: Login successful, returns JWT token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *       400:
 *         description: Invalid username or PIN
 *       500:
 *         description: Server error
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { username, pin } = req.body;

    if (!username || !pin) {
      return res.status(400).json({ message: 'Username and PIN are required.' });
    }

    const db = getDb();
    const user = await db.collection<User>('users').findOne({ username });

    if (!user) {
      return res.status(400).json({ message: 'Invalid username or PIN.' });
    }

    const isPinValid = await bcrypt.compare(pin, user.pin);

    if (!isPinValid) {
      return res.status(400).json({ message: 'Invalid username or PIN.' });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not defined in the .env file');
    }

    const token = jwt.sign(
      { userId: user._id, username: user.username },
      jwtSecret,
      { expiresIn: '1h' } // Token expires in 1 hour
    );

    res.status(200).json({ token });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login.' });
  }
});

export default router; 