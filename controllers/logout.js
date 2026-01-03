// controllers/logout.js
module.exports = (req, res) => {
  // If you track login state globally, reset it too
  loggedIn = null;

  req.session.destroy(err => {
    if (err) {
      console.error('Session destroy error:', err);
      return res.status(500).send('Logout failed');
    }

    // IMPORTANT: clear the session cookie in the browser
    // Name defaults to 'connect.sid' and path defaults to '/'
    res.clearCookie('connect.sid', { path: '/' });
    return res.redirect('/');
  });
};
