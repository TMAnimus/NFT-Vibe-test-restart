import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { getOrCreateDefault, updatePreferences, resetPreferences } from '../services/notificationPreferenceService';
import { defaultNotificationTypes } from '../models/NotificationPreference';

const router = express.Router();

/**
 * @openapi
 * tags:
 *   name: Notifications
 *   description: Manage notification preferences
 * components:
 *   schemas:
 *     NotificationTypes:
 *       type: object
 *       properties:
 *         marketUpdate:
 *           type: boolean
 *           default: true
 *         listingCreated:
 *           type: boolean
 *           default: true
 *         listingSold:
 *           type: boolean
 *           default: true
 *         system:
 *           type: boolean
 *           default: true
 *     NotificationPreference:
 *       type: object
 *       properties:
 *         userId:
 *           type: string
 *           description: ID of the user these preferences belong to
 *         enabled:
 *           type: boolean
 *           description: Master switch for all notifications
 *           default: true
 *         types:
 *           $ref: '#/components/schemas/NotificationTypes'
 *       example:
 *         userId: "60f7c2b8e1d2c8a1b8e1d2c8"
 *         enabled: true
 *         types:
 *           marketUpdate: true
 *           listingCreated: true
 *           listingSold: true
 *           system: true
 *     ValidationError:
 *       type: object
 *       properties:
 *         errors:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *               msg:
 *                 type: string
 *               path:
 *                 type: string
 *               location:
 *                 type: string
 *               value:
 *                 description: offending value
 */

/**
 * @openapi
 * /api/notifications/preferences:
 *   get:
 *     summary: Get the current user's notification preferences
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current preferences
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotificationPreference'
 *       401:
 *         description: Unauthorized
 */
router.get('/preferences', authMiddleware, async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });
  try {
    const prefs: any = await getOrCreateDefault(userId);
    const base = (prefs && typeof prefs.toObject === 'function') ? prefs.toObject() : prefs || {};
    const response = {
      _id: base._id ?? null,
      userId: base.userId ?? userId,
      enabled: typeof base.enabled === 'boolean' ? base.enabled : true,
      types: { ...defaultNotificationTypes, ...(base.types || {}) },
    };
    res.status(200).json(response);
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @openapi
 * /api/notifications/preferences:
 *   put:
 *     summary: Update the current user's notification preferences
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               enabled:
 *                 type: boolean
 *               types:
 *                 $ref: '#/components/schemas/NotificationTypes'
 *           example:
 *             enabled: false
 *             types:
 *               marketUpdate: false
 *               system: true
 *     responses:
 *       200:
 *         description: Updated preferences
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotificationPreference'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       401:
 *         description: Unauthorized
 */
router.put(
  '/preferences',
  authMiddleware,
  [
    body('enabled').optional().isBoolean(),
    body('types').optional().isObject(),
    body('types.marketUpdate').optional().isBoolean(),
    body('types.listingCreated').optional().isBoolean(),
    body('types.listingSold').optional().isBoolean(),
    body('types.system').optional().isBoolean(),
  ],
  async (req: AuthRequest, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const incoming = (req.body || {}) as any;
      const updated: any = await updatePreferences(userId, incoming);
      const base = (updated && typeof updated.toObject === 'function') ? updated.toObject() : updated || {};
      const response = {
        _id: base._id ?? null,
        userId: base.userId ?? userId,
        enabled: typeof base.enabled === 'boolean' ? base.enabled : (typeof incoming.enabled === 'boolean' ? incoming.enabled : true),
        types: {
          ...defaultNotificationTypes,
          ...(base.types || {}),
          ...(incoming.types || {}),
        },
      };
      res.status(200).json(response);
    } catch (e) {
      res.status(500).json({ message: 'Server error' });
    }
  }
);

/**
 * @openapi
 * /api/notifications/preferences:
 *   delete:
 *     summary: Reset the current user's notification preferences to defaults
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: Preferences reset (no content)
 *       401:
 *         description: Unauthorized
 */
router.delete('/preferences', authMiddleware, async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });
  try {
    await resetPreferences(userId);
    res.status(204).send();
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;


