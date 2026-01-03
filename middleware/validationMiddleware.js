// middleware/validationMiddleware.js
module.exports = (req, res, next) => {
  const { title, body } = req.body;

  if (!title || !title.trim() || !body || !body.trim()) {
    return res.redirect('/posts/new');
  }

  // note: no check on req.file here (optional)
  next();
};
