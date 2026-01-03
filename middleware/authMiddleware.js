// middleware/authMiddleware.js
const mongoose = require('mongoose');
const User = require('../models/User');

module.exports = async (req, res, next) => {
  try {
    const id = req.session.userId;
    if (!id) return res.redirect('/auth/login');               // not logged in

    // avoid CastError if the id in session is malformed
    if (!mongoose.isValidObjectId(id)) {
      req.session.destroy(() => {});
      return res.redirect('/auth/login');
    }

    // fetch minimal fields; no password
    const user = await User.findById(id).select('_id username email').lean();
    if (!user) {
      req.session.destroy(() => {});
      return res.redirect('/auth/login');
    }

    // attach to req/res for downstream use & EJS
    req.user = user;
    res.locals.currentUser = user;
    next();
  } catch (err) {
    next(err);
  }
};
