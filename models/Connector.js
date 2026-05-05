const mongoose = require('mongoose');

const connectorSchema = new mongoose.Schema(
  {
    // Reference to the user who owns this connector
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    // Frontend-generated UUID
    clientId: {
      type: String,
      required: true,
    },
    // References to card clientIds (not ObjectIds)
    fromCardId: { type: String, required: true },
    toCardId: { type: String, required: true },
    type: {
      type: String,
      enum: ['straight', 'curved'],
      default: 'straight',
    },
    style: {
      type: String,
      enum: ['solid', 'dashed'],
      default: 'solid',
    },
  },
  {
    timestamps: true,
  }
);

// Ensure clientId is unique per user
connectorSchema.index({ user: 1, clientId: 1 }, { unique: true });

module.exports = mongoose.model('Connector', connectorSchema);
