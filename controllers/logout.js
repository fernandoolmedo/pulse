// controllers/logout.js
module.exports = (req, res) => {
  loggedIn = null;

  req.session.destroy(err => {
    if (err) {
      console.error('Session destroy error:', err);
      return res.status(500).send('Logout failed');
    }

    res.clearCookie('connect.sid', { path: '/' });
    return res.redirect('/');
  });
};
