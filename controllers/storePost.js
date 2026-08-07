// controllers/storePost.js
const BlogPost = require('../models/BlogPost.js');
const {
  buildImageKey,
  uploadImageToS3,
  cloudfrontUrlForKey
} = require('../lib/s3');
const { normalizeCategory, parseTags } = require('../lib/postInput');
const { logEvent } = require('../middleware/analyticsLogger');

module.exports = async (req, res, next) => {
  try {
    if (!req.session?.userId) return res.status(401).send('Login required');

    const titleClean = (req.body.title || '').trim();
    const bodyClean  = (req.body.body  || '').trim();

    const titleSanitized = titleClean.replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
    const bodySanitized  = bodyClean.replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();

    if (!titleSanitized || !bodySanitized) {
      return res.status(400).send('Title and body are required');
    }

    // FIX: Idempotency check — if this user already submitted the same title
    // within the last 60 seconds, redirect to that post instead of creating
    // a duplicate. Handles accidental double-clicks and impatient resubmits.
    const recentDuplicate = await BlogPost.findOne({
      userId:    req.session.userId,
      title:     titleSanitized,
      createdAt: { $gte: new Date(Date.now() - 60 * 1000) }
    }).lean();

    if (recentDuplicate) {
      return res.redirect(`/post/${recentDuplicate._id}`);
    }

    // Upload to S3 (if an image was provided)
    let imageKey = null;
    let imageUrl = null;

    if (req.file) {
      imageKey = buildImageKey({
        userId:       req.session.userId,
        originalname: req.file.originalname
      });

      await uploadImageToS3({
        buffer:   req.file.buffer,
        mimetype: req.file.mimetype,
        key:      imageKey
      });

      imageUrl = cloudfrontUrlForKey(imageKey);
    }

    const category = normalizeCategory(req.body.category);
    const tags     = parseTags(req.body.tags);

    const post = await BlogPost.create({
      title:    titleSanitized,
      body:     bodySanitized,
      category,
      tags,
      imageKey,
      imageUrl,
      userId:   req.session.userId,
    });

    logEvent({
      req,
      eventType: 'create_post',
      postId:    post._id,
      metadata: {
        category,
        hasImage:  !!imageUrl,
        tagsCount: tags.length,
      },
    });

    return res.redirect(`/post/${post._id}`);
  } catch (err) {
    console.error('storePost error:', err);
    return next(err);
  }
};