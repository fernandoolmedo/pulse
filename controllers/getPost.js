// controllers/getPost.js
const BlogPost = require('../models/BlogPost');
const PostReaction = require('../models/PostReaction');
const DOMPurify = require('isomorphic-dompurify');
const { logEvent } = require('../middleware/analyticsLogger');

function stripHtml(html = '') {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

const DEFAULT_COUNTS = { angry: 0, sad: 0, neutral: 0, happy: 0, love: 0 };

module.exports = async (req, res, next) => {
  try {
    const post = await BlogPost.findById(req.params.id)
      .populate({ path: 'userId', select: 'username' })
      .lean();

    if (!post) return res.status(404).render('notfound');

    // Ensure reactions map exists with zeros for any missing keys
    const initialCounts = { ...DEFAULT_COUNTS, ...(post.reactions || {}) };

    // Check if this viewer already reacted (only if logged in)
    let myEmojiForThisViewer = null;
    if (req.session?.userId) {
      const existing = await PostReaction
        .findOne({ postId: post._id, userId: req.session.userId })
        .lean();
      myEmojiForThisViewer = existing?.emoji || null;
    }

    // --- ML logging: view_post -----------------------------------------
    logEvent({
      req,
      eventType: 'view_post',
      postId: post._id,
      metadata: {
        category: post.category || null,
        hasImage: !!post.image,
        hasReaction: !!myEmojiForThisViewer,
      },
    });
    // -------------------------------------------------------------------

    const safeBody = DOMPurify.sanitize(post.body, {
      ALLOWED_ATTR: ['style', 'href', 'src', 'alt', 'title'],
    });
    const excerpt = stripHtml(post.body).slice(0, 160);

    res.render('post', {
      post,
      safeBody,
      excerpt,
      initialCounts,
      myEmojiForThisViewer,
    });
  } catch (err) {
    next(err);
  }
};
