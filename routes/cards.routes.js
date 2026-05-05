const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Card = require('../models/Card');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

// ─── GET /api/cards ─────────────────────────────────────────────────────────
// Get all cards for the authenticated user
router.get('/', async (req, res) => {
  try {
    const cards = await Card.find({ user: req.user._id }).sort({ createdAt: 1 });

    // Map to frontend format (use clientId as id)
    const mappedCards = cards.map((card) => ({
      id: card.clientId,
      x: card.x,
      y: card.y,
      width: card.width,
      height: card.height,
      text: card.text,
      color: card.color,
    }));

    res.json({ success: true, cards: mappedCards });
  } catch (error) {
    console.error('Get cards error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch cards' });
  }
});

// ─── POST /api/cards ────────────────────────────────────────────────────────
// Create a new card
router.post(
  '/',
  [
    body('id').notEmpty().withMessage('Client ID is required'),
    body('x').isNumeric().withMessage('x must be a number'),
    body('y').isNumeric().withMessage('y must be a number'),
    body('width').isNumeric().withMessage('width must be a number'),
    body('height').isNumeric().withMessage('height must be a number'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { id, x, y, width, height, text, color } = req.body;

    try {
      const card = await Card.create({
        user: req.user._id,
        clientId: id,
        x,
        y,
        width,
        height,
        text: text || '',
        color: color || '#fef08a',
      });

      res.status(201).json({
        success: true,
        card: {
          id: card.clientId,
          x: card.x,
          y: card.y,
          width: card.width,
          height: card.height,
          text: card.text,
          color: card.color,
        },
      });
    } catch (error) {
      console.error('Create card error:', error);
      if (error.code === 11000) {
        return res.status(409).json({ success: false, message: 'Card already exists' });
      }
      res.status(500).json({ success: false, message: 'Failed to create card' });
    }
  }
);

// ─── PATCH /api/cards/:id ───────────────────────────────────────────────────
// Update a card (position, text, size, color)
router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const { x, y, width, height, text, color } = req.body;

  try {
    const updates = {};
    if (x !== undefined) updates.x = x;
    if (y !== undefined) updates.y = y;
    if (width !== undefined) updates.width = width;
    if (height !== undefined) updates.height = height;
    if (text !== undefined) updates.text = text;
    if (color !== undefined) updates.color = color;

    const card = await Card.findOneAndUpdate(
      { clientId: id, user: req.user._id },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!card) {
      return res.status(404).json({ success: false, message: 'Card not found' });
    }

    res.json({
      success: true,
      card: {
        id: card.clientId,
        x: card.x,
        y: card.y,
        width: card.width,
        height: card.height,
        text: card.text,
        color: card.color,
      },
    });
  } catch (error) {
    console.error('Update card error:', error);
    res.status(500).json({ success: false, message: 'Failed to update card' });
  }
});

// ─── DELETE /api/cards/:id ──────────────────────────────────────────────────
// Delete a card
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const card = await Card.findOneAndDelete({ clientId: id, user: req.user._id });

    if (!card) {
      return res.status(404).json({ success: false, message: 'Card not found' });
    }

    res.json({ success: true, message: 'Card deleted successfully' });
  } catch (error) {
    console.error('Delete card error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete card' });
  }
});

module.exports = router;
