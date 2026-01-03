// controllers/storePost.js
const BlogPost = require('../models/BlogPost.js');

module.exports = async (req, res, next) => {
  try {
    const { title, body } = req.body;
    if (!title || !body) {
      return res.status(400).send('Title and body are required');
    }
    const image = req.file ? `/img/${req.file.filename}` : undefined;

    const post = await BlogPost.create({ 
      title, 
      body, 
      image,
      userid: req.session.userId // Associate post with logged-in user's ID
    });
    return res.redirect(`/post/${post._id}`);
  } catch (err) {
    console.error('storePost error:', err);
    return next(err);
  }
};
