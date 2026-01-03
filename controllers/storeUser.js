// controllers/storeUser.js
const User = require('../models/User.js');

function scrubForm(body = {}) {
  const { password, confirmPassword, ...rest } = body;
  return rest;
}

module.exports = async (req, res, next) => {
  try {
    const payload = {
      username: req.body.username?.trim(),
      password: req.body.password,
    };

    const user = await User.create(payload);

    req.session.userId = user._id;
    return res.redirect('/');
  } catch (error) {
    console.error('User registration error:', error);


    // Mongoose validation errors (required, minlength, etc.)
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(e => e.message);
      req.flash('errors', validationErrors);
      req.flash('formData', scrubForm(req.body));
      return res.redirect('/auth/register');
    }

    // Duplicate key (unique username)
    if (error.code === 11000) {
      req.flash('errors', ['Username already exists']);
      req.flash('formData', scrubForm(req.body));
      return res.redirect('/auth/register');
    }

    return next(error);
  }
};
