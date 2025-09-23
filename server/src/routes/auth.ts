import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserModel, IUser } from '../models/User';
import fs from 'fs';
import path from 'path';

const router = Router();
const SALT_ROUNDS = 10;

/**
 * @openapi
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         username:
 *           type: string
 *         balance:
 *           type: number
 *         nfts:
 *           type: array
 *           items:
 *             type: string
 *     LoginResponse:
 *       type: object
 *       properties:
 *         token:
 *           type: string
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *         error:
 *           type: string
 */

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
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
 *                 description: Unique username for the user
 *                 example: testuser
 *               pin:
 *                 type: string
 *                 description: 4-digit PIN for authentication
 *                 example: "1234"
 *                 minLength: 4
 *                 maxLength: 4
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid input or username already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { username, pin } = req.body;

    if (!username || !pin || pin.length !== 4) {
      return res.status(400).json({ message: 'Username and a 4-digit PIN are required.' });
    }

    const existingUser = await UserModel.findOne({ username });

    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists.' });
    }

    const hashedPin = await bcrypt.hash(pin, SALT_ROUNDS);

    const configPath = path.join(__dirname, '..', '..', '..', 'nft_config.json');
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    const initialBalance = config.PLAYER_INITIAL_BALANCE || 10000;

    const newUser: Partial<IUser> = {
      username,
      pin: hashedPin,
      balance: initialBalance, // Starting balance
      nfts: [],
    };
    const createdUser = await UserModel.create(newUser);

    res.status(201).json(createdUser);
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
 *     tags: [Auth]
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
 *                 description: The user's username
 *                 example: testuser
 *               pin:
 *                 type: string
 *                 description: The user's 4-digit PIN
 *                 example: "1234"
 *                 minLength: 4
 *                 maxLength: 4
 *     responses:
 *       200:
 *         description: Login successful, returns JWT token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         description: Invalid username or PIN
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               value:
 *                 message: "Invalid username or PIN."
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               value:
 *                 message: "Server error during login."
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { username, pin } = req.body;

    if (!username || !pin) {
      return res.status(400).json({ message: 'Username and PIN are required.' });
    }

    const user = await UserModel.findOne({ username });

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