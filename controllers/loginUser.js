// controllers/loginUser.js
const User = require('../models/User');
const bcrypt = require('bcrypt');

module.exports = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).render('login', { error: 'Missing username or password' });
    }

    // Include password explicitly (important!)
    const user = await User.findOne({ username }).select('+password');
    if (!user) {
      return res.status(400).render('login', { error: 'Invalid username or password' });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(400).render('login', { error: 'Invalid username or password' });
    }

    req.session.userId = user._id;
    console.log(`✅ Login successful for ${username} (userId: ${user._id})`);
    res.redirect('/');
  } catch (err) {
    next(err);
  }
};
