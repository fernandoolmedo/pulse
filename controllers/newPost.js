// controllers/newPost.js
const BlogPost = require('../models/BlogPost');

module.exports = (req, res) => {
  if (req.session.userId) {
    return res.render('create', {
        createPost: true,
        categories:     BlogPost.CATEGORIES,
        categoryLabels: BlogPost.CATEGORY_LABELS,
        maxTags:        BlogPost.MAX_TAGS
    });
  }
  res.redirect('/auth/login');
};
