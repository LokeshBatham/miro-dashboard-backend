const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Connector = require('../models/Connector');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

// ─── GET /api/connectors ─────────────────────────────────────────────────────
// Get all connectors for the authenticated user
router.get('/', async (req, res) => {
  try {
    const connectors = await Connector.find({ user: req.user._id }).sort({ createdAt: 1 });

    const mappedConnectors = connectors.map((conn) => ({
      id: conn.clientId,
      fromCardId: conn.fromCardId,
      toCardId: conn.toCardId,
      type: conn.type,
      style: conn.style,
    }));

    res.json({ success: true, connectors: mappedConnectors });
  } catch (error) {
    console.error('Get connectors error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch connectors' });
  }
});

// ─── POST /api/connectors ────────────────────────────────────────────────────
// Create a new connector
router.post(
  '/',
  [
    body('id').notEmpty().withMessage('Client ID is required'),
    body('fromCardId').notEmpty().withMessage('fromCardId is required'),
    body('toCardId').notEmpty().withMessage('toCardId is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { id, fromCardId, toCardId, type, style } = req.body;

    try {
      const connector = await Connector.create({
        user: req.user._id,
        clientId: id,
        fromCardId,
        toCardId,
        type: type || 'straight',
        style: style || 'solid',
      });

      res.status(201).json({
        success: true,
        connector: {
          id: connector.clientId,
          fromCardId: connector.fromCardId,
          toCardId: connector.toCardId,
          type: connector.type,
          style: connector.style,
        },
      });
    } catch (error) {
      console.error('Create connector error:', error);
      if (error.code === 11000) {
        return res.status(409).json({ success: false, message: 'Connector already exists' });
      }
      res.status(500).json({ success: false, message: 'Failed to create connector' });
    }
  }
);

// ─── DELETE /api/connectors/:id ──────────────────────────────────────────────
// Delete a connector
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const connector = await Connector.findOneAndDelete({ clientId: id, user: req.user._id });

    if (!connector) {
      return res.status(404).json({ success: false, message: 'Connector not found' });
    }

    res.json({ success: true, message: 'Connector deleted successfully' });
  } catch (error) {
    console.error('Delete connector error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete connector' });
  }
});

module.exports = router;
