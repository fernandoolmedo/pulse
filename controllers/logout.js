// controllers/logout.js
const { logEvent } = require('../middleware/analyticsLogger');

module.exports = (req, res) => {
  // Log before destroy() — afterwards req.session.userId and req.sessionID
  // are gone and the event would be attributed to nobody.
  logEvent({ req, eventType: 'logout' });

  req.session.destroy(err => {
    if (err) {
      console.error('Session destroy error:', err);
      return res.status(500).send('Logout failed');
    }

    // Cookie name must match the one configured in index.js ('sid').
    // This previously cleared 'connect.sid', express-session's default,
    // leaving the real cookie behind for the browser to keep sending.
    res.clearCookie('sid', { path: '/' });
    return res.redirect('/');
  });
};
