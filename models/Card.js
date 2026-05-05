const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema(
  {
    // Reference to the user who owns this card
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    // Frontend-generated UUID (used as the key in React)
    clientId: {
      type: String,
      required: true,
    },
    // Card properties matching frontend Card type
    x: { type: Number, required: true, default: 0 },
    y: { type: Number, required: true, default: 0 },
    width: { type: Number, required: true, default: 200 },
    height: { type: Number, required: true, default: 200 },
    text: { type: String, default: '' },
    color: { type: String, default: '#fef08a' },
  },
  {
    timestamps: true,
  }
);

// Ensure clientId is unique per user
cardSchema.index({ user: 1, clientId: 1 }, { unique: true });

module.exports = mongoose.model('Card', cardSchema);
