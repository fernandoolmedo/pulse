// controllers/storePost.js
const BlogPost = require('../models/BlogPost.js');

module.exports = async (req, res, next) => {
  try {
    if (!req.session?.userId) return res.status(401).send('Login required');

    const titleClean = (req.body.title || '').trim();
    const bodyClean = (req.body.body || '').trim();

    if (!titleClean || !bodyClean) {
      return res.status(400).send('Title and body are required');
    }

    const image = req.file ? `/img/${req.file.filename}` : null;

    const post = await BlogPost.create({
      title: titleClean,
      body: bodyClean,
      image,
      userid: req.session.userId,
      // datePosted: new Date(), // uncomment if your schema doesn't default this
    });

    return res.redirect(`/post/${post._id}`);
  } catch (err) {
    console.error('storePost error:', err);
    return next(err);
  }
};
