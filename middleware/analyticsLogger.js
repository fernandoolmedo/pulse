// middleware/analyticsLogger.js
const InteractionEvent = require('../models/InteractionEvent');

function logEvent({ req, eventType, postId = null, metadata = {} }) {
  if (!eventType) return;

  InteractionEvent.create({
    userId: req.session?.userId || null,
    anonymousId: req.sessionID,
    eventType,
    postId,
    route: req.originalUrl,
    method: req.method,
    userAgent: req.get('user-agent'),
    ip: req.ip,
    metadata,
  }).catch(err => {
    // Don't break the request pipeline if logging fails
    if (process.env.NODE_ENV !== 'production') {
      console.error('Failed to log event:', err);
    }
  });
}

module.exports = { logEvent };
