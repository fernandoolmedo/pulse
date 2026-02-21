// controllers/home.js
const BlogPost = require('../models/BlogPost');
const DOMPurify = require('isomorphic-dompurify'); // npm i isomorphic-dompurify

function stripHtml(html = '') {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

module.exports = async (req, res, next) => {
  try {
    const posts = await BlogPost.find({})
      .sort({ datePosted: -1 })
      .populate({ path: 'userId', select: 'username' })
      .lean();

    const list = posts.map(p => {
      const excerpt = stripHtml(p.body).slice(0, 160);
      return {
        ...p,
        excerpt, // plain text for the list subtitle
        // safeSnippet,
      };
    });

    res.render('index', { posts: list });
  } catch (err) {
    next(err);
  }
};
