// models/InteractionEvent.js
const mongoose = require('mongoose');

const interactionEventSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
      default: null,
    },
    anonymousId: {
      type: String,         // e.g. session ID if user not logged in
      index: true,
    },
    eventType: {
      type: String,
      required: true,
      index: true,
    },
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BlogPost',
      index: true,
      default: null,
    },
    route: String,
    method: String,
    userAgent: String,
    ip: String,             // consider hashing in prod

    // anything event-specific
    metadata: mongoose.Schema.Types.Mixed,
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Useful later for recsys / analytics
interactionEventSchema.index({
  userId: 1,
  postId: 1,
  eventType: 1,
  createdAt: -1,
});

module.exports = mongoose.model('InteractionEvent', interactionEventSchema);
