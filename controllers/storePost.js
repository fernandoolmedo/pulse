// controllers/storePost.js
const BlogPost = require('../models/BlogPost.js');
const {
  buildImageKey,
  uploadImageToS3,
  cloudfrontUrlForKey
} = require('../lib/s3');

module.exports = async (req, res, next) => {
  try {
    if (!req.session?.userId) return res.status(401).send('Login required');

    const titleClean = (req.body.title || '').trim();
    const bodyClean = (req.body.body || '').trim();

    if (!titleClean || !bodyClean) {
      return res.status(400).send('Title and body are required');
    }

    // Upload to S3 (if an image was provided)
    let imageKey = null;
    let imageUrl = null;

    if (req.file) {
      imageKey = buildImageKey({
        userId: req.session.userId,
        originalname: req.file.originalname
      });

      await uploadImageToS3({
        buffer: req.file.buffer,        // <-- comes from multer.memoryStorage()
        mimetype: req.file.mimetype,
        key: imageKey
      });

      imageUrl = cloudfrontUrlForKey(imageKey);
    }

    const post = await BlogPost.create({
      title: titleClean,
      body: bodyClean,

      // New fields (recommended)
      imageKey,
      imageUrl,

      userid: req.session.userId,
      // datePosted: new Date(),
    });

    return res.redirect(`/post/${post._id}`);
  } catch (err) {
    console.error('storePost error:', err);
    return next(err);
  }
};

