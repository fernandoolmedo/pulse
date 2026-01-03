// controllers/newUser.js
module.exports = (req, res) => {
  const errors = req.flash('errors');              // array of strings
  const data = req.flash('formData')[0] || {};     // single object (if any)
  res.render('register', { errors, data });
};
