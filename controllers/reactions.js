// controllers/reactions.js
const BlogPost = require('../models/BlogPost');
const PostReaction = require('../models/PostReaction');
const { logEvent } = require('../middleware/analyticsLogger'); // <-- NEW

const ALLOWED = new Set(['angry','sad','neutral','happy','love']);
const DEFAULT_COUNTS = { angry: 0, sad: 0, neutral: 0, happy: 0, love: 0 };

exports.getReactions = async (req, res) => {
  try {
    const postId = req.params.id;
    const post = await BlogPost.findById(postId).select('reactions').lean();
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const counts = { ...DEFAULT_COUNTS, ...(post.reactions || {}) };

    let myEmoji = null;
    if (req.session?.userId) {
      const r = await PostReaction.findOne({ postId, userId: req.session.userId }).lean();
      myEmoji = r?.emoji || null;
    }

    // Optional: log that the user opened the reactions panel
    logEvent({
      req,
      eventType: 'view_reactions',
      postId,
      metadata: {
        myEmoji,
      },
    });

    return res.json({ counts, myEmoji });
  } catch (e) {
    console.error('getReactions error:', e);
    return res.status(400).json({ error: 'Unable to fetch reactions' });
  }
};

exports.setReaction = async (req, res) => {
  if (!req.session?.userId) return res.status(401).json({ error: 'Login required' });

  const postId = req.params.id;
  const { emoji } = req.body || {};
  if (!ALLOWED.has(emoji)) return res.status(400).json({ error: 'Invalid emoji' });

  try {
    const prev = await PostReaction.findOne({ postId, userId: req.session.userId }).lean();

    if (prev && prev.emoji === emoji) return res.sendStatus(204);

    await PostReaction.updateOne(
      { postId, userId: req.session.userId },
      { $set: { emoji, updatedAt: new Date() } },
      { upsert: true }
    );

    const inc = {};
    if (!prev) {
      inc[`reactions.${emoji}`] = 1;
    } else {
      inc[`reactions.${prev.emoji}`] = -1;
      inc[`reactions.${emoji}`] = 1;
    }

    const r = await BlogPost.updateOne({ _id: postId }, { $inc: inc });
    if (r.matchedCount === 0) return res.status(404).json({ error: 'Post not found' });

    // --- ML logging: react_post ----------------------------------------
    logEvent({
      req,
      eventType: 'react_post',
      postId,
      metadata: {
        newEmoji: emoji,
        prevEmoji: prev ? prev.emoji : null,
      },
    });
    // -------------------------------------------------------------------

    return res.sendStatus(204);
  } catch (e) {
    console.error('reaction error:', e);
    return res.status(400).json({ error: 'Unable to set reaction' });
  }
};
