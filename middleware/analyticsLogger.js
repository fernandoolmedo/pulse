// middleware/analyticsLogger.js
const InteractionEvent = require('../models/InteractionEvent');
const crypto = require('crypto');

// Analytics logger middleware for recording user interactions as structured events.
const _dropCounter = { count: 0, lastError: null, lastErrorTime: null };
exports.getDropStats = () => ({ ..._dropCounter });

// Hashing IP addresses for privacy while retaining the ability to identify unique visitors.
function hashIp(ip) {
  if (!ip) return null;
  return crypto.createHash('sha256').update(ip).digest('hex');
}

function logEvent({ req, eventType, postId = null, metadata = {} }) {
  if (!eventType) return;

  const normalizedMetadata = Object.fromEntries(
    Object.entries(metadata).map(([k, v]) => [k, v === undefined ? null : v])
  );

  InteractionEvent.create({
    userId:       req.session?.userId || null,
    anonymousId:  req.sessionID || null,
    sessionId:    req.sessionID || null,
    eventType,
    postId:       postId || null,
    route:        req.originalUrl || null,
    method:       req.method || null,
    userAgent:    req.get('user-agent') || null,
    ip:           hashIp(req.ip),
    metadata:     enrichedMetadata,
  }).catch(err => {

    _dropCounter.count += 1;
    _dropCounter.lastError = err.message;
    _dropCounter.lastErrorTime = new Date().toISOString();

    if (process.env.NODE_ENV !== 'production') {
      console.error(' [analyticsLogger] Failed to log event:', err);
    }
  });
}

module.exports = { logEvent, getDropStats };
