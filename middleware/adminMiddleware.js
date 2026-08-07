// middleware/adminMiddleware.js
const mongoose = require('mongoose');
const User = require('../models/User');

// Comma-separated usernames, e.g. ADMIN_USERNAMES="fernando,ops-bot".
// Parsed per-request rather than at module load so a Heroku config change
// takes effect on the next request instead of requiring a dyno restart.
function adminUsernames() {
  return (process.env.ADMIN_USERNAMES || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
}

module.exports = async (req, res, next) => {
  try {
    const allowed = adminUsernames();

    // Fail closed: an unset ADMIN_USERNAMES grants nobody access, in every
    // environment. The previous check let any logged-in user through in prod
    // and everybody through in dev.
    if (!allowed.length) return res.sendStatus(403);

    const id = req.session?.userId;
    if (!id || !mongoose.isValidObjectId(id)) return res.sendStatus(403);

    const user = await User.findById(id).select('_id username').lean();
    if (!user || !allowed.includes(user.username)) return res.sendStatus(403);

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

module.exports.adminUsernames = adminUsernames;
